const UserCourses = {

  getAllCourses: {
    url: "/api/v1/get-all-courses",
    method: "GET",
  },
  getCourse: {
    url: "/api/v1/get-single-course",
    method: "GET",
  },
  getAllTestimonials: {
    url: "/api/v1/testimonial/get-all",
    method: "GET",
  },

  getsingleCourseTopicContent: {
    url: "/api/v1/getsingle-course-topic/{topic_id}/contents/{content_id}",
    method: "GET",
  },

  // POST body: { lesson_id: string, current_time: number (seconds) }
  trackLessonProgress: {
    url: "/api/v1/lesson-progress",
    method: "POST",
  },

  // GET /api/v1/lesson-progress/{content_id}
  getLessonProgress: {
    url: "/api/v1/lesson-progress",
    method: "GET",
  },
  
  saveCommentReply: {
    url: "/api/v1/course-content/save-comment-reply",
    method: "POST",
  },
  
  getAllCommentReply: {
    url: "/api/v1/course-content/getall-comment-reply",
    method: "GET",
  },

  getQuizAttempts: {
    url: "/api/v1/quiz-attempts",
    method: "GET",
  },

  getSubmissionContents: {
    url: "/api/v1/submission-contents",
    method: "GET",
  },

  saveSubmission: {
    url: "/api/v1/submission-contents",
    method: "POST",
  },
};

export default UserCourses;
