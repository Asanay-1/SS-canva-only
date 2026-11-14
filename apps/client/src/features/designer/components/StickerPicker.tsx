"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { X, Upload, Sticker, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { useDesigner } from "../hooks/useDesigner";

interface StickerPickerProps {
  designer: ReturnType<typeof useDesigner>;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement | null>;
}

// In-memory session cache: persists across panel open/close until page refresh
let sessionUploadedStickers: string[] = [];
let cachedPresets: string[] | null = null;

export function StickerPicker({ designer, onClose, triggerRef }: StickerPickerProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [uploadedStickers, setUploadedStickers] = useState<string[]>(sessionUploadedStickers);
  const [presetStickers, setPresetStickers] = useState<string[]>(cachedPresets || []);
  const [fetchingPresets, setFetchingPresets] = useState(!cachedPresets);

  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (triggerRef?.current && triggerRef.current.contains(target)) {
        return;
      }
      if (panelRef.current && !panelRef.current.contains(target)) {
        onClose();
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [onClose, triggerRef]);

  useEffect(() => {
    if (cachedPresets) return;

    fetch("/assets/stickers.json")
      .then((res) => res.json())
      .then((data: { stickers: string[] }) => {
        cachedPresets = data.stickers;
        setPresetStickers(data.stickers);
      })
      .catch(() => setPresetStickers([]))
      .finally(() => setFetchingPresets(false));
  }, []);

  const handleSelectSticker = async (url: string) => {
    setLoading(url);
    try {
      await designer.addImage(url, 'sticker');
      onClose();
    } catch (err) {
      console.error("Failed to add sticker:", err);
    } finally {
      setLoading(null);
    }
  };

  const handleUploadSticker = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    sessionUploadedStickers = [url, ...sessionUploadedStickers];
    setUploadedStickers(sessionUploadedStickers);
    await handleSelectSticker(url);
    e.target.value = "";
  };

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="absolute top-16 left-4 md:left-6 z-50 w-72 bg-white rounded-[20px] p-4 shadow-xl border border-gray-100 max-h-[480px] flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <Sticker size={16} className="text-gray-700" />
          <span className="text-[11px] font-black uppercase tracking-widest text-gray-700">
            ສະຕິກເກີ້
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <X size={12} />
        </button>
      </div>

      {/* Upload custom sticker */}
      <label className="w-full flex items-center justify-center gap-2 py-2.5 mb-3 border-2 border-dashed border-gray-300 rounded-[14px] cursor-pointer hover:border-black hover:bg-gray-50 transition-all text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-black shrink-0">
        <Upload size={14} />
        ອັບໂຫລດ ສະຕິກເກີ້
        <input
          ref={fileRef}
          type="file"
          className="sr-only"
          accept="image/png,image/svg+xml,image/gif,image/webp"
          onChange={handleUploadSticker}
        />
      </label>

      {/* Scrollable stickers list */}
      <div className="overflow-y-auto pr-0.5 space-y-3 flex-1">
        {/* Uploaded Stickers Section */}
        {uploadedStickers.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                ອັບໂຫລດແລ້ວ ({uploadedStickers.length})
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {uploadedStickers.map((url, idx) => (
                <button
                  key={`uploaded-${idx}-${url}`}
                  onClick={() => handleSelectSticker(url)}
                  disabled={loading === url}
                  className={cn(
                    "aspect-square bg-gray-50 rounded-[12px] flex items-center justify-center p-2 border-2 border-transparent hover:border-black hover:bg-white transition-all active:scale-95",
                    loading === url && "opacity-50 cursor-wait"
                  )}
                >
                  <img
                    src={url}
                    alt="uploaded sticker"
                    className="w-full h-full object-contain"
                    draggable={false}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-[9px] font-black uppercase tracking-widest text-gray-300">
            List
          </span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        {/* Preset Grid */}
        {fetchingPresets ? (
          <div className="flex items-center justify-center py-6 text-gray-300">
            <Loader2 size={20} className="animate-spin" />
          </div>
        ) : presetStickers.length === 0 ? (
          <p className="text-center text-[10px] text-gray-400 py-4">ບໍ່ພົບສະຕິກເກີ້</p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {presetStickers.map((url) => (
              <button
                key={url}
                onClick={() => handleSelectSticker(url)}
                disabled={loading === url}
                className={cn(
                  "aspect-square bg-gray-50 rounded-[12px] flex items-center justify-center p-2 border-2 border-transparent hover:border-black hover:bg-white transition-all active:scale-95",
                  loading === url && "opacity-50 cursor-wait"
                )}
              >
                <img
                  src={url}
                  alt="sticker"
                  className="w-full h-full object-contain"
                  draggable={false}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
