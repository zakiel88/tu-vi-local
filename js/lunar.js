// lunar.js — Đổi dương → âm + tính Can Chi
//
// Algorithm: Hồ Ngọc Đức (Ho Ngoc Duc) — chuẩn lịch âm Việt Nam.
// Reference: https://www.informatik.uni-leipzig.de/~duc/amlich/calrules.html
// Timezone mặc định: VN = +7 (khác TQ +8 ở 1 số ngày sóc gần nửa đêm).
//
// Verified against CS-001/013/015/016 + Wikipedia Vietnamese lunar dates.

import {
  CAN, CHI, CAN_INDEX, CHI_INDEX,
  NAP_AM, CHI_GIO, NGU_HO_DON, NGU_THU_DON,
} from './data.js';

const DEFAULT_TZ = 7;   // Vietnam GMT+7

// ============================================================
// Julian Day Number ↔ Gregorian
// ============================================================

/**
 * Convert dương lịch (Gregorian) → JDN.
 * Dùng công thức Gregorian; fallback Julian cho ngày trước 1582-10-15.
 */
function jdFromDate(dd, mm, yy) {
  const a = Math.floor((14 - mm) / 12);
  const y = yy + 4800 - a;
  const m = mm + 12 * a - 3;
  let jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y
           + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  if (jd < 2299161) {
    jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083;
  }
  return jd;
}

/**
 * Convert JDN → Gregorian.
 */
function jdToDate(jd) {
  let a, b, c;
  if (jd > 2299160) {
    a = jd + 32044;
    b = Math.floor((4 * a + 3) / 146097);
    c = a - Math.floor(146097 * b / 4);
  } else {
    b = 0;
    c = jd + 32082;
  }
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor(1461 * d / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const dd = e - Math.floor((153 * m + 2) / 5) + 1;
  const mm = m + 3 - 12 * Math.floor(m / 10);
  const yy = b * 100 + d - 4800 + Math.floor(m / 10);
  return { dd, mm, yy };
}

// ============================================================
// Astronomical helpers (Meeus simplified)
// ============================================================

/**
 * JDN của lần sóc (new moon) thứ k tính từ 1900-01-06 (sóc đầu thế kỷ 20).
 * @param {number} k chỉ số sóc
 * @param {number} timeZone giờ địa phương
 * @returns {number} JDN của ngày sóc (đã shift về timezone)
 */
function getNewMoonDay(k, timeZone) {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const dr = Math.PI / 180;
  let Jd1 = 2415020.75933 + 29.53058868 * k
            + 0.0001178 * T2 - 0.000000155 * T3;
  Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
  const M  = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F  = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
  let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
  C1 -= 0.4068 * Math.sin(Mpr * dr) - 0.0161 * Math.sin(dr * 2 * Mpr);
  C1 -= 0.0004 * Math.sin(dr * 3 * Mpr);
  C1 += 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
  C1 -= 0.0074 * Math.sin(dr * (M - Mpr)) - 0.0004 * Math.sin(dr * (2 * F + M));
  C1 -= 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
  C1 += 0.0010 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));
  let deltat;
  if (T < -11) {
    deltat = 0.001 + 0.000839 * T + 0.0002261 * T2
             - 0.00000845 * T3 - 0.000000081 * T * T3;
  } else {
    deltat = -0.000278 + 0.000265 * T + 0.000262 * T2;
  }
  const JdNew = Jd1 + C1 - deltat;
  return Math.floor(JdNew + 0.5 + timeZone / 24);
}

/**
 * Hoàng kinh mặt trời (sun longitude) tại JDN, chia 30° → 0-11.
 */
