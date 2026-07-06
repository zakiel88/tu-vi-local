// app.js — controller giao diện app iOS "Tử Vi - Tri Mệnh".
// Tái dùng engine (buildChart) + save (export) của tuvi-local; KHÔNG sửa lõi.

import { buildChart } from './engine.js';
import { createDatePicker } from './app-picker.js';
import { renderChart } from './render.js';        // bàn A4 đầy đủ như website
import { createZoomPan } from './app-zoom.js';
import { exportPNG } from './save.js';
import { saveChart, listCharts, loadChart, deleteChart } from './storage.js';

const $ = (id) => document.getElementById(id);
const nowYear = new Date().getFullYear();

const state = {
  input: { ten: '', gioiTinh: 'nam', nam: 1990, thang: 1, ngay: 1, gio: 12, phut: 0, namXem: nowYear },
  chart: null,
  zoom: null,
  savedId: null,
};

// ---------- Tab navigation ----------
const tabs = Array.from(document.querySelectorAll('.tab'));
function showView(id) {
  for (const v of document.querySelectorAll('.view')) v.classList.toggle('active', v.id === id);
  for (const t of tabs) t.setAttribute('aria-selected', String(t.dataset.view === id));
  if (id === 'view-saved') refreshSaved();
}
tabs.forEach((t) => t.addEventListener('click', () => {
  if (t.disabled) return;
  window.TuViNative?.hapticLight?.();
  showView(t.dataset.view);
}));

// ---------- Form: gender ----------
$('f-gioi').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  state.input.gioiTinh = b.dataset.v;
  for (const btn of $('f-gioi').querySelectorAll('button')) btn.setAttribute('aria-pressed', String(btn === b));
  window.TuViNative?.hapticSelection?.();
});
$('f-ten').addEventListener('input', (e) => { state.input.ten = e.target.value.trim(); });
$('f-namxem').value = String(nowYear);
$('f-namxem').addEventListener('input', (e) => {
  const v = parseInt(e.target.value, 10);
  if (Number.isFinite(v)) state.input.namXem = v;
});

// ---------- Wheel date picker ----------
createDatePicker(
  { nam: $('w-nam'), thang: $('w-thang'), ngay: $('w-ngay'), gio: $('w-gio'), phut: $('w-phut') },
  { nam: state.input.nam, thang: state.input.thang, ngay: state.input.ngay, gio: state.input.gio, phut: state.input.phut },
  (d) => { Object.assign(state.input, d); }
);

// ---------- Build chart ----------
$('btn-build').addEventListener('click', () => {
  const i = state.input;
  let chart;
  try {
    chart = buildChart({
      nam: i.nam, thang: i.thang, ngay: i.ngay, gio: i.gio, phut: i.phut,
      gioiTinh: i.gioiTinh, namXem: i.namXem || nowYear,
    });
  } catch (err) {
    alert('Không lập được lá số: ' + (err?.message || err));
    return;
  }
  state.chart = chart;
  renderCurrentChart();
  window.TuViNative?.hapticMedium?.();
  showView('view-chart');
});

function renderCurrentChart() {
  const chart = state.chart;
  if (!chart) return;
  const i = state.input;
  const label = i.ten ? i.ten : (i.gioiTinh === 'nam' ? 'Nam' : 'Nữ');
  const cc = chart.lich?.canChi?.nam;
  const canChi = cc ? `${cc.can} ${cc.chi}` : '';
  $('chart-title').innerHTML = `<h1>${label}</h1><p>${i.gioiTinh === 'nam' ? 'Nam' : 'Nữ'} · ${i.ngay}/${i.thang}/${i.nam}${canChi ? ' · ' + canChi : ''} · ${chart.menh.cuc} Cục</p>`;

  $('chart-empty').hidden = true;
  $('chart-host').hidden = false;
  $('modebar').hidden = false;
  $('chart-tools').hidden = false;

  // reset trạng thái nút Lưu
  state.savedId = null;
  const sb = $('btn-save');
  sb.classList.remove('saved'); sb.innerHTML = '<span>☆</span> Lưu';

  // Render bàn A4 đầy đủ (như website) rồi bọc pinch-zoom/pan
  renderChart($('chart-container'), chart, { showVong: true, showLuu: true });
  if (!state.zoom) state.zoom = createZoomPan($('chart-host'), $('chart-stage'));
  requestAnimationFrame(() => state.zoom.fit());
}

// ---------- Nút "Vừa khít" (fit lại) ----------
$('btn-fit').addEventListener('click', () => { state.zoom?.fit(); window.TuViNative?.hapticSelection?.(); });

// ---------- Save chart to device ----------
$('btn-save').addEventListener('click', async () => {
  if (!state.chart || state.savedId) return;
  const i = state.input;
  const label = i.ten || `${i.gioiTinh === 'nam' ? 'Nam' : 'Nữ'} ${i.ngay}/${i.thang}/${i.nam}`;
  try {
    state.savedId = await saveChart(state.chart, label);
    const sb = $('btn-save');
    sb.classList.add('saved'); sb.innerHTML = '<span>★</span> Đã lưu';
    window.TuViNative?.hapticMedium?.();
  } catch (e) { alert('Không lưu được: ' + (e?.message || e)); }
});

// ---------- Saved tab ----------
async function refreshSaved() {
  let records = [];
  try { records = await listCharts(); } catch { records = []; }
  const listEl = $('saved-list');
  $('saved-empty').hidden = records.length > 0;
  listEl.innerHTML = records.map((r) => {
    const d = new Date(r.savedAt);
    const when = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    const cuc = r.chart?.menh?.cuc ? r.chart.menh.cuc + ' Cục' : '';
    const gioi = r.input?.gioiTinh === 'nam' ? 'Nam' : 'Nữ';
    return `<div class="scard"><button class="info" data-id="${r.id}"><div class="t">${escAttr(r.label)}</div><div class="m">${gioi} · lưu ${when}${cuc ? ' · ' + escAttr(cuc) : ''}</div></button><button class="del" data-del="${r.id}">Xoá</button></div>`;
  }).join('');
}
$('saved-list').addEventListener('click', async (e) => {
  const del = e.target.closest('[data-del]');
  if (del) {
    if (!confirm('Xoá lá số này?')) return;
    await deleteChart(Number(del.dataset.del));
    refreshSaved();
    return;
  }
  const info = e.target.closest('[data-id]');
  if (info) {
    const rec = await loadChart(Number(info.dataset.id));
    if (!rec?.chart) return;
    state.chart = rec.chart;
    if (rec.input) Object.assign(state.input, rec.input);
    renderCurrentChart();
    state.savedId = Number(info.dataset.id);
    const sb = $('btn-save'); sb.classList.add('saved'); sb.innerHTML = '<span>★</span> Đã lưu';
    window.TuViNative?.hapticLight?.();
    showView('view-chart');
  }
});
const escAttr = (s) => String(s).replace(/[&<>"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));

// ---------- Lưu ảnh (bàn A4 đầy đủ, độ phân giải cao) ----------
$('btn-share-png').addEventListener('click', async () => {
  if (!state.chart) return;
  try { await exportPNG($('chart-container'), fileBase() + '.png'); } catch (e) { alert('Lỗi lưu ảnh: ' + (e?.message || e)); }
});
function fileBase() {
  const i = state.input;
  return `laso-${i.ten || i.gioiTinh}-${i.ngay}-${i.thang}-${i.nam}`;
}

// splash: haptic nhẹ khi app sẵn sàng (native)
window.TuViNative?.isNative && setTimeout(() => window.TuViNative.hapticLight?.(), 300);
