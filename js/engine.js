// engine.js — Orchestrator: input dương lịch + giới tính → chart JSON đầy đủ.

import { duongToAm, tinhChiGio, tinhCanChiGio, tinhCanChiThang, isDaiHanThuan, resolveBirthDateTime, DEFAULT_TZ } from './lunar.js';
import { anCungMenh, anCungThan, an12Cung, anCanCung, tinhThanCu } from './cung.js';
import { anLuuNguyet } from './luu_nguyet.js';
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
  const bangMieuVuong = input.bangMieuVuong || "trungchau";   // "trungchau" | "vn" | "tq" — phái chính thức Trung Châu (2026-05-07)
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
  // Tháng dùng AN SAO — áp luật tháng nhuận 15 ngày (xem thangAnSao). Tháng thường
  // giữ nguyên; chỉ tháng nhuận nửa sau (ngày ≥16) mới lệch số tháng an sao.
  const thangAm = thangAnSao(lich.am);
  const thangNhuanApDung = lich.am.isLeap === true;
  const ngayAm = lich.am.ngay;
  const napAm = lich.napAm;
  // Can-Chi tháng: đồng bộ với tháng an sao khi tháng nhuận (KHÔNG đổi năm/can chi năm).
  const canChiThangAnSao = thangNhuanApDung
    ? tinhCanChiThang(canNam, thangAm)
    : lich.canChi.thang;

  // 2. Cung Mệnh / Thân + 12 cung + Can cung
  //
  // ⭐ LÁ SỐ SINH ĐÔI (cổ pháp "Huynh Đệ làm Mệnh", user chốt 2026-07-10):
  //   Cùng canh giờ + sinh SAU → cung Mệnh LÙI 1 cung (về vị trí Huynh Đệ gốc).
  //   Chỉ NHÃN 12 cung + Thân + đại hạn + Mệnh/Thân chủ đổi. TOÀN BỘ sao + Cục +
  //   Tử Vi + Tứ Hoá + Tuần Triệt GIỮ NGUYÊN vị trí vật lý → mọi thứ physical vẫn
  //   tính theo cung Mệnh/Thân GỐC.
  const sinhDoi = input.sinhDoi
    ? { thuTu: input.sinhDoi.thuTu, cungCanh: input.sinhDoi.cungCanh === true }
    : null;
  const sinhDoiLuiCung = !!(sinhDoi && sinhDoi.thuTu === "sau" && sinhDoi.cungCanh === true);

  const cungMenhChiGoc = anCungMenh(thangAm, chiGio);
  const cungThanChiGoc = anCungThan(thangAm, chiGio);
  // Vị trí HIỆU LỰC (dùng cho nhãn cung + đại hạn + Mệnh/Thân chủ).
  const cungMenhChi = sinhDoiLuiCung ? (cungMenhChiGoc - 1 + 12) % 12 : cungMenhChiGoc;
  const cungThanChi = sinhDoiLuiCung ? (cungThanChiGoc - 1 + 12) % 12 : cungThanChiGoc;

  const thanCu = tinhThanCu(cungMenhChi, cungThanChi);
  const cung12 = an12Cung(cungMenhChi);          // nhãn 12 cung (hiệu lực)
  const cung12Goc = sinhDoiLuiCung ? an12Cung(cungMenhChiGoc) : cung12;  // vị trí vật lý cung chức
  const canCung = anCanCung(canNam);             // theo chiIdx — vật lý, không đổi

  // 3. Cục + Mệnh chủ + Thân chủ
  //    Cục = theo cung Mệnh GỐC (số Cục giữ nguyên khi sinh đôi).
  const cuc = anCuc(canNam, CHI[cungMenhChiGoc]);
  const cucInfo = getCucInfo(cuc);
  // Mệnh chủ / Thân chủ: bình thường theo Chi năm; khi lùi cung → theo chi cung Mệnh/Thân MỚI.
  const menhChu = sinhDoiLuiCung ? getMenhChu(CHI[cungMenhChi]) : getMenhChu(chiNam);
  const thanChu = sinhDoiLuiCung ? getThanChu(CHI[cungThanChi], phai) : getThanChu(chiNam, phai);

  // 4. 14 chính tinh + group
  const chinhTinh = an14ChinhTinh(cuc, ngayAm);
  const cungChinhTinh = groupChinhTinhByCung(chinhTinh, bangMieuVuong);
  const cachCuc = detectCachCuc(cungChinhTinh);

  // 5. Phụ tinh — dùng vị trí cung Mệnh/Thân/Nô Bộc/Tật Ách GỐC (giữ nguyên vật lý).
  const phuTinh = anToanBoPhuTinh({
    thangAm, chiGio, canNam, chiNam, ngayAm,
    gioiTinh: input.gioiTinh,
    cungMenhChi: cungMenhChiGoc, cungThanChi: cungThanChiGoc,
    cungNoBocChi: cung12Goc[5].chiIdx,
    cungTatAchChi: cung12Goc[7].chiIdx,
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

  // 14. Lưu Nguyệt (12 tháng năm xem) — Đẩu Quân + Tứ Hoá lưu nguyệt
  const luuNguyet = anLuuNguyet({
    canNamXem: canChiNamXem.can, chiNamXem: canChiNamXem.chi,
    thangSinhAm: thangAm, chiGio, viTriSao, cung12, phai,
  });

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
      sinhDoi,
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
      am: { ...lich.am, thangAmAnSao: thangAm, thangNhuanApDung },
      canChi: { ...lich.canChi, thang: canChiThangAnSao, gio: canChiGio },
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
      sinhDoiLuiCung,
      ghiChu: sinhDoiLuiCung
        ? "Lá sinh đôi — sinh sau cùng canh giờ: Mệnh lùi 1 cung (cổ pháp, ngoài Trung Châu)"
        : null,
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
    luuNguyet,
    tuVan,
  };
}

// ============================================================
// Helpers
// ============================================================

/**
 * Số tháng dùng để AN SAO theo luật THÁNG NHUẬN 15 ngày (chuẩn phổ biến VN).
 * - Tháng thường (isLeap=false): giữ nguyên số tháng.
 * - Tháng nhuận, ngày âm 1–15: dùng chính số tháng đó (X).
 * - Tháng nhuận, ngày âm 16 trở đi: dùng tháng kế tiếp (X+1; tháng 12 → tháng 1).
 *   CHỈ đổi SỐ THÁNG dùng an sao — KHÔNG đổi năm/can chi năm.
 * @param {{thang:number, ngay:number, isLeap?:boolean}} am — object lịch âm (lich.am)
 * @returns {number} số tháng 1–12 dùng để an sao
 */
export function thangAnSao(am) {
  if (am.isLeap !== true || am.ngay <= 15) return am.thang;
  return am.thang === 12 ? 1 : am.thang + 1;
}

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
