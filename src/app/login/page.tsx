"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Compass, AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  
  // State variables
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
        // Save token and user details to localStorage
        localStorage.setItem("token", data.token);
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        
        // Redirect to student workspace dashboard
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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-200">
      <div className="w-full max-w-md space-y-8">
        
        {/* Visual Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-light border border-brand/10 text-brand dark:bg-brand-light/10">
            <Compass className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-2xl font-semibold tracking-tight text-slate-800 dark:text-slate-100">
            UNIMAR Portfolios
          </h2>
          <p className="mt-1.5 text-xs text-muted max-w-xs leading-relaxed">
            Ingresa tus credenciales para acceder a tu espacio de diseño y administrar tu portafolio.
          </p>
        </div>

        {/* Minimal Login Card */}
        <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-xs">
          
          {/* Subtle error banner */}
          {errorMessage && (
            <div className="mb-6 flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400 rounded-xl p-3.5 text-xs animate-fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@unimar.edu.ve"
                className="w-full text-sm text-slate-800 dark:text-slate-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 bg-surface border border-border rounded-lg px-3.5 py-2 focus:outline-hidden focus:border-brand focus:ring-2 focus:ring-brand/10 transition duration-150 disabled:bg-zinc-50 dark:disabled:bg-zinc-800/50"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Contraseña
                </label>
                <a href="#" className="text-[10px] text-brand hover:underline font-semibold">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-sm text-slate-800 dark:text-slate-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 bg-surface border border-border rounded-lg px-3.5 py-2 focus:outline-hidden focus:border-brand focus:ring-2 focus:ring-brand/10 transition duration-150 disabled:bg-zinc-50 dark:disabled:bg-zinc-800/50"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 mt-2 px-4 py-2.5 text-xs font-semibold text-white bg-brand hover:bg-brand-hover disabled:bg-brand/50 rounded-lg shadow-xs transition duration-150 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Verificando...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </button>
          </form>
        </div>

        {/* Footer helper links */}
        <div className="text-center">
          <p className="text-[11px] text-muted">
            ¿No tienes cuenta? Contacta al administrador del decanato para solicitar una.
          </p>
        </div>

      </div>
    </div>
  );
}
