import axios from "axios";
import momentTimezone from "moment-timezone";
import config from "../config";
import { getLocalStorageToken, logger } from "../utils";
import { getToken } from "../utils/storage";
import { toast } from "react-toastify";

const APIrequest = async ({
  method = "GET",
  url,
  baseURL,
  queryParams,
  bodyData,
  headers: extraHeaders,
}) => {
  // Prefer encrypted token stored by utils.common (NAME_KEY:token). Fall back to plain
  // `token` used by `utils/storage` (setToken/getToken) so existing OTP/login
  // flow works without breaking other parts of the app.
  const apiToken = getLocalStorageToken() || getToken();

  // Log resolved config values to help debug why requests target localhost
  logger("Resolved config.API_BASE_URL", config.API_BASE_URL);
  logger("process.env.NEXT_PUBLIC_API_BASE_URL", typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_API_BASE_URL : undefined);
  try {
    const axiosConfig = {
      method: method || "GET",
      // Prefer explicit call `baseURL`, then configured API_BASE_URL, then runtime NEXT_PUBLIC env.
      baseURL: baseURL || config.API_BASE_URL || (typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_API_BASE_URL : undefined),
      headers: {
        "content-type": "application/json",
        "X-Frame-Options": "sameorigin",
        "timezone": momentTimezone.tz.guess(true),
        // language,
      },
    };
    if (url) {
      // Keep endpoints relative (e.g. "/api/user/register"); axios will combine with baseURL.
      axiosConfig.url = url;
    }

    // Set authorization header with API token if available.
    if (apiToken) {
      axiosConfig.headers = {
        ...axiosConfig.headers,
        "Authorization": `Bearer ${apiToken}`,
      };
    }

    // Merge any extra headers passed by the caller (e.g., X-Id, X-Action)
    if (extraHeaders && typeof extraHeaders === 'object') {
      axiosConfig.headers = {
        ...axiosConfig.headers,
        ...extraHeaders,
      };
    }

    // Set request body data if provided.
    if (bodyData) {
      // If caller passed a FormData instance (for multipart/form-data), send it directly
      if (typeof FormData !== "undefined" && bodyData instanceof FormData) {
        axiosConfig.data = bodyData;
        // Remove explicit content-type so the browser/axios can set the multipart boundary
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
    // Debug/log baseURL and url to verify where the request will be sent
    logger("API request config", {
      baseURL: axiosConfig.baseURL,
      url: axiosConfig.url,
      method: axiosConfig.method,
    });

    const res = await axios(axiosConfig);
    logger(res, 'yaha res ');

    return res.data;
  } catch (error) {
    // Handle different error scenarios.


    if (axios.isCancel(error)) {
      logger("API canceled", error);
      throw new Error(error);
    }

    // Normalise the response object for easier handling
    const errorRes = error.response;
    logger("Error in the api request", errorRes);

    // If server returned an HTML page (Next.js error page), try to extract readable JSON
    if (errorRes && typeof errorRes.data === "string") {
      const html = errorRes.data.trim();
      if (html.startsWith("<!DOCTYPE html") || html.startsWith("<html")) {
        try {
          const match = html.match(/<script[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
          if (match && match[1]) {
            const nextData = JSON.parse(match[1]);
            const nextErrMsg = nextData?.err?.message || nextData?.props?.pageProps?.message || nextData?.props?.pageProps?.err?.message;
            if (nextErrMsg) {
              toast.error(nextErrMsg);
              logger("Next.js error extracted", nextErrMsg);
            } else {
              toast.error("Server returned an HTML error page (500).");
            }
          } else {
            toast.error("Server returned an HTML error page (500).");
          }
        } catch (parseErr) {
          logger("Failed to parse HTML error response", parseErr);
          toast.error("Server error (500).");
        }
        return { status: 'error', message: "Server returned an HTML error page." };
      }
    }

    // Handle other HTTP status codes and provide appropriate notifications.
    const statusCode = errorRes?.data?.statusCode || errorRes?.status;
    const message = errorRes?.data?.message;

    // 401 Unauthorized handling
    if (statusCode === 401) {
      // (optional) handle token refresh / logout here
    }

    // 403 Forbidden: treat as hard auth failure per request — clear token and redirect to module login
    if (statusCode === 403) {
      return { status: 'error', message: message || "Access denied (403)." };
    }

    // Other errors: show a message and return the error data payload so the caller can handle it
    if (message) {
      toast.error(message);
    }

    return errorRes?.data || { status: 'error', message: message || 'An error occurred' };
  }
};

export default APIrequest;
