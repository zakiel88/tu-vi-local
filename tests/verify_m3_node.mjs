// Node verify for M3 — chạy bằng `node tests/verify_m3_node.mjs`

import { duongToAm, tinhChiGio, tinhCanChiGio } from '../js/lunar.js';
import { anCungMenh, anCungThan, an12Cung, anCanCung } from '../js/cung.js';
import { anCuc, getCucInfo } from '../js/menh_than_cuc.js';
import { an14ChinhTinh } from '../js/chinh_tinh.js';
import { anToanBoPhuTinh } from '../js/phu_tinh.js';
import { anVongThaiTue, anVongBacSi, anVongTruongSinh, isVongThuan } from '../js/vong.js';
import { anDaiHan, timDaiHanHienTai, anTieuHan, anTuHoaDaiHan } from '../js/dai_han.js';
import { anLuuNien } from '../js/luu_nien.js';
import { anSaoChuCuc, getLaiNhanCung, anNguyenThan, anTuVanFull } from '../js/tu_van.js';
import { CHI } from '../js/data.js';

let pass = 0, fail = 0;
const failures = [];
const chiName = (i) => `${CHI[i]}(${i})`;
function check(label, expected, actual) {
  const ok = JSON.stringify(expected) === JSON.stringify(actual);
  if (ok) { pass++; console.log(`  ✓ ${label}`); }
  else    { fail++; failures.push({ label, expected, actual }); console.log(`  ✗ ${label} — expected=${JSON.stringify(expected)}, actual=${JSON.stringify(actual)}`); }
}

console.log("\n=== Setup CS-013 ===");
const input = { nam: 1988, thang: 4, ngay: 11, gio: 11, phut: 25, gioiTinh: 'nu' };
const lich = duongToAm(input);
const chiGio = tinhChiGio(input.gio, input.phut);
const canNam = lich.canChi.nam.can;
const chiNam = lich.canChi.nam.chi;
const thangAm = lich.am.thang;
const ngayAm = lich.am.ngay;
const cungMenhChi = anCungMenh(thangAm, chiGio);
const cungThanChi = anCungThan(thangAm, chiGio);
const cuc = anCuc(canNam, CHI[cungMenhChi]);
const cucInfo = getCucInfo(cuc);
const cung12 = an12Cung(cungMenhChi);
const canCung = anCanCung(canNam);
const chinhTinh = an14ChinhTinh(cuc, ngayAm);
const phuTinh = anToanBoPhuTinh({
  thangAm, chiGio, canNam, chiNam, ngayAm,
  gioiTinh: input.gioiTinh,
  cungMenhChi, cungThanChi,
  cungNoBocChi: cung12[5].chiIdx,
  cungTatAchChi: cung12[7].chiIdx,
});
const viTriSao = { ...chinhTinh, ...phuTinh };
console.log(`  Năm sinh: ${canNam} ${chiNam}; Cục ${cuc}; Mệnh ${chiName(cungMenhChi)}; Lộc Tồn ${chiName(viTriSao['Lộc Tồn'])}`);
console.log(`  Tham Lang ${chiName(viTriSao['Tham Lang'])}; Liêm Trinh ${chiName(viTriSao['Liêm Trinh'])}; Thiên Đồng ${chiName(viTriSao['Thiên Đồng'])}`);

console.log("\n=== 1. Vòng Thái Tuế ===");
const thaiTue = anVongThaiTue(chiNam);
check("Thái Tuế Thìn(4)", 4, thaiTue["Thái Tuế"]);
check("Thiếu Dương Tỵ(5)", 5, thaiTue["Thiếu Dương"]);
check("Tang Môn Ngọ(6)", 6, thaiTue["Tang Môn"]);
check("Tuế Phá Tuất(10)", 10, thaiTue["Tuế Phá"]);
check("Bạch Hổ Tí(0)", 0, thaiTue["Bạch Hổ"]);
check("Phúc Đức Sửu(1)", 1, thaiTue["Phúc Đức"]);

console.log("\n=== 2. Vòng Bác Sĩ (NGHỊCH) ===");
const isThuan = isVongThuan(canNam, input.gioiTinh);
check("Dương Nữ → NGHỊCH", false, isThuan);
const bacSi = anVongBacSi(viTriSao["Lộc Tồn"], isThuan);
check("Bác Sĩ Tỵ(5)", 5, bacSi["Bác Sĩ"]);
check("Lực Sĩ Thìn(4)", 4, bacSi["Lực Sĩ"]);
check("Thanh Long Mão(3)", 3, bacSi["Thanh Long"]);
check("Phi Liêm Hợi(11)", 11, bacSi["Phi Liêm"]);
check("Hỷ Thần Tuất(10)", 10, bacSi["Hỷ Thần"]);

console.log("\n=== 3. Vòng Trường Sinh (NGHỊCH) ===");
const ts = anVongTruongSinh(cuc, isThuan);
check("Trường Sinh Hợi(11)", 11, ts["Trường Sinh"]);
check("Mộc Dục Tuất(10)", 10, ts["Mộc Dục"]);
check("Đế Vượng Mùi(7)", 7, ts["Đế Vượng"]);
check("Bệnh Tỵ(5)", 5, ts["Bệnh"]);
check("Tuyệt Dần(2)", 2, ts["Tuyệt"]);

