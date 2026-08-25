import "./style.css";
import { createSyntheticFixture } from "./fixtures/synthetic";
import { RecipeHistory } from "./history/recipeHistory";
import { addRegion, MAX_LOCAL_REGIONS } from "./mask/regions";
import { clampRegion } from "./mask/feather";
import {
  createRecipe,
  reloadRecipe,
  removeRegion,
  serializeRecipe,
  setAdjustment,
  updateRegionGeometry,
} from "./recipe/recipe";
import { decodeImageFile, downsampleSource, drawSource } from "./renderer/browserImage";
import { Canvas2DFineTuneRenderer } from "./renderer/cpuRenderer";
import { CompareState } from "./ui/compareState";
import type {
  AdjustmentParameter,
  AdjustmentRecipe,
  SourceImage,
  SpikeLocalRegionDescriptor,
} from "./types/model";

type UiScope = "ALL" | "LOCAL_REGION";

const root = document.querySelector<HTMLDivElement>("#app");
if (!root) throw new Error("App root missing");

root.innerHTML = `
  <main class="app-shell">
    <header class="topbar">
      <div><p class="eyebrow">Reality+ · Fine Tune</p><h1>最后一点，调成你喜欢的。</h1></div>
      <div class="lineage">Source → AdjustmentRecipe → Final Asset<br><span class="live-dot">本地确定性渲染</span></div>
    </header>
    <section class="workspace">
      <article class="stage">
        <div class="stage-head"><span class="live-dot">即时预览</span><label class="upload-label">打开图片<input id="image-upload" type="file" accept="image/jpeg,image/png,image/webp" /></label></div>
        <div class="preview-shell" id="preview-shell">
          <canvas id="preview" data-testid="preview"></canvas>
          <div class="region-layer" id="region-layer"></div>
        </div>
        <div class="stage-foot"><span id="source-size">—</span><span id="backend">CANVAS2D · LOCAL ONLY</span></div>
      </article>
      <aside class="panel">
        <div class="scope-tabs" role="tablist" aria-label="调整范围">
          <button class="active" data-scope="ALL" data-testid="scope-all">整体</button>
          <button disabled title="FT-P1">人物</button><button disabled title="FT-P1">背景</button>
          <button data-scope="LOCAL_REGION" data-testid="scope-local">局部</button>
        </div>
        <div class="region-tools" id="region-tools" hidden>
          <button id="add-region" data-testid="add-region">＋ 新建局部</button>
          <span class="region-selector" id="region-selector"></span>
          <button id="delete-region" data-testid="delete-region">删除</button>
          <span class="region-count" id="region-count">0 / 3</span>
        </div>
        <div class="controls" id="controls"></div>
        <div class="action-grid">
          <button id="undo" data-testid="undo">撤销</button><button id="redo" data-testid="redo">重做</button><button id="reset" data-testid="reset">重置</button>
          <button class="compare" id="compare" data-testid="compare">按住看 Reality+</button><button id="save" data-testid="save-recipe">保存配方</button>
        </div>
        <div class="save-row"><button class="text-button" id="reload" data-testid="reload-recipe">重新载入</button><button class="text-button" id="copy">复制 JSON</button></div>
        <button class="primary" id="export" data-testid="export">完成并导出 JPEG</button>
        <div class="status" id="status" role="status">Source 未被修改。所有操作仅写入 AdjustmentRecipe。</div>
        <div class="metrics"><div class="metric"><b id="metric-last">—</b><span>Latest</span></div><div class="metric"><b id="metric-p50">—</b><span>P50</span></div><div class="metric"><b id="metric-p95">—</b><span>P95</span></div><div class="metric"><b id="metric-final">—</b><span>Final</span></div></div>
      </aside>
    </section>
  </main>`;

const element = <T extends HTMLElement>(selector: string): T => {
  const found = document.querySelector<T>(selector);
  if (!found) throw new Error(`Missing element ${selector}`);
  return found;
};

