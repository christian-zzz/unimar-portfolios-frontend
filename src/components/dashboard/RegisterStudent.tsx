"use client";

import React, { useState } from "react";
import { UserPlus, Loader2, AlertCircle, CheckCircle } from "lucide-react";

export default function RegisterStudent({ onSuccess, showTitle = true }: { onSuccess?: () => void; showTitle?: boolean }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    if (password !== passwordConfirmation) {
      setErrorMessage("Las contraseñas no coinciden.");
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const response = await fetch(`${apiUrl}/api/students`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(`Estudiante ${data.user.name} (${data.user.email}) creado exitosamente.`);
        if (onSuccess) {
          onSuccess();
        }
        // Reset form fields
        setName("");
        setEmail("");
        setPassword("");
        setPasswordConfirmation("");
      } else if (response.status === 422) {
        // Validation errors
        if (data.errors) {
          const firstErrorKey = Object.keys(data.errors)[0];
          setErrorMessage(data.errors[firstErrorKey][0]);
        } else {
          setErrorMessage(data.message || "Error de validación.");
        }
      } else if (response.status === 403) {
        setErrorMessage("No tienes permisos para realizar esta acción.");
      } else {
        setErrorMessage(data.message || "Ocurrió un error inesperado.");
      }
    } catch (error) {
      console.error("Student registration failed:", error);
      setErrorMessage("Error de conexión. Asegúrate de que el servidor esté activo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header section */}
      {showTitle && (
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-800 dark:text-slate-100 sm:text-3xl">
            Registro de Estudiante
          </h2>
          <p className="text-sm text-muted mt-2 max-w-xl leading-relaxed">
            Crea una nueva cuenta de estudiante para el decanato. Los estudiantes podrán acceder a su espacio de trabajo e inicializar su portafolio de diseño.
          </p>
        </div>
      )}

      {/* Form Card */}
      <div className="max-w-2xl bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-xs">
        
        {/* Success Alert */}
        {successMessage && (
          <div className="mb-6 flex items-start gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400 rounded-xl p-4 text-xs">
            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400 rounded-xl p-4 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-y-5 gap-x-4 sm:grid-cols-2">
            
            {/* Student Name */}
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="name" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Nombre completo del estudiante
              </label>
              <input
                id="name"
                type="text"
                required
                disabled={isLoading}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Juan Pérez"
                className="w-full text-sm text-slate-800 dark:text-slate-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 bg-surface border border-border rounded-lg px-3.5 py-2.5 focus:outline-hidden focus:border-brand focus:ring-2 focus:ring-brand/10 transition duration-150 disabled:bg-zinc-50 dark:disabled:bg-zinc-800/50"
              />
            </div>

            {/* Email Address */}
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Correo institucional
              </label>
              <input
                id="email"
                type="email"
                required
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="juan.perez@unimar.edu.ve"
                className="w-full text-sm text-slate-800 dark:text-slate-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 bg-surface border border-border rounded-lg px-3.5 py-2.5 focus:outline-hidden focus:border-brand focus:ring-2 focus:ring-brand/10 transition duration-150 disabled:bg-zinc-50 dark:disabled:bg-zinc-800/50"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5 col-span-1">
              <label htmlFor="password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Contraseña provisional
              </label>
              <input
                id="password"
                type="password"
                required
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-sm text-slate-800 dark:text-slate-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 bg-surface border border-border rounded-lg px-3.5 py-2.5 focus:outline-hidden focus:border-brand focus:ring-2 focus:ring-brand/10 transition duration-150 disabled:bg-zinc-50 dark:disabled:bg-zinc-800/50"
              />
            </div>

            {/* Password Confirmation */}
            <div className="space-y-1.5 col-span-1">
              <label htmlFor="passwordConfirmation" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Confirmar contraseña
              </label>
              <input
                id="passwordConfirmation"
                type="password"
                required
                disabled={isLoading}
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="••••••••"
                className="w-full text-sm text-slate-800 dark:text-slate-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 bg-surface border border-border rounded-lg px-3.5 py-2.5 focus:outline-hidden focus:border-brand focus:ring-2 focus:ring-brand/10 transition duration-150 disabled:bg-zinc-50 dark:disabled:bg-zinc-800/50"
              />
            </div>

          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-border flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-brand hover:bg-brand-hover disabled:bg-brand/50 rounded-lg shadow-xs transition duration-150 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Registrar Estudiante
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
