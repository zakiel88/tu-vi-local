// khoi_viet.test.mjs — Golden test An Thiên Khôi / Thiên Việt theo Can năm.
// Chạy: node tests/khoi_viet.test.mjs (pattern verify_*.mjs — không có test runner).
//
// QUY TẮC (Vương Đình Chi T1 §1.8.13, dị bản "庚辛逢馬虎" — Canh Tân gặp Mã Hổ):
//   Canh & Tân đều an Thiên Khôi tại Ngọ (Mã), Thiên Việt tại Dần (Hổ).
//   Sửa 2026-07-14: trước đây engine an Tân = Khôi Dần / Việt Ngọ (đảo) — SAI so với VĐC.
//   Đối chiếu note vault "Thiên Khôi - Thiên Việt".

import { KHOI_VIET } from "../js/data.js";
import { buildChart } from "../js/engine.js";

let pass = 0, fail = 0;
const failures = [];
function check(label, expected, actual) {
  const ok = JSON.stringify(expected) === JSON.stringify(actual);
  if (ok) { pass++; console.log(`  ✓ ${label}`); }
  else { fail++; failures.push({ label, expected, actual }); console.log(`  ✗ ${label} — expected=${JSON.stringify(expected)}, actual=${JSON.stringify(actual)}`); }
}

// ============================================================
// a. Bảng KHOI_VIET trực tiếp — [Khôi_chi, Việt_chi]
// ============================================================
console.log("\n=== Bảng KHOI_VIET (data.js) ===");
check("Tân → Khôi Ngọ, Việt Dần (VĐC §1.8.13)", ["Ngọ", "Dần"], KHOI_VIET["Tân"]);
check("Canh → Khôi Ngọ, Việt Dần (giữ nguyên)", ["Ngọ", "Dần"], KHOI_VIET["Canh"]);
check("Giáp → Khôi Sửu, Việt Mùi (giữ nguyên)", ["Sửu", "Mùi"], KHOI_VIET["Giáp"]);
check("Mậu → Khôi Sửu, Việt Mùi", ["Sửu", "Mùi"], KHOI_VIET["Mậu"]);
check("Ất → Khôi Tí, Việt Thân", ["Tí", "Thân"], KHOI_VIET["Ất"]);
check("Nhâm → Khôi Mão, Việt Tỵ", ["Mão", "Tỵ"], KHOI_VIET["Nhâm"]);

// ============================================================
// b. End-to-end qua buildChart — sao rơi vào đúng cung chi
// ============================================================
const chiCua = (chart, sao) => chart.cung.find(c => (c.phuTinh || []).includes(sao))?.chi;

console.log("\n=== buildChart: Tân Mùi 1991 (nam giờ Mão) ===");
const tan = buildChart({ nam: 1991, thang: 5, ngay: 10, gio: 6, phut: 0, gioiTinh: "nam", namXem: 2026 });
check("năm = Tân", "Tân", tan.lich.canChi.nam.can);
check("Thiên Khôi tại Ngọ", "Ngọ", chiCua(tan, "Thiên Khôi"));
check("Thiên Việt tại Dần", "Dần", chiCua(tan, "Thiên Việt"));

console.log("\n=== buildChart: Canh Thìn 2000 (nữ giờ Mão) — giữ nguyên ===");
const canh = buildChart({ nam: 2000, thang: 5, ngay: 10, gio: 6, phut: 0, gioiTinh: "nu", namXem: 2026 });
check("năm = Canh", "Canh", canh.lich.canChi.nam.can);
check("Thiên Khôi tại Ngọ", "Ngọ", chiCua(canh, "Thiên Khôi"));
check("Thiên Việt tại Dần", "Dần", chiCua(canh, "Thiên Việt"));

console.log("\n=== buildChart: Giáp Tuất 1994 (nam giờ Mão) — giữ nguyên ===");
const giap = buildChart({ nam: 1994, thang: 5, ngay: 10, gio: 6, phut: 0, gioiTinh: "nam", namXem: 2026 });
check("năm = Giáp", "Giáp", giap.lich.canChi.nam.can);
check("Thiên Khôi tại Sửu", "Sửu", chiCua(giap, "Thiên Khôi"));
check("Thiên Việt tại Mùi", "Mùi", chiCua(giap, "Thiên Việt"));

// ============================================================
console.log(`\n${"=".repeat(50)}`);
console.log(`KẾT QUẢ: ${pass}/${pass + fail} PASS${fail > 0 ? `, ${fail} FAIL` : ""}`);
if (fail > 0) {
  console.log("FAILURES:");
  for (const f of failures) console.log(`  - ${f.label}: expected ${JSON.stringify(f.expected)}, got ${JSON.stringify(f.actual)}`);
  process.exit(1);
}