const PARAMETERS: readonly { parameter: Extract<AdjustmentParameter, "BRIGHTNESS" | "WARMTH" | "SATURATION" | "SOFTNESS">; label: string; hint: string }[] = [
  { parameter: "BRIGHTNESS", label: "明暗", hint: "暗一些 · 亮一些" },
  { parameter: "WARMTH", label: "冷暖", hint: "冷一点 · 暖一点" },
  { parameter: "SATURATION", label: "鲜艳", hint: "克制 · 鲜明" },
  { parameter: "SOFTNESS", label: "柔和", hint: "清晰 · 柔和" },
];

const controls = element<HTMLDivElement>("#controls");
controls.innerHTML = PARAMETERS.map(({ parameter, label, hint }) => `
  <label class="control"><span class="control-head"><span class="control-label">${label}</span><span class="control-hint">${hint}</span></span>
    <span class="slider-row"><button type="button" data-step-parameter="${parameter}" data-direction="-1" data-testid="decrease-${parameter.toLowerCase()}" aria-label="减少${label}">−</button>
    <input type="range" min="-1" max="1" step="0.01" value="0" data-parameter="${parameter}" data-testid="slider-${parameter.toLowerCase()}" aria-label="${label}" />
    <button type="button" data-step-parameter="${parameter}" data-direction="1" data-testid="increase-${parameter.toLowerCase()}" aria-label="增加${label}">＋</button></span>
  </label>`).join("");

const canvas = element<HTMLCanvasElement>("#preview");
const previewShell = element<HTMLDivElement>("#preview-shell");
const regionLayer = element<HTMLDivElement>("#region-layer");
const renderer = new Canvas2DFineTuneRenderer();
const compareState = new CompareState();
let fullSource: SourceImage = createSyntheticFixture("busy-background", 1920, 1080);
let previewSource = downsampleSource(fullSource);
let neutral = createRecipe({ source_asset_id: fullSource.assetId });
let history = new RecipeHistory(neutral);
let scope: UiScope = "ALL";
let regions: SpikeLocalRegionDescriptor[] = [];
let activeRegionId: string | undefined;
let renderGeneration = 0;
let previewLatencies: number[] = [];
let lastFinalMs: number | undefined;

const status = (message: string): void => { element<HTMLDivElement>("#status").textContent = message; };
const currentRecipe = (): AdjustmentRecipe => history.current();
const activeRegion = (): SpikeLocalRegionDescriptor | undefined => regions.find((region) => region.id === activeRegionId);
const percentile = (values: readonly number[], p: number): number | undefined => {
  if (!values.length) return undefined;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * p))];
};

const updateMetrics = (latest?: number): void => {
  element("#metric-last").textContent = latest === undefined ? "—" : `${latest.toFixed(1)} ms`;
  const p50 = percentile(previewLatencies, 0.5);
  element("#metric-p50").textContent = p50 === undefined ? "—" : `${p50.toFixed(1)} ms`;
  const p95 = percentile(previewLatencies, 0.95);
  element("#metric-p95").textContent = p95 === undefined ? "—" : `${p95.toFixed(1)} ms`;
  element("#metric-final").textContent = lastFinalMs === undefined ? "—" : `${lastFinalMs.toFixed(0)} ms`;
};

const adjustmentValue = (parameter: AdjustmentParameter): number =>
  currentRecipe().adjustments.find((adjustment) =>
    adjustment.parameter === parameter && adjustment.scope === scope &&
    (scope !== "LOCAL_REGION" || adjustment.region?.id === activeRegionId),
  )?.value ?? 0;

