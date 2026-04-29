// data.js — Constants cho Tu Vi Local
// All reference data: 10 Can, 12 Chi, 60 hoa giáp, Nạp Âm, bảng Cục, Mệnh chủ, Thân chủ

export const CAN = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
export const CHI = ["Tí", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];

export const CAN_INDEX = Object.fromEntries(CAN.map((c, i) => [c, i]));
export const CHI_INDEX = Object.fromEntries(CHI.map((c, i) => [c, i]));

// Can Dương (5) vs Can Âm (5)
export const CAN_DUONG = new Set(["Giáp", "Bính", "Mậu", "Canh", "Nhâm"]);
export const CAN_AM = new Set(["Ất", "Đinh", "Kỷ", "Tân", "Quý"]);

export function isCanDuong(can) {
  return CAN_DUONG.has(can);
}

// 12 chi giờ → range giờ tây
export const CHI_GIO = [
  { chi: "Tí", start: 23, end: 1 },   // 23:00 - 0:59 (overnight)
  { chi: "Sửu", start: 1, end: 3 },
  { chi: "Dần", start: 3, end: 5 },
  { chi: "Mão", start: 5, end: 7 },
  { chi: "Thìn", start: 7, end: 9 },
  { chi: "Tỵ", start: 9, end: 11 },
  { chi: "Ngọ", start: 11, end: 13 },
  { chi: "Mùi", start: 13, end: 15 },
  { chi: "Thân", start: 15, end: 17 },
  { chi: "Dậu", start: 17, end: 19 },
  { chi: "Tuất", start: 19, end: 21 },
  { chi: "Hợi", start: 21, end: 23 },
];

// Tam hợp (4 nhóm)
export const TAM_HOP = {
  "Dần Ngọ Tuất": ["Dần", "Ngọ", "Tuất"],
  "Thân Tí Thìn": ["Thân", "Tí", "Thìn"],
  "Tỵ Dậu Sửu":   ["Tỵ", "Dậu", "Sửu"],
  "Hợi Mão Mùi":  ["Hợi", "Mão", "Mùi"],
};

export function getTamHop(chi) {
  for (const [name, group] of Object.entries(TAM_HOP)) {
    if (group.includes(chi)) return name;
  }
  return null;
}

// Ngũ Hổ Độn — Can tháng Giêng theo Can năm
export const NGU_HO_DON = {
  "Giáp": "Bính", "Kỷ":  "Bính",
  "Ất":   "Mậu",  "Canh": "Mậu",
  "Bính": "Canh", "Tân":  "Canh",
  "Đinh": "Nhâm", "Nhâm": "Nhâm",
  "Mậu":  "Giáp", "Quý":  "Giáp",
};

// Ngũ Thử Độn — Can giờ Tí theo Can ngày
export const NGU_THU_DON = {
  "Giáp": "Giáp", "Kỷ":  "Giáp",
  "Ất":   "Bính", "Canh": "Bính",
  "Bính": "Mậu",  "Tân":  "Mậu",
  "Đinh": "Canh", "Nhâm": "Canh",
  "Mậu":  "Nhâm", "Quý":  "Nhâm",
};

