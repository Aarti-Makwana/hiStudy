/**
 * Configuration object for the application.
 * @typedef {Object} AppConfig
 * @property {string} NODE_ENV - The environment mode of the application.
 * @property {string} NAME_KEY - The key name of the application.
 * @property {string} NAME_TITLE - The title of the application.
 * @property {string} API_BASE_URL - The base URL for API requests.
 * @property {string} RESUME_DOWNLOAD_URL - The URL for downloading resumes.
 * @property {string} DEFAULT_LANGUAGE - The default language of the application.
 * @property {string} IMAGE_URL - The URL for images used in the application.
 * @property {string} UPLOAD_BASE_URL - The base URL for uploaded images.
 */

/**
 * Configuration object for the application.
 * Contains various environment-specific settings such as API URLs, language,
 * and image paths. These settings can be accessed throughout the application.
 * @type {AppConfig}
 */

const _env = typeof process !== "undefined" && process.env ? process.env : {};

const config = {
  NODE_ENV: _env.VITE_MODE ?? _env.NODE_ENV,
  NAME_KEY: _env.VITE_NAME_KEY ?? _env.NEXT_PUBLIC_NAME_KEY ?? "App",
  NAME_TITLE: _env.VITE_NAME_TITLE ?? _env.NEXT_PUBLIC_NAME_TITLE ?? "app",
  API_BASE_URL: _env.NEXT_PUBLIC_API_BASE_URL ?? _env.API_BASE_URL ?? "",
  DEFAULT_LANGUAGE: _env.VITE_DEFAULT_LANGUAGE ?? _env.NEXT_PUBLIC_DEFAULT_LANGUAGE ?? "en",
  IMAGE_URL: _env.VITE_IMAGE_PATH ?? _env.NEXT_PUBLIC_IMAGE_PATH ?? "",
  UPLOAD_BASE_URL: _env.VITE_UPLOAD_BASE_URL ?? _env.NEXT_PUBLIC_UPLOAD_BASE_URL ?? "",
};

export default config;

// export const BASE_NAME = '/nexus-rc-html/www'; // For Build
export const BASE_NAME = "";
export const COMMON_IMAGE_URL = `${BASE_NAME}/images`;
export const ADMIN_IMAGE_URL = `${BASE_NAME}/admin-images`;
export const FRONTEND_IMAGE_URL = `${BASE_NAME}/frontend-images`;
export const ORGANIZATION_IMAGE_URL = `${BASE_NAME}/organization-images`;
export const UPLOAD_IMAGE_URL = config.UPLOAD_BASE_URL;
