// phu_tinh.js — An ~40 phụ tinh
//
// Lục Cát: Tả Phụ + Hữu Bật + Văn Xương + Văn Khúc + Thiên Khôi + Thiên Việt
// Lục Sát: Kình Dương + Đà La + Hoả Tinh + Linh Tinh + Địa Không + Địa Kiếp
// Sao tài + động: Lộc Tồn + Thiên Mã
// Đào hoa: Hồng Loan + Thiên Hỉ + Đào Hoa + Hoa Cái + Cô Thần + Quả Tú
// Cố định: Thiên Thương (Nô Bộc) + Thiên Sứ (Tật Ách)

import {
  CHI, CHI_INDEX,
  KHOI_VIET, LOC_TON, HOA_TINH_KHOI, LINH_TINH_KHOI,
  THIEN_MA, DAO_HOA, HOA_CAI, CO_THAN_QUA_TU, KIEP_SAT, GIAI_THAN,
  THIEN_QUAN, THIEN_PHUC, LUU_HA, THIEN_TRU,
  getTamHop,
} from './data.js';
import { isDaiHanThuan } from './lunar.js';

const chiIdx = (chi) => CHI_INDEX[chi];

/**
 * An Lục Cát.
 * @returns {Object<sao, chiIdx>}
 */
export function anLucCat({ thangAm, chiGio, canNam }) {
  const gioIdx = CHI_INDEX[chiGio];
  const [khoiChi, vietChi] = KHOI_VIET[canNam];
  return {
    "Tả Phụ":     (CHI_INDEX["Thìn"] + thangAm - 1) % 12,
    "Hữu Bật":    (CHI_INDEX["Tuất"] - thangAm + 1 + 144) % 12,
    "Văn Xương":  (CHI_INDEX["Tuất"] - gioIdx + 144) % 12,
    "Văn Khúc":   (CHI_INDEX["Thìn"] + gioIdx) % 12,
    "Thiên Khôi": chiIdx(khoiChi),
    "Thiên Việt": chiIdx(vietChi),
    "Thiên Quan": chiIdx(THIEN_QUAN[canNam]),
    "Thiên Phúc": chiIdx(THIEN_PHUC[canNam]),
  };
}

/**
 * An Lục Sát.
 * Hoả Tinh + Linh Tinh phụ thuộc Âm Dương Nam Nữ:
 *   - Dương Nam + Âm Nữ (đại hạn THUẬN): Hoả THUẬN giờ, Linh NGHỊCH giờ
 *   - Âm Nam + Dương Nữ (đại hạn NGHỊCH): Hoả NGHỊCH giờ, Linh THUẬN giờ
 * Verify CS-013/015/016 chart software.
 * @returns {Object<sao, chiIdx>}
 */
export function anLucSat({ canNam, chiNam, chiGio, gioiTinh }) {
  const gioIdx = CHI_INDEX[chiGio];
  const locTonChi = chiIdx(LOC_TON[canNam]);
  const tamHop = getTamHop(chiNam);
  const isThuanHL = isDaiHanThuan(canNam, gioiTinh);   // Dương Nam / Âm Nữ → Hoả THUẬN

  const hoaKhoiIdx = chiIdx(HOA_TINH_KHOI[tamHop]);
  const linhKhoiIdx = chiIdx(LINH_TINH_KHOI[tamHop]);

  return {
    "Kình Dương": (locTonChi + 1) % 12,
    "Đà La":      (locTonChi - 1 + 12) % 12,
    "Hoả Tinh":   isThuanHL
      ? (hoaKhoiIdx + gioIdx) % 12
      : (hoaKhoiIdx - gioIdx + 144) % 12,
    "Linh Tinh":  isThuanHL
      ? (linhKhoiIdx - gioIdx + 144) % 12
      : (linhKhoiIdx + gioIdx) % 12,
    "Địa Không":  (CHI_INDEX["Hợi"] - gioIdx + 144) % 12,
    "Địa Kiếp":   (CHI_INDEX["Hợi"] + gioIdx) % 12,
  };
}

/**
 * An sao lẻ quan trọng.
 * @returns {Object<sao, chiIdx>}
 */
