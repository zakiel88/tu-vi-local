import { buildChart } from "../js/engine.js";

const chart = buildChart({
  nam: 1988, thang: 4, ngay: 1, gio: 12, phut: 0,
  gioiTinh: "nam", tenLabel: "CS-001",
  namXem: 2026,
});

console.log("=== INPUT ===");
console.log(`DL: 1/4/1988 12h00 — Nam`);
console.log(`ÂL: ${chart.lich.am.ngay}/${chart.lich.am.thang}/${chart.lich.canChi.nam.can} ${chart.lich.canChi.nam.chi}`);
console.log(`Nạp Âm: ${chart.lich.napAm}`);
console.log(`Giờ: ${chart.lich.chiGio} (${chart.lich.canChi.gio.can} ${chart.lich.canChi.gio.chi})`);
console.log(`Mệnh: ${chart.menh.cungChi} | Thân: ${chart.menh.thanChi} (${chart.menh.thanCu})`);
console.log(`Cục: ${chart.menh.cuc} (${chart.menh.cucNum}) | Mệnh chủ: ${chart.menh.menhChu} | Thân chủ: ${chart.menh.thanChu}`);
console.log(`Tuổi mụ năm 2026: ${chart.menh.currentAge}`);

console.log("\n=== TỨ HOÁ NĂM SINH (Mậu) ===");
const fmt = (h) => h ? `${h.sao} → cung chi ${h.chiIdx} (${["Tý","Sửu","Dần","Mão","Thìn","Tỵ","Ngọ","Mùi","Thân","Dậu","Tuất","Hợi"][h.chiIdx]})` : "—";
console.log(`Lộc:   ${fmt(chart.tuHoa.hoaLoc)}`);
console.log(`Quyền: ${fmt(chart.tuHoa.hoaQuyen)}`);
console.log(`Khoa:  ${fmt(chart.tuHoa.hoaKhoa)}`);
console.log(`Kỵ:    ${fmt(chart.tuHoa.hoaKy)}`);

console.log("\n=== ĐẠI HẠN HIỆN TẠI ===");
const dh = chart.daiHan.current;
if (dh) {
  console.log(`ĐH ${dh.index}: ${dh.ageStart}-${dh.ageEnd} tuổi tại ${dh.ten}(${["Tý","Sửu","Dần","Mão","Thìn","Tỵ","Ngọ","Mùi","Thân","Dậu","Tuất","Hợi"][dh.chiIdx]})`);
}
console.log(`Đại hạn đi ${chart.daiHan.isThuan ? 'THUẬN' : 'NGHỊCH'}`);

if (chart.daiHan.tuHoaDH) {
  console.log("\nTứ Hoá Đại hạn (theo Can cung ĐH):");
  console.log(`  Lộc:   ${fmt(chart.daiHan.tuHoaDH.hoaLoc)}`);
  console.log(`  Quyền: ${fmt(chart.daiHan.tuHoaDH.hoaQuyen)}`);
  console.log(`  Khoa:  ${fmt(chart.daiHan.tuHoaDH.hoaKhoa)}`);
  console.log(`  Kỵ:    ${fmt(chart.daiHan.tuHoaDH.hoaKy)}`);
}

console.log("\n=== LƯU NIÊN 2026 (Bính Ngọ) ===");
console.log(`Tứ Hoá Lưu:`);
console.log(`  Lộc:   ${fmt(chart.luuNien.luuTuHoa.hoaLoc)}`);
console.log(`  Quyền: ${fmt(chart.luuNien.luuTuHoa.hoaQuyen)}`);
console.log(`  Khoa:  ${fmt(chart.luuNien.luuTuHoa.hoaKhoa)}`);
console.log(`  Kỵ:    ${fmt(chart.luuNien.luuTuHoa.hoaKy)}`);

console.log("\n9 Sao Lưu Động (theo Tân Biên):");
const CHI = ["Tý","Sửu","Dần","Mão","Thìn","Tỵ","Ngọ","Mùi","Thân","Dậu","Tuất","Hợi"];
for (const [name, ci] of Object.entries(chart.luuNien.saoLuu)) {
  console.log(`  ${name}: ${CHI[ci]}`);
}
