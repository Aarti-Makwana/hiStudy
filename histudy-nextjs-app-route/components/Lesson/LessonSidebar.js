"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";

import LessonData from "../../data/lesson.json";

// Helper: convert hours/minutes to total minutes
const toTotalMinutes = (h, m) => (h || 0) * 60 + (m || 0);

// Helper: format total minutes to "Xh Ym"
const formatMinutes = (totalMin) => {
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
};

const LessonSidebar = ({ courseData, courseSlug }) => {
  const [activeTab, setActiveTab] = useState(false);
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

  // ── Progress calculations ──────────────────────────────────────
  const totalContents = topics.reduce(
    (acc, t) => acc + (t.course_contents?.length || 0),
    0
  );
  const completedContents = topics.reduce(
    (acc, t) => acc + (t.progres?.completed || 0),
    0
  );
  const progressPercent =
    totalContents > 0 ? Math.round((completedContents / totalContents) * 100) : 0;

  const totalMinutesAll = topics.reduce((acc, t) => {
    return (
      acc +
      (t.course_contents || []).reduce(
        (a, c) => a + toTotalMinutes(c.hours, c.minutes),
        0
      )
    );
  }, 0);

  const watchedMinutes = topics.reduce((acc, t) => {
    const completed = t.progres?.completed || 0;
    const contents = t.course_contents || [];
    return (
      acc +
      contents
        .slice(0, completed)
        .reduce((a, c) => a + toTotalMinutes(c.hours, c.minutes), 0)
    );
  }, 0);

  const remainingMinutes = totalMinutesAll - watchedMinutes;

  // ── Content icon helper ────────────────────────────────────────
  const getIcon = (content) => {
    const slug = content?.category?.slug;
    if (slug === "quiz") return "feather-help-circle";
    if (slug === "assignment") return "feather-file-text";
    if (content?.icon === "document" || content?.url?.toLowerCase().includes(".pdf"))
      return "feather-book-open";
    return "feather-play-circle";
  };

  return (
    <>
      <div className="rbt-course-feature-inner rbt-search-activation">

        {/* ── Progress tab (Point 3) ── */}
        {courseSlug && totalContents > 0 && (
          <div className="lesson-progress-tab">
            <div className="lesson-progress-header">
              <span className="lesson-progress-percent">{progressPercent}%</span>
              <span className="lesson-progress-label">Complete</span>
            </div>
            <div className="lesson-progress-bar-track">
              <div
                className="lesson-progress-bar-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="lesson-progress-stats">
              <div className="lesson-stat">
                <i className="feather-clock"></i>
                <span className="lesson-stat-label">Total</span>
                <span className="lesson-stat-value">{formatMinutes(totalMinutesAll)}</span>
              </div>
              <div className="lesson-stat">
                <i className="feather-check-circle"></i>
                <span className="lesson-stat-label">Watched</span>
                <span className="lesson-stat-value">{formatMinutes(watchedMinutes)}</span>
              </div>
              <div className="lesson-stat">
                <i className="feather-loader"></i>
                <span className="lesson-stat-label">Remaining</span>
                <span className="lesson-stat-value">{formatMinutes(remainingMinutes)}</span>
              </div>
            </div>
          </div>
        )}

        <hr className="mt--5 mb--5" />

        {/* ── Accordion ── */}
        <div className="rbt-accordion-style rbt-accordion-02 for-right-content accordion">
          <div className="accordion" id="accordionExampleb2">
            {topics.length > 0
              ? topics.map((data, index) => {
                // Per-topic stats (Point 4)
                const topicTotalMin = (data.course_contents || []).reduce(
                  (a, c) => a + toTotalMinutes(c.hours, c.minutes),
                  0
                );
                const topicCount = data.course_contents?.length || 0;
                const topicCompleted = data.progres?.completed || 0;

                return (
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
                        {/* Point 7: title truncates, badges get fixed space */}
                        <span className="topic-title-text">{data.name}</span>
                        <span className="topic-badges">
                          {/* Point 4: time box */}
                          {topicTotalMin > 0 && (
                            <span className="topic-time-badge">
                              {formatMinutes(topicTotalMin)}
                            </span>
                          )}
                          {/* Point 4: count badge */}
                          <span className="rbt-badge-5 ml--5">
                            {topicCompleted}/{topicCount}
                          </span>
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
                          {data.course_contents?.map((innerData, innerIndex) => {
                            const isUrl = !!(innerData.url && !innerData.url.toLowerCase().includes(".pdf"));
                            const contentMin = toTotalMinutes(innerData.hours, innerData.minutes);

                            return (
                              <li key={innerIndex}>
                                <Link
                                  className={isActive(innerData.id) ? "active" : ""}
                                  href={`/lesson?course_slug=${courseSlug}&topic_id=${data.id}&content_id=${innerData.id}`}
                                  onClick={() => setActiveTab(data.id)}
                                >
                                  {/* Point 13: redesigned subheading row */}
                                  <div className="lesson-item-left">
                                    <i className={getIcon(innerData)}></i>
                                    <div className="lesson-item-text-group">
                                      <span className="lesson-item-title">
                                        {innerData.title}
                                      </span>
                                      {contentMin > 0 && (
                                        <span className="lesson-item-time">
                                          {formatMinutes(contentMin)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="lesson-item-right">
                                    {/* Point 13: % only for URL content */}
                                    {isUrl && (
                                      <span className="lesson-item-percent">
                                        {isActive(innerData.id) ? "100%" : "0%"}
                                      </span>
                                    )}
                                    <span
                                      className={`rbt-check ${isActive(innerData.id) ? "" : "unread"
                                        }`}
                                    >
                                      <i
                                        className={`feather-${isActive(innerData.id) ? "check-circle" : "circle"
                                          }`}
                                      ></i>
                                    </span>
                                  </div>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })
              : courseSlug ? (
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
                      <span className="topic-title-text">{data.title}</span>
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
                                pathname.startsWith(innerData.lssonLink) ? "active" : ""
                              }
                              href={`${innerData.lssonLink}`}
                              onClick={() => setActiveTab(data.id)}
                            >
                              <div className="lesson-item-left">
                                {innerData.iconHelp ? (
                                  <i className="feather-help-circle"></i>
                                ) : (
                                  <i
                                    className={`feather-${innerData.iconFile ? "file-text" : "play-circle"
                                      }`}
                                  ></i>
                                )}
                                <div className="lesson-item-text-group">
                                  <span className="lesson-item-title">
                                    {innerData.lessonName}
                                  </span>
                                  {innerData.lable && innerData.time > 0 && (
                                    <span className="lesson-item-time">
                                      {innerData.time} min
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="lesson-item-right">
                                <span
                                  className={`rbt-check ${pathname.startsWith(innerData.lssonLink)
                                      ? ""
                                      : "unread"
                                    }`}
                                >
                                  <i
                                    className={`feather-${pathname.startsWith(innerData.lssonLink)
                                        ? "check-circle"
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
              ))
            }
          </div>
        </div>
      </div>
    </>
  );
};

export default LessonSidebar;
