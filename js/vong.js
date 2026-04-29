// vong.js — An 3 vòng: Thái Tuế, Bác Sĩ, Trường Sinh
//
// 1. Vòng Thái Tuế (12 sao theo CHI NĂM SINH) — luôn THUẬN từ Thái Tuế = chi năm sinh.
// 2. Vòng Bác Sĩ (12 sao theo LỘC TỒN + Âm Dương Nam/Nữ).
//    - Dương Nam + Âm Nữ → đếm THUẬN
//    - Âm Nam + Dương Nữ → đếm NGHỊCH
// 3. Vòng Trường Sinh (12 sao theo CỤC + Âm Dương Nam/Nữ) — same chiều như Bác Sĩ.

import {
  CHI, CHI_INDEX,
  SAO_VONG_THAI_TUE, SAO_VONG_BAC_SI, SAO_VONG_TRUONG_SINH,
  TRUONG_SINH_KHOI,
} from './data.js';

/**
 * An vòng Thái Tuế (12 sao) — luôn THUẬN từ chi năm sinh.
 * @param {string} chiNam
 * @returns {Object<sao, chiIdx>}
 */
export function anVongThaiTue(chiNam) {
  const start = CHI_INDEX[chiNam];
  const result = {};
  for (let i = 0; i < 12; i++) {
    result[SAO_VONG_THAI_TUE[i]] = (start + i) % 12;
  }
  return result;
}

/**
 * An vòng Bác Sĩ (12 sao).
 * @param {number} locTonChiIdx vị trí Lộc Tồn (0-11)
 * @param {boolean} isThuan Dương Nam / Âm Nữ → THUẬN
 * @returns {Object<sao, chiIdx>}
 */
export function anVongBacSi(locTonChiIdx, isThuan) {
  const result = {};
  for (let i = 0; i < 12; i++) {
    const chiIdx = isThuan
      ? (locTonChiIdx + i) % 12
      : (locTonChiIdx - i + 144) % 12;
    result[SAO_VONG_BAC_SI[i]] = chiIdx;
  }
  return result;
}

/**
 * An vòng Trường Sinh (12 sao).
 * @param {string} cuc tên Cục
 * @param {boolean} isThuan Dương Nam / Âm Nữ → THUẬN
 * @returns {Object<sao, chiIdx>}
 */
export function anVongTruongSinh(cuc, isThuan) {
  const khoiChi = TRUONG_SINH_KHOI[cuc];
  if (!khoiChi) {
    throw new Error(`Trường Sinh khởi không tìm cho Cục: ${cuc}`);
  }
  const start = CHI_INDEX[khoiChi];
  const result = {};
  for (let i = 0; i < 12; i++) {
    const chiIdx = isThuan
      ? (start + i) % 12
      : (start - i + 144) % 12;
    result[SAO_VONG_TRUONG_SINH[i]] = chiIdx;
  }
  return result;
}

/**
 * Determine isThuan cho vòng Bác Sĩ + Trường Sinh.
 * Dương Nam + Âm Nữ → THUẬN
 * Âm Nam + Dương Nữ → NGHỊCH
 */
export function isVongThuan(canNam, gioiTinh) {
  const isCanDuong = ["Giáp", "Bính", "Mậu", "Canh", "Nhâm"].includes(canNam);
  return (isCanDuong && gioiTinh === "nam") || (!isCanDuong && gioiTinh === "nu");
}

/**
 * Group 3 vòng theo cung.
 * @returns {Object<chiIdx, Array<{sao, vong}>>}
 */
export function groupVongByCung(vongThaiTue, vongBacSi, vongTruongSinh) {
  const result = {};
  for (let i = 0; i < 12; i++) result[i] = [];
  for (const [sao, chiIdx] of Object.entries(vongThaiTue)) {
    result[chiIdx].push({ sao, vong: "Thái Tuế" });
  }
  for (const [sao, chiIdx] of Object.entries(vongBacSi)) {
    result[chiIdx].push({ sao, vong: "Bác Sĩ" });
  }
  for (const [sao, chiIdx] of Object.entries(vongTruongSinh)) {
    result[chiIdx].push({ sao, vong: "Trường Sinh" });
  }
  return result;
}
