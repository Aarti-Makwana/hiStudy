import toast from "react-hot-toast";

const createToastId = (type, message) => {
  const normalizedMessage = typeof message === "string" ? message : JSON.stringify(message);
  return `toast-${type}-${normalizedMessage}`;
};

const defaultOptions = {
  position: "top-right",
  duration: 4000,
  style: {
    maxWidth: "520px",
    fontSize: "14px",
  },
};

export const showToast = (type, message, options = {}) => {
  if (!message) return;
  const toastId = createToastId(type, message);
  const toastOptions = {
    ...defaultOptions,
    id: toastId,
    ...options,
  };

  switch (type) {
    case "success":
      toast.success(message, toastOptions);
      break;
    case "error":
      toast.error(message, toastOptions);
      break;
    case "warning":
      toast(message, {
        ...toastOptions,
        style: {
          ...toastOptions.style,
          background: "#FDE68A",
          color: "#111827",
        },
      });
      break;
    case "info":
    default:
      toast(message, {
        ...toastOptions,
        style: {
          ...toastOptions.style,
          background: "#93C5FD",
          color: "#111827",
        },
      });
      break;
  }
};

export const showSuccess = (message, options = {}) => showToast("success", message, options);
export const showError = (message, options = {}) => showToast("error", message, options);
export const showWarning = (message, options = {}) => showToast("warning", message, options);
export const showInfo = (message, options = {}) => showToast("info", message, options);
