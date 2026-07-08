// calendar.test.mjs — Golden test cho calendar.js (buildMonth/buildDay).
// Chạy: node tests/calendar.test.mjs (theo pattern verify_*.mjs/test_*.mjs hiện có trong repo
// này — không có package.json/test runner, chỉ node ESM script + check() thủ công).
//
// Nguồn đối chiếu:
// - Âm lịch + Can-Chi: cross-check TRỰC TIẾP qua duongToAm() (lunar.js) — không chỉ tin
//   calendar.js một chiều.
// - Tết Bính Ngọ 2026 = 17/2/2026: đã verify trong tests/verify_lunar.mjs (existing, PASS).
// - Nhuận tháng 4/2020 bắt đầu 23/5/2020: đã verify trong tests/verify_lunar.mjs (existing).
// - 24 Tiết Khí tên + thứ tự: vault/02-Quy Tắc/Nền Tảng/Tiết Khí.md.
// - 3 mốc tiết khí đối chiếu qua WebSearch (timeanddate.com, độc lập với công thức trong repo):
//   Xuân Phân 2026 = 20/3/2026 14:46 UTC; Hạ Chí 2026 = 21/6/2026 08:24 UTC (=15:24 giờ VN,
//   buổi chiều — case phát hiện bug lấy mẫu buổi trưa thay vì đầu ngày, đã fix); Đông Chí 2026
//   = 21/12/2026 20:50 UTC (=03:50 22/12 giờ VN).

import { duongToAm } from "../js/lunar.js";
import { buildMonth, buildDay, TRUC_12, TEN_24_TIET_KHI } from "../js/calendar.js";

let pass = 0, fail = 0;
const failures = [];
function check(label, expected, actual) {
  const ok = JSON.stringify(expected) === JSON.stringify(actual);
  if (ok) { pass++; console.log(`  ✓ ${label}`); }
  else { fail++; failures.push({ label, expected, actual }); console.log(`  ✗ ${label} — expected=${JSON.stringify(expected)}, actual=${JSON.stringify(actual)}`); }
}

// ============================================================
// 1. Tháng 1: Tháng 2/2026 — chứa Tết Bính Ngọ (17/2) + Lập Xuân + Vũ Thuỷ
// ============================================================
console.log("\n=== Tháng 2/2026 (Tết + Lập Xuân + Vũ Thuỷ) ===");
const feb2026 = buildMonth(2026, 2);
check("Feb 2026 — 28 ngày (không nhuận dương)", 28, feb2026.days.length);
check("Feb 2026 — thangAm (đại diện ngày 15)", { thang: 12, nam: 2025, nhuan: false, tenThang: "Chạp" }, feb2026.thangAm);

const feb17 = feb2026.days[16]; // ngày 17/2/2026 = mùng 1 Tết Bính Ngọ
const lunarFeb17 = duongToAm({ nam: 2026, thang: 2, ngay: 17 }); // cross-check trực tiếp lunar.js
check("17/2/2026 — âm lịch (cross-check duongToAm)", { nam: 2026, thang: 1, ngay: 1, isLeap: false }, lunarFeb17.am);
check("17/2/2026 — buildMonth.am khớp duongToAm", { ngay: lunarFeb17.am.ngay, thang: lunarFeb17.am.thang, nhuan: lunarFeb17.am.isLeap }, feb17.am);
check("17/2/2026 — Can-Chi ngày (cross-check duongToAm)", lunarFeb17.canChi.ngay, feb17.canChiNgay);
check("17/2/2026 — isHoangDao", true, feb17.isHoangDao);
check("17/2/2026 — truc", "Thành", feb17.truc);

const feb1 = feb2026.days[0];
check("1/2/2026 — am (14 tháng Chạp)", { ngay: 14, thang: 12, nhuan: false }, feb1.am);
check("1/2/2026 — ngayKy Nguyệt Kỵ (âm 14)", ["Nguyệt Kỵ"], feb1.ngayKy);

