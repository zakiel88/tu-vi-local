// main.js — Entry point: bind events, gọi engine, render chart, save/load.

import { buildChart } from './engine.js?v=20260702a';
import { renderChart, renderMeta, renderCungDetail } from './render.js';
import { exportPNG, exportJSON, exportMarkdown, defaultFilename } from './save.js';
import { saveChart, listCharts, loadChart, deleteChart, renameChart } from './storage.js';
import { buildTwinPairInputs, findPairRecord } from './twin.js';

// ============================================================
// Config — API URL auto-detect
// ============================================================
const API_URL = (() => {
  if (typeof window !== "undefined" && window.TUVI_API_URL) return window.TUVI_API_URL;
  if (typeof location !== "undefined") {
    const h = location.hostname;
    if (h === "tv.bikbrik.com" || h.endsWith(".bikbrik.com")) {
      return "https://tuvi-api.bikbrik.com";
    }
  }
  return "http://localhost:3001";
})();

// ============================================================
// State
// ============================================================
const state = {
  currentChart: null,
  twin: null,          // { truoc: chart, sau: chart, active: 'truoc'|'sau' } khi lập cặp sinh đôi
  compactMode: false,
  settings: {
    showVong: true,
    showLuu: true,
    showTuVan: false,
  },
};

// ============================================================
// DOM refs
// ============================================================
const $ = (sel) => document.querySelector(sel);

const form = $("#form-input");
const chartContainer = $("#chart-container");
const chartMeta = $("#chart-meta");
const metaList = $("#meta-list");

const btnAnalyze = $("#btn-analyze");
const btnSaveChart = $("#btn-save-chart");
const btnPrint = $("#btn-print");
const btnExportPng = $("#btn-export-png");
const btnToggleCompact = $("#btn-toggle-compact");
const btnExportJson = $("#btn-export-json");
const btnExportMd = $("#btn-export-md");

const modalAnalyze = $("#modal-analyze");
const modalAnalyzeClose = $("#modal-analyze-close");
const btnAnalyzeGo = $("#btn-analyze-go");
const btnAnalyzeCancel = $("#btn-analyze-cancel");
const analyzeLabel = $("#analyze-label");
const analyzeStatus = $("#analyze-status");

const btnSaved = $("#btn-saved");
const btnSettings = $("#btn-settings");

const twinSwitcher = $("#twin-switcher");

const modalCung = $("#modal-cung");
const modalCungBody = $("#modal-cung-body");
const modalCungClose = $("#modal-cung-close");

const modalSaved = $("#modal-saved");
const modalSavedClose = $("#modal-saved-close");
const savedList = $("#saved-list");

const modalSettings = $("#modal-settings");
const modalSettingsClose = $("#modal-settings-close");
const stShowExp = $("#st-show-experimental");
const stShowVong = $("#st-show-vong");
const stShowLuu = $("#st-show-luu");

// Default năm xem
$("#in-year-view").value = new Date().getFullYear();

// ============================================================
// Chi giờ ↔ giờ số: 2-way sync
// ============================================================
// Map: hour → chi (theo CHI_GIO trong data.js)
function hourToChi(h) {
  if (h === 23) return 23;          // Tý muộn
  if (h === 0) return 0;             // Tý sớm
  if (h >= 1 && h <= 2) return 2;    // Sửu
  if (h >= 3 && h <= 4) return 4;    // Dần
  if (h >= 5 && h <= 6) return 6;    // Mão
  if (h >= 7 && h <= 8) return 8;    // Thìn
  if (h >= 9 && h <= 10) return 10;  // Tỵ
  if (h >= 11 && h <= 12) return 12; // Ngọ
  if (h >= 13 && h <= 14) return 14; // Mùi
  if (h >= 15 && h <= 16) return 16; // Thân
  if (h >= 17 && h <= 18) return 18; // Dậu
  if (h >= 19 && h <= 20) return 20; // Tuất
  if (h >= 21 && h <= 22) return 22; // Hợi
  return "";
}

// Khi chọn chi giờ → fill ô giờ + reset phút về 0
$("#in-chi-gio").addEventListener("change", (e) => {
  const v = e.target.value;
  if (v === "") return;
  $("#in-hour").value = v;
  $("#in-minute").value = 0;
});

// Khi nhập giờ số → tự sync dropdown chi
$("#in-hour").addEventListener("input", (e) => {
  const h = parseInt(e.target.value, 10);
  if (Number.isNaN(h)) return;
  const chi = hourToChi(h);
  $("#in-chi-gio").value = String(chi);
});

