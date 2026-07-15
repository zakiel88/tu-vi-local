// categorize.test.mjs — Golden test phân loại sao 4 CẤP MÀU (theme chân cơ)
// + xác nhận categorizeStar() editorial KHÔNG đổi.
// Chạy: node tests/categorize.test.mjs

import { categorizeStar, categorizeStar4 } from "../js/engine.js";

let pass = 0, fail = 0;
const failures = [];
function check(label, expected, actual) {
  const ok = JSON.stringify(expected) === JSON.stringify(actual);
  if (ok) { pass++; console.log(`  ✓ ${label}`); }
  else { fail++; failures.push({ label, expected, actual }); console.log(`  ✗ ${label} — expected=${JSON.stringify(expected)}, actual=${JSON.stringify(actual)}`); }
}

// ============================================================
// a. categorizeStar4 — 4 cấp
// ============================================================
console.log("\n=== categorizeStar4: TÀI–QUÝ (vàng/cam) ===");
for (const s of ["Lộc Tồn", "Thiên Mã", "Thiên Khôi", "Thiên Việt", "Thiên Quan", "Thiên Phúc", "Ân Quang", "Thiên Quý", "Tam Thai", "Bát Toạ", "Thai Phụ", "Phong Cáo", "Long Trì", "Phượng Các"]) {
  check(`${s} → taiquy`, "taiquy", categorizeStar4(s));
}

console.log("\n=== categorizeStar4: SÁT (đỏ) ===");
for (const s of ["Kình Dương", "Đà La", "Hoả Tinh", "Linh Tinh", "Địa Không", "Địa Kiếp", "Thiên Hình", "Kiếp Sát", "Thiên Khốc"]) {
  check(`${s} → sat`, "sat", categorizeStar4(s));
}

console.log("\n=== categorizeStar4: CÁT (xanh lá) ===");
for (const s of ["Tả Phụ", "Hữu Bật", "Văn Xương", "Văn Khúc", "Hồng Loan", "Thiên Hỉ", "Đào Hoa", "Hoa Cái", "Thiên Y", "Thiên Tài", "Thiên Thọ"]) {
  check(`${s} → cat`, "cat", categorizeStar4(s));
}

console.log("\n=== categorizeStar4: TẠP (xám/đen) ===");
for (const s of ["Đẩu Quân", "Bác Sĩ", "Không Tồn Tại Tinh"]) {
  check(`${s} → tap`, "tap", categorizeStar4(s));
}

// ============================================================
// b. categorizeStar (editorial) KHÔNG đổi — tài-quý vẫn thuộc "cat"
// ============================================================
console.log("\n=== categorizeStar (editorial) giữ nguyên ===");
check("Lộc Tồn vẫn 'cat' (editorial)", "cat", categorizeStar("Lộc Tồn"));
check("Thiên Khôi vẫn 'cat' (editorial)", "cat", categorizeStar("Thiên Khôi"));
check("Long Trì vẫn 'cat' (editorial)", "cat", categorizeStar("Long Trì"));
check("Kình Dương vẫn 'sat'", "sat", categorizeStar("Kình Dương"));
check("Đẩu Quân vẫn 'le'", "le", categorizeStar("Đẩu Quân"));

// ============================================================
console.log(`\n${"=".repeat(50)}`);
console.log(`KẾT QUẢ: ${pass}/${pass + fail} PASS${fail > 0 ? `, ${fail} FAIL` : ""}`);
if (fail > 0) {
  console.log("FAILURES:");
  for (const f of failures) console.log(`  - ${f.label}: expected ${JSON.stringify(f.expected)}, got ${JSON.stringify(f.actual)}`);
  process.exit(1);
}