const feb4 = feb2026.days[3];
check("4/2/2026 — tietKhi Lập Xuân (vault ~4-5/2, WebSearch giờ HĐ độc lập không cần ở đây)", "Lập Xuân", feb4.tietKhi);

const feb5 = feb2026.days[4];
check("5/2/2026 — ngayKy Tam Nương (âm 18)", ["Tam Nương"], feb5.ngayKy);

const feb18 = feb2026.days[17];
check("18/2/2026 — tietKhi Vũ Thuỷ", "Vũ Thuỷ", feb18.tietKhi);

// buildDay đầy đủ cho ngày Tết — kèm canChiThang/canChiNam (không có trong buildMonth per-day)
const tetDay = buildDay(2026, 2, 17);
check("buildDay Tết — canChiThang", { can: "Canh", chi: "Dần" }, tetDay.canChiThang);
check("buildDay Tết — canChiNam Bính Ngọ", { can: "Bính", chi: "Ngọ" }, tetDay.canChiNam);
check("buildDay Tết — gioHoangDao đúng 6 giờ", 6, tetDay.gioHoangDao.length);

// ============================================================
// 2. Tháng nhuận: Tháng 5/2020 — nhuận tháng 4 bắt đầu 23/5 (đã verify verify_lunar.mjs)
// ============================================================
console.log("\n=== Tháng 5/2020 (nhuận tháng 4) ===");
const may2020 = buildMonth(2020, 5);
check("May 2020 — 31 ngày", 31, may2020.days.length);
check("May 2020 — thangAm (đại diện ngày 15, chưa sang nhuận)", { thang: 4, nam: 2020, nhuan: false, tenThang: "Tư" }, may2020.thangAm);

const may22 = may2020.days[21]; // ngày cuối tháng 4 THƯỜNG
const may23 = may2020.days[22]; // ngày đầu tháng 4 NHUẬN — mốc đã verify trong verify_lunar.mjs
check("22/5/2020 — am tháng 4 THƯỜNG, ngày 30 (chưa nhuận)", { ngay: 30, thang: 4, nhuan: false }, may22.am);
check("23/5/2020 — am 1/4 NHUẬN (khớp verify_lunar.mjs)", { ngay: 1, thang: 4, nhuan: true }, may23.am);
const lunarMay23 = duongToAm({ nam: 2020, thang: 5, ngay: 23 });
check("23/5/2020 — cross-check duongToAm isLeap", true, lunarMay23.am.isLeap);

const may20 = may2020.days[19];
check("20/5/2020 — tietKhi Tiểu Mãn", "Tiểu Mãn", may20.tietKhi);

const may25 = may2020.days[24];
check("25/5/2020 — ngayKy Tam Nương (âm 3, trong tháng nhuận)", ["Tam Nương"], may25.ngayKy);

// ============================================================
// 3. Tháng 3: Tháng 12/2026 — Đại Tuyết + Đông Chí (WebSearch verify riêng Đông Chí)
// ============================================================
console.log("\n=== Tháng 12/2026 (Đại Tuyết + Đông Chí) ===");
const dec2026 = buildMonth(2026, 12);
check("Dec 2026 — 31 ngày", 31, dec2026.days.length);

const dec7 = dec2026.days[6];
check("7/12/2026 — tietKhi Đại Tuyết", "Đại Tuyết", dec7.tietKhi);

const dec22 = dec2026.days[21];
check("22/12/2026 — tietKhi Đông Chí (WebSearch: 21/12 20:50 UTC = 03:50 22/12 giờ VN)", "Đông Chí", dec22.tietKhi);
check("22/12/2026 — ngayKy Nguyệt Kỵ (âm 14)", ["Nguyệt Kỵ"], dec22.ngayKy);

// ============================================================
// 4. Tháng bonus: Tháng 3/2026 — Xuân Phân (WebSearch verify độc lập)
// ============================================================
console.log("\n=== Tháng 3/2026 (Xuân Phân — WebSearch verify) ===");
const mar2026 = buildMonth(2026, 3);
const mar20 = mar2026.days[19];
check("20/3/2026 — tietKhi Xuân Phân (WebSearch: 20/3 14:46 UTC = 21:46 giờ VN, cùng ngày)", "Xuân Phân", mar20.tietKhi);