function getSunLongitude(jdn, timeZone) {
  const T = (jdn - 2451545.5 - timeZone / 24) / 36525;
  const T2 = T * T;
  const dr = Math.PI / 180;
  const M  = 357.52910 + 35999.05030 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  let DL = (1.914600 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
  DL += (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M)
        + 0.000290 * Math.sin(dr * 3 * M);
  let L = L0 + DL;
  L = L * dr;
  L -= Math.PI * 2 * Math.floor(L / (Math.PI * 2));
  return Math.floor(L / Math.PI * 6);
}

/**
 * JDN ngày đầu của tháng âm 11 (chứa Đông chí) cho 1 năm dương.
 */
function getLunarMonth11(yy, timeZone) {
  const off = jdFromDate(31, 12, yy) - 2415021;
  const k = Math.floor(off / 29.530588853);
  let nm = getNewMoonDay(k, timeZone);
  const sunLong = getSunLongitude(nm, timeZone);
  if (sunLong >= 9) {
    nm = getNewMoonDay(k - 1, timeZone);
  }
  return nm;
}

/**
 * Offset của tháng nhuận trong năm âm có 13 tháng.
 */
function getLeapMonthOffset(a11, timeZone) {
  const k = Math.floor((a11 - 2415021.076998695) / 29.530588853 + 0.5);
  let last = 0;
  let i = 1;
  let arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  do {
    last = arc;
    i++;
    arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  } while (arc !== last && i < 14);
  return i - 1;
}

/**
 * Chuyển dương lịch → âm lịch.
 * @returns {{day, month, year, isLeap}}
 */
function convertSolar2Lunar(dd, mm, yy, timeZone = DEFAULT_TZ) {
  const dayNumber = jdFromDate(dd, mm, yy);
  const k = Math.floor((dayNumber - 2415021.076998695) / 29.530588853);
  let monthStart = getNewMoonDay(k + 1, timeZone);
  if (monthStart > dayNumber) {
    monthStart = getNewMoonDay(k, timeZone);
  }
  let a11 = getLunarMonth11(yy, timeZone);
  let b11 = a11;
  let lunarYear;
  if (a11 >= monthStart) {
    lunarYear = yy;
    a11 = getLunarMonth11(yy - 1, timeZone);
  } else {
    lunarYear = yy + 1;
    b11 = getLunarMonth11(yy + 1, timeZone);
  }
  const lunarDay = dayNumber - monthStart + 1;
  const diff = Math.floor((monthStart - a11) / 29);
  let lunarLeap = false;
  let lunarMonth = diff + 11;
  if (b11 - a11 > 365) {
    const leapMonthDiff = getLeapMonthOffset(a11, timeZone);
    if (diff >= leapMonthDiff) {
      lunarMonth = diff + 10;
      if (diff === leapMonthDiff) {
        lunarLeap = true;
      }
    }
  }
  if (lunarMonth > 12) lunarMonth -= 12;
  if (lunarMonth >= 11 && diff < 4) lunarYear -= 1;
  return { day: lunarDay, month: lunarMonth, year: lunarYear, isLeap: lunarLeap };
}

// ============================================================
// Can-Chi
// ============================================================

/**
 * Can-Chi của năm âm (Tử Vi dùng năm âm).
 * Anchor: 1900 = Canh Tí (canIdx=6, chiIdx=0).
 * Lưu ý: dùng năm ÂM (sau khi convert), không phải năm dương.
 */
export function canChiNam(lunarYear) {
  const offset = lunarYear - 1900;
  const canIdx = ((6 + offset) % 10 + 10) % 10;
  const chiIdx = ((0 + offset) % 12 + 12) % 12;
  return { can: CAN[canIdx], chi: CHI[chiIdx] };
}

/**
 * Can-Chi của tháng âm (Ngũ Hổ Độn từ Can năm).
 */
export function canChiThang(canNam, lunarMonth) {
  const canGiengName = NGU_HO_DON[canNam];
  const canGiengIdx = CAN_INDEX[canGiengName];
  const canIdx = (canGiengIdx + lunarMonth - 1) % 10;
  const chiIdx = (CHI_INDEX["Dần"] + lunarMonth - 1) % 12;
  return { can: CAN[canIdx], chi: CHI[chiIdx] };
}

/**
 * Can-Chi của ngày từ JDN.
 * Anchor: JDN 2415021 (1900-01-01) = Giáp Tuất.
 *  → canIdx = (jdn + 9) % 10
 *  → chiIdx = (jdn + 1) % 12
 */
function canChiNgayFromJdn(jdn) {
  const canIdx = ((jdn + 9) % 10 + 10) % 10;
  const chiIdx = ((jdn + 1) % 12 + 12) % 12;
  return { can: CAN[canIdx], chi: CHI[chiIdx] };
}

// ============================================================
// Public API: duongToAm
// ============================================================

/**
 * Convert dương lịch → âm lịch + tính Can-Chi năm/tháng/ngày + Nạp Âm.
 * @param {object} duongDate { nam, thang, ngay } dương
 * @param {number} timeZone optional, default VN +7
 */
export function duongToAm(duongDate, timeZone = DEFAULT_TZ) {
  const { nam, thang, ngay } = duongDate;
  const lunar = convertSolar2Lunar(ngay, thang, nam, timeZone);
  const jdn = jdFromDate(ngay, thang, nam);

  const ccNam = canChiNam(lunar.year);
  const ccThang = canChiThang(ccNam.can, lunar.month);
  const ccNgay = canChiNgayFromJdn(jdn);
  const napAmKey = `${ccNam.can} ${ccNam.chi}`;

  return {
    am: { nam: lunar.year, thang: lunar.month, ngay: lunar.day, isLeap: lunar.isLeap },
    canChi: { nam: ccNam, thang: ccThang, ngay: ccNgay },
    napAm: NAP_AM[napAmKey] || null,
    jdn,
  };
}

// ============================================================
// Giờ
// ============================================================

/**
 * Tính chi giờ từ giờ + phút (0-23).
 * Lưu ý: 23:00-23:59 = giờ Tí của NGÀY hiện tại (phái VN).
 */
export function tinhChiGio(gio, phut = 0) {
  if (gio === 23 || gio === 0) return "Tí";
  for (const { chi, start, end } of CHI_GIO) {
    if (chi === "Tí") continue;
    if (gio >= start && gio < end) return chi;
  }
  throw new Error(`Invalid hour: ${gio}`);
}

/**
 * Can-Chi giờ từ Can ngày + chi giờ (Ngũ Thử Độn).
 */
export function tinhCanChiGio(canNgay, chiGio) {
  const canTi = NGU_THU_DON[canNgay];
  const canTiIdx = CAN_INDEX[canTi];
  const chiGioIdx = CHI_INDEX[chiGio];
  const canGio = CAN[(canTiIdx + chiGioIdx) % 10];
  return { can: canGio, chi: chiGio };
}

/**
 * Verify Can-Chi tháng (Ngũ Hổ Độn) — dùng cho cross-check.
 */
export function tinhCanChiThang(canNam, thangAm) {
  return canChiThang(canNam, thangAm);
}

// ============================================================
// Âm Dương type
// ============================================================

export function tinhAmDuongType(canNam, gioiTinh) {
  const isCanDuong = ["Giáp", "Bính", "Mậu", "Canh", "Nhâm"].includes(canNam);
  if (gioiTinh === "nam") return isCanDuong ? "duong_nam" : "am_nam";
  return isCanDuong ? "duong_nu" : "am_nu";
}

export function isDaiHanThuan(canNam, gioiTinh) {
  const t = tinhAmDuongType(canNam, gioiTinh);
  return t === "duong_nam" || t === "am_nu";
}

// ============================================================
// Sinh ngoại quốc — convert local datetime → VN datetime
// ============================================================

/**
 * Convert datetime từ múi giờ local sang múi giờ đích.
 * Có thể đổi cả ngày/tháng/năm khi qua nửa đêm.
 * @param {object} dt { nam, thang, ngay, gio, phut }
 * @param {number} fromTZ múi giờ nguồn (vd -10 cho Honolulu)
 * @param {number} toTZ   múi giờ đích (vd +7 cho VN)
 * @returns {object} datetime mới
 */
export function convertTimezone(dt, fromTZ, toTZ) {
  // Tạo Date object: treat input như UTC, rồi shift bằng fromTZ để có true UTC
  const localAsUtcMs = Date.UTC(dt.nam, dt.thang - 1, dt.ngay, dt.gio, dt.phut || 0);
  const trueUtcMs = localAsUtcMs - fromTZ * 3600 * 1000;
  const targetMs = trueUtcMs + toTZ * 3600 * 1000;
  const d = new Date(targetMs);
  return {
    nam:   d.getUTCFullYear(),
    thang: d.getUTCMonth() + 1,
    ngay:  d.getUTCDate(),
    gio:   d.getUTCHours(),
    phut:  d.getUTCMinutes(),
  };
}

/**
 * Tự động convert dương lịch local → âm lịch theo phái.
 * @param {object} dt local datetime { nam, thang, ngay, gio, phut }
 * @param {number} timeZone múi giờ nơi sinh (vd -8 cho US West)
 * @param {"vn"|"local"} school
 *   - "vn": convert giờ về VN (+7) rồi tính âm lịch (default)
 *   - "local": dùng giờ local + lunar table tại múi giờ local
 * @returns {{ duongUsed, lunar }} duongUsed = datetime đã convert (dùng cho engine)
 */
export function resolveBirthDateTime(dt, timeZone = DEFAULT_TZ, school = "vn") {
  if (school === "local") {
    // Dùng giờ local nguyên xi, lunar table theo timezone local
    const lunar = duongToAm(dt, timeZone);
    return { duongUsed: dt, lunar, schoolUsed: "local", tzUsed: timeZone };
  }
  // school = "vn" — convert sang giờ VN, lunar theo VN +7
  if (timeZone === DEFAULT_TZ) {
    // Đã ở VN, không cần convert
    const lunar = duongToAm(dt, DEFAULT_TZ);
    return { duongUsed: dt, lunar, schoolUsed: "vn", tzUsed: DEFAULT_TZ };
  }
  const dtVN = convertTimezone(dt, timeZone, DEFAULT_TZ);
  const lunar = duongToAm(dtVN, DEFAULT_TZ);
  return { duongUsed: dtVN, lunar, schoolUsed: "vn", tzUsed: DEFAULT_TZ, tzOriginal: timeZone };
}

// Re-export raw helpers for tests
export { jdFromDate, jdToDate, convertSolar2Lunar, canChiNgayFromJdn, DEFAULT_TZ };