const syncControls = (): void => {
  document.querySelectorAll<HTMLInputElement>("input[data-parameter]").forEach((input) => {
    input.value = String(adjustmentValue(input.dataset.parameter as AdjustmentParameter));
    input.disabled = scope === "LOCAL_REGION" && !activeRegion();
  });
  document.querySelectorAll<HTMLButtonElement>("button[data-step-parameter]").forEach((button) => {
    button.disabled = scope === "LOCAL_REGION" && !activeRegion();
  });
  element<HTMLButtonElement>("#undo").disabled = !history.canUndo();
  element<HTMLButtonElement>("#redo").disabled = !history.canRedo();
  element<HTMLButtonElement>("#delete-region").disabled = !activeRegion();
  element<HTMLButtonElement>("#add-region").disabled = regions.length >= MAX_LOCAL_REGIONS;
  element("#region-count").textContent = `${regions.length} / ${MAX_LOCAL_REGIONS}`;
};

const positionRegionLayer = (): void => {
  const canvasRect = canvas.getBoundingClientRect();
  const shellRect = previewShell.getBoundingClientRect();
  regionLayer.style.left = `${canvasRect.left - shellRect.left}px`;
  regionLayer.style.top = `${canvasRect.top - shellRect.top}px`;
  regionLayer.style.width = `${canvasRect.width}px`;
  regionLayer.style.height = `${canvasRect.height}px`;
  regionLayer.style.right = "auto";
  regionLayer.style.bottom = "auto";
};

const commitRegion = (nextRegion: SpikeLocalRegionDescriptor): void => {
  const bounded = clampRegion(nextRegion);
  regions = regions.map((region) => region.id === bounded.id ? bounded : region);
  history.commit(updateRegionGeometry(currentRecipe(), bounded));
  renderRegions();
  scheduleRender();
};

const bindRegionPointer = (box: HTMLDivElement, region: SpikeLocalRegionDescriptor): void => {
  const begin = (event: PointerEvent, resizing: boolean): void => {
    event.preventDefault();
    event.stopPropagation();
    activeRegionId = region.id;
    syncControls();
    regionLayer.querySelectorAll<HTMLElement>("[data-region-id]").forEach((candidate) =>
      candidate.classList.toggle("active", candidate.dataset.regionId === region.id));
    const startX = event.clientX;
    const startY = event.clientY;
    const initial = { ...regions.find((candidate) => candidate.id === region.id)! };
    const rect = regionLayer.getBoundingClientRect();
    const move = (moveEvent: PointerEvent): void => {
      const dx = (moveEvent.clientX - startX) / Math.max(1, rect.width);
      const dy = (moveEvent.clientY - startY) / Math.max(1, rect.height);
      commitRegion(resizing
        ? { ...initial, width: initial.width + dx, height: initial.height + dy }
        : { ...initial, x: initial.x + dx, y: initial.y + dy });
    };
    const end = (): void => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
  };
  box.addEventListener("pointerdown", (event) => begin(event, false));
  box.addEventListener("click", (event) => {
    event.stopPropagation();
    activeRegionId = region.id;
    syncControls();
    regionLayer.querySelectorAll<HTMLElement>("[data-region-id]").forEach((candidate) =>
      candidate.classList.toggle("active", candidate.dataset.regionId === region.id));
  });
  box.querySelector(".resize-handle")?.addEventListener("pointerdown", (event) => begin(event as PointerEvent, true));
};

function renderRegions(): void {
  const selector = element<HTMLSpanElement>("#region-selector");
  selector.innerHTML = regions.map((region, index) => `<button type="button" class="${region.id === activeRegionId ? "active" : ""}" data-region-select="${region.id}" data-testid="region-select-${index + 1}">${index + 1}</button>`).join("");
  selector.querySelectorAll<HTMLButtonElement>("[data-region-select]").forEach((button) =>
    button.addEventListener("click", () => {
      activeRegionId = button.dataset.regionSelect;
      syncControls();
      renderRegions();
    }));
  positionRegionLayer();
  regionLayer.hidden = scope !== "LOCAL_REGION";
  regionLayer.innerHTML = "";
  if (scope !== "LOCAL_REGION") return;
  regions.forEach((region, index) => {
    const box = document.createElement("div");
    box.className = `region-box${region.id === activeRegionId ? " active" : ""}`;
    box.dataset.regionId = region.id;
    box.dataset.testid = `region-${index + 1}`;
    box.style.left = `${region.x * 100}%`;
    box.style.top = `${region.y * 100}%`;
    box.style.width = `${region.width * 100}%`;
    box.style.height = `${region.height * 100}%`;
    box.innerHTML = `<span class="region-label">局部 ${index + 1}</span><span class="resize-handle" data-testid="resize-${index + 1}"></span>`;
    bindRegionPointer(box, region);
    regionLayer.append(box);
  });
}

