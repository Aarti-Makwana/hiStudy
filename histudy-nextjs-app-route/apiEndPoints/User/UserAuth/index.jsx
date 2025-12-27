/**
 * Auth object represents authentication-related API endpoints and their methods.
 */
const UserAuth = {
  /**
   * Endpoint for User login.
   * @memberof Auth
   * @type {object}
   * @property {string} url - The URL for User login.
   * @property {string} method - The HTTP method for User login (POST).
   */

  accountLogin: {
    url: "/api/user/login",
    method: "POST",
  },

  accountRegister: {
    url: "/api/user/register",
    method: "POST",
  },
  /**
   * Endpoint for changing User password.
   * @memberof Auth
   * @type {object}
   * @property {string} url - The URL for changing User password.
   * @property {string} method - The HTTP method for changing User password (PATCH).
   */
  changePassword: {
    url: "/User/change-password",
    method: "PATCH",
  },

  /**
   * Endpoint for User password recovery.
   * @memberof Auth
   * @type {object}
   * @property {string} url - The URL for User password recovery.
   * @property {string} method - The HTTP method for User password recovery (PATCH).
   */
  accountForgot: {
    url: "/api/user/forgot-password",
    method: "POST",
  },

  /**
   * Endpoint for resetting User password.
   * @memberof Auth
   * @type {object}
   * @property {string} url - The URL for resetting User password.
   * @property {string} method - The HTTP method for resetting User password (PATCH).
   */
  resetPassword: {
    url: "/api/user/reset-password",
    method: "POST",
  },

  /**
   * Endpoint for updating User account information.
   * @memberof Auth
   * @type {object}
   * @property {string} url - The URL for updating User account information.
   * @property {string} method - The HTTP method for updating User account information (PUT).
   */
  userDetailsUpdate: {
    url: "/api/profile",
    method: "POST",
  },

  /**
   * Endpoint for updating User profile image.
   * @memberof Auth
   * @type {object}
   * @property {string} url - The URL for updating User profile image.
   * @property {string} method - The HTTP method for updating User profile image (PATCH).
   */
  updateProfileImage: {
    url: "/User/update-profile",
    method: "PATCH",
  },

  /**
   * Endpoint for User logout.
   * @memberof Auth
   * @type {object}
   * @property {string} url - The URL for User logout.
   * @property {string} method - The HTTP method for User logout (POST).
   */
  accountLogout: {
    url: "/api/profile/logout",
    method: "DELETE",
  },
  /**
   * Endpoint for User auth detail.
   * @memberof Auth
   * @type {object}
   * @property {string} url - The URL for User auth detail.
   * @property {string} method - The HTTP method for User logout (GET).
   */
  getUserDetails: {
    url: "/api/profile",
    method: "GET",
  },

  /**
   * Endpoint for getting User profile data
   * @type {object}
   */
  getUserData: {
    url: "/api/data",
    method: "GET",
  },

  // OTP verification endpoint used for signup/login flows
  verifyOtp: {
    url: "/api/otp-verification",
    method: "POST",
  },
  // Resend OTP endpoint used by otp flows
  resendOtp: {
    url: "/api/user/resend-otp",
    method: "POST",
  },
};

// Export the Auth object for use in other modules
export default UserAuth;
