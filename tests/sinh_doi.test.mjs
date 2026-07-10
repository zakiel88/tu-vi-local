// sinh_doi.test.mjs — Golden test cho TÍNH NĂNG LÁ SỐ SINH ĐÔI.
// Chạy: node tests/sinh_doi.test.mjs (pattern verify_*.mjs — node ESM + check() thủ công).
//
// QUY TẮC (user chốt 2026-07-10, căn cứ [[Lá Số Sinh Đôi]] — phép "Huynh Đệ làm Mệnh"):
//   - Cùng canh giờ + sinh SAU  → cung Mệnh LÙI 1 CUNG (dời về vị trí Huynh Đệ gốc).
//     12 cung relabel từ Mệnh mới. TOÀN BỘ sao + Cục + Tử Vi + Tứ Hoá + Tuần Triệt
//     GIỮ NGUYÊN vị trí vật lý (không an lại — chỉ xoay nhãn cung chức). Đại hạn khởi
//     lại từ Mệnh mới (số Cục giữ nguyên). Thân dời cùng offset. Mệnh chủ / Thân chủ
//     recompute theo chi cung Mệnh / Thân MỚI.
//   - Sinh TRƯỚC / khác canh giờ / không có field → lá bình thường (y hệt gốc).
//
// Case gốc = Tùng 5/10/1988 23:55 nam (giờ Tý sớm → 6/10, Cục Mộc Tam, Mệnh tại Dậu =
//   Tử Vi + Tham Lang). Huynh Đệ gốc tại Thân (chiIdx 8) = Thiên Cơ + Thái Âm.

import { buildChart } from "../js/engine.js";

let pass = 0, fail = 0;
const failures = [];
function check(label, expected, actual) {
  const ok = JSON.stringify(expected) === JSON.stringify(actual);
  if (ok) { pass++; console.log(`  ✓ ${label}`); }
  else { fail++; failures.push({ label, expected, actual }); console.log(`  ✗ ${label} — expected=${JSON.stringify(expected)}, actual=${JSON.stringify(actual)}`); }
}

const GHI_CHU = "Lá sinh đôi — sinh sau cùng canh giờ: Mệnh lùi 1 cung (cổ pháp, ngoài Trung Châu)";
const BASE = { nam: 1988, thang: 10, ngay: 5, gio: 23, phut: 55, gioiTinh: "nam", namXem: 2026 };

// Bản đồ VỊ TRÍ VẬT LÝ của mọi sao (chính + phụ) theo chiIdx — để so sánh "sao giữ nguyên".
function physicalStarMap(chart) {
  const m = {};
  for (const c of chart.cung) {
    m[c.chiIdx] = {
      chinh: c.chinhTinh.map(s => s.sao).sort(),
      phu: c.phuTinh.map(s => s.sao).sort(),
    };
  }
  return m;
}

// "Phần chính" của lá (loại bỏ input echo + createdAt) — để so control y hệt gốc.
function coreParts(chart) {
  return {
    menh: chart.menh,
    cung: chart.cung,
    cachCuc: chart.cachCuc,
    tuHoa: chart.tuHoa,
    tuanTriet: chart.tuanTriet,
    daiHanAll: chart.daiHan.all,
    daiHanCurrent: chart.daiHan.current,
    luuNien: chart.luuNien,
    tuVan: chart.tuVan,
  };
}

const goc = buildChart({ ...BASE });

// ============================================================
// a. Case DỜI — sinh SAU + cùng canh giờ → Mệnh lùi 1 cung
// ============================================================
console.log("\n=== Case DỜI: sinh sau + cùng canh → Mệnh lùi 1 cung ===");
const twin = buildChart({ ...BASE, sinhDoi: { thuTu: "sau", cungCanh: true } });

check("Mệnh mới tại Thân (Huynh Đệ gốc)", { chi: "Thân", idx: 8 },
  { chi: twin.menh.cungChi, idx: twin.menh.cungChiIdx });
check("Thân dời cùng offset → Thân cung tại chiIdx 8", { chi: "Thân", idx: 8 },
  { chi: twin.menh.thanChi, idx: twin.menh.thanChiIdx });
check("Thân cư = Mệnh (thân trùng mệnh giữ nguyên)", "Mệnh", twin.menh.thanCu);
check("Cục GIỮ NGUYÊN = Mộc Tam / số 3", { cuc: "Mộc Tam", so: 3 },
  { cuc: twin.menh.cuc, so: twin.menh.cucNum });
check("cờ sinhDoiLuiCung = true", true, twin.menh.sinhDoiLuiCung);
check("ghiChu đúng nội dung", GHI_CHU, twin.menh.ghiChu);
check("input.sinhDoi echo giữ nguyên", { thuTu: "sau", cungCanh: true }, twin.input.sinhDoi);

