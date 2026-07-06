// app-chart.js — render lá số 12 cung cho mobile: lưới CSS + chạm cung → bottom sheet + tam phương SVG.
// Đọc chart object từ engine (KHÔNG tính lại). Layer lưới = tối giản; chi tiết đầy đủ ở sheet.

// chiIdx (Tí=0 … Hợi=11) → ô lưới 4×4 (row, col) 1-indexed.
const CHI_POS = {
  5: [1, 1], 6: [1, 2], 7: [1, 3], 8: [1, 4],
  4: [2, 1], 9: [2, 4],
  3: [3, 1], 10: [3, 4],
  2: [4, 1], 1: [4, 2], 0: [4, 3], 11: [4, 4],
};
const MV_LABEL = { M: 'Miếu', V: 'Vượng', 'Đ': 'Đắc', B: 'Bình', H: 'Hãm' };
const MV_GOOD = new Set(['M', 'V', 'Đ']);
const HOA_HAN = { loc: 'Lộc', quyen: 'Quyền', khoa: 'Khoa', ky: 'Kỵ' };
const HOA_HAN_CHAR = { loc: '祿', quyen: '權', khoa: '科', ky: '忌' };

const esc = (s) => String(s).replace(/[&<>"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));

function hoaOf(cung, sao) {
  const h = (cung.tuHoa || []).find((t) => t.sao === sao);
  return h ? h.kind : null;
}

/** Render toàn bộ lá số vào `root`. Trả về API { select, clear }. */
export function renderChart(root, chart, { onOpenLuan } = {}) {
  const cungByChi = {};
  for (const c of chart.cung) cungByChi[c.chiIdx] = c;

  root.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'grid4';

  // Ô giữa (thiên bàn)
  const center = document.createElement('div');
  center.className = 'cell center';
  const m = chart.menh;
  const tt = chart.tuanTriet;
  center.innerHTML = `
    <div class="seal">紫微</div>
    <div class="meta"><b>${esc(m.cuc)} Cục</b><br>Mệnh chủ <b>${esc(m.menhChu)}</b> · Thân chủ ${esc(m.thanChu)}<br>Thân cư <b>${esc(m.thanCu)}</b><br>
    Tuần ${esc((tt.tuan || []).join('–') || '—')} · Triệt ${esc((tt.triet || []).join('–') || '—')}</div>`;
  grid.appendChild(center);

  const cells = {};
  for (const c of chart.cung) {
    const pos = CHI_POS[c.chiIdx];
    if (!pos) continue;
    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = 'cell';
    cell.style.gridRow = String(pos[0]);
    cell.style.gridColumn = String(pos[1]);
    if (c.hasTuan || c.hasTriet) cell.classList.add('hasTuanTriet');

    const tag = c.isMenh ? '<span class="tag menh">命</span>' : c.isThan ? '<span class="tag than">身</span>' : '';
    const dh = c.daiHanRange ? `<span class="dh">${esc(c.daiHanRange)}</span>` : '';
    const stars = (c.chinhTinh || []).map((s) => {
      const k = hoaOf(c, s.sao);
      const mut = k ? `<span class="mut ${k}">${HOA_HAN_CHAR[k]}</span>` : '';
      const mv = s.mieuVuong ? `<span class="mv">${esc(s.mieuVuong)}</span>` : '';
      return `<span class="st">${esc(s.sao)}${mv}${mut}</span>`;
    }).join('');
    const starsHtml = stars || '<span class="st" style="color:var(--faint);font-weight:400;font-size:10px">Vô chính diệu</span>';

    cell.innerHTML = `<span class="cn">${tag}${esc(c.tenCung)}</span>${dh}<div class="stars">${starsHtml}</div><span class="chi">${esc(c.chi)}</span>`;
    cell.addEventListener('click', () => api.select(c.chiIdx));
    grid.appendChild(cell);
    cells[c.chiIdx] = cell;
  }

  root.appendChild(grid);

  // SVG overlay cho đường tam phương tứ chính
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'lines');
  root.appendChild(svg);

  let selected = null;

  function centerOf(chiIdx) {
    const el = cells[chiIdx];
    const gr = grid.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { x: r.left - gr.left + r.width / 2, y: r.top - gr.top + r.height / 2, w: gr.width, h: gr.height };
  }

  function drawLines(k) {
    const gr = grid.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${gr.width} ${gr.height}`);
    const a = centerOf(k);
    const t1 = centerOf((k + 4) % 12), t2 = centerOf((k + 8) % 12), opp = centerOf((k + 6) % 12);
    const line = (x1, y1, x2, y2, color, dash) =>
      `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1.3" opacity="0.85" ${dash ? 'stroke-dasharray="5 4"' : ''}/>`;
    const gold = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#C7A24C';
    const jade = getComputedStyle(document.documentElement).getPropertyValue('--jade').trim() || '#6E8F76';
    svg.innerHTML =
      line(a.x, a.y, t1.x, t1.y, jade) + line(a.x, a.y, t2.x, t2.y, jade) + line(t1.x, t1.y, t2.x, t2.y, jade) +
      line(a.x, a.y, opp.x, opp.y, gold, true);
  }

  const api = {
    select(chiIdx) {
      selected = chiIdx;
      const tri = new Set([(chiIdx + 4) % 12, (chiIdx + 8) % 12, (chiIdx + 6) % 12]);
      for (const [ci, el] of Object.entries(cells)) {
        const k = +ci;
        el.classList.remove('hl', 'tri', 'dim', 'sel');
        if (k === chiIdx) el.classList.add('hl', 'sel');
        else if (tri.has(k)) el.classList.add('tri');
        else el.classList.add('dim');
      }
      requestAnimationFrame(() => drawLines(chiIdx));
      openSheet(cungByChi[chiIdx]);
      window.TuViNative?.hapticLight?.();
    },
    clear() {
      selected = null;
      svg.innerHTML = '';
      for (const el of Object.values(cells)) el.classList.remove('hl', 'tri', 'dim', 'sel');
    },
  };

  // ----- bottom sheet -----
  const sheet = document.getElementById('sheet');
  const scrim = document.getElementById('scrim');
  const body = document.getElementById('sheet-body');

  function closeSheet() {
    sheet.classList.remove('on'); scrim.classList.remove('on'); api.clear();
  }
  scrim.onclick = closeSheet;

  function openSheet(c) {
    const chinh = (c.chinhTinh || []);
    const starlines = chinh.length ? chinh.map((s) => {
      const good = MV_GOOD.has(s.mieuVuong);
      const k = hoaOf(c, s.sao);
      const mut = k ? `<span class="mut ${k}" style="font-size:10px;padding:1px 5px">${HOA_HAN_CHAR[k]} ${HOA_HAN[k]}</span>` : '';
      return `<div class="starline"><span class="s">${esc(s.sao)}</span>${s.mieuVuong ? `<span class="chip ${good ? 'mieu' : 'ham'}">${MV_LABEL[s.mieuVuong] || s.mieuVuong}</span>` : ''}${mut}</div>`;
    }).join('') : '<div class="starline"><span class="s" style="color:var(--faint)">Vô chính diệu</span> <span class="chip">mượn đối cung</span></div>';

    const phu = (c.phuTinh || []);
    const vong = (c.vong || []).map((v) => v.sao);
    const allPhu = [...phu, ...vong];
    const phuHtml = allPhu.length ? `<h4>Phụ tinh</h4><div class="pslist">${allPhu.map((p) => `<span class="ps">${esc(p)}</span>`).join('')}</div>` : '';

    const flags = [];
    if (c.hasTuan) flags.push('Tuần');
    if (c.hasTriet) flags.push('Triệt');
    if (c.daiHanRange) flags.push('Đại hạn ' + c.daiHanRange + ' tuổi');
    const flagsHtml = flags.length ? `<h4>Ghi chú</h4><div class="pslist">${flags.map((f) => `<span class="ps" style="font-family:var(--ui)">${esc(f)}</span>`).join('')}</div>` : '';

    const badge = c.isMenh ? ' · 命 Mệnh' : c.isThan ? ' · 身 Thân' : '';
    body.innerHTML = `
      <h3>${esc(c.tenCung)}<span style="color:var(--faint);font-size:13px;font-weight:400"> · ${esc(c.chi)}${badge}</span></h3>
      <div class="sub">Chạm cung khác để xem · chạm nền để đóng</div>
      ${starlines}${phuHtml}${flagsHtml}
      <button class="go" id="sheet-luan">Luận cung ${esc(c.tenCung)} <span>›</span></button>`;
    const btn = document.getElementById('sheet-luan');
    if (btn) btn.onclick = () => { onOpenLuan && onOpenLuan(c); };
    sheet.classList.add('on'); scrim.classList.add('on');
  }

  return api;
}
