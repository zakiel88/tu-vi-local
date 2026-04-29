# JSON Schema — Chart Output

> Output JSON sau khi engine xử lý xong. Format dùng cho:
> 1. Lưu local (IndexedDB)
> 2. Export file (download `.json`)
> 3. Render chart (input cho `render.js`)
> 4. Export Markdown (cho Obsidian)

## 1. Top-level schema

```json
{
  "version": "1.0",
  "id": "uuid-v4",
  "created_at": "2026-04-26T15:00:00Z",
  "input": { ... },
  "lich_phap": { ... },
  "menh_than_cuc": { ... },
  "cung_12": [ ... ],
  "tu_hoa_nam_sinh": { ... },
  "tuan_triet": { ... },
  "dai_han": [ ... ],
  "luu_nien": { ... },
  "tu_van": { ... },
  "cach_cuc": [ ... ],
  "metadata": { ... }
}
```

## 2. Detail từng field

### 2.1. `input`

```json
{
  "ho_ten": "(optional, anonymous)",
  "duong_lich": {
    "nam": 1988,
    "thang": 4,
    "ngay": 11,
    "gio": 11,
    "phut": 25
  },
  "gioi_tinh": "nu",        // "nam" | "nu"
  "phai": "vn",             // "vn" | "tq"
  "nam_xem": 2026,
  "tu_van_enabled": true,
  "lai_nhan_cung": "auto"   // "auto" hoặc cung cụ thể (nếu user biết)
}
```

### 2.2. `lich_phap`

```json
{
  "duong_lich": {
    "nam": 1988, "thang": 4, "ngay": 11, "gio": 11, "phut": 25
  },
  "am_lich": {
    "nam": 1988, "thang": 2, "thang_nhuan": false, "ngay": 25
  },
  "can_chi": {
    "nam":  { "can": "Mậu", "chi": "Thìn" },
    "thang": { "can": "Ất", "chi": "Mão" },
    "ngay":  { "can": "Bính", "chi": "Thân" },
    "gio":   { "can": "Giáp", "chi": "Ngọ" }
  },
  "nap_am": "Đại Lâm Mộc",
  "am_duong": "duong_nu",  // "duong_nam" | "am_nam" | "duong_nu" | "am_nu"
  "is_thuan_dai_han": false  // false = nghịch (Âm Nam / Dương Nữ)
}
```

### 2.3. `menh_than_cuc`

```json
{
  "menh": {
    "chi": "Dậu",
    "chi_index": 9
  },
  "than": {
    "chi": "Dậu",
    "chi_index": 9,
    "than_cu": "Mệnh"   // 1 trong 6: Mệnh, Phụ Mẫu... (chỉ 6 cung)
  },
  "cuc": {
    "ten": "Mộc Tam",
    "so": 3,
    "sao_chu_cuc": "Tham Lang",
    "dh1_tuoi": 3
  },
  "menh_chu": {
    "sao": "Liêm Trinh",
    "vi_tri_chi": 4,
    "vi_tri_cung": "Tật Ách"
  },
  "than_chu": {
    "sao_vn": "Văn Xương",
    "sao_tq": "Văn Xương",
    "vi_tri_chi": 4,
    "vi_tri_cung": "Tật Ách"
  },
  "cung_phi_kinh_dich": {
    "que": "Chấn",
    "huong": "Đông",
    "tu_menh": "Đông"   // "Đông" | "Tây"
  },
  "menh_cuc_relation": "binh_hoa"  // "binh_hoa" | "cuc_sinh_menh" | "menh_sinh_cuc" | "cuc_khac_menh" | "menh_khac_cuc"
}
```

### 2.4. `cung_12` (array 12 phần tử, index 0 = Tí, 11 = Hợi)

```json
[
  {
    "chi": "Tí",
    "chi_index": 0,
    "ten_cung": "Điền Trạch",
    "can_cung": "Giáp",
    "chinh_tinh": [
      { "ten": "Tử Vi", "mieu_vuong": "B" }
    ],
    "phu_tinh": [
      { "ten": "Văn Xương", "mieu_vuong": "M", "loai": "luc_cat" },
      { "ten": "Thiên Khôi", "mieu_vuong": "-", "loai": "luc_cat" }
      // ... nhiều phụ tinh khác
    ],
    "vong_thai_tue": "Bạch Hổ",       // 1 sao Vòng Thái Tuế
    "vong_bac_si": "Lực Sĩ",          // 1 sao Vòng Bác Sĩ
    "vong_truong_sinh": "Mộc Dục",    // 1 sao Vòng Trường Sinh
    "tu_hoa_nam_sinh": [],            // array (có thể 0-2 Hoá đóng cung)
    "tu_hoa_dai_han": [],             // Tứ Hoá đại hạn theo Can cung
    "tu_hoa_luu_nien": [],            // Tứ Hoá lưu năm xem
    "is_tuan_ban": false,
    "is_triet_ban": true,
    "is_luu_tuan": false,
    "is_luu_triet": false,
    "dai_han_tuoi": "93-102",         // mốc tuổi đại hạn cung này
    "is_tieu_han_now": false,
    "ghi_chu": []                     // user notes
  },
  // ... 11 cung còn lại
]
```

### 2.5. `tu_hoa_nam_sinh`

```json
{
  "hoa_loc":   { "sao": "Tham Lang",   "chi": "Ngọ", "cung": "Tử Tức" },
  "hoa_quyen": { "sao": "Thái Âm",     "chi": "Tỵ",  "cung": "Tài Bạch" },
  "hoa_khoa":  { "sao": "Hữu Bật",     "chi": "Dậu", "cung": "Mệnh" },
  "hoa_ky":    { "sao": "Thiên Cơ",    "chi": "Hợi", "cung": "Phúc Đức" }
}
```

