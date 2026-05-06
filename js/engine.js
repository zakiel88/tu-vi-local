// engine.js — Orchestrator: input dương lịch + giới tính → chart JSON đầy đủ.

import { duongToAm, tinhChiGio, tinhCanChiGio, isDaiHanThuan, resolveBirthDateTime, DEFAULT_TZ } from './lunar.js';
import { anCungMenh, anCungThan, an12Cung, anCanCung, tinhThanCu } from './cung.js';
import { anCuc, getCucInfo, getMenhChu, getThanChu } from './menh_than_cuc.js';
import { an14ChinhTinh, groupChinhTinhByCung, detectCachCuc } from './chinh_tinh.js';
import { anToanBoPhuTinh, groupPhuTinhByCung } from './phu_tinh.js';
import { anTuHoa } from './tu_hoa.js';
import { anTuan, anTriet, detectTuanTrietGiap } from './tuan_triet.js';
import { anVongThaiTue, anVongBacSi, anVongTruongSinh, isVongThuan } from './vong.js';
import { anDaiHan, timDaiHanHienTai, anTieuHan, anTuHoaDaiHan } from './dai_han.js';
import { anLuuNien } from './luu_nien.js';
import { anTuVanFull } from './tu_van.js';
import { CHI, CAN, CHI_INDEX, TEN_CUNG_12, NAP_AM, CHI_NGU_HANH, SAO_CAT_LIST, SAO_SAT_LIST, SAO_TRUNG_TINH } from './data.js';

// Lục Cát + Lục Sát (kept for backward compat — render hiện dùng SAO_CAT_LIST/SAO_SAT_LIST)
const LUC_CAT = new Set(["Tả Phụ", "Hữu Bật", "Văn Xương", "Văn Khúc", "Thiên Khôi", "Thiên Việt"]);
const LUC_SAT = new Set(["Kình Dương", "Đà La", "Hoả Tinh", "Linh Tinh", "Địa Không", "Địa Kiếp"]);

/**
 * Build chart JSON từ input.
 * @param {object} input
 *   - nam, thang, ngay, gio, phut: dương lịch
 *   - gioiTinh: "nam" | "nu"
 *   - tenLabel?: string nhãn lá số
 *   - namXem?: số (mặc định = năm hiện tại)
 *   - laiNhanCung?: tên cung Lai Nhân
 *   - phai?: "vn" | "tq" (default vn)
 */
