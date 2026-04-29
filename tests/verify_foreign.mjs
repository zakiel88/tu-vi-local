// Test cases sinh ngoại quốc — verify timezone conversion + 2 phái.

import { convertTimezone, resolveBirthDateTime, duongToAm } from '../js/lunar.js';
import { buildChart } from '../js/engine.js';

let pass = 0, fail = 0;
function check(label, cond, info = "") {
  if (cond) { pass++; console.log(`  ✓ ${label}`); }
  else      { fail++; console.log(`  ✗ ${label} ${info}`); }
}

console.log("\n=== convertTimezone — sanity ===");

// Tokyo +9 23:00 5/1/2024 → VN +7 = 21:00 5/1/2024
let r = convertTimezone({ nam: 2024, thang: 1, ngay: 5, gio: 23, phut: 0 }, 9, 7);
check("Tokyo 23h → VN 21h cùng ngày", r.gio === 21 && r.ngay === 5);

// Honolulu -10 23:30 5/1/2024 → UTC 9:30 6/1 → VN 16:30 6/1
r = convertTimezone({ nam: 2024, thang: 1, ngay: 5, gio: 23, phut: 30 }, -10, 7);
check("Honolulu 23:30 5/1 → VN 16:30 6/1 (qua ngày)", r.gio === 16 && r.phut === 30 && r.ngay === 6);

// LA -8 06:00 1/1/2000 → UTC 14:00 1/1 → VN 21:00 1/1
r = convertTimezone({ nam: 2000, thang: 1, ngay: 1, gio: 6, phut: 0 }, -8, 7);
check("LA 6h 1/1/2000 → VN 21h 1/1/2000", r.gio === 21 && r.ngay === 1 && r.thang === 1);

// LA -8 22:00 31/12/1999 → UTC 6:00 1/1 → VN 13:00 1/1/2000
r = convertTimezone({ nam: 1999, thang: 12, ngay: 31, gio: 22, phut: 0 }, -8, 7);
check("LA 22h 31/12/1999 → VN 13h 1/1/2000 (qua năm)", r.gio === 13 && r.ngay === 1 && r.thang === 1 && r.nam === 2000);

console.log("\n=== resolveBirthDateTime — 2 phái ===");

// CS-013: sinh tại VN +7, không cần convert
const cs013 = { nam: 1988, thang: 4, ngay: 11, gio: 11, phut: 25 };
const cs013vn = resolveBirthDateTime(cs013, 7, "vn");
check("CS-013 VN: không convert", cs013vn.duongUsed.gio === 11);
check("CS-013 VN: âm 25/2", cs013vn.lunar.am.ngay === 25 && cs013vn.lunar.am.thang === 2);

// Fake: cùng năm Mậu Thìn nhưng sinh Tokyo 13:25 (cùng ngày dương tại VN: 11/4 11:25)
// Phái VN: convert 13:25 +9 → UTC 04:25 → VN 11:25 → giống CS-013
const fakeJP = { nam: 1988, thang: 4, ngay: 11, gio: 13, phut: 25 };
const jpVn = resolveBirthDateTime(fakeJP, 9, "vn");
check("Tokyo 13:25 phái VN = giờ VN 11:25", jpVn.duongUsed.gio === 11 && jpVn.duongUsed.phut === 25);
check("Tokyo 13:25 phái VN: âm = CS-013 (25/2)", jpVn.lunar.am.ngay === 25);

// Phái local: dùng giờ Tokyo nguyên + lunar tại Tokyo timezone
const jpLocal = resolveBirthDateTime(fakeJP, 9, "local");
check("Tokyo 13:25 local: giờ giữ nguyên", jpLocal.duongUsed.gio === 13);
// Lunar có thể giống VN vì sóc trăng tháng 4 1988 không gần midnight

console.log("\n=== buildChart — case Mỹ ===");
// Sinh tại LA -8 lúc 22:00 25/3/1990 (Canh Ngọ) — phái VN
const usCase = {
  nam: 1990, thang: 3, ngay: 25, gio: 22, phut: 0,
  gioiTinh: 'nu', tenLabel: 'US-test',
  timeZone: -8, foreignSchool: "vn",
  namXem: 2026,
};
const chartUS = buildChart(usCase);
console.log(`  US case phái VN:`);
console.log(`    Local: 25/3/1990 22:00 (-8)`);
console.log(`    → VN dùng: ${chartUS.lich.duongUsed.ngay}/${chartUS.lich.duongUsed.thang}/${chartUS.lich.duongUsed.nam} ${chartUS.lich.duongUsed.gio}h`);
console.log(`    Âm lịch: ${chartUS.lich.am.ngay}/${chartUS.lich.am.thang}/${chartUS.lich.am.nam} (${chartUS.lich.canChi.nam.can} ${chartUS.lich.canChi.nam.chi})`);
console.log(`    Chi giờ: ${chartUS.lich.chiGio}, Cục: ${chartUS.menh.cuc}, Mệnh: ${chartUS.menh.cungChi}`);
check("US phái VN: tzInfo.converted=true", chartUS.lich.tzInfo.converted === true);
check("US phái VN: original=-8, used=+7", chartUS.lich.tzInfo.original === -8 && chartUS.lich.tzInfo.used === 7);

// Same input, phái local
const chartUSLocal = buildChart({ ...usCase, foreignSchool: "local" });
console.log(`\n  US case phái LOCAL:`);
console.log(`    → giờ dùng: ${chartUSLocal.lich.duongUsed.ngay}/${chartUSLocal.lich.duongUsed.thang} ${chartUSLocal.lich.duongUsed.gio}h (giữ local)`);
console.log(`    Âm lịch: ${chartUSLocal.lich.am.ngay}/${chartUSLocal.lich.am.thang}/${chartUSLocal.lich.am.nam}`);
console.log(`    Chi giờ: ${chartUSLocal.lich.chiGio}, Cục: ${chartUSLocal.menh.cuc}, Mệnh: ${chartUSLocal.menh.cungChi}`);
check("US phái local: dùng giờ 22 nguyên", chartUSLocal.lich.duongUsed.gio === 22);
check("US phái local: Mệnh có thể khác phái VN",
  chartUS.menh.cungChi !== chartUSLocal.menh.cungChi || chartUS.lich.chiGio !== chartUSLocal.lich.chiGio,
  `VN: ${chartUS.menh.cungChi}/${chartUS.lich.chiGio} vs Local: ${chartUSLocal.menh.cungChi}/${chartUSLocal.lich.chiGio}`);

console.log("\n=== buildChart — CS-013 vẫn pass với default tz=+7 ===");
const chartCS013 = buildChart({
  nam: 1988, thang: 4, ngay: 11, gio: 11, phut: 25,
  gioiTinh: 'nu', tenLabel: 'CS-013', namXem: 2026,
  timeZone: 7, foreignSchool: "vn",
});
check("CS-013 tz=7: Cục Mộc Tam", chartCS013.menh.cuc === "Mộc Tam");
check("CS-013 tz=7: Mệnh Dậu", chartCS013.menh.cungChi === "Dậu");
check("CS-013 tz=7: tzInfo.converted=false", chartCS013.lich.tzInfo.converted === false);

console.log(`\n${'='.repeat(50)}`);
console.log(`KẾT QUẢ: ${pass}/${pass + fail} PASS${fail > 0 ? `, ${fail} FAIL` : ''}`);
if (fail > 0) process.exit(1);
