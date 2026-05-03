import { Certificate } from "../../../apiEndPoints";
import { logger } from "../../../utils";
import APIrequest from "../../axios";

// CertificateServices contains functions to interact with the certificate-related APIs for the User module.
export const CertificateServices = {
  /**
   * Function for requesting a certificate.
   * @param {Object} bodyData - { enrollment_id: string }
   * @returns {Promise<Object>} - API response
   */
  requestCertificate: async (bodyData) => {
    try {
      const payload = {
        ...Certificate.requestCertificate,
        bodyData,
      };
      const res = await APIrequest(payload);
      return res;
    } catch (error) {
      logger(error);
      throw error;
    }
  },

  /**
   * Function for downloading a certificate.
   * @param {Object} params - { enrollment_id: string, is_allowed: boolean }
   * @returns {Promise<Object>} - API response
   */
  downloadCertificate: async (params) => {
    try {
      const payload = {
        ...Certificate.downloadCertificate,
        queryParams: params,
      };
      const res = await APIrequest(payload);
      return res;
    } catch (error) {
      logger(error);
      throw error;
    }
  },
};