// ============================================================
// Form submit → build + render
// ============================================================
form.addEventListener("submit", (e) => {
  e.preventDefault();
  buildAndRender();
});

function readForm() {
  const gioiTinh = form.gender.value;
  const foreignSchoolEl = document.querySelector('input[name="foreignSchool"]:checked');
  const bangMieuVuongEl = document.querySelector('input[name="bangMieuVuong"]:checked');
  return {
    nam: parseInt($("#in-year").value, 10),
    thang: parseInt($("#in-month").value, 10),
    ngay: parseInt($("#in-day").value, 10),
    gio: parseInt($("#in-hour").value, 10),
    phut: parseInt($("#in-minute").value || "0", 10),
    gioiTinh,
    tenLabel: $("#in-name").value.trim() || null,
    namXem: parseInt($("#in-year-view").value || new Date().getFullYear(), 10),
    laiNhanCung: $("#in-lai-nhan").value || null,
    timeZone: parseFloat($("#in-timezone").value || "7"),
    foreignSchool: foreignSchoolEl?.value || "vn",
    bangMieuVuong: bangMieuVuongEl?.value || "trungchau",
    sinhDoi: null,      // lá đơn — cặp sinh đôi dựng riêng qua buildTwinPairInputs
  };
}

function buildAndRender() {
  // Show loading state
  const loadingEl = $("#chart-loading");
  const emptyEl = chartContainer.querySelector(".chart-empty");
  if (loadingEl) loadingEl.classList.remove("hidden");
  if (emptyEl) emptyEl.classList.add("hidden");

  // Defer build to next frame so loading UI paints
  requestAnimationFrame(() => {
    try {
      if ($("#in-sinh-doi").checked) {
        buildTwinPairAndRender();
      } else {
        state.twin = null;
        showTwinSwitcher(false);
        state.currentChart = buildChart(readForm());
        showChartResult();
      }
    } catch (err) {
      console.error(err);
      chartContainer.innerHTML = `<div class="chart-empty"><p style="color:#c0392b"><strong>Lỗi:</strong> ${err.message}</p>
        <p class="hint">Kiểm tra lại input. App hỗ trợ ngày dương 1900-2100, mọi giờ.</p></div>`;
    }
  });
}

// Sinh đôi cùng canh giờ → lập CẢ 2 lá 1 lần, lưu cả 2, render bé trước + switcher.
function buildTwinPairAndRender() {
  const base = readForm();               // sinhDoi: null
  const tenTruoc = $("#in-twin-truoc").value;
  const tenSau = $("#in-twin-sau").value;
  const pair = buildTwinPairInputs(base, tenTruoc, tenSau);
  const chartTruoc = buildChart(pair.truoc);
  const chartSau = buildChart(pair.sau);

  state.twin = { truoc: chartTruoc, sau: chartSau, active: "truoc" };
  state.currentChart = chartTruoc;
  showTwinSwitcher(true);
  setActiveTwinSeg("truoc");
  showChartResult();

  // Lưu CẢ 2 lá vào storage (label = tên từng bé, fallback tenLabel/can-chi trong saveChart).
  persistTwinPair(chartTruoc, chartSau, tenTruoc, tenSau);
}

async function persistTwinPair(chartTruoc, chartSau, tenTruoc, tenSau) {
  const clean = (s) => (typeof s === "string" && s.trim()) ? s.trim() : undefined;
  try {
    await saveChart(chartTruoc, clean(tenTruoc));
    await saveChart(chartSau, clean(tenSau));
  } catch (err) {
    console.warn("Lưu cặp sinh đôi thất bại:", err);
  }
}

// Render + kích hoạt toolbar sau khi state.currentChart đã set.
function showChartResult() {
  renderCurrent();
  window.TuViNative?.hapticMedium();

  chartMeta.classList.remove("hidden");
  renderMeta(metaList, state.currentChart);

  btnAnalyze.disabled = false;
  btnSaveChart.disabled = false;
  btnPrint.disabled = false;
  btnExportPng.disabled = false;
  btnExportJson.disabled = false;
  btnExportMd.disabled = false;
  if (btnToggleCompact) btnToggleCompact.disabled = false;
  // Re-apply compact state after re-render
  if (state.compactMode) {
    const ch = document.querySelector(".chart");
    if (ch) ch.classList.add("compact");
  }
}

