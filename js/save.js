// save.js — Export chart sang PNG / JSON / Markdown.
//
// PNG: dùng html2canvas (lazy-load từ CDN; cache sau lần đầu).
// JSON: export full chart object.
// Markdown: render text-friendly summary.

const HTML2CANVAS_URL = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";

const HOA_LABEL = { loc: "Lộc", quyen: "Quyền", khoa: "Khoa", ky: "Kỵ" };

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function loadHtml2Canvas() {
  if (window.html2canvas) return window.html2canvas;
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = HTML2CANVAS_URL;
    s.crossOrigin = "anonymous";
    s.onload = () => resolve(window.html2canvas);
    s.onerror = () => reject(new Error("Không tải được html2canvas (cần internet lần đầu)."));
    document.head.appendChild(s);
  });
}

/**
 * Export chart container ra PNG.
 * @param {HTMLElement} container element chứa .chart
 * @param {string} filename
 */
export async function exportPNG(container, filename) {
  const html2canvas = await loadHtml2Canvas();
  // Tạm bỏ transform scale (responsive) để capture A4 native size
  const prevTransform = container.style.transform;
  container.style.transform = "none";
  const canvas = await html2canvas(container, {
    scale: 3,                     // 3× = ~2380×3370px (near 300dpi A4)
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: false,
    windowWidth: container.scrollWidth,
    windowHeight: container.scrollHeight,
  });
  container.style.transform = prevTransform;
  canvas.toBlob((blob) => {
    if (blob) downloadBlob(blob, filename);
  }, "image/png");
}

/**
 * Export chart object ra JSON file.
 */
export function exportJSON(chart, filename) {
  const blob = new Blob([JSON.stringify(chart, null, 2)], { type: "application/json" });
  downloadBlob(blob, filename);
}

/**
 * Export chart ra Markdown (summary đọc được).
 */
export function exportMarkdown(chart, filename) {
  const md = renderMarkdown(chart);
  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  downloadBlob(blob, filename);
}