// Bảng Nạp Âm (60 Hoa Giáp → Nạp Âm)
// Key: "Can Chi" → Nạp Âm
export const NAP_AM = {
  "Giáp Tí":   "Hải Trung Kim",   "Ất Sửu":   "Hải Trung Kim",
  "Bính Dần":  "Lư Trung Hoả",   "Đinh Mão": "Lư Trung Hoả",
  "Mậu Thìn":  "Đại Lâm Mộc",    "Kỷ Tỵ":    "Đại Lâm Mộc",
  "Canh Ngọ":  "Lộ Bàng Thổ",    "Tân Mùi":  "Lộ Bàng Thổ",
  "Nhâm Thân": "Kiếm Phong Kim", "Quý Dậu":  "Kiếm Phong Kim",
  "Giáp Tuất": "Sơn Đầu Hoả",    "Ất Hợi":   "Sơn Đầu Hoả",
  "Bính Tí":   "Giản Hạ Thuỷ",   "Đinh Sửu": "Giản Hạ Thuỷ",
  "Mậu Dần":   "Thành Đầu Thổ",  "Kỷ Mão":   "Thành Đầu Thổ",
  "Canh Thìn": "Bạch Lạp Kim",   "Tân Tỵ":   "Bạch Lạp Kim",
  "Nhâm Ngọ":  "Dương Liễu Mộc", "Quý Mùi":  "Dương Liễu Mộc",
  "Giáp Thân": "Tuyền Trung Thuỷ", "Ất Dậu": "Tuyền Trung Thuỷ",
  "Bính Tuất": "Ốc Thượng Thổ",  "Đinh Hợi": "Ốc Thượng Thổ",
  "Mậu Tí":    "Thích Lịch Hoả", "Kỷ Sửu":   "Thích Lịch Hoả",
  "Canh Dần":  "Tùng Bách Mộc",  "Tân Mão":  "Tùng Bách Mộc",
  "Nhâm Thìn": "Trường Lưu Thuỷ", "Quý Tỵ": "Trường Lưu Thuỷ",
  "Giáp Ngọ":  "Sa Trung Kim",   "Ất Mùi":   "Sa Trung Kim",
  "Bính Thân": "Sơn Hạ Hoả",     "Đinh Dậu": "Sơn Hạ Hoả",
  "Mậu Tuất":  "Bình Địa Mộc",   "Kỷ Hợi":   "Bình Địa Mộc",
  "Canh Tí":   "Bích Thượng Thổ", "Tân Sửu": "Bích Thượng Thổ",
  "Nhâm Dần":  "Kim Bạch Kim",   "Quý Mão":  "Kim Bạch Kim",
  "Giáp Thìn": "Phú Đăng Hoả",   "Ất Tỵ":    "Phú Đăng Hoả",
  "Bính Ngọ":  "Thiên Hà Thuỷ",  "Đinh Mùi": "Thiên Hà Thuỷ",
  "Mậu Thân":  "Đại Trạch Thổ",  "Kỷ Dậu":   "Đại Trạch Thổ",
  "Canh Tuất": "Thoa Xuyến Kim", "Tân Hợi":  "Thoa Xuyến Kim",
  "Nhâm Tí":   "Tang Đố Mộc",    "Quý Sửu":  "Tang Đố Mộc",
  "Giáp Dần":  "Đại Khê Thuỷ",   "Ất Mão":   "Đại Khê Thuỷ",
  "Bính Thìn": "Sa Trung Thổ",   "Đinh Tỵ":  "Sa Trung Thổ",
  "Mậu Ngọ":   "Thiên Thượng Hoả", "Kỷ Mùi": "Thiên Thượng Hoả",
  "Canh Thân": "Thạch Lựu Mộc",  "Tân Dậu":  "Thạch Lựu Mộc",
  "Nhâm Tuất": "Đại Hải Thuỷ",   "Quý Hợi":  "Đại Hải Thuỷ",
};

// Bảng Cục — sửa cells SAI từ Phase A.5 (Mậu Quý)
export const CUC_TABLE = {
  "Giáp Kỷ": {
    "Tý Sửu":   "Thuỷ Nhị",
    "Dần Mão":  "Hoả Lục",
    "Thìn Tỵ":  "Mộc Tam",
    "Ngọ Mùi":  "Thổ Ngũ",
    "Thân Dậu": "Kim Tứ",
    "Tuất Hợi": "Hoả Lục",
  },
  "Ất Canh": {
    "Tý Sửu":   "Hoả Lục",
    "Dần Mão":  "Thổ Ngũ",
    "Thìn Tỵ":  "Kim Tứ",
    "Ngọ Mùi":  "Mộc Tam",
    "Thân Dậu": "Thuỷ Nhị",
    "Tuất Hợi": "Hoả Lục",
  },
  "Bính Tân": {
    "Tý Sửu":   "Thổ Ngũ",
    "Dần Mão":  "Hoả Lục",
    "Thìn Tỵ":  "Thuỷ Nhị",
    "Ngọ Mùi":  "Kim Tứ",
    "Thân Dậu": "Mộc Tam",
    "Tuất Hợi": "Thổ Ngũ",
  },
  "Đinh Nhâm": {
    "Tý Sửu":   "Mộc Tam",
    "Dần Mão":  "Kim Tứ",
    "Thìn Tỵ":  "Thổ Ngũ",
    "Ngọ Mùi":  "Hoả Lục",
    "Thân Dậu": "Hoả Lục",
    "Tuất Hợi": "Mộc Tam",
  },
  "Mậu Quý": {
    "Tý Sửu":   "Hoả Lục",   // sửa A.5
    "Dần Mão":  "Thuỷ Nhị",
    "Thìn Tỵ":  "Hoả Lục",
    "Ngọ Mùi":  "Thuỷ Nhị",
    "Thân Dậu": "Mộc Tam",   // sửa A.5 (verify CS-013)
    "Tuất Hợi": "Kim Tứ",
  },
};

