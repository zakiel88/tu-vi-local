// render.js — Render chart JSON → DOM (HTML 12 cung grid)

import { categorizeStar } from './engine.js';
import { CHI } from './data.js';
import { saoNghia } from './sao_nghia.js';

const POSITION_CLASS = {
  "Tí": "pos-ti", "Sửu": "pos-suu", "Dần": "pos-dan", "Mão": "pos-mao",
  "Thìn": "pos-thin", "Tỵ": "pos-ty", "Ngọ": "pos-ngo", "Mùi": "pos-mui",
  "Thân": "pos-than", "Dậu": "pos-dau", "Tuất": "pos-tuat", "Hợi": "pos-hoi",
};

// Vị trí cell trong grid 4×4 — dùng cho SVG lines
// [col, row] (1-indexed)
const CHI_TO_GRID = {
  "Tỵ": [1, 1], "Ngọ": [2, 1], "Mùi": [3, 1], "Thân": [4, 1],
  "Thìn": [1, 2], "Dậu": [4, 2],
  "Mão": [1, 3], "Tuất": [4, 3],
  "Dần": [1, 4], "Sửu": [2, 4], "Tí": [3, 4], "Hợi": [4, 4],
};

function chiCenter(chi) {
  const [col, row] = CHI_TO_GRID[chi];
  return [col - 0.5, row - 0.5];   // viewBox 0 0 4 4
}

const HOA_LABEL = { loc: "Lộc", quyen: "Quyền", khoa: "Khoa", ky: "Kỵ" };

/**
 * Render chart vào container.
 * @param {HTMLElement} container
 * @param {object} chart kết quả buildChart()
 * @param {object} options { showVong, showLuu, showTuVan, onCungClick }
 */
export function renderChart(container, chart, options = {}) {
  const { showVong = true, showLuu = true, showTuVan = false, onCungClick } = options;

  container.innerHTML = "";
  const shell = document.createElement("div");
  shell.className = "a4-shell";

  const page = document.createElement("div");
  page.className = "a4-page";

  // A4 header
  page.appendChild(renderA4Header(chart));

  // Chart frame
  const frame = document.createElement("div");
  frame.className = "chart-frame";
  const grid = document.createElement("div");
  grid.className = "chart";
  for (const cung of chart.cung) {
    const cell = renderCung(cung, { showVong, showLuu });
    if (onCungClick) cell.addEventListener("click", () => onCungClick(cung, chart));
    grid.appendChild(cell);
  }
  grid.appendChild(renderCenter(chart, { showTuVan }));

  // Tam Phương Tứ Chính — vẽ từ Mệnh
  grid.appendChild(renderTamPhuongTuChinh(chart));

  frame.appendChild(grid);
  page.appendChild(frame);

  // A4 footer
  page.appendChild(renderA4Footer(chart));

  shell.appendChild(page);
  container.appendChild(shell);
}

/**
 * Vẽ Tam Phương Tứ Chính từ Mệnh:
 *   - Đối cung (Mệnh ↔ Thiên Di): line đỏ đậm
 *   - Tam hợp (Mệnh ↔ Tài ↔ Quan): triangle navy dashed
 */
function renderTamPhuongTuChinh(chart) {
  const SVG_NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("class", "chart-lines");
  svg.setAttribute("viewBox", "0 0 4 4");
  svg.setAttribute("preserveAspectRatio", "none");

  const menhChi = chart.menh.cungChi;
  const menhIdx = chart.menh.cungChiIdx;
  const diChi = CHI[(menhIdx + 6) % 12];
  const taiChi = CHI[(menhIdx + 4) % 12];   // tam hợp 1 (cung Tài Bạch)
  const quanChi = CHI[(menhIdx + 8) % 12];  // tam hợp 2 (cung Quan Lộc)

  const m = chiCenter(menhChi);
  const d = chiCenter(diChi);
  const t1 = chiCenter(taiChi);
  const t2 = chiCenter(quanChi);

  // Đối cung — Mệnh ↔ Di (solid đỏ)
  svg.appendChild(makeLine(SVG_NS, m, d, "line-doi"));

  // Tam hợp — triangle Mệnh-Tài-Quan (dashed navy)
  svg.appendChild(makeLine(SVG_NS, m, t1, "line-tam"));
  svg.appendChild(makeLine(SVG_NS, m, t2, "line-tam"));
  svg.appendChild(makeLine(SVG_NS, t1, t2, "line-tam"));

  return svg;
}

