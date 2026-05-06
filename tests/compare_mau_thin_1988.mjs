// Compare Nam Mậu Thìn 1988 ÂL 15/2 giờ Ngọ — App vs Tử Vi Chân Cơ

import { buildChart } from "../js/engine.js";

const args = process.argv.slice(2);
const ngayDL = args[0] ? parseInt(args[0]) : 1;

const chart = buildChart({
  nam: 1988, thang: 4, ngay: ngayDL, gio: 12, phut: 0,
  gioiTinh: "nam", tenLabel: "Test Mau Thin 1988",
});

console.log("=== INPUT ===");
console.log(`DL: ${ngayDL}/4/1988 12h00`);
console.log(`ÂL: ${chart.lich.am.ngay}/${chart.lich.am.thang}/${chart.lich.canChi.nam.can} ${chart.lich.canChi.nam.chi}`);
console.log(`Giờ: ${chart.lich.chiGio} (${chart.lich.canChi.gio.can} ${chart.lich.canChi.gio.chi})`);
console.log(`Mệnh: ${chart.menh.cungChi} | Thân: ${chart.menh.thanChi} (${chart.menh.thanCu})`);
console.log(`Cục: ${chart.menh.cuc} | Mệnh chủ: ${chart.menh.menhChu} | Thân chủ: ${chart.menh.thanChu}`);

console.log("\n=== 12 CUNG ===");
for (const c of chart.cung) {
  const ct = (c.chinhTinh || []).map(s => `${s.sao}(${s.mieuVuong})`);
  const pt = c.phuTinh || [];
  const tags = [];
  if (c.hasTuan) tags.push("Tuần");
  if (c.hasTriet) tags.push("Triệt");
  if (c.isThan) tags.push("THÂN");
  const all = [...ct, ...pt].join(", ");
  console.log(`[${c.index}] ${c.tenCung.padEnd(8)} ${c.chi}(${c.can}): ${all} ${tags.length ? `[${tags.join("+")}]` : ""}`);
}

console.log("\n=== TÌM SAO ===");
const findStar = (name) => {
  const result = [];
  for (const c of chart.cung) {
    const inCT = (c.chinhTinh || []).some(s => s.sao === name);
    const inPT = (c.phuTinh || []).includes(name);
    if (inCT || inPT) result.push(`${c.tenCung}(${c.chi})`);
  }
  return result;
};

const stars = [
  "Thiên Quý", "Ân Quang",
  "Văn Khúc", "Văn Xương", "Tả Phụ", "Hữu Bật",
  "Thiên Khôi", "Thiên Việt", "Thiên Quan", "Thiên Phúc",
  "Lộc Tồn", "Kình Dương", "Đà La",
  "Hoả Tinh", "Linh Tinh", "Địa Không", "Địa Kiếp",
  "Hồng Loan", "Thiên Hỉ", "Đào Hoa", "Hoa Cái",
  "Thai Phụ", "Phong Cáo", "Tam Thai", "Bát Toạ",
  "Long Trì", "Phượng Các", "Cô Thần", "Quả Tú",
  "Thiên Mã", "Thiên Hình", "Thiên Diêu",
  "Thiên Khốc", "Thiên Hư", "Thiên Không",
  "Thiên Tài", "Thiên Thọ", "Thiên Y", "Đường Phù",
];
for (const s of stars) {
  const at = findStar(s);
  console.log(`  ${s.padEnd(14)}: ${at.join(" / ") || "—"}`);
}
