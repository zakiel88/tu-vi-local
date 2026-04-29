// Verify An Hai Phong (Nam Kỷ Mão 1999, sinh 12/7 15:30) — chart từ tuvi.cohoc.net.

import { buildChart } from '../js/engine.js';

const chart = buildChart({
  nam: 1999, thang: 7, ngay: 12, gio: 15, phut: 30,
  gioiTinh: 'nam', tenLabel: 'An Hai Phong', namXem: 2026,
});

// Expected per chart software (right image) — only verifiable items
const EXPECTED = {
  "Tỵ": { chinh: ["Tử Vi","Thất Sát"], must: ["Ân Quang","Thiên Mã","Lực Sĩ","Thiên Y","Thiên Thọ","Phá Toái","Cô Thần","Thiên Diêu","Đà La","Thiên Sứ"] },
  "Ngọ": { chinh: [], must: ["Hữu Bật","Thiếu Âm","Lộc Tồn","Bác Sĩ","Lưu Hà","Âm Sát"] },
  "Mùi": { must: ["Linh Tinh","Long Trì","Phượng Các","Giải Thần","Hoa Cái","Quan Phù","Kình Dương"] },
  "Thân": { must: ["Tả Phụ","Thiên Việt","Nguyệt Đức","Thiên Trù","Tử Phù","Phục Binh","Kiếp Sát"] },
  "Thìn": { chinh: ["Thiên Cơ","Thiên Lương"], must: ["Thiếu Dương","Thanh Long","Thiên Không","Thiên La"] },
  "Dậu": { chinh: ["Liêm Trinh","Phá Quân"], must: ["Thiên Quan","Tuế Phá","Đại Hao","Thiên Hư"] },
  "Mão": { chinh: ["Thiên Tướng"], must: ["Thiên Quý"] },
  "Tuất": { chinh: [], must: ["Phong Cáo","Bệnh Phù","Long Đức","Địa Võng"] },
  "Dần": { chinh: ["Thái Dương","Cự Môn"], must: ["Văn Xương","Bát Toạ","Thiên Phúc","Tướng Quân"] },
  "Sửu": { chinh: ["Vũ Khúc","Tham Lang"], must: ["Tấu Thư","Quả Tú","Thiên Hình"] },
  // Thiên Tài formula uncertain (vault CS-015 vs chart software different — keep CS-015 vault formula)
  "Tí": { chinh: ["Thiên Đồng","Thái Âm"], must: ["Văn Khúc","Tam Thai","Phi Liêm","Thiên Khôi","Đào Hoa","Hồng Loan"] },
  "Hợi": { chinh: ["Thiên Phủ"], must: ["Hỷ Thần","Bạch Hổ","Đường Phù"] },
};

let pass = 0, fail = 0;
const failures = [];
for (const cung of chart.cung) {
  const exp = EXPECTED[cung.chi];
  if (!exp) continue;
  console.log(`\n${cung.tenCung} (${cung.chi}):`);

  if (exp.chinh) {
    const actual = cung.chinhTinh.map(c=>c.sao).sort();
    const expected = exp.chinh.sort();
    if (JSON.stringify(actual) === JSON.stringify(expected)) {
      pass++; console.log(`  ✓ chính: ${actual.join(",") || "VCD"}`);
    } else {
      fail++; failures.push(`${cung.chi} chính: exp=${expected} act=${actual}`);
      console.log(`  ✗ chính: exp=${expected} act=${actual}`);
    }
  }

  const all = new Set([...cung.phuTinh, ...cung.vong.map(v=>v.sao)]);
  for (const sao of (exp.must || [])) {
    if (all.has(sao)) {
      pass++; console.log(`  ✓ ${sao}`);
    } else {
      fail++;
      const loc = chart.cung.find(c => c.phuTinh.includes(sao) || c.vong.some(v=>v.sao===sao));
      failures.push(`${cung.chi} thiếu ${sao} (engine: ${loc?loc.chi:"—"})`);
      console.log(`  ✗ THIẾU ${sao} (engine: ${loc?loc.tenCung+"/"+loc.chi:"—"})`);
    }
  }
}

console.log(`\n${"=".repeat(60)}\nKẾT QUẢ: ${pass}/${pass+fail} PASS, ${fail} FAIL`);
if (fail > 0) {
  console.log("\nFAILURES:");
  failures.forEach(f => console.log("  -", f));
}