function makeLine(NS, p1, p2, className) {
  const line = document.createElementNS(NS, "line");
  line.setAttribute("x1", p1[0]);
  line.setAttribute("y1", p1[1]);
  line.setAttribute("x2", p2[0]);
  line.setAttribute("y2", p2[1]);
  line.setAttribute("class", className);
  return line;
}

function renderA4Header(chart) {
  const h = document.createElement("header");
  h.className = "a4-header";

  const left = document.createElement("div");
  left.innerHTML = `<h1 class="a4-title"><span class="mark">紫微</span>Lá số Tử Vi</h1>`;

  const right = document.createElement("div");
  right.className = "a4-meta";
  const i = chart.input;
  const m = chart.menh;
  const lich = chart.lich;
  const tzInfo = lich.tzInfo;
  const tzNote = tzInfo.converted
    ? `Sinh tại UTC${fmtTz(tzInfo.original)} → quy giờ VN`
    : `Múi giờ VN (UTC+7)`;
  right.innerHTML = `
    <div><strong>${escapeHtml(i.tenLabel || "—")}</strong> · ${i.gioiTinh === "nam" ? "Nam" : "Nữ"}</div>
    <div>Sinh ${i.nam}/${i.thang}/${i.ngay} · ${pad(i.gio)}:${pad(i.phut)} <em>(${tzNote})</em></div>
    <div>Âm lịch ${lich.am.ngay}/${lich.am.thang}/${lich.am.nam}${lich.am.isLeap ? " (nhuận)" : ""} · <strong>${lich.canChi.nam.can} ${lich.canChi.nam.chi}</strong></div>
  `;

  h.appendChild(left);
  h.appendChild(right);
  return h;
}

function renderA4Footer(chart) {
  const f = document.createElement("footer");
  f.className = "a4-footer";
  const cachCucStr = chart.cachCuc.length > 0
    ? "Cách cục: " + chart.cachCuc.map(c => c.ten).join(" · ")
    : "";

  // Legend block — đơn giản, dùng letter colored
  const legend = document.createElement("div");
  legend.className = "a4-legend";
  legend.innerHTML = `
    <div class="legend-row">
      <span class="legend-group"><strong>Miếu/Vượng:</strong>
        <span class="mv-M">M</span>:Miếu
        <span class="mv-V">V</span>:Vượng
        <span class="mv-Đ">Đ</span>:Đắc
        <span class="mv-B">B</span>:Bình
        <span class="mv-H">H</span>:Hãm
      </span>
      <span class="legend-group"><strong>Hoá:</strong>
        <span class="hoa-badge hoa-loc">L</span> Lộc
        <span class="hoa-badge hoa-quyen">Q</span> Quyền
        <span class="hoa-badge hoa-khoa">K</span> Khoa
        <span class="hoa-badge hoa-ky">Kỵ</span>
      </span>
      <span class="legend-group"><strong>Đường:</strong>
        <span class="lg-line lg-line-doi"></span>đối cung
        <span class="lg-line lg-line-tam"></span>tam hợp
      </span>
    </div>
    <div class="legend-row legend-row-source">
      <span>Bảng Miếu Vượng: <strong>${chart.input.bangMieuVuong === "tq" ? "Tử Vi Đẩu Số Toàn Thư (TQ)" : chart.input.bangMieuVuong === "vn" ? "Vân Đằng Thái Thứ Lang — Tử Vi Đẩu Số Tân Biên (VN, 1956)" : "Vương Đình Chi — Trung Châu Tam Hợp Phái (HK, 2012)"}</strong>. Có thể đổi trong Cài đặt.</span>
    </div>
  `;

  const meta = document.createElement("div");
  meta.className = "a4-footer-meta";
  meta.innerHTML = `
    <span>${escapeHtml(cachCucStr)}</span>
    <span>Tử Vi Local · Phái VN · ${new Date(chart.createdAt).toLocaleDateString("vi-VN")}</span>
  `;

  f.appendChild(legend);
  f.appendChild(meta);
  return f;
}

