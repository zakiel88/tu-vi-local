// chinh_tinh.js — An Tử Vi + 14 chính tinh + Miếu Vượng + Cách cục

import {
  CHI, CHI_INDEX,
  BO_TU_VI, BO_THIEN_PHU, CHINH_TINH_14,
  CUC_INFO, MIEU_VUONG_VN, CACH_CUC_DOI,
} from './data.js';

/**
 * An vị trí Tử Vi từ Cục số + Ngày âm.
 * Formula: q = ceil(ngày/cục), b = q*c - ngày, đảm bảo b chẵn.
 *          position = (Dần + (q-1) + b) mod 12.
 * Special: Hoả Lục với day lẻ → backward formula.
 *
 * @param {number} cucNum 2/3/4/5/6
 * @param {number} ngayAm 1-30
 * @returns {number} chi index Tử Vi 0-11
 */
export function anTuVi(cucNum, ngayAm) {
  // Cục chẵn (2/4/6) + ngày lẻ → b LUÔN lẻ → dùng backward formula.
  // Verify: Mộc Tam(3) day 25 → forward; Hoả Lục(6) day 17 → backward;
  //         Kim Tứ(4) day 5 → backward (CS-016 = Tử Vi ở Tí).
  if (cucNum % 2 === 0 && ngayAm % 2 === 1) {
    const q = Math.ceil(ngayAm / cucNum);
    const b = q * cucNum - ngayAm;
    return (CHI_INDEX["Dần"] + (q - 1) - b + 144) % 12;
  }

  // Normal: tăng q cho đến khi b chẵn
  let q = Math.ceil(ngayAm / cucNum);
  let b = q * cucNum - ngayAm;
  while (b % 2 !== 0) {
    q += 1;
    b = q * cucNum - ngayAm;
  }
  return (CHI_INDEX["Dần"] + (q - 1) + b) % 12;
}

/**
 * An 6 sao bộ Tử Vi từ vị trí Tử Vi.
 */
export function anBoTuVi(viTriTuVi) {
  const result = {};
  for (const [sao, offset] of Object.entries(BO_TU_VI)) {
    result[sao] = (viTriTuVi + offset + 12) % 12;
  }
  return result;
}

/**
 * Vị trí Thiên Phủ từ Tử Vi: Thiên Phủ + Tử Vi ≡ 4 (mod 12).
 */
export function anThienPhu(viTriTuVi) {
  return (4 - viTriTuVi + 12) % 12;
}

/**
 * An 8 sao bộ Thiên Phủ từ vị trí Thiên Phủ.
 */
export function anBoThienPhu(viTriThienPhu) {
  const result = {};
  for (const [sao, offset] of Object.entries(BO_THIEN_PHU)) {
    result[sao] = (viTriThienPhu + offset) % 12;
  }
  return result;
}

/**
 * An toàn bộ 14 chính tinh.
 * @param {string} cuc tên Cục
 * @param {number} ngayAm
 * @returns {Object<sao, chiIdx>} Map từ tên sao → chi index
 */
export function an14ChinhTinh(cuc, ngayAm) {
  const cucNum = CUC_INFO[cuc].so;
  const viTriTuVi = anTuVi(cucNum, ngayAm);
  const viTriThienPhu = anThienPhu(viTriTuVi);
  return {
    ...anBoTuVi(viTriTuVi),
    ...anBoThienPhu(viTriThienPhu),
  };
}

/**
 * Tính Miếu Vượng cho 1 sao tại 1 chi (phái VN).
 * @param {string} sao
 * @param {number} chiIdx
 * @returns {string} M / V / Đ / B / H
 */
export function tinhMieuVuong(sao, chiIdx) {
  return MIEU_VUONG_VN[sao]?.[chiIdx] || "-";
}

/**
 * Group 14 chính tinh theo cung + miếu vượng.
 * @param {Object<sao, chiIdx>} chinhTinh
 * @returns {Object<chiIdx, Array<{sao, mieuVuong}>>}
 */
export function groupChinhTinhByCung(chinhTinh) {
  const result = {};
  for (let i = 0; i < 12; i++) result[i] = [];
  for (const [sao, chiIdx] of Object.entries(chinhTinh)) {
    result[chiIdx].push({
      sao,
      mieuVuong: tinhMieuVuong(sao, chiIdx),
    });
  }
  return result;
}

/**
 * Detect cách cục từ chính tinh đồng cung.
 * @param {Object<chiIdx, Array<{sao, mieuVuong}>>} cungChinhTinh
 * @returns {Array<{ten, viTriChi, saoList}>}
 */
export function detectCachCuc(cungChinhTinh) {
  const cachCucs = [];
  for (const [chiIdx, sao] of Object.entries(cungChinhTinh)) {
    if (sao.length !== 2) continue;
    const sao1 = sao[0].sao;
    const sao2 = sao[1].sao;
    // Try both orderings
    const key1 = `${sao1}+${sao2}`;
    const key2 = `${sao2}+${sao1}`;
    const cachCuc = CACH_CUC_DOI[key1] || CACH_CUC_DOI[key2];
    if (cachCuc) {
      cachCucs.push({
        ten: cachCuc,
        viTriChi: CHI[chiIdx],
        chiIdx: parseInt(chiIdx),
        saoList: [sao1, sao2],
      });
    }
  }
  return cachCucs;
}
