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
      const bodyData = {
        lesson_id: lessonId,
        current_time: currentTimeSec,
      };
      console.log("[TrackProgress] POST request →", bodyData);
      const payload = {
        ...UserCourses.trackLessonProgress,
        bodyData,
      };
      const res = await APIrequest(payload);
      console.log("[TrackProgress] POST response ←", res);
      return res;
    } catch (error) {
      console.error("[TrackProgress] POST error:", error);
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

  saveCommentReply: async (bodyData) => {
    try {
      const payload = {
        ...UserCourses.saveCommentReply,
        bodyData,
      };
      const res = await APIrequest(payload);
      return res;
    } catch (error) {
      logger(error);
      throw error;
    }
  },

  getAllCommentReply: async (content_id) => {
    try {
      const payload = {
        ...UserCourses.getAllCommentReply,
        url: `${UserCourses.getAllCommentReply.url}?content_id=${content_id}`,
      };
      const res = await APIrequest(payload);
      return res;
    } catch (error) {
      logger(error);
      throw error;
    }
  },

  GetQuizAttempts: async (courseId) => {
    try {
      const payload = {
        ...UserCourses.getQuizAttempts,
        url: `${UserCourses.getQuizAttempts.url}/${courseId}`,
      };
      const res = await APIrequest(payload);
      return res;
    } catch (error) {
      logger(error);
      throw error;
    }
  },

  GetSubmissionContents: async (courseId) => {
    try {
      const payload = {
        ...UserCourses.getSubmissionContents,
        url: `${UserCourses.getSubmissionContents.url}/${courseId}`,
      };
      const res = await APIrequest(payload);
      return res;
    } catch (error) {
      logger(error);
      throw error;
    }
  },

  SaveSubmission: async (bodyData) => {
    try {
      const payload = {
        ...UserCourses.saveSubmission,
        bodyData,
      };
      const res = await APIrequest(payload);
      return res;
    } catch (error) {
      logger(error);
      throw error;
    }
  },
};
