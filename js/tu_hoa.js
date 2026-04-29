// tu_hoa.js — An Tứ Hoá năm sinh + lưu

import { TU_HOA_VN, TU_HOA_TQ } from './data.js';

/**
 * An Tứ Hoá năm sinh.
 * @param {string} canNam
 * @param {Object} viTriSao Map sao → chiIdx (gồm cả 14 chính tinh + Tả Hữu Xương Khúc)
 * @param {"vn"|"tq"} phai
 * @returns {Object} { hoaLoc, hoaQuyen, hoaKhoa, hoaKy } mỗi cái có { sao, chiIdx }
 */
export function anTuHoa(canNam, viTriSao, phai = "vn") {
  const table = phai === "vn" ? TU_HOA_VN : TU_HOA_TQ;
  const [saoLoc, saoQuyen, saoKhoa, saoKy] = table[canNam];
  return {
    hoaLoc:   { sao: saoLoc, chiIdx: viTriSao[saoLoc] },
    hoaQuyen: { sao: saoQuyen, chiIdx: viTriSao[saoQuyen] },
    hoaKhoa:  { sao: saoKhoa, chiIdx: viTriSao[saoKhoa] },
    hoaKy:    { sao: saoKy, chiIdx: viTriSao[saoKy] },
  };
}

/**
 * Lưu Tứ Hoá theo Can năm xem.
 */
export function anLuuTuHoa(canNamXem, viTriSao, phai = "vn") {
  return anTuHoa(canNamXem, viTriSao, phai);
}