function renderCung(cung, opts) {
  const cell = document.createElement("div");
  cell.className = `cung ${POSITION_CLASS[cung.chi]} hanh-${cung.chiHanh}`;
  if (cung.isMenh) cell.classList.add("is-menh");
  if (cung.isThan) cell.classList.add("is-than");
  if (cung.isDaiHanCurrent) cell.classList.add("is-dh-current");
  if (cung.hasTuan && cung.hasTriet) cell.classList.add("has-both", "has-tuan");
  else if (cung.hasTuan) cell.classList.add("has-tuan");
  else if (cung.hasTriet) cell.classList.add("has-triet");
  if (cung.hasLuuTuan) cell.classList.add("has-luu-tuan");
  if (cung.hasLuuTriet) cell.classList.add("has-luu-triet");

  // ============ HEADER: cung name + hành + Can-Chi ============
  const head = document.createElement("div");
  head.className = "cung-head";
  const nameEl = document.createElement("span");
  nameEl.className = `cung-name${cung.isMenh ? " is-menh" : ""}`;
  nameEl.textContent = cung.tenCung;
  if (cung.isThan && !cung.isMenh) {
    const thanTag = document.createElement("span");
    thanTag.className = "than-tag";
    thanTag.textContent = "Thân";
    nameEl.appendChild(thanTag);
  } else if (cung.isThan && cung.isMenh) {
    // Mệnh + Thân đồng cung: gộp gọn "Mệnh·Thân"
    nameEl.textContent = "Mệnh·Thân";
  }
  head.appendChild(nameEl);
  const canChiEl = document.createElement("span");
  canChiEl.className = "cung-can-chi";
  canChiEl.innerHTML = `${cung.can} ${cung.chi} <span class="hanh-tag hanh-tag-${cung.chiHanh}">${cung.chiHanh}</span>`;
  head.appendChild(canChiEl);
  cell.appendChild(head);

  if (cung.daiHanRange) {
    const dhBadge = document.createElement("div");
    dhBadge.className = "cung-dh-badge";
    dhBadge.textContent = `ĐH${cung.daiHanIndex} · ${cung.daiHanRange}t${cung.isDaiHanCurrent ? " ★" : ""}${cung.isTieuHan ? " · TH" : ""}`;
    cell.appendChild(dhBadge);
  }

  // ============ CHÍNH TINH (giữa, lớn) ============
  if (cung.chinhTinh.length > 0) {
    const chinhWrap = document.createElement("div");
    chinhWrap.className = "cung-chinh";
    for (const ct of cung.chinhTinh) {
      const star = document.createElement("div");
      star.className = "chinh-star";
      star.innerHTML = `<span class="chinh-name">${escapeHtml(ct.sao)}</span>` +
        (ct.mieuVuong && ct.mieuVuong !== "-" ? `<span class="mv mv-${ct.mieuVuong}">${ct.mieuVuong}</span>` : "");
      chinhWrap.appendChild(star);
    }
    cell.appendChild(chinhWrap);
  } else {
    // VCD — vô chính diệu
    const vcd = document.createElement("div");
    vcd.className = "cung-chinh cung-vcd";
    vcd.textContent = "VCD";
    vcd.title = "Vô Chính Diệu";
    cell.appendChild(vcd);
  }

  // Hoá badges (đặt ngay dưới chính tinh)
  if (cung.tuHoa.length > 0) {
    const badges = document.createElement("div");
    badges.className = "hoa-badges";
    for (const h of cung.tuHoa) {
      const b = document.createElement("span");
      b.className = `hoa-badge hoa-${h.kind}`;
      b.textContent = HOA_LABEL[h.kind];
      b.title = `${HOA_LABEL[h.kind]} ${h.sao}`;
      badges.appendChild(b);
    }
    cell.appendChild(badges);
  }

  // ============ 2 CỘT: CÁT | SÁT ============
  const cat = [], sat = [], trung = [];
  for (const sao of cung.phuTinh) {
    const k = categorizeStar(sao);
    if (k === "cat") cat.push(sao);
    else if (k === "sat") sat.push(sao);
    else trung.push(sao);   // trung tính + lẻ
  }

  if (cat.length > 0 || sat.length > 0) {
    const cols = document.createElement("div");
    // Khi 1 trong 2 col rỗng → dùng full-width 1 col
    const isSingle = cat.length === 0 || sat.length === 0;
    cols.className = isSingle ? "cung-cols cung-cols-single" : "cung-cols";

    if (cat.length > 0) {
      const colCat = document.createElement("ul");
      colCat.className = "col col-cat";
      for (const sao of cat) {
        const li = document.createElement("li");
        li.className = "phu phu-cat";
        li.textContent = sao;
        colCat.appendChild(li);
      }
      cols.appendChild(colCat);
    }

    if (sat.length > 0) {
      const colSat = document.createElement("ul");
      colSat.className = "col col-sat";
      for (const sao of sat) {
        const li = document.createElement("li");
        li.className = "phu phu-sat";
        li.textContent = sao;
        colSat.appendChild(li);
      }
      cols.appendChild(colSat);
    }

    cell.appendChild(cols);
  }

  // ============ TRUNG TÍNH + LẺ (full width, nhỏ) ============
  if (trung.length > 0) {
    const ul = document.createElement("ul");
    ul.className = "phu-le-list";
    for (const sao of trung) {
      const li = document.createElement("li");
      li.className = "phu phu-le";
      li.textContent = sao;
      ul.appendChild(li);
    }
    cell.appendChild(ul);
  }

  // ============ EXTRAS (vòng + sao lưu + ĐH/L.Hoá) ============
  const extras = [];
  if (opts.showVong && cung.vong.length > 0) {
    const vongStr = cung.vong.map(v => `${v.sao}(${v.vong})`).join(" · ");
    extras.push({ label: "Vòng", value: vongStr });
  }
  if (opts.showLuu && cung.saoLuu.length > 0) {
    extras.push({ label: "Lưu", value: cung.saoLuu.join(" · "), isLuu: true });
  }
  if (cung.luuTuHoa.length > 0) {
    const lhStr = cung.luuTuHoa.map(h => `L.${HOA_LABEL[h.kind]} ${h.sao}`).join(" · ");
    extras.push({ label: "L.Hoá", value: lhStr, isLuu: true });
  }
  if (cung.tuHoaDaiHan.length > 0) {
    const dhhStr = cung.tuHoaDaiHan.map(h => `ĐH.${HOA_LABEL[h.kind]} ${h.sao}`).join(" · ");
    extras.push({ label: "ĐH.Hoá", value: dhhStr });
  }
  if (extras.length > 0) {
    const wrap = document.createElement("div");
    wrap.className = "cung-extra";
    for (const e of extras) {
      const row = document.createElement("div");
      row.className = "extra-row" + (e.isLuu ? " luu-star" : "");
      row.innerHTML = `<span class="label">${e.label}</span> ${escapeHtml(e.value)}`;
      wrap.appendChild(row);
    }
    cell.appendChild(wrap);
  }

  return cell;
}

