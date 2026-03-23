import Link from "next/link";
import React from "react";

const Content = ({ checkMatchCourses, courseSlug }) => {
  return (
    <>
      <div className="rbt-course-feature-inner">
        <div className="section-title">
          <h4 className="rbt-title-style-3">{checkMatchCourses.title}</h4>
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
                    {item.title}
                    <span className="rbt-badge-5 ml--10">{item.time}</span>
                  </button>
                </h2>
                <div
                  id={`collapseTwo${innerIndex + 1}`}
                  className={`accordion-collapse collapse ${item.isShow ? "show" : ""
                    }`}
                  aria-labelledby={`headingTwo${innerIndex}`}
                  data-bs-parent="#accordionExampleb2"
                >
                  <div className="accordion-body card-body pr--0">
                    <ul className="rbt-course-main-content liststyle">
                      {item.listItem.map((list, subIndex) => (
                        <li key={subIndex}>
                          <Link href={`/lesson?course_slug=${courseSlug}&topic_id=${list.topicId}&content_id=${list.contentId}`}>
                            <div className="course-content-left align-items-start">
                              <i className={list.icon || "feather-circle"} style={{ marginTop: list.summary ? "4px" : "0" }}></i>
                              <div className="course-content-text-wrap d-flex flex-column align-items-start text-start">
                                <span className="text">{list.text}</span>
                                {list.summary && (
                                  <span className="course-content-summary">{list.summary}</span>
                                )}
                              </div>
                            </div>
                            {list.status ? (
                              <div className="course-content-right">
                                <span className="min-lable">{list.time}</span>
                                <span className="rbt-badge variation-03 bg-primary-opacity">
                                  <i className="feather-eye"></i> Preview
                                </span>
                              </div>
                            ) : (
                              <div className="course-content-right">
                                <span className="min-lable">{list.time}</span>
                                <span className="course-lock">
                                  <i className="feather-lock"></i>
                                </span>
                              </div>
                            )}
                          </Link>
                        </li>
                      ))}
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
