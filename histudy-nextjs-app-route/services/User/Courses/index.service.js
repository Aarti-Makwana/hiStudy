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

  UserGetCourse: async (slug) => {
    try {
      const payload = {
        ...UserCourses.getCourse,
        url: UserCourses.getCourse.url + "/" + slug,
      };
      const res = await APIrequest(payload);
      return res;
    } catch (error) {
      logger(error);
      throw error;
    }
  },

  UserAllTestimonials: async () => {
    try {
      const payload = {
        ...UserCourses.getAllTestimonials,
      };
      const res = await APIrequest(payload);
      return res;
    } catch (error) {
      logger(error);
      throw error;
    }
  },

  UserGetSingleCourseTopicContent: async (topic_id, content_id) => {
    try {
      const payload = {
        ...UserCourses.getsingleCourseTopicContent,
        url: UserCourses.getsingleCourseTopicContent.url
          .replace("{topic_id}", topic_id)
          .replace("{content_id}", content_id),
      };
      const res = await APIrequest(payload);
      return res;
    } catch (error) {
      logger(error);
      throw error;
    }
  },
  // POST /api/v1/lesson-progress
  // body: { lesson_id: string (content_id), current_time: number (seconds float) }
  TrackLessonProgress: async (lessonId, currentTimeSec) => {
    try {
      const payload = {
        ...UserCourses.trackLessonProgress,
        data: {
          lesson_id: lessonId,
          current_time: currentTimeSec,
        },
      };
      const res = await APIrequest(payload);
      return res;
    } catch (error) {
      logger(error);
      throw error;
    }
  },

  // GET /api/v1/lesson-progress/{content_id}
  GetLessonProgress: async (contentId) => {
    try {
      const payload = {
        ...UserCourses.getLessonProgress,
        url: `${UserCourses.getLessonProgress.url}/${contentId}`,
      };
      const res = await APIrequest(payload);
      return res;
    } catch (error) {
      logger(error);
      throw error;
    }
  },

};