function renderStar({ name, mv, kind }) {
  const li = document.createElement("li");
  li.className = `star is-${kind}`;
  const nameEl = document.createElement("span");
  nameEl.className = "star-name";
  nameEl.textContent = name;
  li.appendChild(nameEl);
  if (mv && mv !== "-") {
    const mvEl = document.createElement("span");
    mvEl.className = `mv mv-${mv}`;
    mvEl.textContent = mv;
    li.appendChild(mvEl);
  }
  return li;
}

function renderCenter(chart, { showTuVan }) {
  const center = document.createElement("div");
  center.className = "chart-center";

  const title = document.createElement("div");
  title.className = "center-title";
  title.textContent = "天 盤 · Thiên Bàn";
  center.appendChild(title);

  // ============ GHI CHÚ SINH ĐÔI (nếu Mệnh lùi cung) ============
  if (chart.menh.sinhDoiLuiCung) {
    const note = document.createElement("div");
    note.className = "sinh-doi-note";
    note.textContent = "⚇ " + (chart.menh.ghiChu || "Lá sinh đôi — Mệnh lùi 1 cung (cổ pháp)");
    center.appendChild(note);
  }

  // ============ SECTION 1: BẢN MỆNH ============
  center.appendChild(renderSection("BẢN MỆNH", [
    ["Tháng · Ngày · Giờ", `${chart.lich.canChi.thang.can} ${chart.lich.canChi.thang.chi} · ${chart.lich.canChi.ngay.can} ${chart.lich.canChi.ngay.chi} · ${chart.lich.canChi.gio.can} ${chart.lich.canChi.gio.chi}`],
    ["Nạp Âm", chart.lich.napAm || "-"],
    ["Cục", `${chart.menh.cuc} (${chart.menh.cucNum} — hành ${chart.menh.cucHanh})`],
    ["Mệnh · Thân", `${chart.menh.cungChi} · ${chart.menh.thanChi} (Thân cư ${chart.menh.thanCu})`],
    ["Chủ", `Mệnh ${chart.menh.menhChu} · Thân ${chart.menh.thanChu}`],
    ["Tuần · Triệt", `${chart.tuanTriet.tuan.join("-")}  ·  ${chart.tuanTriet.triet.join("-")}`],
  ]));

  // ============ SECTION 2: TỨ HOÁ NĂM SINH ============
  const tuHoaSection = document.createElement("div");
  tuHoaSection.className = "center-section";
  const tuHoaHeader = document.createElement("div");
  tuHoaHeader.className = "section-header";
  tuHoaHeader.textContent = `TỨ HOÁ NĂM SINH (${chart.lich.canChi.nam.can})`;
  tuHoaSection.appendChild(tuHoaHeader);
  const tuHoaList = document.createElement("div");
  tuHoaList.className = "tu-hoa-list";
  for (const k of ["loc", "quyen", "khoa", "ky"]) {
    const h = chart.tuHoa["hoa" + k.charAt(0).toUpperCase() + k.slice(1)];
    if (!h) continue;
    const cungName = chart.cung.find(c => c.chiIdx === h.chiIdx)?.tenCung || "?";
    const row = document.createElement("div");
    row.className = "tu-hoa-row";
    row.innerHTML = `
      <span class="hoa-badge hoa-${k}">${HOA_LABEL[k]}</span>
      <span class="th-sao">${escapeHtml(h.sao)}</span>
      <span class="th-cung">${escapeHtml(cungName)} (${CHI[h.chiIdx]})</span>
    `;
    tuHoaList.appendChild(row);
  }
  tuHoaSection.appendChild(tuHoaList);
  center.appendChild(tuHoaSection);

  // ============ SECTION 3: CÁCH CỤC (nếu có) ============
  if (chart.cachCuc.length > 0) {
    const ccSection = document.createElement("div");
    ccSection.className = "center-section";
    const ccHeader = document.createElement("div");
    ccHeader.className = "section-header";
    ccHeader.textContent = "CÁCH CỤC";
    ccSection.appendChild(ccHeader);
    const ccBody = document.createElement("div");
    ccBody.className = "cach-cuc-list";
    ccBody.innerHTML = chart.cachCuc
      .map(c => `<span class="cc-item"><strong>${escapeHtml(c.ten)}</strong> <em>(${c.viTriChi})</em></span>`)
      .join(" · ");
    ccSection.appendChild(ccBody);
    center.appendChild(ccSection);
  }

  // ============ SECTION 4: VẬN HẠN ============
  const vhRows = [
    ["Tuổi (mụ)", String(chart.menh.currentAge)],
  ];
  if (chart.daiHan.current) {
    const dh = chart.daiHan.current;
    vhRows.push(["Đại hạn", `ĐH${dh.index} ${dh.chi} (${dh.ageStart}-${dh.ageEnd}) · cung ${chart.cung.find(c => c.chiIdx === dh.chiIdx)?.tenCung || "?"}`]);
  }
  vhRows.push(["Tiểu hạn", chart.daiHan.tieuHan.chi]);
  if (chart.daiHan.tuHoaDH) {
    const t = chart.daiHan.tuHoaDH;
    const compact = `L:${t.hoaLoc.sao} · Q:${t.hoaQuyen.sao} · K:${t.hoaKhoa.sao} · Kỵ:${t.hoaKy.sao}`;
    vhRows.push(["Tứ Hoá ĐH", compact]);
  }
  center.appendChild(renderSection("VẬN HẠN HIỆN TẠI", vhRows));

  // ============ SECTION 5: TỬ VÂN (nếu bật) ============
  if (showTuVan) {
    const tvRows = [
      ["Sao chủ Cục", `${chart.tuVan.saoChuCuc.sao} (${chart.tuVan.saoChuCuc.chi})`],
      ["Lai Nhân", chart.tuVan.laiNhan.tenCung + (chart.tuVan.laiNhan.isManual ? "" : " (default)")],
      ["Nguyên Thần", `${chart.tuVan.nguyenThan.cungMenh.chi} + ${chart.tuVan.nguyenThan.cungThu2.tenCung}-${chart.tuVan.nguyenThan.cungThu2.chi}`],
    ];
    center.appendChild(renderSection("TỬ VÂN (experimental)", tvRows));
  }

  return center;
}