function scheduleRender(inputStarted = performance.now()): void {
  const generation = ++renderGeneration;
  requestAnimationFrame(() => {
    if (generation !== renderGeneration) return;
    const result = renderer.render(previewSource, currentRecipe(), undefined, { mode: "preview" });
    drawSource(canvas, result);
    const latency = performance.now() - inputStarted;
    previewLatencies.push(latency);
    if (previewLatencies.length > 200) previewLatencies = previewLatencies.slice(-200);
    updateMetrics(latency);
    renderRegions();
  });
}

const setScope = (next: UiScope): void => {
  scope = next;
  document.querySelectorAll<HTMLButtonElement>("[data-scope]").forEach((button) => button.classList.toggle("active", button.dataset.scope === scope));
  element<HTMLDivElement>("#region-tools").hidden = scope !== "LOCAL_REGION";
  if (scope === "LOCAL_REGION" && regions.length === 0) {
    regions = [...addRegion(regions)];
    activeRegionId = regions[0]?.id;
  }
  renderRegions();
  syncControls();
};

document.querySelectorAll<HTMLButtonElement>("[data-scope]").forEach((button) =>
  button.addEventListener("click", () => setScope(button.dataset.scope as UiScope)));

const applyParameter = (parameter: AdjustmentParameter, value: number): void => {
  const next = scope === "ALL"
    ? setAdjustment(currentRecipe(), "ALL", parameter, value)
    : setAdjustment(currentRecipe(), "LOCAL_REGION", parameter, value, activeRegion());
  history.commit(next);
  syncControls();
  scheduleRender(performance.now());
};

document.querySelectorAll<HTMLInputElement>("input[data-parameter]").forEach((input) =>
  input.addEventListener("input", () => applyParameter(input.dataset.parameter as AdjustmentParameter, Number(input.value))));

document.querySelectorAll<HTMLButtonElement>("button[data-step-parameter]").forEach((button) =>
  button.addEventListener("click", () => {
    const parameter = button.dataset.stepParameter as AdjustmentParameter;
    const direction = Number(button.dataset.direction);
    applyParameter(parameter, Math.max(-1, Math.min(1, adjustmentValue(parameter) + direction * 0.1)));
  }));

element("#add-region").addEventListener("click", () => {
  try {
    regions = [...addRegion(regions)];
    activeRegionId = regions.at(-1)?.id;
    status(`已创建局部区域 ${regions.length}；上限为 ${MAX_LOCAL_REGIONS}。`);
    renderRegions();
    syncControls();
  } catch (error) {
    status((error as Error).message);
  }
});

element("#delete-region").addEventListener("click", () => {
  if (!activeRegionId) return;
  history.commit(removeRegion(currentRecipe(), activeRegionId));
  regions = regions.filter((region) => region.id !== activeRegionId);
  activeRegionId = regions[0]?.id;
  renderRegions(); syncControls(); scheduleRender();
});

element("#undo").addEventListener("click", () => { history.undo(); syncControls(); scheduleRender(); });
element("#redo").addEventListener("click", () => { history.redo(); syncControls(); scheduleRender(); });
element("#reset").addEventListener("click", () => {
  history.reset(neutral); regions = []; activeRegionId = undefined; setScope("ALL"); status("已重置为中性 AdjustmentRecipe。"); scheduleRender();
});

