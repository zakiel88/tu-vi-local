# Build Plan — Phase D

> Step-by-step kế hoạch implement app local. 4 milestones (M1-M4), mỗi milestone verify với case study trong vault trước khi sang milestone tiếp.

## Tổng quan

| Milestone | Scope | Files | Verify |
|---|---|---|---|
| **M1** | Engine cơ bản: lịch pháp + 12 cung + Mệnh-Thân-Cục | lunar.js, can_chi.js, cung.js, menh_than_cuc.js, data/ | CS-013 cung Mệnh = Dậu, Cục = Mộc Tam |
| **M2** | Sao đầy đủ: 14 chính tinh + ~40 phụ tinh + Tứ Hoá + Tuần Triệt | chinh_tinh.js, phu_tinh.js, tu_hoa.js, tuan_triet.js | CS-013 4 Tứ Hoá đúng |
| **M3** | 3 vòng + đại hạn + lưu niên + Tử Vân + cách cục | vong.js, dai_han.js, luu_nien.js, tu_van.js, cach_cuc.js | CS-013 ĐH4 Tử Tức Ngọ + lưu niên 2026 đầy đủ |
| **M4** | UI + render SVG + save PNG + storage | render.js, save.js, storage.js, main.js, index.html, css/ | Chart hiển thị đẹp, save PNG OK |

---

## M1 — Engine cơ bản (~3-5 ngày)

### Goals
- ✅ Đổi dương → âm chính xác
- ✅ Tính được Can-Chi của Năm-Tháng-Ngày-Giờ
- ✅ An được 12 cung + Can cung
- ✅ Tìm được Mệnh + Thân + Thân cư
- ✅ Tìm được Cục + Mệnh chủ + Thân chủ

### Tasks

| # | Task | Output |
|---|---|---|
| 1.1 | Build bảng âm lịch JSON 1900-2100 (~5MB) | `data/lunar_table.json` |
| 1.2 | Implement `lunar.js`: `duongToAm(date)` + `tinhCanChi(...)` | function exports |
| 1.3 | Implement `can_chi.js`: Ngũ Hổ Độn + Ngũ Thử Độn | functions |
| 1.4 | Implement `cung.js`: an 12 cung + Can cung | function `an12Cung(input)` |
| 1.5 | Implement `menh_than_cuc.js`: Mệnh + Thân + Thân cư + Cục + Mệnh chủ + Thân chủ | functions |
| 1.6 | `data/can_chi.json`: 60 hoa giáp + Nạp Âm + bảng Cục + bảng Mệnh chủ/Thân chủ | JSON |
| 1.7 | Test với CS-013: in ra `console.log` từng bước | Pass = match chart |

### Build bảng âm lịch (sub-task 1.1)

**Approach 1 (recommend):** Pre-compute bằng Node.js script + thư viện thiên văn:
```
1. npm install (Node helper, không phải runtime)
2. Generate lunar_table.json từ Hong Kong Observatory data + Meeus algorithm
3. Verify với 2 nguồn (Wikipedia, lichvietnam.gov.vn)
4. Strip ra bảng JSON 200 năm × 365 ngày
```

**Approach 2 (alternative):** Manual data entry từ bảng có sẵn — quá mất thời gian, skip.

**Output JSON format:**
```json
{
  "1988-04-11": {
    "year": 1988,
    "month": 2,
    "day": 25,
    "isLeap": false,
    "yearCanChi": "Mậu Thìn",
    "monthCanChi": "Ất Mão",
    "dayCanChi": "Bính Thân"
  },
  "1988-04-12": { ... },
  ...
}
```

### Verify M1

```javascript
// tests/verify_cs013.js
import { duongToAm } from '../js/lunar.js';
import { an12Cung } from '../js/cung.js';
import { anMenhThanCuc } from '../js/menh_than_cuc.js';

const input = {
    nam: 1988, thang: 4, ngay: 11, gio: 11, phut: 25,
    gioiTinh: 'nu'
};

const am = duongToAm(input);
console.assert(am.month === 2 && am.day === 25, "Lịch pháp sai");

const cung12 = an12Cung(am);
const result = anMenhThanCuc(am, input.gioiTinh, cung12);
console.assert(result.menh.chi === 'Dậu', "Mệnh sai");
console.assert(result.cuc.ten === 'Mộc Tam', "Cục sai");
console.assert(result.thanCu === 'Mệnh', "Thân cư sai");

console.log("✅ M1 verify CS-013 PASS");
```

