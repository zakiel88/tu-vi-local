// tu_van.js — 4 khái niệm phái Tử Vân: Sao chủ Cục, Lai Nhân, Nguyên Thần, Huyền Khí
//
// Status:
//   - Sao chủ Cục: ✅ spec đầy đủ (verify CS-016 Vũ Khúc)
//   - Lai Nhân: ⚠️ chưa có thuật toán → user input thủ công, default = "Mệnh"
//   - Nguyên Thần: ⚠️ giả thuyết = [Mệnh, cung chứa Mệnh chủ]
//   - Huyền Khí: ❌ skip MVP (return null + badge "experimental")

import {
  CHI, CHI_INDEX,
  SAO_CHU_CUC, MENH_CHU, TEN_CUNG_12,
} from './data.js';

/**
 * An Sao chủ Cục.
 * @param {string} cuc tên Cục
 * @param {Object} viTriSao Map sao → chiIdx (cả chính tinh + phụ tinh, vì có Cục dùng Lộc Tồn)
 * @returns {{sao, chiIdx, chi}}
 */
export function anSaoChuCuc(cuc, viTriSao) {
  const sao = SAO_CHU_CUC[cuc];
  if (!sao) {
    throw new Error(`Sao chủ Cục không tìm cho Cục: ${cuc}`);
  }
  const chiIdx = viTriSao[sao];
  if (chiIdx === undefined) {
    throw new Error(`Sao ${sao} không có vị trí trong viTriSao input`);
  }
  return { sao, chiIdx, chi: CHI[chiIdx] };
}

/**
 * Lai Nhân Cung — manual input, default = Mệnh.
 * @param {string|null} laiNhanCung Tên cung (từ TEN_CUNG_12) hoặc null
 * @returns {{tenCung, isManual}}
 */
export function getLaiNhanCung(laiNhanCung = null) {
  if (!laiNhanCung) {
    return { tenCung: "Mệnh", isManual: false, note: "Default — chưa có thuật toán an Lai Nhân." };
  }
  if (!TEN_CUNG_12.includes(laiNhanCung)) {
    throw new Error(`Lai Nhân cung không hợp lệ: ${laiNhanCung}`);
  }
  return { tenCung: laiNhanCung, isManual: true };
}

/**
 * Nguyên Thần — 2 cung cốt lõi.
 * Giả thuyết: [Mệnh, cung chứa Mệnh chủ]. Nếu Mệnh chủ ở chính Mệnh → [Mệnh, đối cung].
 *
 * @param {string} chiNam chi năm sinh
 * @param {number} cungMenhChi 0-11
 * @param {Object} viTriSao Map sao → chiIdx
 * @returns {{cungMenh: {tenCung, chiIdx, chi}, cungThu2: {tenCung, chiIdx, chi}, note}}
 */
export function anNguyenThan(chiNam, cungMenhChi, viTriSao) {
  const menhChu = MENH_CHU[chiNam];
  const menhChuChiIdx = viTriSao[menhChu];

  let cungThu2ChiIdx;
  let note;
  if (menhChuChiIdx === cungMenhChi) {
    cungThu2ChiIdx = (cungMenhChi + 6) % 12;
    note = "Mệnh chủ ở chính Mệnh → cung thứ 2 = đối cung Mệnh.";
  } else {
    cungThu2ChiIdx = menhChuChiIdx;
    note = `Cung thứ 2 = nơi Mệnh chủ ${menhChu} đóng.`;
  }

  // Tính tên cung từ vị trí so với Mệnh
  const tenCungThu2 = TEN_CUNG_12[(cungThu2ChiIdx - cungMenhChi + 12) % 12];

  return {
    cungMenh: { tenCung: "Mệnh", chiIdx: cungMenhChi, chi: CHI[cungMenhChi] },
    cungThu2: { tenCung: tenCungThu2, chiIdx: cungThu2ChiIdx, chi: CHI[cungThu2ChiIdx] },
    note: `${note} (Giả thuyết — cần verify thêm case Tử Vân.)`,
    experimental: true,
  };
}

/**
 * Huyền Khí — placeholder skip MVP.
 * @returns {null}
 */
export function tinhHuyenKhi() {
  return null;
}

/**
 * Tổng hợp 4 khái niệm Tử Vân.
 */
export function anTuVanFull({ cuc, chiNam, cungMenhChi, viTriSao, laiNhanCung = null }) {
  return {
    saoChuCuc: anSaoChuCuc(cuc, viTriSao),
    laiNhan: getLaiNhanCung(laiNhanCung),
    nguyenThan: anNguyenThan(chiNam, cungMenhChi, viTriSao),
    huyenKhi: tinhHuyenKhi(),
  };
}
