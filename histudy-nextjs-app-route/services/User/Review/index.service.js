import { UserReview as Review } from "../../../apiEndPoints";
import { logger } from "../../..//utils";
import APIrequest from "../../axios";

// UserReviewServices contains functions to interact with the review-related APIs for the User module.
export const UserReviewServices = {
  /**
   * Function for getting all reviews.
   * @param {Object} params - Query parameters like page.
   * @returns {Promise<Object>} - A promise that resolves to the response from the get all reviews API.
   */
  getAllReviews: async (params = {}) => {
    try {
      const payload = {
        ...Review.getAllReviews,
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