console.log("\n=== 4. Đại hạn ===");
const dh = anDaiHan(cuc, cungMenhChi, isThuan, 39);
check("ĐH1 Mệnh Dậu(9)", 9, dh[0].chiIdx);
check("ĐH1 ageStart=3", 3, dh[0].ageStart);
check("ĐH2 Thân(8)", 8, dh[1].chiIdx);
check("ĐH3 Mùi(7)", 7, dh[2].chiIdx);
check("ĐH4 Ngọ(6)", 6, dh[3].chiIdx);
check("ĐH4 ageStart=33", 33, dh[3].ageStart);
check("ĐH4 isCurrent (39t)", true, dh[3].isCurrent);
const dhHT = timDaiHanHienTai(dh);
check("ĐH hiện tại = #4", 4, dhHT.index);
const canDH4 = canCung[6];
console.log(`  Can cung ĐH4 (Ngọ) = ${canDH4}`);
const tuHoaDH4 = anTuHoaDaiHan(canDH4, viTriSao);
console.log(`  Hoá ĐH4: Lộc=${tuHoaDH4.hoaLoc.sao}@${chiName(tuHoaDH4.hoaLoc.chiIdx)}, Quyền=${tuHoaDH4.hoaQuyen.sao}@${chiName(tuHoaDH4.hoaQuyen.chiIdx)}, Khoa=${tuHoaDH4.hoaKhoa.sao}@${chiName(tuHoaDH4.hoaKhoa.chiIdx)}, Kỵ=${tuHoaDH4.hoaKy.sao}@${chiName(tuHoaDH4.hoaKy.chiIdx)}`);

console.log("\n=== 5. Tiểu hạn ===");
const th39 = anTieuHan(chiNam, input.gioiTinh, 39);
check("Tiểu hạn 39t = Thân(8)", 8, th39.chiIdx);
const th1 = anTieuHan(chiNam, input.gioiTinh, 1);
check("Tiểu hạn 1t = Tuất(10)", 10, th1.chiIdx);

console.log("\n=== 6. Lưu niên 2026 (Bính Ngọ) ===");
const ln = anLuuNien("Bính", "Ngọ", chiNam, viTriSao);
check("L.Thái Tuế Ngọ(6)", 6, ln.luuThaiTue.chiIdx);
check("L.Lộc = Thiên Đồng", "Thiên Đồng", ln.luuTuHoa.hoaLoc.sao);
check("L.Quyền = Thiên Cơ", "Thiên Cơ", ln.luuTuHoa.hoaQuyen.sao);
check("L.Khoa = Văn Xương", "Văn Xương", ln.luuTuHoa.hoaKhoa.sao);
check("L.Kỵ = Liêm Trinh", "Liêm Trinh", ln.luuTuHoa.hoaKy.sao);
check("L.Tuần [Dần,Mão]", ["Dần","Mão"], [...ln.luuTuanTriet.luuTuan].sort());
check("L.Triệt [Thìn,Tỵ]", ["Thìn","Tỵ"], [...ln.luuTuanTriet.luuTriet].sort());
check("L.Lộc Tồn Tỵ(5)", 5, ln.saoLuu["L.Lộc Tồn"]);
check("L.Kình Ngọ(6)", 6, ln.saoLuu["L.Kình Dương"]);
check("L.Đà La Thìn(4)", 4, ln.saoLuu["L.Đà La"]);
check("L.Tang Môn Thân(8)", 8, ln.saoLuu["L.Tang Môn"]);
check("L.Bạch Hổ Dần(2)", 2, ln.saoLuu["L.Bạch Hổ"]);
check("L.Tuế Phá Tí(0)", 0, ln.saoLuu["L.Tuế Phá"]);
check("Tam Tai 2026 = false", false, ln.isTamTai);

console.log("\n=== 7. Tử Vân ===");
const scc = anSaoChuCuc(cuc, viTriSao);
check("Sao chủ Cục Mộc Tam = Tham Lang", "Tham Lang", scc.sao);
console.log(`  Tham Lang đóng ${chiName(scc.chiIdx)}`);
const lnDef = getLaiNhanCung();
check("Lai Nhân default = Mệnh", "Mệnh", lnDef.tenCung);
check("Lai Nhân isManual=false", false, lnDef.isManual);
const lnMan = getLaiNhanCung("Điền Trạch");
check("Lai Nhân manual = Điền Trạch", "Điền Trạch", lnMan.tenCung);
const nt = anNguyenThan(chiNam, cungMenhChi, viTriSao);
console.log(`  Nguyên Thần: cung 1 = Mệnh ${chiName(nt.cungMenh.chiIdx)}, cung 2 = ${nt.cungThu2.tenCung} ${chiName(nt.cungThu2.chiIdx)}`);
check("NT cung 1 = Mệnh Dậu(9)", 9, nt.cungMenh.chiIdx);
check("NT cung 2 = nơi Liêm Trinh đóng", viTriSao["Liêm Trinh"], nt.cungThu2.chiIdx);
check("NT experimental=true", true, nt.experimental);
const tuVan = anTuVanFull({ cuc, chiNam, cungMenhChi, viTriSao });
check("Huyền Khí = null", null, tuVan.huyenKhi);

const total = pass + fail;
console.log(`\n${'='.repeat(50)}`);
console.log(`KẾT QUẢ: ${pass}/${total} PASS${fail > 0 ? `, ${fail} FAIL` : ''}`);
if (fail > 0) {
  console.log("\nFAILURES:");
  failures.forEach(f => console.log(`  - ${f.label}: expected ${JSON.stringify(f.expected)}, got ${JSON.stringify(f.actual)}`));
  process.exit(1);
}
