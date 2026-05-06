import { buildChart } from "../js/engine.js";

const chart = buildChart({
  nam: 1989, thang: 10, ngay: 20, gio: 2, phut: 0,
  gioiTinh: "nu", tenLabel: "Hoà",
});

console.log("=== INPUT ===");
console.log(`DL: 20/10/1989 02h00`);
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
  console.log(`${c.tenCung.padEnd(10)} ${c.chi}(${c.can}): ${[...ct, ...pt].join(", ")} ${tags.length ? `[${tags.join("+")}]` : ""}`);
}
