from __future__ import annotations

import importlib
from pathlib import Path

import httpx
import pytest


JPEG = b"\xff\xd8\xff" + b"xfx-first-complete-non-ai" * 16


@pytest.fixture()
async def client(tmp_path: Path, monkeypatch):
    monkeypatch.setenv("XFX_DATABASE_PATH", str(tmp_path / "first-complete.sqlite3"))
    monkeypatch.setenv("XFX_ASSET_ROOT", str(tmp_path / "assets"))
    monkeypatch.setenv("XFX_PRODUCT_MODE", "INTERNAL_DEMO")
    import app.main as main

    importlib.reload(main)
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=main.app), base_url="http://test"
    ) as value:
        yield value


async def action(client, sid, name, payload=None, key=None):
    return await client.post(
        f"/sessions/{sid}/actions",
        headers={"Idempotency-Key": key or f"first-complete-{name}"},
        json={"action": name, "payload": payload or {}},
    )


async def ready_for_fine_tune(client):
    sid = (await client.post("/sessions")).json()["session_id"]
    steps = [
        ("SELECT_SHOOTING_RELATION", {"shooting_relation": "FRIEND"}),
        ("CONFIRM_DEVICE_MODE", {"device_mode": "SINGLE"}),
        ("ACCEPT_REALITY", {}),
        ("GENERATE_TARGETS", {}),
        ("SELECT_TARGET", {"candidate_id": "target-cinematic"}),
        ("ACCEPT_SHOT_DIRECTION", {}),
        ("ENTER_CAPTURE_WINDOW", {}),
    ]
    for index, (name, payload) in enumerate(steps):
        assert (await action(client, sid, name, payload, f"prepare-{index}")).status_code == 200
    capture = (await client.get(f"/sessions/{sid}")).json()
    assert capture["workflow_stage"] == "CAPTURE" and capture["assets"] == []
    upload = (
        await client.post("/assets/uploads", files={"file": ("capture.jpg", JPEG, "image/jpeg")})
    ).json()
    first = await action(client, sid, "CREATE_CAPTURE", {"uploaded_asset_id": upload["asset_id"]}, "confirm")
    duplicate = await action(client, sid, "CREATE_CAPTURE", {"uploaded_asset_id": upload["asset_id"]}, "confirm")
    assert first.status_code == duplicate.status_code == 200
    assert first.json()["readback"]["revision"] == duplicate.json()["readback"]["revision"] == 8
    assert (await action(client, sid, "ACCEPT", key="accept")).status_code == 200
    assert (await action(client, sid, "ACCEPT_REALITY_PLUS", key="fine-tune")).status_code == 200
    return sid


def recipe(sid, adjustments):
    return {
        "schema_version": "1.0.0",
        "recipe_id": f"recipe-{sid}",
        "session_id": sid,
        "source_asset_id": "asset-reality-plus-001",
        "created_at": "2026-08-25T00:00:00+00:00",
        "semantic_edit_allowed": False,
        "adjustments": adjustments,
    }


@pytest.mark.anyio
async def test_first_complete_non_neutral_refresh_lineage_works_and_isolation(client):
    sid = await ready_for_fine_tune(client)
    other = (await client.post("/sessions")).json()["session_id"]
    current = (await client.get(f"/sessions/{sid}")).json()
    assert current["workflow_stage"] == "FINE_TUNE"
    assert (await client.get(f"/sessions/{other}")).json()["assets"] == []
    value = recipe(sid, [{"scope": "ALL", "parameter": "BRIGHTNESS", "value": 0.2}])
    saved = await client.post(
        f"/sessions/{sid}/fine-tune/recipes",
        headers={"Idempotency-Key": "save-recipe"},
        json={"recipe": value},
    )
    assert saved.status_code == 200
    assert (await client.get(f"/sessions/{sid}/fine-tune/recipe")).json()["recipe"] == value
    derived = (
        await client.post(
            f"/sessions/{sid}/fine-tune/derived",
            headers={"Idempotency-Key": "derived"},
            files={"file": ("derived.jpg", JPEG + b"derived", "image/jpeg")},
        )
    ).json()
    payload = {
        "adjustment_recipe_id": value["recipe_id"],
        "derived_upload_asset_id": derived["asset_id"],
        "runtime_version": "main-fine-tune-1.0.0",
        "render_backend": "WORKER_OFFSCREENCANVAS",
        "render_metrics": {"width": 4000, "height": 3000, "ui_responsive": True},
        "mask_identity": None,
    }
    first = await action(client, sid, "SAVE_ADJUSTMENT_RECIPE", payload, "finalize")
    duplicate = await action(client, sid, "SAVE_ADJUSTMENT_RECIPE", payload, "finalize")
    assert first.status_code == duplicate.status_code == 200
    final = (await client.get(f"/sessions/{sid}")).json()
    assert final["workflow_stage"] == "FINAL"
    assert len([item for item in final["assets"] if item["kind"] == "FINE_TUNE_DERIVED"]) == 1
    assert len([item for item in final["events"] if item["event_type"] == "SAVE_ADJUSTMENT_RECIPE_COMMITTED"]) == 1
    assert final["state"]["my_final_photo"]["adjustment_recipe_id"] == value["recipe_id"]
    assert final["state"]["my_final_photo"]["selected_asset_id"].startswith("asset-fine-tune-")
    assert (await client.get(f"/sessions/{sid}/final/content")).content == JPEG + b"derived"
    works = (await client.get("/sessions?classification=COMPLETED")).json()
    assert [item["session_id"] for item in works] == [sid]
    assert (await client.get(f"/sessions/{other}")).json()["adjustment_recipes"] == []


@pytest.mark.anyio
async def test_neutral_finalize_and_retry_after_missing_derived_are_truthful(client):
    failed_sid = await ready_for_fine_tune(client)
    changed = recipe(failed_sid, [{"scope": "LOCAL_REGION", "parameter": "WARMTH", "value": 0.2, "region": {"id": "local-1", "x": 0.2, "y": 0.2, "width": 0.4, "height": 0.4, "feather": 0.2}}])
    await client.post(f"/sessions/{failed_sid}/fine-tune/recipes", headers={"Idempotency-Key": "retry-save"}, json={"recipe": changed})
    failed = await action(client, failed_sid, "SAVE_ADJUSTMENT_RECIPE", {"adjustment_recipe_id": changed["recipe_id"], "derived_upload_asset_id": "upload-eeeeeeeeeeeeeeeeeeeeeeee", "runtime_version": "main-fine-tune-1.0.0"}, "retry-finalize")
    assert failed.status_code == 422
    assert (await client.get(f"/sessions/{failed_sid}")).json()["workflow_stage"] == "FINE_TUNE"

    neutral_sid = await ready_for_fine_tune(client)
    neutral = recipe(neutral_sid, [])
    await client.post(f"/sessions/{neutral_sid}/fine-tune/recipes", headers={"Idempotency-Key": "neutral-save"}, json={"recipe": neutral})
    result = await action(client, neutral_sid, "SAVE_ADJUSTMENT_RECIPE", {"adjustment_recipe_id": neutral["recipe_id"], "runtime_version": "main-fine-tune-1.0.0", "neutral": True}, "neutral-finalize")
    assert result.status_code == 200
    final = (await client.get(f"/sessions/{neutral_sid}")).json()
    assert final["state"]["my_final_photo"]["selected_asset_id"] == "asset-reality-plus-001"
    assert not [item for item in final["assets"] if item["kind"] == "FINE_TUNE_DERIVED"]