export function buildChart(input) {
  const phai = input.phai || "vn";
  const bangMieuVuong = input.bangMieuVuong || "vn";   // "vn" | "tq" — bảng Miếu Vượng
  const timeZone = input.timeZone ?? DEFAULT_TZ;
  const foreignSchool = input.foreignSchool || "vn";   // "vn" | "local"

  // 1. Lịch pháp — xử lý timezone trước
  const resolved = resolveBirthDateTime(
    { nam: input.nam, thang: input.thang, ngay: input.ngay, gio: input.gio, phut: input.phut || 0 },
    timeZone, foreignSchool
  );
  const lich = resolved.lunar;
  // Giờ dùng để tính chi giờ = giờ trong duongUsed (sau convert nếu phái VN, hoặc local)
  const gioDung = resolved.duongUsed.gio;
  const phutDung = resolved.duongUsed.phut;
  const chiGio = tinhChiGio(gioDung, phutDung);
  const canChiGio = tinhCanChiGio(lich.canChi.ngay.can, chiGio);
  const canNam = lich.canChi.nam.can;
  const chiNam = lich.canChi.nam.chi;
  const thangAm = lich.am.thang;
  const ngayAm = lich.am.ngay;
  const napAm = lich.napAm;

  // 2. Cung Mệnh / Thân + 12 cung + Can cung
  const cungMenhChi = anCungMenh(thangAm, chiGio);
  const cungThanChi = anCungThan(thangAm, chiGio);
  const thanCu = tinhThanCu(cungMenhChi, cungThanChi);
  const cung12 = an12Cung(cungMenhChi);  // [{tenCung, chi, chiIdx}, ...]
  const canCung = anCanCung(canNam);

  // 3. Cục + Mệnh chủ + Thân chủ
  const cuc = anCuc(canNam, CHI[cungMenhChi]);
  const cucInfo = getCucInfo(cuc);
  const menhChu = getMenhChu(chiNam);
  const thanChu = getThanChu(chiNam, phai);

  // 4. 14 chính tinh + group
  const chinhTinh = an14ChinhTinh(cuc, ngayAm);
  const cungChinhTinh = groupChinhTinhByCung(chinhTinh, bangMieuVuong);
  const cachCuc = detectCachCuc(cungChinhTinh);

  // 5. Phụ tinh
  const phuTinh = anToanBoPhuTinh({
    thangAm, chiGio, canNam, chiNam, ngayAm,
    gioiTinh: input.gioiTinh,
    cungMenhChi, cungThanChi,
    cungNoBocChi: cung12[5].chiIdx,
    cungTatAchChi: cung12[7].chiIdx,
  });
  const cungPhuTinh = groupPhuTinhByCung(phuTinh);
  const viTriSao = { ...chinhTinh, ...phuTinh };

  // 6. Tứ Hoá năm sinh
  const tuHoa = anTuHoa(canNam, viTriSao, phai);

  // 7. Tuần - Triệt
  const tuan = anTuan(canNam, chiNam);
  const triet = anTriet(canNam);
  const tuanTrietGiap = detectTuanTrietGiap(tuan, triet);

  // 8. 3 vòng
  const isThuanVong = isVongThuan(canNam, input.gioiTinh);
  const vongThaiTue = anVongThaiTue(chiNam);
  const vongBacSi = anVongBacSi(viTriSao["Lộc Tồn"], isThuanVong);
  const vongTruongSinh = anVongTruongSinh(cuc, isThuanVong);

  // 9. Đại hạn
  const namXem = input.namXem || new Date().getFullYear();
  const currentAge = namXem - input.nam + 1;   // tuổi mụ
  const dhThuan = isDaiHanThuan(canNam, input.gioiTinh);
  const daiHans = anDaiHan(cuc, cungMenhChi, dhThuan, currentAge);
  const dhCurrent = timDaiHanHienTai(daiHans);
  const tuHoaDH = dhCurrent
    ? anTuHoaDaiHan(canCung[dhCurrent.chiIdx], viTriSao, phai)
    : null;

  // 10. Tiểu hạn
  const tieuHan = anTieuHan(chiNam, input.gioiTinh, currentAge);

  // 11. Lưu niên
  const canChiNamXem = computeCanChiNam(namXem);
  const luuNien = anLuuNien(
    canChiNamXem.can, canChiNamXem.chi, chiNam, viTriSao, phai
  );

  // 12. Tử Vân
  const tuVan = anTuVanFull({
    cuc, chiNam, cungMenhChi, viTriSao,
    laiNhanCung: input.laiNhanCung || null,
  });

  // 13. Build 12 cung detail
  const cungDetails = cung12.map((c, idx) => ({
    index: idx,
    tenCung: c.tenCung,
    chi: c.chi,
    chiIdx: c.chiIdx,
    can: canCung[c.chiIdx],
    chiHanh: CHI_NGU_HANH[c.chi],
    isMenh: idx === 0,
    isThan: c.chiIdx === cungThanChi,
    chinhTinh: cungChinhTinh[c.chiIdx],
    phuTinh: cungPhuTinh[c.chiIdx],
    tuHoa: getTuHoaForCung(tuHoa, c.chiIdx),
    tuHoaDaiHan: tuHoaDH ? getTuHoaForCung(tuHoaDH, c.chiIdx) : [],
    luuTuHoa: getTuHoaForCung(luuNien.luuTuHoa, c.chiIdx),
    saoLuu: getSaoLuuForCung(luuNien.saoLuu, c.chiIdx),
    vong: getVongForCung(vongThaiTue, vongBacSi, vongTruongSinh, c.chiIdx),
    hasTuan: tuan.includes(c.chi),
    hasTriet: triet.includes(c.chi),
    hasLuuTuan: luuNien.luuTuanTriet.luuTuan.includes(c.chi),
    hasLuuTriet: luuNien.luuTuanTriet.luuTriet.includes(c.chi),
    isDaiHanCurrent: dhCurrent && dhCurrent.chiIdx === c.chiIdx,
    daiHanIndex: daiHans.find(dh => dh.chiIdx === c.chiIdx)?.index || null,
    daiHanRange: daiHans.find(dh => dh.chiIdx === c.chiIdx)
      ? `${daiHans.find(dh => dh.chiIdx === c.chiIdx).ageStart}-${daiHans.find(dh => dh.chiIdx === c.chiIdx).ageEnd}`
      : null,
    isTieuHan: tieuHan.chiIdx === c.chiIdx,
  }));

  return {
    version: 1,
    createdAt: new Date().toISOString(),
    input: {
      nam: input.nam, thang: input.thang, ngay: input.ngay,
      gio: input.gio, phut: input.phut || 0,
      gioiTinh: input.gioiTinh,
      tenLabel: input.tenLabel || null,
      namXem,
      laiNhanCung: input.laiNhanCung || null,
      phai,
      bangMieuVuong,
      timeZone,
      foreignSchool,
    },
    lich: {
      duong: { nam: input.nam, thang: input.thang, ngay: input.ngay },
      duongUsed: resolved.duongUsed,           // sau convert (nếu khác local)
      tzInfo: {
        original: timeZone,
        used: resolved.tzUsed,
        school: resolved.schoolUsed,
        converted: timeZone !== resolved.tzUsed,
      },
      am: lich.am,
      canChi: { ...lich.canChi, gio: canChiGio },
      napAm,
      chiGio,
    },
    menh: {
      cungChi: CHI[cungMenhChi],
      cungChiIdx: cungMenhChi,
      thanChi: CHI[cungThanChi],
      thanChiIdx: cungThanChi,
      thanCu,
      cuc,
      cucNum: cucInfo.so,
      cucHanh: cucInfo.hanh,
      menhChu,
      thanChu,
      currentAge,
    },
    cung: cungDetails,
    cachCuc,
    tuHoa,
    tuanTriet: { tuan, triet, giap: tuanTrietGiap },
    daiHan: { all: daiHans, current: dhCurrent, isThuan: dhThuan, tuHoaDH, tieuHan },
    luuNien: {
      canChi: canChiNamXem,
      ...luuNien,
    },
    tuVan,
  };
}

