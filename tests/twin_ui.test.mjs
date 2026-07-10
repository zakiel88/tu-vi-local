// twin_ui.test.mjs — Golden test cho LỚP UI/logic LÁ SỐ SINH ĐÔI (lập CẢ 2 lá 1 lần).
// Chạy: node tests/twin_ui.test.mjs (pattern verify_*.mjs — node ESM + check() thủ công).
//
// Redesign (user chốt 2026-07-10): panel Nâng cao chỉ còn 1 checkbox "Sinh đôi cùng canh
//   giờ" + 2 ô tên (bé trước / bé sau). Submit → build CẢ 2 lá 1 lần (thuTu 'truoc'/'sau',
//   cungCanh true), lưu cả 2, render bé trước + switcher chuyển giữa 2 chart trong bộ nhớ.
//   Các hàm pure ở js/twin.js phải testable độc lập DOM.

import { buildChart } from "../js/engine.js";
import {
  buildTwinPairInputs, sameBirth, isTwinPairInput, findPairRecord,
} from "../js/twin.js";

let pass = 0, fail = 0;
const failures = [];
function check(label, expected, actual) {
  const ok = JSON.stringify(expected) === JSON.stringify(actual);
  if (ok) { pass++; console.log(`  ✓ ${label}`); }
  else { fail++; failures.push({ label, expected, actual }); console.log(`  ✗ ${label} — expected=${JSON.stringify(expected)}, actual=${JSON.stringify(actual)}`); }
}

const BASE = { nam: 1988, thang: 10, ngay: 5, gio: 23, phut: 55, gioiTinh: "nam", namXem: 2026, tenLabel: null };

// ============================================================
// a. buildTwinPairInputs — sinh cặp input đúng
// ============================================================
console.log("\n=== buildTwinPairInputs ===");
const pair = buildTwinPairInputs(BASE, "Bé An", "Bé Bình");

check("bé trước thuTu='truoc' + cungCanh=true", { thuTu: "truoc", cungCanh: true }, pair.truoc.sinhDoi);
check("bé sau  thuTu='sau'   + cungCanh=true", { thuTu: "sau", cungCanh: true }, pair.sau.sinhDoi);
check("bé trước tenLabel = tên nhập", "Bé An", pair.truoc.tenLabel);
check("bé sau  tenLabel = tên nhập", "Bé Bình", pair.sau.tenLabel);
check("base input KHÔNG bị mutate (không thêm sinhDoi)", undefined, BASE.sinhDoi);
check("giữ nguyên field sinh (ngày/giờ/giới)",
  { nam: 1988, thang: 10, ngay: 5, gio: 23, phut: 55, gioiTinh: "nam" },
  { nam: pair.sau.nam, thang: pair.sau.thang, ngay: pair.sau.ngay, gio: pair.sau.gio, phut: pair.sau.phut, gioiTinh: pair.sau.gioiTinh });

// Tên trống → fallback về tenLabel gốc (hoặc null)
const pairNoName = buildTwinPairInputs({ ...BASE, tenLabel: "Gốc" }, "", "  ");
check("tên trống → fallback tenLabel gốc", "Gốc", pairNoName.truoc.tenLabel);
check("tên chỉ khoảng trắng → fallback tenLabel gốc", "Gốc", pairNoName.sau.tenLabel);

// ============================================================
// b. Integration — feed engine → bé trước = gốc, bé sau = Mệnh lùi 1 cung
// ============================================================
console.log("\n=== Integration engine (cặp lập 1 lần) ===");
const goc = buildChart({ ...BASE });
const chartTruoc = buildChart(pair.truoc);
const chartSau = buildChart(pair.sau);

check("bé trước KHÔNG lùi cung (y hệt gốc — Mệnh tại Dậu)", "Dậu", chartTruoc.menh.cungChi);
check("bé trước sinhDoiLuiCung=false", false, chartTruoc.menh.sinhDoiLuiCung);
check("bé sau LÙI cung → Mệnh tại Thân", "Thân", chartSau.menh.cungChi);
check("bé sau sinhDoiLuiCung=true", true, chartSau.menh.sinhDoiLuiCung);

// ============================================================
// c. sameBirth / isTwinPairInput — nhận diện cặp
// ============================================================
console.log("\n=== sameBirth + isTwinPairInput ===");
check("sameBirth cùng ngày giờ giới → true", true, sameBirth(chartTruoc.input, chartSau.input));
check("sameBirth khác ngày → false", false,
  sameBirth(chartTruoc.input, { ...chartSau.input, ngay: 6 }));

check("cặp truoc↔sau cùng canh → là cặp", true, isTwinPairInput(chartTruoc.input, chartSau.input));
check("cùng thuTu → KHÔNG phải cặp", false, isTwinPairInput(chartTruoc.input, chartTruoc.input));
check("thiếu sinhDoi 1 bên → KHÔNG phải cặp", false,
  isTwinPairInput(chartTruoc.input, goc.input));
check("cungCanh=false → KHÔNG phải cặp", false,
  isTwinPairInput(chartTruoc.input, { ...chartSau.input, sinhDoi: { thuTu: "sau", cungCanh: false } }));

// ============================================================
// d. findPairRecord — tìm lá cặp trong storage list
// ============================================================
console.log("\n=== findPairRecord ===");
const records = [
  { id: 1, label: "Bé An", chart: chartTruoc },
  { id: 2, label: "Bé Bình", chart: chartSau },
  { id: 3, label: "Người khác", chart: goc },
];
check("từ bé trước (id=1) tìm ra bé sau (id=2)", 2,
  findPairRecord(records, chartTruoc, 1)?.id);
check("từ bé sau (id=2) tìm ra bé trước (id=1)", 1,
  findPairRecord(records, chartSau, 2)?.id);
check("lá đơn (không sinhDoi) → null", null,
  findPairRecord(records, goc, 3));
check("không có cặp trong list → null", null,
  findPairRecord([{ id: 9, label: "x", chart: goc }], chartTruoc, 1));

// ============================================================
console.log(`\n${"=".repeat(50)}`);
console.log(`KẾT QUẢ: ${pass}/${pass + fail} PASS${fail > 0 ? `, ${fail} FAIL` : ""}`);
if (fail > 0) {
  console.log("FAILURES:");
  for (const f of failures) console.log(`  - ${f.label}: expected ${JSON.stringify(f.expected)}, got ${JSON.stringify(f.actual)}`);
  process.exit(1);
}
