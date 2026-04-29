// Deep compare engine output vs CS-013/015/016 vault data.
// Source: vault/01-Lộ Trình Học/Case Studies/CS-013/015/016 — section 1 (12 cung) + section 2 (Tứ Hoá).

import { buildChart } from '../js/engine.js';
import { CHI } from '../js/data.js';

let totalPass = 0, totalFail = 0;
const allIssues = [];

function runCase(name, input, expected) {
  console.log("\n" + "=".repeat(78));
  console.log(`${name} — ${input.tenLabel}`);
  console.log("=".repeat(78));

  const chart = buildChart(input);
  let pass = 0, fail = 0;
  const issues = [];

  for (const cung of chart.cung) {
    const exp = expected[cung.chi];
    if (!exp) continue;

    const actualChinh = [...cung.chinhTinh].map(c => c.sao).sort();
    const expChinh = [...(exp.chinh || [])].sort();
    const all = new Set([...cung.phuTinh, ...cung.vong.map(v => v.sao)]);

    console.log(`\n  ${cung.tenCung} (${cung.chi}):`);

    // Chính tinh
    const chinhMatch = JSON.stringify(actualChinh) === JSON.stringify(expChinh);
    if (chinhMatch) {
      pass++;
      console.log(`    ✓ chính: ${actualChinh.join(", ") || "VCD"}`);
    } else {
      fail++;
      issues.push(`${cung.chi} chính: exp=[${expChinh}] act=[${actualChinh}]`);
      console.log(`    ✗ chính: exp=[${expChinh.join(",")}] act=[${actualChinh.join(",")}]`);
    }

    // Phụ tinh + vòng
    for (const sao of exp.must || []) {
      if (all.has(sao)) {
        pass++;
      } else {
        fail++;
        const loc = chart.cung.find(c =>
          c.phuTinh.includes(sao) || c.vong.some(v => v.sao === sao)
        );
        issues.push(`${cung.chi} thiếu ${sao} (engine: ${loc ? loc.chi : "—"})`);
        console.log(`    ✗ THIẾU ${sao} (engine: ${loc ? loc.tenCung + "/" + loc.chi : "—"})`);
      }
    }

    // Tứ Hoá
    for (const k of ["loc", "quyen", "khoa", "ky"]) {
      const expHas = exp["hoa" + k.charAt(0).toUpperCase() + k.slice(1)];
      if (expHas === undefined) continue;
      const actualHas = cung.tuHoa.some(h => h.kind === k);
      if (expHas === actualHas) pass++;
      else { fail++; issues.push(`${cung.chi} hoa-${k}: exp=${expHas} act=${actualHas}`); }
    }

    // Tuần / Triệt
    for (const f of ["tuanban", "trietban"]) {
      const expV = exp[f];
      if (expV === undefined) continue;
      const actV = f === "tuanban" ? cung.hasTuan : cung.hasTriet;
      if (expV === actV) pass++;
      else { fail++; issues.push(`${cung.chi} ${f}: exp=${expV} act=${actV}`); }
    }
  }

  console.log(`\n  → ${pass}/${pass + fail} PASS`);
  totalPass += pass; totalFail += fail;
  if (fail > 0) allIssues.push({ case: name, issues });
}

// ============ CS-013 ============
runCase("CS-013", {
  nam: 1988, thang: 4, ngay: 11, gio: 11, phut: 25,
  gioiTinh: 'nu', tenLabel: 'Nữ Mậu Thìn 1988', namXem: 2026,
}, {
  "Dậu": { chinh: ["Thái Dương","Thiên Lương"], must: ["Hữu Bật","Bát Toạ","Đào Hoa","Tử Phù"] },
  "Tuất": { chinh: ["Thất Sát"], must: ["Văn Khúc","Tuế Phá","Thiên Hình","Hỷ Thần"], tuanban: true },
  "Hợi": { chinh: ["Thiên Cơ"], must: ["Hồng Loan"], hoaKy: true, tuanban: true },
  "Tí": { chinh: ["Tử Vi"], must: ["Thai Phụ","Tấu Thư"], trietban: true },
  "Sửu": { chinh: [], must: ["Thiên Khôi"], trietban: true },
  "Dần": { chinh: ["Phá Quân"], must: ["Thiên Mã"] },
  "Mão": { chinh: [], must: ["Ân Quang","Thanh Long"] },
  "Thìn": { chinh: ["Liêm Trinh","Thiên Phủ"], must: ["Văn Xương","Linh Tinh"] },
  "Tỵ": { chinh: ["Thái Âm"], must: ["Lộc Tồn","Tả Phụ","Địa Không","Địa Kiếp","Tam Thai","Bác Sĩ"], hoaQuyen: true },
  "Ngọ": { chinh: ["Tham Lang"], must: ["Phượng Các","Kình Dương"], hoaLoc: true },
  "Mùi": { chinh: ["Thiên Đồng","Cự Môn"], must: ["Thiên Việt"] },
  "Thân": { chinh: ["Vũ Khúc","Thiên Tướng"], must: ["Hoả Tinh","Long Trì","Phong Cáo"] },
});

