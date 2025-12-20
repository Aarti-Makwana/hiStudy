"use client";

import React from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const showToast = (type, message) => {
  if (!message) return;
  switch (type) {
    case "success":
      toast.success(message);
      break;
    case "error":
      toast.error(message);
      break;
    case "info":
      toast.info(message);
      break;
    case "warn":
    case "warning":
      toast.warn(message);
      break;
    default:
      toast(message);
  }
};

const Toaster = () => {
  return <ToastContainer position="top-right" autoClose={4000} />;
};

export default Toaster;
