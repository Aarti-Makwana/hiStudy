import axios from "axios";
import momentTimezone from "moment-timezone";
import config from "../config";
import { getLocalStorageToken, logger, clearAuthAndRedirect } from "../utils";
import { getToken } from "../utils/storage";
import { showError } from "../utils";

const buildToastOptions = (message) => {
  return {
    id: `api-error-${message}`,
    duration: 4000,
    position: "top-right",
  };
};

const getErrorMessage = (errorRes, error) => {
  if (!errorRes) {
    return "Network error. Please check your connection.";
  }

  const statusCode = errorRes?.data?.statusCode || errorRes?.status;
  const backendMessage = errorRes?.data?.message;

  if (statusCode === 400) {
    return backendMessage || "Invalid request. Please try again.";
  }
  if (statusCode === 401) {
    return "Session expired. Please login again.";
  }
  if (statusCode === 403) {
    return backendMessage || "You do not have permission to access this.";
  }
  if (statusCode === 404) {
    return "Requested resource not found.";
  }
  if (statusCode === 409) {
    return "This action has already been completed.";
  }
  if (statusCode === 422) {
    if (backendMessage) return backendMessage;
    if (errorRes?.data?.errors) {
      const errors = errorRes.data.errors;
      if (typeof errors === "string") return errors;
      if (Array.isArray(errors) && errors.length) return errors[0];
      if (typeof errors === "object") return Object.values(errors)[0]?.[0] || JSON.stringify(errors);
    }
    return backendMessage || "Validation failed. Please check your input.";
  }
  if (statusCode >= 500) {
    return "Something went wrong on server. Please try again later.";
  }

  return backendMessage || error?.message || "An error occurred. Please try again.";
};

const APIrequest = async ({
  method = "GET",
  url,
  baseURL,
  queryParams,
  bodyData,
  headers: extraHeaders,
}) => {
  const apiToken = getLocalStorageToken() || getToken();

  logger("Resolved config.API_BASE_URL", config.API_BASE_URL);
  logger(
    "process.env.NEXT_PUBLIC_API_BASE_URL",
    typeof process !== "undefined" ? process.env?.NEXT_PUBLIC_API_BASE_URL : undefined
  );

  try {
    const axiosConfig = {
      method: method || "GET",
      baseURL:
        baseURL || config.API_BASE_URL || (typeof process !== "undefined" ? process.env?.NEXT_PUBLIC_API_BASE_URL : undefined),
      headers: {
        "content-type": "application/json",
        "X-Frame-Options": "sameorigin",
        timezone: momentTimezone.tz.guess(true),
      },
    };

    if (url) {
      axiosConfig.url = url;
    }

    if (apiToken) {
      axiosConfig.headers = {
        ...axiosConfig.headers,
        Authorization: `Bearer ${apiToken}`,
      };
    }

    if (extraHeaders && typeof extraHeaders === "object") {
      axiosConfig.headers = {
        ...axiosConfig.headers,
        ...extraHeaders,
      };
    }

    if (bodyData) {
      if (typeof FormData !== "undefined" && bodyData instanceof FormData) {
        axiosConfig.data = bodyData;
        if (axiosConfig.headers) delete axiosConfig.headers["content-type"];
      } else {
        const bodyPayload = {};
        for (const key in bodyData) {
          if (Object.hasOwnProperty.call(bodyData, key)) {
            let element = bodyData[key];
            if (typeof element === "string") {
              element = element.trim();
            }
            if (![null, undefined, NaN].includes(element)) {
              bodyPayload[key] = element;
            }
          }
        }
        axiosConfig.data = bodyPayload;
      }
    }

    if (queryParams) {
      const queryParamsPayload = {};
      for (const key in queryParams) {
        if (Object.hasOwnProperty.call(queryParams, key)) {
          let element = queryParams[key];
          if (typeof element === "string") {
            element = element.trim();
          }
          if (!["", null, undefined, NaN].includes(element)) {
            queryParamsPayload[key] = element;
          }
        }
      }
      axiosConfig.params = queryParamsPayload;
    }

    const res = await axios(axiosConfig);
    return res.data;
  } catch (error) {
    if (axios.isCancel(error)) {
      logger("API canceled", error);
      throw new Error(error);
    }

    const errorRes = error.response;
    logger("Error in the api request", errorRes || error);

    const message = getErrorMessage(errorRes, error);
    showError(message, buildToastOptions(message));

    const statusCode = errorRes?.data?.statusCode || errorRes?.status;
    if (statusCode === 401) {
      clearAuthAndRedirect();
    }

    return {
      success: false,
      status: "error",
      statusCode,
      message,
      ...(errorRes?.data || {}),
    };
  }
};

export default APIrequest;