// Helper lookup Cục
export const CAN_NAM_GROUP = {
  "Giáp": "Giáp Kỷ", "Kỷ": "Giáp Kỷ",
  "Ất":   "Ất Canh", "Canh": "Ất Canh",
  "Bính": "Bính Tân", "Tân": "Bính Tân",
  "Đinh": "Đinh Nhâm", "Nhâm": "Đinh Nhâm",
  "Mậu":  "Mậu Quý", "Quý": "Mậu Quý",
};

export const CHI_MENH_PAIR = {
  "Tí": "Tý Sửu", "Sửu": "Tý Sửu",
  "Dần": "Dần Mão", "Mão": "Dần Mão",
  "Thìn": "Thìn Tỵ", "Tỵ": "Thìn Tỵ",
  "Ngọ": "Ngọ Mùi", "Mùi": "Ngọ Mùi",
  "Thân": "Thân Dậu", "Dậu": "Thân Dậu",
  "Tuất": "Tuất Hợi", "Hợi": "Tuất Hợi",
};

// Cục → số + ĐH1 tuổi khởi
export const CUC_INFO = {
  "Thuỷ Nhị": { so: 2, dh1: 2, hanh: "Thuỷ" },
  "Mộc Tam":  { so: 3, dh1: 3, hanh: "Mộc" },
  "Kim Tứ":   { so: 4, dh1: 4, hanh: "Kim" },
  "Thổ Ngũ":  { so: 5, dh1: 5, hanh: "Thổ" },
  "Hoả Lục":  { so: 6, dh1: 6, hanh: "Hoả" },
};

// Mệnh chủ theo Chi năm
export const MENH_CHU = {
  "Tí":   "Tham Lang",
  "Sửu":  "Cự Môn", "Hợi":  "Cự Môn",
  "Dần":  "Lộc Tồn", "Tuất": "Lộc Tồn",
  "Mão":  "Văn Khúc", "Dậu":  "Văn Khúc",
  "Thìn": "Liêm Trinh", "Thân": "Liêm Trinh",
  "Tỵ":   "Vũ Khúc", "Mùi":  "Vũ Khúc",
  "Ngọ":  "Phá Quân",
};

// Thân chủ — phái VN (đảo Ngọ-Tuất so với TQ)
export const THAN_CHU_VN = {
  "Tí":   "Hoả Tinh", "Ngọ": "Văn Xương",   // VN: Ngọ → Văn Xương (đảo TQ)
  "Sửu":  "Thiên Tướng", "Mùi":  "Thiên Tướng",
  "Dần":  "Thiên Lương", "Thân": "Thiên Lương",
  "Mão":  "Thiên Đồng",  "Dậu":  "Thiên Đồng",
  "Thìn": "Văn Xương",   "Tuất": "Hoả Tinh",   // VN: Tuất → Hoả Tinh (đảo TQ)
  "Tỵ":   "Thiên Cơ", "Hợi":  "Thiên Cơ",
};

export const THAN_CHU_TQ = {
  "Tí":   "Hoả Tinh", "Ngọ": "Hoả Tinh",
  "Sửu":  "Thiên Tướng", "Mùi":  "Thiên Tướng",
  "Dần":  "Thiên Lương", "Thân": "Thiên Lương",
  "Mão":  "Thiên Đồng",  "Dậu":  "Thiên Đồng",
  "Thìn": "Văn Xương",   "Tuất": "Văn Xương",
  "Tỵ":   "Thiên Cơ", "Hợi":  "Thiên Cơ",
};

// 12 cung tên theo thứ tự ngược kim đồng hồ từ Mệnh
export const TEN_CUNG_12 = [
  "Mệnh", "Phụ Mẫu", "Phúc Đức", "Điền Trạch",
  "Quan Lộc", "Nô Bộc", "Thiên Di", "Tật Ách",
  "Tài Bạch", "Tử Tức", "Phu Thê", "Huynh Đệ"
];

// Ngũ hành của 12 chi (cung)
export const CHI_NGU_HANH = {
  "Tí":   "Thuỷ", "Sửu":  "Thổ", "Dần":  "Mộc", "Mão":  "Mộc",
  "Thìn": "Thổ",  "Tỵ":   "Hoả", "Ngọ":  "Hoả", "Mùi":  "Thổ",
  "Thân": "Kim",  "Dậu":  "Kim", "Tuất": "Thổ",  "Hợi":  "Thuỷ",
};

