import Swal from "sweetalert2";

const baseSwal = Swal.mixin({
  background: "#1C1835",
  color: "#E5DEFE",
  confirmButtonColor: "#273E92",
  cancelButtonColor: "#ED6C31",
  confirmButtonText: "Aceptar",
  cancelButtonText: "Cancelar",
  reverseButtons: true,
  customClass: {
    popup: "font-sans rounded-3xl border border-[#2A2640] shadow-2xl",
    title: "text-base font-bold text-white",
    htmlContainer: "text-xs text-[#E5DEFE]/80 font-medium",
    confirmButton: "!text-xs !font-semibold !rounded-xl !px-4 !py-2.5",
    cancelButton: "!text-xs !font-semibold !rounded-xl !px-4 !py-2.5",
  },
});

export function showSuccess(message: string) {
  return baseSwal.fire({
    icon: "success",
    iconColor: "#C5E4E4",
    title: "Éxito",
    text: message,
    timer: 3000,
    timerProgressBar: true,
    showConfirmButton: false,
  });
}

export function showError(message: string) {
  return baseSwal.fire({
    icon: "error",
    iconColor: "#ED6C31",
    title: "Error",
    text: message,
    confirmButtonText: "Cerrar",
  });
}

export function showWarning(message: string) {
  return baseSwal.fire({
    icon: "warning",
    iconColor: "#ED6C31",
    title: "Aviso",
    text: message,
    confirmButtonText: "Entendido",
  });
}

export function confirmAction(
  message: string,
  confirmText = "Sí, estoy seguro",
): Promise<boolean> {
  return baseSwal
    .fire({
      icon: "warning",
      iconColor: "#ED6C31",
      title: "¿Estás seguro?",
      text: message,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: "Cancelar",
      focusCancel: true,
    })
    .then((result) => result.isConfirmed);
}

export function confirmDelete(message: string): Promise<boolean> {
  return confirmAction(message + " Esta acción no se puede deshacer.");
}
