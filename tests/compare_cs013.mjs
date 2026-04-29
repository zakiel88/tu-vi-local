// Deep compare engine output vs CS-013 vault data — check từng sao trong từng cung.
//
// Source vault: vault/01-Lộ Trình Học/Case Studies/CS-013 - Nữ 1988 Mậu Thìn.md
// Section 1 (12 cung) + Section 2 (Tứ Hoá).

import { buildChart } from '../js/engine.js';
import { CHI } from '../js/data.js';

const chart = buildChart({
  nam: 1988, thang: 4, ngay: 11, gio: 11, phut: 25,
  gioiTinh: 'nu', tenLabel: 'CS-013', namXem: 2026,
});

// === Expected positions từ CS-013 vault ===
// Cấu trúc: { cungChi: { stars: ["sao1", "sao2"], notes: "..." } }
const EXPECTED = {
  "Dậu": { // Mệnh
    chinh: ["Thái Dương", "Thiên Lương"],
    must: ["Hữu Bật", "Bát Toạ", "Đào Hoa", "Tử Phù"],   // Tử Phù = vòng Thái Tuế index 5
    notes: "Mệnh + Thân cư · Hoá Khoa Hữu Bật"
  },
  "Tuất": { // Phụ Mẫu
    chinh: ["Thất Sát"],
    must: ["Văn Khúc", "Tuế Phá", "Thiên Hình", "Hỷ Thần"],   // Hỷ Thần = Bác Sĩ index 7 (nghịch)
    tuanban: true,
  },
  "Hợi": { // Phúc Đức
    chinh: ["Thiên Cơ"],
    must: ["Hồng Loan"],
    hoaKy: true,                                           // Hoá Kỵ Thiên Cơ
    tuanban: true,
  },
  "Tí": { // Điền Trạch
    chinh: ["Tử Vi"],
    must: ["Thai Phụ", "Tấu Thư"],                         // Tấu Thư = Bác Sĩ index 5 (nghịch)
    trietban: true,
  },
  "Sửu": { // Quan Lộc
    chinh: [],
    must: ["Thiên Khôi"],
    trietban: true,
  },
  "Dần": { // Nô Bộc
    chinh: ["Phá Quân"],
    must: ["Thiên Mã"],
  },
  "Mão": { // Thiên Di
    chinh: [],
    must: ["Ân Quang", "Thanh Long"],                       // Thanh Long = Bác Sĩ index 2 (nghịch)
  },
  "Thìn": { // Tật Ách
    chinh: ["Liêm Trinh", "Thiên Phủ"],
    must: ["Văn Xương", "Linh Tinh"],
    notes: "Mệnh chủ Liêm Trinh + Thân chủ Văn Xương đồng cung",
  },
  "Tỵ": { // Tài Bạch
    chinh: ["Thái Âm"],
    must: ["Lộc Tồn", "Tả Phụ", "Địa Không", "Địa Kiếp", "Tam Thai", "Bác Sĩ"],
    hoaQuyen: true,                                       // Hoá Quyền Thái Âm
  },
  "Ngọ": { // Tử Tức
    chinh: ["Tham Lang"],
    must: ["Phượng Các", "Kình Dương"],
    hoaLoc: true,                                         // Hoá Lộc Tham Lang
  },
  "Mùi": { // Phu Thê
    chinh: ["Thiên Đồng", "Cự Môn"],
    must: ["Thiên Việt"],
  },
  "Thân": { // Huynh Đệ
    chinh: ["Vũ Khúc", "Thiên Tướng"],
    must: ["Hoả Tinh", "Long Trì", "Phong Cáo"],
  },
};

let passCount = 0, failCount = 0;
const issues = [];

console.log("=" .repeat(80));
console.log(`CS-013 — Nữ Mậu Thìn 1988 giờ Ngọ — Vault vs Engine`);
console.log("=" .repeat(80));

