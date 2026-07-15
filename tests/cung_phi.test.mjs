// cung_phi.test.mjs — Golden test Cung Phi (Bát Trạch) + quan hệ ngũ hành Cục↔Mệnh
// + Âm Dương Mệnh lý. Đối chiếu vault `02-Quy Tắc/Nền Tảng/Cung Phi - Bát Trạch.md`.
// Chạy: node tests/cung_phi.test.mjs (pattern verify_*.mjs — node ESM + check() thủ công).

import { anCungPhi, nguHanhRelation, amDuongMenhLy } from "../js/cung_phi.js";
import { buildChart } from "../js/engine.js";

let pass = 0, fail = 0;
const failures = [];
function check(label, expected, actual) {
  const ok = JSON.stringify(expected) === JSON.stringify(actual);
  if (ok) { pass++; console.log(`  ✓ ${label}`); }
  else { fail++; failures.push({ label, expected, actual }); console.log(`  ✗ ${label} — expected=${JSON.stringify(expected)}, actual=${JSON.stringify(actual)}`); }
}

// ============================================================
// a. anCungPhi — golden đối chiếu ví dụ vault §2.2 + §8 (năm < 2000, công thức đơn)
// ============================================================
console.log("\n=== anCungPhi (năm < 2000) ===");
check("Nam 1988 → Chấn (100−88=12 mod9=3)", "Chấn", anCungPhi(1988, "nam").que);
check("Nữ  1988 → Khôn (4+88=92 mod9=2)",   "Khôn", anCungPhi(1988, "nu").que);
check("Nữ  1990 → Tốn (4+90=94 mod9=4)",    "Tốn",  anCungPhi(1990, "nu").que);
check("Nam 1994 → Càn (100−94=6)",          "Càn",  anCungPhi(1994, "nam").que);
check("Nam 1999 → Khảm (100−99=1)",         "Khảm", anCungPhi(1999, "nam").que);
check("Nữ  1999 → Tốn (4+99=103 mod9=4)",   "Tốn",  anCungPhi(1999, "nu").que);

// Số hành + nhóm Đông/Tây kèm theo
check("Nam 1988 Chấn: Mộc / Đông tứ mệnh",
  { hanh: "Mộc", nhom: "Đông tứ mệnh" },
  { hanh: anCungPhi(1988, "nam").hanh, nhom: anCungPhi(1988, "nam").nhom });
check("Nam 1994 Càn: Kim / Tây tứ mệnh",
  { hanh: "Kim", nhom: "Tây tứ mệnh" },
  { hanh: anCungPhi(1994, "nam").hanh, nhom: anCungPhi(1994, "nam").nhom });

// ============================================================
// b. Trung cung (số 5) remap — Nam→Khôn, Nữ→Cấn
// ============================================================
console.log("\n=== Trung cung (5) remap ===");
check("Nam 1995 (100−95=5) → Khôn", "Khôn", anCungPhi(1995, "nam").que);
check("Nữ  1901 (4+1=5)   → Cấn",   "Cấn",  anCungPhi(1901, "nu").que);

// ============================================================
// c. Năm ≥ 2000 — công thức Σ chữ số (vault §2.2 warning box)
// ============================================================
console.log("\n=== anCungPhi (năm ≥ 2000) ===");
check("Nữ  2020 → Khảm (6 + (2+0+2+0=4)=10 mod9=1)", "Khảm", anCungPhi(2020, "nu").que);

// ============================================================
// d. nguHanhRelation — Cục (a) ↔ Mệnh (b)
// ============================================================
console.log("\n=== nguHanhRelation ===");
check("Thuỷ→Mộc = Cục sinh Mệnh", "cuc-sinh-menh", nguHanhRelation("Thuỷ", "Mộc").relation);
check("Mộc→Thuỷ = Mệnh sinh Cục", "menh-sinh-cuc", nguHanhRelation("Mộc", "Thuỷ").relation);
check("Kim→Mộc = Cục khắc Mệnh",  "cuc-khac-menh", nguHanhRelation("Kim", "Mộc").relation);
check("Mộc→Kim = Mệnh khắc Cục",  "menh-khac-cuc", nguHanhRelation("Mộc", "Kim").relation);
check("Thổ→Thổ = đồng hành",      "dong",          nguHanhRelation("Thổ", "Thổ").relation);
check("nhãn Cục sinh Mệnh có mô tả", "Cục sinh Mệnh (Thuỷ sinh Mộc)", nguHanhRelation("Thuỷ", "Mộc").label);

// ============================================================
// e. amDuongMenhLy — Dương Nam / Âm Nữ = thuận lý
// ============================================================
console.log("\n=== amDuongMenhLy ===");
check("Mậu (dương) + Nam → thuận lý", true,  amDuongMenhLy("Mậu", "nam").thuan);
check("Mậu (dương) + Nữ  → nghịch lý", false, amDuongMenhLy("Mậu", "nu").thuan);
check("Ất (âm) + Nữ → thuận lý",       true,  amDuongMenhLy("Ất", "nu").thuan);
check("Ất (âm) + Nam → nghịch lý",     false, amDuongMenhLy("Ất", "nam").thuan);
check("nhãn Dương Nam thuận lý", "Dương Nam · thuận lý", amDuongMenhLy("Mậu", "nam").label);

// ============================================================
// f. Integration — buildChart nhồi menh.cungPhi/amDuongLy/cucMenhLy
// ============================================================
console.log("\n=== Integration buildChart ===");
const chart = buildChart({ nam: 1988, thang: 10, ngay: 5, gio: 10, phut: 0, gioiTinh: "nam", namXem: 2026 });
check("menh.cungPhi.que = Chấn (Mậu Thìn 1988 Nam)", "Chấn", chart.menh.cungPhi.que);
check("menh.cungPhi.nhom = Đông tứ mệnh", "Đông tứ mệnh", chart.menh.cungPhi.nhom);
check("menh.amDuongLy.thuan = true (Mậu dương + Nam)", true, chart.menh.amDuongLy.thuan);
check("menh.cucMenhLy có relation hợp lệ", true,
  ["dong", "cuc-sinh-menh", "menh-sinh-cuc", "cuc-khac-menh", "menh-khac-cuc"].includes(chart.menh.cucMenhLy.relation));
check("menh.cucMenhLy.label không rỗng", true, typeof chart.menh.cucMenhLy.label === "string" && chart.menh.cucMenhLy.label.length > 3);

// ============================================================
console.log(`\n${"=".repeat(50)}`);
console.log(`KẾT QUẢ: ${pass}/${pass + fail} PASS${fail > 0 ? `, ${fail} FAIL` : ""}`);
if (fail > 0) {
  console.log("FAILURES:");
  for (const f of failures) console.log(`  - ${f.label}: expected ${JSON.stringify(f.expected)}, got ${JSON.stringify(f.actual)}`);
  process.exit(1);
}
