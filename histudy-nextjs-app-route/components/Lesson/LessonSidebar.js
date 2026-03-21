"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";

import LessonData from "../../data/lesson.json";

// Helper: convert hours/minutes/seconds to total seconds
const toTotalSeconds = (h, m, s) => (h || 0) * 3600 + (m || 0) * 60 + (s || 0);

// Helper: format total seconds to "Xh Ym Zs"
const formatTime = (totalSec) => {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = Math.floor(totalSec % 60);
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

// Helper: is this item a playable video? (uses API `icon` field)
const isVideoContent = (item) => {
  return item?.icon === "video";
};

// ── Premium Circular Progress (for sidebar top) ───────────
const CircleProgress = ({ percent }) => {
  const r = 34;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - (percent || 0) / 100);
  const hue = 260; // Purple hue
  const strokeColor = `hsl(${hue}, 70%, 65%)`;

  return (
    <div className="sidebar-progress-circle-wrap">
      <svg viewBox="0 0 88 88" className="sidebar-cp-svg">
        <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        <circle
          cx="44" cy="44" r={r}
          fill="none"
          stroke={strokeColor}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 44 44)"
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)" }}
        />
        <text x="44" y="46" textAnchor="middle" dominantBaseline="middle" className="sidebar-cp-pct">
          {percent}%
        </text>
      </svg>
      <span className="sidebar-progress-label">Your progress</span>
    </div>
  );
};

