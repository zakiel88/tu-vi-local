// menh_than_cuc.js — An Mệnh + Thân + Cục + Mệnh chủ + Thân chủ
//
// Sequence:
// 1. Cung Mệnh + Cung Thân (đã có ở cung.js)
// 2. Thân cư = loại trong 6 cung
// 3. Cục = lookup từ Can năm + Chi cung Mệnh (bảng Cục)
// 4. Mệnh chủ = sao theo Chi năm
// 5. Thân chủ = sao theo Chi năm (VN khác TQ)

import {
  CHI, CHI_INDEX,
  CAN_NAM_GROUP, CHI_MENH_PAIR, CUC_TABLE, CUC_INFO,
  MENH_CHU, THAN_CHU_VN, THAN_CHU_TQ,
  SAO_CHU_CUC,
} from './data.js';

/**
 * Tính Cục từ Can năm + Chi cung Mệnh.
 * @param {string} canNam
 * @param {string} chiCungMenh
 * @returns {string} tên Cục (Thuỷ Nhị, Mộc Tam, ...)
 */
export function anCuc(canNam, chiCungMenh) {
  const group = CAN_NAM_GROUP[canNam];
  const pair = CHI_MENH_PAIR[chiCungMenh];
  const cuc = CUC_TABLE[group]?.[pair];
  if (!cuc) {
    throw new Error(`Không tìm thấy Cục cho Can ${canNam} + Chi ${chiCungMenh}`);
  }
  return cuc;
}

/**
 * Get info của Cục: số, ĐH1 tuổi, hành.
 */
export function getCucInfo(cuc) {
  return CUC_INFO[cuc];
}

/**
 * Get Sao chủ Cục (Tử Vân).
 */
export function getSaoChuCuc(cuc) {
  return SAO_CHU_CUC[cuc];
}

/**
 * Mệnh chủ theo Chi năm sinh.
 */
export function getMenhChu(chiNam) {
  return MENH_CHU[chiNam];
}

/**
 * Thân chủ theo Chi năm sinh + phái.
 * @param {string} chiNam
 * @param {"vn" | "tq"} phai
 */
export function getThanChu(chiNam, phai = "vn") {
  return phai === "vn" ? THAN_CHU_VN[chiNam] : THAN_CHU_TQ[chiNam];
}
