// app-picker.js — wheel picker cuộn kiểu iOS bằng scroll-snap (không cần plugin native).
// Mỗi cột là 1 vùng cuộn; option cao 40px, pad 80px để phần tử đầu/cuối căn giữa được.

const ROW = 40;

function haptic() { try { window.TuViNative?.hapticSelection?.(); } catch {} }

/**
 * Tạo 1 cột bánh xe.
 * @returns {{ value:any, index:number, rebuild(values, keepIndex?):void, set(i):void, el:HTMLElement }}
 */
export function createWheel(colEl, values, initialIndex, onChange) {
  let idx = Math.max(0, Math.min(values.length - 1, initialIndex | 0));
  let opts = [];
  let settleTimer = null;

  function render() {
    colEl.innerHTML =
      '<div class="pad"></div>' +
      values.map((v) => `<div class="opt">${v.label}</div>`).join('') +
      '<div class="pad"></div>';
    opts = Array.from(colEl.querySelectorAll('.opt'));
  }
  function markSel(i) {
    for (let k = 0; k < opts.length; k++) opts[k].classList.toggle('sel', k === i);
  }
  function scrollToIndex(i, smooth) {
    colEl.scrollTo({ top: i * ROW, behavior: smooth ? 'smooth' : 'auto' });
  }

  function onScroll() {
    const near = Math.round(colEl.scrollTop / ROW);
    markSel(Math.max(0, Math.min(values.length - 1, near)));
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => {
      const j = Math.max(0, Math.min(values.length - 1, Math.round(colEl.scrollTop / ROW)));
      if (Math.abs(colEl.scrollTop - j * ROW) > 1) scrollToIndex(j, true);
      if (j !== idx) {
        idx = j;
        haptic();
        onChange && onChange(values[j].value, j);
      }
    }, 110);
  }

  render();
  markSel(idx);
  colEl.addEventListener('scroll', onScroll, { passive: true });
  requestAnimationFrame(() => scrollToIndex(idx, false));

  return {
    el: colEl,
    get value() { return values[idx]?.value; },
    get index() { return idx; },
    set(i) { idx = Math.max(0, Math.min(values.length - 1, i | 0)); markSel(idx); requestAnimationFrame(() => scrollToIndex(idx, false)); },
    rebuild(newValues, keepValue) {
      const prev = values[idx]?.value;
      values = newValues;
      render();
      let ni = 0;
      if (keepValue !== undefined) ni = values.findIndex((v) => v.value === keepValue);
      else ni = values.findIndex((v) => v.value === prev);
      if (ni < 0) ni = Math.min(idx, values.length - 1);
      idx = Math.max(0, ni);
      markSel(idx);
      requestAnimationFrame(() => scrollToIndex(idx, false));
    },
  };
}

const range = (a, b, fmt) => {
  const out = [];
  for (let i = a; i <= b; i++) out.push({ value: i, label: fmt ? fmt(i) : String(i) });
  return out;
};
const daysInMonth = (y, m) => new Date(y, m, 0).getDate();
const pad2 = (n) => String(n).padStart(2, '0');

/**
 * Bộ chọn ngày/giờ sinh gồm 5 cột, tự cập nhật số ngày theo tháng/năm.
 * @returns {{ get():{nam,thang,ngay,gio,phut} }}
 */
export function createDatePicker(refs, initial, onChange) {
  const nowYear = new Date().getFullYear();
  const state = { ...initial };

  const emit = () => onChange && onChange({ ...state });

  const wNam = createWheel(refs.nam, range(1920, nowYear, (y) => String(y)), initial.nam - 1920, (v) => { state.nam = v; fixDays(); emit(); });
  const wThang = createWheel(refs.thang, range(1, 12, (m) => 'Thg ' + m), initial.thang - 1, (v) => { state.thang = v; fixDays(); emit(); });
  const wNgay = createWheel(refs.ngay, range(1, daysInMonth(initial.nam, initial.thang), (d) => String(d)), initial.ngay - 1, (v) => { state.ngay = v; emit(); });
  const wGio = createWheel(refs.gio, range(0, 23, (h) => pad2(h) + 'h'), initial.gio, (v) => { state.gio = v; emit(); });
  const wPhut = createWheel(refs.phut, range(0, 59, (m) => pad2(m)), initial.phut, (v) => { state.phut = v; emit(); });

  function fixDays() {
    const dim = daysInMonth(state.nam, state.thang);
    if (state.ngay > dim) state.ngay = dim;
    wNgay.rebuild(range(1, dim, (d) => String(d)), state.ngay);
  }

  return { get() { return { ...state }; } };
}
