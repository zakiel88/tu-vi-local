// than_chu.test.mjs — Golden test Thân Chủ + Mệnh Chủ theo Chi năm.
// Chạy: node tests/than_chu.test.mjs (pattern verify_*.mjs — không có test runner).
//
// QUY TẮC (Vương Đình Chi T1 §1.8.39, khẩu quyết "Tí Ngọ an thân Linh Hoả tu"):
//   Thân Chủ TQ (Trung Châu): Tí → Linh Tinh, Ngọ → Hoả Tinh.
//   Phái VN điều chỉnh khác TQ 3 ô: Tí (Linh→Hoả), Ngọ (Hoả→Xương), Tuất (Xương→Hoả).
//   Sửa 2026-07-16: trước đây THAN_CHU_TQ["Tí"] = "Hoả Tinh" — SAI so với VĐC §1.8.39.
//   Đối chiếu quy tắc "Thân chủ" trong CLAUDE.md (dual-track phái).

import { THAN_CHU_TQ, THAN_CHU_VN, MENH_CHU } from "../js/data.js";

let pass = 0, fail = 0;
const failures = [];
function check(label, expected, actual) {
  const ok = JSON.stringify(expected) === JSON.stringify(actual);
  if (ok) { pass++; console.log(`  ✓ ${label}`); }
  else { fail++; failures.push({ label, expected, actual }); console.log(`  ✗ ${label} — expected=${JSON.stringify(expected)}, actual=${JSON.stringify(actual)}`); }
}

// ============================================================
// a. THAN_CHU_TQ — phái Trung Châu (Vương Đình Chi T1 §1.8.39)
// ============================================================
console.log("\n=== THAN_CHU_TQ (Trung Châu) — 12 chi ===");
const EXPECT_TQ = {
  "Tí": "Linh Tinh",     "Ngọ": "Hoả Tinh",      // ⭐ VĐC §1.8.39: Tí→Linh, Ngọ→Hoả
  "Sửu": "Thiên Tướng",  "Mùi": "Thiên Tướng",
  "Dần": "Thiên Lương",  "Thân": "Thiên Lương",
  "Mão": "Thiên Đồng",   "Dậu": "Thiên Đồng",
  "Thìn": "Văn Xương",   "Tuất": "Văn Xương",     // TQ: Tuất→Văn Xương
  "Tỵ": "Thiên Cơ",      "Hợi": "Thiên Cơ",
};
for (const chi of Object.keys(EXPECT_TQ)) {
  check(`TQ ${chi} → ${EXPECT_TQ[chi]}`, EXPECT_TQ[chi], THAN_CHU_TQ[chi]);
}
check("THAN_CHU_TQ đủ 12 chi", 12, Object.keys(THAN_CHU_TQ).length);

// ============================================================
// b. THAN_CHU_VN — phái VN điều chỉnh (đảo Tí / Ngọ / Tuất so TQ)
// ============================================================
console.log("\n=== THAN_CHU_VN (phái VN) — 12 chi ===");
const EXPECT_VN = {
  "Tí": "Hoả Tinh",      "Ngọ": "Văn Xương",      // ⭐ VN: Tí→Hoả, Ngọ→Văn Xương
  "Sửu": "Thiên Tướng",  "Mùi": "Thiên Tướng",
  "Dần": "Thiên Lương",  "Thân": "Thiên Lương",
  "Mão": "Thiên Đồng",   "Dậu": "Thiên Đồng",
  "Thìn": "Văn Xương",   "Tuất": "Hoả Tinh",      // ⭐ VN: Tuất→Hoả Tinh
  "Tỵ": "Thiên Cơ",      "Hợi": "Thiên Cơ",
};
for (const chi of Object.keys(EXPECT_VN)) {
  check(`VN ${chi} → ${EXPECT_VN[chi]}`, EXPECT_VN[chi], THAN_CHU_VN[chi]);
}
check("THAN_CHU_VN đủ 12 chi", 12, Object.keys(THAN_CHU_VN).length);

// Dị biệt VN vs TQ đúng 3 ô: Tí, Ngọ, Tuất
console.log("\n=== Dị biệt VN vs TQ = đúng 3 ô (Tí, Ngọ, Tuất) ===");
const diff = Object.keys(EXPECT_TQ).filter(chi => THAN_CHU_TQ[chi] !== THAN_CHU_VN[chi]).sort();
check("Dị biệt = [Ngọ, Tuất, Tí]", ["Ngọ", "Tuất", "Tí"], diff);

// ============================================================
// c. MENH_CHU — Mệnh chủ theo Chi năm (12 chi)
// ============================================================
console.log("\n=== MENH_CHU — 12 chi ===");
const EXPECT_MENH = {
  "Tí": "Tham Lang",     "Ngọ": "Phá Quân",
  "Sửu": "Cự Môn",       "Hợi": "Cự Môn",
  "Dần": "Lộc Tồn",      "Tuất": "Lộc Tồn",
  "Mão": "Văn Khúc",     "Dậu": "Văn Khúc",
  "Thìn": "Liêm Trinh",  "Thân": "Liêm Trinh",
  "Tỵ": "Vũ Khúc",       "Mùi": "Vũ Khúc",
};
for (const chi of Object.keys(EXPECT_MENH)) {
  check(`Mệnh Chủ ${chi} → ${EXPECT_MENH[chi]}`, EXPECT_MENH[chi], MENH_CHU[chi]);
}
check("MENH_CHU đủ 12 chi", 12, Object.keys(MENH_CHU).length);

// ============================================================
console.log(`\n${"=".repeat(50)}`);
console.log(`KẾT QUẢ: ${pass}/${pass + fail} PASS${fail > 0 ? `, ${fail} FAIL` : ""}`);
if (fail > 0) {
  console.log("FAILURES:");
  for (const f of failures) console.log(`  - ${f.label}: expected ${JSON.stringify(f.expected)}, got ${JSON.stringify(f.actual)}`);
  process.exit(1);
}
