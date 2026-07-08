// calendar.js — Lịch âm dương đầy đủ tháng: giờ hoàng đạo, Trực, ngày hoàng/hắc đạo,
// ngày kỵ dân gian, 24 tiết khí.
//
// TÁI DỤNG lunar.js cho TOÀN BỘ thuật toán âm lịch (đổi dương↔âm, Can-Chi năm/tháng/ngày,
// Julian Day Number) — file này KHÔNG viết lại các thuật toán đó, chỉ cộng thêm lớp
// "lịch vạn niên" phía trên (chưa có ở lunar.js/engine.js).
//
// ============================================================
// NGUỒN BẢNG TRA (ghi rõ để verify sau — xem CHECKPOINT 2 trong
// docs/superpowers/plans/2026-07-07-v1-polish-VCA-plan.md, mục Task C1)
// ============================================================
// (1) 24 Tiết Khí — tên + thứ tự + ngày dương lịch xấp xỉ: CITE vault note
//     "vault/02-Quy Tắc/Nền Tảng/Tiết Khí.md" (đã có trong vault, xác nhận đúng thứ tự
//     Lập Xuân → Đại Hàn). Công thức xác định NGÀY chính xác: CÙNG phép tính hoàng kinh mặt
//     trời (sun ecliptic longitude, Meeus giản lược) mà lunar.js dùng nội bộ trong
//     getSunLongitude() (nguồn Hồ Ngọc Đức
//     https://www.informatik.uni-leipzig.de/~duc/amlich/calrules.html) — hàm đó KHÔNG export
//     và chỉ trả về 12 cung 30° (đủ dùng tính tháng nhuận), nên file này viết lại CÙNG công
//     thức ở độ phân giải 15°/24 cung để ra đủ 24 tiết khí.
//     ⚠️ SỬA 1 HẰNG SỐ so với bản gốc lunar.js: epoch tham chiếu T dùng 2451545.0 (J2000.0
//     chuẩn thiên văn — JD 2451545.0 = 1/1/2000 12:00 UT) thay vì 2451545.5 (bản gốc). Đã
//     verify: 2451545.5 gây lệch hệ thống ~0.5 ngày (~0.5° tại tốc độ mặt trời ~0.9856°/ngày)
//     — VÔ HẠI ở lunar.js (chỉ so sánh cung 30°/ranh giới tháng ~30 ngày nên 0.5 ngày không đổi
//     kết quả) nhưng làm SAI NGÀY ở độ phân giải 15°/tiết khí (mức ngày) mà file này cần. Verify
//     bằng WebSearch 2 mốc thiên văn khách quan: Đông Chí 2026 = 21/12/2026 20:50 UTC
//     (timeanddate.com) và Hạ Chí 2026 ≈ 21/6/2026 08:24 UTC — epoch 2451545.0 cho longitude
//     269.999°/90.006° tại đúng 2 mốc đó (lệch <0.01°, đúng độ chính xác Meeus giản lược); epoch
//     2451545.5 (bản gốc) cho 269.494°/89.529° (lệch ~0.5°, đủ để xê dịch NGÀY phát hiện tiết
//     khí). Gốc 0° của công thức = Xuân Phân (đã xác nhận qua cách lunar.js dùng
//     getSunLongitude()>=9 để tìm Đông Chí = cung thứ 9/12 = 270° = 9*30°, khớp Xuân Phân=0°).
// (2) Trực 12 (Kiến Trừ Thập Nhị Khách: Kiến-Trừ-Mãn-Bình-Định-Chấp-Phá-Nguy-Thành-Thu-Khai-Bế)
//     — hệ chuẩn, không có dị bản đáng kể giữa các nguồn lịch vạn niên. "Ngày Kiến" = ngày có
//     Chi ngày trùng Chi tháng (nguyệt kiến, suy từ Can-Chi tháng ÂM LỊCH mà lunar.js đã tính —
//     LƯU Ý: đây là tháng ÂM LỊCH, KHÁC tháng Tiết Khí dùng ở Tử Bình, xem vault note ở (1) mục
//     "Tử Vi dùng tới đâu?"), rồi cycle theo Chi ngày tăng dần.
// (3) 12 sao Hoàng Đạo/Hắc Đạo (dùng chung cho NGÀY và GIỜ — theo bài quyết "Đạo viễn kỵ trình"
//     phổ biến trong lịch vạn niên dân gian: Thanh Long→Minh Đường→Thiên Hình→Chu Tước→Kim Quỹ→
//     Thiên Đức→Bạch Hổ→Ngọc Đường→Thiên Lao→Huyền Vũ→Tư Mệnh→Câu Trần, cyclic cố định 12 sao,
//     6 hoàng/6 hắc xen kẽ không đều). Cấp NGÀY khởi từ Chi tháng (nguyệt kiến); cấp GIỜ khởi
//     từ Chi ngày — dùng CHUNG 1 bảng "nhóm Chi → Chi khởi Thanh Long" vì đây là cấu trúc tự
//     đồng dạng (self-similar) chuẩn của hệ 12 sao này (mỗi cấp lặp lại đúng quy tắc của cấp
//     trên, dịch xuống 1 tầng thời gian: năm→tháng→ngày→giờ).
//     ⚠️ Đây là dữ liệu PHỔ THÔNG tổng hợp từ tri thức lịch vạn niên chung — KHÔNG tìm thấy note
//     vault nào về hoàng đạo/hắc đạo khi grep "hoàng đạo"/"hắc đạo" trong vault/ (0 kết quả —
//     vault này tập trung Tử Vi Đẩu Số, không phải lịch vạn niên dân gian). CẦN user đối chiếu
//     tay với 1 app Lịch Việt tin cậy ở CHECKPOINT 2 trước khi coi là chuẩn cuối; sai thì sửa
//     bảng THANH_LONG_START / SAO_12_HOANG_HAC bên dưới (đã cô lập riêng, dễ chỉnh).
// (4) Ngày kỵ dân gian: Tam Nương (mùng 3, 7, 13, 18, 22, 27 âm lịch) + Nguyệt Kỵ (mùng 5, 14,
//     23 âm lịch) — cố định theo NGÀY ÂM trong tháng, không phụ thuộc can-chi. Phổ thông, không
//     có dị bản.
// ============================================================

