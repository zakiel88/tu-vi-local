# Tu Vi Local — Lá số Tử Vi local app

> **Status:** placeholder (chưa code, đang research thuật toán). Code Phase D sẽ vào đây.

## Mục đích

Local-only web app để lập lá số Tử Vi:
- Input: năm-tháng-ngày-giờ dương + giới tính
- Output: lá số HTML/SVG đầy đủ + save ảnh
- DB local (JSON files), không cần backend

## Stack dự kiến

- **Frontend:** HTML + JavaScript vanilla (không React, để chạy đơn giản từ file://)
- **Render chart:** SVG 12 cung (4×4 grid với cung giữa là center info)
- **Lịch âm dương:** **TỰ BUILD** (theo yêu cầu user) — pre-compute bảng 1900-2100 từ thuật toán Meeus + dữ liệu Hong Kong Observatory
- **DB local:** JSON files (per-chart) + IndexedDB cho list charts
- **Save ảnh:** dùng `html2canvas` hoặc native canvas → PNG/JPG
- **Tooling:** không build step (vanilla), chạy `python -m http.server` hoặc `npx serve` để serve local

## Phase milestones

- **Phase A (đang làm)**: Research thuật toán an sao → vault/02-Quy Tắc/An Sao/
- **Phase B**: Đánh giá tuvichanco.vn + 2-3 trang khác
- **Phase C**: Spec MVP + folder structure code
- **Phase D**: Build prototype
  - M1: form input + an Mệnh + Cục + 14 chính tinh (text)
  - M2: + 6 cát + 6 sát + Tứ Hoá + Tuần-Triệt (text)
  - M3: + 3 vòng + lưu niên hiện tại (text)
  - M4: SVG chart 12 cung + save PNG/JPG

## Folder structure (dự kiến Phase C)

```
tools/tuvi-local/
├── README.md                  # this file
├── index.html                 # main UI
├── data/
│   ├── lunar_table.json       # bảng âm lịch 1900-2100 (~5MB)
│   ├── can_chi.json           # 60 hoa giáp + Nạp Âm
│   ├── stars/                 # bảng dữ liệu sao
│   │   ├── chinh_tinh.json
│   │   ├── phu_tinh.json
│   │   └── mieu_vuong.json
│   └── charts/                # local DB lá số đã lập
│       └── *.json
├── js/
│   ├── lunar.js               # đổi dương → âm + tháng nhuận
│   ├── can_chi.js             # Can Chi + Ngũ Hổ Độn + Ngũ Thử Độn
│   ├── cung.js                # an 12 cung
│   ├── menh_than_cuc.js       # an Mệnh, Thân, Cục, Mệnh chủ, Thân chủ
│   ├── chinh_tinh.js          # an Tử Vi + 14 chính tinh
│   ├── phu_tinh.js            # an 6 cát + 6 sát + sao lẻ
│   ├── vong.js                # 3 vòng (Thái Tuế, Bác Sĩ, Trường Sinh)
│   ├── tu_hoa.js              # Tứ Hoá năm sinh + lưu
│   ├── tuan_triet.js          # Tuần - Triệt
│   ├── dai_han.js             # đại hạn + lưu niên
│   ├── render.js              # SVG chart 12 cung
│   ├── save.js                # export PNG/JPG (html2canvas)
│   └── main.js                # entry point
└── css/
    └── chart.css              # style cho SVG chart
```

## Test cases (verify với vault)

- CS-001: Nam Mậu Thìn 1988
- CS-013: Nữ Mậu Thìn 1988 (cùng năm, khác giờ → khác Mệnh)
- CS-015: Nam Giáp Tuất 1994 (Thân cư Phúc Đức)

→ App phải tạo lại đúng các chart này (so với chart software hiện có).
