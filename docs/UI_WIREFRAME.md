# UI Wireframe — Tu Vi Local App

> Design **FULL** (theo user confirm — không simple). Inspired by tuvi.cohoc.net (chart) + tuvichanco.vn (form clarity).

## 1. Layout tổng quan

```
┌─────────────────────────────────────────────────────────────────────┐
│  HEADER                                                             │
│  Tu Vi Local · v0.1.0 · [📁 Charts] [⚙️ Settings] [📥 Import]       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌────────────────────┐  ┌──────────────────────────────────────┐  │
│  │  INPUT FORM (300px) │  │  CHART (rest)                        │  │
│  │                    │  │                                      │  │
│  │  Họ tên: [____]    │  │  ┌──┬──┬──┬──┐                       │  │
│  │  Năm:    [1988]    │  │  │Tỵ│Ngọ│Mùi│Thân│                  │  │
│  │  Tháng:  [4]       │  │  ├──┼──┴──┼──┤                       │  │
│  │  Ngày:   [11]      │  │  │Thìn        │Dậu│                  │  │
│  │  Giờ:    [11:25]   │  │  │     INFO   │                      │  │
│  │  GT:     ○Nam ●Nữ  │  │  │     CENTER │                      │  │
│  │  Lịch:   ●Dương... │  │  │            │                      │  │
│  │                    │  │  │Mão         │Tuất│                 │  │
│  │  ─────────────     │  │  ├──┼──┬──┼──┤                       │  │
│  │  Năm xem: [2026]   │  │  │Dần│Sửu│Tí│Hợi│                  │  │
│  │                    │  │  └──┴──┴──┴──┘                       │  │
│  │  Phái:             │  │                                      │  │
│  │   ●VN  ○TQ         │  │  [⬇️ Save PNG] [💾 Save JSON]         │  │
│  │  Tử Vân: ☑️         │  │  [📝 Export MD] [🔍 Zoom] [🖨️ Print] │  │
│  │                    │  │                                      │  │
│  │  [🚀 LẬP LÁ SỐ]    │  │                                      │  │
│  └────────────────────┘  └──────────────────────────────────────┘  │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  FOOTER                                                             │
│  Sao info on hover · Click cung để xem chi tiết · Export Markdown   │
└─────────────────────────────────────────────────────────────────────┘
```

## 2. Input form (left panel)

```
┌────────────────────────────────────┐
│  📋 Thông tin lá số                 │
├────────────────────────────────────┤
│                                    │
│  Họ tên (anonymous OK):            │
│  ┌──────────────────────────────┐  │
│  │ Nữ Mậu Thìn 1988             │  │
│  └──────────────────────────────┘  │
│                                    │
│  Lịch:                             │
│   ◉ Dương lịch  ○ Âm lịch          │
│                                    │
│  Năm:    ┌──────┐                  │
│          │ 1988 │                  │
│          └──────┘                  │
│                                    │
│  Tháng:  ┌──┐ Ngày: ┌──┐           │
│          │ 4│       │11│           │
│          └──┘       └──┘           │
│                                    │
│  Giờ sinh (24h):                   │
│  ┌──┐ : ┌──┐                       │
│  │11│   │25│                       │
│  └──┘   └──┘                       │
│                                    │
│  Giới tính:                        │
│   ○ Nam   ◉ Nữ                     │
│                                    │
│  ──────────────────────────────    │
│  ⚙️ Tuỳ chọn nâng cao              │
│  ──────────────────────────────    │
│                                    │
│  Năm xem (lưu niên):               │
│  ┌──────┐                          │
│  │ 2026 │                          │
│  └──────┘                          │
│                                    │
│  Phái:                             │
│   ◉ Việt Nam  ○ Trung Quốc         │
│                                    │
│  ☑️ Khái niệm Tử Vân                │
│      (Lai nhân, Nguyên thần,       │
│       Huyền khí, Sao chủ Cục)      │
│                                    │
│  ┌────────────────────────────┐    │
│  │  🚀 LẬP LÁ SỐ              │    │
│  └────────────────────────────┘    │
│                                    │
└────────────────────────────────────┘
```

## 3. Chart layout (right panel) — SVG 12 cung

**Bố cục 4×4 với center info:**

