"use client";

export const runtime = 'edge';

import { useState } from "react";
import { DesignCard } from "@/features/designs/components/DesignCard";
import { MOCK_DESIGNS } from "@/lib/mock-data";
import { Plus, Filter } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type FilterType = "all" | "active" | "draft";

const FILTER_LABELS: Record<FilterType, string> = {
  all: "ທັງໝົດ",
  active: "ກຳລັງໃຊ້ງານ",
  draft: "ສະບັບຮ່າງ",
};

export default function DesignsPage() {
  const [filter, setFilter] = useState<FilterType>("all");

  const filteredDesigns = MOCK_DESIGNS.filter((design) => {
    if (filter === "all") return true;
    return design.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">ຜົນງານຂອງຂ້ອຍ</h2>
          <p className="text-sm text-gray-500 mt-0.5">ຈັດການຜົນງານທັງໝົດຂອງທ່ານ</p>
        </div>
        <Link
          href="/designs/upload"
          className="inline-flex items-center justify-center gap-2 bg-black text-white font-bold text-sm h-10 px-5 rounded-xl hover:bg-gray-900 transition-colors"
        >
          <Plus size={18} />
          <span>ອອກແບບໃໝ່</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-medium text-gray-500 mr-2">
          <Filter size={14} />
          <span>ຕົວກັ່ນຕອງ:</span>
        </div>
        {(["all", "active", "draft"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-bold capitalize transition-all",
              filter === f
                ? "bg-[#262626] text-white shadow-sm"
                : "text-gray-500 hover:bg-gray-100"
            )}
          >
            {FILTER_LABELS[f]}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filteredDesigns.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {filteredDesigns.map((design) => (
            <DesignCard key={design.id} design={design} />
          ))}
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Plus size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">ບໍ່ພົບຜົນງານ</h3>
          <p className="text-gray-500 mb-6 max-w-sm">
            {filter !== "all"
              ? `ທ່ານຍັງບໍ່ມີຜົນງານແບບ ${FILTER_LABELS[filter]}`
              : "ເລີ່ມຕົ້ນສ້າງຜົນງານຂອງທ່ານໂດຍການອັບໂຫລດລາຍທຳອິດ"}
          </p>
          <Link
            href="/designs/upload"
            className="inline-flex items-center justify-center bg-[#262626] text-white font-bold text-sm h-10 px-6 rounded-xl hover:bg-black transition-colors"
          >
            ອັບໂຫລດຕອນນີ້
          </Link>
        </div>
      )}
    </div>
  );
}