// ============================================================
// Helpers
// ============================================================

function getTuHoaForCung(tuHoa, chiIdx) {
  const result = [];
  if (tuHoa.hoaLoc?.chiIdx === chiIdx) result.push({ kind: "loc", sao: tuHoa.hoaLoc.sao });
  if (tuHoa.hoaQuyen?.chiIdx === chiIdx) result.push({ kind: "quyen", sao: tuHoa.hoaQuyen.sao });
  if (tuHoa.hoaKhoa?.chiIdx === chiIdx) result.push({ kind: "khoa", sao: tuHoa.hoaKhoa.sao });
  if (tuHoa.hoaKy?.chiIdx === chiIdx) result.push({ kind: "ky", sao: tuHoa.hoaKy.sao });
  return result;
}

function getSaoLuuForCung(saoLuu, chiIdx) {
  const result = [];
  for (const [sao, ci] of Object.entries(saoLuu)) {
    if (ci === chiIdx) result.push(sao);
  }
  return result;
}

function getVongForCung(thaiTue, bacSi, truongSinh, chiIdx) {
  const result = [];
  for (const [sao, ci] of Object.entries(thaiTue)) {
    if (ci === chiIdx) result.push({ sao, vong: "TT" });
  }
  for (const [sao, ci] of Object.entries(bacSi)) {
    if (ci === chiIdx) result.push({ sao, vong: "BS" });
  }
  for (const [sao, ci] of Object.entries(truongSinh)) {
    if (ci === chiIdx) result.push({ sao, vong: "TS" });
  }
  return result;
}

/**
 * Tính Can-Chi của 1 năm dương lịch (>=1900).
 * Năm 1900 = Canh Tí (canIdx 6, chiIdx 0).
 */
export function computeCanChiNam(year) {
  const baseYear = 1900;
  const baseCanIdx = 6;   // Canh
  const baseChiIdx = 0;   // Tí
  const offset = year - baseYear;
  const canIdx = ((baseCanIdx + offset) % 10 + 10) % 10;
  const chiIdx = ((baseChiIdx + offset) % 12 + 12) % 12;
  return { can: CAN[canIdx], chi: CHI[chiIdx] };
}

/**
 * Categorize sao theo bộ (cat / sat / trung) — dùng cho layout 2 cột.
 * "cat"  = Lục Cát + Lộc/Mã + đào hoa cát + cát tạp
 * "sat"  = Lục Sát + sát/cô/khốc/thương
 * "trung" = trung tính (Hoa Cái, Thiên Tài, Thiên Thọ)
 */
export function categorizeStar(name) {
  if (SAO_CAT_LIST.has(name)) return "cat";
  if (SAO_SAT_LIST.has(name)) return "sat";
  if (SAO_TRUNG_TINH.has(name)) return "trung";
  return "le";
}

/**
 * Subset: chỉ Lục Cát hoặc Lục Sát (6 sao chính) — dùng để bold trong UI.
 */
export function isLucCat(name) { return LUC_CAT.has(name); }
export function isLucSat(name) { return LUC_SAT.has(name); }

export { LUC_CAT, LUC_SAT };