export function renderMarkdown(chart) {
  const lines = [];
  const i = chart.input;
  const m = chart.menh;
  const lich = chart.lich;
  const tag = i.tenLabel || `${i.gioiTinh === "nam" ? "Nam" : "Nữ"} ${lich.canChi.nam.can} ${lich.canChi.nam.chi}`;

  lines.push(`# Lá số Tử Vi — ${tag}`);
  lines.push("");
  lines.push(`> Tạo bởi Tử Vi Local · ${new Date(chart.createdAt).toLocaleString("vi-VN")}`);
  lines.push("");

  // Thông tin sinh
  lines.push("## Thông tin sinh");
  lines.push("");
  lines.push(`- **Dương lịch:** ${i.nam}/${i.thang}/${i.ngay} ${String(i.gio).padStart(2,"0")}:${String(i.phut).padStart(2,"0")}`);
  lines.push(`- **Âm lịch:** ${lich.am.ngay}/${lich.am.thang}/${lich.am.nam}${lich.am.isLeap ? " (nhuận)" : ""}`);
  lines.push(`- **Năm sinh:** ${lich.canChi.nam.can} ${lich.canChi.nam.chi}`);
  lines.push(`- **Tháng / Ngày / Giờ:** ${lich.canChi.thang.can} ${lich.canChi.thang.chi} · ${lich.canChi.ngay.can} ${lich.canChi.ngay.chi} · ${lich.canChi.gio.can} ${lich.canChi.gio.chi}`);
  lines.push(`- **Nạp Âm:** ${lich.napAm || "-"}`);
  lines.push(`- **Giới tính:** ${i.gioiTinh === "nam" ? "Nam" : "Nữ"}`);
  lines.push("");

  // Khung lá số
  lines.push("## Khung lá số");
  lines.push("");
  lines.push(`- **Cục:** ${m.cuc} (${m.cucNum} — hành ${m.cucHanh})`);
  lines.push(`- **Cung Mệnh:** ${m.cungChi}`);
  lines.push(`- **Cung Thân:** ${m.thanChi} (Thân cư ${m.thanCu})`);
  lines.push(`- **Mệnh chủ:** ${m.menhChu}`);
  lines.push(`- **Thân chủ:** ${m.thanChu}`);
  lines.push(`- **Tuần:** ${chart.tuanTriet.tuan.join(" - ")}`);
  lines.push(`- **Triệt:** ${chart.tuanTriet.triet.join(" - ")}`);
  if (chart.tuanTriet.giap.length > 0) {
    lines.push(`- **Tuần-Triệt giáp:** ${chart.tuanTriet.giap.join(", ")}`);
  }
  lines.push("");

  // Tứ Hoá năm sinh
  lines.push("## Tứ Hoá năm sinh");
  lines.push("");
  for (const k of ["loc", "quyen", "khoa", "ky"]) {
    const h = chart.tuHoa["hoa" + k.charAt(0).toUpperCase() + k.slice(1)];
    if (h) lines.push(`- **Hoá ${HOA_LABEL[k]}:** ${h.sao} (${chart.cung.find(c => c.chiIdx === h.chiIdx)?.tenCung || "?"})`);
  }
  lines.push("");

  // Cách cục
  if (chart.cachCuc.length > 0) {
    lines.push("## Cách cục");
    lines.push("");
    for (const c of chart.cachCuc) {
      lines.push(`- **${c.ten}** (${c.viTriChi}) — ${c.saoList.join(" + ")}`);
    }
    lines.push("");
  }

  // Đại hạn + lưu niên
  lines.push("## Đại hạn / Lưu niên");
  lines.push("");
  lines.push(`- **Tuổi mụ:** ${m.currentAge}`);
  lines.push(`- **Năm xem:** ${i.namXem} (${chart.luuNien.canChi.can} ${chart.luuNien.canChi.chi})`);
  if (chart.daiHan.current) {
    const dh = chart.daiHan.current;
    lines.push(`- **Đại hạn hiện tại:** ĐH${dh.index} ${dh.chi} (${dh.ageStart}-${dh.ageEnd}t)`);
  }
  lines.push(`- **Tiểu hạn:** ${chart.daiHan.tieuHan.chi}`);
  lines.push(`- **Lưu Tuần:** ${chart.luuNien.luuTuanTriet.luuTuan.join(" - ")}`);
  lines.push(`- **Lưu Triệt:** ${chart.luuNien.luuTuanTriet.luuTriet.join(" - ")}`);
  lines.push(`- **Tam Tai năm này:** ${chart.luuNien.isTamTai ? "✓ CÓ" : "không"}`);
  lines.push("");

  // 12 cung
  lines.push("## 12 cung");
  lines.push("");
  for (const c of chart.cung) {
    const flags = [];
    if (c.isMenh) flags.push("Mệnh");
    if (c.isThan) flags.push("Thân");
    if (c.isDaiHanCurrent) flags.push("ĐH hiện tại");
    if (c.isTieuHan) flags.push("Tiểu hạn");
    if (c.hasTuan) flags.push("Tuần");
    if (c.hasTriet) flags.push("Triệt");
    lines.push(`### ${c.tenCung} — ${c.can} ${c.chi}${flags.length ? "  *(" + flags.join(", ") + ")*" : ""}`);
    if (c.chinhTinh.length > 0) {
      lines.push(`- **Chính tinh:** ${c.chinhTinh.map(x => x.sao + (x.mieuVuong !== "-" ? ` (${x.mieuVuong})` : "")).join(", ")}`);
    }
    if (c.phuTinh.length > 0) {
      lines.push(`- **Phụ tinh:** ${c.phuTinh.join(", ")}`);
    }
    if (c.tuHoa.length > 0) {
      lines.push(`- **Hoá:** ${c.tuHoa.map(h => `Hoá ${HOA_LABEL[h.kind]} ${h.sao}`).join(", ")}`);
    }
    if (c.daiHanRange) {
      lines.push(`- **Đại hạn:** ĐH${c.daiHanIndex} (${c.daiHanRange}t)${c.isDaiHanCurrent ? " ★" : ""}`);
    }
    if (c.saoLuu.length > 0) {
      lines.push(`- **Sao lưu:** ${c.saoLuu.join(", ")}`);
    }
    lines.push("");
  }

  // Tử Vân
  lines.push("## Tử Vân (experimental)");
  lines.push("");
  lines.push(`- **Sao chủ Cục:** ${chart.tuVan.saoChuCuc.sao} (${chart.tuVan.saoChuCuc.chi})`);
  lines.push(`- **Lai Nhân:** ${chart.tuVan.laiNhan.tenCung}${chart.tuVan.laiNhan.isManual ? "" : " (mặc định)"}`);
  lines.push(`- **Nguyên Thần:** ${chart.tuVan.nguyenThan.cungMenh.tenCung} (${chart.tuVan.nguyenThan.cungMenh.chi}) + ${chart.tuVan.nguyenThan.cungThu2.tenCung} (${chart.tuVan.nguyenThan.cungThu2.chi})`);
  lines.push("");

  return lines.join("\n");
}

/**
 * Helper: gen filename từ chart.
 */
export function defaultFilename(chart, ext) {
  const i = chart.input;
  const tag = (i.tenLabel || `${i.gioiTinh}_${chart.lich.canChi.nam.can}_${chart.lich.canChi.nam.chi}`)
    .replace(/[^\w\u00C0-\u1EF9-]+/g, "_");
  return `tuvi_${tag}_${i.nam}-${String(i.thang).padStart(2,"0")}-${String(i.ngay).padStart(2,"0")}.${ext}`;
}
