// luu_nguyet.js — Lưu Nguyệt (流月): Đẩu Quân + 12 tháng lưu nguyệt của năm xem.
//
// Phương pháp Đẩu Quân (斗君) phổ biến:
//   "Thái Tuế cung khởi Chính nguyệt, nghịch đến sinh nguyệt;
//    từ sinh nguyệt cung khởi giờ Tý, thuận đến sinh thời → Đẩu Quân (tháng Giêng của lưu niên)."
//   Mỗi tháng kế tiếp = +1 cung thuận.
// Tứ Hoá lưu nguyệt: Can tháng theo Ngũ Hổ Độn tính từ CAN NĂM XEM (lưu niên), tháng Giêng = Dần.
//
// ⚠️ Có phái dùng Đẩu Quân khác (vd khởi từ cung Mệnh). Đây là bản phổ biến nhất.

import { CAN, CHI, CAN_INDEX, CHI_INDEX, NGU_HO_DON } from './data.js';
import { anTuHoa } from './tu_hoa.js';

const mod12 = (n) => ((n % 12) + 12) % 12;
const mod10 = (n) => ((n % 10) + 10) % 10;

/**
 * An Lưu Nguyệt: Đẩu Quân + 12 tháng (lưu Mệnh cung + Tứ Hoá lưu nguyệt).
 * @param {Object} p
 * @param {string} p.canNamXem   Can năm xem (lưu niên)
 * @param {string} p.chiNamXem   Chi năm xem (lưu niên)
 * @param {number} p.thangSinhAm Tháng sinh âm lịch (1-12)
 * @param {string} p.chiGio      Chi giờ sinh ("Tí".."Hợi")
 * @param {Object} p.viTriSao    Map sao → chiIdx
 * @param {Array}  p.cung12      [{tenCung, chi, chiIdx}]
 * @param {string} [p.phai]      "vn" | "tq"
 * @returns {{dauQuanCung, dauQuanChi, thang: Array}}
 */
export function anLuuNguyet({ canNamXem, chiNamXem, thangSinhAm, chiGio, viTriSao, cung12, phai = "vn" }) {
  const thaiTueIdx = CHI_INDEX[chiNamXem];
  const chiGioIdx = CHI_INDEX[chiGio];
  // Thái Tuế = Chính nguyệt, nghịch đến sinh nguyệt
  const sinhNguyetIdx = mod12(thaiTueIdx - (thangSinhAm - 1));
  // Sinh nguyệt khởi Tý, thuận đến sinh thời → Đẩu Quân (tháng Giêng lưu niên)
  const dauQuanChiIdx = mod12(sinhNguyetIdx + chiGioIdx);

  const canGiengIdx = CAN_INDEX[NGU_HO_DON[canNamXem]]; // can tháng Giêng (Dần) của lưu niên

  const cungByChiIdx = {};
  cung12.forEach((c) => { cungByChiIdx[c.chiIdx] = c; });
  const cungTen = (idx) => cungByChiIdx[idx]?.tenCung ?? null;
  const cungChi = (idx) => cungByChiIdx[idx]?.chi ?? CHI[idx];

  const thang = [];
  for (let m = 1; m <= 12; m++) {
    const luuMenhIdx = mod12(dauQuanChiIdx + (m - 1));
    const canThang = CAN[mod10(canGiengIdx + (m - 1))];
    const th = anTuHoa(canThang, viTriSao, phai);
    const mapHoa = (h) => ({ sao: h.sao, cung: cungTen(h.chiIdx), cungChi: cungChi(h.chiIdx) });
    thang.push({
      thang: m,
      canThang,
      luuMenhCung: cungTen(luuMenhIdx),
      luuMenhChi: cungChi(luuMenhIdx),
      loc: mapHoa(th.hoaLoc),
      quyen: mapHoa(th.hoaQuyen),
      khoa: mapHoa(th.hoaKhoa),
      ky: mapHoa(th.hoaKy),
    });
  }

  return {
    dauQuanCung: cungTen(dauQuanChiIdx),
    dauQuanChi: cungChi(dauQuanChiIdx),
    thang,
  };
}