// Mệnh mới = chính tinh VẬT LÝ tại Thân = Thiên Cơ + Thái Âm (Cơ Nguyệt đồng cung).
const menhMoi = twin.cung.find(c => c.isMenh);
check("Mệnh mới đóng tại chiIdx 8", 8, menhMoi.chiIdx);
check("Mệnh mới = Thiên Cơ + Thái Âm (sao vật lý Thân)",
  ["Thiên Cơ", "Thái Âm"].sort(), menhMoi.chinhTinh.map(s => s.sao).sort());

// 14 chính tinh + phụ tinh vị trí VẬT LÝ y hệt lá gốc (chỉ nhãn cung xoay).
check("sao (chính+phụ) giữ NGUYÊN vị trí vật lý toàn bàn",
  physicalStarMap(goc), physicalStarMap(twin));

// Nhãn 12 cung xoay đúng từ Mệnh mới (Thân=Mệnh, Dậu=Phụ Mẫu, Mùi(7)=Huynh Đệ).
const nameAt = (chart, idx) => chart.cung.find(c => c.chiIdx === idx).tenCung;
check("chiIdx 8 (Thân) nhãn = Mệnh", "Mệnh", nameAt(twin, 8));
check("chiIdx 9 (Dậu) nhãn = Phụ Mẫu (was Mệnh)", "Phụ Mẫu", nameAt(twin, 9));
check("chiIdx 10 (Tuất) nhãn = Phúc Đức", "Phúc Đức", nameAt(twin, 10));
check("chiIdx 7 (Mùi) nhãn = Huynh Đệ", "Huynh Đệ", nameAt(twin, 7));

// Đại hạn ĐH1 khởi lại từ Mệnh mới (chiIdx 8), số Cục giữ nguyên → tuổi khởi 3.
check("ĐH1 khởi từ Mệnh mới chiIdx 8 / Thân", { chiIdx: 8, chi: "Thân" },
  { chiIdx: twin.daiHan.all[0].chiIdx, chi: twin.daiHan.all[0].chi });
check("ĐH1 tuổi khởi = 3 (Mộc Tam, chiều thuận như thường)", 3, twin.daiHan.all[0].ageStart);

// Mệnh chủ / Thân chủ recompute theo chi cung Mệnh / Thân MỚI (Thân).
check("Mệnh chủ theo chi mới (Thân) = Liêm Trinh", "Liêm Trinh", twin.menh.menhChu);
check("Thân chủ theo chi mới (Thân) = Thiên Lương (đổi từ Văn Xương)",
  "Thiên Lương", twin.menh.thanChu);
check("gốc Thân chủ vẫn Văn Xương (khác lá dời)", "Văn Xương", goc.menh.thanChu);

// ============================================================
// b. Control — KHÔNG dời cung → y hệt gốc
// ============================================================
console.log("\n=== Control: sinh trước / khác canh / không field → y hệt gốc ===");
const ctrlTruoc = buildChart({ ...BASE, sinhDoi: { thuTu: "truoc", cungCanh: true } });
const ctrlKhac  = buildChart({ ...BASE, sinhDoi: { thuTu: "sau", cungCanh: false } });
const ctrlNone  = buildChart({ ...BASE });

check("sinh trước → sinhDoiLuiCung false", false, ctrlTruoc.menh.sinhDoiLuiCung);
check("khác canh → sinhDoiLuiCung false", false, ctrlKhac.menh.sinhDoiLuiCung);
check("không field → sinhDoiLuiCung false", false, ctrlNone.menh.sinhDoiLuiCung);
check("không field → ghiChu null", null, ctrlNone.menh.ghiChu);

check("control 'trước' phần chính y hệt gốc", coreParts(goc), coreParts(ctrlTruoc));
check("control 'khác canh' phần chính y hệt gốc", coreParts(goc), coreParts(ctrlKhac));
check("control 'không field' phần chính y hệt gốc", coreParts(goc), coreParts(ctrlNone));
check("control 'trước' Mệnh vẫn tại Dậu", "Dậu", ctrlTruoc.menh.cungChi);

// ============================================================
// c. Immutability — không mutate input.sinhDoi
// ============================================================
console.log("\n=== Immutability ===");
const inp = { ...BASE, sinhDoi: { thuTu: "sau", cungCanh: true } };
buildChart(inp);
check("input.sinhDoi không bị mutate", { thuTu: "sau", cungCanh: true }, inp.sinhDoi);

// ============================================================
console.log(`\n${"=".repeat(50)}`);
console.log(`KẾT QUẢ: ${pass}/${pass + fail} PASS${fail > 0 ? `, ${fail} FAIL` : ""}`);
if (fail > 0) {
  console.log("FAILURES:");
  for (const f of failures) console.log(`  - ${f.label}: expected ${JSON.stringify(f.expected)}, got ${JSON.stringify(f.actual)}`);
  process.exit(1);
}
