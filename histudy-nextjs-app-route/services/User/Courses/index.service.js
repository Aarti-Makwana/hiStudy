import { UserCourses } from "../../../apiEndPoints";
import { logger } from "../../..//utils";
import APIrequest from "../../axios";

// UserCoursesServices contains functions to interact with the courses-related APIs for the User module.
// Each function corresponds to a specific API endpoint for tasks such as getting all courses, etc.
export const UserCoursesServices = {

  UserAllCourses: async () => {
    try {
      const payload = {
        ...UserCourses.getAllCourses,
      };
      const res = await APIrequest(payload);
      return res;
    } catch (error) {
      logger(error);
      throw error;
    }
  },

};
