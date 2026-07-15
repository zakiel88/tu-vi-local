// cung_phi.js — Cung Phi (Bát Trạch) + quan hệ ngũ hành Cục↔Mệnh + Âm Dương Mệnh lý.
//
// Cung Phi (宮飛 / Bản Mệnh Quái): gán 1 trong 8 quẻ Bát Quái theo NĂM ÂM LỊCH + giới tính.
// Công thức theo vault `02-Quy Tắc/Nền Tảng/Cung Phi - Bát Trạch.md` §2:
//   - Năm < 2000: Nam (100 − yy) mod 9 ; Nữ (4 + yy) mod 9   (yy = 2 chữ số cuối, dư 0 → 9)
//   - Năm ≥ 2000: Nam 9 − (Σchữsố mod 9) ; Nữ 6 + (Σchữsố mod 9)  (chuẩn hoá về 1..9)
//   - Số 5 (Trung cung, không có quẻ): Nam → Khôn(2), Nữ → Cấn(8).
// KHÔNG đụng logic an sao — thuần suy diễn phong thuỷ bổ trợ cho khung giữa bàn A4.

import { CAN_DUONG } from './data.js';

// 8 quẻ Bát Quái (bỏ số 5 Trung cung — remap trong anCungPhi).
const QUE_MAP = {
  1: { so: 1, que: "Khảm", kyHieu: "☵", hanh: "Thuỷ", phuong: "Bắc",       nhom: "Đông tứ mệnh" },
  2: { so: 2, que: "Khôn", kyHieu: "☷", hanh: "Thổ",  phuong: "Tây Nam",   nhom: "Tây tứ mệnh" },
  3: { so: 3, que: "Chấn", kyHieu: "☳", hanh: "Mộc",  phuong: "Đông",      nhom: "Đông tứ mệnh" },
  4: { so: 4, que: "Tốn",  kyHieu: "☴", hanh: "Mộc",  phuong: "Đông Nam",  nhom: "Đông tứ mệnh" },
  6: { so: 6, que: "Càn",  kyHieu: "☰", hanh: "Kim",  phuong: "Tây Bắc",   nhom: "Tây tứ mệnh" },
  7: { so: 7, que: "Đoài", kyHieu: "☱", hanh: "Kim",  phuong: "Tây",       nhom: "Tây tứ mệnh" },
  8: { so: 8, que: "Cấn",  kyHieu: "☶", hanh: "Thổ",  phuong: "Đông Bắc",  nhom: "Tây tứ mệnh" },
  9: { so: 9, que: "Ly",   kyHieu: "☲", hanh: "Hoả",  phuong: "Nam",       nhom: "Đông tứ mệnh" },
};

function isNu(gioiTinh) {
  return gioiTinh === "nu" || gioiTinh === "nữ";
}

function digitSum(n) {
  return String(Math.abs(Math.trunc(n)))
    .split("")
    .reduce((acc, d) => acc + Number(d), 0);
}

/**
 * An Cung Phi (Bát Trạch) từ NĂM ÂM LỊCH + giới tính.
 * @param {number} namAm — năm âm lịch (đã xét mốc Tết — dùng chart.lich.am.nam)
 * @param {"nam"|"nu"} gioiTinh
 * @returns {{so:number, que:string, kyHieu:string, hanh:string, phuong:string, nhom:string}}
 */
export function anCungPhi(namAm, gioiTinh) {
  const nam = Number(namAm);
  const nu = isNu(gioiTinh);
  const yy = ((nam % 100) + 100) % 100;

  let n;
  if (nam < 2000) {
    n = nu ? (4 + yy) % 9 : (100 - yy) % 9;
  } else {
    const ds = digitSum(nam) % 9;
    n = nu ? (6 + ds) % 9 : ((9 - ds) % 9 + 9) % 9;
  }
  if (n === 0) n = 9;              // dư 0 → 9
  if (n === 5) n = nu ? 8 : 2;     // Trung cung: Nữ → Cấn(8), Nam → Khôn(2)

  return { ...QUE_MAP[n] };
}

// Ngũ hành sinh / khắc (dùng chung cho quan hệ Cục ↔ Mệnh).
const NGU_HANH_SINH = { "Mộc": "Hoả", "Hoả": "Thổ", "Thổ": "Kim", "Kim": "Thuỷ", "Thuỷ": "Mộc" };
const NGU_HANH_KHAC = { "Mộc": "Thổ", "Thổ": "Thuỷ", "Thuỷ": "Hoả", "Hoả": "Kim", "Kim": "Mộc" };

/**
 * Quan hệ ngũ hành A → B (A = hành Cục, B = hành cung Mệnh).
 * @returns {{relation:string, label:string}}
 */
export function nguHanhRelation(a, b) {
  if (!a || !b) return { relation: "unknown", label: "-" };
  if (a === b) return { relation: "dong", label: `Cục Mệnh đồng hành (${a})` };
  if (NGU_HANH_SINH[a] === b) return { relation: "cuc-sinh-menh", label: `Cục sinh Mệnh (${a} sinh ${b})` };
  if (NGU_HANH_SINH[b] === a) return { relation: "menh-sinh-cuc", label: `Mệnh sinh Cục (${b} sinh ${a})` };
  if (NGU_HANH_KHAC[a] === b) return { relation: "cuc-khac-menh", label: `Cục khắc Mệnh (${a} khắc ${b})` };
  if (NGU_HANH_KHAC[b] === a) return { relation: "menh-khac-cuc", label: `Mệnh khắc Cục (${b} khắc ${a})` };
  return { relation: "unknown", label: "-" };
}

/**
 * Âm Dương Mệnh lý: Dương Nam / Âm Nữ = THUẬN lý; Âm Nam / Dương Nữ = NGHỊCH lý.
 * (Trùng quy luật chiều đại hạn — Dương Nam Âm Nữ đi thuận.)
 * @param {string} canNam — Can năm sinh
 * @param {"nam"|"nu"} gioiTinh
 * @returns {{duong:boolean, thuan:boolean, label:string}}
 */
export function amDuongMenhLy(canNam, gioiTinh) {
  const nu = isNu(gioiTinh);
  const duong = CAN_DUONG.has(canNam);
  const thuan = (duong && !nu) || (!duong && nu);
  const label = `${duong ? "Dương" : "Âm"} ${nu ? "Nữ" : "Nam"} · ${thuan ? "thuận lý" : "nghịch lý"}`;
  return { duong, thuan, label };
}
