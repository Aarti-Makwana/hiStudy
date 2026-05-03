/**
 * Certificate object represents certificate-related API endpoints and their methods.
 */
const Certificate = {
  /**
   * Endpoint for requesting a certificate.
   * @memberof Certificate
   * @type {object}
   * @property {string} url - The URL for requesting a certificate.
   * @property {string} method - The HTTP method for requesting a certificate (POST).
   */
  requestCertificate: {
    url: "/api/v1/certificate/request",
    method: "POST",
  },

  /**
   * Endpoint for downloading a certificate.
   * @memberof Certificate
   * @type {object}
   * @property {string} url - The URL for downloading a certificate.
   * @property {string} method - The HTTP method for downloading a certificate (GET).
   */
  downloadCertificate: {
    url: "/api/v1/certificate/download",
    method: "GET",
  },
};

export default Certificate;
