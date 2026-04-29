# Tu Vi Local — Technical Spec (Phase C)

> Spec đầy đủ cho prototype. Phase D sẽ implement theo spec này.

## 1. Tech stack chốt

| Layer | Choice | Lý do |
|---|---|---|
| **Frontend** | HTML + JS vanilla (ES modules) | Chạy từ `file://` hoặc serve nhẹ; không build step |
| **Render chart** | SVG inline | Sắc nét, scale tốt, dễ export PNG |
| **Lịch âm dương** | **TỰ BUILD** bảng JSON 1900-2100 | Theo yêu cầu user — không dùng external lib |
| **DB local** | JSON file (per-chart) + IndexedDB (list) | Persist offline; có thể export/import |
| **Save ảnh** | `html2canvas` (CDN) → Canvas → PNG | Không cần backend |
| **Toggle phái** | VN (default) / TQ (option) | Theo CLAUDE.md rule 8 |
| **Khái niệm Tử Vân** | Lai nhân, Nguyên thần, Huyền khí, Sao chủ Cục — toggle on/off | User confirm support |
| **Serve** | `python -m http.server 8000` hoặc `npx serve` | Local only |

## 2. Folder structure (final)

```
tools/tuvi-local/
├── README.md                       # overview
├── index.html                      # main UI (single page)
├── docs/
│   ├── SPEC.md                     # this file
│   ├── JSON_SCHEMA.md              # schema chart output
│   ├── UI_WIREFRAME.md             # UI design
│   └── BUILD_PLAN.md               # M1-M4 milestones
├── data/
│   ├── lunar_table.json            # bảng âm lịch 1900-2100 (~5 MB)
│   ├── can_chi.json                # 60 hoa giáp + Nạp Âm + Cục
│   ├── stars/
│   │   ├── chinh_tinh.json         # 14 chính tinh: bộ + offset
│   │   ├── phu_tinh.json           # ~40 phụ tinh: cách an
│   │   ├── mieu_vuong_vn.json      # bảng Miếu Vượng VN
│   │   ├── mieu_vuong_tq.json      # bảng Miếu Vượng TQ (toggle)
│   │   ├── tu_hoa.json             # bảng Tứ Hoá VN + TQ
│   │   ├── vong.json               # 12 sao × 3 vòng
│   │   ├── cach_cuc.json           # 15+ cách cục cơ bản
│   │   └── tu_van.json             # 4 khái niệm Tử Vân
│   └── charts/                     # local DB lá số đã lập
│       └── *.json
├── js/
│   ├── lunar.js                    # đổi dương → âm + tháng nhuận + 12 chi giờ
│   ├── can_chi.js                  # Can Chi + Ngũ Hổ Độn + Ngũ Thử Độn
│   ├── cung.js                     # an 12 cung + Can cung
│   ├── menh_than_cuc.js            # an Mệnh, Thân, Cục, 6 Thân cư, Mệnh chủ, Thân chủ
│   ├── chinh_tinh.js               # an Tử Vi + 14 chính tinh + Miếu Vượng
│   ├── phu_tinh.js                 # an ~40 phụ tinh
│   ├── vong.js                     # 3 vòng (Thái Tuế, Bác Sĩ, Trường Sinh)
│   ├── tu_hoa.js                   # Tứ Hoá năm sinh + lưu
│   ├── tuan_triet.js               # Tuần - Triệt + lưu
│   ├── dai_han.js                  # đại hạn + tiểu hạn
│   ├── luu_nien.js                 # lưu niên + Tam Tai
│   ├── tu_van.js                   # 4 khái niệm Tử Vân
│   ├── cach_cuc.js                 # detect cách cục
│   ├── render.js                   # SVG chart 12 cung
│   ├── save.js                     # export PNG/JPG/JSON
│   ├── storage.js                  # IndexedDB + JSON persist
│   ├── chart_engine.js             # orchestrator: input → output JSON
│   └── main.js                     # entry: bind UI events
├── css/
│   ├── chart.css                   # SVG chart style
│   ├── ui.css                      # form + control
│   └── print.css                   # in chart
└── tests/
    ├── verify_cs001.js             # CS-001 reference
    ├── verify_cs013.js             # CS-013 reference
    └── verify_cs015.js             # CS-015 reference
```

## 3. Data flow (chart engine)

