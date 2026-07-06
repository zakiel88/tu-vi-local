// app.js — controller giao diện app iOS "Tử Vi - Tri Mệnh".
// Tái dùng engine (buildChart) + save (export) của tuvi-local; KHÔNG sửa lõi.

import { buildChart } from './engine.js';
import { createDatePicker } from './app-picker.js';
import { renderChart } from './app-chart.js';
import { exportPNG, exportMarkdown } from './save.js';

const $ = (id) => document.getElementById(id);
const nowYear = new Date().getFullYear();

const state = {
  input: { ten: '', gioiTinh: 'nam', nam: 1990, thang: 1, ngay: 1, gio: 12, phut: 0, namXem: nowYear },
  chart: null,
  chartApi: null,
};

// ---------- Tab navigation ----------
const tabs = Array.from(document.querySelectorAll('.tab'));
function showView(id) {
  for (const v of document.querySelectorAll('.view')) v.classList.toggle('active', v.id === id);
  for (const t of tabs) t.setAttribute('aria-selected', String(t.dataset.view === id));
}
tabs.forEach((t) => t.addEventListener('click', () => {
  if (t.disabled) return;
  window.TuViNative?.hapticLight?.();
  showView(t.dataset.view);
}));
function setChartTabEnabled(on) {
  const t = tabs.find((x) => x.dataset.view === 'view-chart');
  // luôn cho vào tab lá số; nếu chưa có thì hiện empty
}

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
  $('chart-wrap').hidden = false;
  $('timebar').hidden = false;
  $('chart-tools').hidden = false;

  state.chartApi = renderChart($('chart'), chart, {
    onOpenLuan: () => { /* M3: mở luận giải cung */ showView('view-luan'); },
  });
}

// ---------- Share ----------
$('btn-share-png').addEventListener('click', async () => {
  if (!state.chart) return;
  try { await exportPNG($('chart'), fileBase() + '.png'); } catch (e) { alert('Lỗi lưu ảnh: ' + (e?.message || e)); }
});
$('btn-share-md').addEventListener('click', async () => {
  if (!state.chart) return;
  try { await exportMarkdown(state.chart, fileBase() + '.md'); } catch (e) { alert('Lỗi lưu văn bản: ' + (e?.message || e)); }
});
function fileBase() {
  const i = state.input;
  return `laso-${i.ten || i.gioiTinh}-${i.ngay}-${i.thang}-${i.nam}`;
}

// splash: haptic nhẹ khi app sẵn sàng (native)
window.TuViNative?.isNative && setTimeout(() => window.TuViNative.hapticLight?.(), 300);
