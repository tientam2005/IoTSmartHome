import { useState, useRef } from "react";
import { Camera, Upload, X, CheckCircle, Loader2, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface CccdResult {
  cccd: string;
  name?: string;
  dob?: string;
  hometown?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onResult: (result: CccdResult) => void;
}

// Trích xuất số CCCD từ text OCR (12 chữ số liên tiếp)
const extractCccd = (text: string): string | null => {
  const match = text.replace(/\s/g, "").match(/\d{12}/);
  return match ? match[0] : null;
};

// Simulate OCR — thực tế swap bằng Tesseract.js
const simulateOcr = async (file: File): Promise<string> => {
  return new Promise(resolve => {
    setTimeout(() => {
      // Trả về text giả lập có chứa số CCCD
      resolve("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nCĂN CƯỚC CÔNG DÂN\n079201001234\nHọ và tên: TRẦN THỊ BÌNH\nNgày sinh: 01/01/1995\nQuê quán: Hà Nội");
    }, 2000);
  });
};

const CccdScanner = ({ open, onClose, onResult }: Props) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<CccdResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setPreview(null);
    setScanning(false);
    setResult(null);
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Vui lòng chọn file ảnh"); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    setScanning(true);
    setResult(null);

    try {
      const text = await simulateOcr(file);
      const cccd = extractCccd(text);

      if (!cccd) {
        toast.error("Không nhận diện được số CCCD. Vui lòng thử lại với ảnh rõ hơn.");
        setScanning(false);
        return;
      }

      // Parse thêm thông tin nếu có
      const nameMatch = text.match(/Họ và tên[:\s]+([^\n]+)/i);
      const dobMatch = text.match(/Ngày sinh[:\s]+([^\n]+)/i);
      const hometownMatch = text.match(/Quê quán[:\s]+([^\n]+)/i);

      const parsed: CccdResult = {
        cccd,
        name: nameMatch?.[1]?.trim(),
        dob: dobMatch?.[1]?.trim(),
        hometown: hometownMatch?.[1]?.trim(),
      };
      setResult(parsed);
    } catch {
      toast.error("Lỗi khi xử lý ảnh");
    } finally {
      setScanning(false);
    }
  };

  const handleConfirm = () => {
    if (!result) return;
    onResult(result);
    toast.success("Đã cập nhật thông tin từ CCCD");
    onClose();
    reset();
  };

  const handleClose = () => {
    onClose();
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle>Quét CCCD</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload area */}
          {!preview && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground text-center">
                Chụp hoặc tải ảnh mặt trước CCCD để tự động điền thông tin
              </p>

              {/* Camera capture */}
              <button
                onClick={() => cameraRef.current?.click()}
                className="w-full py-4 rounded-xl border-2 border-dashed border-primary/40 flex flex-col items-center gap-2 hover:bg-primary/5 transition"
              >
                <div className="p-3 rounded-full bg-primary/10">
                  <Camera className="h-6 w-6 text-primary" />
                </div>
                <span className="text-sm font-medium">Chụp ảnh</span>
                <span className="text-xs text-muted-foreground">Dùng camera thiết bị</span>
              </button>
              <input
                ref={cameraRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
              />

              {/* File upload */}
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full py-3 rounded-xl border border-border flex items-center justify-center gap-2 hover:bg-secondary/50 transition"
              >
                <Upload className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Tải ảnh từ thiết bị</span>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </div>
          )}

          {/* Preview + scanning */}
          {preview && (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden">
                <img src={preview} alt="CCCD" className="w-full object-cover rounded-xl max-h-48" />
                {scanning && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2 rounded-xl">
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                    <p className="text-white text-sm font-medium">Đang nhận diện...</p>
                  </div>
                )}
                {/* Scan line animation */}
                {scanning && (
                  <div className="absolute inset-x-0 h-0.5 bg-primary/80 animate-bounce top-1/2" />
                )}
              </div>

              {/* Result */}
              {result && (
                <div className="glass-card rounded-xl p-4 space-y-2 border border-success/30">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <p className="text-sm font-semibold text-success">Nhận diện thành công</p>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Số CCCD</span>
                      <span className="font-bold font-mono">{result.cccd}</span>
                    </div>
                    {result.name && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Họ tên</span>
                        <span className="font-medium">{result.name}</span>
                      </div>
                    )}
                    {result.dob && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ngày sinh</span>
                        <span>{result.dob}</span>
                      </div>
                    )}
                    {result.hometown && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Quê quán</span>
                        <span>{result.hometown}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={reset} className="flex-1 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium flex items-center justify-center gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5" /> Thử lại
                </button>
                {result && (
                  <button onClick={handleConfirm} className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
                    Xác nhận dùng
                  </button>
                )}
              </div>
            </div>
          )}

          <p className="text-[10px] text-muted-foreground text-center">
            Ảnh chỉ được xử lý trên thiết bị, không gửi lên server
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CccdScanner;