// Phân loại sao chi tiết — dùng cho layout 2 cột cát/sát
export const SAO_CAT_LIST = new Set([
  // Lục Cát
  "Tả Phụ", "Hữu Bật", "Văn Xương", "Văn Khúc", "Thiên Khôi", "Thiên Việt",
  // Sao tài + động (cát)
  "Lộc Tồn", "Thiên Mã",
  // Đào hoa cát
  "Hồng Loan", "Thiên Hỉ", "Đào Hoa", "Hoa Cái",
  // Cát tạp
  "Long Trì", "Phượng Các", "Tam Thai", "Bát Toạ",
  "Ân Quang", "Thiên Quý", "Thai Phụ", "Phong Cáo",
  "Thiên Y", "Thiên Quan", "Thiên Phúc",
  // Cát tạp mới (verify An Hai Phong chart)
  "Thiên Trù", "Nguyệt Đức", "Thiên Đức", "Giải Thần",
  // Tài/thọ tinh
  "Thiên Tài", "Thiên Thọ",
]);

export const SAO_SAT_LIST = new Set([
  // Lục Sát
  "Kình Dương", "Đà La", "Hoả Tinh", "Linh Tinh", "Địa Không", "Địa Kiếp",
  // Sát tạp
  "Thiên Hình", "Thiên Diêu", "Thiên Không",
  // Cô khốc
  "Cô Thần", "Quả Tú", "Thiên Khốc", "Thiên Hư",
  // Thương sứ
  "Thiên Thương", "Thiên Sứ",
  // Khác
  "Đường Phù",
  // Sát tạp mới (verify An Hai Phong chart)
  "Phá Toái", "Lưu Hà", "Âm Sát", "Thiên La", "Địa Võng", "Kiếp Sát",
]);

// Trung tính: hiện tại không còn (đã re-classify Hoa Cái + Thiên Tài/Thọ vào cát).
// Giữ Set rỗng để compat với engine.js categorizeStar()
export const SAO_TRUNG_TINH = new Set([]);

// 6 loại Thân cư theo khoảng cách Mệnh-Thân
export const THAN_CU_LOAI = {
  0:  "Mệnh",
  2:  "Phúc Đức",
  4:  "Quan Lộc",
  6:  "Thiên Di",
  8:  "Tài Bạch",
  10: "Phu Thê",
};

// Sao chủ Cục (Tử Vân)
export const SAO_CHU_CUC = {
  "Thuỷ Nhị": "Văn Khúc",
  "Mộc Tam":  "Tham Lang",
  "Kim Tứ":   "Vũ Khúc",
  "Thổ Ngũ":  "Lộc Tồn",
  "Hoả Lục":  "Phá Quân",
};

// ============================================================
// 14 CHÍNH TINH — Bộ + Offset
// ============================================================

// Bộ Tử Vi (6 sao): offset NGHỊCH từ Tử Vi
export const BO_TU_VI = {
  "Tử Vi":      0,
  "Thiên Cơ":   -1,
  "Thái Dương": -3,
  "Vũ Khúc":    -4,
  "Thiên Đồng": -5,
  "Liêm Trinh": -8,
};

// Bộ Thiên Phủ (8 sao): offset THUẬN từ Thiên Phủ
export const BO_THIEN_PHU = {
  "Thiên Phủ":   0,
  "Thái Âm":     1,
  "Tham Lang":   2,
  "Cự Môn":      3,
  "Thiên Tướng": 4,
  "Thiên Lương": 5,
  "Thất Sát":    6,
  "Phá Quân":    10,
};

// Tất cả 14 chính tinh
export const CHINH_TINH_14 = [
  "Tử Vi", "Thiên Cơ", "Thái Dương", "Vũ Khúc", "Thiên Đồng", "Liêm Trinh",
  "Thiên Phủ", "Thái Âm", "Tham Lang", "Cự Môn", "Thiên Tướng", "Thiên Lương", "Thất Sát", "Phá Quân"
];

// ============================================================
// MIẾU VƯỢNG ĐẮC HÃM — Phái VN (theo Vũ Tài Lộc)
// 14 sao × 12 chi = 168 entries
// Từ vault: vault/03-Thư Viện Tra Cứu/Bảng Tra/Bảng Miếu Vượng - Phái VN.md
// ============================================================
// Format: Object<sao, [chi0..chi11]> với chi 0=Tí, 1=Sửu, ..., 11=Hợi
// Values: M=Miếu, V=Vượng, Đ=Đắc, B=Bình hoà, H=Hãm

