import asyncio
import json
import sqlite3

from httpx import ASGITransport, AsyncClient

from app.main import app


def test_asgi_app_import_and_health() -> None:
    async def request_health():
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://testserver"
        ) as client:
            return await client.get("/health")

    response = asyncio.run(request_health())
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert response.json()["runtime"] == "LOCKED_L1"


def test_sqlite_utf8_json_round_trip(tmp_path) -> None:
    database = tmp_path / "runtime-probe.sqlite3"
    payload = {"project": "向风行", "state": "现实已理解"}
    with sqlite3.connect(database) as connection:
        connection.execute("CREATE TABLE probe (payload TEXT NOT NULL)")
        connection.execute(
            "INSERT INTO probe(payload) VALUES (?)",
            (json.dumps(payload, ensure_ascii=False),),
        )
        stored = connection.execute("SELECT payload FROM probe").fetchone()[0]
    assert json.loads(stored) == payload