```
┌─────────┬─────────┬─────────┬─────────┐
│  Tỵ     │  Ngọ    │  Mùi    │  Thân   │
│  43     │  33     │  23     │  13     │
│  T5     │  T6     │  T7     │  T8     │
│  TÀI    │  TỬ TỨC │  PHU    │  HUYNH  │
│  BẠCH   │         │  QUÂN   │  ĐỆ     │
│         │         │         │         │
│  Thái   │  Tham   │  Thiên  │  Vũ     │
│  Âm(H)  │  Lang(H)│  Đồng(H)│  Khúc(V)│
│  Hoá Q  │  Hoá L  │  Cự Môn │  Thiên  │
│         │  Kình D │  (H)    │  Tướng  │
│         │         │  Thiên  │  (M)    │
│         │         │  Việt   │  Hoả(H) │
│  ...    │  ...    │  ...    │  ...    │
├─────────┼─────────┴─────────┼─────────┤
│  Thìn   │                   │  Dậu    │
│  53     │                   │  3      │
│  T4     │   ╔═════════════╗ │  T9     │
│  TẬT    │   ║  HỌ TÊN     ║ │  MỆNH   │
│  ÁCH    │   ║  Mậu Thìn 88║ │  <THÂN> │
│         │   ║  Nữ          ║ │         │
│  Liêm   │   ║  Đại Lâm Mộc║ │  Thái   │
│  Trinh  │   ║  Mộc Tam Cục║ │  Dương  │
│  (M)    │   ║  Dương Nữ   ║ │  (H)    │
│  Thiên  │   ║  Mệnh chủ:  ║ │  Thiên  │
│  Phủ(V) │   ║   Liêm Trinh║ │  Lương  │
│  Văn    │   ║  Thân chủ:  ║ │  (H)    │
│  Xương  │   ║   Văn Xương ║ │  Hoá K  │
│  L.Triệt│   ║  Lai nhân:  ║ │  Hữu Bật│
│  ...    │   ║   Mệnh       ║ │  ...    │
│         │   ║  ĐH4: 33-42 ║ │         │
│         │   ║   Tử Tức    ║ │         │
│         │   ║  Năm 2026 = ║ │         │
│         │   ║   Bính Ngọ  ║ │         │
│         │   ╚═════════════╝ │         │
├─────────┼─────────┬─────────┼─────────┤
│  Mão    │  Dần    │  Sửu    │  Tuất   │
│  ...    │  ...    │  ...    │  ...    │
├─────────┴─────────┴─────────┴─────────┤
│  ⬇️ Save PNG  💾 Save JSON  📝 MD     │
│  [🔍] [🖨️] [📁 Charts đã lưu]         │
└───────────────────────────────────────┘
```

## 4. Color coding (chart)

| Element | Color | Note |
|---|---|---|
| **Cung Mệnh** | Background: light gold `#fff8dc` | Highlight |
| **Thân cư** | Border: gold 2px | Mark `<THÂN>` |
| **Cung tiểu hạn** (năm xem) | Background: light blue `#e6f3ff` | Highlight |
| **Cung đại hạn hiện tại** | Border: blue 2px dashed | |
| **Chính tinh** | Color: `#000`, font bold 14px | Lớn nhất |
| **Phụ tinh cát** (Lục Cát + sao tài) | Color: `#0066cc` (xanh) | |
| **Phụ tinh sát** (Lục Sát + sát tạp) | Color: `#cc0000` (đỏ) | |
| **Phụ tinh trung** | Color: `#666` (xám) | |
| **Tứ Hoá** | Color: `#ff8800` (cam), bold | Hoá Lộc/Quyền/Khoa |
| **Tứ Hoá Kỵ** | Color: `#cc0000` (đỏ), bold | |
| **Tuần** | Background ô con: light pink `#ffe6e6` | |
| **Triệt** | Background ô con: light yellow `#ffffcc` | Black bar overlay |
| **Lưu (lưu niên)** | Prefix `L.` + color: `#9900cc` (tím) | |
| **Đại vận** (ĐV.) | Prefix `ĐV.` + color: `#009900` (xanh lá) | Tứ Hoá đại hạn |
| **Miếu Vượng** | Suffix `(M)`, `(V)`, `(Đ)`, `(B)`, `(H)` after star name | Đỏ nếu Hãm |

## 5. Interaction

### 5.1. Click cung → xem chi tiết

