import Link from "next/link";
import React from "react";

const LessonTop = ({ sidebar, setSidebar, courseTitle, courseSlug }) => {
  return (
    <>
      <div className="lesson-top-bar">
        <div className="lesson-top-left">
          <div className="rbt-lesson-toggle">
            <button
              className={`lesson-toggle-active btn-round-white-opacity ${!sidebar ? "sidebar-hide" : ""
                }`}
              title="Toggle Sidebar"
              onClick={setSidebar}
            >
              <i className="feather-arrow-left"></i>
            </button>
          </div>
          <h5>{courseTitle || "Course Lesson"}</h5>
        </div>
        <div className="lesson-top-right">
          <div className="rbt-btn-close">
            <Link
              href={courseSlug ? `/course-details/${courseSlug}` : "/course-details"}
              title="Go Back to Course"
              className="rbt-round-btn"
            >
              <i className="feather-x"></i>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default LessonTop;
