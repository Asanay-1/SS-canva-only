"use client";

export const runtime = 'edge';

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Upload, Plus, X, Sticker, Download, Wand2 } from "lucide-react";

import { CanvasEditor } from "@/features/designer/components/CanvasEditor";
import { useDesigner } from "@/features/designer/hooks/useDesigner";
import { StickerPicker } from "@/features/designer/components/StickerPicker";
import { ActionToolbar } from "@/features/designer/components/ActionToolbar";

export default function DesignerPage() {
  const designer = useDesigner();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasArtwork, setHasArtwork] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showMockup, setShowMockup] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mockupAssetsLoaded, setMockupAssetsLoaded] = useState({ bottom: false, top: false });
  const isMockupReady = mockupAssetsLoaded.bottom && mockupAssetsLoaded.top;
  const [isDownloading, setIsDownloading] = useState(false);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [bgProgressText, setBgProgressText] = useState("");
  const stickerButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowStickerPicker(false);
        setShowMockup(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && designer) {
      setIsUploading(true);
      setUploadProgress(10);

      const url = URL.createObjectURL(file);

      // Simulate progress for local loading
      let prog = 10;
      const interval = setInterval(() => {
        prog += Math.random() * 30;
        if (prog >= 90) {
          clearInterval(interval);
          setUploadProgress(90);
        } else {
          setUploadProgress(prog);
        }
      }, 100);

      try {
        await designer.addImage(url, 'main');
        clearInterval(interval);
        setUploadProgress(100);
        setHasArtwork(true);
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
        }, 500);
      } catch (err) {
        clearInterval(interval);
        setIsUploading(false);
        setUploadProgress(0);
        alert("ອັບໂຫລດຮູບພາບບໍ່ສຳເລັດ ກະລຸນາລອງໃໝ່");
      } finally {
        e.target.value = '';
      }
    }
  };

  const onPublish = async () => {
    // Get the high-res transparent artwork from Canvas
    const canvasScreenshot = designer?.getCanvasData();
    if (canvasScreenshot) {
      setPreviewUrl(canvasScreenshot);
      setShowMockup(true);
    }
  };

  const handleDownloadMockup = async () => {
    if (!previewUrl) return;
    setIsDownloading(true);
    try {
      const loadImage = (src: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });

      const [imgBase, imgDesign, imgOverlay] = await Promise.all([
        loadImage("/assets/mockups/white-tshirt-hanger.png"),
        loadImage(previewUrl),
        loadImage("/assets/mockups/overlay.png"),
      ]);

      const size = 1280;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context unavailable");

      // Background fill
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);

      // Layer 1: Base T-shirt
      ctx.save();
      ctx.drawImage(imgBase, 0, 0, size, size);
      ctx.restore();

      // Layer 2: Design
      const ox = size * 0.5;
      const oy = size * 0.64;
      ctx.save();
      ctx.globalCompositeOperation = "multiply";
      ctx.translate(ox, oy);
      ctx.translate(0.005 * size, -0.075 * size);
      ctx.scale(0.79, 0.79);
      ctx.translate(-ox, -oy);
      ctx.drawImage(imgDesign, 0, 0, size, size);
      ctx.restore();

      // Layer 3: Texture & Shadow Overlay
      ctx.save();
      ctx.globalCompositeOperation = "multiply";
      ctx.globalAlpha = 0.2;
      if ("filter" in ctx) {
        ctx.filter = "brightness(1.1)";
      }
      ctx.drawImage(imgOverlay, 0, 0, size, size);
      ctx.restore();

      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `tshirt-mockup-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Failed to generate mockup download:", err);
      alert("ດາວໂຫລດບໍ່ສຳເລັດ ກະລຸນາລອງໃໝ່");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRemoveBackground = async () => {
    if (!designer) return;
    setIsRemovingBg(true);
    setBgProgressText("ກຳລັງປະມວນຜົນ...");
    // Yield to React so the loading state renders before inference starts
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    try {
      await designer.removeSelectedBackground((status) => {
        setBgProgressText(status);
      });
    } catch (err) {
      console.error("Failed to remove background:", err);
      alert("ລຶບພື້ນຫຼັງບໍ່ສຳເລັດ");
    } finally {
      setIsRemovingBg(false);
      setBgProgressText("");
    }
  };

  return (
    <main className="flex-1 px-4 md:px-6 py-4 md:py-6 flex flex-col items-center">
      <div className="w-full max-w-2xl flex flex-col gap-3 md:gap-4 relative">
        {/* Top Header */}
        <div className="flex items-center justify-end">
          <motion.button
            onClick={onPublish}
            disabled={isSubmitting}
            whileTap={{ scale: 0.95 }}
            className="w-9 h-9 md:w-10 md:h-10 bg-black text-white rounded-xl flex items-center justify-center hover:bg-gray-800 transition-all disabled:opacity-30 shadow-lg shadow-black/10 cursor-pointer"
            title="ເບິ່ງຜົນງານ"
          >
            {isSubmitting ? (
              <Loader2 size={18} className="animate-spin text-white/50" />
            ) : (
              <Upload size={18} />
            )}
          </motion.button>
        </div>

        {/* Progress Bar */}
        <AnimatePresence>
          {isUploading && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="w-full"
            >
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-black"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Designer Area & Desktop Toolbar */}
        <div className="w-full relative">
          <div className="w-full aspect-square bg-white rounded-xl border-2 border-gray-200 relative min-w-0 overflow-hidden shadow-sm">
            {/* Floating Action Buttons - Top Right: Add Image */}
            <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20">
              <label className="cursor-pointer w-9 h-9 bg-gray-100/80 backdrop-blur-sm active:bg-gray-200 active:scale-95 rounded-xl flex items-center justify-center text-gray-900 transition-all shadow-sm" title="ເພີ່ມຮູບພາບ">
                <Plus size={18} />
                <input
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  onChange={handleFileUpload}
                />
              </label>
            </div>

            {/* Floating Action Buttons - Top Left: Stickers */}
            <div className="absolute top-4 left-4 md:top-6 md:left-6 z-20">
              <button
                ref={stickerButtonRef}
                onClick={() => setShowStickerPicker((prev) => !prev)}
                className="cursor-pointer w-9 h-9 bg-gray-100/80 backdrop-blur-sm active:bg-gray-200 active:scale-95 rounded-xl flex items-center justify-center text-gray-900 transition-all shadow-sm"
                title="ສະຕິກເກີ້"
              >
                <Sticker size={18} />
              </button>
            </div>

            <div className="w-full h-full relative overflow-hidden">
              <CanvasEditor
                designer={designer}
                onPublish={onPublish}
                isSubmitting={isSubmitting}
                hasArtwork={hasArtwork}
              />
            </div>
          </div>

          {/* Desktop Action Toolbar - Outside on the right side of the canvas */}
          {designer && (
            <div className="hidden md:flex absolute -right-16 lg:-right-20 top-1/2 -translate-y-1/2 z-20">
              <ActionToolbar designer={designer} orientation="vertical" />
            </div>
          )}
        </div>

        {/* Mobile Action Toolbar - Outside and below canvas horizontally */}
        {designer && (
          <div className="flex md:hidden items-center justify-center w-full">
            <ActionToolbar designer={designer} orientation="horizontal" />
          </div>
        )}

        {/* Actions outside/below canvas */}
        <AnimatePresence>
          {designer?.selectedLayerType && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="flex items-center justify-start w-full"
            >
              <button
                type="button"
                onClick={handleRemoveBackground}
                disabled={isRemovingBg}
                className="flex items-center gap-2 bg-[#2a2a2a] hover:bg-[#383838] text-white px-3.5 py-2 rounded-md shadow-sm transition-all active:scale-95 disabled:opacity-50 text-xs font-medium cursor-pointer"
                title="ລຶບພື້ນຫຼັງ"
              >
                {isRemovingBg ? (
                  <>
                    <span
                      className="inline-flex items-center justify-center animate-spin"
                      style={{ willChange: "transform" }}
                    >
                      <Loader2 size={16} className="text-gray-300" />
                    </span>
                    <span>{bgProgressText || "ກຳລັງປະມວນຜົນ..."}</span>
                  </>
                ) : (
                  <>
                    <Wand2 size={16} className="text-gray-200" />
                    <span>ລຶບພື້ນຫຼັງ</span>
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Independent Sticker Window */}
        <AnimatePresence>
          {showStickerPicker && designer && (
            <StickerPicker
              designer={designer}
              onClose={() => setShowStickerPicker(false)}
              triggerRef={stickerButtonRef}
            />
          )}
        </AnimatePresence>

        {/* Mockup Modal */}
        <AnimatePresence>
          {showMockup && previewUrl && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              onClick={() => {
                setShowMockup(false);
                setMockupAssetsLoaded({ bottom: false, top: false });
              }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm cursor-pointer"
            >
              <motion.div
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="w-full max-w-xl flex flex-col items-center gap-3 md:gap-4 cursor-default select-none"
              >
                {/* Mockup Card */}
                <div className="relative w-full aspect-square bg-white rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center">
                  {/* Close Button - Top Left Inside Image, No Background */}
                  <button
                    onClick={() => {
                      setShowMockup(false);
                      setMockupAssetsLoaded({ bottom: false, top: false });
                    }}
                    className="absolute top-4 left-4 md:top-5 md:left-5 z-50 p-2 text-gray-500 hover:text-gray-900 transition-colors active:scale-95 cursor-pointer"
                    title="ປິດ"
                  >
                    <X size={22} />
                  </button>

                  {/* Overlay Loader */}
                  {!isMockupReady && (
                    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-2 bg-white/90 backdrop-blur-sm">
                      <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ກຳລັງໂຫລດ...</p>
                    </div>
                  )}

                  {/* Layer 1: Base Hanger Shirt (Bottom) */}
                  <img
                    src="/assets/mockups/white-tshirt-hanger.png"
                    alt="ເສື້ອຍືດ"
                    onLoad={() => setMockupAssetsLoaded(prev => ({ ...prev, bottom: true }))}
                    className={`absolute inset-0 w-full h-full object-contain select-none pointer-events-none transition-opacity duration-300 ${mockupAssetsLoaded.bottom ? 'opacity-100' : 'opacity-0'}`}
                  />

                  {/* Layer 2: Your Design Overlay (Middle) */}
                  {isMockupReady && (
                    <motion.img
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      src={previewUrl}
                      alt="ລາຍອອກແບບ"
                      className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none mix-blend-multiply"
                      style={{
                        transformOrigin: "50% 64%",
                        transform: 'translate(0.5%, -7.5%) scale(0.79)'
                      }}
                    />
                  )}

                  {/* Layer 3: Texture & Shadow Overlay (Top)*/}
                  <img
                    src="/assets/mockups/overlay.png"
                    alt="ແສງແລະເງົາ"
                    onLoad={() => setMockupAssetsLoaded(prev => ({ ...prev, top: true }))}
                    className={`absolute inset-0 w-full h-full object-contain select-none pointer-events-none opacity-20 mix-blend-multiply transition-opacity duration-300 ${mockupAssetsLoaded.top ? 'opacity-20' : 'opacity-0'}`}
                    style={{
                      filter: 'brightness(1.1)'
                    }}
                  />
                </div>

                {/* Download Button - Outside Below Mockup */}
                <button
                  onClick={handleDownloadMockup}
                  disabled={!isMockupReady || isDownloading}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-gray-900 hover:bg-gray-100 text-sm font-semibold rounded-xl backdrop-blur-sm transition-all active:scale-95 disabled:opacity-40 shadow-lg cursor-pointer"
                >
                  {isDownloading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Download size={16} />
                  )}
                  <span>Download</span>
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
