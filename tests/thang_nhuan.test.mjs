// thang_nhuan.test.mjs — Golden test cho luật THÁNG NHUẬN 15 NGÀY.
// Chạy: node tests/thang_nhuan.test.mjs (pattern verify_*.mjs — không có test runner,
// chỉ node ESM + check() thủ công như gio_ty_som.test.mjs).
//
// QUY TẮC (chuẩn phổ biến VN — vault 02-Quy Tắc/Trường Hợp Đặc Biệt/Tháng Nhuận Âm Lịch.md):
//   - Sinh tháng X NHUẬN, ngày âm 1–15  → an sao dùng THÁNG X.
//   - Sinh tháng X NHUẬN, ngày âm 16+   → an sao dùng THÁNG X+1 (12 → 1,
//     CHỈ đổi số tháng an sao, KHÔNG đổi năm/can chi năm).
//   - Tháng thường: giữ nguyên số tháng.
//
// Dates verified qua duongToAm (2023 nhuận tháng 2):
//   24/3/2023 dương → âm 3/2 nhuận  (nửa đầu → an sao tháng 2)
//    6/4/2023 dương → âm 16/2 nhuận (nửa sau → an sao tháng 3)

import { buildChart, thangAnSao } from "../js/engine.js";
import { anCungMenh } from "../js/cung.js";
import { tinhChiGio, duongToAm } from "../js/lunar.js";

let pass = 0, fail = 0;
const failures = [];
function check(label, expected, actual) {
  const ok = JSON.stringify(expected) === JSON.stringify(actual);
  if (ok) { pass++; console.log(`  ✓ ${label}`); }
  else { fail++; failures.push({ label, expected, actual }); console.log(`  ✗ ${label} — expected=${JSON.stringify(expected)}, actual=${JSON.stringify(actual)}`); }
}

// ============================================================
// 0. Hàm thuần thangAnSao — luật 15 ngày
// ============================================================
console.log("\n=== Hàm thangAnSao (luật 15 ngày) ===");
check("nhuận ngày 3  → giữ tháng X",       2, thangAnSao({ thang: 2, ngay: 3,  isLeap: true }));
check("nhuận ngày 15 → giữ tháng X",       2, thangAnSao({ thang: 2, ngay: 15, isLeap: true }));
check("nhuận ngày 16 → tháng X+1",         3, thangAnSao({ thang: 2, ngay: 16, isLeap: true }));
check("nhuận ngày 29 → tháng X+1",         3, thangAnSao({ thang: 2, ngay: 29, isLeap: true }));
check("nhuận tháng 12 ngày 20 → tháng 1",  1, thangAnSao({ thang: 12, ngay: 20, isLeap: true }));
check("nhuận tháng 12 ngày 10 → tháng 12", 12, thangAnSao({ thang: 12, ngay: 10, isLeap: true }));
check("THƯỜNG ngày 20 → giữ nguyên",       5, thangAnSao({ thang: 5, ngay: 20, isLeap: false }));
check("THƯỜNG ngày 16 → giữ nguyên",       2, thangAnSao({ thang: 2, ngay: 16, isLeap: false }));

// ============================================================
// a. Case NỬA ĐẦU tháng nhuận (âm 3/2 nhuận) — an sao dùng tháng 2
// ============================================================
console.log("\n=== Nửa đầu: 24/3/2023 (âm 3/2 nhuận) → an sao tháng 2 ===");
const half1 = buildChart({ nam: 2023, thang: 3, ngay: 24, gio: 10, phut: 0, gioiTinh: "nam", namXem: 2026 });
const chiGio1 = tinhChiGio(10, 0);
check("âm thật = 3/2 + isLeap", { ngay: 3, thang: 2, isLeap: true },
  { ngay: half1.lich.am.ngay, thang: half1.lich.am.thang, isLeap: half1.lich.am.isLeap });
check("thangAmAnSao = 2", 2, half1.lich.am.thangAmAnSao);
check("thangNhuanApDung = true", true, half1.lich.am.thangNhuanApDung);
check("Mệnh = anCungMenh(2, chiGio)", anCungMenh(2, chiGio1), half1.menh.cungChiIdx);

// ============================================================
// b. Case NỬA SAU tháng nhuận (âm 16/2 nhuận) — an sao dùng tháng 3
// ============================================================
console.log("\n=== Nửa sau: 6/4/2023 (âm 16/2 nhuận) → an sao tháng 3 ===");
const half2 = buildChart({ nam: 2023, thang: 4, ngay: 6, gio: 10, phut: 0, gioiTinh: "nam", namXem: 2026 });
const chiGio2 = tinhChiGio(10, 0);
check("âm thật = 16/2 + isLeap", { ngay: 16, thang: 2, isLeap: true },
  { ngay: half2.lich.am.ngay, thang: half2.lich.am.thang, isLeap: half2.lich.am.isLeap });
check("thangAmAnSao = 3", 3, half2.lich.am.thangAmAnSao);
check("thangNhuanApDung = true", true, half2.lich.am.thangNhuanApDung);
check("Mệnh = anCungMenh(3, chiGio)", anCungMenh(3, chiGio2), half2.menh.cungChiIdx);
// Mệnh dời đúng 1 cung so với nếu dùng tháng 2 (cùng giờ Tỵ): tháng +1 → Mệnh +1 chi (thuận).
check("Mệnh(nửa sau) = Mệnh(tháng2) + 1 chi", (anCungMenh(2, chiGio2) + 1) % 12, half2.menh.cungChiIdx);

// ============================================================
// c. CONTROL — tháng THƯỜNG không đổi
// ============================================================
console.log("\n=== Control: 15/6/2022 (tháng thường) ===");
const ctrlAm = duongToAm({ nam: 2022, thang: 6, ngay: 15 });
const ctrl = buildChart({ nam: 2022, thang: 6, ngay: 15, gio: 10, phut: 0, gioiTinh: "nam", namXem: 2026 });
const chiGioC = tinhChiGio(10, 0);
check("control isLeap = false", false, ctrl.lich.am.isLeap);
check("control thangNhuanApDung = false", false, ctrl.lich.am.thangNhuanApDung);
check("control thangAmAnSao === tháng thật", ctrl.lich.am.thang, ctrl.lich.am.thangAmAnSao);
check("control Mệnh = anCungMenh(tháng thật, chiGio)",
  anCungMenh(ctrlAm.am.thang, chiGioC), ctrl.menh.cungChiIdx);

// ============================================================
console.log(`\n${"=".repeat(50)}`);
console.log(`KẾT QUẢ: ${pass}/${pass + fail} PASS${fail > 0 ? `, ${fail} FAIL` : ""}`);
if (fail > 0) {
  console.log("FAILURES:");
  for (const f of failures) console.log(`  - ${f.label}: expected ${JSON.stringify(f.expected)}, got ${JSON.stringify(f.actual)}`);
  process.exit(1);
}
