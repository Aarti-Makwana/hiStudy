import Link from "next/link";
import React from "react";

const Content = ({ checkMatchCourses, courseSlug }) => {
  const [expandedLessons, setExpandedLessons] = React.useState([]);

  const toggleLessonSummary = (e, lessonId) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedLessons((prev) =>
      prev.includes(lessonId)
        ? prev.filter((id) => id !== lessonId)
        : [...prev, lessonId]
    );
  };

  return (
    <>
      <div className="rbt-course-feature-inner udemy-curriculum">
        <div className="section-title">
          <h4 className="rbt-title-style-3">Course Content</h4>
        </div>
        <div className="rbt-accordion-style rbt-accordion-02 accordion">
          <div className="accordion" id="accordionExampleb2">
            {checkMatchCourses.contentList.map((item, innerIndex) => (
              <div className="accordion-item card" key={innerIndex}>
                <h2
                  className="accordion-header card-header"
                  id={`headingTwo${innerIndex}`}
                >
                  <button
                    className={`accordion-button ${!item.collapsed ? "collapsed" : ""
                      }`}
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#collapseTwo${innerIndex + 1}`}
                    aria-expanded={item.expand}
                    aria-controls={`collapseTwo${innerIndex + 1}`}
                  >
                    <span className="accordion-title-left">
                      <i className="feather-chevron-down mr--10"></i>
                      {item.title}
                    </span>
                    <span className="accordion-title-right">
                      {item.listItem?.length > 0 && (
                        <span className="lec-count">{item.listItem.length} lectures</span>
                      )}
                      {item.time && (
                        <span className="section-time">{item.time}</span>
                      )}
                    </span>
                  </button>
                </h2>
                <div
                  id={`collapseTwo${innerIndex + 1}`}
                  className={`accordion-collapse collapse ${item.isShow ? "show" : ""
                    }`}
                  aria-labelledby={`headingTwo${innerIndex}`}
                  data-bs-parent="#accordionExampleb2"
                >
                  <div className="accordion-body card-body pr--0 pb--0">
                    <ul className="rbt-course-main-content liststyle">
                      {item.listItem.map((list, subIndex) => {
                        const lessonId = `lesson-${innerIndex}-${subIndex}`;
                        const isExpanded = expandedLessons.includes(lessonId);
                        return (
                          <li key={subIndex} className={isExpanded ? "item-expanded" : ""}>
                            <Link href={`/lesson?course_slug=${courseSlug}&topic_id=${list.topicId}&content_id=${list.contentId}`}>
                              <div className="course-content-left-outer w-100">
                                <div className="course-content-left">
                                  <i className={list.icon || "feather-play-circle"}></i>
                                  <div className="course-content-text-wrap d-flex flex-column align-items-start text-start">
                                    <div className="text-toggle-wrap">
                                      <span className="text">{list.text}</span>
                                      {list.summary && (
                                        <button
                                          className={`summary-toggle-btn ${isExpanded ? "active" : ""}`}
                                          onClick={(e) => toggleLessonSummary(e, lessonId)}
                                        >
                                          <i className="feather-chevron-down"></i>
                                        </button>
                                      )}
                                    </div>
                                    {list.summary && isExpanded && (
                                      <div className="lesson-summary-content mt--5">
                                        <p>{list.summary}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="course-content-right">
                                  {list.status && (
                                    <span className="preview-text">Preview</span>
                                  )}
                                  <span className="min-lable">{list.time}</span>
                                  {!list.status && (
                                    <span className="course-lock">
                                      <i className="feather-lock"></i>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Content;
