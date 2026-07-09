// gio_ty_som.test.mjs — Golden test cho quy tắc "giờ Tý sớm" (23:00–23:59).
// Chạy: node tests/gio_ty_som.test.mjs (pattern verify_*.mjs — không có test runner,
// chỉ node ESM + check() thủ công).
//
// QUY TẮC (Trung Châu / phái cơ sở project): sinh từ 23:00 trở đi → ngày Can-Chi /
// âm lịch tính SANG NGÀY HÔM SAU (ngày cổ điển đổi tại đầu giờ Tý 23:00, không phải 00:00).
//
// Case chính đối chiếu tuvichanco.vn: sinh 23:55 ngày 5/10/1988 dương, nam mệnh →
//   âm 26/8, Can-Chi ngày Giáp Ngọ, giờ Giáp Tí, Cục Mộc Tam, Mệnh tại Dậu = Tử Vi + Tham Lang.

import { buildChart } from "../js/engine.js";
import { resolveBirthDateTime, duongToAm } from "../js/lunar.js";

let pass = 0, fail = 0;
const failures = [];
function check(label, expected, actual) {
  const ok = JSON.stringify(expected) === JSON.stringify(actual);
  if (ok) { pass++; console.log(`  ✓ ${label}`); }
  else { fail++; failures.push({ label, expected, actual }); console.log(`  ✗ ${label} — expected=${JSON.stringify(expected)}, actual=${JSON.stringify(actual)}`); }
}

// ============================================================
// a. Case chính — giờ Tý sớm (23:55) đẩy ngày sang hôm sau
// ============================================================
console.log("\n=== Case chính: 23:55 5/10/1988 nam (giờ Tý sớm) ===");
const main = buildChart({ nam: 1988, thang: 10, ngay: 5, gio: 23, phut: 55, gioiTinh: "nam", namXem: 2026 });
check("âm 26/8", { ngay: 26, thang: 8 }, { ngay: main.lich.am.ngay, thang: main.lich.am.thang });
check("Can-Chi ngày = Giáp Ngọ", { can: "Giáp", chi: "Ngọ" }, { can: main.lich.canChi.ngay.can, chi: main.lich.canChi.ngay.chi });
check("Can-Chi giờ = Giáp Tí", { can: "Giáp", chi: "Tí" }, { can: main.lich.canChi.gio.can, chi: main.lich.canChi.gio.chi });
check("Cục = Mộc Tam", "Mộc Tam", main.menh.cuc);
check("Mệnh tại Dậu", "Dậu", main.menh.cungChi);
// Mệnh (Dậu) có chính tinh VẬT LÝ = Tử Vi + Tham Lang (Tử Tham đồng cung Mão/Dậu).
// Đối cung Thiên Di (Mão) trống — khớp tuvichanco.vn. (Bug cũ: anTuVi lệch 180° cho
// cục lẻ + ngày chẵn như Mộc Tam ngày 26; đã fix trong chinh_tinh.js.)
const dau = main.cung.find(c => c.chi === "Dậu");
const mao = main.cung.find(c => c.chi === "Mão");
check("Mệnh Dậu = Tử Vi + Tham Lang (vật lý)", ["Tham Lang", "Tử Vi"], dau.chinhTinh.map(s => s.sao).sort());
check("đối cung Thiên Di (Mão) trống chính tinh", [], mao.chinhTinh.map(s => s.sao));
check("cờ gioTySom = true trên duongUsed", true, main.lich.duongUsed.gioTySom);
check("duongUsed đẩy sang 6/10/1988", { ngay: 6, thang: 10, nam: 1988 },
  { ngay: main.lich.duongUsed.ngay, thang: main.lich.duongUsed.thang, nam: main.lich.duongUsed.nam });

// ============================================================
// b. Case control — giờ giữa ngày KHÔNG bị đẩy
// ============================================================
console.log("\n=== Case control: 10:xx cùng ngày (không đẩy) ===");
const ctrl = buildChart({ nam: 1988, thang: 10, ngay: 5, gio: 10, phut: 55, gioiTinh: "nam", namXem: 2026 });
check("control âm 25/8 (giữ nguyên ngày)", { ngay: 25, thang: 8 }, { ngay: ctrl.lich.am.ngay, thang: ctrl.lich.am.thang });
check("control gioTySom falsy", false, ctrl.lich.duongUsed.gioTySom === true);
check("control duongUsed vẫn 5/10", { ngay: 5, thang: 10 }, { ngay: ctrl.lich.duongUsed.ngay, thang: ctrl.lich.duongUsed.thang });

// ============================================================
// c. Biên rollover tháng/năm + năm nhuận
// ============================================================
console.log("\n=== Biên: đẩy ngày qua tháng/năm ===");
const nyeve = resolveBirthDateTime({ nam: 2000, thang: 12, ngay: 31, gio: 23, phut: 30 }, 7, "vn");
check("31/12/2000 23:30 → duongUsed 1/1/2001", { ngay: 1, thang: 1, nam: 2001 },
  { ngay: nyeve.duongUsed.ngay, thang: nyeve.duongUsed.thang, nam: nyeve.duongUsed.nam });
check("31/12/2000 23:30 gioTySom = true", true, nyeve.gioTySom);
// lunar phải khớp duongToAm của ngày ĐÃ ĐẨY (1/1/2001)
check("lunar khớp duongToAm(1/1/2001)", duongToAm({ nam: 2001, thang: 1, ngay: 1 }).am, nyeve.lunar.am);

// năm nhuận: 28/2/2000 23:00 → 29/2/2000 (2000 nhuận)
const leap = resolveBirthDateTime({ nam: 2000, thang: 2, ngay: 28, gio: 23, phut: 0 }, 7, "vn");
check("28/2/2000 23h → duongUsed 29/2/2000 (năm nhuận)", { ngay: 29, thang: 2, nam: 2000 },
  { ngay: leap.duongUsed.ngay, thang: leap.duongUsed.thang, nam: leap.duongUsed.nam });

// nhánh "local" cũng phải đẩy
const local = resolveBirthDateTime({ nam: 2000, thang: 12, ngay: 31, gio: 23, phut: 30 }, 7, "local");
check("local branch cũng đẩy → 1/1/2001", { ngay: 1, thang: 1, nam: 2001 },
  { ngay: local.duongUsed.ngay, thang: local.duongUsed.thang, nam: local.duongUsed.nam });

// ============================================================
// d. Immutability — không mutate input
// ============================================================
console.log("\n=== Immutability ===");
const orig = { nam: 1988, thang: 10, ngay: 5, gio: 23, phut: 55 };
resolveBirthDateTime(orig, 7, "vn");
check("input dt không bị mutate", { nam: 1988, thang: 10, ngay: 5, gio: 23, phut: 55 }, orig);

// ============================================================
console.log(`\n${"=".repeat(50)}`);
console.log(`KẾT QUẢ: ${pass}/${pass + fail} PASS${fail > 0 ? `, ${fail} FAIL` : ""}`);
if (fail > 0) {
  console.log("FAILURES:");
  for (const f of failures) console.log(`  - ${f.label}: expected ${JSON.stringify(f.expected)}, got ${JSON.stringify(f.actual)}`);
  process.exit(1);
}