---

## M2 — Sao đầy đủ (~3-5 ngày)

### Goals
- ✅ An 14 chính tinh + Miếu Vượng (VN + TQ option)
- ✅ An ~40 phụ tinh
- ✅ Tứ Hoá năm sinh
- ✅ Tuần - Triệt

### Tasks

| # | Task | Output |
|---|---|---|
| 2.1 | `data/stars/chinh_tinh.json`: bảng offset 5 sao bộ Tử Vi + 7 sao bộ Phủ | JSON |
| 2.2 | `data/stars/mieu_vuong_vn.json`: 14 sao × 12 chi (168 cells) | JSON |
| 2.3 | `data/stars/mieu_vuong_tq.json`: bảng TQ (toggle) | JSON |
| 2.4 | `chinh_tinh.js`: `anTuVi(cuc, ngay)` + `an14ChinhTinh(...)` + `tinhMieuVuong(...)` | functions |
| 2.5 | `data/stars/phu_tinh.json`: bảng tra cho ~40 phụ tinh | JSON |
| 2.6 | `phu_tinh.js`: `anLucCat(...)` + `anLucSat(...)` + `anSaoLe(...)` | functions |
| 2.7 | `data/stars/tu_hoa.json`: 10 Can × 4 Hoá (VN + TQ) | JSON |
| 2.8 | `tu_hoa.js`: `anTuHoa(canNam, viTriSao)` | function |
| 2.9 | `tuan_triet.js`: `anTuanTriet(canNam, chiNam)` | function |
| 2.10 | Verify CS-013: 14 chính tinh + 4 Tứ Hoá + Tuần-Triệt | console.log |

### Verify M2

```javascript
const result = an14ChinhTinh(cuc.so, am.day);
console.assert(result['Tử Vi'] === 0, "Tử Vi sai");  // Tí
console.assert(result['Thái Dương'] === 9, "Thái Dương sai");  // Dậu
// ... 12 sao khác

const tuHoa = anTuHoa('Mậu', { ...result, ...phuTinh });
console.assert(tuHoa.hoa_loc.sao === 'Tham Lang', "Hoá Lộc sai");
console.assert(tuHoa.hoa_quyen.sao === 'Thái Âm', "Hoá Quyền sai");
console.assert(tuHoa.hoa_khoa.sao === 'Hữu Bật', "Hoá Khoa sai");
console.assert(tuHoa.hoa_ky.sao === 'Thiên Cơ', "Hoá Kỵ sai");

const tuanTriet = anTuanTriet('Mậu', 'Thìn');
console.assert(JSON.stringify(tuanTriet.tuan_chi.sort()) === '["Hợi","Tuất"]', "Tuần sai");
console.assert(JSON.stringify(tuanTriet.triet_chi.sort()) === '["Sửu","Tí"]', "Triệt sai");

console.log("✅ M2 verify CS-013 PASS");
```

---

## M3 — Vòng + Đại hạn + Lưu niên + Tử Vân + Cách cục (~3-5 ngày)

### Goals
- ✅ 3 vòng (Thái Tuế, Bác Sĩ, Trường Sinh) cho 36 vị trí
- ✅ Đại hạn 12 cung + tiểu hạn năm xem
- ✅ Lưu niên ~20 sao lưu + Tam Tai
- ✅ Tử Vân: Sao chủ Cục (full) + Lai nhân (manual input) + Nguyên thần (giả thuyết) + Huyền khí (skip)
- ✅ Cách cục: detect 15+ cách cơ bản

### Tasks

| # | Task | Output |
|---|---|---|
| 3.1 | `data/stars/vong.json`: 12 sao × 3 vòng + offset | JSON |
| 3.2 | `vong.js`: 3 functions cho 3 vòng | functions |
| 3.3 | `dai_han.js`: `anDaiHan(cucSo, cungMenh, isThuan, currentAge)` + `anTieuHan(...)` | functions |
| 3.4 | `luu_nien.js`: `anLuuNien(canNamXem, chiNamXem, ...)` ~20 sao lưu | function |
| 3.5 | `tu_van.js`: 4 functions (Sao chủ Cục, Lai nhân, Nguyên thần, Huyền khí) | functions |
| 3.6 | `data/stars/cach_cuc.json`: 15+ cách cục với pattern detection | JSON |
| 3.7 | `cach_cuc.js`: `detectCachCuc(viTri14ChinhTinh)` | function |
| 3.8 | Verify CS-013: ĐH4 + lưu niên 2026 + 4 cách cục | console.log |

