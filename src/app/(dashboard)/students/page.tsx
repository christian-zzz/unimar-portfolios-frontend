"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import RegisterStudent from "@/components/dashboard/RegisterStudent";
import { 
  Loader2, 
  AlertCircle, 
  MoreVertical, 
  Inbox, 
  ChevronUp,
  EyeOff,
  Key,
  Trash2,
  Image as ImageIcon,
  Video as VideoIcon,
  Sparkles,
  FileText,
  X,
  ExternalLink
} from "lucide-react";

interface Student {
  id: string;
  name: string;
  email: string;
  created_at: string;
  portfolio: {
    id: string;
    slug: string;
    is_published: boolean;
  } | null;
  media_count: number;
  media_size: string | number | null;
}

interface MediaItem {
  id: string;
  file_name: string;
  url: string;
  mime_type: string;
}

export default function StudentsManagementPage() {
  const { user } = useAuth();
  const router = useRouter();

  // State Management
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoadingTable, setIsLoadingTable] = useState(true);
  const [tableError, setTableError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // Inspector States
  const [inspectorStudent, setInspectorStudent] = useState<Student | null>(null);
  const [inspectorMedia, setInspectorMedia] = useState<MediaItem[]>([]);
  const [isLoadingInspector, setIsLoadingInspector] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Security gate
  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [user, router]);

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdownId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  // Fetch media items for selected student inside inspector modal
  const fetchStudentMedia = async (student: Student) => {
    setInspectorStudent(student);
    setIsLoadingInspector(true);
    setInspectorMedia([]);
    
    const token = localStorage.getItem("token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const response = await fetch(`${apiUrl}/api/admin/students/${student.id}/media`, {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setInspectorMedia(data.media || []);
      }
    } catch (err) {
      console.error("Failed to fetch student media library:", err);
    } finally {
      setIsLoadingInspector(false);
    }
  };

  // Force unpublish portfolio
  const handleForceUnpublish = async (student: Student) => {
    if (!confirm(`¿Estás seguro de que deseas forzar la despublicación del portafolio de ${student.name}? Dejará de ser público de inmediato.`)) {
      return;
    }

    const token = localStorage.getItem("token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const response = await fetch(`${apiUrl}/api/admin/students/${student.id}/unpublish`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert("Portafolio despublicado exitosamente.");
        if (student.portfolio?.slug) {
          await fetch("/api/revalidate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paths: [`/p/${student.portfolio.slug}`] }),
          }).catch(err => console.error("Failed to revalidate:", err));
        }
        fetchStudents();
      } else {
        alert("Error al intentar despublicar el portafolio.");
      }
    } catch (err) {
      console.error(err);
    }
    setActiveDropdownId(null);
  };

  // Reset student password
  const handleResetPassword = async (student: Student) => {
    if (!confirm(`¿Estás seguro de que deseas restablecer la contraseña de ${student.name}? Se enviará una nueva contraseña provisional a su correo.`)) {
      return;
    }

    const token = localStorage.getItem("token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const response = await fetch(`${apiUrl}/api/admin/students/${student.id}/reset-password`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Contraseña restablecida correctamente.\nNueva clave provisional: ${data.generated_password}`);
      } else {
        alert("Error al intentar restablecer la contraseña.");
      }
    } catch (err) {
      console.error(err);
    }
    setActiveDropdownId(null);
  };

  // Deep delete student and clear Cloudinary / R2 files
  const handleDeleteStudent = async (student: Student) => {
    if (!confirm(`⚠️ ALERTA DE SEGURIDAD ⚠️\n¿Estás seguro de que deseas eliminar permanentemente a ${student.name}?\nEsta acción es irreversible y borrará automáticamente todos sus archivos de Cloudinary y Cloudflare R2 para liberar espacio.`)) {
      return;
    }

    const token = localStorage.getItem("token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const response = await fetch(`${apiUrl}/api/admin/students/${student.id}`, {
        method: "DELETE",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert("Estudiante y todos sus archivos asociados eliminados correctamente.");
        if (student.portfolio?.slug) {
          await fetch("/api/revalidate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paths: [`/p/${student.portfolio.slug}`] }),
          }).catch(err => console.error("Failed to revalidate:", err));
        }
        fetchStudents();
      } else {
        alert("Error al intentar eliminar al estudiante.");
      }
    } catch (err) {
      console.error(err);
    }
    setActiveDropdownId(null);
  };

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

  const formatBytes = (bytes: number | string | null, decimals = 2) => {
    if (bytes === null || bytes === undefined) return "0 Bytes";
    const byteNum = typeof bytes === "string" ? parseInt(bytes, 10) : bytes;
    if (isNaN(byteNum) || byteNum === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(byteNum) / Math.log(k));
    return parseFloat((byteNum / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans pb-12">
      
      {/* Page Title & Toggle */}
      <div className="flex flex-row items-center justify-between gap-4 border-b border-[#2A2640] pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Gestión de Estudiantes
          </h2>
          <p className="text-sm text-muted mt-2 leading-relaxed">
            Supervisa, registra y organiza las cuentas de estudiantes autorizados para crear portafolios en el decanato.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-[#141127] bg-[#ED6C31] hover:bg-[#ED6C31]/90 rounded-full transition duration-150 cursor-pointer shadow-md"
        >
          {isFormOpen ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" />
              Ocultar Formulario
            </>
          ) : (
            <>
              <span className="text-[14px] font-bold leading-none -mt-0.5">+</span>
              <span>Registrar Nuevo Estudiante</span>
            </>
          )}
        </button>
      </div>

      {/* Collapsible Form Section */}
      {isFormOpen && (
        <div className="border border-[#2A2640] rounded-2xl bg-[#1C1835] p-6 sm:p-8 shadow-xs animate-slide-down">
          <div className="max-w-2xl">
            <h3 className="text-sm font-semibold text-slate-100 mb-4 uppercase tracking-wider">
              Ingresar datos de la nueva cuenta
            </h3>
            <RegisterStudent onSuccess={fetchStudents} showTitle={false} />
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">
            Directorio de Estudiantes
          </h3>
        </div>

        {/* Minimalist Data Table Wrapper */}
        <div className="bg-[#1b1731] border border-[#2A2640] rounded-2xl overflow-visible shadow-xs transition-colors duration-200">
          {isLoadingTable ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <Loader2 className="h-7 w-7 animate-spin text-[#ED6C31]" />
              <p className="text-xs text-muted font-medium">Obteniendo lista de estudiantes...</p>
            </div>
          ) : tableError ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center px-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">
                  No se pudo cargar la información
                </p>
                <p className="text-xs text-muted max-w-xs">{tableError}</p>
              </div>
              <button
                type="button"
                onClick={fetchStudents}
                className="mt-2 text-xs font-semibold text-[#FFB598] hover:underline cursor-pointer"
              >
                Reintentar conexión
              </button>
            </div>
          ) : students.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center px-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800 border border-[#2A2640] text-muted">
                <Inbox className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">
                  No hay estudiantes registrados aún
                </p>
                <p className="text-xs text-muted max-w-xs">
                  Usa el botón superior para registrar al primer estudiante y habilitar su lienzo.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-visible relative" ref={dropdownRef}>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1b1731] border-b border-[#2A2640] text-xs text-muted">
                    <th className="px-6 py-4 font-normal">Estudiante</th>
                    <th className="px-6 py-4 font-normal">Estado Portafolio</th>
                    <th className="px-6 py-4 font-normal">Almacenamiento & Biblioteca</th>
                    <th className="px-6 py-4 font-normal">Fecha de registro</th>
                    <th className="px-6 py-4 font-normal text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2640] text-sm">
                  {students.map((student) => {
                    const isPublished = student.portfolio?.is_published;
                    const hasStarted = student.portfolio !== null;

                    return (
                      <tr 
                        key={student.id} 
                        className="hover:bg-white/5 transition-colors duration-150"
                      >
                        {/* Name / User Info */}
                        <td className="px-6 py-4 font-medium text-white">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-[#273E92] flex items-center justify-center text-xs font-bold uppercase text-white">
                              {student.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{student.name}</p>
                              <p className="text-xs text-[#8E8D9B] font-mono">{student.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Portfolio Status Badge */}
                        <td className="px-6 py-4 text-xs">
                          {isPublished ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/30 text-emerald-400 border border-emerald-900/50">
                              🟢 Publicado
                            </span>
                          ) : hasStarted ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950/30 text-amber-400 border border-amber-900/50">
                              🟡 Borrador
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-950/30 text-red-400 border border-red-900/50">
                              🔴 Sin iniciar
                            </span>
                          )}
                        </td>

                        {/* Storage Usage Info */}
                        <td className="px-6 py-4 text-xs font-medium text-white">
                          <div>
                            <span className="text-[#E5DEFE]">{formatBytes(student.media_size)}</span>
                            <span className="text-[#8E8D9B] font-normal"> | {student.media_count} archivos</span>
                          </div>
                        </td>

                        {/* Registered Date */}
                        <td className="px-6 py-4 text-[#8E8D9B] text-xs">
                          {formatDate(student.created_at)}
                        </td>

                        {/* Actions Dropdown Trigger */}
                        <td className="px-6 py-4 text-right relative">
                          <button
                            type="button"
                            onClick={() => setActiveDropdownId(activeDropdownId === student.id ? null : student.id)}
                            className="p-1.5 text-muted hover:text-white rounded-lg transition-colors inline-flex cursor-pointer"
                            aria-label="Más acciones"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {/* Float Dropdown Menu */}
                          {activeDropdownId === student.id && (
                            <div className="absolute right-6 mt-1 z-30 w-52 bg-[#1C1835] border border-[#2A2640] rounded-xl shadow-2xl overflow-hidden py-1.5 text-left text-xs animate-in fade-in zoom-in-95 duration-100">
                              
                              {/* Open live site link */}
                              {isPublished && student.portfolio && (
                                <a
                                  href={`/p/${student.portfolio.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => setActiveDropdownId(null)}
                                  className="flex items-center gap-2 px-4 py-2 hover:bg-[#141127] text-white transition-colors cursor-pointer"
                                >
                                  <ExternalLink className="h-3.5 w-3.5 text-emerald-400" />
                                  <span>Ver Sitio Público</span>
                                </a>
                              )}

                              {/* Force unpublish */}
                              {isPublished && (
                                <button
                                  type="button"
                                  onClick={() => handleForceUnpublish(student)}
                                  className="flex w-full items-center gap-2 px-4 py-2 hover:bg-[#141127] text-white transition-colors cursor-pointer"
                                >
                                  <EyeOff className="h-3.5 w-3.5 text-amber-400" />
                                  <span>Forzar Despublicación</span>
                                </button>
                              )}

                              {/* Inspect student media files */}
                              <button
                                type="button"
                                onClick={() => {
                                  fetchStudentMedia(student);
                                  setActiveDropdownId(null);
                                }}
                                className="flex w-full items-center gap-2 px-4 py-2 hover:bg-[#141127] text-white transition-colors cursor-pointer"
                              >
                                <ImageIcon className="h-3.5 w-3.5 text-[#C5E4E4]" />
                                <span>Inspeccionar Medios</span>
                              </button>

                              {/* Reset account password */}
                              <button
                                type="button"
                                onClick={() => handleResetPassword(student)}
                                className="flex w-full items-center gap-2 px-4 py-2 hover:bg-[#141127] text-white transition-colors cursor-pointer"
                              >
                                <Key className="h-3.5 w-3.5 text-[#FFB598]" />
                                <span>Restablecer Acceso</span>
                              </button>

                              <div className="border-t border-[#2A2640] my-1" />

                              {/* Deep delete */}
                              <button
                                type="button"
                                onClick={() => handleDeleteStudent(student)}
                                className="flex w-full items-center gap-2 px-4 py-2 hover:bg-red-950/20 text-red-400 hover:text-red-300 transition-colors cursor-pointer font-bold"
                              >
                                <Trash2 className="h-3.5 w-3.5 text-red-500" />
                                <span>Eliminar Estudiante</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MEDIA INSPECTOR MODAL */}
      {inspectorStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
          <div className="bg-[#1C1835] border border-[#2A2640] rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-[#2A2640] bg-[#141127]">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Inspección de Medios: {inspectorStudent.name}
                </h3>
                <p className="text-[10px] text-[#8E8D9B] font-mono mt-0.5">
                  Archivos totales: {inspectorStudent.media_count} | {formatBytes(inspectorStudent.media_size)}
                </p>
              </div>
              <button
                onClick={() => setInspectorStudent(null)}
                className="p-1 text-[#8E8D9B] hover:text-white hover:bg-[#141127] rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body / Media Grid */}
            <div className="p-6 overflow-y-auto flex-grow bg-[#141127]/20">
              {isLoadingInspector ? (
                <div className="flex flex-col items-center justify-center py-20 gap-2">
                  <Loader2 className="h-7 w-7 animate-spin text-[#ED6C31]" />
                  <span className="text-xs text-muted">Cargando biblioteca del estudiante...</span>
                </div>
              ) : inspectorMedia.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center">
                  <ImageIcon className="h-10 w-10 text-slate-700 mb-2 stroke-1" />
                  <span className="text-xs text-slate-500 font-semibold">El estudiante no ha subido ningún archivo</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {inspectorMedia.map((media) => {
                    const isImage = media.mime_type && media.mime_type.startsWith("image/");
                    const isVideo = media.mime_type && media.mime_type.startsWith("video/");
                    const isAnimation = media.mime_type === "application/json" || media.file_name.endsWith(".json");

                    return (
                      <div
                        key={media.id}
                        className="aspect-square bg-[#141127] border border-[#2A2640] rounded-xl relative overflow-hidden group hover:border-[#273E92] transition duration-150"
                      >
                        {isImage ? (
                          <Image
                            src={media.url}
                            alt={media.file_name}
                            fill
                            sizes="(max-width: 640px) 50vw, 15vw"
                            className="object-cover rounded-xl"
                          />
                        ) : isVideo ? (
                          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center text-slate-400 select-none bg-[#141127] h-full rounded-xl">
                            <VideoIcon className="h-6 w-6 stroke-1 mb-1 text-[#ED6C31]" />
                            <span className="text-[8px] font-bold truncate max-w-full px-1 text-slate-300">{media.file_name}</span>
                          </div>
                        ) : isAnimation ? (
                          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center text-slate-400 select-none bg-[#141127] h-full rounded-xl">
                            <Sparkles className="h-6 w-6 stroke-1 mb-1 text-[#ED6C31]" />
                            <span className="text-[8px] font-bold truncate max-w-full px-1 text-slate-300">{media.file_name}</span>
                          </div>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center text-slate-400 select-none bg-[#141127] h-full rounded-xl">
                            <FileText className="h-6 w-6 stroke-1 mb-1" />
                            <span className="text-[8px] font-bold truncate max-w-full px-1 text-slate-300">{media.file_name}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-[#141127] px-6 py-4 flex justify-end border-t border-[#2A2640]">
              <button
                onClick={() => setInspectorStudent(null)}
                className="px-4 py-2 rounded-lg bg-[#273E92] hover:bg-[#1d3070] text-xs font-semibold text-white transition-all cursor-pointer"
              >
                Cerrar Inspector
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
