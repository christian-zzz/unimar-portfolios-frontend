"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const response = await fetch(`${apiUrl}/api/login`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        router.push("/dashboard");
      } else if (response.status === 401) {
        setErrorMessage("Credenciales inválidas.");
      } else if (data.message) {
        setErrorMessage(data.message);
      } else {
        setErrorMessage("Ocurrió un error inesperado. Intenta de nuevo.");
      }
    } catch (error) {
      console.error("Login request failed:", error);
      setErrorMessage("Error de conexión. Asegúrate de que el servidor esté activo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex bg-[#141127] text-white font-sans overflow-hidden">
      
      {/* Left panel - Orange brand canvas */}
      <div className="hidden md:flex md:w-[45%] bg-gradient-to-b from-[#ED6C31] via-[#ab4c1f] to-[#141127] items-center justify-center relative p-12 select-none">
        <div className="relative z-10 text-center animate-fade-in">
          {/* Custom logo designed to resemble the image shape */}
          <div className="flex items-center font-tactic text-7xl font-black text-[#141127] tracking-tight">
            <span>Folium</span>
            <span className="text-[#141127] font-sans font-light">.</span>
          </div>
        </div>
      </div>

      {/* Right panel - Night Blue Card Area */}
      <div className="w-full md:w-[55%] flex items-center justify-center p-6 sm:p-12 relative select-none">
        
        {/* Card Form */}
        <div className="w-full max-w-[420px] bg-[#1F1A3D] rounded-[24px] p-8 sm:p-10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] relative z-10 border border-[#2D2852]/60">
          
          <div className="mb-8 select-text">
            <h2 className="text-3xl font-bold tracking-tight text-white font-sans">
              Iniciar sesión
            </h2>
            <p className="text-xs text-[#E9A88C] mt-2 font-medium leading-relaxed">
              Ingresa tus datos para comenzar tu viaje creativo.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 flex items-start gap-2.5 bg-red-950/40 border border-red-900/60 text-red-400 rounded-xl p-3.5 text-xs animate-fade-in">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-500 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-wider text-[#E9A88C] block">
                Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-4.5 w-4.5 text-[#E9A88C] opacity-80" />
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@studio.com"
                  className="w-full text-xs text-white placeholder:text-zinc-550 bg-[#141127] border border-[#2D2852] rounded-xl pl-12 pr-4 py-3.5 focus:outline-hidden focus:border-[#ED6C31] focus:ring-1 focus:ring-[#ED6C31] transition duration-150 disabled:opacity-50 select-text"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-[10px] font-bold uppercase tracking-wider text-[#E9A88C] block">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4.5 w-4.5 text-[#E9A88C] opacity-80" />
                </span>
                <input
                  id="password"
                  type="password"
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs text-white placeholder:text-zinc-550 bg-[#141127] border border-[#2D2852] rounded-xl pl-12 pr-4 py-3.5 focus:outline-hidden focus:border-[#ED6C31] focus:ring-1 focus:ring-[#ED6C31] transition duration-150 disabled:opacity-50 select-text"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 mt-4 px-6 py-4 text-xs font-bold uppercase tracking-widest text-white bg-[#ED6C31] hover:bg-[#d85c24] disabled:bg-opacity-50 rounded-full shadow-lg transition duration-150 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  Verificando...
                </>
              ) : (
                <>
                  <span>Inicia sesión</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Text */}
          <div className="text-center mt-10 select-text">
            <span className="text-sm text-zinc-400 font-medium">
              ¿No tienes cuenta? <span className="text-[#ED6C31] font-semibold">Contacta a tu decanato</span>
            </span>
          </div>

        </div>

      </div>
    </main>
  );
}