const compare = element<HTMLButtonElement>("#compare");
const showSource = (event: PointerEvent): void => { event.preventDefault(); compareState.begin(currentRecipe()); drawSource(canvas, previewSource); };
const showAdjusted = (event: PointerEvent): void => { event.preventDefault(); compareState.end(currentRecipe()); scheduleRender(); };
compare.addEventListener("pointerdown", showSource);
compare.addEventListener("pointerup", showAdjusted);
compare.addEventListener("pointercancel", showAdjusted);
compare.addEventListener("pointerleave", (event) => { if (event.buttons) showAdjusted(event); });

element("#save").addEventListener("click", () => {
  localStorage.setItem("xfx-ft-p0-recipe", serializeRecipe(currentRecipe()));
  status("AdjustmentRecipe 已保存到浏览器本地；Source 资产未改变。");
});

element("#reload").addEventListener("click", () => {
  const saved = localStorage.getItem("xfx-ft-p0-recipe");
  if (!saved) { status("尚无已保存配方。"); return; }
  const reloaded = reloadRecipe(saved);
  history = new RecipeHistory(reloaded);
  const byId = new Map<string, SpikeLocalRegionDescriptor>();
  reloaded.adjustments.forEach((adjustment) => { if (adjustment.region) byId.set(adjustment.region.id, adjustment.region); });
  regions = [...byId.values()]; activeRegionId = regions[0]?.id;
  syncControls(); renderRegions(); scheduleRender(); status("配方已清空运行时后重新载入并确定性渲染。");
});

element("#copy").addEventListener("click", async () => {
  await navigator.clipboard.writeText(serializeRecipe(currentRecipe()));
  status("M01-compatible AdjustmentRecipe JSON 已复制。");
});

element("#export").addEventListener("click", async () => {
  status("正在从全分辨率 Source 渲染…");
  const result = await renderer.exportJpeg(fullSource, currentRecipe());
  lastFinalMs = result.renderMs + result.encodeMs; updateMetrics();
  const url = URL.createObjectURL(result.blob);
  const link = document.createElement("a"); link.href = url; link.download = "xfx-fine-tuned-final.jpg"; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  status(`JPEG ${result.width}×${result.height} · ${(result.byteSize / 1024).toFixed(1)} KB · render ${result.renderMs.toFixed(0)} ms · encode ${result.encodeMs.toFixed(0)} ms`);
});

element<HTMLInputElement>("#image-upload").addEventListener("change", async (event) => {
  const file = (event.currentTarget as HTMLInputElement).files?.[0];
  if (!file) return;
  const started = performance.now();
  fullSource = await decodeImageFile(file, `local-file-${file.name}`);
  previewSource = downsampleSource(fullSource);
  neutral = createRecipe({ source_asset_id: fullSource.assetId }); history = new RecipeHistory(neutral);
  regions = []; activeRegionId = undefined; previewLatencies = [];
  element("#source-size").textContent = `${fullSource.width} × ${fullSource.height} · decode ${(performance.now() - started).toFixed(0)} ms`;
  syncControls(); scheduleRender(); status("图片仅在浏览器本地解码；未上传第三方。");
});

window.addEventListener("resize", renderRegions);
element("#source-size").textContent = `${fullSource.width} × ${fullSource.height} · synthetic fixture`;
syncControls();
scheduleRender();

declare global {
  interface Window {
    __fineTuneTest: {
      recipe(): AdjustmentRecipe;
      metrics(): { samples: number; p50?: number; p95?: number; max?: number; finalMs?: number };
      source(): { width: number; height: number; assetId: string };
      renderNow(): number;
    };
  }
}

window.__fineTuneTest = {
  recipe: currentRecipe,
  metrics: () => ({
    samples: previewLatencies.length,
    p50: percentile(previewLatencies, 0.5),
    p95: percentile(previewLatencies, 0.95),
    max: previewLatencies.length ? Math.max(...previewLatencies) : undefined,
    finalMs: lastFinalMs,
  }),
  source: () => ({ width: fullSource.width, height: fullSource.height, assetId: fullSource.assetId }),
  renderNow: () => renderer.render(previewSource, currentRecipe(), undefined, { mode: "preview" }).renderMs,
};