// ============================================================
// 5. Cấu trúc — full year 2026: đủ đúng 24 tiết khí, không trùng, không thiếu
// ============================================================
console.log("\n=== Full year 2026 — 24 tiết khí đầy đủ ===");
const foundTietKhi = [];
for (let m = 1; m <= 12; m++) {
  for (const d of buildMonth(2026, m).days) {
    if (d.tietKhi) foundTietKhi.push(d.tietKhi);
  }
}
check("2026 — đúng 24 lần xuất hiện tiết khí", 24, foundTietKhi.length);
check("2026 — không trùng tên (24 tên khác nhau)", 24, new Set(foundTietKhi).size);
check("2026 — đúng bộ 24 tên chuẩn (không thiếu/thừa)", [...TEN_24_TIET_KHI].sort(), [...foundTietKhi].sort());

// ============================================================
// 6. Cấu trúc — Trực 12 cycle đúng thứ tự qua 12 ngày liên tiếp
// ============================================================
console.log("\n=== Trực 12 — cycle liên tục (Feb 1-12/2026) ===");
const trucSeq = feb2026.days.slice(0, 12).map(d => d.truc);
check("12 ngày liên tiếp — đủ 12 Trực khác nhau", 12, new Set(trucSeq).size);
check("12 ngày liên tiếp — đúng tập TRUC_12", [...TRUC_12].sort(), [...trucSeq].sort());
check("Ngày 13 (Feb 13) lặp lại Trực ngày 1 (chu kỳ 12)", feb2026.days[0].truc, feb2026.days[12].truc);

// ============================================================
// 7. Cấu trúc — Hoàng đạo/Hắc đạo ngày: đúng 6/6 mỗi 12 ngày, complement đúng
// ============================================================
console.log("\n=== Hoàng đạo/Hắc đạo ngày — 6 hoàng + 6 hắc mỗi chu kỳ 12 ngày ===");
const hoangSeq = feb2026.days.slice(0, 12).map(d => d.isHoangDao);
check("12 ngày liên tiếp — đúng 6 ngày hoàng đạo", 6, hoangSeq.filter(Boolean).length);
check("12 ngày liên tiếp — đúng 6 ngày hắc đạo", 6, hoangSeq.filter(v => !v).length);
for (const d of feb2026.days) {
  if (d.isHoangDao === d.isHacDao) { fail++; failures.push({ label: `${d.duong.ngay}/2 isHoangDao/isHacDao không complement`, expected: "khác nhau", actual: `hoang=${d.isHoangDao} hac=${d.isHacDao}` }); }
}
check("Tất cả 28 ngày Feb 2026 — isHoangDao luôn khác isHacDao", true, feb2026.days.every(d => d.isHoangDao !== d.isHacDao));

// ============================================================
// 8. Cấu trúc — giờ hoàng đạo: luôn đúng 6, không trùng chi, toàn bộ tháng
// ============================================================
console.log("\n=== Giờ hoàng đạo — đúng 6 giờ/ngày, không trùng chi (toàn tháng) ===");
const allSixGio = [...feb2026.days, ...may2020.days, ...dec2026.days].every(d => d.gioHoangDao.length === 6 && new Set(d.gioHoangDao.map(g => g.chi)).size === 6);
check("Feb2026+May2020+Dec2026 — mọi ngày đều có đúng 6 giờ HĐ, không trùng chi", true, allSixGio);

const total = pass + fail;
console.log(`\n${"=".repeat(50)}`);
console.log(`KẾT QUẢ: ${pass}/${total} PASS${fail > 0 ? `, ${fail} FAIL` : ""}`);
if (fail > 0) {
  console.log("\nFAILURES:");
  failures.forEach(f => console.log(`  - ${f.label}: expected ${JSON.stringify(f.expected)}, got ${JSON.stringify(f.actual)}`));
  process.exit(1);
}
