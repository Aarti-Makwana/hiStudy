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
};

export default UserCourses;