import { jdFromDate, duongToAm, DEFAULT_TZ } from './lunar.js';
import { CHI, CHI_INDEX, CHI_GIO } from './data.js';

// ============================================================
// Hoàng kinh mặt trời (sun ecliptic longitude) — dùng cho 24 Tiết Khí
// ============================================================

/**
 * Hoàng kinh mặt trời tại JDN, timeZone — CÙNG công thức Meeus giản lược mà lunar.js dùng nội
 * bộ (hàm getSunLongitude không export, nguồn Hồ Ngọc Đức — xem comment nguồn ở đầu file).
 * Khác 2 điểm so với bản gốc (đều đã verify — xem comment nguồn (1) ở đầu file):
 *  (a) epoch tham chiếu 2451545.0 (J2000.0 chuẩn) thay vì 2451545.5 — sửa lệch hệ thống ~0.5
 *      ngày, vô hại ở granularity 30° gốc nhưng sai ở granularity 15° (ngày) cần ở đây;
 *  (b) trả về radian ĐÃ chuẩn hoá [0, 2π) thay vì floor sẵn thành cung 30°, để tự chia cung
 *      15° (24 tiết khí) thay vì 12 cung (trung khí dùng tính tháng nhuận).
 * @returns {number} kinh độ mặt trời (radian, 0 = Xuân Phân)
 */
