import { UserHome } from "../../../apiEndPoints";
import { logger } from "../../..//utils";
import APIrequest from "../../axios";

// UserHomeServices contains functions to interact with the home-related APIs for the User module.
// Each function corresponds to a specific API endpoint for tasks such as getting all courses, etc.
export const UserHomeServices = {

  UserHome: async () => {
    try {
      const payload = {
        ...UserHome.getForHome,
      };
      const res = await APIrequest(payload);
      return res;
    } catch (error) {
      logger(error);
      throw error;
    }
  },
  getAllCourses: async () => {
    try {
      const payload = {
        ...UserHome.getAllCourses,
      };
      const res = await APIrequest(payload);
      return res;
    } catch (error) {
      logger(error);
      throw error;
    }
  },
};