function renderSection(title, rows) {
  const section = document.createElement("div");
  section.className = "center-section";
  const header = document.createElement("div");
  header.className = "section-header";
  header.textContent = title;
  section.appendChild(header);
  for (const [k, v] of rows) {
    const row = document.createElement("dl");
    row.className = "center-row";
    const dt = document.createElement("dt"); dt.textContent = k;
    const dd = document.createElement("dd"); dd.textContent = v;
    row.appendChild(dt); row.appendChild(dd);
    section.appendChild(row);
  }
  return section;
}


function pad(n) { return String(n).padStart(2, "0"); }
function fmtTz(tz) { return tz >= 0 ? `+${tz}` : `${tz}`; }

/**
 * Render meta panel (left sidebar dưới form).
 */
export function renderMeta(container, chart) {
  container.innerHTML = "";
  const items = [
    ["Sinh", `${chart.input.nam}/${chart.input.thang}/${chart.input.ngay} ${chart.input.gio}h${chart.input.phut}`],
    ["Âm lịch", `${chart.lich.am.ngay}/${chart.lich.am.thang}/${chart.lich.am.nam}`],
    ["Can-Chi năm", `${chart.lich.canChi.nam.can} ${chart.lich.canChi.nam.chi}`],
    ["Cục", chart.menh.cuc],
    ["Mệnh", chart.menh.cungChi],
    ["Thân", `${chart.menh.thanChi} (cư ${chart.menh.thanCu})`],
    ["Mệnh chủ", chart.menh.menhChu],
    ["Thân chủ", chart.menh.thanChu],
    ["Tuổi mụ", chart.menh.currentAge],
  ];
  for (const [k, v] of items) {
    const dt = document.createElement("dt"); dt.textContent = k;
    const dd = document.createElement("dd"); dd.textContent = v;
    container.appendChild(dt); container.appendChild(dd);
  }
}