export const MIEU_VUONG_VN = {
  //          Tí, Sửu, Dần, Mão, Thìn, Tỵ, Ngọ, Mùi, Thân, Dậu, Tuất, Hợi
  "Tử Vi":   ["V","B","Đ","H","V","H","M","B","Đ","H","V","H"],
  "Thiên Cơ":["V","B","Đ","M","V","B","V","B","Đ","Đ","V","B"],
  "Thái Dương":["H","Đ","V","V","V","M","M","Đ","B","H","H","H"],
  "Vũ Khúc": ["Đ","M","Đ","H","M","H","Đ","M","Đ","H","M","H"],
  "Thiên Đồng":["Đ","B","Đ","V","H","M","H","B","V","B","H","M"],
  "Liêm Trinh":["H","B","M","V","B","H","V","B","M","V","B","H"],
  "Thiên Phủ":["Đ","V","M","B","V","B","Đ","V","M","B","V","B"],
  "Thái Âm": ["M","V","H","H","H","H","H","B","Đ","V","V","M"],
  "Tham Lang":["V","M","V","Đ","M","B","V","M","V","Đ","M","B"],
  "Cự Môn":  ["V","B","V","M","Đ","H","V","B","V","M","Đ","H"],
  "Thiên Tướng":["Đ","Đ","V","B","M","B","V","Đ","V","B","M","B"],
  "Thiên Lương":["M","V","M","Đ","B","H","M","V","M","Đ","B","H"],
  "Thất Sát":["Đ","M","V","Đ","M","B","Đ","M","V","Đ","M","B"],
  "Phá Quân":["M","B","Đ","H","V","H","M","B","H","H","V","H"],
};

// ============================================================
// TỨ HOÁ — Phái VN
// ============================================================
// [Hoá Lộc, Hoá Quyền, Hoá Khoa, Hoá Kỵ]
export const TU_HOA_VN = {
  "Giáp": ["Liêm Trinh",  "Phá Quân",   "Vũ Khúc",    "Thái Dương"],
  "Ất":   ["Thiên Cơ",    "Thiên Lương","Tử Vi",      "Thái Âm"],
  "Bính": ["Thiên Đồng",  "Thiên Cơ",   "Văn Xương",  "Liêm Trinh"],
  "Đinh": ["Thái Âm",     "Thiên Đồng", "Thiên Cơ",   "Cự Môn"],
  "Mậu":  ["Tham Lang",   "Thái Âm",    "Hữu Bật",    "Thiên Cơ"],
  "Kỷ":   ["Vũ Khúc",     "Tham Lang",  "Thiên Lương","Văn Khúc"],
  "Canh": ["Thái Dương",  "Vũ Khúc",    "Thái Âm",    "Thiên Đồng"],
  "Tân":  ["Cự Môn",      "Thái Dương", "Văn Khúc",   "Văn Xương"],
  "Nhâm": ["Thiên Lương", "Tử Vi",      "Tả Phụ",     "Vũ Khúc"],
  "Quý":  ["Phá Quân",    "Cự Môn",     "Thái Âm",    "Tham Lang"],
};

export const TU_HOA_TQ = {
  // TQ khác VN ở: Mậu Khoa Thái Dương, Canh Kỵ Thiên Tướng, Nhâm Khoa Thiên Phủ, Đinh Khoa Thiên Cơ
  "Giáp": ["Liêm Trinh",  "Phá Quân",   "Vũ Khúc",    "Thái Dương"],
  "Ất":   ["Thiên Cơ",    "Thiên Lương","Tử Vi",      "Thái Âm"],
  "Bính": ["Thiên Đồng",  "Thiên Cơ",   "Văn Xương",  "Liêm Trinh"],
  "Đinh": ["Thái Âm",     "Thiên Đồng", "Thiên Cơ",   "Cự Môn"],
  "Mậu":  ["Tham Lang",   "Thái Âm",    "Thái Dương", "Thiên Cơ"],
  "Kỷ":   ["Vũ Khúc",     "Tham Lang",  "Thiên Lương","Văn Khúc"],
  "Canh": ["Thái Dương",  "Vũ Khúc",    "Thái Âm",    "Thiên Tướng"],
  "Tân":  ["Cự Môn",      "Thái Dương", "Văn Khúc",   "Văn Xương"],
  "Nhâm": ["Thiên Lương", "Tử Vi",      "Thiên Phủ",  "Vũ Khúc"],
  "Quý":  ["Phá Quân",    "Cự Môn",     "Thái Âm",    "Tham Lang"],
};

