import Swal, { SweetAlertIcon } from "sweetalert2";

type AlertOptions = {
  title: string;
  text?: string;
  icon?: SweetAlertIcon;
};

export const showAlert = ({ title, text, icon = "info" }: AlertOptions) => {
  return Swal.fire({ title, text, icon, confirmButtonColor: "#ffd54f" });
};

export const showSuccess = (title: string, text?: string) => showAlert({ title, text, icon: "success" });

export const showError = (title: string, text?: string) => showAlert({ title, text, icon: "error" });

export const showWarning = (title: string, text?: string) => showAlert({ title, text, icon: "warning" });
