// prompt_data.test.js — chạy bằng `node --test`.
// Dùng lá số thật (1990-08-15 10h nam, năm xem 2026) làm fixture: Mệnh tại Dần
// (Vũ Khúc B + Thiên Tướng M), đối cung Thiên Di/Thân = Phá Quân, tam hợp
// Quan Lộc/Ngọ = Tử Vi và Tài Bạch/Tuất = Liêm Trinh + Thiên Phủ.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildChart } from './engine.js';
import { buildNguyenLieu, trucKyBlock } from './prompt_data.js';

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

// ── Feature 1: Trục 4 bậc Kỵ trên tuyến xung ──────────────────────────
test('trục 4 bậc Kỵ: Phụ Mẫu(Kỷ) phi Kỵ Văn Khúc nhập đối cung = Lưu/Xạ Xuất Kỵ', () => {
  assert.match(out, /Trục 4 bậc Kỵ trên tuyến xung/);
  assert.match(
    out,
    /- Phụ Mẫu\(Mão\) can Kỷ phi Hoá Kỵ \(Văn Khúc\) → đối cung Tật Ách\(Dậu\): Lưu\/Xạ Xuất Kỵ/,
  );
});

// mini-chart tổng hợp để test các nhánh Nghịch Thủy / Thủy Tiết (không có trong fixture).
function mkChart(canNam, phai, overrides) {
  const CHI = ['Tí', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
  const cung = CHI.map((chi, i) => ({
    chiIdx: i,
    chi,
    tenCung: i === 0 ? 'Mệnh' : i === 6 ? 'Thiên Di' : `Cung${i}`,
    can: 'Giáp',
    chinhTinh: [],
    phuTinh: [],
  }));
  for (const o of overrides) Object.assign(cung[o.chiIdx], o);
  return { input: { phai }, lich: { canChi: { nam: { can: canNam } } }, cung };
}

test('trục 4 bậc Kỵ: đối cung có Kỵ năm sinh, không tự hóa = Nghịch Thủy Kỵ', () => {
  // canNam Đinh → Kỵ = Cự Môn; Mệnh(Tí,can Đinh) phi Kỵ Cự Môn nhập đối cung Ngọ.
  // Cự Môn đóng Ngọ = Kỵ năm sinh tọa đối cung; can Ngọ = Giáp (Lộc Liêm/Kỵ Dương) → không tự hóa.
  const chart = mkChart('Đinh', 'vn', [
    { chiIdx: 0, can: 'Đinh' },
    { chiIdx: 6, can: 'Giáp', chinhTinh: [{ sao: 'Cự Môn', mieuVuong: 'M' }] },
  ]);
  const s = trucKyBlock(chart);
  assert.match(s, /- Mệnh\(Tí\) can Đinh phi Hoá Kỵ \(Cự Môn\) → đối cung Thiên Di\(Ngọ\): Nghịch Thủy Kỵ/);
});

test('trục 4 bậc Kỵ: đối cung có Kỵ năm sinh nhưng tự hóa = Thủy Tiết Kỵ', () => {
  // như trên nhưng can Ngọ = Tân → Hoá Lộc = Cự Môn (đang tọa Ngọ) → tự hóa chặn thủng.
  const chart = mkChart('Đinh', 'vn', [
    { chiIdx: 0, can: 'Đinh' },
    { chiIdx: 6, can: 'Tân', chinhTinh: [{ sao: 'Cự Môn', mieuVuong: 'M' }] },
  ]);
  const s = trucKyBlock(chart);
  assert.match(s, /→ đối cung Thiên Di\(Ngọ\): Thủy Tiết Kỵ/);
});

// ── Feature 2: Tứ hoá vận hạn nhập cung ÂM/DƯƠNG (Khâm Thiên) ──────────
test('âm/dương cung: đại vận + lưu niên tứ hoá gắn nhãn ÂM(lợi)/DƯƠNG(danh)', () => {
  assert.match(out, /Tứ hoá vận hạn nhập cung ÂM\/DƯƠNG/);
  // Đại vận can Tân: Hoá Lộc Cự Môn → Huynh Đệ (cung âm = lợi)
  assert.match(out, /Đại vận \(Điền Trạch Tỵ, can Tân\):/);
  assert.match(out, /Hoá Lộc Cự Môn → Huynh Đệ \[ÂM\(lợi\)\]/);
  // Lưu niên can Bính: Hoá Kỵ Liêm Trinh → Tài Bạch (cung dương = danh)
  assert.match(out, /Lưu niên \(Bính Ngọ\):/);
  assert.match(out, /Hoá Kỵ Liêm Trinh → Tài Bạch \[DƯƠNG\(danh\)\]/);
});

// ── Feature 3: Cách cục — trạng thái Thành/Giảm/Phá theo Tứ Hoá năm sinh ──
test('cách cục trạng thái: THÀNH / PHÁ / giảm sắc theo Tứ Hoá năm sinh Canh', () => {
  assert.match(out, /Cách cục — trạng thái Thành\/Giảm\/Phá/);
  // Canh: Kỵ = Thiên Đồng → Đồng Cự phá cách
  assert.match(out, /- Đồng Cự \(Sửu\) \[Thiên Đồng \+ Cự Môn\]: PHÁ CÁCH/);
  // Canh: Quyền = Vũ Khúc → Vũ Tướng thành cách
  assert.match(out, /- Vũ Tướng \(Dần\) \[Vũ Khúc \+ Thiên Tướng\]: THÀNH CÁCH/);
  // Canh: Lộc = Thái Dương → Nhật Lương thành cách
  assert.match(out, /- Nhật Lương \(Mão\) \[Thái Dương \+ Thiên Lương\]: THÀNH CÁCH/);
  // Liêm Phủ: không sao nào bị Canh hoá → giảm sắc
  assert.match(out, /- Liêm Phủ \(Tuất\) \[Liêm Trinh \+ Thiên Phủ\]: giảm sắc/);
});