for (const cung of chart.cung) {
  const exp = EXPECTED[cung.chi];
  if (!exp) continue;

  const actualChinh = cung.chinhTinh.map(c => c.sao).sort();
  const expChinh = (exp.chinh || []).sort();
  const actualPhu = new Set(cung.phuTinh);
  const actualVong = new Set(cung.vong.map(v => v.sao));
  const all = new Set([...actualPhu, ...actualVong]);

  console.log(`\n--- ${cung.tenCung} (${cung.chi}) ---`);

  // Chính tinh check
  const chinhMatch = JSON.stringify(actualChinh) === JSON.stringify(expChinh);
  if (chinhMatch) {
    passCount++;
    console.log(`  ✓ Chính tinh: ${actualChinh.join(", ") || "(VCD)"}`);
  } else {
    failCount++;
    issues.push({cung: cung.chi, type: "chinh", expected: expChinh, actual: actualChinh});
    console.log(`  ✗ Chính tinh:`);
    console.log(`      expected: ${expChinh.join(", ") || "(VCD)"}`);
    console.log(`      actual:   ${actualChinh.join(", ") || "(VCD)"}`);
  }

  // Phụ tinh / vòng must-have check
  for (const sao of exp.must || []) {
    if (all.has(sao)) {
      passCount++;
      console.log(`  ✓ ${sao}`);
    } else {
      failCount++;
      issues.push({cung: cung.chi, type: "missing", sao});
      // Tìm xem sao đó hiện đang ở cung nào
      const actualLoc = chart.cung.find(c =>
        c.phuTinh.includes(sao) || c.vong.some(v => v.sao === sao)
      );
      console.log(`  ✗ THIẾU ${sao} (engine để ở: ${actualLoc ? actualLoc.tenCung + "/" + actualLoc.chi : "không có"})`);
    }
  }

  // Tứ Hoá check
  if (exp.hoaLoc && !cung.tuHoa.some(h => h.kind === "loc")) {
    failCount++;
    console.log(`  ✗ THIẾU Hoá Lộc tại đây`);
  } else if (exp.hoaLoc) { passCount++; console.log(`  ✓ Hoá Lộc`); }

  if (exp.hoaQuyen && !cung.tuHoa.some(h => h.kind === "quyen")) {
    failCount++;
    console.log(`  ✗ THIẾU Hoá Quyền tại đây`);
  } else if (exp.hoaQuyen) { passCount++; console.log(`  ✓ Hoá Quyền`); }

  if (exp.hoaKy && !cung.tuHoa.some(h => h.kind === "ky")) {
    failCount++;
    console.log(`  ✗ THIẾU Hoá Kỵ tại đây`);
  } else if (exp.hoaKy) { passCount++; console.log(`  ✓ Hoá Kỵ`); }

  // Tuần / Triệt bản
  if (exp.tuanban !== undefined) {
    if (cung.hasTuan === exp.tuanban) {
      passCount++;
      console.log(`  ✓ Tuần bản = ${exp.tuanban}`);
    } else {
      failCount++;
      console.log(`  ✗ Tuần bản: expected=${exp.tuanban}, actual=${cung.hasTuan}`);
    }
  }
  if (exp.trietban !== undefined) {
    if (cung.hasTriet === exp.trietban) {
      passCount++;
      console.log(`  ✓ Triệt bản = ${exp.trietban}`);
    } else {
      failCount++;
      console.log(`  ✗ Triệt bản: expected=${exp.trietban}, actual=${cung.hasTriet}`);
    }
  }
}

console.log("\n" + "=".repeat(80));
console.log(`KẾT QUẢ: ${passCount}/${passCount + failCount} PASS, ${failCount} FAIL`);

if (failCount > 0) {
  console.log("\nFAILURES summary:");
  for (const i of issues) {
    if (i.type === "missing") {
      console.log(`  - ${i.cung}: thiếu ${i.sao}`);
    } else if (i.type === "chinh") {
      console.log(`  - ${i.cung}: chính tinh expected=${i.expected.join(",")} actual=${i.actual.join(",")}`);
    }
  }
}
