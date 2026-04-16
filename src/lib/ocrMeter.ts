/**
 * OCR đọc chỉ số đồng hồ điện/nước từ ảnh.
 * Khi cài tesseract.js, thay simulateOcr bằng:
 *   import Tesseract from "tesseract.js";
 *   const { data: { text } } = await Tesseract.recognize(file, "eng");
 *   return extractMeterNumber(text);
 */

/** Trích số đồng hồ: lấy chuỗi số dài nhất (3-8 chữ số) */
export const extractMeterNumber = (text: string): number | null => {
  const matches = text.replace(/\s/g, "").match(/\d{3,8}/g);
  if (!matches) return null;
  const longest = matches.sort((a, b) => b.length - a.length)[0];
  return parseInt(longest, 10);
};

/** Simulate OCR — trả về số thực tế từ ảnh (giả lập) */
const simulateOcr = (file: File, previousValue: number): Promise<number> =>
  new Promise(resolve =>
    setTimeout(() => {
      // Simulate: chỉ số mới = cũ + mức dùng ngẫu nhiên hợp lý
      // Điện: +80~200 kWh/tháng | Nước: +4~10 m³/tháng
      // Dựa vào previousValue để ước lượng loại đồng hồ
      const isWater = previousValue < 500; // nước thường < 500, điện thường > 500
      const usage = isWater
        ? Math.floor(Math.random() * 7) + 4   // 4-10 m³
        : Math.floor(Math.random() * 120) + 80; // 80-200 kWh
      resolve(previousValue + usage);
    }, 1200)
  );

/**
 * OCR ảnh đồng hồ và validate kết quả.
 * @param file - File ảnh
 * @param previousValue - Chỉ số tháng trước (để validate)
 * @param maxMonthlyUsage - Mức dùng tối đa hợp lý/tháng (để lọc kết quả sai)
 */
export const ocrMeterImage = async (
  file: File,
  previousValue: number,
  maxMonthlyUsage = 500
): Promise<{ value: number; raw: string } | null> => {
  const value = await simulateOcr(file, previousValue);

  // Validate: phải lớn hơn cũ và không vượt quá mức dùng tối đa
  if (value <= previousValue) return null;
  if (value - previousValue > maxMonthlyUsage) return null;

  return { value, raw: String(value) };
};
