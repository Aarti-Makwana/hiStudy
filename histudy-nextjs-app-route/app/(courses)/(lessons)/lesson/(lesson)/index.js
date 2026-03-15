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
import toast from "react-hot-toast";

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

  // ── Map of content_id → completion_percentage from API ──────
  const [lessonProgressMap, setLessonProgressMap] = useState({});

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
  // Sequential reveal for pagination
  const [showPagination, setShowPagination] = useState(false);
  const sentinelRef = useRef(null);
  // PDF / Content tabs
  const [activeContentTab, setActiveContentTab] = useState("content");

  // Chat/Comments state
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null); // comment_id of the comment being replied to
  const [replyText, setReplyText] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  // Assignment / Quiz Attempt status state
  const [courseQuizAttempts, setCourseQuizAttempts] = useState([]);
  const [submissionContents, setSubmissionContents] = useState([]);
  const [assignmentText, setAssignmentText] = useState("");
  const [assignmentFile, setAssignmentFile] = useState(null);
  const [submittingAssignment, setSubmittingAssignment] = useState(false);

  /* ─── Fetch course structure ─────────────────────────────── */
  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (course_slug) {
        try {
          const res = await UserCoursesServices.UserGetCourse(course_slug);
          if (res && res.status === "success") {
            setCourseData(res.data);

            // Fetch progress for all video items from API
            const allVideoIds = [];
            res.data.topics?.forEach((topic) => {
              topic.course_contents?.forEach((content) => {
                if (content.icon === "video") {
                  allVideoIds.push(content.id);
                }
              });
            });

            if (allVideoIds.length > 0) {
              const progressResults = await Promise.allSettled(
                allVideoIds.map((id) => UserCoursesServices.GetLessonProgress(id))
              );
              const progressMap = {};
              progressResults.forEach((result, idx) => {
                if (result.status === "fulfilled" && result.value?.status === "success") {
                  const pctStr = result.value.data?.completion_percentage || "0%";
                  progressMap[allVideoIds[idx]] = parseFloat(pctStr) || 0;
                }
              });
              console.log("[LessonPage] Fetched progress map from API:", progressMap);
              setLessonProgressMap(progressMap);
            }

            // Fetch Quiz Attempts and Submission Contents
            const courseId = res.data.id;
            if (courseId) {
              const quizAttemptsRes = await UserCoursesServices.GetQuizAttempts(courseId);
              if (quizAttemptsRes?.status === "success") {
                setCourseQuizAttempts(quizAttemptsRes.data?.quizzes || []);
              }

              const submissionRes = await UserCoursesServices.GetSubmissionContents(courseId);
              if (submissionRes?.status === "success") {
                setSubmissionContents(submissionRes.data?.contents || []);
              }
            }
          }
        } catch (error) {
          console.error("Error fetching course details:", error);
        }
      }
    };
    fetchCourseDetails();
  }, [course_slug]);

  /* ─── Sync current video progress into lessonProgressMap (real-time) ── */
  useEffect(() => {
    if (content_id && videoProgress.percent > 0) {
      setLessonProgressMap((prev) => {
        if (prev[content_id] === videoProgress.percent) return prev;
        return { ...prev, [content_id]: videoProgress.percent };
      });
    }
  }, [content_id, videoProgress.percent]);

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

    destroyPlayers();
    setVideoProgress({ currentTimeSec: 0, totalDurationSec: 0, percent: 0 });
    setShowPagination(false); // Reset pagination on new content
    setActiveContentTab("content"); // Reset content tab
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

  /* ─── Chat / Comments Logic ────────────────────────────────── */
  const fetchComments = useCallback(async () => {
    if (!content_id) return;
    try {
      const res = await UserCoursesServices.getAllCommentReply(content_id);
      if (res && res.status === "success") {
        setComments(res.data || []);
      }
    } catch (err) {
      console.error("[LessonPage] Error fetching comments:", err);
    }
  }, [content_id]);

  useEffect(() => {
    if (activeBottomTab === "chat") {
      fetchComments();
    }
  }, [activeBottomTab, fetchComments]);

  const handleSaveComment = async () => {
    if (!newComment.trim() || !content_id || postingComment) return;
    setPostingComment(true);
    try {
      const res = await UserCoursesServices.saveCommentReply({
        content_id: content_id,
        comment: newComment,
        comment_id: null,
      });
      if (res && res.status === "success") {
        setNewComment("");
        fetchComments();
      }
    } catch (err) {
      console.error("[LessonPage] Error saving comment:", err);
    } finally {
      setPostingComment(false);
    }
  };

  const handleSaveReply = async (commentId) => {
    if (!replyText.trim() || !content_id || postingComment) return;
    setPostingComment(true);
    try {
      const res = await UserCoursesServices.saveCommentReply({
        content_id: content_id,
        comment: replyText,
        comment_id: commentId,
      });
      if (res && res.status === "success") {
        setReplyText("");
        setReplyingTo(null);
        fetchComments();
      }
    } catch (err) {
      console.error("[LessonPage] Error saving reply:", err);
    } finally {
      setPostingComment(false);
    }
  };

  /* ─── Handle Assignment Submission ───────────────────────── */
  const handleAssignmentSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!assignmentText.trim() && !assignmentFile) {
      toast.error("Please provide some text or a file for your assignment.");
      return;
    }

    setSubmittingAssignment(true);
    try {
      const formData = new FormData();
      formData.append("content_id", content_id);
      formData.append("body", assignmentText);
      if (assignmentFile) {
        formData.append("file", assignmentFile);
      }

      const res = await UserCoursesServices.SaveSubmission(formData);
      if (res.status === "success") {
        setAssignmentText("");
        setAssignmentFile(null);
        toast.success("Assignment submitted successfully!");
        
        // Refresh submission contents
        if (courseData?.id) {
          const submissionRes = await UserCoursesServices.GetSubmissionContents(courseData.id);
          if (submissionRes?.status === "success") {
            setSubmissionContents(submissionRes.data?.contents || []);
          }
        }
      } else {
        toast.error(res.message || "Submission failed.");
      }
    } catch (error) {
      console.error("Error submitting assignment:", error);
      toast.error("An error occurred during submission.");
    } finally {
      setSubmittingAssignment(false);
    }
  };

  /* ─── IntersectionObserver for Pagination Reveal ───────────── */
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowPagination(true);
        }
      },
      { threshold: 0.1 }
    );

    const sentinel = sentinelRef.current;
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => {
      if (sentinel) {
        observer.unobserve(sentinel);
      }
    };
  }, [lessonContent]); // re-run when content changes

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

  /* ─── Render Assignment UI ───────────────────────────────── */
  const renderAssignmentUI = () => {
    const categoryName = lessonContent?.category?.name || "";
    const categorySlug = lessonContent?.category?.slug || "";
    const isAssignment = categorySlug === "assignment" || categoryName.toLowerCase() === "assignment";
    const isProject = categorySlug === "project" || categoryName.toLowerCase() === "project";

    if (!isAssignment && !isProject) return null;

    const submission = submissionContents.find(s => String(s.id) === String(content_id));
    const latestSubmission = submission?.latest_submission;

    return (
      <div className="lesson-assignment-submission-container mt--40">
        <div className="section-title">
          <h4 className="mb--20">Assignment Submission</h4>
        </div>

        {latestSubmission ? (
          <div className="bg-color-white rbt-shadow-box p--30">
            <div className="submission-status-item mb--20 d-flex align-items-center gap-3">
              <span className="h6 mb--0">Status:</span>
              <span className={`status-badge ${latestSubmission.is_approved ? "approved" : "pending"}`} 
                    style={{ 
                      padding: "4px 12px", 
                      borderRadius: "4px", 
                      fontSize: "14px",
                      backgroundColor: latestSubmission.is_approved ? "rgba(34, 197, 94, 0.1)" : "rgba(245, 158, 11, 0.1)",
                      color: latestSubmission.is_approved ? "#22c55e" : "#f59e0b",
                      border: `1px solid ${latestSubmission.is_approved ? "#22c55e" : "#f59e0b"}`
                    }}>
                <i className={`feather-${latestSubmission.is_approved ? "check-circle" : "clock"} mr--5`}></i>
                {latestSubmission.is_approved ? "Approved" : "Pending Approval"}
              </span>
            </div>
            {latestSubmission.feedback && (
              <div className="submission-feedback mt--20 p--15 bg-color-light rounded shadow-sm">
                <h6 className="mb--5 text-primary">Feedback from Instructor:</h6>
                <p className="mb--0 text-dark">{latestSubmission.feedback}</p>
              </div>
            )}
            <div className="mt--20 text-secondary small">
              <p className="mb--0">Submitted on: {new Date(latestSubmission.submitted_at).toLocaleString()}</p>
              <p className="mb--0">Attempt: {latestSubmission.attempt}</p>
            </div>
          </div>
        ) : (
          <div className="bg-color-white rbt-shadow-box p--30">
            <form onSubmit={handleAssignmentSubmit}>
              <div className="assignment-answer-form mb--20">
                <textarea
                  rows="6"
                  placeholder="Add your assignment content here..."
                  className="w-100 p--15 rounded border"
                  value={assignmentText}
                  onChange={(e) => setAssignmentText(e.target.value)}
                  style={{ backgroundColor: "#f9f9f9" }}
                ></textarea>
              </div>

              <div className="mt--30">
                <label className="mb--10 d-block font-weight-bold h6">Upload files (optional)</label>
                <div className="custom-file-upload-wrapper p--20 border-dashed rounded text-center bg-color-light">
                  <input
                    type="file"
                    id="assignment-file"
                    className="d-none"
                    onChange={(e) => setAssignmentFile(e.target.files[0])}
                  />
                  <label htmlFor="assignment-file" className="cursor-pointer mb--0 d-block">
                    <i className="feather-upload-cloud h3 d-block mb--10 text-primary"></i>
                    <span className="d-block">{assignmentFile ? assignmentFile.name : "Click to upload or drag and drop"}</span>
                    {!assignmentFile && <small className="text-secondary">(Images, PDFs, or ZIP files recommended)</small>}
                  </label>
                </div>
              </div>

              <div className="submit-btn mt--35">
                <button
                  type="submit"
                  className="rbt-btn btn-gradient hover-icon-reverse w-100"
                  disabled={submittingAssignment}
                >
                  <span className="icon-reverse-wrapper">
                    <span className="btn-text">
                      {submittingAssignment ? "Submitting..." : "Submit Assignment"}
                    </span>
                    <span className="btn-icon">
                      <i className="feather-arrow-right"></i>
                    </span>
                    <span className="btn-icon">
                      <i className="feather-arrow-right"></i>
                    </span>
                  </span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  };

  /* ─── Render the main lesson asset ─── */
  const renderLessonAsset = () => {
    const assetUrl =
      lessonContent?.file?.url || lessonContent?.url || lessonContent?.video_url;

    // ── HTML / rich-text content (no URL, but has description/body/content) ──
    const htmlBody =
      lessonContent?.body || lessonContent?.content || lessonContent?.html_content || lessonContent?.description || lessonContent?.summary;

    const pdfUrl = (lessonContent?.icon === "document" || isPdfUrl(assetUrl)) ? assetUrl : null;

    let contentNode = null;

    // ── Tabbed View: HTML + PDF ──
    if (htmlBody && pdfUrl) {
      contentNode = (
        <div className="lesson-tabbed-container">
          <div className="lesson-content-tabs">
            <button
              className={`content-tab-btn ${activeContentTab === "content" ? "active" : ""}`}
              onClick={() => setActiveContentTab("content")}
            >
              <i className="feather-file-text"></i> Description
            </button>
            <button
              className={`content-tab-btn ${activeContentTab === "pdf" ? "active" : ""}`}
              onClick={() => setActiveContentTab("pdf")}
            >
              <i className="feather-file"></i> Document
            </button>
          </div>

          <div className="lesson-tab-content">
            {activeContentTab === "content" ? (
              <div
                className="lesson-html-content"
                dangerouslySetInnerHTML={{ __html: htmlBody }}
              />
            ) : (
              <div className="lesson-pdf-viewer">
                <iframe
                  src={`https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`}
                  className="lesson-pdf-iframe"
                  title="Document Preview"
                ></iframe>
              </div>
            )}
          </div>
        </div>
      );
    } else if (htmlBody && !assetUrl) {
      contentNode = (
        <div
          className="lesson-html-content"
          dangerouslySetInnerHTML={{ __html: htmlBody }}
        />
      );
    } else if (pdfUrl) {
      contentNode = (
        <div className="lesson-pdf-viewer">
          <iframe
            src={`https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`}
            className="lesson-pdf-iframe"
            title="Document Preview"
          ></iframe>
        </div>
      );
    } else if (!assetUrl) {
      contentNode = (
        <div className="rbt-shadow-box text-center p--50">
          <h5>No media available for this lesson.</h5>
        </div>
      );
    } else if (assetUrl.includes("vimeo.com")) {
      const vimeoId = assetUrl.split("/").pop();
      contentNode = (
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
    } else if (assetUrl.includes("youtube.com") || assetUrl.includes("youtu.be")) {
      let youtubeId = "";
      if (assetUrl.includes("v=")) {
        youtubeId = assetUrl.split("v=")[1].split("&")[0];
      } else if (assetUrl.includes("youtu.be/")) {
        youtubeId = assetUrl.split("youtu.be/")[1].split("?")[0];
      } else {
        youtubeId = assetUrl.split("/").pop();
      }
      contentNode = (
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
    } else {
      // Raw / HTML5 Video
      contentNode = (
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
    }

    return (
      <>
        {contentNode}
        {renderAssignmentUI()}
      </>
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

      <div className="rbt-lesson-area lesson-player-dark bg-color-darker">
        <div className={`rbt-lesson-content-wrapper ${sidebar ? "" : "sidebar-hide"}`}>

          {/* ── LEFT SIDEBAR ── */}
          <div className={`rbt-lesson-leftsidebar ${sidebar ? "" : "sidebar-hide"}`}>
            <LessonSidebar
              courseData={courseData}
              courseSlug={course_slug}
              currentVideoProgress={videoProgress?.percent}
              lessonProgressMap={lessonProgressMap}
              quizAttempts={courseQuizAttempts}
              submissionContents={submissionContents}
            />
          </div>

          {/* ── RIGHT CONTENT ── */}
          <div className="rbt-lesson-rightsidebar overflow-hidden lesson-video">

            {/* ── Top navigation strip ── */}
            <div className="lesson-top-strip">
              <Link
                href={course_slug ? `/course-details/${course_slug}` : "/course-details"}
                className="lesson-strip-btn"
                title="Back to Course"
              >
                <i className="feather-arrow-left"></i>
              </Link>
              <button
                className="lesson-strip-btn"
                title="Toggle Sidebar"
                onClick={() => setSidebar(!sidebar)}
              >
                <i className="feather-menu"></i>
              </button>
              <span className="lesson-strip-title">
                {lessonContent?.title || "Lesson"}
              </span>
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
                                      {!Array.isArray(comments) || comments.length === 0 ? (
                                        <p className="lesson-chat-empty">No messages yet. Start the conversation!</p>
                                      ) : (
                                        <div className="chat-list">
                                          {comments
                                            .filter(c => c && typeof c.comment === 'string' && (!chatFilter || c.comment.toLowerCase().includes(chatFilter.toLowerCase())))
                                            .map((c) => (
                                              <div key={c.id} className="chat-item-wrapper">
                                                <div className="chat-msg">
                                                  <div className="chat-msg-header">
                                                    <span className="chat-user-name">{c.user?.name || "User"}</span>
                                                    <span className="chat-time">{new Date(c.created_at).toLocaleDateString()}</span>
                                                  </div>
                                                  <p className="chat-msg-text">{c.comment}</p>
                                                  <button
                                                    className="chat-reply-btn"
                                                    onClick={() => {
                                                      setReplyingTo(replyingTo === c.id ? null : c.id);
                                                      setReplyText("");
                                                    }}
                                                  >
                                                    {replyingTo === c.id ? "Cancel" : "Reply"}
                                                  </button>
                                                </div>

                                                {/* Replies list */}
                                                {c.replies && c.replies.length > 0 && (
                                                  <div className="chat-replies">
                                                    {c.replies.map((r) => (
                                                      <div key={r.id} className="chat-reply-item">
                                                        <div className="chat-msg-header">
                                                          <span className="chat-user-name">{r.user?.name || "User"}</span>
                                                          <span className="chat-time">{new Date(r.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                        <p className="chat-msg-text">{r.comment}</p>
                                                      </div>
                                                    ))}
                                                  </div>
                                                )}

                                                {/* Reply Input */}
                                                {replyingTo === c.id && (
                                                  <div className="chat-reply-input-wrapper">
                                                    <input
                                                      type="text"
                                                      placeholder="Write a reply..."
                                                      className="chat-reply-input"
                                                      value={replyText}
                                                      onChange={(e) => setReplyText(e.target.value)}
                                                      onKeyDown={(e) => e.key === "Enter" && handleSaveReply(c.id)}
                                                    />
                                                    <button
                                                      className="chat-reply-send-btn"
                                                      onClick={() => handleSaveReply(c.id)}
                                                      disabled={postingComment || !replyText.trim()}
                                                    >
                                                      <i className="feather-send"></i>
                                                    </button>
                                                  </div>
                                                )}
                                              </div>
                                            ))}
                                        </div>
                                      )}
                                    </div>
                                    <div className="lesson-chat-input-bar">
                                      <input
                                        type="text"
                                        placeholder="Type a message..."
                                        className="lesson-chat-input"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleSaveComment()}
                                      />
                                      <button
                                        className="lesson-chat-send-btn"
                                        onClick={handleSaveComment}
                                        disabled={postingComment || !newComment.trim()}
                                      >
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

                {/* ── Sentinel + Pagination: Reveal logic ── */}
                <div ref={sentinelRef} className="lesson-pagination-sentinel" />
                <div className={`lesson-pagination-reveal ${showPagination ? "visible" : ""}`}>
                  <LessonPagination urlPrev={prevLesson} urlNext={nextLesson} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LessonPage;
