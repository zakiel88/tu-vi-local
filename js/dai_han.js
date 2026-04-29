// dai_han.js — An Đại hạn (10 năm/cung) + Tiểu hạn (1 năm/cung) + Tứ Hoá đại hạn
//
// Đại hạn:
//   - ĐH1 đóng cung Mệnh, tuổi khởi = số Cục
//   - Mỗi ĐH = 10 năm, di chuyển 1 cung
//   - Dương Nam + Âm Nữ → THUẬN (chi tăng); Âm Nam + Dương Nữ → NGHỊCH
//
// Tiểu hạn:
//   - Khởi cung theo tam hợp Chi năm sinh (4 nhóm)
//   - Nam THUẬN, Nữ NGHỊCH; tuổi 1 ở khởi cung
//
// Tứ Hoá ĐH = anTuHoa(canCungDaiHan) — bộ Tứ Hoá riêng cho mỗi 10 năm.

import {
  CHI, CHI_INDEX,
  CUC_INFO, TIEU_HAN_KHOI,
  getTamHop,
} from './data.js';
import { anTuHoa } from './tu_hoa.js';

/**
 * An 12 đại hạn từ cung Mệnh.
 * @param {string} cuc tên Cục
 * @param {number} cungMenhChi 0-11
 * @param {boolean} isThuan
 * @param {number} currentAge tuổi hiện tại để mark isCurrent
 * @returns {Array<{index, chiIdx, chi, ageStart, ageEnd, isCurrent}>}
 */
export function anDaiHan(cuc, cungMenhChi, isThuan, currentAge) {
  const cucNum = CUC_INFO[cuc].so;
  const result = [];
  for (let i = 0; i < 12; i++) {
    const chiIdx = isThuan
      ? (cungMenhChi + i) % 12
      : (cungMenhChi - i + 144) % 12;
    const ageStart = cucNum + i * 10;
    const ageEnd = ageStart + 9;
    result.push({
      index: i + 1,
      chiIdx,
      chi: CHI[chiIdx],
      ageStart,
      ageEnd,
      isCurrent: currentAge >= ageStart && currentAge <= ageEnd,
    });
  }
  return result;
}

/**
 * Tìm Đại hạn hiện tại từ tuổi.
 * @returns {{index, chiIdx, chi, ageStart, ageEnd} | null}
 */
export function timDaiHanHienTai(daiHans) {
  return daiHans.find(dh => dh.isCurrent) || null;
}

/**
 * An Tiểu hạn theo tuổi.
 * @param {string} chiNam chi năm sinh
 * @param {string} gioiTinh "nam" / "nu"
 * @param {number} age tuổi (≥1)
 * @returns {{chiIdx, chi}}
 */
export function anTieuHan(chiNam, gioiTinh, age) {
  const tamHop = getTamHop(chiNam);
  const khoiChi = TIEU_HAN_KHOI[tamHop];
  const start = CHI_INDEX[khoiChi];
  const isThuan = gioiTinh === "nam";
  const offset = (age - 1) % 12;   // tuổi 1 ở khởi cung
  const chiIdx = isThuan
    ? (start + offset) % 12
    : (start - offset + 144) % 12;
  return { chiIdx, chi: CHI[chiIdx] };
}

/**
 * An Tứ Hoá đại hạn = Tứ Hoá theo Can cung đại hạn.
 * @param {string} canCungDaiHan
 * @param {Object} viTriSao Map sao → chiIdx (cùng input như anTuHoa)
 * @param {"vn"|"tq"} phai
 * @returns {{hoaLoc, hoaQuyen, hoaKhoa, hoaKy}}
 */
export function anTuHoaDaiHan(canCungDaiHan, viTriSao, phai = "vn") {
  return anTuHoa(canCungDaiHan, viTriSao, phai);
}
