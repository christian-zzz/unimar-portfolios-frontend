"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import RegisterStudent from "@/components/dashboard/RegisterStudent";
import { 
  Loader2, 
  AlertCircle, 
  MoreVertical, 
  Inbox, 
  ChevronUp, 
  UserPlus 
} from "lucide-react";

interface Student {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export default function StudentsManagementPage() {
  const { user } = useAuth();
  const router = useRouter();

  // State Management
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoadingTable, setIsLoadingTable] = useState(true);
  const [tableError, setTableError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Security gate
  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [user, router]);

  // Fetch registered students
  const fetchStudents = useCallback(async () => {
    setIsLoadingTable(true);
    setTableError(null);

    const token = localStorage.getItem("token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const response = await fetch(`${apiUrl}/api/students`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setStudents(data);
      } else {
        setTableError(data.message || "Error al cargar la lista de estudiantes.");
      }
    } catch (error) {
      console.error("Failed to fetch students list:", error);
      setTableError("Error de conexión. No se pudo conectar al servidor.");
    } finally {
      setIsLoadingTable(false);
    }
  }, []);

  // Fetch on mount (admin only)
  useEffect(() => {
    if (user && user.role === "admin") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchStudents();
    }
  }, [user, fetchStudents]);

  if (!user || user.role !== "admin") {
    return null; // Prevents layout flashing during redirects
  }

  // Format date safely into Spanish standard
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans pb-12">
      
      {/* Page Title & Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 sm:text-3xl">
            Gestión de Estudiantes
          </h2>
          <p className="text-sm text-muted mt-1.5 leading-relaxed">
            Supervisa, registra y organiza las cuentas de estudiantes autorizados para crear portafolios en el decanato.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-brand hover:bg-brand-hover rounded-lg shadow-xs transition duration-150 cursor-pointer self-start sm:self-auto"
        >
          {isFormOpen ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Ocultar Formulario
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              Registrar Nuevo Estudiante
            </>
          )}
        </button>
      </div>

      {/* Collapsible Form Section */}
      {isFormOpen && (
        <div className="border border-border rounded-2xl bg-surface p-6 sm:p-8 shadow-xs animate-slide-down">
          {/* We hide the internal form's title & subtitles inside RegisterStudent to avoid nesting titles */}
          <div className="max-w-2xl">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">
              Ingresar datos de la nueva cuenta
            </h3>
            {/* The onSuccess callback triggers fetchStudents to update table dynamically */}
            <RegisterStudent onSuccess={fetchStudents} showTitle={false} />
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
          Estudiantes Registrados
        </h3>

        {/* Minimalist Data Table Wrapper */}
        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xs transition-colors duration-200">
          {isLoadingTable ? (
            // Loading skeleton or spinner
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <Loader2 className="h-7 w-7 animate-spin text-brand" />
              <p className="text-xs text-muted font-medium">Obteniendo lista de estudiantes...</p>
            </div>
          ) : tableError ? (
            // Error Alert
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center px-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  No se pudo cargar la información
                </p>
                <p className="text-xs text-muted max-w-xs">{tableError}</p>
              </div>
              <button
                type="button"
                onClick={fetchStudents}
                className="mt-2 text-xs font-semibold text-brand hover:underline cursor-pointer"
              >
                Reintentar conexión
              </button>
            </div>
          ) : students.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center px-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-border text-muted">
                <Inbox className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  No hay estudiantes registrados aún
                </p>
                <p className="text-xs text-muted max-w-xs">
                  Usa el botón superior para registrar al primer estudiante y habilitar su lienzo.
                </p>
              </div>
            </div>
          ) : (
            // Table content
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-border text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="px-6 py-4">Nombre</th>
                    <th className="px-6 py-4">Correo Institucional</th>
                    <th className="px-6 py-4">Fecha de Registro</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {students.map((student) => (
                    <tr 
                      key={student.id} 
                      className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors duration-150"
                    >
                      {/* Name / User Info */}
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="h-7 w-7 rounded-full bg-brand-light text-brand dark:bg-brand-light/10 flex items-center justify-center text-xs font-bold uppercase">
                            {student.name.charAt(0)}
                          </div>
                          <span>{student.name}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-mono text-xs">
                        {student.email}
                      </td>

                      {/* Registered Date */}
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">
                        {formatDate(student.created_at)}
                      </td>

                      {/* Actions Placeholder */}
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          className="p-1.5 text-muted hover:text-foreground hover:bg-surface-alt rounded-lg transition-colors inline-flex cursor-pointer"
                          aria-label="Más acciones"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
