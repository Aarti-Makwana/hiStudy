"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";

import LessonData from "../../data/lesson.json";

const LessonSidebar = ({ courseData, courseSlug }) => {
  const [activeTab, setActiveTab] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentContentId = searchParams.get("content_id");

  const isActive = (contentId) => currentContentId === String(contentId);

  useEffect(() => {
    if (courseData?.topics) {
      courseData.topics.forEach((topic) => {
        const matchedItem = topic.course_contents?.find(
          (item) => String(item.id) === currentContentId
        );
        if (matchedItem) {
          setActiveTab(topic.id);
        }
      });
    } else {
      const lessonItems = LessonData.lesson;
      lessonItems.forEach((lesson) => {
        const matchedItem = lesson.listItem.find((item) =>
          pathname.startsWith(item.lssonLink)
        );
        if (matchedItem) {
          setActiveTab(lesson.id);
        }
      });
    }
  }, [currentContentId, pathname, courseData]);

  const topics = courseData?.topics || [];

  const filteredTopics = topics
    .map((topic) => {
      const filteredContents = topic.course_contents?.filter((content) =>
        content.title.toLowerCase().includes(searchValue.toLowerCase())
      );
      return { ...topic, course_contents: filteredContents };
    })
    .filter(
      (topic) =>
        topic.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        topic.course_contents.length > 0
    );

  return (
    <>
      <div className="rbt-course-feature-inner rbt-search-activation">
        <div className="section-title">
          <h4 className="rbt-title-style-3">Course Content</h4>
        </div>
        <div className="lesson-search-wrapper">
          <div className="rbt-search-style-1">
            <input
              className="rbt-search-active"
              type="text"
              placeholder="Search Lesson"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <button className="search-btn disabled">
              <i className="feather-search"></i>
            </button>
          </div>
        </div>
        <hr className="mt--10" />
        <div className="rbt-accordion-style rbt-accordion-02 for-right-content accordion">
          <div className="accordion" id="accordionExampleb2">
            {filteredTopics.length > 0
              ? filteredTopics.map((data, index) => (
                <div className="accordion-item card" key={index}>
                  <h2
                    className="accordion-header card-header"
                    id={`headingTwo${index + 1}`}
                  >
                    <button
                      className={`accordion-button ${data.id === activeTab ? "" : "collapsed"
                        }`}
                      type="button"
                      data-bs-toggle="collapse"
                      aria-expanded={data.id === activeTab}
                      data-bs-target={`#collapseTwo${index + 1}`}
                      aria-controls={`collapseTwo${index + 1}`}
                      onClick={() => setActiveTab(data.id)}
                    >
                      {data.name}
                      <span className="rbt-badge-5 ml--10">
                        {data.progres?.completed || 0}/{data.course_contents?.length || 0}
                      </span>
                    </button>
                  </h2>
                  <div
                    id={`collapseTwo${index + 1}`}
                    className={`accordion-collapse collapse ${data.id === activeTab ? "show" : ""
                      }`}
                    aria-labelledby={`headingTwo${index + 1}`}
                  >
                    <div className="accordion-body card-body">
                      <ul className="rbt-course-main-content liststyle">
                        {data.course_contents?.map((innerData, innerIndex) => (
                          <li key={innerIndex}>
                            <Link
                              className={isActive(innerData.id) ? "active" : ""}
                              href={`/lesson?course_slug=${courseSlug}&topic_id=${data.id}&content_id=${innerData.id}`}
                              onClick={() => setActiveTab(data.id)}
                            >
                              <div className="course-content-left">
                                <i
                                  className={`feather-${innerData.category?.slug === "lesson"
                                    ? "play-circle"
                                    : "file-text"
                                    }`}
                                ></i>
                                <span className="text">{innerData.title}</span>
                              </div>
                              <div className="course-content-right">
                                {innerData.hours > 0 || innerData.minutes > 0 ? (
                                  <span className="min-lable">
                                    {innerData.hours > 0 ? `${innerData.hours}h ` : ""}{innerData.minutes} min
                                  </span>
                                ) : (
                                  ""
                                )}
                                <span
                                  className={`rbt-check ${isActive(innerData.id) ? "" : "unread"
                                    }`}
                                >
                                  <i
                                    className={`feather-${isActive(innerData.id) ? "check" : "circle"
                                      }`}
                                  ></i>
                                </span>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))
              : (topics.length > 0 && searchValue) ? (
                <div className="text-center p--20">No lessons found.</div>
              ) : courseSlug ? (
                // If we have a courseSlug but no topics yet, it's loading or empty. Don't show static data.
                <div className="text-center p--20">Loading content...</div>
              ) : LessonData.lesson.map((data, index) => (
                <div className="accordion-item card" key={index}>
                  <h2
                    className="accordion-header card-header"
                    id={`headingTwo${index + 1}`}
                  >
                    <button
                      className={`accordion-button ${data.id === activeTab ? "" : "collapsed"
                        }`}
                      type="button"
                      data-bs-toggle="collapse"
                      aria-expanded={data.id === activeTab}
                      data-bs-target={`#collapseTwo${index + 1}`}
                      aria-controls={`collapseTwo${index + 1}`}
                      onClick={() => setActiveTab(data.id)}
                    >
                      {data.title}
                    </button>
                  </h2>
                  <div
                    id={`collapseTwo${index + 1}`}
                    className={`accordion-collapse collapse ${data.id === activeTab ? "show" : ""
                      }`}
                    aria-labelledby={`headingTwo${index + 1}`}
                  >
                    <div className="accordion-body card-body">
                      <ul className="rbt-course-main-content liststyle">
                        {data.listItem.map((innerData, innerIndex) => (
                          <li key={innerIndex}>
                            <Link
                              className={
                                pathname.startsWith(innerData.lssonLink)
                                  ? "active"
                                  : ""
                              }
                              href={`${innerData.lssonLink}`}
                              onClick={() => setActiveTab(data.id)}
                            >
                              <div className="course-content-left">
                                {innerData.iconHelp ? (
                                  <i className="feather-help-circle"></i>
                                ) : (
                                  <i
                                    className={`feather-${innerData.iconFile
                                      ? "file-text"
                                      : "play-circle"
                                      }`}
                                  ></i>
                                )}
                                <span className="text">
                                  {innerData.lessonName}
                                </span>
                              </div>
                              <div className="course-content-right">
                                {innerData.lable && innerData.time > 0 ? (
                                  <span className="min-lable">
                                    {innerData.time} min
                                  </span>
                                ) : (
                                  ""
                                )}
                                <span
                                  className={`rbt-check ${pathname.startsWith(innerData.lssonLink)
                                    ? ""
                                    : "unread"
                                    }`}
                                >
                                  <i
                                    className={`feather-${pathname.startsWith(innerData.lssonLink)
                                      ? "check"
                                      : "circle"
                                      }`}
                                  ></i>
                                </span>
                              </div>
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

export default LessonSidebar;