// ============ CS-015 ============
runCase("CS-015", {
  nam: 1994, thang: 11, ngay: 19, gio: 2, phut: 0,
  gioiTinh: 'nam', tenLabel: 'Nam Giáp Tuất 1994', namXem: 2026,
}, {
  "Tuất": { chinh: ["Thiên Đồng"] },
  "Hợi": { chinh: ["Vũ Khúc","Phá Quân"], must: ["Thiên Hỉ"], hoaQuyen: true, hoaKhoa: true },
  // Tí — Phúc Đức Thân cư — chart không list chi tiết section 1.3, skip
  "Sửu": { chinh: ["Thiên Phủ"], must: ["Tả Phụ","Hữu Bật","Thiên Khôi","Đà La"] },
  "Dần": { chinh: ["Thiên Cơ","Thái Âm"], must: ["Lộc Tồn","Hoả Tinh","Linh Tinh"] },
  "Mão": { chinh: ["Tử Vi","Tham Lang"], must: ["Kình Dương","Đào Hoa"] },
  "Thìn": { chinh: ["Cự Môn"], must: ["Tuế Phá","Thiên Hư","Thanh Long"] },
  "Tỵ": { chinh: ["Thiên Tướng"], must: ["Văn Khúc","Hồng Loan","Tam Thai"] },
  "Ngọ": { chinh: ["Thiên Lương"], must: ["Bạch Hổ","Tướng Quân","Thiên Hình"] },
  "Mùi": { chinh: ["Liêm Trinh","Thất Sát"], must: ["Tấu Thư","Đường Phù","Quả Tú","Thai Phụ","Thiên Việt"], hoaLoc: true },
  "Thân": { chinh: [], must: ["Thiên Mã","Điếu Khách","Thiên Tài","Phi Liêm","Thiên Khốc"], tuanban: true, trietban: true },
  "Dậu": { chinh: [], must: ["Văn Xương","Hỷ Thần","Bát Toạ","Thiên Phúc","Trực Phù"], tuanban: true, trietban: true },
});

// ============ CS-016 ============
runCase("CS-016", {
  nam: 2000, thang: 3, ngay: 10, gio: 19, phut: 45,
  gioiTinh: 'nu', tenLabel: 'Nữ Canh Thìn 2000', namXem: 2026,
}, {
  "Tỵ": { chinh: ["Thái Âm"], hoaKhoa: true },
  "Ngọ": { chinh: ["Tham Lang"], must: ["Thanh Long","Thiên Khôi","Tang Môn"], trietban: true },
  "Mùi": { chinh: ["Thiên Đồng","Cự Môn"], must: ["Đà La","Thiếu Âm","Lực Sĩ"], hoaKy: true, trietban: true },
  // Quan Phủ vault sec 1.4 ghi @ Thân nhưng đó là vault typo (Quan Phủ ở Bác Sĩ index 11, cách 11 → Dậu)
  "Thân": { chinh: ["Vũ Khúc","Thiên Tướng"], must: ["Lộc Tồn","Bác Sĩ","Linh Tinh"], hoaQuyen: true },
  "Dậu": { chinh: ["Thái Dương","Thiên Lương"], must: ["Kình Dương","Địa Kiếp","Tam Thai","Hữu Bật","Đào Hoa"], hoaLoc: true, tuanban: true },
  "Tuất": { chinh: ["Thất Sát"], must: ["Tuế Phá","Thiên Hình","Thiên Hư","Thiên Thương"] },
  "Hợi": { chinh: ["Thiên Cơ"], must: ["Hồng Loan","Long Đức"] },
  "Tí": { chinh: ["Tử Vi"], must: ["Văn Xương"] },
  // Sửu — Tài Bạch Thân cư — chart không chi tiết section 1.9
  "Dần": { chinh: ["Phá Quân"], must: ["Văn Khúc","Thiên Mã","Thiên Việt","Điếu Khách","Thiên Khốc"] },
  "Mão": { chinh: [], must: ["Trực Phù","Tấu Thư","Ân Quang"] },
  "Thìn": { chinh: ["Liêm Trinh","Thiên Phủ"], must: ["Thái Tuế","Hoả Tinh"] },
});

console.log("\n" + "=".repeat(78));
console.log(`TỔNG: ${totalPass}/${totalPass + totalFail} PASS, ${totalFail} FAIL`);
if (allIssues.length > 0) {
  console.log("\nFAILURES BY CASE:");
  for (const c of allIssues) {
    console.log(`\n  ${c.case}:`);
    c.issues.forEach(i => console.log(`    - ${i}`));
  }
}
if (totalFail > 0) process.exit(1);
