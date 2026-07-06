// app-zoom.js — pinch-zoom + pan cho bàn lá số A4 (native zoom bị tắt bởi viewport maximum-scale=1).
// host = khung nhìn (overflow hidden), stage = phần tử được transform, chứa nội dung lá số.

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const dist = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
const mid = (t) => ({ x: (t[0].clientX + t[1].clientX) / 2, y: (t[0].clientY + t[1].clientY) / 2 });

export function createZoomPan(host, stage, { min = 0.35, max = 3.5 } = {}) {
  let scale = 1, tx = 0, ty = 0;
  let mode = null, startDist = 0, startScale = 1, startMid = null, startTx = 0, startTy = 0, panOff = null;
  let lastTap = 0;

  const apply = () => { stage.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`; };

  function contentWidth() {
    const el = stage.firstElementChild;
    return (el && el.getBoundingClientRect().width / scale) || stage.scrollWidth || 1;
  }
  function fit() {
    const cw = contentWidth();
    const hw = host.clientWidth || 1;
    scale = clamp(hw / cw, min, 1);
    tx = (hw - cw * scale) / 2;
    ty = 8;
    apply();
  }

  host.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      mode = 'pinch';
      startDist = dist(e.touches); startScale = scale;
      const m = mid(e.touches);
      const r = host.getBoundingClientRect();
      startMid = { x: m.x - r.left, y: m.y - r.top };
      startTx = tx; startTy = ty;
    } else if (e.touches.length === 1) {
      mode = 'pan';
      panOff = { x: e.touches[0].clientX - tx, y: e.touches[0].clientY - ty };
      const now = Date.now();
      if (now - lastTap < 300) { toggleZoom(e.touches[0]); lastTap = 0; } else lastTap = now;
    }
  }, { passive: true });

  host.addEventListener('touchmove', (e) => {
    if (mode === 'pinch' && e.touches.length === 2) {
      const ns = clamp(startScale * dist(e.touches) / startDist, min, max);
      const k = ns / startScale;
      tx = startMid.x - (startMid.x - startTx) * k;
      ty = startMid.y - (startMid.y - startTy) * k;
      scale = ns; apply();
      e.preventDefault();
    } else if (mode === 'pan' && e.touches.length === 1) {
      tx = e.touches[0].clientX - panOff.x;
      ty = e.touches[0].clientY - panOff.y;
      apply();
      e.preventDefault();
    }
  }, { passive: false });

  host.addEventListener('touchend', (e) => {
    if (e.touches.length === 0) mode = null;
    else if (e.touches.length === 1) { mode = 'pan'; panOff = { x: e.touches[0].clientX - tx, y: e.touches[0].clientY - ty }; }
  });

  function toggleZoom(touch) {
    const r = host.getBoundingClientRect();
    const px = touch.clientX - r.left, py = touch.clientY - r.top;
    const target = scale < 1 ? 1.6 : (host.clientWidth / contentWidth());
    const k = target / scale;
    tx = px - (px - tx) * k;
    ty = py - (py - ty) * k;
    scale = clamp(target, min, max);
    stage.style.transition = 'transform .22s ease-out';
    apply();
    setTimeout(() => { stage.style.transition = ''; }, 240);
  }

  return { fit, reset: fit };
}
