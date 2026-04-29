// cung.js — An 12 cung + Can cung
//
// Quy tắc (theo Section 2 của An Sao Tử Vi - Thuật Toán Đầy Đủ):
// 1. Khởi cung Mệnh:
//    - cung_thang_chi = (Dần + tháng_âm - 1) mod 12
//    - cung_mệnh_chi = (cung_thang_chi - giờ_chi_index + 12) mod 12
// 2. 12 cung đi NGHỊCH chiều kim đồng hồ từ Mệnh
// 3. Can cung: khởi từ Can tháng Giêng (Ngũ Hổ Độn), đếm thuận qua 12 cung Dần→Sửu

import { CAN, CHI, CAN_INDEX, CHI_INDEX, NGU_HO_DON, TEN_CUNG_12 } from './data.js';

/**
 * An vị trí cung Mệnh.
 * @param {number} thangAm 1-12
 * @param {string} chiGio
 * @returns {number} chi index (0-11) của cung Mệnh
 */
export function anCungMenh(thangAm, chiGio) {
  const cungThangChi = (CHI_INDEX["Dần"] + thangAm - 1) % 12;
  const gioIdx = CHI_INDEX[chiGio];
  const cungMenhChi = (cungThangChi - gioIdx + 12) % 12;
  return cungMenhChi;
}

/**
 * An vị trí cung Thân.
 * @param {number} thangAm
 * @param {string} chiGio
 * @returns {number} chi index của cung Thân
 */
export function anCungThan(thangAm, chiGio) {
  const cungThangChi = (CHI_INDEX["Dần"] + thangAm - 1) % 12;
  const gioIdx = CHI_INDEX[chiGio];
  const cungThanChi = (cungThangChi + gioIdx) % 12;
  return cungThanChi;
}

/**
 * An toàn bộ 12 cung từ vị trí Mệnh.
 * 12 cung đi THUẬN theo chi tăng (Mệnh → Phụ Mẫu → Phúc Đức → ...).
 * Verify với CS-013/015/016 chart: chi tăng từ Mệnh.
 * @param {number} cungMenhChi 0-11
 * @returns {Array<{tenCung, chi, chiIdx}>}
 */
export function an12Cung(cungMenhChi) {
  const cung12 = [];
  for (let i = 0; i < 12; i++) {
    // Đi THUẬN từ Mệnh (chi tăng)
    const chiIdx = (cungMenhChi + i) % 12;
    cung12.push({
      tenCung: TEN_CUNG_12[i],
      chi: CHI[chiIdx],
      chiIdx,
    });
  }
  return cung12;
}

/**
 * An Can cung cho 12 cung.
 * @param {string} canNam Can năm sinh
 * @returns {Object<chiIdx, can>} Map từ chi index → Can cung
 */
export function anCanCung(canNam) {
  const canCungDanName = NGU_HO_DON[canNam];   // Can của cung Dần
  const canCungDanIdx = CAN_INDEX[canCungDanName];
  const result = {};
  for (let i = 0; i < 12; i++) {
    const chiIdx = (CHI_INDEX["Dần"] + i) % 12;  // Dần=2, Mão=3, ..., Sửu=1
    result[chiIdx] = CAN[(canCungDanIdx + i) % 10];
  }
  return result;
}

/**
 * Tính Thân cư (1 trong 6 loại).
 * 12 cung đi THUẬN từ Mệnh: cung thứ i có chi = (cungMenh + i) mod 12.
 * Để tìm i từ chiThan: i = (chiThan - cungMenh + 12) mod 12.
 * @param {number} cungMenhChi
 * @param {number} cungThanChi
 * @returns {string} Tên cung Thân cư
 */
export function tinhThanCu(cungMenhChi, cungThanChi) {
  const cungIdx = (cungThanChi - cungMenhChi + 12) % 12;
  return TEN_CUNG_12[cungIdx];
}