// ============================================================
// Switcher lá sinh đôi
// ============================================================
function showTwinSwitcher(show) {
  twinSwitcher?.classList.toggle("hidden", !show);
}
function setActiveTwinSeg(which) {
  twinSwitcher?.querySelectorAll("button[data-twin]").forEach(b => {
    const on = b.dataset.twin === which;
    b.classList.toggle("active", on);
    b.setAttribute("aria-pressed", String(on));
  });
}
function renderTwin(which) {
  if (!state.twin || !state.twin[which]) return;
  state.twin.active = which;
  state.currentChart = state.twin[which];
  setActiveTwinSeg(which);
  renderCurrent();
  renderMeta(metaList, state.currentChart);
  window.TuViNative?.hapticLight?.();
  // Re-apply compact state after re-render
  if (state.compactMode) {
    const ch = document.querySelector(".chart");
    if (ch) ch.classList.add("compact");
  }
}
if (twinSwitcher) {
  twinSwitcher.querySelectorAll("button[data-twin]").forEach(btn => {
    btn.addEventListener("click", () => renderTwin(btn.dataset.twin));
  });
}

function renderCurrent() {
  if (!state.currentChart) return;
  renderChart(chartContainer, state.currentChart, {
    showVong: state.settings.showVong,
    showLuu: state.settings.showLuu,
    showTuVan: state.settings.showTuVan,
    onCungClick: openCungModal,
  });
}

// ============================================================
// Form reset button
// ============================================================
$("#btn-form-reset").addEventListener("click", () => {
  form.reset();
  $("#in-year-view").value = new Date().getFullYear();
  $("#in-chi-gio").value = "";
  $("#sinh-doi-opts").classList.add("hidden");   // form.reset bỏ tick nhưng không ẩn panel
  state.twin = null;
  showTwinSwitcher(false);
});

// Compact mode toggle
// ============================================================
if (btnToggleCompact) {
  btnToggleCompact.addEventListener("click", () => {
    state.compactMode = !state.compactMode;
    const ch = document.querySelector(".chart");
    if (ch) ch.classList.toggle("compact", state.compactMode);
    btnToggleCompact.textContent = state.compactMode ? "⊞ Đầy đủ" : "⊟ Gọn";
    btnToggleCompact.setAttribute("aria-pressed", String(state.compactMode));
    btnToggleCompact.title = state.compactMode
      ? "Chế độ Đầy đủ — hiện cả vòng + sao lưu + sao lẻ"
      : "Chế độ Gọn — chỉ hiện chính tinh + cát/sát + Hoá";
  });
}

// Keyboard shortcuts
// ============================================================
document.addEventListener("keydown", (e) => {
  // Cmd/Ctrl+S → Lưu
  if ((e.metaKey || e.ctrlKey) && e.key === "s" && !btnSaveChart.disabled) {
    e.preventDefault();
    btnSaveChart.click();
  }
  // Cmd/Ctrl+L → Đã lưu
  if ((e.metaKey || e.ctrlKey) && e.key === "l") {
    e.preventDefault();
    $("#btn-saved").click();
  }
  // Esc → close any open modal
  if (e.key === "Escape") {
    document.querySelectorAll(".modal:not(.hidden)").forEach(m => m.classList.add("hidden"));
  }
});

function fillForm({ name, year, month, day, hour, minute, gender }) {
  $("#in-name").value = name || "";
  $("#in-year").value = year;
  $("#in-month").value = month;
  $("#in-day").value = day;
  $("#in-hour").value = hour;
  $("#in-minute").value = minute;
  form.gender.value = gender;
  buildAndRender();
}

// ============================================================
// Cung modal
// ============================================================
function openCungModal(cung, chart) {
  renderCungDetail(modalCungBody, cung, chart);
  modalCung.classList.remove("hidden");
}
modalCungClose.addEventListener("click", () => modalCung.classList.add("hidden"));
modalCung.addEventListener("click", (e) => {
  if (e.target === modalCung) modalCung.classList.add("hidden");
});

// ============================================================
// Save / Export
// ============================================================
btnSaveChart.addEventListener("click", async () => {
  if (!state.currentChart) return;
  try {
    const id = await saveChart(state.currentChart);
    btnSaveChart.textContent = "✓ Đã lưu";
    setTimeout(() => { btnSaveChart.innerHTML = "💾 Lưu"; }, 1500);
  } catch (err) {
    alert("Lưu thất bại: " + err.message);
  }
});