// ── Mini circular progress ring with gradient (for each lesson item) ──
const ItemRing = ({ percent }) => {
  const r = 13;
  const circ = 2 * Math.PI * r;
  const p = Math.min(100, Math.max(0, Math.round(percent || 0)));
  const isComplete = p >= 95;
  const displayP = isComplete ? 100 : p; // fill ring fully when ≥ 95%
  const offset = circ * (1 - displayP / 100);
  const gradId = `ring-grad-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <svg viewBox="0 0 36 36" className={`sidebar-item-ring ${isComplete ? "complete" : ""}`}>
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          {isComplete ? (
            <>
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#16a34a" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#642ec3" />
              <stop offset="100%" stopColor="#7b54dc" />
            </>
          )}
        </linearGradient>
      </defs>
      {/* Background track */}
      <circle cx="18" cy="18" r={r} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="3" />
      {/* Filled arc with gradient */}
      {displayP > 0 && (
        <circle
          cx="18" cy="18" r={r}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 18 18)"
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      )}
      {/* Checkmark for ≥ 95%, otherwise percentage label */}
      {isComplete ? (
        <path
          d="M12.5 18.5l3 3 8-8"
          fill="none"
          stroke="#22c55e"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <text
          x="18" y="18.5"
          textAnchor="middle"
          dominantBaseline="middle"
          className="sidebar-item-ring-pct"
        >
          {p}%
        </text>
      )}
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

const LessonSidebar = ({ courseData, courseSlug, currentVideoProgress, lessonProgressMap = {}, quizAttempts = [], submissionContents = [] }) => {
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
  const totalSecondsAll = topics.reduce((acc, t) =>
    acc + (t.course_contents || []).reduce((a, c) => a + toTotalSeconds(c.hours, c.minutes, c.seconds), 0), 0);

  const watchedSeconds = topics.reduce((acc, t) => {
    return acc + (t.course_contents || []).reduce((a, c) => {
      const duration = toTotalSeconds(c.hours, c.minutes, c.seconds);
      if (duration === 0) return a;
      const active = currentContentId === String(c.id);
      const isVideo = isVideoContent(c);
      const apiPercent = lessonProgressMap[c.id] ?? c.progres?.percent ?? c.progress?.percent ?? 0;
      const itemPercent = (active && isVideo)
        ? (typeof currentVideoProgress !== "undefined" ? currentVideoProgress : apiPercent)
        : apiPercent;
      return a + (duration * (itemPercent / 100));
    }, 0);
  }, 0);

  const remainingSeconds = Math.max(0, totalSecondsAll - watchedSeconds);
  const progressPercent = totalSecondsAll > 0 ? Math.round((watchedSeconds / totalSecondsAll) * 100) : 0;

  // Icon purely from API `icon` field
  const getItemIcon = (content) => {
    const icon = content?.icon; // from API: "quiz", "editor", "video", etc.
    if (icon === "quiz") return "feather-help-circle";
    if (icon === "document") return "feather-book-open";
    if (icon === "video") return "feather-play-circle";
    if (icon === "editor") return "feather-edit";
    // fallback: check category slug
    const slug = content?.category?.slug;
    if (slug === "quiz") return "feather-help-circle";
    if (slug === "assignment") return "feather-file-text";
    if (slug === "practice-problem") return "feather-code";
    if (slug === "project") return "feather-folder";
    // null / unknown → generic circle
    return "feather-circle";
  };

  const isItemComplete = (item) => {
    // Video: check percentage
    if (isVideoContent(item)) {
      const p = lessonProgressMap[item.id] ?? item.progres?.percent ?? 0;
      return p >= 95;
    }
    // Quiz: check quizAttempts
    const icon = item?.icon;
    const catSlug = item?.category?.slug;
    if (icon === "quiz" || catSlug === "quiz") {
      const quiz = quizAttempts.find(q => String(q.id) === String(item.id));
      return (quiz?.quiz_attempts_count || 0) > 0;
    }
    // Assignment/Project: check submissionContents
    if (catSlug === "assignment" || catSlug === "project" || icon === "editor") {
      const sub = submissionContents.find(s => String(s.id) === String(item.id));
      return !!sub?.latest_submission;
    }
    return false;
  };

  return (
    <>
      <div className="sidebar-dark-wrapper">

        {/* ── Progress Card: circle LEFT | divider | stats RIGHT ── */}
        {courseSlug && totalContents > 0 && (
          <div className="sidebar-progress-card">
            <div className="sidebar-progress-left">
              <CircleProgress percent={progressPercent} />
            </div>

            <div className="sidebar-progress-divider" />

            <div className="sidebar-progress-stats">
              <div className="sidebar-stat">
                <span className="sidebar-stat-label text-white">Total: <span className="text-primary">{formatTime(totalSecondsAll)}</span></span>
              </div>
              <div className="sidebar-stat">
                <span className="sidebar-stat-label text-white">Played: <span className="text-secondary">{formatTime(watchedSeconds)}</span></span>
              </div>
              <div className="sidebar-stat">
                <span className="sidebar-stat-label text-white">Remaining: <span className="text-accent">{formatTime(remainingSeconds)}</span></span>
              </div>
            </div>
          </div>
        )}

        {/* ── Episode List ── */}
        <div className="sidebar-episodes">
          <h6 className="sidebar-episodes-heading">Episodes</h6>

          {topics.length > 0
            ? topics.map((data, index) => {
              const topicTotalSec = (data.course_contents || [])
                .reduce((a, c) => a + toTotalSeconds(c.hours, c.minutes, c.seconds), 0);
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
                    {topicTotalSec > 0 && (
                      <span className="sidebar-topic-duration">{formatTime(topicTotalSec)}</span>
                    )}
                    <i className={`feather-chevron-${isTopicOpen ? "up" : "down"} sidebar-topic-chevron`}></i>
                  </button>

                  {/* Lesson items */}
                  {isTopicOpen && (
                    <div className="sidebar-items">
                      {data.course_contents?.map((innerData, innerIndex) => {
                        const active = isActive(innerData.id);
                        const isVideo = isVideoContent(innerData);
                        const contentSec = toTotalSeconds(innerData.hours, innerData.minutes, innerData.seconds);
                        const apiPercent = lessonProgressMap[innerData.id] ?? innerData.progres?.percent ?? innerData.progress?.percent ?? 0;
                        const itemPercent = (active && isVideo)
                          ? (typeof currentVideoProgress !== "undefined" ? currentVideoProgress : apiPercent)
                          : apiPercent;

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
                              <span className={`sidebar-type-badge ${active ? "active" : ""} ${isItemComplete(innerData) ? "complete" : ""}`}>
                                <i className={isItemComplete(innerData) ? "feather-check-circle text-success" : getItemIcon(innerData)}></i>
                              </span>
                            )}

                            {/* Center: title + duration */}
                            <div className="sidebar-item-body">
                              <span className="sidebar-item-num">{index + 1}.{innerIndex + 1}</span>
                              <span className="sidebar-item-title">{innerData.title}</span>
                              {contentSec > 0 && (
                                <span className="sidebar-item-dur">{formatTime(contentSec)}</span>
                              )}
                            </div>

                            {/* Right: progress ring for video items only */}
                            {isVideo && (
                              <div className="sidebar-item-right">
                                <ItemRing percent={itemPercent} />
                              </div>
                            )}
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