### 2.6. `tuan_triet`

```json
{
  "tuan_giap": "Giáp Tí",
  "tuan_chi": ["Tuất", "Hợi"],
  "triet_chi": ["Tí", "Sửu"],
  "tuan_triet_giap": []   // cung có cả Tuần + Triệt cùng đóng (đặc biệt)
}
```

### 2.7. `dai_han` (array 12)

```json
[
  {
    "index": 1,
    "tuoi_khoi": 3, "tuoi_ket": 12,
    "chi_cung": "Dậu",
    "ten_cung": "Mệnh",
    "is_current": false
  },
  // ... 11 đại hạn còn lại
  {
    "index": 4,
    "tuoi_khoi": 33, "tuoi_ket": 42,
    "chi_cung": "Ngọ",
    "ten_cung": "Tử Tức",
    "is_current": true,
    "tu_hoa_dh": { ... }   // Tứ Hoá đại hạn theo Can cung Ngọ
  }
]
```

### 2.8. `luu_nien`

```json
{
  "nam_xem": 2026,
  "can_chi_nam_xem": "Bính Ngọ",
  "luu_thai_tue": { "chi": "Ngọ", "cung": "Tử Tức" },
  "luu_tu_hoa": {
    "hoa_loc":   { "sao": "Thiên Đồng",  "chi": "Mùi", "cung": "Phu Quân" },
    "hoa_quyen": { "sao": "Thiên Cơ",    "chi": "Hợi", "cung": "Phúc Đức" },
    "hoa_khoa":  { "sao": "Văn Xương",   "chi": "Thân", "cung": "Huynh Đệ" },
    "hoa_ky":    { "sao": "Liêm Trinh",  "chi": "Thìn", "cung": "Tật Ách" }
  },
  "luu_tuan_chi": ["Dần", "Mão"],
  "luu_triet_chi": ["Thìn", "Tỵ"],
  "luu_loc_ton": "Tỵ",
  "luu_kinh_duong": "Ngọ",
  "luu_da_la": "Thìn",
  "luu_thien_khoi": "Hợi",
  "luu_thien_viet": "Dậu",
  "luu_van_xuong": "Thân",
  "luu_van_khuc": "Ngọ",
  "luu_hong_loan": ...,
  "luu_thien_hi": ...,
  "luu_thien_ma": "Dần",
  "luu_van_tinh": "...",
  "luu_dao_hoa": "...",
  "luu_tang_mon": "Thân",
  "luu_bach_ho": "Dần",
  "luu_tue_pha": "Tí",
  "luu_dieu_khach": "Thìn",
  "luu_thai_tue_chi_nam_sinh": "Thìn",  // Thái Tuế năm sinh đóng cung gì
  "tieu_han": { "chi": "Mùi", "cung": "Phu Quân" },
  "is_tam_tai": false
}
```

### 2.9. `tu_van` (chỉ có khi enabled)

```json
{
  "lai_nhan_cung": {
    "cung": "Mệnh",
    "ý_nghĩa": "Kiếp trước đến từ chính bản thân — tự định mệnh"
  },
  "nguyen_than": ["Huynh Đệ", "Mệnh"],
  "huyen_khi": -4.76,
  "sao_chu_cuc": {
    "sao": "Tham Lang",
    "vi_tri_chi": 6,
    "vi_tri_cung": "Tử Tức"
  }
}
```

### 2.10. `cach_cuc` (array)

```json
[
  { "ten": "Nhật Lương Hãm", "vi_tri": "Mệnh Dậu", "tinh_chat": "Hung" },
  { "ten": "Tử Phủ Đồng Cung", "vi_tri": "Nô Bộc Dần", "tinh_chat": "Cát" },
  { "ten": "Liêm Phủ", "vi_tri": "Tật Ách Thìn", "tinh_chat": "Cát" }
  // ...
]
```

### 2.11. `metadata`

```json
{
  "engine_version": "0.1.0",
  "computed_at": "2026-04-26T15:00:00Z",
  "verify_status": {
    "vs_chart_software": "matches_95",
    "mismatches": []
  },
  "user_notes": "..."
}
```

## 3. Validation rules

- **`chi_index`**: 0-11 (Tí-Hợi)
- **`mieu_vuong`**: enum "M" / "V" / "Đ" / "B" / "H" / "-"
- **`cuc.so`**: 2/3/4/5/6
- **`am_duong`**: "duong_nam" | "am_nam" | "duong_nu" | "am_nu"
- **`than_cu`**: 1 trong 6 cung (Mệnh, Phụ Mẫu, Phúc Đức, Điền Trạch, Quan Lộc, Nô Bộc, Thiên Di, Tật Ách, Tài Bạch, Tử Tức, Phu Thê, Huynh Đệ — nhưng chỉ 6 cung khả dĩ)
- **`huyen_khi`**: float, range -10 đến +10 (cần research thêm)

## 4. Export formats

### 4.1. JSON download (raw)

`tuvi-{timestamp}.json` — full schema trên.

### 4.2. PNG/JPG (chart image)

Render SVG → Canvas → PNG/JPG. Default 1200×1600px, có thể custom.

### 4.3. Markdown (cho Obsidian)

Format theo template CS hiện có trong vault:
- Frontmatter YAML
- Section "0. Thông tin cơ bản" + "0.5 Mệnh 2.0" + "12 cung tóm tắt"
- Wikilinks tự động cho sao + cách cục
