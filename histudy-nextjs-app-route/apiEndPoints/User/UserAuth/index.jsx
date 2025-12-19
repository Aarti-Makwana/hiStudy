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
    url: "/auth/login",
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
    url: "/User/forgot-password",
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
    url: "/User/reset-password",
    method: "PATCH",
  },

  /**
   * Endpoint for updating User account information.
   * @memberof Auth
   * @type {object}
   * @property {string} url - The URL for updating User account information.
   * @property {string} method - The HTTP method for updating User account information (PUT).
   */
  accountUpdate: {
    url: "/User/update-profile",
    method: "PATCH",
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
    url: "/auth/logout",
    method: "GET",
  },
  /**
   * Endpoint for User auth detail.
   * @memberof Auth
   * @type {object}
   * @property {string} url - The URL for User auth detail.
   * @property {string} method - The HTTP method for User logout (GET).
   */
  getUserDetails: {
    url: "/auth/me",
    method: "GET",
  },

  /**
   * Endpoint for getting User profile data
   * @type {object}
   */
  getUserData: {
    url: "/User/profile",
    method: "GET",
  },
};

// Export the Auth object for use in other modules
export default UserAuth;