Modal popup hiển thị:
- Tên cung + chi + Can cung
- Toàn bộ sao trong cung (chính tinh, phụ tinh, vòng, Tứ Hoá)
- Miếu vượng từng sao
- Cách cục đồng cung (nếu có)
- User notes (textarea cho phép edit + save vào IndexedDB)
- Wikilink ra MOC vault (nếu cấu hình link Obsidian)

### 5.2. Hover sao → tooltip

Tooltip:
- Tên Hán + nghĩa
- Bộ (Tử Vi bộ / Thiên Phủ bộ / Lục Cát / Lục Sát / Vòng / Tứ Hoá)
- Miếu vượng
- 1-2 dòng ý nghĩa cơ bản
- Link "Xem chi tiết" → mở Obsidian note tương ứng (nếu có deep link)

### 5.3. Top toolbar

| Button | Action |
|---|---|
| **📁 Charts** | Mở list lá số đã lưu (IndexedDB) |
| **⚙️ Settings** | Toggle phái default, theme, font size, deep link Obsidian |
| **📥 Import** | Import JSON chart từ file |

### 5.4. Bottom toolbar (sau khi lập lá số)

| Button | Action |
|---|---|
| **⬇️ Save PNG** | Export chart ra PNG (1200×1600) |
| **💾 Save JSON** | Export schema JSON ra file `.json` |
| **📝 Export MD** | Export Markdown cho Obsidian (CS template) |
| **🔍 Zoom** | Zoom chart (in-place) |
| **🖨️ Print** | In chart (print-friendly CSS) |

## 6. Settings panel

```
┌──────────────────────────────────────┐
│  ⚙️ SETTINGS                          │
├──────────────────────────────────────┤
│                                      │
│  Phái default:                       │
│   ◉ Việt Nam  ○ Trung Quốc           │
│                                      │
│  Theme:                              │
│   ◉ Light  ○ Dark  ○ Sepia           │
│                                      │
│  Font size chart:                    │
│   [Small] [Medium] [Large] [XL]      │
│                                      │
│  Deep link Obsidian (optional):      │
│  ┌──────────────────────────────┐    │
│  │ obsidian://vault/Tu_Vi       │    │
│  └──────────────────────────────┘    │
│                                      │
│  Markdown export template:           │
│  ┌──────────────────────────────┐    │
│  │ Default (CS-template)        │ ▼  │
│  └──────────────────────────────┘    │
│                                      │
│  ☑️ Hiển thị nguyệt vận               │
│  ☑️ Hiển thị tiểu hạn                 │
│  ☑️ Hiển thị đại hạn                  │
│  ☑️ Hiển thị Tử Vân                   │
│  ☑️ Hiển thị cách cục (auto-detect)   │
│                                      │
│  Cache:                              │
│   Lá số đã lưu: 12                   │
│   [🗑️ Clear cache]                   │
│                                      │
│  [💾 Save] [❌ Cancel]                │
│                                      │
└──────────────────────────────────────┘
```

## 7. Charts list panel

```
┌──────────────────────────────────────────────────┐
│  📁 LÁ SỐ ĐÃ LƯU (12)             🔍 [_______]  │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │ ⭐ Nữ Mậu Thìn 1988                      │   │
│  │   Mệnh Dậu — Nhật Lương Hãm              │   │
│  │   📅 Tạo 2026-04-26  [Open] [Delete]     │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │   Nam Giáp Tuất 1994                     │   │
│  │   Mệnh Tuất — Thiên Đồng Hãm             │   │
│  │   📅 Tạo 2026-04-25  [Open] [Delete]     │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ... (10 lá số khác)                            │
│                                                  │
│  [➕ Lá số mới] [📥 Import] [⬇️ Export all]      │
│                                                  │
└──────────────────────────────────────────────────┘
```

## 8. Responsive

- **Desktop ≥1024px**: 2 panel side-by-side (form + chart)
- **Tablet 768-1023px**: chart top, form bottom
- **Mobile ≤767px**: chart full width, form ẩn (toggle `☰` button)

## 9. Accessibility

- Keyboard shortcuts:
  - `Enter` trên form = lập lá số
  - `Ctrl/Cmd + S` = Save PNG
  - `Ctrl/Cmd + J` = Save JSON
  - `Ctrl/Cmd + M` = Export MD
- ARIA labels cho chart cells
- Color không phải tín hiệu duy nhất (text label đầy đủ)
