import { buildChart } from "../js/engine.js";

const chart = buildChart({
  nam: 1988, thang: 8, ngay: 23, gio: 16, phut: 30,
  gioiTinh: "nu", tenLabel: "Hà Kyu", namXem: 2026,
});

console.log("=== INPUT ===");
console.log(`DL 1988/8/23 16:30 — Nữ`);
console.log(`ÂL: ${chart.lich.am.ngay}/${chart.lich.am.thang}/${chart.lich.canChi.nam.can} ${chart.lich.canChi.nam.chi}`);
console.log(`Nạp Âm: ${chart.lich.napAm}`);
console.log(`Giờ: ${chart.lich.chiGio} (${chart.lich.canChi.gio.can} ${chart.lich.canChi.gio.chi})`);
console.log(`Mệnh: ${chart.menh.cungChi} | Thân: ${chart.menh.thanChi} (${chart.menh.thanCu})`);
console.log(`Cục: ${chart.menh.cuc} (${chart.menh.cucNum}) | MC: ${chart.menh.menhChu} | TC: ${chart.menh.thanChu}`);
console.log(`Tuần: ${chart.tuanTriet.tuan.join(",")} | Triệt: ${chart.tuanTriet.triet.join(",")}`);
console.log(`Tứ Hoá năm sinh: Lộc=${chart.tuHoa.hoaLoc?.sao} Quyền=${chart.tuHoa.hoaQuyen?.sao} Khoa=${chart.tuHoa.hoaKhoa?.sao} Kỵ=${chart.tuHoa.hoaKy?.sao}`);

console.log("\n=== 12 CUNG (full) ===");
for (const c of chart.cung) {
  const ct = (c.chinhTinh||[]).map(s => `${s.sao}(${s.mieuVuong})`);
  const pt = c.phuTinh || [];
  const vongs = (c.vong||[]).map(v => `${v.vong}.${v.sao}`);
  const tags = [];
  if (c.hasTuan) tags.push("Tuần");
  if (c.hasTriet) tags.push("Triệt");
  if (c.isThan) tags.push("THÂN");
  if (c.isDaiHanCurrent) tags.push("ĐH"+c.daiHanIndex+":"+c.daiHanRange);
  console.log(`\n[${c.tenCung}] ${c.chi}(${c.can}) ${tags.join(" + ")}`);
  console.log(`  Chính: ${ct.join(", ")||"VCD"}`);
  console.log(`  Phụ:   ${pt.join(", ")||"-"}`);
  console.log(`  Vòng:  ${vongs.join(", ")||"-"}`);
}
