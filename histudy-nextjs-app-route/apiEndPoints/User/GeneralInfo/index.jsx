/**
 * GeneralInfo object represents general inquiry related API endpoints.
 */
const GeneralInfoEndpoints = {
    /**
     * Endpoint for general inquiry (Contact Us).
     * @type {object}
     * @property {string} url - The URL for general inquiry.
     * @property {string} method - The HTTP method for general inquiry (POST).
     */
    generalInquiry: {
        url: "/api/v1/general-inquiry",
        method: "POST",
    },
    /**
     * Endpoint for getting single setting by key.
     * @type {object}
     * @property {string} url - The URL for getting single setting.
     * @property {string} method - The HTTP method (GET).
     */
    getSettings: {
        url: "/api/v1/settings/get-single/:key",
        method: "GET",
    },
};

export default GeneralInfoEndpoints;