export function anSaoLe({ canNam, chiNam, thangAm, ngayAm, chiGio,
                          vanXuongChi, vanKhucChi, taPhuChi, huuBatChi,
                          cungMenhChi, cungThanChi, cungNoBocChi, cungTatAchChi }) {
  const chiNamIdx = CHI_INDEX[chiNam];
  const tamHop = getTamHop(chiNam);
  const [coThanChi, quaTuChi] = CO_THAN_QUA_TU[chiNam];

  return {
    // Sao tài + động
    "Lộc Tồn":     chiIdx(LOC_TON[canNam]),
    "Thiên Mã":    chiIdx(THIEN_MA[tamHop]),

    // Đào hoa + hôn nhân
    "Hồng Loan":   (CHI_INDEX["Mão"] - chiNamIdx + 144) % 12,
    "Thiên Hỉ":    ((CHI_INDEX["Mão"] - chiNamIdx + 144) % 12 + 6) % 12,
    "Đào Hoa":     chiIdx(DAO_HOA[tamHop]),
    "Hoa Cái":     chiIdx(HOA_CAI[tamHop]),
    "Cô Thần":     chiIdx(coThanChi),
    "Quả Tú":      chiIdx(quaTuChi),

    // Cát tạp
    "Tam Thai":    (taPhuChi + ngayAm - 1) % 12,
    "Bát Toạ":     (huuBatChi - ngayAm + 1 + 36) % 12,
    "Ân Quang":    (vanXuongChi + ngayAm - 2 + 144) % 12,
    // Thiên Quý: khởi Văn Khúc, đếm NGHỊCH theo ngày sinh (Tân Biên 1956 + Tử Vi Chân Cơ).
    // Asymmetric với Ân Quang: VK = ngày 1, VK-1 = ngày 2, ... → ngày N = VK - (N-1).
    "Thiên Quý":   (vanKhucChi - ngayAm + 1 + 144) % 12,
    "Long Trì":    (CHI_INDEX["Thìn"] + chiNamIdx) % 12,
    "Phượng Các":  (CHI_INDEX["Tuất"] - chiNamIdx + 144) % 12,
    // Cặp Thai Phụ + Phong Cáo bao quanh Văn Khúc (cách 2 cung mỗi bên)
    // Verified với chart CS-013: Văn Khúc @ Tuất → Thai Phụ @ Tí, Phong Cáo @ Thân.
    "Thai Phụ":    (vanKhucChi + 2) % 12,
    "Phong Cáo":   (vanKhucChi - 2 + 12) % 12,
    // Thiên Tài + Thiên Thọ: khởi cung Mệnh/Thân = chi Tí, đếm thuận chi năm.
    // Verify CS-015 (Mệnh Tuất + Tuất → Thân ✓). An Hai Phong chart software có thể dùng formula khác (uncertain).
    "Thiên Tài":   (cungMenhChi + chiNamIdx) % 12,
    "Thiên Thọ":   (cungThanChi + chiNamIdx) % 12,

    // Sát tạp
    "Thiên Hình":  (CHI_INDEX["Dậu"] + thangAm - 1) % 12,
    "Thiên Diêu":  (CHI_INDEX["Sửu"] + thangAm - 1) % 12,
    // Thiên Y: khởi Sửu (tháng 1 → Sửu, tháng 5 → Tỵ — verify An Hai Phong chart)
    "Thiên Y":     (CHI_INDEX["Sửu"] + thangAm - 1) % 12,
    "Thiên Khốc":  (CHI_INDEX["Ngọ"] - chiNamIdx + 144) % 12,
    "Thiên Hư":    (CHI_INDEX["Ngọ"] + chiNamIdx) % 12,
    "Thiên Không": (chiNamIdx + 1) % 12,
    // Đường Phù — công thức không thống nhất giữa các phần mềm (vault note "uncertain").
    // Verify CS-015 (Lộc Tồn Dần) → Đường Phù @ Mùi → công thức Lộc Tồn + 5.
    "Đường Phù":   (chiIdx(LOC_TON[canNam]) + 5) % 12,

    // === Cát tạp mới ===
    "Thiên Trù":   chiIdx(THIEN_TRU[canNam]),               // theo Can năm
    "Nguyệt Đức":  (chiNamIdx + 5) % 12,                    // chi năm + 5
    "Thiên Đức":   (chiNamIdx + 9) % 12,                    // chi năm + 9

    // === Sát tạp mới ===
    "Lưu Hà":      chiIdx(LUU_HA[canNam]),                  // theo Can năm
    "Âm Sát":      (CHI_INDEX["Dần"] - 2 * (thangAm - 1) + 144) % 12,  // tháng 1 Dần, -2 mỗi tháng
    "Phá Toái":    chiIdx(["Tỵ", "Sửu", "Dậu"][chiNamIdx % 3]),         // chu kỳ Tỵ-Sửu-Dậu
    "Thiên La":    CHI_INDEX["Thìn"],                       // cố định Thìn
    "Địa Võng":    CHI_INDEX["Tuất"],                       // cố định Tuất
    "Kiếp Sát":    chiIdx(KIEP_SAT[tamHop]),                // chi năm tam hợp + 9
    "Giải Thần":   chiIdx(GIAI_THAN[tamHop]),               // chi cuối tam hợp năm

    // Cố định cung
    "Thiên Thương": cungNoBocChi,
    "Thiên Sứ":     cungTatAchChi,
  };
}

/**
 * An toàn bộ phụ tinh.
 * @param {object} input phải có gioiTinh ("nam"|"nu") để Hoả/Linh đúng hướng
 */
export function anToanBoPhuTinh(input) {
  const lucCat = anLucCat(input);
  const lucSat = anLucSat(input);   // anLucSat yêu cầu input.gioiTinh
  const saoLe = anSaoLe({
    ...input,
    vanXuongChi: lucCat["Văn Xương"],
    vanKhucChi: lucCat["Văn Khúc"],
    taPhuChi: lucCat["Tả Phụ"],
    huuBatChi: lucCat["Hữu Bật"],
  });
  return { ...lucCat, ...lucSat, ...saoLe };
}

/**
 * Group phụ tinh theo cung.
 */
export function groupPhuTinhByCung(phuTinh) {
  const result = {};
  for (let i = 0; i < 12; i++) result[i] = [];
  for (const [sao, chiIdx] of Object.entries(phuTinh)) {
    result[chiIdx].push(sao);
  }
  return result;
}