// ============================================================
// TUẦN — Lục Thập Hoa Giáp
// ============================================================
// 6 tuần, mỗi tuần 10 năm. Tuần thiếu 2 chi.
// Bảng map: chi của Giáp khởi tuần → 2 chi Tuần
export const TUAN_TABLE = {
  "Tí":   ["Tuất", "Hợi"],   // Giáp Tí → Tuần Tuất Hợi
  "Tuất": ["Thân", "Dậu"],
  "Thân": ["Ngọ", "Mùi"],
  "Ngọ":  ["Thìn", "Tỵ"],
  "Thìn": ["Dần", "Mão"],
  "Dần":  ["Tí", "Sửu"],
};

// ============================================================
// TRIỆT — theo Can năm
// ============================================================
export const TRIET_TABLE = {
  "Giáp": ["Thân", "Dậu"], "Kỷ": ["Thân", "Dậu"],
  "Ất":   ["Ngọ", "Mùi"],  "Canh": ["Ngọ", "Mùi"],
  "Bính": ["Thìn", "Tỵ"],  "Tân": ["Thìn", "Tỵ"],
  "Đinh": ["Dần", "Mão"],  "Nhâm": ["Dần", "Mão"],
  "Mậu":  ["Tí", "Sửu"],   "Quý": ["Tí", "Sửu"],
};

// ============================================================
// LỤC CÁT (6 sao) — bảng tra
// ============================================================

// Thiên Khôi - Thiên Việt (theo Can năm) — phái VN
// Format: [Khôi_chi, Việt_chi]
// Verify CS-013 (Mậu): Khôi Sửu, Việt Mùi ✓
// Verify CS-016 (Canh): Khôi NGỌ, Việt DẦN (chart software phái VN dùng Canh khác Tân — đảo cặp)
export const KHOI_VIET = {
  "Giáp": ["Sửu", "Mùi"], "Mậu":  ["Sửu", "Mùi"],
  "Ất":   ["Tí",  "Thân"], "Kỷ":  ["Tí",  "Thân"],
  "Bính": ["Hợi", "Dậu"], "Đinh": ["Hợi", "Dậu"],
  "Canh": ["Ngọ", "Dần"],   // Canh: Khôi Ngọ, Việt Dần (đảo so với Tân)
  "Tân":  ["Dần", "Ngọ"],   // Tân: Khôi Dần, Việt Ngọ
  "Nhâm": ["Mão", "Tỵ"],  "Quý":  ["Mão", "Tỵ"],
};

// Thiên Quan + Thiên Phúc (theo Can năm) — phái VN
export const THIEN_QUAN = {
  "Giáp": "Mùi", "Ất":   "Thìn", "Bính": "Tỵ",  "Đinh": "Dần",
  "Mậu":  "Mão", "Kỷ":   "Dậu",  "Canh": "Hợi", "Tân":  "Dậu",
  "Nhâm": "Tuất", "Quý":  "Ngọ",
};
export const THIEN_PHUC = {
  "Giáp": "Dậu", "Ất":   "Thân", "Bính": "Tí",  "Đinh": "Hợi",
  "Mậu":  "Mão", "Kỷ":   "Dần",  "Canh": "Ngọ", "Tân":  "Tỵ",
  "Nhâm": "Ngọ", "Quý":  "Tỵ",
};

// Lưu Hà (theo Can năm)
export const LUU_HA = {
  "Giáp": "Dậu", "Ất":   "Tuất", "Bính": "Mùi", "Đinh": "Thân",
  "Mậu":  "Tỵ",  "Kỷ":   "Ngọ",  "Canh": "Thìn","Tân":  "Mão",
  "Nhâm": "Hợi", "Quý":  "Dần",
};

// Thiên Trù (theo Can năm)
export const THIEN_TRU = {
  "Giáp": "Tỵ",  "Ất":   "Ngọ", "Bính": "Tí",   "Đinh": "Tỵ",
  "Mậu":  "Ngọ", "Kỷ":   "Thân","Canh": "Dần",  "Tân":  "Ngọ",
  "Nhâm": "Dậu", "Quý":  "Tuất",
};

