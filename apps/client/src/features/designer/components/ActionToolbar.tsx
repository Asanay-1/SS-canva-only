"use client";

import { Trash2, AlignCenter, FlipHorizontal, RotateCw, ChevronUp, ChevronDown } from "lucide-react";
import { useDesigner } from "../hooks/useDesigner";

interface ActionToolbarProps {
  designer: ReturnType<typeof useDesigner>;
  orientation?: "vertical" | "horizontal";
  className?: string;
}

export function ActionToolbar({ designer, orientation = "vertical", className = "" }: ActionToolbarProps) {
  const isHorizontal = orientation === "horizontal";

  return (
    <div
      id="action-toolbar"
      className={`bg-black/90 backdrop-blur-sm text-white ${
        isHorizontal
          ? "px-3 py-2 rounded-[20px] flex flex-row items-center justify-center gap-1.5 shadow-md"
          : "px-2.5 py-2.5 md:px-3 md:py-3 rounded-[24px] flex flex-col items-center gap-2 shadow-lg"
      } border border-white/10 ${className}`}
    >
      <button
        type="button"
        onClick={designer.deleteSelected}
        className="p-2 hover:bg-white/10 rounded-xl transition-colors text-red-400 active:scale-95"
        title="ລຶບທີ່ເລືອກ"
      >
        <Trash2 size={18} />
      </button>

      <div className={isHorizontal ? "w-px h-5 bg-white/10 mx-0.5" : "w-5 h-px bg-white/10 my-0.5"} />

      <button
        type="button"
        onClick={designer.centerObjectH}
        className="p-2 hover:bg-white/10 rounded-xl transition-colors text-gray-300 active:scale-95"
        title="ຈັດວາງເຄິ່ງກາງ"
      >
        <AlignCenter size={18} />
      </button>

      <button
        type="button"
        onClick={designer.flipObject}
        className="p-2 hover:bg-white/10 rounded-xl transition-colors text-gray-300 active:scale-95"
        title="ກັບດ້ານ"
      >
        <FlipHorizontal size={18} />
      </button>

      <div className={isHorizontal ? "w-px h-5 bg-white/10 mx-0.5" : "w-5 h-px bg-white/10 my-0.5"} />

      <button
        type="button"
        onClick={designer.rotateObject}
        className="p-2 hover:bg-white/10 rounded-xl transition-colors text-gray-300 active:scale-95"
        title="ຫມຸນ 45°"
      >
        <RotateCw size={18} />
      </button>

      <div className={isHorizontal ? "w-px h-5 bg-white/10 mx-0.5" : "w-5 h-px bg-white/10 my-0.5"} />

      <button
        type="button"
        onClick={designer.bringForward}
        className="p-2 hover:bg-white/10 rounded-xl transition-colors text-gray-300 active:scale-95"
        title="ຍ້າຍຂຶ້ນເທິງ"
      >
        <ChevronUp size={18} />
      </button>

      <button
        type="button"
        onClick={designer.sendBackwards}
        className="p-2 hover:bg-white/10 rounded-xl transition-colors text-gray-300 active:scale-95"
        title="ຍ້າຍລົງລຸ່ມ"
      >
        <ChevronDown size={18} />
      </button>
    </div>
  );
}
