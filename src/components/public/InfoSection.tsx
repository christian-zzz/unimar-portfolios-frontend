"use client";

import React from "react";
import { GraduationCap, LayoutTemplate, Globe, Plus } from "lucide-react";

export const InfoSection = () => {
  return (
    <section className="w-full bg-[#141127] py-24 px-6 select-none">
      <div className="max-w-6xl mx-auto w-full flex flex-col items-center">
        
        {/* Title Header */}
        <h2 className="font-tactic text-[#E5DEFE] text-2xl sm:text-4xl font-medium tracking-tight text-center leading-tight max-w-4xl mx-auto mb-16 select-text">
          Convierte tus sueños en éxito. <br />
          Consigue el trabajo que deseas.
        </h2>

        {/* 3-Pane Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          
          {/* Card 1: University */}
          <div className="bg-[#353552] border border-[#2A2640] rounded-3xl p-6 flex flex-col justify-between overflow-hidden relative shadow-lg">
            <div className="flex-grow">
              {/* Icon */}
              <div className="h-10 w-10 bg-[#141127] border border-[#2A2640] rounded-full flex items-center justify-center text-[#ED6C31] mb-6">
                <GraduationCap className="h-5 w-5" />
              </div>
              
              {/* Heading */}
              <h3 className="font-tactic text-white text-lg md:text-xl font-medium leading-relaxed tracking-wide mb-3">
                Plataforma Universitaria
              </h3>
              
              {/* Description */}
              <p className="text-[#E5DEFE]/70 text-sm sm:text-base font-normal leading-relaxed font-sans select-text">
                Acceso para estudiantes de diseño gráfico de UNIMAR. Inicia sesión para destacar tus mejores proyectos.
              </p>
            </div>

            {/* Abstract ID Badge Graphic */}
            <div className="h-32 bg-[#141127] rounded-2xl border border-[#2A2640] p-4 flex flex-col justify-between relative overflow-hidden mt-8">
              <div className="flex gap-3">
                <div className="h-12 w-12 rounded-lg bg-[#2A2640] flex-shrink-0" />
                <div className="flex-grow flex flex-col justify-center gap-2">
                  <div className="h-2.5 w-2/3 bg-[#2A2640] rounded-full" />
                  <div className="h-2 w-1/2 bg-[#2A2640] rounded-full" />
                </div>
              </div>
              <div className="h-8 w-full bg-[#ED6C31] rounded-lg mt-1" />
            </div>
          </div>

          {/* Card 2: Editor */}
          <div className="bg-[#353552] border border-[#2A2640] rounded-3xl p-6 flex flex-col justify-between overflow-hidden relative shadow-lg">
            <div className="flex-grow">
              {/* Icon */}
              <div className="h-10 w-10 bg-[#141127] border border-[#2A2640] rounded-full flex items-center justify-center text-[#ED6C31] mb-6">
                <LayoutTemplate className="h-5 w-5" />
              </div>
              
              {/* Heading */}
              <h3 className="font-tactic text-white text-lg md:text-xl font-medium leading-relaxed tracking-wide mb-3">
                Crea tu portafolio
              </h3>
              
              {/* Description */}
              <p className="text-[#E5DEFE]/70 text-sm sm:text-base font-normal leading-relaxed font-sans select-text">
                Construye un portafolio profesional y a tu medida utilizando flexibles herramientas de composición visual.
              </p>
            </div>

            {/* Abstract Editor Graphic */}
            <div className="h-32 bg-[#141127] rounded-2xl border border-[#2A2640] p-3 relative overflow-hidden mt-8 flex flex-col gap-2">
              <div className="flex gap-2">
                <div className="w-2/3 h-14 bg-[#2A2640] rounded-lg" />
                <div className="w-1/3 h-14 bg-[#2A2640] rounded-lg" />
              </div>
              <div className="w-full h-8 bg-[#2A2640] rounded-lg" />
              
              {/* Floating Orange + button */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 translate-y-1/2 h-8 w-8 rounded-full bg-[#ED6C31] flex items-center justify-center text-[#141127] font-black border border-[#141127]">
                <Plus className="h-4 w-4 stroke-[3]" />
              </div>
            </div>
          </div>

          {/* Card 3: Publish */}
          <div className="bg-[#353552] border border-[#2A2640] rounded-3xl p-6 flex flex-col justify-between overflow-hidden relative shadow-lg">
            <div className="flex-grow">
              {/* Icon */}
              <div className="h-10 w-10 bg-[#141127] border border-[#2A2640] rounded-full flex items-center justify-center text-[#ED6C31] mb-6">
                <Globe className="h-5 w-5" />
              </div>
              
              {/* Heading */}
              <h3 className="font-tactic text-white text-lg md:text-xl font-medium leading-relaxed tracking-wide mb-3">
                Publica al instante
              </h3>
              
              {/* Description */}
              <p className="text-[#E5DEFE]/70 text-sm sm:text-base font-normal leading-relaxed font-sans select-text">
                Pon tu portafolio en vivo con un solo clic. Obtén tu enlace personalizado y muéstrale tu talento al mundo.
              </p>
            </div>

            {/* Abstract Status List Graphic */}
            <div className="h-32 bg-[#141127] rounded-2xl border border-[#2A2640] p-3 flex flex-col gap-2 relative overflow-hidden mt-8">
              {/* Row 1 (Active) */}
              <div className="flex justify-between items-center bg-[#2A2640] p-2.5 rounded-lg border border-[#2A2640]">
                <div className="w-1/2 h-2 bg-[#141127] rounded-full" />
                <div className="h-3.5 w-3.5 bg-[#ED6C31] rounded-full shadow-[0_0_8px_#ED6C31]" />
              </div>
              
              {/* Row 2 (Muted) */}
              <div className="flex justify-between items-center bg-[#2A2640] p-2.5 rounded-lg border border-[#2A2640] opacity-40">
                <div className="w-1/3 h-2 bg-[#141127] rounded-full" />
                <div className="h-3.5 w-3.5 bg-[#141127] rounded-full" />
              </div>

              {/* Row 3 (Muted) */}
              <div className="flex justify-between items-center bg-[#2A2640] p-2.5 rounded-lg border border-[#2A2640] opacity-40">
                <div className="w-2/3 h-2 bg-[#141127] rounded-full" />
                <div className="h-3.5 w-3.5 bg-[#141127] rounded-full" />
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