// Lộc Tồn (theo Can năm)
export const LOC_TON = {
  "Giáp": "Dần", "Ất":  "Mão",
  "Bính": "Tỵ",  "Đinh": "Ngọ",
  "Mậu":  "Tỵ",  "Kỷ":   "Ngọ",
  "Canh": "Thân", "Tân": "Dậu",
  "Nhâm": "Hợi", "Quý":  "Tí",
};

// ============================================================
// LỤC SÁT — Hoả Tinh + Linh Tinh khởi cung (theo Chi năm tam hợp)
// ============================================================
export const HOA_TINH_KHOI = {
  "Dần Ngọ Tuất": "Sửu",
  "Thân Tí Thìn": "Dần",
  "Tỵ Dậu Sửu":   "Mão",
  "Hợi Mão Mùi":  "Dậu",
};

export const LINH_TINH_KHOI = {
  "Dần Ngọ Tuất": "Mão",
  "Thân Tí Thìn": "Tuất",
  "Tỵ Dậu Sửu":   "Tuất",
  "Hợi Mão Mùi":  "Hợi",   // verify An Hai Phong (Mão+giờ Thân THUẬN → Mùi)
};

// ============================================================
// ĐÀO HOA + HOA CÁI (Chi năm tam hợp)
// ============================================================
export const DAO_HOA = {
  "Dần Ngọ Tuất": "Mão",
  "Thân Tí Thìn": "Dậu",
  "Tỵ Dậu Sửu":   "Ngọ",
  "Hợi Mão Mùi":  "Tí",
};

export const HOA_CAI = {
  "Dần Ngọ Tuất": "Tuất",
  "Thân Tí Thìn": "Thìn",
  "Tỵ Dậu Sửu":   "Sửu",
  "Hợi Mão Mùi":  "Mùi",
};

// ============================================================
// THIÊN MÃ (Chi năm tam hợp)
// ============================================================
export const THIEN_MA = {
  "Dần Ngọ Tuất": "Thân",
  "Thân Tí Thìn": "Dần",
  "Tỵ Dậu Sửu":   "Hợi",
  "Hợi Mão Mùi":  "Tỵ",
};

// Kiếp Sát (Chi năm tam hợp) = chi đầu tam hợp + 9
export const KIEP_SAT = {
  "Dần Ngọ Tuất": "Hợi",
  "Thân Tí Thìn": "Tỵ",
  "Tỵ Dậu Sửu":   "Dần",
  "Hợi Mão Mùi":  "Thân",
};

// Giải Thần (Chi năm tam hợp) = chi cuối tam hợp
export const GIAI_THAN = {
  "Dần Ngọ Tuất": "Tuất",
  "Thân Tí Thìn": "Thìn",
  "Tỵ Dậu Sửu":   "Sửu",
  "Hợi Mão Mùi":  "Mùi",
};

// ============================================================
// CÔ THẦN + QUẢ TÚ (Chi năm theo nhóm 4 mùa)
// ============================================================
export const CO_THAN_QUA_TU = {
  "Tí":   ["Dần", "Tuất"], "Sửu":  ["Dần", "Tuất"], "Hợi":  ["Dần", "Tuất"],
  "Dần":  ["Tỵ", "Sửu"],   "Mão":  ["Tỵ", "Sửu"],   "Thìn": ["Tỵ", "Sửu"],
  "Tỵ":   ["Thân", "Thìn"], "Ngọ":  ["Thân", "Thìn"], "Mùi":  ["Thân", "Thìn"],
  "Thân": ["Hợi", "Mùi"],  "Dậu":  ["Hợi", "Mùi"],  "Tuất": ["Hợi", "Mùi"],
};

