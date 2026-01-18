/**
 * Review object represents review-related API endpoints and their methods.
 */
const UserReview = {
  /**
   * Endpoint for getting all reviews.
   * @memberof UserReview
   * @type {object}
   * @property {string} url - The URL for getting all reviews.
   * @property {string} method - The HTTP method for getting all reviews (GET).
   */
  getAllReviews: {
    url: "/api/v1/review/get-all",
    method: "GET",
  },
};

export default UserReview;