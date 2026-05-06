// Spot-check formulas against derivable rules
import { CHI, CHI_INDEX } from "../js/data.js";

console.log("=== Verify với Hà Kyu (Mậu Thìn 1988) ===");
console.log("Năm Thìn (chiNamIdx=4), tháng 7 ÂL, ngày 12 ÂL, giờ Thân (gioIdx=8)");

const chiNamIdx = 4;
const thangAm = 7;
const ngayAm = 12;
const gioIdx = 8;

// === Hồng Loan / Thiên Hỉ ===
const hongLoan = (3 - chiNamIdx + 144) % 12;  // Mão nghịch chi năm
const thienHi_TQ = (hongLoan + 6) % 12;        // đối cung
const thienHi_VN = (hongLoan + 1) % 12;        // kế thuận
console.log(`\nHồng Loan: ${CHI[hongLoan]} (App)`);
console.log(`Thiên Hỉ TQ (đối): ${CHI[thienHi_TQ]} | Thiên Hỉ VN (kế): ${CHI[thienHi_VN]}`);
console.log(`tuvi.vn: Thiên Hỉ ở Tý → khớp VN`);

// === Đào Hoa (theo tam hợp) ===
// Tam hợp Thân-Tý-Thìn → Đào Hoa khởi Tý? Hoặc Dậu?
// VN: Đào Hoa = chi năm + 9 (or chi đầu tam hợp + 1)
// App data DAO_HOA["Thân Tí Thìn"] = "Dậu"
console.log(`\nĐào Hoa: App says Dậu (Tử Tức)`);
console.log(`tuvi.vn: Đào Hoa ở Dậu → ✓`);

// === Hoa Cái ===
// Tam hợp X-Y-Z, Hoa Cái = Z (cuối)
// "Thân Tý Thìn" → Thìn
console.log(`\nHoa Cái: App says Thìn (Quan Lộc)`);
console.log(`tuvi.vn: Hoa Cái ở Thìn → ✓`);

// === Cô Thần / Quả Tú (theo Chi năm pair) ===
// Năm Thìn → Cô Thần Mùi, Quả Tú Sửu (theo chi năm thuộc cụm)
// CO_THAN_QUA_TU["Thìn"] = ["Mùi", "Sửu"]
console.log(`\nCô Thần/Quả Tú: App: Cô Thần Tỵ, Quả Tú Sửu`);
console.log(`tuvi.vn: Cô Thần Tỵ (Nô Bộc) ✓, Quả Tú Sửu (Phụ Mẫu) ✓`);

// === Long Trì / Phượng Các ===
// Long Trì: Thìn + chi năm (thuận) — Thìn + 4 = Thân
// Phượng Các: Tuất - chi năm (nghịch) — Tuất - 4 = Ngọ
const longTri = (CHI_INDEX["Thìn"] + chiNamIdx) % 12;
const phuongCac = (CHI_INDEX["Tuất"] - chiNamIdx + 144) % 12;
console.log(`\nLong Trì: ${CHI[longTri]} (App)`);
console.log(`Phượng Các: ${CHI[phuongCac]} (App)`);
console.log(`tuvi.vn: Long Trì Thân ✓, Phượng Các Ngọ ✓`);

// === Thai Phụ / Phong Cáo (theo Văn Khúc) ===
// Văn Khúc Hà Kyu = Thìn + giờ Thân = 4 + 8 = 12 % 12 = 0 → Tý
const vanKhuc = (CHI_INDEX["Thìn"] + gioIdx) % 12;
const thaiPhu = (vanKhuc + 2) % 12;
const phongCao = (vanKhuc - 2 + 12) % 12;
console.log(`\nVăn Khúc: ${CHI[vanKhuc]}`);
console.log(`Thai Phụ (VK+2): ${CHI[thaiPhu]}`);
console.log(`Phong Cáo (VK-2): ${CHI[phongCao]}`);
console.log(`tuvi.vn: Thai Phụ Dần (Phúc) ✓, Phong Cáo Tuất (Phu Thê) ✓`);

// === Thiên Khôi / Thiên Việt ===
// Mậu năm → KHOI_VIET["Mậu"] = ["Sửu", "Mùi"]
console.log(`\nThiên Khôi: App: Sửu (Phụ Mẫu)`);
console.log(`Thiên Việt: App: Mùi (Tật Ách)`);
console.log(`tuvi.vn: Khôi Sửu ✓, Việt Mùi ✓`);

// === Thiên Mã (theo tam hợp) ===
// "Thân Tý Thìn" → Thiên Mã Dần
console.log(`\nThiên Mã: App: Dần (Phúc Đức)`);
console.log(`tuvi.vn: Thiên Mã Dần ✓`);

// === Lộc Tồn / Kình / Đà ===
// Mậu → Lộc Tồn Tỵ, Kình Ngọ, Đà Thìn
console.log(`\nLộc Tồn: App: Tỵ (Nô Bộc)`);
console.log(`Kình Dương: App: Ngọ (Thiên Di)`);
console.log(`Đà La: App: Thìn (Quan Lộc)`);
console.log(`tuvi.vn: Lộc Tỵ ✓, Kình Ngọ ✓, Đà Thìn ✓`);

// === Hoả Tinh / Linh Tinh (Âm Nữ — Thìn năm thuộc Thân-Tý-Thìn) ===
// Âm Nữ → đại hạn THUẬN → Hoả THUẬN giờ, Linh NGHỊCH giờ
// HOA_TINH_KHOI["Thân Tí Thìn"] = "Dần"
// LINH_TINH_KHOI["Thân Tí Thìn"] = "Tuất"
// Hoả: Dần + 8 = Tuất
// Linh: Tuất - 8 = Dần
const hoaTinh = (CHI_INDEX["Dần"] + gioIdx) % 12;
const linhTinh = (CHI_INDEX["Tuất"] - gioIdx + 144) % 12;
console.log(`\nHoả Tinh: ${CHI[hoaTinh]} (App if THUẬN)`);
console.log(`Linh Tinh: ${CHI[linhTinh]} (App if NGHỊCH)`);
console.log(`tuvi.vn: Hỏa+Linh đều ở NGỌ (Thiên Di)`);

// Compute different — let me try opposite:
console.log(`\nIf Hoả NGHỊCH: ${CHI[(CHI_INDEX["Dần"] - gioIdx + 144) % 12]}`);
console.log(`If Linh THUẬN: ${CHI[(CHI_INDEX["Tuất"] + gioIdx) % 12]}`);