btnPrint.addEventListener("click", () => {
  if (!state.currentChart) return;
  window.print();
});

// === ANALYZE → CASE STUDY ===
btnAnalyze.addEventListener("click", () => {
  if (!state.currentChart) return;
  analyzeLabel.value = state.currentChart.input.tenLabel || "";
  analyzeStatus.classList.add("hidden");
  analyzeStatus.innerHTML = "";
  modalAnalyze.classList.remove("hidden");
});
modalAnalyzeClose.addEventListener("click", () => modalAnalyze.classList.add("hidden"));
btnAnalyzeCancel.addEventListener("click", () => modalAnalyze.classList.add("hidden"));
modalAnalyze.addEventListener("click", (e) => {
  if (e.target === modalAnalyze) modalAnalyze.classList.add("hidden");
});

btnAnalyzeGo.addEventListener("click", async () => {
  if (!state.currentChart) return;
  const label = analyzeLabel.value.trim() || "ẩn danh";

  // Lá số đã lưu (snapshot cũ) có thể thiếu field mới của engine (vd luuNguyet).
  // → Dựng lại từ input đã lưu để luôn đầy đủ theo engine hiện tại.
  let chart = state.currentChart;
  if (!chart.luuNguyet && chart.input) {
    try { chart = buildChart(chart.input); state.currentChart = chart; }
    catch (e) { console.warn("Rebuild chart failed, dùng snapshot cũ:", e); }
  }

  btnAnalyzeGo.disabled = true;
  btnAnalyzeGo.textContent = "⏳ Đang phân tích…";
  analyzeStatus.classList.remove("hidden");
  analyzeStatus.innerHTML = `<div style="color:#5a5e66">📡 Gửi chart đến server…</div>`;

  try {
    // 1. Kick off job
    const resp = await fetch(`${API_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chart, label }),
    });
    const kickoff = await resp.json();
    if (!resp.ok || !kickoff.jobId) {
      throw new Error(kickoff.error || `HTTP ${resp.status}`);
    }

    const { jobId, csId } = kickoff;
    analyzeStatus.innerHTML = `
      <div style="color:#5a5e66">
        ⏱ Job <code>${jobId}</code> bắt đầu — sẽ tạo <strong>${csId}</strong>.<br>
        Claude đang đọc framework + viết case study (~3-8 phút).<br>
        <span id="poll-progress">Polling status…</span>
      </div>`;

    // 2. Poll status mỗi 10s
    const startTime = Date.now();
    let job = null;
    while (true) {
      await new Promise(r => setTimeout(r, 10000));
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      const progressEl = document.getElementById("poll-progress");
      if (progressEl) progressEl.textContent = `⏱ ${elapsed}s đã trôi qua…`;

      try {
        const statusResp = await fetch(`${API_URL}/analyze/${jobId}`);
        job = await statusResp.json();
        if (job.status === "done" || job.status === "error") break;
      } catch (e) {
        // Network glitch — keep polling
        if (progressEl) progressEl.textContent = `⏱ ${elapsed}s — network glitch, retrying…`;
      }

      if (Date.now() - startTime > 20 * 60 * 1000) {
        throw new Error("Polling timeout 20 phút");
      }
    }

    // 3. Render result
    if (job.status === "done") {
      analyzeStatus.innerHTML = `
        <div style="color:#2a8a4e;padding:12px;background:#e6f4ea;border-radius:6px;">
          ✅ <strong>Đã tạo ${job.csId}</strong> trong ${job.elapsedSec}s<br>
          File: <code>${job.filename}</code><br>
          Size: ${Math.round(job.bytes / 1024)} KB<br>
          Path: <code style="font-size:11px">${job.path}</code><br><br>
          Mở Obsidian (Cmd+O → ${job.csId}) để review + chỉnh sửa.
        </div>`;
    } else {
      throw new Error(job.error || "Unknown error");
    }
  } catch (err) {
    analyzeStatus.innerHTML = `
      <div style="color:#b03020;padding:12px;background:#fdecea;border-radius:6px;">
        ❌ Lỗi: ${err.message}<br>
        <small>API URL: <code>${API_URL}</code><br>
        Check: (1) service running, (2) tunnel active, (3) DevTools console CORS error?</small>
      </div>`;
  } finally {
    btnAnalyzeGo.disabled = false;
    btnAnalyzeGo.textContent = "🚀 Bắt đầu phân tích";
  }
});

btnExportPng.addEventListener("click", async () => {
  if (!state.currentChart) return;
  btnExportPng.disabled = true;
  btnExportPng.textContent = "⏳ Đang export…";
  try {
    // Capture chỉ .a4-page (không phải toàn chartContainer) để PNG đúng A4
    const a4 = chartContainer.querySelector(".a4-page");
    await exportPNG(a4 || chartContainer, defaultFilename(state.currentChart, "png"));
  } catch (err) {
    alert("Export PNG thất bại: " + err.message);
  }
  btnExportPng.disabled = false;
  btnExportPng.innerHTML = "🖼 PNG";
});

btnExportJson.addEventListener("click", () => {
  if (!state.currentChart) return;
  exportJSON(state.currentChart, defaultFilename(state.currentChart, "json"));
});

btnExportMd.addEventListener("click", () => {
  if (!state.currentChart) return;
  exportMarkdown(state.currentChart, defaultFilename(state.currentChart, "md"));
});

// ============================================================
// Saved charts modal
// ============================================================
btnSaved.addEventListener("click", async () => {
  await refreshSavedList();
  modalSaved.classList.remove("hidden");
});
modalSavedClose.addEventListener("click", () => modalSaved.classList.add("hidden"));
modalSaved.addEventListener("click", (e) => {
  if (e.target === modalSaved) modalSaved.classList.add("hidden");
});

async function refreshSavedList() {
  const charts = await listCharts();
  if (charts.length === 0) {
    savedList.innerHTML = `<div class="saved-empty">Chưa có lá số nào được lưu.</div>`;
    return;
  }
  savedList.innerHTML = "";
  for (const rec of charts) {
    const i = rec.input;
    const item = document.createElement("div");
    item.className = "saved-item";
    item.innerHTML = `
      <div>
        <strong>${escape(rec.label)}</strong>
        <div class="saved-item-meta">
          ${i.gioiTinh === "nam" ? "Nam" : "Nữ"} · ${i.nam}/${i.thang}/${i.ngay} ${i.gio}h${i.phut} ·
          lưu ${new Date(rec.savedAt).toLocaleString("vi-VN")}
        </div>
      </div>
      <div class="saved-actions">
        <button class="btn btn-primary" data-act="analyze" data-id="${rec.id}" title="Phân tích → CS">📚 Phân tích</button>
        <button class="btn btn-ghost" data-act="load" data-id="${rec.id}">Mở</button>
        <button class="btn btn-ghost" data-act="rename" data-id="${rec.id}">Đổi tên</button>
        <button class="btn btn-ghost" data-act="delete" data-id="${rec.id}">Xoá</button>
      </div>
    `;
    savedList.appendChild(item);
  }
  savedList.querySelectorAll("button[data-act]").forEach(btn => {
    btn.addEventListener("click", () => onSavedAction(btn.dataset.act, parseInt(btn.dataset.id, 10)));
  });
}

async function onSavedAction(act, id) {
  if (act === "load" || act === "analyze") {
    const rec = await loadChart(id);
    if (!rec) return alert("Không load được");
    state.currentChart = rec.chart;
    // Sync form
    const i = rec.chart.input;
    fillFormFromInput(i, rec.label);
    // Lá sinh đôi → tìm lá cặp, dựng switcher (state.currentChart có thể đổi sang lá active)
    await setupTwinFromLoaded(rec);
    renderCurrent();
    chartMeta.classList.remove("hidden");
    renderMeta(metaList, state.currentChart);
    btnAnalyze.disabled = false;
    btnSaveChart.disabled = false;
    btnPrint.disabled = false;
    btnExportPng.disabled = false;
    btnExportJson.disabled = false;
    btnExportMd.disabled = false;
    modalSaved.classList.add("hidden");

    // "analyze" = load + auto-open modal phân tích ngay
    if (act === "analyze") {
      analyzeLabel.value = rec.label || rec.chart.input.tenLabel || "";
      analyzeStatus.classList.add("hidden");
      analyzeStatus.innerHTML = "";
      modalAnalyze.classList.remove("hidden");
    }
  } else if (act === "rename") {
    const newName = prompt("Tên mới:");
    if (newName) {
      await renameChart(id, newName);
      await refreshSavedList();
    }
  } else if (act === "delete") {
    if (confirm("Xoá lá số này?")) {
      await deleteChart(id);
      await refreshSavedList();
    }
  }
}

function fillFormFromInput(i, label) {
  $("#in-name").value = label || "";
  $("#in-year").value = i.nam;
  $("#in-month").value = i.thang;
  $("#in-day").value = i.ngay;
  $("#in-hour").value = i.gio;
  $("#in-minute").value = i.phut;
  $("#in-chi-gio").value = String(hourToChi(i.gio));
  form.gender.value = i.gioiTinh;
  $("#in-year-view").value = i.namXem;
  $("#in-lai-nhan").value = i.laiNhanCung || "";
  if (i.timeZone !== undefined) $("#in-timezone").value = String(i.timeZone);
  if (i.foreignSchool) {
    const radio = document.querySelector(`input[name="foreignSchool"][value="${i.foreignSchool}"]`);
    if (radio) radio.checked = true;
  }
  // Sinh đôi — khôi phục trạng thái checkbox + mở panel Nâng cao nếu là cặp cùng canh.
  // (Tên 2 bé điền ở setupTwinFromLoaded khi tìm được lá cặp.)
  const sd = i.sinhDoi || null;
  const isTwin = !!(sd && sd.cungCanh === true);
  $("#in-sinh-doi").checked = isTwin;
  $("#sinh-doi-opts").classList.toggle("hidden", !isTwin);
  if (isTwin) {
    const advEl = $("#adv-panel");
    if (advEl) advEl.open = true;
  } else {
    $("#in-twin-truoc").value = "";
    $("#in-twin-sau").value = "";
  }
}

// Sau khi load 1 lá đã lưu: nếu là lá sinh đôi cùng canh → tìm lá cặp trong storage,
// dựng state.twin + switcher; nếu không → tắt switcher.
async function setupTwinFromLoaded(rec) {
  const input = rec.chart && rec.chart.input;
  if (input && input.sinhDoi && input.sinhDoi.cungCanh === true) {
    const all = await listCharts();
    const pairRec = findPairRecord(all, rec.chart, rec.id);
    if (pairRec) {
      const active = input.sinhDoi.thuTu === "sau" ? "sau" : "truoc";
      const other = pairRec.chart;
      const truoc = active === "truoc" ? rec.chart : other;
      const sau   = active === "sau"   ? rec.chart : other;
      state.twin = { truoc, sau, active };
      state.currentChart = state.twin[active];
      showTwinSwitcher(true);
      setActiveTwinSeg(active);
      $("#in-twin-truoc").value = (active === "truoc" ? rec.label : pairRec.label) || "";
      $("#in-twin-sau").value   = (active === "sau"   ? rec.label : pairRec.label) || "";
      return;
    }
  }
  state.twin = null;
  showTwinSwitcher(false);
}

// ============================================================
// Settings modal
// ============================================================
btnSettings.addEventListener("click", () => modalSettings.classList.remove("hidden"));
modalSettingsClose.addEventListener("click", () => modalSettings.classList.add("hidden"));
modalSettings.addEventListener("click", (e) => {
  if (e.target === modalSettings) modalSettings.classList.add("hidden");
});

stShowExp.addEventListener("change", () => {
  state.settings.showTuVan = stShowExp.checked;
  renderCurrent();
});
stShowVong.addEventListener("change", () => {
  state.settings.showVong = stShowVong.checked;
  renderCurrent();
});
stShowLuu.addEventListener("change", () => {
  state.settings.showLuu = stShowLuu.checked;
  renderCurrent();
});

// Bảng Miếu Vượng — đổi bảng → rebuild chart (vì miếu vượng tính ở engine)
document.querySelectorAll('input[name="bangMieuVuong"]').forEach(el => {
  el.addEventListener("change", () => {
    if (state.currentChart) buildAndRender();
  });
});

// Sinh đôi — checkbox bật/tắt hiện 2 control con
const sinhDoiChk = $("#in-sinh-doi");
const sinhDoiOpts = $("#sinh-doi-opts");
if (sinhDoiChk && sinhDoiOpts) {
  sinhDoiChk.addEventListener("change", () => {
    sinhDoiOpts.classList.toggle("hidden", !sinhDoiChk.checked);
  });
}

// Native: WKWebView không hỗ trợ window.print → ẩn nút In
if (window.TuViNative?.isNative && btnPrint) btnPrint.style.display = "none";

// ============================================================
// Helpers
// ============================================================
function escape(s) {
  return String(s).replace(/[&<>"']/g, m => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[m]));
}