/**
 * Render cung detail vào modal body.
 */
export function renderCungDetail(container, cung, chart) {
  container.innerHTML = "";
  const h = document.createElement("h2");
  h.style.fontFamily = "var(--font-serif)";
  h.style.color = "var(--color-accent-red)";
  h.style.margin = "0 0 12px";
  h.textContent = `${cung.tenCung} · ${cung.can} ${cung.chi}`;
  container.appendChild(h);

  const grid = document.createElement("div");
  grid.className = "detail-grid";

  // Status
  const statusItems = [];
  if (cung.isMenh) statusItems.push("Mệnh");
  if (cung.isThan) statusItems.push("Thân cư " + chart.menh.thanCu);
  if (cung.isDaiHanCurrent) statusItems.push(`ĐH${cung.daiHanIndex} hiện tại (${cung.daiHanRange}t)`);
  else if (cung.daiHanRange) statusItems.push(`ĐH${cung.daiHanIndex} (${cung.daiHanRange}t)`);
  if (cung.isTieuHan) statusItems.push("Tiểu hạn");
  if (cung.hasTuan) statusItems.push("Tuần");
  if (cung.hasTriet) statusItems.push("Triệt");
  if (cung.hasLuuTuan) statusItems.push("Lưu Tuần");
  if (cung.hasLuuTriet) statusItems.push("Lưu Triệt");
  if (statusItems.length > 0) {
    grid.appendChild(makeSection("Trạng thái", statusItems.join(" · ")));
  }

  if (cung.chinhTinh.length > 0) {
    grid.appendChild(makeStarSection("Chính tinh",
      cung.chinhTinh.map(c => ({ name: c.sao, mv: c.mieuVuong }))));
  }

  // Phụ tinh phân loại
  const cat = cung.phuTinh.filter(s => categorizeStar(s) === "cat");
  const sat = cung.phuTinh.filter(s => categorizeStar(s) === "sat");
  const le = cung.phuTinh.filter(s => categorizeStar(s) === "le");
  if (cat.length) grid.appendChild(makeStarSection("Lục cát", cat.map(s => ({ name: s }))));
  if (sat.length) grid.appendChild(makeStarSection("Lục sát", sat.map(s => ({ name: s }))));
  if (le.length) grid.appendChild(makeStarSection("Phụ tinh khác", le.map(s => ({ name: s }))));

  // Tuần/Triệt — nếu án ngữ, hiện nghĩa (án khí sao trong cung)
  const anNgu = [];
  if (cung.hasTuan) anNgu.push({ name: "Tuần" });
  if (cung.hasTriet) anNgu.push({ name: "Triệt" });
  if (anNgu.length) grid.appendChild(makeStarSection("Tuần / Triệt án ngữ", anNgu));

  if (cung.tuHoa.length > 0) {
    grid.appendChild(makeStarSection("Tứ Hoá năm sinh",
      cung.tuHoa.map(h => ({ name: `Hoá ${HOA_LABEL[h.kind]} ${h.sao}`, key: `Hóa ${HOA_LABEL[h.kind]}` }))));
  }
  if (cung.tuHoaDaiHan.length > 0) {
    const list = cung.tuHoaDaiHan.map(h => `ĐH.${HOA_LABEL[h.kind]} ${h.sao}`).join(" · ");
    grid.appendChild(makeSection("Tứ Hoá đại hạn", list));
  }
  if (cung.luuTuHoa.length > 0) {
    const list = cung.luuTuHoa.map(h => `L.${HOA_LABEL[h.kind]} ${h.sao}`).join(" · ");
    grid.appendChild(makeSection("Lưu Tứ Hoá", list));
  }

  if (cung.vong.length > 0) {
    const vongMap = { TT: "Thái Tuế", BS: "Bác Sĩ", TS: "Trường Sinh" };
    grid.appendChild(makeStarSection("3 vòng sao",
      cung.vong.map(v => ({ name: `${v.sao} (${vongMap[v.vong]})`, key: v.sao }))));
  }

  if (cung.saoLuu.length > 0) {
    // saoLuu mang tiền tố "L." — giữ để hiển thị, bỏ khi tra nghĩa.
    grid.appendChild(makeStarSection("Sao lưu " + chart.input.namXem,
      cung.saoLuu.map(s => ({ name: s, key: s.replace(/^L\./, "") }))));
  }

  container.appendChild(grid);
}

