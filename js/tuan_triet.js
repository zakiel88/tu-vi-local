// tuan_triet.js — An Tuần + Triệt

import { CAN, CHI, CAN_INDEX, CHI_INDEX, TUAN_TABLE, TRIET_TABLE } from './data.js';

/**
 * Tính Tuần (Lục Thập Hoa Giáp) — 2 chi Tuần cho năm sinh.
 * Mỗi tuần khởi từ Giáp X, mỗi tuần 10 năm.
 * Năm sinh ở vị trí canIdx trong tuần → 2 chi không có trong tuần là Tuần.
 * @param {string} canNam
 * @param {string} chiNam
 * @returns {Array<string>} 2 chi Tuần (e.g. ["Tuất", "Hợi"])
 */
export function anTuan(canNam, chiNam) {
  const canIdx = CAN_INDEX[canNam];   // 0-9
  const chiNamIdx = CHI_INDEX[chiNam]; // 0-11
  // Chi của Giáp khởi tuần = chi năm - canIdx
  const chiTuanKhoi = (chiNamIdx - canIdx + 12) % 12;
  return TUAN_TABLE[CHI[chiTuanKhoi]];
}

/**
 * Tính Triệt theo Can năm.
 * @returns {Array<string>} 2 chi Triệt
 */
export function anTriet(canNam) {
  return TRIET_TABLE[canNam];
}

/**
 * Detect Tuần-Triệt giáp (cùng cung).
 * @returns {Array<string>} cung có cả Tuần + Triệt
 */
export function detectTuanTrietGiap(tuanChi, trietChi) {
  return tuanChi.filter(t => trietChi.includes(t));
}
