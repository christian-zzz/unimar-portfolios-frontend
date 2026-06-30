"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { User } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface UserInfo {
  id: string;
  name: string;
}

interface Portfolio {
  id: string;
  title: string;
  slug: string;
  thumbnail_path: string | null;
  user: UserInfo;
  categories?: Category[];
}

interface PortfolioCardProps {
  portfolio: Portfolio;
}

export const PortfolioCard = ({ portfolio }: PortfolioCardProps) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const getThumbnailUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${apiUrl}/storage/${path}`;
  };

  return (
    <Link 
      href={`/p/${portfolio.slug}`} 
      target="_blank" 
      rel="noopener noreferrer"
      className="bg-[#1C192F] border border-[#2A2640] rounded-2xl overflow-hidden flex flex-col h-full shadow-lg group hover:border-[#273E92]/50 transition-all duration-150 cursor-pointer"
    >
      {/* Portfolio Preview Image */}
      <div className="aspect-video w-full relative overflow-hidden bg-[#141127] flex-shrink-0 border-b border-[#2A2640]">
        {portfolio.thumbnail_path ? (
          <Image
            src={getThumbnailUrl(portfolio.thumbnail_path) || ""}
            alt={portfolio.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-[#141127] via-[#273E92]/40 to-[#ED6C31]/40 flex flex-col items-center justify-center p-4 text-center">
            <span className="font-tactic text-2xl font-black text-white/20 select-none">
              folium.
            </span>
          </div>
        )}
      </div>

      {/* Card Content details */}
      <div className="p-5 flex-grow flex flex-col justify-between">
        <div className="space-y-3">
          <h3 className="text-white text-base md:text-lg font-medium leading-snug line-clamp-2">
            {portfolio.title}
          </h3>
          
          {/* Portfolio Tags / Categories */}
          {portfolio.categories && portfolio.categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {portfolio.categories.map((cat) => (
                <span 
                  key={cat.id} 
                  className="px-2.5 py-0.5 rounded-md text-[10px] font-normal bg-[#141127] text-[#FFB598] border border-[#2A2640]/40"
                >
                  {cat.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Student author identifier */}
        <div className="flex items-center gap-2.5 mt-5">
          <div className="h-6 w-6 rounded-full bg-[#273E92] flex items-center justify-center text-[9px] text-white font-bold select-none">
            {getInitials(portfolio.user.name)}
          </div>
          <span className="text-xs font-medium text-[#FFB598]">
            {portfolio.user.name.toLowerCase()}
          </span>
        </div>
      </div>
    </Link>
  );
};
