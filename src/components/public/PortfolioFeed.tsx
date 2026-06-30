"use client";

import React, { useState, useEffect } from "react";
import { PortfolioCard } from "./PortfolioCard";
import { Loader2, Inbox } from "lucide-react";

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

interface PortfolioFeedProps {
  searchQuery: string;
  activeCategorySlug: string | null;
}

export const PortfolioFeed = ({ searchQuery, activeCategorySlug }: PortfolioFeedProps) => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    const fetchPortfolios = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams();
        if (searchQuery) {
          params.append("search", searchQuery);
        }
        if (activeCategorySlug) {
          params.append("tags", activeCategorySlug);
        }

        const url = `${apiUrl}/api/public/portfolios?${params.toString()}`;
        const response = await fetch(url, {
          headers: {
            "Accept": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Error al obtener los portafolios.");
        }

        const data = await response.json();
        // Since Laravel pagination returns the list under 'data' key:
        setPortfolios(data.data || []);
      } catch (err) {
        console.error("Fetch portfolios failed:", err);
        setError("No se pudieron cargar los portafolios. Revisa tu conexión.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolios();
  }, [searchQuery, activeCategorySlug, apiUrl]);

  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 text-[#8E8D9B]">
        <Loader2 className="h-8 w-8 animate-spin text-[#FFB598] mb-3" />
        <span className="text-sm font-medium">Buscando portafolios...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full text-center py-20 text-red-400 text-sm font-medium">
        {error}
      </div>
    );
  }

  if (portfolios.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 text-center select-none">
        <Inbox className="h-10 w-10 text-[#FFB598]/60 mb-3" />
        <p className="text-base font-medium text-white">No se encontraron portafolios</p>
        <p className="text-xs text-[#8E8D9B] mt-1 max-w-xs leading-relaxed">
          Prueba buscando con otros términos o seleccionando otra categoría.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-6 pt-2 pb-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolios.map((portfolio) => (
          <PortfolioCard key={portfolio.id} portfolio={portfolio} />
        ))}
      </div>
    </div>
  );
};