function makeSection(title, content) {
  const sec = document.createElement("div");
  sec.className = "detail-section";
  const h = document.createElement("h4");
  h.textContent = title;
  const p = document.createElement("p");
  p.textContent = content;
  sec.appendChild(h);
  sec.appendChild(p);
  return sec;
}

/**
 * Section liệt kê sao kèm nghĩa cô đọng (tra sao_nghia.js).
 * @param {string} title
 * @param {{name:string, mv?:string, key?:string}[]} items
 *   - name: chuỗi hiển thị; mv: mã độ sáng (M/V/Đ/B/H) → tô màu; key: khoá tra nghĩa (mặc định = name).
 */
function makeStarSection(title, items) {
  const sec = document.createElement("div");
  sec.className = "detail-section";
  const h = document.createElement("h4");
  h.textContent = title;
  sec.appendChild(h);
  const ul = document.createElement("ul");
  ul.className = "sao-nghia-list";
  for (const it of items) {
    const li = document.createElement("li");
    const mv = it.mv && it.mv !== "-"
      ? ` <sup class="mv mv-${it.mv}">${escapeHtml(it.mv)}</sup>` : "";
    const ng = saoNghia(it.key ?? it.name);
    const desc = ng ? ` <span class="sn-desc">— ${escapeHtml(ng)}</span>` : "";
    li.innerHTML = `<span class="sn-name">${escapeHtml(it.name)}</span>${mv}${desc}`;
    ul.appendChild(li);
  }
  sec.appendChild(ul);
  return sec;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