function sunLongitudeRad(jdn, timeZone) {
  const T = (jdn - 2451545.0 - timeZone / 24) / 36525;
  const T2 = T * T;
  const dr = Math.PI / 180;
  const M = 357.52910 + 35999.05030 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  let DL = (1.914600 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
  DL += (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.000290 * Math.sin(dr * 3 * M);
  let L = L0 + DL;
  L = L * dr;
  L -= Math.PI * 2 * Math.floor(L / (Math.PI * 2));
  return L;
}

// Thứ tự + tên chuẩn theo vault/02-Quy Tắc/Nền Tảng/Tiết Khí.md (index 0 = Lập Xuân).
const TEN_24_TIET_KHI = [
  "Lập Xuân", "Vũ Thuỷ", "Kinh Trập", "Xuân Phân", "Thanh Minh", "Cốc Vũ",
  "Lập Hạ", "Tiểu Mãn", "Mang Chủng", "Hạ Chí", "Tiểu Thử", "Đại Thử",
  "Lập Thu", "Xử Thử", "Bạch Lộ", "Thu Phân", "Hàn Lộ", "Sương Giáng",
  "Lập Đông", "Tiểu Tuyết", "Đại Tuyết", "Đông Chí", "Tiểu Hàn", "Đại Hàn",
];

/**
 * Cung tiết khí (0-23, 0 = Lập Xuân) tại 1 thời khắc JD liên tục bất kỳ (không nhất thiết
 * nguyên — xem tietKhiOfDay() để hiểu vì sao cần truyền JD lệch 0.5 ngày).
 * sunLongitudeRad() trả về góc gốc Xuân Phân=0° (quy ước lunar.js) — xoay gốc về Lập Xuân=315°
 * để khớp thứ tự bảng TEN_24_TIET_KHI (khớp vault note, dễ đọc/maintain hơn).
 */
function tietKhiSectorAt(jdContinuous, timeZone) {
  const deg = sunLongitudeRad(jdContinuous, timeZone) * 180 / Math.PI;
  const fromLapXuan = ((deg - 315) % 360 + 360) % 360;
  return Math.floor(fromLapXuan / 15);
}

/**
 * Tên tiết khí NẾU ngày dân sự (civil day) jdn chứa thời khắc giao tiết (cung 15° đổi), else
 * null.
 *
 * QUAN TRỌNG — so sánh tại RANH GIỚI NGÀY DÂN SỰ (00:00 giờ địa phương), KHÔNG so sánh 2 trưa
 * liên tiếp: jdn (quy ước jdFromDate) = JD tại NOON UTC của ngày đó, nên "jdn - 0.5" = đúng
 * 00:00 giờ địa phương ĐẦU ngày jdn, và "jdn + 0.5" = 00:00 giờ địa phương ĐẦU ngày kế (=cuối
 * ngày jdn). Đã tự phát hiện + verify bằng WebSearch: so 2 trưa liên tiếp (jdn vs jdn-1) SAI
 * NGÀY khi thời khắc giao tiết rơi vào buổi CHIỀU/TỐI giờ địa phương — case thật: Hạ Chí 2026
 * đúng lúc 21/6/2026 08:24 UTC = 15:24 giờ VN (buổi chiều) → so 2 trưa cho SAI kết quả "22/6"
 * (chậm 1 ngày), so 2 mốc 00:00 cho ĐÚNG "21/6". Buổi sáng (vd Đông Chí 2026, 03:50 VN) thì 2
 * cách cho cùng kết quả nên lỗi này dễ lọt qua nếu chỉ test 1 case.
 */
function tietKhiOfDay(jdn, timeZone) {
  const startOfDay = tietKhiSectorAt(jdn - 0.5, timeZone);
  const startOfNextDay = tietKhiSectorAt(jdn + 0.5, timeZone);
  return startOfDay !== startOfNextDay ? TEN_24_TIET_KHI[startOfNextDay] : null;
}

// ============================================================
// Trực 12 (Kiến Trừ Thập Nhị Khách) — xem nguồn (2) ở đầu file
// ============================================================

const TRUC_12 = [
  "Kiến", "Trừ", "Mãn", "Bình", "Định", "Chấp",
  "Phá", "Nguy", "Thành", "Thu", "Khai", "Bế",
];

function tinhTruc(chiThang, chiNgay) {
  const chiThangIdx = CHI_INDEX[chiThang];
  const chiNgayIdx = CHI_INDEX[chiNgay];
  const offset = ((chiNgayIdx - chiThangIdx) % 12 + 12) % 12;
  return TRUC_12[offset];
}

// ============================================================
// 12 sao Hoàng Đạo / Hắc Đạo — dùng chung cho ngày (khởi từ Chi tháng) và giờ (khởi từ Chi
// ngày). Xem nguồn (3) ở đầu file.
// ============================================================

const SAO_12_HOANG_HAC = [
  { ten: "Thanh Long", loai: "hoang" },
  { ten: "Minh Đường", loai: "hoang" },
  { ten: "Thiên Hình", loai: "hac" },
  { ten: "Chu Tước", loai: "hac" },
  { ten: "Kim Quỹ", loai: "hoang" },
  { ten: "Thiên Đức", loai: "hoang" },
  { ten: "Bạch Hổ", loai: "hac" },
  { ten: "Ngọc Đường", loai: "hoang" },
  { ten: "Thiên Lao", loai: "hac" },
  { ten: "Huyền Vũ", loai: "hac" },
  { ten: "Tư Mệnh", loai: "hoang" },
  { ten: "Câu Trần", loai: "hac" },
];

// "nhóm Chi" → Chi khởi sao Thanh Long. Dùng chung 2 tầng (ngày nhập Chi tháng, giờ nhập Chi
// ngày) — xem giải thích "tự đồng dạng" ở nguồn (3).
const THANH_LONG_START = {
  "Tí": "Thân", "Ngọ": "Thân",
  "Sửu": "Tuất", "Mùi": "Tuất",
  "Dần": "Tí", "Thân": "Tí",
  "Mão": "Dần", "Dậu": "Dần",
  "Thìn": "Thìn", "Tuất": "Thìn",
  "Tỵ": "Ngọ", "Hợi": "Ngọ",
};

function saoTaiChi(anchorChi, targetChiIdx) {
  const startIdx = CHI_INDEX[THANH_LONG_START[anchorChi]];
  const offset = ((targetChiIdx - startIdx) % 12 + 12) % 12;
  return SAO_12_HOANG_HAC[offset];
}

/** Ngày hoàng đạo/hắc đạo theo Chi tháng (nguyệt kiến, âm lịch) × Chi ngày. */
function tinhNgayHoangHacDao(chiThang, chiNgay) {
  const sao = saoTaiChi(chiThang, CHI_INDEX[chiNgay]);
  return { sao: sao.ten, isHoangDao: sao.loai === "hoang" };
}

/** 6 giờ hoàng đạo trong ngày, theo Chi ngày. */
function tinhGioHoangDao(chiNgay) {
  const result = [];
  for (let h = 0; h < 12; h++) {
    const sao = saoTaiChi(chiNgay, h);
    if (sao.loai === "hoang") {
      const { start, end } = CHI_GIO[h];
      result.push({ chi: CHI[h], gio: `${start}-${end}` });
    }
  }
  return result;
}

// ============================================================
// Ngày kỵ dân gian — xem nguồn (4) ở đầu file
// ============================================================

const TAM_NUONG_DAYS = new Set([3, 7, 13, 18, 22, 27]);
const NGUYET_KY_DAYS = new Set([5, 14, 23]);

function tinhNgayKy(amNgay) {
  const tags = [];
  if (TAM_NUONG_DAYS.has(amNgay)) tags.push("Tam Nương");
  if (NGUYET_KY_DAYS.has(amNgay)) tags.push("Nguyệt Kỵ");
  return tags;
}

// ============================================================
// Tên tháng âm lịch (hiển thị)
// ============================================================

const TEN_THANG_AM = [
  "Giêng", "Hai", "Ba", "Tư", "Năm", "Sáu",
  "Bảy", "Tám", "Chín", "Mười", "Mười Một", "Chạp",
];

function tenThangAm(thang, nhuan) {
  const base = TEN_THANG_AM[thang - 1];
  return nhuan ? `Nhuận ${base}` : base;
}

// ============================================================
// Public API
// ============================================================

/**
 * Tính toàn bộ thông tin lịch của 1 ngày dương lịch.
 * @returns {{
 *   duong: {nam:number, thang:number, ngay:number, thu:number},
 *   am: {ngay:number, thang:number, nhuan:boolean},
 *   canChiNgay: {can:string, chi:string},
 *   tietKhi: string|null,
 *   gioHoangDao: Array<{chi:string, gio:string}>,
 *   isHoangDao: boolean,
 *   isHacDao: boolean,
 *   truc: string,
 *   ngayKy: string[],
 * }}
 */
function computeDayInfo(nam, thang, ngay, timeZone) {
  const jdn = jdFromDate(ngay, thang, nam);
  const lich = duongToAm({ nam, thang, ngay }, timeZone);
  const hoangHac = tinhNgayHoangHacDao(lich.canChi.thang.chi, lich.canChi.ngay.chi);
  const core = {
    duong: {
      nam, thang, ngay,
      thu: new Date(Date.UTC(nam, thang - 1, ngay)).getUTCDay(), // 0=Chủ Nhật..6=Thứ Bảy
    },
    am: { ngay: lich.am.ngay, thang: lich.am.thang, nhuan: lich.am.isLeap },
    canChiNgay: lich.canChi.ngay,
    tietKhi: tietKhiOfDay(jdn, timeZone),
    gioHoangDao: tinhGioHoangDao(lich.canChi.ngay.chi),
    isHoangDao: hoangHac.isHoangDao,
    isHacDao: !hoangHac.isHoangDao,
    truc: tinhTruc(lich.canChi.thang.chi, lich.canChi.ngay.chi),
    ngayKy: tinhNgayKy(lich.am.ngay),
  };
  return { core, lich };
}

/**
 * Chi tiết đầy đủ 1 ngày — cho DayDetailSheet (C2).
 * @param {number} y năm dương
 * @param {number} m tháng dương (1-12)
 * @param {number} d ngày dương
 * @param {number} tz múi giờ, mặc định VN +7
 */
export function buildDay(y, m, d, tz = DEFAULT_TZ) {
  const { core, lich } = computeDayInfo(y, m, d, tz);
  return { ...core, canChiThang: lich.canChi.thang, canChiNam: lich.canChi.nam };
}

/**
 * Grid lịch 1 tháng dương lịch đầy đủ — cho tab "Lịch" (C2).
 * @param {number} year năm dương
 * @param {number} month tháng dương (1-12)
 * @param {number} tz múi giờ, mặc định VN +7
 * @returns {{thangAm: {thang:number, nam:number, nhuan:boolean, tenThang:string}, days: object[]}}
 */
export function buildMonth(year, month, tz = DEFAULT_TZ) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const days = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const { core } = computeDayInfo(year, month, d, tz);
    days.push(core);
  }
  // thangAm: đại diện bằng ngày giữa tháng (15) — tránh lệch cạnh đầu/cuối tháng gần Tết
  // (1 tháng dương có thể chứa 2 tháng âm khác nhau ở 2 đầu tháng).
  const mid = duongToAm({ nam: year, thang: month, ngay: 15 }, tz);
  const thangAm = {
    thang: mid.am.thang,
    nam: mid.am.nam,
    nhuan: mid.am.isLeap,
    tenThang: tenThangAm(mid.am.thang, mid.am.isLeap),
  };
  return { thangAm, days };
}

// Re-export nội bộ cho tests.
export { tinhTruc, tinhGioHoangDao, tinhNgayHoangHacDao, tinhNgayKy, tenThangAm, tietKhiOfDay, TEN_24_TIET_KHI, TRUC_12, SAO_12_HOANG_HAC };
