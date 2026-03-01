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

// Helper: is this item a playable video?
const isVideoContent = (item) => {
  const url = item?.url || item?.file?.url || item?.video_url || "";
  return !!(
    url &&
    (url.includes("youtube.com") ||
      url.includes("youtu.be") ||
      url.includes("vimeo.com") ||
      /\.(mp4|webm|ogg)$/i.test(url))
  );
};

// ── Horizontal Circular Progress (for sidebar top) ───────────
const CircleProgress = ({ percent }) => {
  const r = 34;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - (percent || 0) / 100);
  const hue = Math.round((percent || 0) * 1.2);
  const strokeColor = `hsl(${hue}, 80%, 55%)`;

  return (
    <svg viewBox="0 0 88 88" className="sidebar-cp-svg">
      <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="7" />
      <circle
        cx="44" cy="44" r={r}
        fill="none"
        stroke={strokeColor}
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform="rotate(-90 44 44)"
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
      <text x="44" y="40" textAnchor="middle" dominantBaseline="middle" className="sidebar-cp-pct">
        {percent}%
      </text>
      <text x="44" y="55" textAnchor="middle" dominantBaseline="middle" className="sidebar-cp-label">
        Complete
      </text>
    </svg>
  );
};

// ── Mini progress ring for each lesson item ───────────────────
const ItemRing = ({ percent, done }) => {
  const r = 13;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - (percent || 0) / 100);
  const color = done ? "#7c8fff" : percent > 0 ? "#f59e0b" : "rgba(255,255,255,0.2)";

  return (
    <svg viewBox="0 0 32 32" className="sidebar-item-ring">
      <circle cx="16" cy="16" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="3" />
      <circle
        cx="16" cy="16" r={r}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform="rotate(-90 16 16)"
        style={{ transition: "stroke-dashoffset 0.4s ease" }}
      />
      {done ? (
        <text x="16" y="17" textAnchor="middle" dominantBaseline="middle" className="sidebar-item-ring-tick">✓</text>
      ) : percent > 0 ? (
        <text x="16" y="17" textAnchor="middle" dominantBaseline="middle" className="sidebar-item-ring-num">{percent}%</text>
      ) : null}
    </svg>
  );
};

