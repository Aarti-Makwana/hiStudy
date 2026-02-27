import Link from "next/link";
import React from "react";

const LessonTop = ({ sidebar, setSidebar, courseTitle, courseSlug }) => {
  return (
    <>
      <div className="lesson-top-bar">
        <div className="lesson-top-left">
          {/* Back button → goes to course details */}
          <Link
            href={courseSlug ? `/course-details/${courseSlug}` : "/course-details"}
            className="lesson-back-btn"
            title="Back to Course"
          >
            <i className="feather-arrow-left"></i>
          </Link>

          {/* Course name */}
          <h5 className="lesson-top-title">{courseTitle || "Course Lesson"}</h5>

          {/* Hamburger / sidebar toggle */}
          <button
            className={`lesson-hamburger-btn ${!sidebar ? "sidebar-hidden" : ""}`}
            title="Toggle Sidebar"
            onClick={setSidebar}
          >
            <i className="feather-menu"></i>
          </button>
        </div>
      </div>
    </>
  );
};

export default LessonTop;
