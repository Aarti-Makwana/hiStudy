import config from "../config";

/**
 * Logger Utility Function
 * This function logs the provided argument to the console
 * if the application is not in production mode.
 *
 * @param {*} arg - The value to be logged.
 * @returns {boolean} - Always returns false.
 */
const logger = (arg) => {
  // Check if the application is not in production mode
  if (config.NODE_ENV !== "production") {
    // eslint-disable-next-line
    console.log(arg); // Log the provided argument to the console
  }
  return false; // Always return false after logging
};

export default logger;