// ── Play/Pause button badge ───────────────────────────────────
const PlayPauseBtn = ({ isPlaying }) => (
  <span className={`sidebar-playpause ${isPlaying ? "is-playing" : ""}`}>
    {isPlaying ? (
      // Pause icon (two bars)
      <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
        <rect x="5" y="4" width="4" height="16" rx="1" />
        <rect x="15" y="4" width="4" height="16" rx="1" />
      </svg>
    ) : (
      // Play icon (triangle)
      <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
        <polygon points="5,3 19,12 5,21" />
      </svg>
    )}
  </span>
);

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
        if (matchedItem) setActiveTab(topic.id);
      });
    } else {
      LessonData.lesson.forEach((lesson) => {
        const matched = lesson.listItem.find((item) => pathname.startsWith(item.lssonLink));
        if (matched) setActiveTab(lesson.id);
      });
    }
  }, [currentContentId, pathname, courseData]);

  const topics = courseData?.topics || [];

  const totalContents = topics.reduce((acc, t) => acc + (t.course_contents?.length || 0), 0);
  const completedContents = topics.reduce((acc, t) => acc + (t.progres?.completed || 0), 0);
  const progressPercent = totalContents > 0 ? Math.round((completedContents / totalContents) * 100) : 0;

  const totalMinutesAll = topics.reduce((acc, t) =>
    acc + (t.course_contents || []).reduce((a, c) => a + toTotalMinutes(c.hours, c.minutes), 0), 0);

  const watchedMinutes = topics.reduce((acc, t) => {
    const completed = t.progres?.completed || 0;
    return acc + (t.course_contents || []).slice(0, completed)
      .reduce((a, c) => a + toTotalMinutes(c.hours, c.minutes), 0);
  }, 0);

  const remainingMinutes = totalMinutesAll - watchedMinutes;

  // Icon purely from API `icon` field — no URL guessing
  const getItemIcon = (content) => {
    const icon = content?.icon; // from API: "quiz", "document", "video", null, etc.
    if (icon === "quiz") return "feather-help-circle";
    if (icon === "document") return "feather-book-open";
    if (icon === "video") return "feather-play-circle";
    // fallback: check category slug
    const slug = content?.category?.slug;
    if (slug === "quiz") return "feather-help-circle";
    if (slug === "assignment") return "feather-file-text";
    // null / unknown → question mark
    return "feather-circle";
  };

  return (
    <>
      <div className="sidebar-dark-wrapper">

        {/* ── Progress: circle LEFT + stats RIGHT ── */}
        {courseSlug && totalContents > 0 && (
          <div className="sidebar-progress-row">
            <div className="sidebar-progress-circle">
              <CircleProgress percent={progressPercent} />
              <span className="sidebar-progress-text">Your progress</span>
            </div>
            <div className="sidebar-progress-stats">
              <div className="sidebar-stat">
                <span className="sidebar-stat-label">Total</span>
                <span className="sidebar-stat-val">{formatMinutes(totalMinutesAll)}</span>
              </div>
              <div className="sidebar-stat">
                <span className="sidebar-stat-label">Played</span>
                <span className="sidebar-stat-val">{formatMinutes(watchedMinutes)}</span>
              </div>
              <div className="sidebar-stat">
                <span className="sidebar-stat-label">Remaining</span>
                <span className="sidebar-stat-val">{formatMinutes(remainingMinutes)}</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Episode List ── */}
        <div className="sidebar-episodes">
          <h6 className="sidebar-episodes-heading">Episodes</h6>

          {topics.length > 0
            ? topics.map((data, index) => {
              const topicTotalMin = (data.course_contents || [])
                .reduce((a, c) => a + toTotalMinutes(c.hours, c.minutes), 0);
              const isTopicOpen = data.id === activeTab;

              return (
                <div className="sidebar-topic" key={index}>
                  {/* Topic header */}
                  <button
                    className={`sidebar-topic-header ${isTopicOpen ? "open" : ""}`}
                    onClick={() => setActiveTab(isTopicOpen ? false : data.id)}
                  >
                    <span className="sidebar-topic-num">{index + 1}.</span>
                    <span className="sidebar-topic-name">{data.name}</span>
                    {topicTotalMin > 0 && (
                      <span className="sidebar-topic-duration">{formatMinutes(topicTotalMin)}</span>
                    )}
                    <i className={`feather-chevron-${isTopicOpen ? "up" : "down"} sidebar-topic-chevron`}></i>
                  </button>

                  {/* Lesson items */}
                  {isTopicOpen && (
                    <div className="sidebar-items">
                      {data.course_contents?.map((innerData, innerIndex) => {
                        const active = isActive(innerData.id);
                        const isVideo = isVideoContent(innerData);
                        const contentMin = toTotalMinutes(innerData.hours, innerData.minutes);
                        const itemPercent = active ? 100 : 0;

                        return (
                          <Link
                            key={innerIndex}
                            href={`/lesson?course_slug=${courseSlug}&topic_id=${data.id}&content_id=${innerData.id}`}
                            className={`sidebar-item ${active ? "active" : ""}`}
                            onClick={() => setActiveTab(data.id)}
                          >
                            {/* Left: play/pause (video only) or API icon badge */}
                            {isVideo ? (
                              <PlayPauseBtn isPlaying={active} />
                            ) : (
                              <span className={`sidebar-type-badge ${active ? "active" : ""}`}>
                                <i className={getItemIcon(innerData)}></i>
                              </span>
                            )}

                            {/* Center: title + duration */}
                            <div className="sidebar-item-body">
                              <span className="sidebar-item-num">{index + 1}.{innerIndex + 1}</span>
                              <span className="sidebar-item-title">{innerData.title}</span>
                              {contentMin > 0 && (
                                <span className="sidebar-item-dur">{formatMinutes(contentMin)}</span>
                              )}
                            </div>

                            {/* Right: % ring (video) or icon */}
                            <div className="sidebar-item-right">
                              {isVideo ? (
                                <ItemRing percent={itemPercent} done={active} />
                              ) : (
                                <span className="sidebar-item-icon-badge">
                                  <i className={getItemIcon(innerData)}></i>
                                </span>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
            : courseSlug ? (
              <div className="sidebar-loading">Loading content...</div>
            ) : LessonData.lesson.map((data, index) => (
              <div className="sidebar-topic" key={index}>
                <button
                  className={`sidebar-topic-header ${data.id === activeTab ? "open" : ""}`}
                  onClick={() => setActiveTab(data.id === activeTab ? false : data.id)}
                >
                  <span className="sidebar-topic-name">{data.title}</span>
                  <i className={`feather-chevron-${data.id === activeTab ? "up" : "down"} sidebar-topic-chevron`}></i>
                </button>
                {data.id === activeTab && (
                  <div className="sidebar-items">
                    {data.listItem.map((innerData, innerIndex) => {
                      const active = pathname.startsWith(innerData.lssonLink);
                      return (
                        <Link
                          key={innerIndex}
                          href={innerData.lssonLink}
                          className={`sidebar-item ${active ? "active" : ""}`}
                          onClick={() => setActiveTab(data.id)}
                        >
                          <PlayPauseBtn isPlaying={active} />
                          <div className="sidebar-item-body">
                            <span className="sidebar-item-title">{innerData.lessonName}</span>
                            {innerData.time > 0 && (
                              <span className="sidebar-item-dur">{innerData.time} min</span>
                            )}
                          </div>
                          <div className="sidebar-item-right">
                            <span className={`rbt-check ${active ? "" : "unread"}`}>
                              <i className={`feather-${active ? "check-circle" : "circle"}`}></i>
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ))
          }
        </div>
      </div>
    </>
  );
};

export default LessonSidebar;
