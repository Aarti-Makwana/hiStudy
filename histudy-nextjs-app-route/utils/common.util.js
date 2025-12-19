/* eslint-disable import/no-extraneous-dependencies */
import CryptoJS from "crypto-js";
import config from "../config";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);

export const defaultCountryCode = "+44";

/**
 * Constructs an item object with the provided parameters.
 * @param {string} path - The path of the item.
 * @param {string} label - The label of the item.
 * @param {string} key - The key of the item.
 * @param {string} icon - The icon of the item.
 * @param {Array} children - The children of the item.
 * @param {boolean} withAuth - Indicates if authentication is required.
 * @returns {object} - The constructed item object.
 */
const getItem = (path, label, key, icon, children, withAuth) => {
  if (children) {
    return { label, key, icon, children, path, withAuth };
  }
  return { label, key, icon, path, withAuth };
};
/**
 * Removes the token from the session storage.
 */
export const removeSessionStorageToken = () => {
  sessionStorage.removeItem(`${config.NAME_KEY}:token`);
};

/**
 * Sets the token in the session storage after encrypting it.
 * @param {string} token - The token to be stored in session storage.
 */
export const setSessionStorageToken = (token) => {
  sessionStorage.setItem(
    `${config.NAME_KEY}:token`,
    CryptoJS.AES.encrypt(token, `${config.NAME_KEY}-token`).toString()
  );
};

/**
 * Removes the token from the local storage and navigates to a specific path if provided.
 * @param {Function} navigate - The navigate function from React Router.
 */
export const removeLocalStorageToken = (navigate) => {
  try {
    const key = `${config.NAME_KEY}:token`;
    if (localStorage.getItem(key) !== null) {
      localStorage.removeItem(key);
    }
    // Also clear any session token to be safe
    removeSessionStorageToken();
  } catch (err) {
    // noop
  }
  if (navigate) {
    navigate("/login");
  }
};

/**
 * Retrieves the token from the session storage and decrypts it.
 * @returns {string|boolean} - The decrypted token or false if not found.
 */
export const getSessionStorageToken = () => {
  const ciphertext = sessionStorage.getItem(`${config.NAME_KEY}:token`);
  if (ciphertext) {
    const bytes = CryptoJS.AES.decrypt(ciphertext, `${config.NAME_KEY}-token`);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
  return false;
};

/**
 * Sets the token in the local storage after encrypting it.
 * @param {string} token - Token to be stored in local storage.
 */
export const setLocalStorageToken = (token) => {
  localStorage.setItem(
    `${config.NAME_KEY}:token`,
    CryptoJS.AES.encrypt(token, `${config.NAME_KEY}-token`).toString()
  );
};

/**
 * Retrieves and decrypts the token from local storage.
 * @returns {string|boolean} - Decrypted token or false if not found.
 */
export const getLocalStorageToken = () => {
  const token = localStorage.getItem(`${config.NAME_KEY}:token`);
  if (!token || token === "null") return false;
  const bytes = CryptoJS.AES.decrypt(token, `${config.NAME_KEY}-token`);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  return decrypted ? decrypted : false;
};

/**
 * Retrieves the language preference from local storage.
 * @returns {string} - Language preference or default language if not found.
 */
export const getLocalStorageLanguage = () => {
  const language = localStorage.getItem(`${config.NAME_KEY}:language`);
  if (language) {
    return ["en", "hi"].includes(language) ? language : config.DEFAULT_LANGUAGE;
  }
  return config.DEFAULT_LANGUAGE;
};

/**
 * Converts a UTC date to a specific timezone.
 *
 * @param {string|Date} utcDate - The input UTC date (ISO string or Date object).
 * @param {string} targetTimezone - The target timezone (e.g., "Asia/Kolkata", "America/New_York").
 * @returns {string} - Formatted date in the target timezone (e.g., "2025-06-24 18:30:00").
 */
export function convertUTCToTimezone(utcDate, targetTimezone) {
  if (!utcDate) return "";
  return dayjs.utc(utcDate).tz(targetTimezone).format("YYYY-MM-DD HH:mm:ss");
}

/**
 * Extracts the best error message from an API error object.
 * @param {object} error - The error object (from axios/fetch or generic).
 * @param {string} [fallbackMessage] - The fallback message if no error message is found.
 * @returns {string} - The best error message to display.
 */
export function getApiErrorMessage(error, fallbackMessage = "An error occurred") {
  return (
    (error && error.response && error.response.data && error.response.data.message) ||
    error?.message ||
    fallbackMessage
  );
}

// Debounce hook for React
import { useState, useEffect } from "react";

/**
 * React hook to debounce a value.
 * @param {any} value - The value to debounce.
 * @param {number} delay - Delay in ms.
 * @returns {any} - Debounced value.
 */
export function useDebouncedValue(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}


export function formatDateToMMDDYYYY(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return "";
  const [year, month, day] = dateStr.split("-");
  if (year && month && day) {
    return `${month}/${day}/${year}`;
  }
  return "";
}