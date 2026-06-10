"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  User as UserIcon, 
  Key 
} from "lucide-react";

export default function ProfilePage() {
  const { user, setUser } = useAuth();

  // Personal Info Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Security Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Pre-fill user data
  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  // Submit Profile update (Name, Email)
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingProfile(true);
    setProfileSuccess("");
    setProfileError("");

    const token = localStorage.getItem("token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const response = await fetch(`${apiUrl}/api/user/profile`, {
        method: "PUT",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email }),
      });

      const data = await response.json();

      if (response.ok) {
        setProfileSuccess("Información personal actualizada con éxito.");
        
        // Update local and context state
        localStorage.setItem("user", JSON.stringify(data));
        setUser(data);
      } else if (response.status === 422) {
        if (data.errors) {
          const firstErrorKey = Object.keys(data.errors)[0];
          setProfileError(data.errors[firstErrorKey][0]);
        } else {
          setProfileError(data.message || "Error de validación.");
        }
      } else {
        setProfileError(data.message || "Ocurrió un error inesperado.");
      }
    } catch (error) {
      console.error("Profile update failed:", error);
      setProfileError("Error de conexión. Asegúrate de que el servidor esté activo.");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Submit Password update
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingPassword(true);
    setPasswordSuccess("");
    setPasswordError("");

    if (password !== passwordConfirmation) {
      setPasswordError("Las contraseñas nuevas no coinciden.");
      setIsLoadingPassword(false);
      return;
    }

    const token = localStorage.getItem("token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const response = await fetch(`${apiUrl}/api/user/password`, {
        method: "PUT",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          password,
          password_confirmation: passwordConfirmation,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordSuccess("Contraseña actualizada con éxito.");
        // Clear fields
        setCurrentPassword("");
        setPassword("");
        setPasswordConfirmation("");
      } else if (response.status === 422) {
        if (data.errors) {
          const firstErrorKey = Object.keys(data.errors)[0];
          setPasswordError(data.errors[firstErrorKey][0]);
        } else {
          setPasswordError(data.message || "Error de validación.");
        }
      } else {
        setPasswordError(data.message || "La contraseña actual es incorrecta o no coincide.");
      }
    } catch (error) {
      console.error("Password update failed:", error);
      setPasswordError("Error de conexión. Asegúrate de que el servidor esté activo.");
    } finally {
      setIsLoadingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8 animate-fade-in font-sans pb-12">
      {/* Header section */}
      <div className="border-b border-border pb-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 sm:text-3xl">
          Mi Perfil
        </h2>
        <p className="text-sm text-muted mt-1.5 leading-relaxed">
          Administra tu información personal y fortalece la seguridad de tu cuenta.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Card 1: Personal Info */}
        <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col justify-between transition-colors duration-200">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light border border-brand/10 text-brand dark:bg-brand-light/10">
                <UserIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                  Información Personal
                </h3>
                <p className="text-xs text-muted">
                  Actualiza tu nombre y correo electrónico institucional.
                </p>
              </div>
            </div>

            {/* Success Alert */}
            {profileSuccess && (
              <div className="flex items-start gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400 rounded-xl p-4 text-xs animate-fade-in">
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                <span>{profileSuccess}</span>
              </div>
            )}

            {/* Error Alert */}
            {profileError && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400 rounded-xl p-4 text-xs animate-fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              {/* Name Input */}
              <div className="space-y-1.5">
                <label htmlFor="profileName" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Nombre completo
                </label>
                <input
                  id="profileName"
                  type="text"
                  required
                  disabled={isLoadingProfile || user.role === "student"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full text-sm text-slate-800 dark:text-slate-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 bg-surface border border-border rounded-lg px-3.5 py-2.5 focus:outline-hidden focus:border-brand focus:ring-2 focus:ring-brand/10 transition duration-150 disabled:bg-zinc-50 dark:disabled:bg-zinc-800/50 disabled:text-slate-500 dark:disabled:text-slate-400"
                />
              </div>

              {/* Email Input */}
              <div className="space-y-1.5">
                <label htmlFor="profileEmail" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Correo electrónico
                </label>
                <input
                  id="profileEmail"
                  type="email"
                  required
                  disabled={isLoadingProfile || user.role === "student"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane.doe@unimar.edu.ve"
                  className="w-full text-sm text-slate-800 dark:text-slate-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 bg-surface border border-border rounded-lg px-3.5 py-2.5 focus:outline-hidden focus:border-brand focus:ring-2 focus:ring-brand/10 transition duration-150 disabled:bg-zinc-50 dark:disabled:bg-zinc-800/50 disabled:text-slate-500 dark:disabled:text-slate-400"
                />
              </div>

              {/* Submit Button or Student Info Alert */}
              {user.role === "student" ? (
                <div className="pt-4 border-t border-border flex items-start gap-2.5 bg-zinc-50 dark:bg-zinc-900/30 border border-border p-3.5 rounded-xl text-xs text-muted leading-relaxed">
                  <AlertCircle className="h-4 w-4 shrink-0 text-brand mt-0.5" />
                  <span>Los estudiantes no pueden modificar su nombre o correo institucional. Si necesitas realizar un cambio, contacta al decanato.</span>
                </div>
              ) : (
                <div className="pt-4 border-t border-border flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoadingProfile}
                    className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-brand hover:bg-brand-hover disabled:bg-brand/50 rounded-lg shadow-xs transition duration-150 cursor-pointer"
                  >
                    {isLoadingProfile ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      "Guardar Cambios"
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Card 2: Password Security */}
        <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col justify-between transition-colors duration-200">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light border border-brand/10 text-brand dark:bg-brand-light/10">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                  Seguridad
                </h3>
                <p className="text-xs text-muted">
                  Cambia tu contraseña de acceso para mantener tu cuenta segura.
                </p>
              </div>
            </div>

            {/* Success Alert */}
            {passwordSuccess && (
              <div className="flex items-start gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400 rounded-xl p-4 text-xs animate-fade-in">
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {/* Error Alert */}
            {passwordError && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400 rounded-xl p-4 text-xs animate-fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {/* Current Password Input */}
              <div className="space-y-1.5">
                <label htmlFor="currentPassword" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Contraseña actual
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  required
                  disabled={isLoadingPassword}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-sm text-slate-800 dark:text-slate-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 bg-surface border border-border rounded-lg px-3.5 py-2.5 focus:outline-hidden focus:border-brand focus:ring-2 focus:ring-brand/10 transition duration-150 disabled:bg-zinc-50 dark:disabled:bg-zinc-800/50"
                />
              </div>

              {/* New Password Input */}
              <div className="space-y-1.5">
                <label htmlFor="newPassword" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Nueva contraseña
                </label>
                <input
                  id="newPassword"
                  type="password"
                  required
                  disabled={isLoadingPassword}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-sm text-slate-800 dark:text-slate-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 bg-surface border border-border rounded-lg px-3.5 py-2.5 focus:outline-hidden focus:border-brand focus:ring-2 focus:ring-brand/10 transition duration-150 disabled:bg-zinc-50 dark:disabled:bg-zinc-800/50"
                />
              </div>

              {/* Password Confirmation Input */}
              <div className="space-y-1.5">
                <label htmlFor="passwordConfirm" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Confirmar nueva contraseña
                </label>
                <input
                  id="passwordConfirm"
                  type="password"
                  required
                  disabled={isLoadingPassword}
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-sm text-slate-800 dark:text-slate-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 bg-surface border border-border rounded-lg px-3.5 py-2.5 focus:outline-hidden focus:border-brand focus:ring-2 focus:ring-brand/10 transition duration-150 disabled:bg-zinc-50 dark:disabled:bg-zinc-800/50"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-border flex justify-end">
                <button
                  type="submit"
                  disabled={isLoadingPassword}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-brand hover:bg-brand-hover disabled:bg-brand/50 rounded-lg shadow-xs transition duration-150 cursor-pointer"
                >
                  {isLoadingPassword ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    "Actualizar Contraseña"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
