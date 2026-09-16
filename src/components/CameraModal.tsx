import React, { useState, useRef, useEffect } from "react";

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageCaptured: (base64Data: string) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onImageCaptured
}) => {
  const [useLiveCamera, setUseLiveCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera on close
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setPreviewImage(null);
      setCameraError(null);
      setUseLiveCamera(false);
    }
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setUseLiveCamera(true);
    } catch (err: any) {
      console.warn("Camera error:", err);
      setCameraError("Không thể truy cập camera. Vui lòng cấp quyền camera cho trình duyệt hoặc chọn tải ảnh chụp bài tập từ thiết bị.");
      setUseLiveCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setUseLiveCamera(false);
  };

  const captureFrame = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        setPreviewImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn tệp hình ảnh (PNG, JPG, JPEG)!");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPreviewImage(event.target.result as string);
        stopCamera();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = () => {
    if (!previewImage) return;
    setIsProcessing(true);
    onImageCaptured(previewImage);
    setIsProcessing(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <i className="fa-solid fa-camera"></i>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Quét Đề Bài Toán Qua Ảnh</h3>
              <p className="text-xs text-slate-500">Chụp sách giáo khoa hoặc vở bài tập của bạn</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 flex flex-col items-center">
          {previewImage ? (
            <div className="w-full flex flex-col items-center gap-3">
              <div className="relative w-full rounded-xl overflow-hidden border-2 border-blue-400 bg-slate-900 flex items-center justify-center max-h-72">
                <img
                  src={previewImage}
                  alt="Bài toán đã chụp"
                  className="max-h-72 w-auto object-contain"
                />
                <button
                  onClick={() => setPreviewImage(null)}
                  className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-md hover:bg-red-700 flex items-center gap-1"
                >
                  <i className="fa-solid fa-trash-can"></i> Chụp lại
                </button>
              </div>
              <p className="text-xs text-slate-500 text-center">
                Bức ảnh đã sẵn sàng! AI sẽ đọc các công thức toán và hướng dẫn bạn từng bước.
              </p>
            </div>
          ) : useLiveCamera ? (
            <div className="w-full flex flex-col items-center gap-3">
              <div className="relative w-full rounded-xl overflow-hidden bg-black aspect-4/3 flex items-center justify-center shadow-inner">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                {/* Camera target frame overlay */}
                <div className="absolute inset-8 border-2 border-dashed border-amber-400/80 rounded-lg pointer-events-none flex items-center justify-center">
                  <span className="bg-black/50 text-amber-300 text-xs px-2 py-1 rounded backdrop-blur-xs">
                    Căn khung vào bài toán
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full">
                <button
                  type="button"
                  onClick={captureFrame}
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-amber-500 text-white font-bold rounded-xl shadow-md hover:opacity-95 flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-circle-dot text-lg"></i>
                  Chụp ngay
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200"
                >
                  Hủy
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center justify-center gap-4 py-4">
              {cameraError && (
                <div className="w-full bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                  <i className="fa-solid fa-triangle-exclamation text-amber-500 mt-0.5"></i>
                  <span>{cameraError}</span>
                </div>
              )}

              {/* Upload Drop Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/50 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center gap-2"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-2xl mb-1">
                  <i className="fa-solid fa-cloud-arrow-up"></i>
                </div>
                <div className="font-bold text-slate-700 text-sm">Tải ảnh đề bài từ máy / Thư viện ảnh</div>
                <div className="text-xs text-slate-500">Hỗ trợ ảnh PNG, JPG, JPEG hoặc chụp trực tiếp từ điện thoại</div>
                <span className="mt-2 text-xs font-semibold px-3 py-1 bg-white border border-slate-200 text-blue-600 rounded-lg shadow-2xs">
                  Chọn ảnh ngay
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              <div className="flex items-center gap-3 w-full">
                <div className="flex-1 h-px bg-slate-200"></div>
                <span className="text-xs text-slate-400 font-medium">HOẶC</span>
                <div className="flex-1 h-px bg-slate-200"></div>
              </div>

              {/* Start Camera Button */}
              <button
                type="button"
                onClick={startCamera}
                className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm"
              >
                <i className="fa-solid fa-video"></i>
                Mở Camera Trực Tiếp
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {previewImage && (
          <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 font-semibold hover:bg-slate-200 rounded-xl"
            >
              Đóng
            </button>
            <button
              type="button"
              id="btn-confirm-scan-problem"
              onClick={handleConfirm}
              disabled={isProcessing}
              className="px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-amber-500 rounded-xl shadow-md hover:opacity-95 flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  Đang nhận diện...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-wand-magic-sparkles"></i>
                  Nhận diện & Bắt đầu dẫn dắt Socratic
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
