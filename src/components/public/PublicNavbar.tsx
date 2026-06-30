"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/app/logo.png";

export const PublicNavbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full bg-[#131026]/70 backdrop-blur-md border-b border-[#FFB598]/20 px-6 py-4 select-none z-50">
      <div className="max-w-6xl mx-auto w-full flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2.5 focus:outline-hidden">
          <Image src={Logo} alt="Folium Logo" width={36} height={36} className="object-contain" priority />
          <span className="font-tactic text-2xl font-black text-[#ED6C31] tracking-wider leading-none">
            folium.
          </span>
        </Link>
        
        <div className="flex items-center gap-6">
          <Link 
            href="/login" 
            className="text-sm font-medium text-white/90 hover:text-[#C5E4E4] transition-colors focus:outline-hidden"
          >
            Inicia sesión
          </Link>
        </div>
      </div>
    </nav>
  );
};