```
┌─────────────────────────────────────────────────────────────┐
│  USER INPUT (form)                                          │
│  • Năm/Tháng/Ngày dương + Giờ + Phút                        │
│  • Giới tính (Nam/Nữ)                                       │
│  • Phái (VN/TQ)                                             │
│  • Năm xem (default = năm hiện tại)                         │
│  • Toggle Tử Vân (on/off)                                   │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: Lịch pháp (lunar.js)                               │
│  → âm lịch + Can-Chi-Năm-Tháng-Ngày-Giờ                     │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: 12 cung (cung.js)                                  │
│  → vị trí 12 cung + Can cung                                │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: Mệnh-Thân-Cục (menh_than_cuc.js)                   │
│  → Mệnh + Thân + Thân cư + Cục + Mệnh chủ + Thân chủ        │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 4: 14 chính tinh + Miếu Vượng (chinh_tinh.js)         │
│  → Tử Vi → 5 sao bộ Tử Vi → Thiên Phủ → 7 sao bộ Phủ        │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 5: Phụ tinh (phu_tinh.js)                             │
│  → ~40 phụ tinh (Lục Cát + Lục Sát + sao lẻ + cố định)      │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 6: 3 vòng (vong.js)                                   │
│  → Vòng Thái Tuế + Bác Sĩ + Trường Sinh = 36 vị trí        │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 7: Tứ Hoá năm sinh (tu_hoa.js)                        │
│  → 4 Hoá đóng cung tương ứng                                │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 8: Tuần - Triệt (tuan_triet.js)                       │
│  → 2 cung Tuần + 2 cung Triệt bản                           │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 9: Đại hạn + Tiểu hạn (dai_han.js)                    │
│  → 12 đại hạn + cung tiểu hạn năm xem                       │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 10: Lưu niên (luu_nien.js)                            │
│  → ~20 sao lưu cho năm xem + Tam Tai check                  │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 11: Tử Vân (tu_van.js) — IF toggle ON                 │
│  → Lai nhân cung + Nguyên thần + Huyền khí + Sao chủ Cục    │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 12: Cách cục (cach_cuc.js)                            │
│  → Detect 15+ cách cục cơ bản                               │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  OUTPUT: JSON chart (xem JSON_SCHEMA.md)                    │
│  → render.js: SVG 12 cung                                   │
│  → save.js: PNG/JPG/JSON/Markdown                           │
│  → storage.js: lưu IndexedDB                                │
└─────────────────────────────────────────────────────────────┘
```

## 4. Build sequence (Phase D milestones)

| Milestone | Scope | Verify |
|---|---|---|
| **M1** | lunar.js + can_chi.js + cung.js + menh_than_cuc.js | CS-013 cung Mệnh = Dậu, Cục = Mộc Tam |
| **M2** | chinh_tinh.js + phu_tinh.js + tu_hoa.js | CS-013 14 chính tinh + 6 phụ tinh + 4 Tứ Hoá đúng |
| **M3** | vong.js + tuan_triet.js + dai_han.js + luu_nien.js + cach_cuc.js + tu_van.js | CS-013 đại hạn + lưu niên 2026 đúng |
| **M4** | render.js (SVG) + save.js (PNG) + storage.js + main.js + UI | Chart hiển thị đẹp + save PNG OK |

→ **Mỗi milestone phải verify với CS-013** trước khi sang milestone tiếp.

## 5. Test cases bắt buộc (vault verify)

- **CS-001** (Nam Mậu Thìn 1988, sinh 11/4/1988 dương = 25/2/1988 âm, giờ Sửu)
- **CS-013** (Nữ Mậu Thìn 1988, sinh 11/4/1988 dương, giờ Ngọ) — same year as CS-001
- **CS-015** (Nam Giáp Tuất 1994, sinh 19/11/1994 dương = 17/10/1994 âm, giờ Sửu) — Thân cư Phúc Đức
- **CS-016** (Nữ Canh Thìn 2000, sinh 10/3/2000 dương, giờ Tuất) — đầy đủ 4 khái niệm Tử Vân

→ App phải reproduce 4 chart này khớp 95%+ so với chart hiện tại của các site online.

## 6. Phái + edge cases

- **Phái default**: VN (theo CLAUDE.md rule 8)
- **Toggle TQ option**: ảnh hưởng bảng Miếu Vượng + Tứ Hoá Mậu/Canh/Nhâm + Thân chủ chi Ngọ/Tuất
- **Tháng nhuận**: dùng tháng âm gốc (không phải tháng nhuận) — phái VN
- **Giờ Tí qua nửa đêm** (23:00-23:59): tính ngày hiện tại (phái VN)
