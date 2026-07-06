// prompt_data.test.js — chạy bằng `node --test`.
// Dùng lá số thật (1990-08-15 10h nam, năm xem 2026) làm fixture: Mệnh tại Dần
// (Vũ Khúc B + Thiên Tướng M), đối cung Thiên Di/Thân = Phá Quân, tam hợp
// Quan Lộc/Ngọ = Tử Vi và Tài Bạch/Tuất = Liêm Trinh + Thiên Phủ.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildChart } from './engine.js';
import { buildNguyenLieu } from './prompt_data.js';

const FIXTURE = { nam: 1990, thang: 8, ngay: 15, gio: 10, phut: 0, gioiTinh: 'nam', namXem: 2026 };
const chart = buildChart(FIXTURE);
const out = buildNguyenLieu(chart);

test('có header cảnh báo không tự suy vị trí', () => {
  assert.match(out, /NGUYÊN LIỆU HÌNH HỌC ĐÃ TRA SẴN/);
  assert.match(out, /KHÔNG TỰ SUY VỊ TRÍ/);
});

test('tam phương Mệnh: bản cung + đối cung + 2 tam hợp đúng vị trí', () => {
  assert.match(out, /- Mệnh \(Dần\): Vũ Khúc\(Bình\), Thiên Tướng\(Miếu\)/);
  // đối cung Thiên Di (Thân) = Phá Quân
  assert.match(out, /Đối cung Thiên Di \(Thân\): Phá Quân/);
  // tam hợp gồm Quan Lộc (Tử Vi) và Tài Bạch (Liêm Trinh + Thiên Phủ)
  assert.match(out, /Tam hợp — Quan Lộc \(Ngọ\): Tử Vi/);
  assert.match(out, /Tam hợp — Tài Bạch \(Tuất\): Liêm Trinh.*Thiên Phủ/);
});

test('song tinh đồng cung phát hiện đúng các cặp', () => {
  assert.match(out, /Mệnh \(Dần\): Vũ Khúc \+ Thiên Tướng đồng cung/);
  assert.match(out, /Tài Bạch \(Tuất\): Liêm Trinh \+ Thiên Phủ đồng cung/);
  assert.match(out, /Huynh Đệ \(Sửu\): Thiên Đồng \+ Cự Môn đồng cung/);
  // cung Vô chính diệu (Nô Bộc/Tật Ách) không được coi là song tinh
  assert.doesNotMatch(out, /Nô Bộc.*đồng cung/);
});

test('giáp cách: có cảnh báo sao lẻ + tính cho Mệnh', () => {
  assert.match(out, /sao lẻ một bên KHÔNG phải giáp/);
  assert.match(out, /- Mệnh \(Dần\) — kẹp bởi Huynh Đệ\(Sửu\) & Phụ Mẫu\(Mão\)/);
});

test('kiến tinh tầm ngẫu: liệt kê đủ 7 cặp cộng hưởng với trạng thái', () => {
  assert.match(out, /Kiến tinh tầm ngẫu/);
  for (const label of ['Tả Phụ–Hữu Bật', 'Xương–Khúc', 'Khôi–Việt', 'Long Trì–Phượng Các', 'Kình–Đà', 'Hoả–Linh', 'Không–Kiếp']) {
    assert.ok(out.includes(label), `thiếu cặp: ${label}`);
  }
  // mỗi cặp phải có 1 trong 3 trạng thái
  assert.match(out, /(ĐỦ CẶP|lẻ \(chỉ|không có)/);
});

test('phi hoá: Mệnh can Mậu phi Lộc = Tham Lang → Phu Thê', () => {
  // Mậu: [Tham Lang(Lộc), Thái Âm(Quyền), Hữu Bật(Khoa), Thiên Cơ(Kỵ)]
  // Tham Lang đóng Phu Thê (Tí) trong fixture này.
  assert.match(out, /Mệnh \(can Mậu\) phi:.*Hoá Lộc→Phu Thê\(Tham Lang\)/);
  assert.match(out, /Hoá Kỵ→Điền Trạch\(Thiên Cơ\)/);
  assert.match(out, /Phi NHẬP Mệnh:/);
});

test('đất địa chi Mệnh: Dần = Tứ Sinh', () => {
  assert.match(out, /Đất địa chi cung Mệnh】Dần = TỨ SINH/);
});

test('không rò rỉ mã độ sáng thô M/V/Đ/B/H (đã đổi sang nhãn đầy đủ)', () => {
  // chính tinh phải hiện "(Miếu)"/"(Bình)"… chứ không phải "(M)"/"(B)"
  assert.doesNotMatch(out, /\((M|V|Đ|B|H)\)/);
});
