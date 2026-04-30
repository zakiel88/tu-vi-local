// main.js — Entry point: bind events, gọi engine, render chart, save/load.

import { buildChart } from './engine.js';
import { renderChart, renderMeta, renderCungDetail } from './render.js';
import { exportPNG, exportJSON, exportMarkdown, defaultFilename } from './save.js';
import { saveChart, listCharts, loadChart, deleteChart, renameChart } from './storage.js';

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
// Form submit → build + render
// ============================================================
form.addEventListener("submit", (e) => {
  e.preventDefault();
  buildAndRender();
});

function readForm() {
  const gioiTinh = form.gender.value;
  const foreignSchoolEl = document.querySelector('input[name="foreignSchool"]:checked');
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
  };
}

function buildAndRender() {
  try {
    const input = readForm();
    const chart = buildChart(input);
    state.currentChart = chart;
    renderCurrent();

    chartMeta.classList.remove("hidden");
    renderMeta(metaList, chart);

    btnAnalyze.disabled = false;
    btnSaveChart.disabled = false;
    btnPrint.disabled = false;
    btnExportPng.disabled = false;
    btnExportJson.disabled = false;
    btnExportMd.disabled = false;
  } catch (err) {
    console.error(err);
    chartContainer.innerHTML = `<div class="chart-empty"><p style="color:#c0392b"><strong>Lỗi:</strong> ${err.message}</p>
      <p class="hint">Kiểm tra lại input. App hỗ trợ ngày dương 1900-2100, mọi giờ.</p></div>`;
  }
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
// Quick load buttons
// ============================================================
$("#btn-load-cs013").addEventListener("click", () => {
  fillForm({ name: "CS-013", year: 1988, month: 4, day: 11, hour: 11, minute: 25, gender: "nu" });
});
$("#btn-load-cs015").addEventListener("click", () => {
  fillForm({ name: "CS-015", year: 1994, month: 11, day: 19, hour: 2, minute: 0, gender: "nam" });
});
$("#btn-load-cs016").addEventListener("click", () => {
  fillForm({ name: "CS-016", year: 2000, month: 3, day: 10, hour: 19, minute: 45, gender: "nu" });
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

  btnAnalyzeGo.disabled = true;
  btnAnalyzeGo.textContent = "⏳ Đang phân tích…";
  analyzeStatus.classList.remove("hidden");
  analyzeStatus.innerHTML = `<div style="color:#5a5e66">📡 Gửi chart đến server…</div>`;

  try {
    // 1. Kick off job
    const resp = await fetch(`${API_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chart: state.currentChart, label }),
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
  if (act === "load") {
    const rec = await loadChart(id);
    if (!rec) return alert("Không load được");
    state.currentChart = rec.chart;
    // Sync form
    const i = rec.chart.input;
    fillFormFromInput(i, rec.label);
    renderCurrent();
    chartMeta.classList.remove("hidden");
    renderMeta(metaList, rec.chart);
    btnAnalyze.disabled = false;
    btnSaveChart.disabled = false;
    btnPrint.disabled = false;
    btnExportPng.disabled = false;
    btnExportJson.disabled = false;
    btnExportMd.disabled = false;
    modalSaved.classList.add("hidden");
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
  form.gender.value = i.gioiTinh;
  $("#in-year-view").value = i.namXem;
  $("#in-lai-nhan").value = i.laiNhanCung || "";
  if (i.timeZone !== undefined) $("#in-timezone").value = String(i.timeZone);
  if (i.foreignSchool) {
    const radio = document.querySelector(`input[name="foreignSchool"][value="${i.foreignSchool}"]`);
    if (radio) radio.checked = true;
  }
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

// ============================================================
// Helpers
// ============================================================
function escape(s) {
  return String(s).replace(/[&<>"']/g, m => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[m]));
}
