// prompt_data.js — "Nguyên liệu hình học đã tra sẵn" cho prompt luận giải.
//
// Ý tưởng (port từ repo TVDS, module interpret/prompt.ts): thay vì đưa JSON thô
// rồi bắt AI TỰ SUY vị trí tam phương / giáp cách / phi hoá (nguồn hallucinate #1),
// ta TÍNH SẴN toàn bộ HÌNH HỌC bằng code rồi nhồi vào prompt như dữ kiện đã tra.
//
// ⭐ NGUYÊN TẮC: module này CHỈ tính HÌNH HỌC — thứ phái-TRUNG LẬP (vị trí sao,
// offset chi, cặp kẹp, hoá bay đâu). TUYỆT ĐỐI KHÔNG nhồi ý nghĩa/luận đoán vào đây
// (hard-rule #8: ý nghĩa phải theo Trung Châu + vault). AI vẫn lo phần luận.

import { TU_HOA_VN, TU_HOA_TQ } from './data.js';

const CHI = ['Tí', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
const mod12 = (n) => ((n % 12) + 12) % 12;

// Mã độ sáng engine (M/V/Đ/B/H) → nhãn đầy đủ.
const MIEU_LABEL = { M: 'Miếu', V: 'Vượng', Đ: 'Đắc', B: 'Bình', H: 'Hãm' };

// Các cung luận sâu nhất (tam phương + giáp tính cho những cung này).
const KEY_CUNG = ['Mệnh', 'Quan Lộc', 'Tài Bạch', 'Thiên Di', 'Phu Thê', 'Phúc Đức'];

// ── Ba nhóm địa chi ("đất" của cung) — Tí0 … Hợi11 ──
const TU_MO = [1, 4, 7, 10];    // Sửu Thìn Mùi Tuất — mộ/khố
const TU_SINH = [2, 5, 8, 11];  // Dần Tỵ Thân Hợi — trường sinh/dịch mã
// còn lại Tí Ngọ Mão Dậu = tứ vượng/tứ chính (đế vượng/đào hoa).

// Bộ sao GIÁP CÁCH: chỉ thành cách khi một CẶP kẹp đủ hai bên (một sao cung trước,
// sao kia cung sau). Sao lẻ đứng một bên KHÔNG phải giáp. (Chính tả theo engine.)
const GIAP_PAIRS = [
  { a: 'Thái Dương', b: 'Thái Âm', label: 'Nhật Nguyệt giáp', tone: 'cát' },
  { a: 'Văn Xương', b: 'Văn Khúc', label: 'Xương Khúc giáp', tone: 'cát' },
  { a: 'Tả Phụ', b: 'Hữu Bật', label: 'Tả Hữu giáp', tone: 'cát' },
  { a: 'Thiên Khôi', b: 'Thiên Việt', label: 'Khôi Việt giáp', tone: 'cát' },
  { a: 'Lộc Tồn', b: 'Thiên Mã', label: 'Lộc Mã giáp', tone: 'cát' },
  { a: 'Kình Dương', b: 'Đà La', label: 'Kình Đà giáp', tone: 'hung' },
  { a: 'Hoả Tinh', b: 'Linh Tinh', label: 'Hoả Linh giáp', tone: 'hung' },
  { a: 'Địa Không', b: 'Địa Kiếp', label: 'Không Kiếp giáp', tone: 'hung' },
  { a: 'Thiên Khốc', b: 'Thiên Hư', label: 'Khốc Hư giáp', tone: 'hung' },
];

// Cặp cộng hưởng để đếm trong tam phương (Kiến tinh tầm ngẫu — bước 13.C.3).
const RESONANCE_PAIRS = [
  { a: 'Tả Phụ', b: 'Hữu Bật', label: 'Tả Phụ–Hữu Bật', tone: 'cát' },
  { a: 'Văn Xương', b: 'Văn Khúc', label: 'Xương–Khúc', tone: 'cát' },
  { a: 'Thiên Khôi', b: 'Thiên Việt', label: 'Khôi–Việt', tone: 'cát' },
  { a: 'Long Trì', b: 'Phượng Các', label: 'Long Trì–Phượng Các', tone: 'cát' },
  { a: 'Kình Dương', b: 'Đà La', label: 'Kình–Đà', tone: 'sát' },
  { a: 'Hoả Tinh', b: 'Linh Tinh', label: 'Hoả–Linh', tone: 'sát' },
  { a: 'Địa Không', b: 'Địa Kiếp', label: 'Không–Kiếp', tone: 'sát' },
];

// ── Helpers truy cập lá số ──
const byChi = (chart, ci) => chart.cung.find((c) => c.chiIdx === ci);
const byName = (chart, name) => chart.cung.find((c) => c.tenCung === name);

/** Tên chính tinh kèm độ sáng: "Vũ Khúc(Bình)". */
function chinhTinhLabel(x) {
  const ds = MIEU_LABEL[x.mieuVuong];
  return ds ? `${x.sao}(${ds})` : x.sao;
}

/** Chuỗi sao của một cung: chính tinh (kèm độ sáng) + phụ tinh. */
function starListOf(cung) {
  if (!cung) return '(?)';
  const chinh = cung.chinhTinh.map(chinhTinhLabel).join(', ') || 'Vô chính diệu';
  const phu = cung.phuTinh.length ? ` · phụ: ${cung.phuTinh.join(', ')}` : '';
  return `${chinh}${phu}`;
}

/** Set tên MỌI sao (chính + phụ) của một cung — bỏ lưu (phụ tinh engine không có loai). */
function starSetOf(cung) {
  const s = new Set(cung.phuTinh);
  for (const x of cung.chinhTinh) s.add(x.sao);
  return s;
}

/** Tam phương tứ chính của một cung: đối cung (+6) + 2 tam hợp (+4, +8). */
function tamPhuongOf(chart, name) {
  const cung = byName(chart, name);
  if (!cung) return '';
  const doi = byChi(chart, mod12(cung.chiIdx + 6));
  const th1 = byChi(chart, mod12(cung.chiIdx + 4));
  const th2 = byChi(chart, mod12(cung.chiIdx + 8));
  return [
    `- ${name} (${cung.chi}): ${starListOf(cung)}`,
    `    · Đối cung ${doi.tenCung} (${doi.chi}): ${starListOf(doi)}`,
    `    · Tam hợp — ${th1.tenCung} (${th1.chi}): ${starListOf(th1)}`,
    `    · Tam hợp — ${th2.tenCung} (${th2.chi}): ${starListOf(th2)}`,
  ].join('\n');
}

/** Khối tam phương tứ chính cho toàn bộ KEY_CUNG. */
function tamPhuongBlock(chart) {
  const lines = KEY_CUNG.map((n) => tamPhuongOf(chart, n)).filter(Boolean);
  return `【Tam phương tứ chính các cung trọng yếu】(bản cung + 2 tam hợp hội chiếu + đối cung xung chiếu — DÙNG ĐÚNG các cung này)\n${lines.join('\n')}`;
}

/** Các cung có ĐÚNG 2 chính tinh đồng cung (chỉ nêu sao, KHÔNG luận nghĩa). */
function songTinhBlock(chart) {
  const items = chart.cung
    .filter((c) => c.chinhTinh.length === 2)
    .map((c) => `- ${c.tenCung} (${c.chi}): ${c.chinhTinh.map((x) => x.sao).join(' + ')} đồng cung`);
  if (!items.length) return '';
  return `【Song tinh đồng cung】(cung có đúng 2 chính tinh — luận nghĩa cặp theo Trung Châu, KHÔNG tách rời)\n${items.join('\n')}`;
}

/** Giáp cách của một cung: 2 cung kẹp (±1), dò bộ CẶP kẹp đủ hai bên. */
function giapOf(chart, name) {
  const cung = byName(chart, name);
  if (!cung) return '';
  const truoc = byChi(chart, mod12(cung.chiIdx - 1));
  const sau = byChi(chart, mod12(cung.chiIdx + 1));
  const A = starSetOf(truoc);
  const B = starSetOf(sau);
  const found = GIAP_PAIRS.filter(
    (p) => (A.has(p.a) && B.has(p.b)) || (A.has(p.b) && B.has(p.a)),
  ).map((p) => `${p.label} [${p.tone}]`);
  const head = `- ${name} (${cung.chi}) — kẹp bởi ${truoc.tenCung}(${truoc.chi}) & ${sau.tenCung}(${sau.chi}):`;
  return found.length
    ? `${head} ${found.join('; ')}.`
    : `${head} không có bộ giáp cách.`;
}

/** Khối giáp cách cho KEY_CUNG + cảnh báo sao lẻ. */
function giapBlock(chart) {
  const lines = KEY_CUNG.map((n) => giapOf(chart, n)).filter(Boolean);
  return `【Giáp cách các cung trọng yếu】(chỉ tính khi một CẶP sao kẹp ĐỦ HAI BÊN; sao lẻ một bên KHÔNG phải giáp — đừng bê vào cung giữa)\n${lines.join('\n')}`;
}

/** Kiến tinh tầm ngẫu: đếm cặp cộng hưởng trong tam phương của một cung. */
function kienTinhOf(chart, name) {
  const cung = byName(chart, name);
  if (!cung) return '';
  const tp = [cung, byChi(chart, mod12(cung.chiIdx + 4)), byChi(chart, mod12(cung.chiIdx + 8)), byChi(chart, mod12(cung.chiIdx + 6))];
  const all = new Set();
  for (const c of tp) for (const s of starSetOf(c)) all.add(s);
  const lines = RESONANCE_PAIRS.map((p) => {
    const hasA = all.has(p.a);
    const hasB = all.has(p.b);
    const state = hasA && hasB ? 'ĐỦ CẶP' : hasA ? `lẻ (chỉ ${p.a})` : hasB ? `lẻ (chỉ ${p.b})` : 'không có';
    return `    · ${p.label} [${p.tone}]: ${state}`;
  });
  return `- Tam phương ${name} (${cung.chi}):\n${lines.join('\n')}`;
}

function kienTinhBlock(chart) {
  return `【Kiến tinh tầm ngẫu — cặp đôi cộng hưởng trong tam phương Mệnh】(đếm trên bản cung + 2 tam hợp + đối cung)\n${kienTinhOf(chart, 'Mệnh')}`;
}

/** Map tên sao → chiIdx (mọi chính + phụ tinh) để dò hoá bay vào cung nào. */
function buildViTriSao(chart) {
  const m = {};
  for (const c of chart.cung) {
    for (const x of c.chinhTinh) m[x.sao] = c.chiIdx;
    for (const s of c.phuTinh) m[s] = c.chiIdx;
  }
  return m;
}

const HOA_NAMES = ['Hoá Lộc', 'Hoá Quyền', 'Hoá Khoa', 'Hoá Kỵ'];

/** 4 hoá do một can sinh ra + cung mỗi hoá bay vào. */
function hoaLanding(chart, viTri, can, phai) {
  const table = phai === 'tq' ? TU_HOA_TQ : TU_HOA_VN;
  const stars = table[can];
  if (!stars) return [];
  return stars.map((sao, i) => {
    const ci = viTri[sao];
    const cung = ci === undefined ? null : byChi(chart, ci);
    return { hoa: HOA_NAMES[i], sao, cung: cung ? cung.tenCung : '(không an được)' };
  });
}

/** Phi tinh tứ hoá: can mỗi KEY_CUNG phi hoá đi đâu + tự hoá + phi NHẬP Mệnh. */
function phiHoaBlock(chart) {
  const phai = chart.input?.phai || 'vn';
  const viTri = buildViTriSao(chart);
  const menh = byName(chart, 'Mệnh');

  const lines = [];
  for (const name of KEY_CUNG) {
    const cung = byName(chart, name);
    if (!cung) continue;
    const own = hoaLanding(chart, viTri, cung.can, phai);
    const phiRa = own.map((h) => `${h.hoa}→${h.cung}(${h.sao})`).join(', ');
    const tuHoa = own.filter((h) => h.cung === name).map((h) => `${h.hoa} ${h.sao}`);
    let line = `- ${name} (can ${cung.can}) phi: ${phiRa}`;
    if (tuHoa.length) line += `  [TỰ HOÁ tại ${name}: ${tuHoa.join(', ')}]`;
    lines.push(line);
  }

  // Cung nào phi hoá NHẬP Mệnh
  const incoming = [];
  for (const c of chart.cung) {
    if (c.chiIdx === menh.chiIdx) continue;
    for (const h of hoaLanding(chart, viTri, c.can, phai)) {
      if (h.cung === 'Mệnh') incoming.push(`${c.tenCung} phi ${h.hoa}(${h.sao}) nhập Mệnh`);
    }
  }
  lines.push(`- Phi NHẬP Mệnh: ${incoming.join('; ') || '(không có)'}`);

  return `【Phi tinh tứ hoá】(can mỗi cung phi Hoá Lộc/Quyền/Khoa/Kỵ vào cung nào — cung "đem gì cho" cung khác; Hoá Kỵ phi nhập = điểm vướng)\n${lines.join('\n')}`;
}

// ── Khâm Thiên môn: 6 cung DƯƠNG (chủ "danh") / 6 cung ÂM (chủ "lợi") ──
// Nguồn: Tứ Hóa phái §1.7.1 (tu_hoa_t2 tr.31–32) + [[Hỏi Đáp Chuyên Đề - Sự Nghiệp Tài Phú]] 6.1.16.
const DUONG_CUNG = ['Mệnh', 'Phu Thê', 'Tài Bạch', 'Thiên Di', 'Quan Lộc', 'Phúc Đức'];
const AM_CUNG = ['Huynh Đệ', 'Tử Tức', 'Tật Ách', 'Nô Bộc', 'Điền Trạch', 'Phụ Mẫu'];
const amDuongLabel = (name) =>
  AM_CUNG.includes(name) ? 'ÂM(lợi)' : DUONG_CUNG.includes(name) ? 'DƯƠNG(danh)' : '(?)';

const hoaTableOf = (phai) => (phai === 'tq' ? TU_HOA_TQ : TU_HOA_VN);

/**
 * Trục 4 bậc Kỵ trên tuyến xung (Bắc phái Khâm Thiên — [[Phi Tinh Kỵ Phổ]] §5.4).
 * CHỈ hình học: cung nào can phi Hoá Kỵ nhập ĐÚNG đối cung (+6) → phân bậc theo
 * đối cung có Kỵ [năm sinh] tọa thủ / có tự hóa chặn hay không:
 *   - đối cung KHÔNG có Kỵ năm sinh → Lưu/Xạ Xuất Kỵ (Kỵ chảy ra, không giữ).
 *   - có Kỵ năm sinh, KHÔNG tự hóa → Nghịch Thủy Kỵ (chặn, dội về).
 *   - có Kỵ năm sinh NHƯNG đối cung tự Hoá Kỵ/Lộc → Thủy Tiết Kỵ (đập thủng, Tam Kỵ).
 * Ý nghĩa cát/hung + điều kiện tinh (tam hợp bản mệnh…) do prompt luận.
 */
export function trucKyBlock(chart) {
  const phai = chart.input?.phai || 'vn';
  const table = hoaTableOf(phai);
  const viTri = buildViTriSao(chart);
  const canNam = chart.lich?.canChi?.nam?.can;
  const kyNamChi = canNam && table[canNam] ? viTri[table[canNam][3]] : undefined;

  const lines = [];
  for (const cung of chart.cung) {
    const row = table[cung.can];
    if (!row) continue;
    const kyStar = row[3];
    const land = viTri[kyStar];
    if (land === undefined) continue;
    const doi = mod12(cung.chiIdx + 6);
    if (land !== doi) continue; // chỉ tính khi phi Kỵ nhập ĐÚNG đối cung (tuyến xung)

    const B = byChi(chart, doi);
    const hasKyNam = kyNamChi === doi; // Kỵ [năm sinh] tọa thủ đối cung
    const Bstars = starSetOf(B);
    const tuRow = table[B.can] || [];
    const tuHoaChan = Bstars.has(tuRow[0]) || Bstars.has(tuRow[3]); // đối cung tự Hoá Lộc/Kỵ

    let bac, tone;
    if (!hasKyNam) {
      bac = 'Lưu/Xạ Xuất Kỵ (Kỵ chảy ra đối cung, không giữ)';
      tone = 'trung tính';
    } else if (!tuHoaChan) {
      bac = 'Nghịch Thủy Kỵ (đối cung có Kỵ năm sinh chặn ⇒ dội ngược về)';
      tone = 'cát';
    } else {
      bac = 'Thủy Tiết Kỵ (đối cung có Kỵ năm sinh NHƯNG tự hóa ⇒ đập thủng, Tam Kỵ)';
      tone = 'hung';
    }
    const laTaiQuan = cung.tenCung === 'Mệnh' || cung.tenCung === 'Tài Bạch' || cung.tenCung === 'Quan Lộc';
    const extra = !hasKyNam && laTaiQuan ? ` [phát từ ${cung.tenCung} → có thể luận Thủy Mệnh Kỵ]` : '';
    lines.push(
      `- ${cung.tenCung}(${cung.chi}) can ${cung.can} phi Hoá Kỵ (${kyStar}) → đối cung ${B.tenCung}(${B.chi}): ${bac} [${tone}]${extra}`,
    );
  }
  if (!lines.length) return '';
  return `【Trục 4 bậc Kỵ trên tuyến xung】(cung phi Hoá Kỵ nhập ĐÚNG đối cung; phân bậc theo đối cung có Kỵ [năm sinh] chặn / tự hóa hay không — Bắc phái Khâm Thiên. Điều kiện tinh & ý nghĩa cát-hung: prompt luận)\n${lines.join('\n')}`;
}

/**
 * Tứ hoá vận hạn (đại vận + lưu niên) nhập cung ÂM (lợi) hay DƯƠNG (danh) — Khâm Thiên.
 * CHỈ hình học: bay đâu + nhãn âm/dương. Diễn giải "danh/lợi/xuất siêu" do prompt luận.
 */
export function amDuongHoaBlock(chart) {
  const phai = chart.input?.phai || 'vn';
  const viTri = buildViTriSao(chart);
  const rows = [];

  const dv = chart.cung.find((c) => c.isDaiHanCurrent);
  if (dv) {
    rows.push(`- Đại vận (${dv.tenCung} ${dv.chi}, can ${dv.can}):`);
    for (const h of hoaLanding(chart, viTri, dv.can, phai)) {
      rows.push(`    · ${h.hoa} ${h.sao} → ${h.cung} [${amDuongLabel(h.cung)}]`);
    }
  }

  const lnCan = chart.luuNien?.canChi?.can;
  if (lnCan) {
    const lnChi = chart.luuNien.canChi.chi;
    rows.push(`- Lưu niên (${lnCan} ${lnChi}):`);
    for (const h of hoaLanding(chart, viTri, lnCan, phai)) {
      rows.push(`    · ${h.hoa} ${h.sao} → ${h.cung} [${amDuongLabel(h.cung)}]`);
    }
  }

  if (!rows.length) return '';
  return `【Tứ hoá vận hạn nhập cung ÂM/DƯƠNG】(Khâm Thiên: 6 cung DƯƠNG=danh — Mệnh/Phu Thê/Tài/Di/Quan/Phúc; 6 cung ÂM=lợi — Huynh/Tử/Tật/Nô/Điền/Phụ. Hoá cát nhập cung âm ⇒ thiên "lợi/tiền"; nhập cung dương ⇒ thiên "danh")\n${rows.join('\n')}`;
}

/**
 * Cách cục — trạng thái Thành / Giảm / Phá theo Tứ Hoá NĂM SINH.
 * CHỈ hình học: Lộc/Quyền/Khoa năm sinh chạm sao đôi định cách ⇒ THÀNH; Kỵ chạm ⇒ PHÁ;
 * không chạm ⇒ giảm sắc. Tứ Sát/Không Kiếp & vận hạn để prompt luận thêm.
 */
export function cachCucTrangThaiBlock(chart) {
  const list = chart.cachCuc || [];
  if (!list.length) return '';
  const phai = chart.input?.phai || 'vn';
  const table = hoaTableOf(phai);
  const canNam = chart.lich?.canChi?.nam?.can;
  const row = canNam ? table[canNam] : null;
  if (!row) return '';
  const [loc, quyen, khoa, ky] = row;
  const hoaOf = (s) => (s === loc ? 'Lộc' : s === quyen ? 'Quyền' : s === khoa ? 'Khoa' : s === ky ? 'Kỵ' : '');

  const lines = list.map((cc) => {
    const catHit = cc.saoList.filter((s) => s === loc || s === quyen || s === khoa);
    const kyHit = cc.saoList.filter((s) => s === ky);
    let state, detail;
    if (kyHit.length) {
      state = 'PHÁ CÁCH';
      detail = `Hoá Kỵ năm sinh đóng sao chủ ${kyHit.map((s) => `${s}(Kỵ)`).join(', ')}`;
    } else if (catHit.length) {
      state = 'THÀNH CÁCH';
      detail = `Hoá cát năm sinh vào sao chủ ${catHit.map((s) => `${s}(${hoaOf(s)})`).join(', ')}`;
    } else {
      state = 'giảm sắc';
      detail = 'Tứ Hoá năm sinh không chạm sao chủ cách (thiếu lửa kích hoạt)';
    }
    return `- ${cc.ten} (${cc.viTriChi}) [${cc.saoList.join(' + ')}]: ${state} — ${detail}.`;
  });
  return `【Cách cục — trạng thái Thành/Giảm/Phá theo Tứ Hoá năm sinh】(Lộc/Quyền/Khoa chạm sao chủ ⇒ thành; Kỵ chạm ⇒ phá; không chạm ⇒ giảm sắc. Chỉ xét Tứ Hoá năm sinh chạm sao đôi định cách — Tứ Sát/Không Kiếp & vận hạn do prompt luận thêm)\n${lines.join('\n')}`;
}

/** Tính chất "đất" (địa chi) của cung Mệnh. */
function datBlock(chart) {
  const menh = byName(chart, 'Mệnh');
  const ci = menh.chiIdx;
  let text;
  if (TU_MO.includes(ci)) {
    const laVong = ci === 4 || ci === 10;
    text = `TỨ MỘ (kho/mộ khố, Thổ) — tích trữ, hậu phát, sao dễ bị "chôn" phát chậm, cần xung khai mộ.${laVong ? ' Thìn–Tuất là THIÊN LA ĐỊA VÕNG — gò bó, phải qua vận xung mới thoát.' : ''}`;
  } else if (TU_SINH.includes(ci)) {
    text = 'TỨ SINH / dịch mã (Dần Thân Tỵ Hợi) — khởi đầu, chủ động, di chuyển, bôn ba, đối ngoại.';
  } else {
    text = 'TỨ VƯỢNG / tứ chính (Tí Ngọ Mão Dậu) — khí cực thịnh, chuyên nhất; đồng thời là đất đào hoa.';
  }
  return `【Đất địa chi cung Mệnh】${menh.chi} = ${text}`;
}

/**
 * Build khối "nguyên liệu hình học đã tra sẵn" để chèn vào prompt luận giải.
 * @param {object} chart — chart JSON từ buildChart()
 * @returns {string}
 */
export function buildNguyenLieu(chart) {
  const blocks = [
    tamPhuongBlock(chart),
    songTinhBlock(chart),
    giapBlock(chart),
    kienTinhBlock(chart),
    phiHoaBlock(chart),
    trucKyBlock(chart),
    amDuongHoaBlock(chart),
    cachCucTrangThaiBlock(chart),
    datBlock(chart),
  ].filter(Boolean);

  return [
    '═══════════════════════════════════════════════════════════════════',
    '📐 NGUYÊN LIỆU HÌNH HỌC ĐÃ TRA SẴN (phái-TRUNG LẬP — DÙNG NGUYÊN, KHÔNG TỰ SUY VỊ TRÍ)',
    '═══════════════════════════════════════════════════════════════════',
    '⚠️ Toàn bộ vị trí sao/cung dưới đây đã được tính CHÍNH XÁC bằng code từ lá số. Khi luận',
    '13.C (tam phương tứ chính, giáp cách, kiến tinh) và phi hoá — DÙNG THẲNG số liệu này,',
    'TUYỆT ĐỐI không tự suy lại vị trí hình học kẻo sai. Phần Ý NGHĨA/luận đoán vẫn theo phái',
    'Trung Châu + vault (module này chỉ tra vị trí, không luận nghĩa).',
    '',
    blocks.join('\n\n'),
  ].join('\n');
}
