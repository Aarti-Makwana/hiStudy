import { GeneralInfo as Endpoints } from "../../../apiEndPoints";
import { logger } from "../../../utils";
import APIrequest from "../../axios";

/**
 * GeneralInfoService contains functions to interact with the general information APIs.
 */
export const GeneralInfoService = {
    /**
     * Function for general inquiry (Contact Us).
     * @param {Object} bodyData - The inquiry details (name, email, phone, subject, message).
     * @returns {Promise<Object>} - A promise that resolves to the response from the API.
     */
    generalInquiry: async (bodyData) => {
        try {
            const payload = {
                ...Endpoints.generalInquiry,
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
     * Function to get single setting by key.
     * @param {string} key - The setting key to fetch.
     * @returns {Promise<Object>} - A promise that resolves to the response from the API.
     */
    getSettings: async (key) => {
        try {
            const payload = {
                ...Endpoints.getSettings,
                url: Endpoints.getSettings.url.replace(":key", key),
            };
            const res = await APIrequest(payload);
            return res;
        } catch (error) {
            logger(error);
            throw error;
        }
    },
};
