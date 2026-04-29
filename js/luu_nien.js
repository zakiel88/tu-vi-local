// luu_nien.js — An lưu niên (năm xem)
//
// Bao gồm:
//   - Lưu Thái Tuế = Chi năm xem (luôn ở chi đó)
//   - Lưu Tứ Hoá = Tứ Hoá theo Can năm xem
//   - Lưu Tuần - Lưu Triệt = tính theo Can-Chi năm xem
//   - Lưu Lộc Tồn / Kình / Đà / Khôi / Việt / Xương / Khúc / Hồng Loan / Thiên Hỉ / Thiên Mã
//   - Lưu vòng Thái Tuế (12 sao quay theo Chi năm xem)
//   - Tam Tai (3 năm hạn theo tam hợp Chi năm sinh)

import {
  CHI, CHI_INDEX,
  LOC_TON, KHOI_VIET, THIEN_MA,
  LUU_XUONG_KHUC, TAM_TAI_TABLE,
  SAO_VONG_THAI_TUE,
  getTamHop,
} from './data.js';
import { anTuHoa } from './tu_hoa.js';
import { anTuan, anTriet } from './tuan_triet.js';

const idx = (chi) => CHI_INDEX[chi];

/**
 * An lưu Tứ Hoá theo Can năm xem.
 * @param {string} canNamXem
 * @param {Object} viTriSao Map sao → chiIdx
 * @param {"vn"|"tq"} phai
 */
export function anLuuTuHoa(canNamXem, viTriSao, phai = "vn") {
  return anTuHoa(canNamXem, viTriSao, phai);
}

/**
 * An lưu Tuần + Triệt theo Can-Chi năm xem.
 * @returns {{luuTuan: string[], luuTriet: string[]}}
 */
export function anLuuTuanTriet(canNamXem, chiNamXem) {
  return {
    luuTuan: anTuan(canNamXem, chiNamXem),
    luuTriet: anTriet(canNamXem),
  };
}

/**
 * An ~12 sao lưu (Lộc Tồn, Kình, Đà, Khôi, Việt, Xương, Khúc, Hồng Loan,
 * Thiên Hỉ, Thiên Mã + 5 sao vòng Thái Tuế hay dùng).
 * @param {string} canNamXem
 * @param {string} chiNamXem
 * @returns {Object<sao, chiIdx>}
 */
export function anSaoLuu(canNamXem, chiNamXem) {
  const chiNamXemIdx = idx(chiNamXem);
  const tamHop = getTamHop(chiNamXem);

  const locTonChi = idx(LOC_TON[canNamXem]);
  const [khoiChi, vietChi] = KHOI_VIET[canNamXem];
  const [xuongChi, khucChi] = LUU_XUONG_KHUC[canNamXem];
  const thienMaChi = idx(THIEN_MA[tamHop]);

  return {
    "L.Lộc Tồn":   locTonChi,
    "L.Kình Dương": (locTonChi + 1) % 12,
    "L.Đà La":      (locTonChi - 1 + 12) % 12,
    "L.Thiên Khôi": idx(khoiChi),
    "L.Thiên Việt": idx(vietChi),
    "L.Văn Xương":  idx(xuongChi),
    "L.Văn Khúc":   idx(khucChi),
    "L.Thiên Mã":   thienMaChi,
    // Hồng Loan/Hỉ lưu = same formula như bản
    "L.Hồng Loan":  (CHI_INDEX["Mão"] - chiNamXemIdx + 144) % 12,
    "L.Thiên Hỉ":   ((CHI_INDEX["Mão"] - chiNamXemIdx + 144) % 12 + 6) % 12,

    // Vòng Thái Tuế lưu (5 sao quan trọng — bộ này thường dùng đọc lưu)
    "L.Thái Tuế":   chiNamXemIdx,
    "L.Tang Môn":   (chiNamXemIdx + 2) % 12,
    "L.Quan Phù":   (chiNamXemIdx + 4) % 12,
    "L.Tuế Phá":    (chiNamXemIdx + 6) % 12,
    "L.Bạch Hổ":    (chiNamXemIdx + 8) % 12,
    "L.Điếu Khách": (chiNamXemIdx + 10) % 12,
  };
}

/**
 * An đầy đủ 12 sao vòng Thái Tuế lưu (nếu cần đầy đủ).
 */
export function anLuuVongThaiTue(chiNamXem) {
  const start = CHI_INDEX[chiNamXem];
  const result = {};
  for (let i = 0; i < 12; i++) {
    result["L." + SAO_VONG_THAI_TUE[i]] = (start + i) % 12;
  }
  return result;
}

/**
 * Check năm xem có phải Tam Tai cho người sinh chiNamSinh.
 * @returns {boolean}
 */
export function isTamTaiYear(chiNamSinh, chiNamXem) {
  const tamHop = getTamHop(chiNamSinh);
  return TAM_TAI_TABLE[tamHop].includes(chiNamXem);
}

/**
 * Tổng hợp lưu niên 1 năm xem.
 * @param {string} canNamXem
 * @param {string} chiNamXem
 * @param {string} chiNamSinh
 * @param {Object} viTriSao Map sao → chiIdx (cho lưu Tứ Hoá)
 */
export function anLuuNien(canNamXem, chiNamXem, chiNamSinh, viTriSao, phai = "vn") {
  return {
    canChiNamXem: { can: canNamXem, chi: chiNamXem },
    luuThaiTue: { chiIdx: CHI_INDEX[chiNamXem], chi: chiNamXem },
    luuTuHoa: anLuuTuHoa(canNamXem, viTriSao, phai),
    luuTuanTriet: anLuuTuanTriet(canNamXem, chiNamXem),
    saoLuu: anSaoLuu(canNamXem, chiNamXem),
    isTamTai: isTamTaiYear(chiNamSinh, chiNamXem),
  };
}
