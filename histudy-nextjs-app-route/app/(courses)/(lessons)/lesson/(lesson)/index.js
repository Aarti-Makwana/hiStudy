"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import LessonSidebar from "@/components/Lesson/LessonSidebar";
import LessonPagination from "@/components/Lesson/LessonPagination";
import LessonTop from "@/components/Lesson/LessonTop";
import { UserCoursesServices } from "@/services/User/Courses/index.service";
import Loader from "@/components/Common/Loader";
import QuizHead from "@/components/Lesson/Quiz/QuizHead";

/** Check if a URL is a playable video (YouTube / Vimeo / raw file) */
const isVideoUrl = (url) =>
  url &&
  (url.includes("youtube.com") ||
    url.includes("youtu.be") ||
    url.includes("vimeo.com") ||
    /\.(mp4|webm|ogg)$/i.test(url));

/** Check if URL is a PDF */
const isPdfUrl = (url) =>
  url && (url.toLowerCase().includes(".pdf"));

const LessonPage = () => {
  const searchParams = useSearchParams();
  const course_slug = searchParams.get("course_slug");
  const topic_id = searchParams.get("topic_id");
  const content_id = searchParams.get("content_id");

  const [lessonContent, setLessonContent] = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [prevLesson, setPrevLesson] = useState(null);
  const [nextLesson, setNextLesson] = useState(null);
  const [sidebar, setSidebar] = useState(true);

  // ── Progress tracking state ──────────────────────────────────
  const [videoProgress, setVideoProgress] = useState({
    currentTimeSec: 0,   // seconds watched so far
    totalDurationSec: 0, // total video duration in seconds
    percent: 0,          // 0–100
  });
  const videoRef = useRef(null);         // for native <video> element
  const progressTimerRef = useRef(null); // interval for periodic POST
  const lastPostedTimeRef = useRef(0);  // avoid duplicate POSTs

  // Point 9: Chat / Summary tabs
  const [activeBottomTab, setActiveBottomTab] = useState("summary");
  // Point 9: Chat filter
  const [chatFilter, setChatFilter] = useState("");

  // Point 12: PDF tab
  const [activeContentTab, setActiveContentTab] = useState("video"); // "video" | "pdf"

  /* ─── Fetch course structure ─────────────────────────────── */
  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (course_slug) {
        try {
          const res = await UserCoursesServices.UserGetCourse(course_slug);
          if (res && res.status === "success") {
            setCourseData(res.data);
          }
        } catch (error) {
          console.error("Error fetching course details:", error);
        }
      }
    };
    fetchCourseDetails();
  }, [course_slug]);

  /* ─── Prev / Next navigation ─────────────────────────────── */
  useEffect(() => {
    if (courseData && content_id) {
      const allContents = [];
      courseData.topics?.forEach((topic) => {
        topic.course_contents?.forEach((content) => {
          allContents.push({ topicId: topic.id, contentId: content.id });
        });
      });

      const currentIndex = allContents.findIndex(
        (c) => String(c.contentId) === String(content_id)
      );

      if (currentIndex !== -1) {
        if (currentIndex > 0) {
          const prev = allContents[currentIndex - 1];
          setPrevLesson(
            `/lesson?course_slug=${course_slug}&topic_id=${prev.topicId}&content_id=${prev.contentId}`
          );
        } else {
          setPrevLesson(null);
        }

        if (currentIndex < allContents.length - 1) {
          const next = allContents[currentIndex + 1];
          setNextLesson(
            `/lesson?course_slug=${course_slug}&topic_id=${next.topicId}&content_id=${next.contentId}`
          );
        } else {
          setNextLesson(null);
        }
      }
    }
  }, [courseData, content_id, course_slug]);

  /* ─── Helpers: seconds ↔ h/m/s ─────────────────────────────── */
  const secToHMS = (totalSec) => {
    const s = Math.floor(totalSec);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}h ${m}m ${sec}s`;
    if (m > 0) return `${m}m ${sec}s`;
    return `${sec}s`;
  };

  /* ─── POST progress to API ──────────────────────────────────── */
  const postProgress = useCallback(async (lessonId, currentTimeSec) => {
    if (!lessonId || currentTimeSec === lastPostedTimeRef.current) return;
    try {
      lastPostedTimeRef.current = currentTimeSec;
      await UserCoursesServices.TrackLessonProgress(lessonId, currentTimeSec);
    } catch (_) {
      // silent fail — don't interrupt playback
    }
  }, []);

  /* ─── Fetch lesson content + load saved progress ───────────── */
  useEffect(() => {
    // clear old progress interval when content changes
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    setVideoProgress({ currentTimeSec: 0, totalDurationSec: 0, percent: 0 });
    lastPostedTimeRef.current = 0;

    const fetchLessonContent = async () => {
      if (topic_id && content_id) {
        setLoading(true);
        try {
          const [contentRes, progressRes] = await Promise.allSettled([
            UserCoursesServices.UserGetSingleCourseTopicContent(topic_id, content_id),
            UserCoursesServices.GetLessonProgress(content_id),
          ]);

          if (contentRes.status === "fulfilled" && contentRes.value?.status === "success") {
            const data = contentRes.value.data;
            setLessonContent(data);
            setActiveContentTab("video");

            // pre-fill total duration from API data (hours + minutes + seconds)
            const totalSec =
              (data.hours || 0) * 3600 +
              (data.minutes || 0) * 60 +
              (data.seconds || 0);
            setVideoProgress((prev) => ({ ...prev, totalDurationSec: totalSec }));
          }

          if (progressRes.status === "fulfilled" && progressRes.value?.status === "success") {
            const prog = progressRes.value.data;
            // API returns: { current_time, total_duration, percent, ... }
            const savedTime = prog?.current_time || 0;
            const savedTotal = prog?.total_duration || 0;
            const savedPercent = prog?.percent || 0;
            setVideoProgress({
              currentTimeSec: savedTime,
              totalDurationSec: savedTotal,
              percent: savedPercent,
            });
            lastPostedTimeRef.current = savedTime;

            // seek native video to saved position once it loads
            if (videoRef.current && savedTime > 0) {
              videoRef.current.currentTime = savedTime;
            }
          }
        } catch (error) {
          console.error("Error fetching lesson content:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchLessonContent();

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic_id, content_id]);

  /* ─── Render the main lesson asset (Point 6 – video fit) ─── */
  const renderLessonAsset = () => {
    const assetUrl =
      lessonContent?.file?.url || lessonContent?.url || lessonContent?.video_url;

    if (!assetUrl) {
      return (
        <div className="rbt-shadow-box text-center p--50">
          <h5>No content available for this lesson.</h5>
        </div>
      );
    }

    // PDF
    if (
      lessonContent?.icon === "document" ||
      isPdfUrl(assetUrl)
    ) {
      // Handled via tab
      return (
        <div className="lesson-pdf-viewer">
          <iframe
            src={`https://docs.google.com/viewer?url=${encodeURIComponent(assetUrl)}&embedded=true`}
            className="lesson-pdf-iframe"
            title="Document Preview"
          ></iframe>
        </div>
      );
    }

    // Vimeo (Point 6 – aspect-ratio)
    if (assetUrl.includes("vimeo.com")) {
      const vimeoId = assetUrl.split("/").pop();
      return (
        <div className="lesson-video-wrapper">
          <iframe
            src={`https://player.vimeo.com/video/${vimeoId}?h=0&title=0&byline=0&portrait=0`}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title="Vimeo Video"
          ></iframe>
        </div>
      );
    }

    // YouTube (Point 6 – aspect-ratio)
    if (assetUrl.includes("youtube.com") || assetUrl.includes("youtu.be")) {
      let youtubeId = "";
      if (assetUrl.includes("v=")) {
        youtubeId = assetUrl.split("v=")[1].split("&")[0];
      } else if (assetUrl.includes("youtu.be/")) {
        youtubeId = assetUrl.split("youtu.be/")[1].split("?")[0];
      } else {
        youtubeId = assetUrl.split("/").pop();
      }
      return (
        <div className="lesson-video-wrapper">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}`}
            allowFullScreen
            title="YouTube Video"
          ></iframe>
        </div>
      );
    }

    // Raw / HTML5 Video — attach ref + events for progress tracking
    return (
      <div className="lesson-video-wrapper">
        <video
          ref={videoRef}
          controls
          src={assetUrl}
          onLoadedMetadata={(e) => {
            const dur = e.target.duration || 0;
            setVideoProgress((prev) => ({
              ...prev,
              totalDurationSec: prev.totalDurationSec > 0 ? prev.totalDurationSec : dur,
            }));
            // restore saved position
            if (lastPostedTimeRef.current > 0) {
              e.target.currentTime = lastPostedTimeRef.current;
            }
          }}
          onTimeUpdate={(e) => {
            const cur = e.target.currentTime;
            const dur = e.target.duration || videoProgress.totalDurationSec || 1;
            const pct = Math.min(100, Math.round((cur / dur) * 100));
            setVideoProgress({ currentTimeSec: cur, totalDurationSec: dur, percent: pct });
          }}
          onPause={(e) => {
            postProgress(content_id, e.target.currentTime);
          }}
          onEnded={(e) => {
            postProgress(content_id, e.target.duration || e.target.currentTime);
          }}
        >
        </video>
      </div>
    );
  };

  /* ─── Derived flags ──────────────────────────────────────── */
  const assetUrl =
    lessonContent?.file?.url || lessonContent?.url || lessonContent?.video_url;
  const showChatSummary = !!(assetUrl && isVideoUrl(assetUrl));
  const showPdfTab = !!(
    lessonContent?.icon === "document" || isPdfUrl(assetUrl)
  );
  const isQuiz =
    lessonContent?.category?.slug === "quiz" ||
    (lessonContent?.course_quizzes && lessonContent.course_quizzes.length > 0);

  /* ─── Render ─────────────────────────────────────────────── */
  return (
    <>
      {/* Point 14: overlay backdrop (mobile + toggled open on overlay) */}
      {sidebar && (
        <div
          className="lesson-sidebar-overlay"
          onClick={() => setSidebar(false)}
        />
      )}

      <div className="rbt-lesson-area bg-color-white">
        <div className={`rbt-lesson-content-wrapper ${sidebar ? "" : "sidebar-hide"}`}>

          {/* ── LEFT SIDEBAR (Point 8: independent scroll) ── */}
          <div className={`rbt-lesson-leftsidebar ${sidebar ? "" : "sidebar-hide"}`}>
            <LessonSidebar courseData={courseData} courseSlug={course_slug} />
          </div>

          {/* ── RIGHT CONTENT (Point 8: independent scroll) ── */}
          <div className="rbt-lesson-rightsidebar overflow-hidden lesson-video">

            {/* Top bar (Points 1, 5, 11) */}
            <LessonTop
              sidebar={sidebar}
              setSidebar={() => setSidebar(!sidebar)}
              courseTitle={courseData?.title}
              courseSlug={course_slug}
            />

            {loading ? (
              <div className="lesson-right-scroll">
                <Loader />
              </div>
            ) : (
              <div className="lesson-right-scroll">
                <div className="lesson-main-content">

                  {/* ─── QUIZ ───────────────────────────── */}
                  {isQuiz ? (
                    <form id="quiz-form" className="quiz-form-wrapper p--30">
                      <div className="question">
                        <QuizHead
                          questionNo={1}
                          totalQuestion={lessonContent?.course_quizzes?.length || 0}
                          attemp={1}
                        />
                        {lessonContent?.course_quizzes?.map((quiz, qIndex) => (
                          <div key={quiz.id} className="rbt-single-quiz mb--40">
                            <div className="d-flex align-items-start">
                              <h4 className="mb--0 mr--15">{qIndex + 1}.</h4>
                              <div
                                className="question-title-content"
                                dangerouslySetInnerHTML={{ __html: quiz.question }}
                              />
                            </div>
                            <div className="row g-3 mt--10">
                              {quiz.options?.map((option) => (
                                <div className="col-lg-6" key={option.id}>
                                  {quiz.type === "multiple" ? (
                                    <p className="rbt-checkbox-wrapper">
                                      <input
                                        id={`option-${option.id}`}
                                        name={`quiz-${quiz.id}`}
                                        type="checkbox"
                                      />
                                      <label htmlFor={`option-${option.id}`}>
                                        {option.option_text}
                                      </label>
                                    </p>
                                  ) : (
                                    <div className="rbt-form-check">
                                      <input
                                        className="form-check-input"
                                        type="radio"
                                        name={`quiz-${quiz.id}`}
                                        id={`option-${option.id}`}
                                      />
                                      <label
                                        className="form-check-label"
                                        htmlFor={`option-${option.id}`}
                                      >
                                        {option.option_text}
                                      </label>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                        {lessonContent?.course_quizzes?.length > 0 && (
                          <div className="rbt-quiz-btn-wrapper mt--30">
                            <button className="rbt-btn btn-gradient btn-sm" type="button">
                              Submit Quiz
                            </button>
                          </div>
                        )}
                      </div>
                    </form>
                  ) : (
                    <>
                      {/* ─── PDF / Video tab switcher (Point 12) ─── */}
                      {showPdfTab && (
                        <div className="lesson-content-tabs">
                          <button
                            className={`lesson-content-tab-btn ${activeContentTab === "video" ? "active" : ""}`}
                            onClick={() => setActiveContentTab("video")}
                          >
                            <i className="feather-play-circle"></i> Video
                          </button>
                          <button
                            className={`lesson-content-tab-btn ${activeContentTab === "pdf" ? "active" : ""}`}
                            onClick={() => setActiveContentTab("pdf")}
                          >
                            <i className="feather-file-text"></i> PDF
                          </button>
                        </div>
                      )}

                      {/* ─── Main asset ─── */}
                      {activeContentTab === "pdf" && showPdfTab
                        ? (
                          <div className="lesson-pdf-viewer">
                            <iframe
                              src={`https://docs.google.com/viewer?url=${encodeURIComponent(assetUrl)}&embedded=true`}
                              className="lesson-pdf-iframe"
                              title="Document Preview"
                            ></iframe>
                          </div>
                        )
                        : renderLessonAsset()
                      }

                      {/* ─── Video Progress Bar (shown for video URLs) ─── */}
                      {showChatSummary && videoProgress.totalDurationSec > 0 && (
                        <div className="lesson-video-progress-bar-wrapper">
                          <div className="lesson-vp-bar-track">
                            <div
                              className="lesson-vp-bar-fill"
                              style={{ width: `${videoProgress.percent}%` }}
                            />
                          </div>
                          <div className="lesson-vp-stats">
                            <span className="lesson-vp-stat">
                              <i className="feather-check-circle"></i>
                              <strong>{videoProgress.percent}%</strong> watched
                            </span>
                            <span className="lesson-vp-stat">
                              <i className="feather-clock"></i>
                              {secToHMS(videoProgress.currentTimeSec)} watched
                            </span>
                            <span className="lesson-vp-stat">
                              <i className="feather-loader"></i>
                              {secToHMS(Math.max(0, videoProgress.totalDurationSec - videoProgress.currentTimeSec))} remaining
                            </span>
                            <span className="lesson-vp-stat lesson-vp-total">
                              <i className="feather-film"></i>
                              Total: {secToHMS(videoProgress.totalDurationSec)}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* ─── Chat / Summary tabs (Points 9, 10) ─── */}
                      {showChatSummary && (
                        <div className="lesson-bottom-tabs-wrapper">
                          <div className="lesson-bottom-tab-bar">
                            <button
                              className={`lesson-bottom-tab-btn ${activeBottomTab === "chat" ? "active" : ""}`}
                              onClick={() => setActiveBottomTab("chat")}
                            >
                              <i className="feather-message-circle"></i> Chat
                            </button>
                            <button
                              className={`lesson-bottom-tab-btn ${activeBottomTab === "summary" ? "active" : ""}`}
                              onClick={() => setActiveBottomTab("summary")}
                            >
                              <i className="feather-align-left"></i> Summary
                            </button>
                          </div>

                          <div className="lesson-bottom-tab-content">
                            {activeBottomTab === "chat" && (
                              <div className="lesson-chat-area">
                                {/* Chat filter (Point 9) */}
                                <div className="lesson-chat-filter-bar">
                                  <i className="feather-filter"></i>
                                  <input
                                    type="text"
                                    placeholder="Filter messages..."
                                    value={chatFilter}
                                    onChange={(e) => setChatFilter(e.target.value)}
                                    className="lesson-chat-filter-input"
                                  />
                                </div>
                                <div className="lesson-chat-messages">
                                  <p className="lesson-chat-empty">No messages yet. Start the conversation!</p>
                                </div>
                                <div className="lesson-chat-input-bar">
                                  <input
                                    type="text"
                                    placeholder="Type a message..."
                                    className="lesson-chat-input"
                                  />
                                  <button className="lesson-chat-send-btn">
                                    <i className="feather-send"></i>
                                  </button>
                                </div>
                              </div>
                            )}

                            {activeBottomTab === "summary" && (
                              <div className="lesson-summary-area">
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html:
                                      lessonContent?.description ||
                                      lessonContent?.summary ||
                                      "No summary available for this lesson.",
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Description for non-video content (PDF / no URL) */}
                      {!showChatSummary && (
                        <div className="section-title mt--30 p--30">
                          {lessonContent?.topic?.name && (
                            <span className="subtitle-5 mb--10 d-block">
                              {lessonContent.topic.name}
                            </span>
                          )}
                          <h4 className="title">{lessonContent?.title || "About Lesson"}</h4>
                          <div className="rbt-course-meta mb--20">
                            {lessonContent?.duration && (
                              <div className="course-meta">
                                <i className="feather-clock"></i>
                                <span>{lessonContent.duration}</span>
                              </div>
                            )}
                            {lessonContent?.category?.name && (
                              <div className="course-meta">
                                <i className="feather-layers"></i>
                                <span>{lessonContent.category.name}</span>
                              </div>
                            )}
                          </div>
                          <div
                            dangerouslySetInnerHTML={{
                              __html:
                                lessonContent?.description ||
                                lessonContent?.summary ||
                                "No description available for this lesson.",
                            }}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* ── Pagination (Point 15: keep as-is) ── */}
                <LessonPagination urlPrev={prevLesson} urlNext={nextLesson} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LessonPage;