### Verify M3

```javascript
const dh = anDaiHan(3, 9, false, 39);  // Mộc Tam, Mệnh Dậu, nghịch (Dương Nữ), 39t
console.assert(dh[3].is_current === true, "ĐH4 hiện tại sai");
console.assert(dh[3].chi_cung === 6, "ĐH4 Ngọ sai");

const luu = anLuuNien('Bính', 'Ngọ', ...);
console.assert(luu.luu_thai_tue.chi === 'Ngọ', "Lưu Thái Tuế sai");
console.assert(luu.luu_tu_hoa.hoa_loc.sao === 'Thiên Đồng', "Lưu Lộc sai");

const cachCuc = detectCachCuc(chinhTinhVN);
console.assert(cachCuc.includes('Nhật Lương Hãm'), "Cách Nhật Lương Hãm sai");

console.log("✅ M3 verify CS-013 PASS");
```

---

## M4 — UI + Render + Save + Storage (~5-7 ngày)

### Goals
- ✅ Form input HTML đẹp
- ✅ SVG chart 12 cung render đầy đủ
- ✅ Save PNG/JPG/JSON/Markdown
- ✅ IndexedDB cho list charts
- ✅ Tooltip + click cung modal

### Tasks

| # | Task | Output |
|---|---|---|
| 4.1 | `index.html`: layout chính (form + chart + toolbar) | HTML |
| 4.2 | `css/ui.css`: form + control style | CSS |
| 4.3 | `css/chart.css`: SVG chart style + color coding | CSS |
| 4.4 | `js/render.js`: `renderChart(chartJSON)` → SVG output | function |
| 4.5 | `js/main.js`: bind events, gọi engine, render | entry |
| 4.6 | `js/save.js`: export PNG (html2canvas) + JSON + Markdown | functions |
| 4.7 | `js/storage.js`: IndexedDB save/load list charts | functions |
| 4.8 | Settings panel + Charts list panel | HTML + JS |
| 4.9 | Tooltip sao + click cung modal | JS + CSS |
| 4.10 | Test với 4 case (CS-001/013/015/016) | Visual + functional |

### Verify M4

- Visual: chart hiển thị giống chart tuvi.cohoc.net (CS-013 reference)
- PNG export đúng layout
- IndexedDB lưu/load chart OK
- Tooltip hover + click cung modal hoạt động

---

## Estimate tổng thời gian

| Milestone | Estimate | Cumulative |
|---|---|---|
| M1 | 3-5 ngày | 3-5 ngày |
| M2 | 3-5 ngày | 6-10 ngày |
| M3 | 3-5 ngày | 9-15 ngày |
| M4 | 5-7 ngày | **14-22 ngày** |

→ **Tổng: ~3 tuần** với pace bình thường (mỗi ngày 2-4h research/code).

---

## Risk + Mitigation

| Risk | Probability | Mitigation |
|---|---|---|
| Bảng âm lịch sai | Medium | Verify với 5+ ngày từ 2 nguồn |
| Bảng Cục có cell sai (như đã phát hiện) | Medium | Verify với 4 case (CS-001/013/015/016) |
| Bảng Miếu Vượng phái khác nhau | High | Toggle VN/TQ + show source |
| Hoả Tinh khởi cung khác phái | Medium | Toggle V1/V2 trong settings |
| Tử Vân thuật toán không chính xác | High | Manual input + badge "experimental" |
| html2canvas có bug với SVG | Low | Fallback: SVG export trực tiếp + open trong tab mới |
| IndexedDB browser support | Low | Modern browser (Chrome/Firefox/Safari/Edge) |

---

## Dependency

- **Không có external runtime dependencies** (vanilla JS)
- **Build helper (Node.js)**: chỉ dùng để generate `lunar_table.json` 1 lần
- **CDN libs**: chỉ `html2canvas` cho PNG export (có thể download offline)

---

## Sau Phase D

- **Phase E (optional)**: thêm features
  - Auto-luận giải cơ bản (dựa trên cách cục + Mệnh chủ)
  - Compare 2 lá số (so sánh hôn nhân, đồng nghiệp)
  - Tử Vi cho doanh nghiệp (lập theo ngày khai trương)
  - Multi-user / sync (nếu cần)
- **Open source** sau khi stable
