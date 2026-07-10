// twin.js — Logic thuần (không DOM) cho tính năng LÁ SỐ SINH ĐÔI lập-cả-2-lá-1-lần.
//
// Cổ pháp (user chốt 2026-07-10): cùng canh giờ → bé trước = lá gốc, bé sau = Mệnh lùi
//   1 cung. Ở đây chỉ dựng INPUT cho engine + nhận diện cặp trong storage; phần an sao
//   nằm ở engine.js (buildChart đã hỗ trợ sinhDoi:{thuTu,cungCanh}).

/**
 * Dựng cặp input cho engine từ 1 input gốc + tên 2 bé.
 * Cả 2 lá đều cùng canh giờ; chỉ khác thuTu ('truoc' | 'sau').
 * Không mutate baseInput.
 * @param {object} baseInput input gốc (chưa có sinhDoi)
 * @param {string} [tenTruoc] tên bé sinh trước
 * @param {string} [tenSau]   tên bé sinh sau
 * @returns {{ truoc: object, sau: object }}
 */
export function buildTwinPairInputs(baseInput, tenTruoc, tenSau) {
  const clean = (s) => (typeof s === "string" && s.trim()) ? s.trim() : null;
  const mk = (thuTu, ten) => ({
    ...baseInput,
    tenLabel: clean(ten) || baseInput.tenLabel || null,
    sinhDoi: { thuTu, cungCanh: true },
  });
  return { truoc: mk("truoc", tenTruoc), sau: mk("sau", tenSau) };
}

/**
 * 2 input có cùng thời điểm sinh (ngày/giờ/phút/giới) không.
 */
export function sameBirth(a, b) {
  if (!a || !b) return false;
  return a.nam === b.nam && a.thang === b.thang && a.ngay === b.ngay &&
    a.gio === b.gio && (a.phut || 0) === (b.phut || 0) && a.gioiTinh === b.gioiTinh;
}

/**
 * 2 input có phải một cặp sinh đôi cùng canh giờ (khác thuTu) không.
 */
export function isTwinPairInput(a, b) {
  if (!sameBirth(a, b)) return false;
  const sa = a.sinhDoi, sb = b.sinhDoi;
  if (!sa || !sb) return false;
  if (sa.cungCanh !== true || sb.cungCanh !== true) return false;
  return sa.thuTu !== sb.thuTu;
}

/**
 * Tìm record lá cặp trong danh sách storage cho 1 chart sinh đôi.
 * @param {Array<{id?:number, chart:object}>} records danh sách từ listCharts()
 * @param {object} chart chart hiện tại (có chart.input.sinhDoi)
 * @param {number} [excludeId] id của chính lá hiện tại (bỏ qua khi so)
 * @returns {object|null} record cặp, hoặc null
 */
export function findPairRecord(records, chart, excludeId) {
  const input = chart && chart.input;
  if (!input || !input.sinhDoi || input.sinhDoi.cungCanh !== true) return null;
  for (const rec of records) {
    if (excludeId != null && rec.id === excludeId) continue;
    if (isTwinPairInput(input, rec.chart && rec.chart.input)) return rec;
  }
  return null;
}
