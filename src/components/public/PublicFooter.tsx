"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/app/logo.png";

export const PublicFooter = () => {
  return (
    <footer className="w-full bg-[#0E0B21] border-t border-[#2A2640]/50 pt-16 pb-8 px-6 select-none">
      <div className="max-w-6xl mx-auto w-full">
        {/* Main Content Row */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 pb-8">
          
          {/* Left Side: Large Logo */}
          <div className="flex flex-col gap-4">
            <div className="w-48 h-48 md:w-56 md:h-56 flex items-center justify-start relative">
              <Image 
                src={Logo} 
                alt="Folium Logo" 
                width={220} 
                height={220} 
                className="object-contain" 
                priority 
              />
            </div>
          </div>

          {/* Right Side: Double Column Links */}
          <div className="flex gap-16 md:gap-24 flex-wrap">
            {/* Column 1: Folium */}
            <div className="flex flex-col gap-4">
              <h4 className="font-tactic text-sm font-bold text-[#FFB598] uppercase tracking-wider">
                Folium
              </h4>
              <ul className="flex flex-col gap-3">
                <li>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById("top")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="text-sm font-medium text-[#FFB598]/80 hover:text-white transition-colors cursor-pointer text-left w-full"
                  >
                    Inicio
                  </button>
                </li>
                <li>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById("search")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="text-sm font-medium text-[#FFB598]/80 hover:text-white transition-colors cursor-pointer text-left w-full"
                  >
                    Explorar Portafolios
                  </button>
                </li>
                <li>
                  <Link 
                    href="/login" 
                    className="text-sm font-medium text-[#FFB598]/80 hover:text-white transition-colors"
                  >
                    Iniciar Sesión
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: UNIMAR */}
            <div className="flex flex-col gap-4">
              <h4 className="font-tactic text-sm font-bold text-[#FFB598] uppercase tracking-wider">
                UNIMAR
              </h4>
              <ul className="flex flex-col gap-3">
                <li>
                  <a 
                    href="https://www.unimar.edu.ve" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm font-medium text-[#FFB598]/80 hover:text-white transition-colors"
                  >
                    Sitio Web UNIMAR
                  </a>
                </li>
                <li>
                  <a 
                    href="https://www.unimar.edu.ve/humarte-deanery" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm font-medium text-[#FFB598]/80 hover:text-white transition-colors"
                  >
                    Decanato de Humanidades, Artes y Educación
                  </a>
                </li>
                <li>
                  <a 
                    href="https://www.unimar.edu.ve/art-graphic-design" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm font-medium text-[#FFB598]/80 hover:text-white transition-colors"
                  >
                    Licenciatura en Diseño Gráfico
                  </a>
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* Bottom Bar copyright indicator */}
        <div className="pt-6 border-t border-[#2A2640]/30 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-medium text-[#E5DEFE]/40 font-sans">
          <span>
            © 2026 Folium - Universidad de Margarita. Todos los derechos reservados.
          </span>
        </div>

      </div>
    </footer>
  );
};
