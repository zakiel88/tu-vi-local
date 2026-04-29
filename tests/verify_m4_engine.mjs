// Test engine.buildChart end-to-end với CS-013, CS-015, CS-016.
// Verify Markdown export render đúng.

import { buildChart, computeCanChiNam } from '../js/engine.js';
import { renderMarkdown } from '../js/save.js';

let pass = 0, fail = 0;
function check(label, cond, info = "") {
  if (cond) { pass++; console.log(`  ✓ ${label}`); }
  else      { fail++; console.log(`  ✗ ${label} ${info}`); }
}

console.log("\n=== computeCanChiNam ===");
check("1900 = Canh Tí", JSON.stringify(computeCanChiNam(1900)) === '{"can":"Canh","chi":"Tí"}');
check("1988 = Mậu Thìn", JSON.stringify(computeCanChiNam(1988)) === '{"can":"Mậu","chi":"Thìn"}');
check("1994 = Giáp Tuất", JSON.stringify(computeCanChiNam(1994)) === '{"can":"Giáp","chi":"Tuất"}');
check("2000 = Canh Thìn", JSON.stringify(computeCanChiNam(2000)) === '{"can":"Canh","chi":"Thìn"}');
check("2026 = Bính Ngọ", JSON.stringify(computeCanChiNam(2026)) === '{"can":"Bính","chi":"Ngọ"}');

console.log("\n=== buildChart CS-013 (Mậu Thìn 1988 nữ giờ Ngọ) ===");
const chart013 = buildChart({
  nam: 1988, thang: 4, ngay: 11, gio: 11, phut: 25,
  gioiTinh: 'nu', tenLabel: 'CS-013', namXem: 2026,
});
check("Cục Mộc Tam", chart013.menh.cuc === "Mộc Tam");
check("Mệnh Dậu", chart013.menh.cungChi === "Dậu");
check("Thân cư Mệnh", chart013.menh.thanCu === "Mệnh");
check("Mệnh chủ Liêm Trinh", chart013.menh.menhChu === "Liêm Trinh");
check("Thân chủ Văn Xương (Thìn VN)", chart013.menh.thanChu === "Văn Xương");
check("Tuần Tuất-Hợi", JSON.stringify([...chart013.tuanTriet.tuan].sort()) === '["Hợi","Tuất"]');
check("Triệt Tí-Sửu", JSON.stringify([...chart013.tuanTriet.triet].sort()) === '["Sửu","Tí"]');
check("Lưu Tuần Dần-Mão", JSON.stringify([...chart013.luuNien.luuTuanTriet.luuTuan].sort()) === '["Dần","Mão"]');
check("Lưu Triệt Thìn-Tỵ", JSON.stringify([...chart013.luuNien.luuTuanTriet.luuTriet].sort()) === '["Thìn","Tỵ"]');
check("ĐH4 Ngọ hiện tại", chart013.daiHan.current?.chi === "Ngọ" && chart013.daiHan.current?.index === 4);
check("Tuổi mụ 39", chart013.menh.currentAge === 39);
check("Năm xem 2026 = Bính Ngọ", chart013.luuNien.canChi.can === "Bính" && chart013.luuNien.canChi.chi === "Ngọ");
check("Sao chủ Cục Tham Lang", chart013.tuVan.saoChuCuc.sao === "Tham Lang");
check("Lai Nhân default = Mệnh", chart013.tuVan.laiNhan.tenCung === "Mệnh");
check("12 cung có đủ", chart013.cung.length === 12);
check("Cung Mệnh idx=0", chart013.cung[0].tenCung === "Mệnh" && chart013.cung[0].chi === "Dậu");
check("Cung Tài Bạch", chart013.cung[8].tenCung === "Tài Bạch");

// Cách cục
const cachCucNames = chart013.cachCuc.map(c => c.ten);
check("Có cách Nhật Lương (Thái Dương + Thiên Lương)", cachCucNames.some(n => n.includes("Nhật Lương")), `got=${JSON.stringify(cachCucNames)}`);

// Cung Mệnh có chính tinh nào?
const menhChinhTinh = chart013.cung[0].chinhTinh.map(c => c.sao);
console.log(`  Mệnh chính tinh: ${menhChinhTinh.join(", ")}`);

// Cung có Tuần
const cungTuan = chart013.cung.filter(c => c.hasTuan).map(c => `${c.tenCung}(${c.chi})`);
console.log(`  Cung có Tuần: ${cungTuan.join(", ")}`);
const cungTriet = chart013.cung.filter(c => c.hasTriet).map(c => `${c.tenCung}(${c.chi})`);
console.log(`  Cung có Triệt: ${cungTriet.join(", ")}`);

console.log("\n=== buildChart CS-015 (Giáp Tuất 1994 nam giờ Sửu) ===");
const chart015 = buildChart({
  nam: 1994, thang: 11, ngay: 19, gio: 2, phut: 0,
  gioiTinh: 'nam', tenLabel: 'CS-015', namXem: 2026,
});
check("Cục Hoả Lục", chart015.menh.cuc === "Hoả Lục");
check("Mệnh Tuất", chart015.menh.cungChi === "Tuất");
check("Thân cư Phúc Đức", chart015.menh.thanCu === "Phúc Đức");
check("Tuần Thân-Dậu (Giáp Tuất tuần)", JSON.stringify([...chart015.tuanTriet.tuan].sort()) === '["Dậu","Thân"]');
check("Triệt Thân-Dậu (Giáp)", JSON.stringify([...chart015.tuanTriet.triet].sort()) === '["Dậu","Thân"]');
check("Tuần-Triệt giáp Thân Dậu", chart015.tuanTriet.giap.length === 2);

console.log("\n=== buildChart CS-016 (Canh Thìn 2000 nữ giờ Tuất 19:45) ===");
const chart016 = buildChart({
  nam: 2000, thang: 3, ngay: 10, gio: 19, phut: 45,
  gioiTinh: 'nu', tenLabel: 'CS-016', namXem: 2026,
});
check("Cục Kim Tứ", chart016.menh.cuc === "Kim Tứ");
check("Mệnh Tỵ", chart016.menh.cungChi === "Tỵ", `got=${chart016.menh.cungChi}`);
check("Sao chủ Cục Vũ Khúc", chart016.tuVan.saoChuCuc.sao === "Vũ Khúc");
// Verify Tử Vi formula bug fix: Kim Tứ + day 5 (lẻ) → backward formula
const tuViChi = chart016.cung.find(c => c.chinhTinh.some(ct => ct.sao === "Tử Vi"))?.chi;
check("Tử Vi ở Tí (Kim Tứ day 5 backward)", tuViChi === "Tí", `got=${tuViChi}`);

console.log("\n=== Markdown export CS-013 ===");
const md = renderMarkdown(chart013);
check("MD có header CS-013", md.includes("# Lá số Tử Vi — CS-013"));
check("MD có Cục Mộc Tam", md.includes("**Cục:** Mộc Tam"));
check("MD có Mệnh Dậu", md.includes("**Cung Mệnh:** Dậu"));
check("MD có 12 cung header", md.includes("### Mệnh"));
check("MD có cung Tài Bạch", md.includes("### Tài Bạch"));
check("MD có Tứ Hoá", md.includes("**Hoá Lộc:**"));
check("MD ĐH hiện tại", md.includes("Đại hạn hiện tại:** ĐH4 Ngọ"));

console.log(`\n${'='.repeat(50)}`);
console.log(`KẾT QUẢ: ${pass}/${pass + fail} PASS${fail > 0 ? `, ${fail} FAIL` : ''}`);
if (fail > 0) process.exit(1);
