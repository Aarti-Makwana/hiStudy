import { UserAuth as Auth } from "../../../apiEndPoints";
import { logger } from "../../..//utils";
import APIrequest from "../../axios";

// UserAuthServices contains functions to interact with the authentication-related APIs for the User module.
// Each function corresponds to a specific API endpoint for tasks such as login, password change, forgot password, etc.
export const UserAuthServices = {
  /**
   * Function for user login.
   * @param {Object} values - User login credentials.
   * @returns {Promise<Object>} - A promise that resolves to the response from the login API.
   */
  userLogin: async (values) => {
    try {
      const payload = {
        ...Auth.accountLogin,
        bodyData: values,
      };
      const res = await APIrequest(payload);
      return res;
    } catch (error) {
      logger(error);
      throw error;
    }
  },


  userRegister: async (values) => {
    try {
      const payload = {
        ...Auth.accountRegister,
        bodyData: values,
      };
      const res = await APIrequest(payload);
      return res;
    } catch (error) {
      logger(error);
      throw error;
    }
  },
  /**
   * Function for changing password.
   * @param {Object} bodyData - Password change information.
   * @returns {Promise<Object>} - A promise that resolves to the response from the change password API.
   */
  changePasswordService: async (bodyData) => {
    try {
      const payload = {
        ...Auth.changePassword,
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
   * Function for handling User forgot password.
   * @param {Object} bodyData - User information for the forgot password process.
   * @returns {Promise<Object>} - A promise that resolves to the response from the forgot password API.
   */
  UserForgotPassword: async (bodyData) => {
    try {
      const payload = {
        ...Auth.accountForgot,
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
   * Function for updating User profile information.
   * @param {Object} bodyData - Updated User profile information.
   * @returns {Promise<Object>} - A promise that resolves to the response from the update profile API.
   */
  updateUserService: async (bodyData) => {
    try {
      const payload = {
        ...Auth.accountUpdate,
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
   * Function for resetting password.
   * @param {Object} bodyData - Password reset information.
   * @returns {Promise<Object>} - A promise that resolves to the response from the reset password API.
   */
  resetPasswordService: async (bodyData, queryParams = {}) => {
    try {
      const payload = {
        ...Auth.resetPassword,
        bodyData,
        queryParams,
      };
      const res = await APIrequest(payload);
      return res;
    } catch (error) {
      logger(error);
      throw error;
    }
  },

  /**
   * Resend OTP for given email and type (register|login|forgot)
   * @param {Object} bodyData - { email, type }
   */
  resendOtp: async (bodyData) => {
    try {
      const payload = {
        url: "/api/user/resend-otp",
        method: "POST",
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
   * Function for updating profile image.
   * @param {Object} bodyData - Updated profile image information.
   * @returns {Promise<Object>} - A promise that resolves to the response from the update profile image API.
   */
  updateProfileImageService: async (bodyData) => {
    try {
      const payload = {
        ...Auth.updateProfileImage,
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
   * Function for user logout.
   * @returns {Promise<Object>} - A promise that resolves to the response from the logout API.
   */
  logoutService: async () => {
    try {
      const payload = {
        ...Auth.accountLogout,
      };
      const res = await APIrequest(payload);
      return res;
    } catch (err) {
      logger(err);
    }
  },


  /**
   * Function for User getUserDataService.
   * @returns {Promise<Object>} - A promise that resolves to the response from the User detail API.
   */
  getUserDataService: async () => {
    try {
      let payload = {
        ...Auth.getUserDetails,
      };
      const res = await APIrequest(payload);
      return res;
    } catch (error) {
      logger(error);
      throw error;
    }
  },
  /**
   * Function for updating user details via /api/profile
   * @param {Object} bodyData - Updated profile information.
   */
  userDetailsUpdateService: async (bodyData) => {
    try {
      const payload = {
        ...Auth.userDetailsUpdate,
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
   * Verify OTP for signup/login flows.
   * @param {FormData} formData - FormData containing `email` and `otp`.
   * @param {Object} headers - Headers object to include X-Id and X-Action.
   * @returns {Promise<Object>} - API response
   */
  otpVerify: async (formData, headers = {}) => {
    try {
      const payload = {
        ...Auth.verifyOtp,
        bodyData: formData,
        headers: headers,
      };
      const res = await APIrequest(payload);
      
      return res;
    } catch (error) {
      logger(error);
      throw error;
    }
  },
};
