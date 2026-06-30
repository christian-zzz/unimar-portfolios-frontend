"use client";

import React, { useState, useEffect } from "react";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { HeroSection } from "@/components/public/HeroSection";
import { PortfolioFeed } from "@/components/public/PortfolioFeed";
import { InfoSection } from "@/components/public/InfoSection";
import { PublicFooter } from "@/components/public/PublicFooter";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategorySlug, setActiveCategorySlug] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/public/categories`, {
          headers: {
            "Accept": "application/json",
          },
        });
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };

    fetchCategories();
  }, [apiUrl]);

  const handleSearchSubmit = () => {
    setActiveSearch(searchQuery);
  };

  return (
    <div className="min-h-screen bg-[#141127] text-white flex flex-col font-sans">
      <PublicNavbar />
      
      <HeroSection 
        categories={categories}
        activeCategorySlug={activeCategorySlug}
        onSelectCategory={setActiveCategorySlug}
        searchQuery={searchQuery}
        onChangeSearchQuery={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
      />
      
      <main className="flex-grow flex flex-col items-center">
        <PortfolioFeed 
          searchQuery={activeSearch} 
          activeCategorySlug={activeCategorySlug} 
        />
        <InfoSection />
        <PublicFooter />
      </main>
    </div>
  );
}