// ============================================================
// 15+ CÁCH CỤC từ chính tinh đồng cung
// ============================================================
export const CACH_CUC_DOI = {
  "Tử Vi+Thiên Phủ":      "Tử Phủ Đồng Cung",
  "Tham Lang+Tử Vi":      "Tử Tham (Đào Hoa Phạm Chủ)",
  "Phá Quân+Tử Vi":       "Tử Phá",
  "Thiên Tướng+Tử Vi":    "Tử Tướng",
  "Thất Sát+Tử Vi":       "Tử Sát",
  "Thiên Phủ+Vũ Khúc":    "Vũ Phủ",
  "Tham Lang+Vũ Khúc":    "Vũ Tham",
  "Phá Quân+Vũ Khúc":     "Vũ Phá",
  "Thiên Tướng+Vũ Khúc":  "Vũ Tướng",
  "Thất Sát+Vũ Khúc":     "Vũ Sát",
  "Liêm Trinh+Thiên Phủ": "Liêm Phủ",
  "Liêm Trinh+Tham Lang": "Liêm Tham",
  "Liêm Trinh+Phá Quân":  "Liêm Phá",
  "Liêm Trinh+Thiên Tướng": "Liêm Tướng",
  "Liêm Trinh+Thất Sát":  "Liêm Sát",
  "Thái Âm+Thiên Đồng":   "Đồng Nguyệt",
  "Cự Môn+Thiên Đồng":    "Đồng Cự",
  "Thiên Lương+Thiên Đồng": "Đồng Lương",
  "Cự Môn+Thái Dương":    "Nhật Cự",
  "Thiên Lương+Thái Dương": "Nhật Lương",
  "Thái Âm+Thái Dương":   "Nhật Nguyệt Đồng Cung",
  "Thái Âm+Thiên Cơ":     "Cơ Nguyệt",
  "Cự Môn+Thiên Cơ":      "Cơ Cự",
  "Thiên Lương+Thiên Cơ": "Cơ Lương",
};

// ============================================================
// M3 — 3 VÒNG (Thái Tuế / Bác Sĩ / Trường Sinh)
// ============================================================

export const SAO_VONG_THAI_TUE = [
  "Thái Tuế", "Thiếu Dương", "Tang Môn", "Thiếu Âm",
  "Quan Phù", "Tử Phù", "Tuế Phá", "Long Đức",
  "Bạch Hổ", "Phúc Đức", "Điếu Khách", "Trực Phù",
];

export const SAO_VONG_BAC_SI = [
  "Bác Sĩ", "Lực Sĩ", "Thanh Long", "Tiểu Hao",
  "Tướng Quân", "Tấu Thư", "Phi Liêm", "Hỷ Thần",
  "Bệnh Phù", "Đại Hao", "Phục Binh", "Quan Phủ",
];

export const SAO_VONG_TRUONG_SINH = [
  "Trường Sinh", "Mộc Dục", "Quan Đới", "Lâm Quan",
  "Đế Vượng", "Suy", "Bệnh", "Tử",
  "Mộ", "Tuyệt", "Thai", "Dưỡng",
];

// Khởi Trường Sinh theo Cục
export const TRUONG_SINH_KHOI = {
  "Thuỷ Nhị": "Thân",   // chi 8
  "Mộc Tam":  "Hợi",    // chi 11
  "Kim Tứ":   "Tỵ",     // chi 5
  "Thổ Ngũ":  "Thân",   // chi 8 (cùng Thuỷ Nhị)
  "Hoả Lục":  "Dần",    // chi 2
};

// ============================================================
// M3 — TIỂU HẠN (theo tam hợp Chi năm sinh)
// ============================================================
export const TIEU_HAN_KHOI = {
  "Dần Ngọ Tuất": "Thìn",  // chi 4
  "Thân Tí Thìn": "Tuất",  // chi 10
  "Tỵ Dậu Sửu":   "Mùi",   // chi 7
  "Hợi Mão Mùi":  "Sửu",   // chi 1
};

// ============================================================
// M3 — TAM TAI (3 năm hạn theo tam hợp Chi năm sinh)
// ============================================================
export const TAM_TAI_TABLE = {
  "Thân Tí Thìn": ["Dần", "Mão", "Thìn"],
  "Tỵ Dậu Sửu":   ["Hợi", "Tí", "Sửu"],
  "Dần Ngọ Tuất": ["Thân", "Dậu", "Tuất"],
  "Hợi Mão Mùi":  ["Tỵ", "Ngọ", "Mùi"],
};

// ============================================================
// M3 — LƯU VĂN XƯƠNG / VĂN KHÚC theo Can năm xem
// (khác bản gốc — bản gốc theo Giờ sinh)
// ============================================================
export const LUU_XUONG_KHUC = {
  "Giáp": ["Tỵ", "Dậu"],   // [L.Văn Xương, L.Văn Khúc]
  "Ất":   ["Ngọ", "Thân"],
  "Bính": ["Thân", "Ngọ"],
  "Đinh": ["Dậu", "Tỵ"],
  "Mậu":  ["Thân", "Ngọ"],
  "Kỷ":   ["Dậu", "Tỵ"],
  "Canh": ["Hợi", "Mão"],
  "Tân":  ["Tí",  "Dần"],
  "Nhâm": ["Dần", "Tí"],
  "Quý":  ["Mão", "Hợi"],
};
