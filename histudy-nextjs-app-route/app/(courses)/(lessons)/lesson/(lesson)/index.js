"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import LessonSidebar from "@/components/Lesson/LessonSidebar";
import LessonPagination from "@/components/Lesson/LessonPagination";
import { UserCoursesServices } from "@/services/User/Courses/index.service";
import Loader from "@/components/Common/Loader";
import QuizHead from "@/components/Lesson/Quiz/QuizHead";
import QuizPlayer from "@/components/Lesson/QuizPlayer";

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

/* ─── Load YouTube IFrame API script once ───────────────────── */
let ytApiReady = false;
let ytApiPromise = null;
const loadYouTubeApi = () => {
  if (ytApiReady) return Promise.resolve();
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise((resolve) => {
    if (typeof window !== "undefined" && window.YT && window.YT.Player) {
      ytApiReady = true;
      resolve();
      return;
    }
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScript = document.getElementsByTagName("script")[0];
    firstScript.parentNode.insertBefore(tag, firstScript);
    window.onYouTubeIframeAPIReady = () => {
      ytApiReady = true;
      resolve();
    };
  });
  return ytApiPromise;
};

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
  const lastPostedTimeRef = useRef(0);   // avoid duplicate POSTs

  // ── YouTube / Vimeo player refs ──────────────────────────────
  const ytPlayerRef = useRef(null);       // YT.Player instance
  const vimeoPlayerRef = useRef(null);    // Vimeo Player instance
  const ytTimerRef = useRef(null);        // YT polling interval
  const iframeIdRef = useRef("lesson-iframe-" + Date.now());

  // Point 9: Chat / Summary tabs
  const [activeBottomTab, setActiveBottomTab] = useState("summary");
  // Point 9: Chat filter
  const [chatFilter, setChatFilter] = useState("");

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

  /* ─── Helpers: seconds → h/m/s ─────────────────────────────── */
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
      console.log(`[LessonPage] Sending progress → lesson_id: ${lessonId}, current_time: ${currentTimeSec}s`);
      await UserCoursesServices.TrackLessonProgress(lessonId, currentTimeSec);
    } catch (err) {
      console.error("[LessonPage] postProgress error:", err);
    }
  }, []);

  /* ─── Helper: get current time from any active player ────── */
  const getCurrentPlayerTime = useCallback(() => {
    // Native video
    if (videoRef.current && !videoRef.current.paused) {
      return videoRef.current.currentTime;
    }
    if (videoRef.current) {
      return videoRef.current.currentTime;
    }
    // YouTube — getCurrentTime is synchronous
    if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === "function") {
      return ytPlayerRef.current.getCurrentTime();
    }
    // Vimeo time is tracked in state
    return videoProgress.currentTimeSec;
  }, [videoProgress.currentTimeSec]);

  /* ─── Cleanup helper: destroy YT/Vimeo players ──────────── */
  const destroyPlayers = useCallback(() => {
    if (ytTimerRef.current) {
      clearInterval(ytTimerRef.current);
      ytTimerRef.current = null;
    }
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    if (ytPlayerRef.current) {
      try { ytPlayerRef.current.destroy(); } catch (_) { }
      ytPlayerRef.current = null;
    }
    if (vimeoPlayerRef.current) {
      try { vimeoPlayerRef.current.destroy(); } catch (_) { }
      vimeoPlayerRef.current = null;
    }
  }, []);

  /* ─── Fetch lesson content + load saved progress ───────────── */
  useEffect(() => {
    // ── ON CONTENT CHANGE: send progress of previous video first ──
    const prevTime = getCurrentPlayerTime();
    const prevContentId = lastPostedTimeRef._contentId;
    if (prevContentId && prevTime > 0) {
      console.log(`[LessonPage] Video switched! Sending previous video (${prevContentId}) progress: ${prevTime}s`);
      UserCoursesServices.TrackLessonProgress(prevContentId, prevTime).catch(() => { });
    }

    // ── Cleanup old players ──
    destroyPlayers();
    setVideoProgress({ currentTimeSec: 0, totalDurationSec: 0, percent: 0 });
    lastPostedTimeRef.current = 0;
    lastPostedTimeRef._contentId = content_id; // track which content we're on

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

            // pre-fill total duration from API data (hours + minutes + seconds)
            const totalSec =
              (data.hours || 0) * 3600 +
              (data.minutes || 0) * 60 +
              (data.seconds || 0);
            setVideoProgress((prev) => ({ ...prev, totalDurationSec: totalSec }));
          }

          if (progressRes.status === "fulfilled" && progressRes.value?.status === "success") {
            const prog = progressRes.value.data;
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
      // Send final progress on unmount / content switch
      if (videoRef.current && content_id) {
        postProgress(content_id, videoRef.current.currentTime);
      }
      destroyPlayers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic_id, content_id]);

  /* ─── Init Vimeo Player after iframe renders ───────────────── */
  const initVimeoPlayer = useCallback((iframeEl) => {
    if (!iframeEl) return;
    import("@vimeo/player").then((mod) => {
      const VimeoPlayer = mod.default;
      const player = new VimeoPlayer(iframeEl);
      vimeoPlayerRef.current = player;

      player.getDuration().then((dur) => {
        setVideoProgress((prev) => ({
          ...prev,
          totalDurationSec: dur > 0 ? dur : prev.totalDurationSec,
        }));
      });

      // Seek to saved position
      if (lastPostedTimeRef.current > 0) {
        player.setCurrentTime(lastPostedTimeRef.current);
      }

      player.on("timeupdate", (data) => {
        const cur = data.seconds;
        const dur = data.duration || 1;
        const pct = Math.min(100, Math.round((cur / dur) * 100));
        setVideoProgress({ currentTimeSec: cur, totalDurationSec: dur, percent: pct });
      });

      player.on("pause", (data) => {
        console.log(`[LessonPage][Vimeo] Paused at ${data.seconds}s`);
        postProgress(content_id, data.seconds);
      });

      player.on("ended", (data) => {
        console.log(`[LessonPage][Vimeo] Ended at ${data.seconds}s`);
        postProgress(content_id, data.duration || data.seconds);
      });

      player.on("play", () => {
        console.log("[LessonPage][Vimeo] Playing");
      });
    });
  }, [content_id, postProgress]);

  /* ─── Init YouTube Player after iframe renders ─────────────── */
  const initYouTubePlayer = useCallback((iframeEl) => {
    if (!iframeEl) return;
    loadYouTubeApi().then(() => {
      const player = new window.YT.Player(iframeEl, {
        events: {
          onReady: (evt) => {
            const dur = evt.target.getDuration();
            if (dur > 0) {
              setVideoProgress((prev) => ({
                ...prev,
                totalDurationSec: dur,
              }));
            }
            // Seek to saved position
            if (lastPostedTimeRef.current > 0) {
              evt.target.seekTo(lastPostedTimeRef.current, true);
            }
          },
          onStateChange: (evt) => {
            const state = evt.data;
            const cur = evt.target.getCurrentTime();
            const dur = evt.target.getDuration() || 1;
            const pct = Math.min(100, Math.round((cur / dur) * 100));

            // PLAYING
            if (state === window.YT.PlayerState.PLAYING) {
              console.log("[LessonPage][YouTube] Playing");
              // Start polling for time updates
              if (!ytTimerRef.current) {
                ytTimerRef.current = setInterval(() => {
                  if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === "function") {
                    const c = ytPlayerRef.current.getCurrentTime();
                    const d = ytPlayerRef.current.getDuration() || 1;
                    const p = Math.min(100, Math.round((c / d) * 100));
                    setVideoProgress({ currentTimeSec: c, totalDurationSec: d, percent: p });
                  }
                }, 1000);
              }
            }

            // PAUSED
            if (state === window.YT.PlayerState.PAUSED) {
              console.log(`[LessonPage][YouTube] Paused at ${cur}s`);
              setVideoProgress((prev) => ({ ...prev, currentTimeSec: cur, percent: pct }));
              postProgress(content_id, cur);
              if (ytTimerRef.current) {
                clearInterval(ytTimerRef.current);
                ytTimerRef.current = null;
              }
            }

            // ENDED
            if (state === window.YT.PlayerState.ENDED) {
              console.log(`[LessonPage][YouTube] Ended at ${dur}s`);
              setVideoProgress({ currentTimeSec: dur, totalDurationSec: dur, percent: 100 });
              postProgress(content_id, dur);
              if (ytTimerRef.current) {
                clearInterval(ytTimerRef.current);
                ytTimerRef.current = null;
              }
            }
          },
        },
      });
      ytPlayerRef.current = player;
    });
  }, [content_id, postProgress]);

  /* ─── Render the main lesson asset ─── */
  const renderLessonAsset = () => {
    const assetUrl =
      lessonContent?.file?.url || lessonContent?.url || lessonContent?.video_url;

    // ── HTML / rich-text content (no URL, but has description/body/content) ──
    const htmlBody =
      lessonContent?.body || lessonContent?.content || lessonContent?.html_content;
    if (!assetUrl && htmlBody) {
      return (
        <div
          className="lesson-html-content"
          dangerouslySetInnerHTML={{ __html: htmlBody }}
        />
      );
    }

    if (!assetUrl) {
      // Last fallback: try description as HTML
      const desc = lessonContent?.description || lessonContent?.summary;
      if (desc) {
        return (
          <div
            className="lesson-html-content"
            dangerouslySetInnerHTML={{ __html: desc }}
          />
        );
      }
      return (
        <div className="rbt-shadow-box text-center p--50">
          <h5>No content available for this lesson.</h5>
        </div>
      );
    }

    // PDF — render viewer directly
    if (lessonContent?.icon === "document" || isPdfUrl(assetUrl)) {
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

    // Vimeo
    if (assetUrl.includes("vimeo.com")) {
      const vimeoId = assetUrl.split("/").pop();
      return (
        <div className="lesson-video-wrapper">
          <iframe
            id={iframeIdRef.current}
            src={`https://player.vimeo.com/video/${vimeoId}?h=0&title=0&byline=0&portrait=0`}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title="Vimeo Video"
            ref={(el) => {
              if (el && !vimeoPlayerRef.current) {
                initVimeoPlayer(el);
              }
            }}
          ></iframe>
        </div>
      );
    }

    // YouTube
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
            id={iframeIdRef.current}
            src={`https://www.youtube.com/embed/${youtubeId}?enablejsapi=1`}
            allowFullScreen
            title="YouTube Video"
            ref={(el) => {
              if (el && !ytPlayerRef.current) {
                initYouTubePlayer(el);
              }
            }}
          ></iframe>
        </div>
      );
    }

    // Raw / HTML5 Video
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
            if (lastPostedTimeRef.current > 0) {
              e.target.currentTime = lastPostedTimeRef.current;
            }
          }}
          onPlay={() => {
            console.log("[LessonPage][Native] Playing");
            if (!progressTimerRef.current) {
              progressTimerRef.current = setInterval(() => {
                if (videoRef.current && !videoRef.current.paused) {
                  postProgress(content_id, videoRef.current.currentTime);
                }
              }, 5000); // Posts every 5 seconds while playing
            }
          }}
          onTimeUpdate={(e) => {
            const cur = e.target.currentTime;
            const dur = e.target.duration || videoProgress.totalDurationSec || 1;
            const pct = Math.min(100, Math.round((cur / dur) * 100));
            setVideoProgress({ currentTimeSec: cur, totalDurationSec: dur, percent: pct });
          }}
          onPause={(e) => {
            console.log(`[LessonPage][Native] Paused at ${e.target.currentTime}s`);
            postProgress(content_id, e.target.currentTime);
          }}
          onEnded={(e) => {
            console.log(`[LessonPage][Native] Ended at ${e.target.duration}s`);
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
  // Show progress bar for any video (also check icon field)
  const isVideoContent = !!(
    (assetUrl && isVideoUrl(assetUrl)) || lessonContent?.icon === "video"
  );
  const showChatSummary = isVideoContent;
  const isQuiz =
    lessonContent?.category?.slug === "quiz" ||
    (lessonContent?.course_quizzes && lessonContent.course_quizzes.length > 0);

  // Chat disabled check
  const chatVal = courseData?.chat ?? "";
  const isChatDisabled =
    String(chatVal).toLowerCase() === "no" ||
    String(chatVal).toLowerCase() === "disabled";

  /* ─── Render ─────────────────────────────────────────────── */
  return (
    <>
      {/* overlay backdrop (mobile + toggled open on overlay) */}
      {sidebar && (
        <div
          className="lesson-sidebar-overlay"
          onClick={() => setSidebar(false)}
        />
      )}

      <div className="rbt-lesson-area bg-color-white">
        <div className={`rbt-lesson-content-wrapper ${sidebar ? "" : "sidebar-hide"}`}>

          {/* ── LEFT SIDEBAR ── */}
          <div className={`rbt-lesson-leftsidebar ${sidebar ? "" : "sidebar-hide"}`}>
            <LessonSidebar
              courseData={courseData}
              courseSlug={course_slug}
              currentVideoProgress={videoProgress?.percent}
            />
          </div>

          {/* ── RIGHT CONTENT ── */}
          <div className="rbt-lesson-rightsidebar overflow-hidden lesson-video" style={{ position: "relative" }}>

            {/* ── Floating controls ── */}
            <div className="lesson-float-controls">
              <Link
                href={course_slug ? `/course-details/${course_slug}` : "/course-details"}
                className="lesson-float-btn"
                title="Back to Course"
              >
                <i className="feather-arrow-left"></i>
              </Link>
              <button
                className="lesson-float-btn"
                title="Toggle Sidebar"
                onClick={() => setSidebar(!sidebar)}
              >
                <i className="feather-menu"></i>
              </button>
            </div>

            {loading ? (
              <div className="lesson-right-scroll">
                <Loader />
              </div>
            ) : (
              <div className="lesson-right-scroll">
                <div className="lesson-main-content">

                  {/* ─── QUIZ ─────────────────────────────────────────── */}
                  {isQuiz ? (() => {
                    const quizzes = lessonContent?.course_quizzes || [];
                    return <QuizPlayer quizzes={quizzes} />;
                  })() : (
                    <>
                      {/* ─── Main asset (PDF/HTML/Video all auto-detected) ─── */}
                      {renderLessonAsset()}

                      {/* ─── Video Progress Bar + Percentage ─── */}
                      {isVideoContent && videoProgress.totalDurationSec > 0 && (
                        <div className="lesson-video-progress-bar-wrapper">
                          <div className="lesson-vp-bar-track">
                            <div
                              className="lesson-vp-bar-fill"
                              style={{ width: `${videoProgress.percent}%` }}
                            />
                          </div>
                          <div className="lesson-vp-stats">
                            <span className="lesson-vp-stat lesson-vp-percent-badge">
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

                      {/* ─── Chat / Summary tabs ─── */}
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
                                {isChatDisabled ? (
                                  /* ── Chat disabled by backend ── */
                                  <div className="lesson-chat-disabled">
                                    <i className="feather-lock"></i>
                                    <p>The Chat for this Course has been disabled. Kindly contact Support.</p>
                                  </div>
                                ) : (
                                  <>
                                    {/* Chat filter */}
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
                                  </>
                                )}
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


                    </>
                  )}
                </div>
              </div>
            )}

            {/* ── Pagination: outside scroll so it's always visible ── */}
            <LessonPagination urlPrev={prevLesson} urlNext={nextLesson} />
          </div>
        </div>
      </div>
    </>
  );
};

export default LessonPage;
