// Verify lunar conversion algorithm với 10+ ngày từ vault + Wikipedia.

import { duongToAm, jdFromDate, canChiNam } from '../js/lunar.js';

let pass = 0, fail = 0;
function check(label, cond, info = "") {
  if (cond) { pass++; console.log(`  ✓ ${label}`); }
  else      { fail++; console.log(`  ✗ ${label} ${info}`); }
}

console.log("\n=== JDN sanity ===");
check("JDN(11/4/1988) = 2447263", jdFromDate(11, 4, 1988) === 2447263);
check("JDN(1/1/2000) = 2451545", jdFromDate(1, 1, 2000) === 2451545);
check("JDN(1/1/1900) = 2415021", jdFromDate(1, 1, 1900) === 2415021);

console.log("\n=== Can-Chi năm ===");
check("1900 = Canh Tí", JSON.stringify(canChiNam(1900)) === '{"can":"Canh","chi":"Tí"}');
check("1924 = Giáp Tí", JSON.stringify(canChiNam(1924)) === '{"can":"Giáp","chi":"Tí"}');
check("1988 = Mậu Thìn", JSON.stringify(canChiNam(1988)) === '{"can":"Mậu","chi":"Thìn"}');
check("1990 = Canh Ngọ", JSON.stringify(canChiNam(1990)) === '{"can":"Canh","chi":"Ngọ"}');
check("1994 = Giáp Tuất", JSON.stringify(canChiNam(1994)) === '{"can":"Giáp","chi":"Tuất"}');
check("1999 = Kỷ Mão", JSON.stringify(canChiNam(1999)) === '{"can":"Kỷ","chi":"Mão"}');
check("2000 = Canh Thìn", JSON.stringify(canChiNam(2000)) === '{"can":"Canh","chi":"Thìn"}');
check("2026 = Bính Ngọ", JSON.stringify(canChiNam(2026)) === '{"can":"Bính","chi":"Ngọ"}');

const cases = [
  // CS verifies — đã biết trong vault
  { label: "CS-013 (11/4/1988)", input: [11, 4, 1988],
    expect: { am: { nam: 1988, thang: 2, ngay: 25 },
              ccNam: "Mậu Thìn", ccThang: "Ất Mão", ccNgay: "Bính Thân" } },
  { label: "CS-015 (19/11/1994)", input: [19, 11, 1994],
    expect: { am: { nam: 1994, thang: 10, ngay: 17 },
              ccNam: "Giáp Tuất", ccThang: "Ất Hợi", ccNgay: "Kỷ Dậu" } },
  { label: "CS-016 (10/3/2000)", input: [10, 3, 2000],
    expect: { am: { nam: 2000, thang: 2, ngay: 5 },
              ccNam: "Canh Thìn", ccThang: "Kỷ Mão", ccNgay: "Đinh Mão" } },
  // Famous Vietnamese dates (Wikipedia)
  { label: "Tết 2024 (10/2/2024)", input: [10, 2, 2024],
    expect: { am: { nam: 2024, thang: 1, ngay: 1 }, ccNam: "Giáp Thìn" } },
  { label: "Tết 2026 (17/2/2026)", input: [17, 2, 2026],
    expect: { am: { nam: 2026, thang: 1, ngay: 1 }, ccNam: "Bính Ngọ" } },
  { label: "30/4/1975", input: [30, 4, 1975],
    expect: { am: { nam: 1975, thang: 3, ngay: 20 }, ccNam: "Ất Mão" } },
  { label: "2/9/1945 (Quốc khánh)", input: [2, 9, 1945],
    expect: { am: { nam: 1945, thang: 7, ngay: 26 }, ccNam: "Ất Dậu" } },
];

console.log("\n=== Solar → Lunar (Vietnamese timezone +7) ===");
for (const c of cases) {
  const r = duongToAm({ nam: c.input[2], thang: c.input[1], ngay: c.input[0] });
  const e = c.expect;
  check(`${c.label}: âm ${e.am.ngay}/${e.am.thang}/${e.am.nam}`,
    r.am.ngay === e.am.ngay && r.am.thang === e.am.thang && r.am.nam === e.am.nam,
    `got=${r.am.ngay}/${r.am.thang}/${r.am.nam}`);
  check(`${c.label}: Can-Chi năm ${e.ccNam}`,
    `${r.canChi.nam.can} ${r.canChi.nam.chi}` === e.ccNam,
    `got=${r.canChi.nam.can} ${r.canChi.nam.chi}`);
  if (e.ccThang) {
    check(`${c.label}: Can-Chi tháng ${e.ccThang}`,
      `${r.canChi.thang.can} ${r.canChi.thang.chi}` === e.ccThang,
      `got=${r.canChi.thang.can} ${r.canChi.thang.chi}`);
  }
  if (e.ccNgay) {
    check(`${c.label}: Can-Chi ngày ${e.ccNgay}`,
      `${r.canChi.ngay.can} ${r.canChi.ngay.chi}` === e.ccNgay,
      `got=${r.canChi.ngay.can} ${r.canChi.ngay.chi}`);
  }
}

// Edge: tháng nhuận
console.log("\n=== Tháng nhuận ===");
// Năm 2020 có nhuận tháng 4. Sample: 23/5/2020 = 1/4 nhuận âm
const leap2020 = duongToAm({ nam: 2020, thang: 5, ngay: 23 });
console.log(`  23/5/2020 → âm ${leap2020.am.ngay}/${leap2020.am.thang} ${leap2020.am.isLeap ? "(nhuận)" : ""}`);
check("23/5/2020 là tháng nhuận", leap2020.am.isLeap === true);

// User's input from screenshot — test
console.log("\n=== User input (1/4/1988) ===");
const userTest = duongToAm({ nam: 1988, thang: 4, ngay: 1 });
console.log(`  1/4/1988 → âm ${userTest.am.ngay}/${userTest.am.thang}/${userTest.am.nam} (${userTest.canChi.nam.can} ${userTest.canChi.nam.chi})`);
console.log(`           Can-Chi ngày ${userTest.canChi.ngay.can} ${userTest.canChi.ngay.chi}, Nạp Âm ${userTest.napAm}`);

console.log(`\n${'='.repeat(50)}`);
console.log(`KẾT QUẢ: ${pass}/${pass + fail} PASS${fail > 0 ? `, ${fail} FAIL` : ''}`);
if (fail > 0) process.exit(1);
