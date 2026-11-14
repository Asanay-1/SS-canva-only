"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X, Upload, Sticker, Loader2 } from "lucide-react";
import { cn, assetUrl } from "@/lib/utils";
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

    fetch(assetUrl("/assets/stickers.json"))
      .then((res) => res.json())
      .then((data: { stickers: string[] }) => {
        const resolvedStickers = (data.stickers || []).map((s) => assetUrl(s));
        cachedPresets = resolvedStickers;
        setPresetStickers(resolvedStickers);
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

  const panel = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
      <motion.div
        ref={panelRef}
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.16, ease: "easeOut" }}
        className="pointer-events-auto w-full max-w-xs md:max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-gray-200/90 max-h-[80vh] flex flex-col select-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <Sticker size={18} className="text-gray-800" />
            <span className="text-xs font-black uppercase tracking-wider text-gray-800">
              ສະຕິກເກີ້
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors text-gray-600 active:scale-95 cursor-pointer"
            title="ປິດ"
          >
            <X size={14} />
          </button>
        </div>

        {/* Upload custom sticker */}
        <label className="w-full flex items-center justify-center gap-2 py-2.5 mb-3 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-black hover:bg-gray-50 transition-all text-[11px] font-bold uppercase tracking-wider text-gray-600 hover:text-black shrink-0 active:scale-98">
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
        <div className="overflow-y-auto pr-1 space-y-3 flex-1 min-h-0">
          {/* Uploaded Stickers Section */}
          {uploadedStickers.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
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
                      "aspect-square bg-gray-50 rounded-xl flex items-center justify-center p-2 border-2 border-transparent hover:border-black hover:bg-white transition-all active:scale-95 cursor-pointer",
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
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-300">
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
            <p className="text-center text-xs text-gray-400 py-4">ບໍ່ພົບສະຕິກເກີ້</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {presetStickers.map((url) => (
                <button
                  key={url}
                  onClick={() => handleSelectSticker(url)}
                  disabled={loading === url}
                  className={cn(
                    "aspect-square bg-gray-50 rounded-xl flex items-center justify-center p-2 border-2 border-transparent hover:border-black hover:bg-white transition-all active:scale-95 cursor-pointer",
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
    </div>
  );

  return createPortal(panel, document.body);
}
