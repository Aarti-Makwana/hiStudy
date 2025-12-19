import axios from "axios";
import momentTimezone from "moment-timezone";
import config from "../config";
import { getLocalStorageToken, logger } from "../utils";
import { toast } from "react-toastify";

const APIrequest = async ({
  method = "GET",
  url,
  baseURL,
  queryParams,
  bodyData,
}) => {
  const apiToken = getLocalStorageToken();
  try {
    const axiosConfig = {
      method: method || "GET",
      baseURL: baseURL || config.API_BASE_URL,
      headers: {
        "content-type": "application/json",
        "X-Frame-Options": "sameorigin",
        "timezone": momentTimezone.tz.guess(true),
        // language,
      },
    };
    if (url) {
      axiosConfig.url = url;
    }

    // Set authorization header with API token if available.
    if (apiToken) {
      axiosConfig.headers = {
        ...axiosConfig.headers,
        "Authorization": `Bearer ${apiToken}`,
      };
    }

    // Set request body data if provided.
    if (bodyData) {
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


    // Handle different error scenarios.
    if (axios.isCancel(error)) {
      logger("API canceled", error);
      throw new Error(error);
    } else {
      // Handle different HTTP status codes and provide appropriate notifications.
      const errorRes = error.response;
      logger("Error in the api request", errorRes);

      const statusCode = errorRes?.data?.statusCode || errorRes?.status;
      const message = errorRes?.data?.message;

      // 401 Unauthorized handling
      if (statusCode === 401) {
      }

      // 403 Forbidden: treat as hard auth failure per request — clear token and redirect to module login
      if (statusCode === 403) {
            
        return null;
      }

      // Other errors: optionally show a message and return null
      if (message) {
        toast.error(message);
      }
      return null;
    }
  }
};

export default APIrequest;
