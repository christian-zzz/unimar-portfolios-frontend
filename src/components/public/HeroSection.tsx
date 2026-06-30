"use client";

import React from "react";
import { Search } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface HeroSectionProps {
  categories: Category[];
  activeCategorySlug: string | null;
  onSelectCategory: (slug: string | null) => void;
  searchQuery: string;
  onChangeSearchQuery: (query: string) => void;
  onSearchSubmit: () => void;
}

export const HeroSection = ({
  categories,
  activeCategorySlug,
  onSelectCategory,
  searchQuery,
  onChangeSearchQuery,
  onSearchSubmit,
}: HeroSectionProps) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearchSubmit();
    }
  };

  return (
    <section className="w-full bg-[#141127] pt-64 pb-8 px-6 flex flex-col items-center justify-center select-none relative overflow-hidden">
      {/* Top Center Gradient Light Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-[#273E92]/30 rounded-full blur-[100px] pointer-events-none z-0" />
      
      <div className="max-w-5xl mx-auto w-full text-center relative z-10">
        {/* Main Hero Header */}
        <h1 className="font-tactic text-[#E5DEFE] text-xl sm:text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight leading-[1.3] max-w-5xl mx-auto select-text">
          Construye mejores sitios, <br className="hidden sm:inline" />
          más <span className="text-[#FFB598]">rápido</span>
        </h1>

        {/* Subtitle Description */}
        <p className="text-[#E5DEFE]/70 text-sm sm:text-base md:text-lg max-w-2xl mx-auto mt-6 leading-relaxed select-text font-sans font-normal">
          Explora portafolios de diseño, fotografía, ilustración y más. Conecta con el
          talento que define la industria.
        </p>

        {/* Search Bar container */}
        <div id="search" className="w-full max-w-2xl mx-auto mt-10 bg-[#1C1835] border border-[#2A2640] rounded-full px-4 py-2 flex items-center shadow-lg transition-all focus-within:border-[#273E92]/60 focus-within:ring-1 focus-within:ring-[#273E92]/40">
          <Search className="h-5 w-5 text-[#FFB598] ml-2 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onChangeSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar proyectos, profesionales, archivos..."
            className="flex-grow bg-transparent border-0 text-white placeholder-[#FFB598]/50 text-sm focus:ring-0 focus:outline-hidden px-3 py-1.5 font-normal"
          />
          <button
            onClick={onSearchSubmit}
            className="bg-[#273E92] hover:bg-[#1d3070] text-white text-xs font-medium rounded-full px-6 py-2.5 transition-colors cursor-pointer select-none flex-shrink-0"
          >
            Buscar
          </button>
        </div>

        {/* Category Filter Tags */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-8 max-w-3xl mx-auto">
          {/* Default "Todos" option */}
          <button
            onClick={() => onSelectCategory(null)}
            className={`px-5 py-2 rounded-full text-xs font-medium border transition-all cursor-pointer ${
              activeCategorySlug === null
                ? "bg-[#C5E4E4] text-[#141127] border-[#C5E4E4] shadow-xs"
                : "bg-[#1C1835] border-[#2A2640] text-[#FFB598] hover:bg-[#2A2640] hover:text-white"
            }`}
          >
            Todos
          </button>

          {/* Seeded Categories */}
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className={`px-5 py-2 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                activeCategorySlug === cat.slug
                  ? "bg-[#C5E4E4] text-[#141127] border-[#C5E4E4] shadow-xs"
                  : "bg-[#1C1835] border-[#2A2640] text-[#FFB598] hover:bg-[#2A2640] hover:text-white"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
