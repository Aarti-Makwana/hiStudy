"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import LessonSidebar from "@/components/Lesson/LessonSidebar";
import LessonPagination from "@/components/Lesson/LessonPagination";
import { UserCoursesServices } from "@/services/User/Courses/index.service";
import { UserAuthServices } from "@/services/User/Auth/index.service";
import MirrorLoader from "@/components/Common/MirrorLoader";
import QuizHead from "@/components/Lesson/Quiz/QuizHead";
import QuizPlayer from "@/components/Lesson/QuizPlayer";
import toast from "react-hot-toast";
import { getToken } from "@/utils/storage";
import { getLocalStorageToken } from "@/utils/common.util";

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
  const router = useRouter();
  const course_slug = searchParams.get("course_slug");
  const topic_id = searchParams.get("topic_id");
  const content_id = searchParams.get("content_id");

  const token = getLocalStorageToken() || getToken();
  const [lessonContent, setLessonContent] = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [profileChecked, setProfileChecked] = useState(false);
  const [canAccessLesson, setCanAccessLesson] = useState(false);
  const [loading, setLoading] = useState(false);
  const [prevLesson, setPrevLesson] = useState(null);
  const [nextLesson, setNextLesson] = useState(null);
  const [sidebar, setSidebar] = useState(true);
  const [error, setError] = useState(null);

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
  const videoWrapperRef = useRef(null);   // ref for the entire video container

  // Point 9: Chat / Summary tabs
  const [activeBottomTab, setActiveBottomTab] = useState("chat");
  // Point 9: Chat filter
  const [chatFilter, setChatFilter] = useState("current");
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
  const chatMessagesRef = useRef(null);
  const shouldAutoScrollChatRef = useRef(false);
  // New state for editing comments/replies
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");
  const [activeActionMenuId, setActiveActionMenuId] = useState(null);

  // Assignment / Quiz Attempt status state
  const [courseQuizAttempts, setCourseQuizAttempts] = useState([]);
  const [submissionContents, setSubmissionContents] = useState([]);
  const [assignmentText, setAssignmentText] = useState("");
  const [assignmentFile, setAssignmentFile] = useState(null);
  const [submittingAssignment, setSubmittingAssignment] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState("");
  const submissionRef = useRef(null);

  // ── Email Watermark State ─────────────────────────────────────
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const [watermarkPos, setWatermarkPos] = useState({ top: 10, left: 10 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sync isFullscreen state with browser's fullscreen API
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!videoWrapperRef.current) return;
    if (!document.fullscreenElement) {
      videoWrapperRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Update watermark position every 5 seconds
  useEffect(() => {
    if (!userEmail) return;
    const interval = setInterval(() => {
      setWatermarkPos({
        top: Math.floor(Math.random() * 80) + 5, // 5% to 85%
        left: Math.floor(Math.random() * 80) + 5, // 5% to 85%
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [userEmail]);

  // ── Asset detection flags (Shared across header and renderer) ──
  const videoUrl = lessonContent?.url || lessonContent?.video_url || "";
  const pdfUrl = lessonContent?.file?.url || "";
  const htmlBody = lessonContent?.body || lessonContent?.content || lessonContent?.html_content || lessonContent?.description || lessonContent?.summary || "";

  const hasVideo = isVideoUrl(videoUrl);
  const hasPdf = !!pdfUrl || (lessonContent?.icon === "document" && !!videoUrl && !hasVideo);
  const finalPdfUrl = hasPdf ? (pdfUrl || videoUrl) : null;
  const hasHtml = htmlBody.trim().length > 0;
  const showTabs = (hasVideo || hasHtml) && hasPdf;

  const categoryName = lessonContent?.category?.name || "";
  const categorySlug = lessonContent?.category?.slug || "";
  const isAssignment = categorySlug === "assignment" || categoryName.toLowerCase() === "assignment";
  const isProject = categorySlug === "project" || categoryName.toLowerCase() === "project";

  const scrollToSubmission = () => {
    if (submissionRef.current) {
      submissionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  /* ─── Fetch course structure ─────────────────────────────── */
  const fetchCourseDetails = useCallback(async () => {
    if (!course_slug) return;
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
      setError("Unable to load the lesson. Please refresh or try again later.");
    }
  }, [course_slug]);

  useEffect(() => {
    fetchCourseDetails();
  }, [fetchCourseDetails]);

  /* ─── Fetch enrollment_id and email from profile API ────────────────── */
  const fetchEnrollmentId = useCallback(async () => {
    if (!courseData?.id) return;
    try {
      const res = await UserAuthServices.getUserDataService();
      if (res?.status === "success") {
        if (res.data?.email) {
          setUserEmail(res.data.email);
        }
        if (res.data?.id || res.data?._id) {
          setUserId(res.data?.id || res.data?._id);
        }
        if (res.data?.name) {
          setUserName(res.data.name);
        }
        const enrollment = (res.data?.active_enrollments || []).find(
          (en) => String(en.course_id) === String(courseData.id)
        );
        if (enrollment?.id) {
          setEnrollmentId(enrollment.id);
          console.log("[LessonPage] Found enrollment_id (UUID):", enrollment.id);
        }
      }
    } catch (err) {
      console.error("[LessonPage] Error fetching enrollment_id:", err);
    } finally {
      setProfileChecked(true);
    }
  }, [courseData?.id]);

  useEffect(() => {
    fetchEnrollmentId();
  }, [fetchEnrollmentId]);

  useEffect(() => {
    if (!content_id) return;

    const loginRedirect = `/login?redirect=${encodeURIComponent(
      `/lesson?course_slug=${course_slug}&topic_id=${topic_id || ""}&content_id=${content_id}`
    )}`;

    const lockedFromCourseData = courseData?.topics?.some((topic) =>
      topic.course_contents?.some(
        (content) => String(content.id) === String(content_id) && content?.is_lock === true
      )
    );

    const isLessonLocked = lessonContent
      ? lessonContent.is_lock === true || lessonContent.locked === true || lessonContent.status === false
      : lockedFromCourseData;

    if (!token) {
      toast.error("Please login first to access course lessons.");
      router.push(loginRedirect);
      return;
    }

    if (isLessonLocked && !enrollmentId && profileChecked) {
      toast.error("You need to enroll in this course to access locked lessons.");
      router.push(`/course-details/${course_slug}`);
      return;
    }

    if (lessonContent && isLessonLocked !== true) {
      setCanAccessLesson(true);
    }
  }, [content_id, courseData, course_slug, enrollmentId, lessonContent, profileChecked, router, token, topic_id]);

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
      const res = await UserCoursesServices.TrackLessonProgress(lessonId, currentTimeSec);

      // Update local progress map for sidebar checkmarks / rings
      if (res && res.status === "success") {
        const pctStr = res.data?.completion_percentage || "0%";
        const pct = parseFloat(pctStr) || 0;
        setLessonProgressMap((prev) => ({
          ...prev,
          [lessonId]: pct,
        }));
      }
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
  const fetchLessonContent = useCallback(async () => {
    if (!topic_id || !content_id) return;
    setLoading(true);
    try {
      const [contentRes, progressRes] = await Promise.allSettled([
        UserCoursesServices.UserGetSingleCourseTopicContent(topic_id, content_id),
        UserCoursesServices.GetLessonProgress(content_id),
      ]);

      let savedTime = 0;
      let savedTotal = 0;
      let savedPercent = 0;

      if (progressRes.status === "fulfilled" && progressRes.value?.status === "success") {
        const prog = progressRes.value.data;
        savedTime = prog?.last_position_seconds || 0;
        savedTotal = prog?.lesson?.duration_seconds || prog?.total_duration || 0;
        const rawPercent = prog?.completion_percentage || "0";
        savedPercent = parseFloat(rawPercent.replace("%", "")) || 0;

        console.log(`[LessonPage] Loaded progress from API: ${savedTime}s / ${savedTotal}s (${savedPercent}%)`);

        if (prog?.is_completed || savedPercent >= 98) {
          console.log("[LessonPage] Lesson is completed. Resetting seek time to 0 for re-watch.");
          savedTime = 0;
        }

        lastPostedTimeRef.current = savedTime;
        setVideoProgress({
          currentTimeSec: savedTime,
          totalDurationSec: savedTotal,
          percent: savedPercent,
        });
      }

      if (contentRes.status === "fulfilled" && contentRes.value?.status === "success") {
        const data = contentRes.value.data;
        setLessonContent(data);

        if (savedTotal === 0) {
          const contentSec = (data.hours || 0) * 3600 + (data.minutes || 0) * 60 + (data.seconds || 0);
          setVideoProgress((prev) => ({ ...prev, totalDurationSec: contentSec }));
        }
      }

      if (videoRef.current && savedTime > 0) {
        videoRef.current.currentTime = savedTime;
      }
    } catch (error) {
      console.error("Error fetching lesson content:", error);
    } finally {
      setLoading(false);
    }
  }, [content_id, topic_id]);

  useEffect(() => {
    const prevTime = getCurrentPlayerTime();
    const prevContentId = lastPostedTimeRef._contentId;
    if (prevContentId && prevTime > 0) {
      console.log(`[LessonPage] Video switched! Sending previous video (${prevContentId}) progress: ${prevTime}s`);
      UserCoursesServices.TrackLessonProgress(prevContentId, prevTime).catch(() => { });
    }

    destroyPlayers();
    setVideoProgress({ currentTimeSec: 0, totalDurationSec: 0, percent: 0 });
    setShowPagination(false);
    setActiveContentTab("content");
    lastPostedTimeRef.current = 0;
    lastPostedTimeRef._contentId = content_id;

    fetchLessonContent();

    return () => {
      if (videoRef.current && content_id) {
        postProgress(content_id, videoRef.current.currentTime);
      }
      destroyPlayers();
    };
  }, [content_id, destroyPlayers, fetchLessonContent, getCurrentPlayerTime, postProgress, topic_id]);

  /* ─── Chat / Comments Logic ────────────────────────────────── */
  const scrollChatToBottom = useCallback(() => {
    if (!chatMessagesRef.current) return;
    chatMessagesRef.current.scrollTo({
      top: chatMessagesRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, []);

  const fetchComments = useCallback(async (options = {}) => {
    if (!courseData?.id) return;
    try {
      const params = { course_id: courseData.id };
      // "current" filter: send both course_id & commentable_id (content_id) to get only this lesson's comments
      // "all" filter: send only course_id to get all course comments
      if (chatFilter === "current" && content_id) {
        params.commentable_id = content_id;
      }
      const res = await UserCoursesServices.getAllCommentReply(params);
      if (res && res.status === "success") {
        const commentsData = Array.isArray(res.data) ? res.data : (res.data?.comments || []);
        setComments(commentsData);
        if (options.scrollToBottom) {
          shouldAutoScrollChatRef.current = true;
        }
      }
    } catch (err) {
      console.error("[LessonPage] Error fetching comments:", err);
    }
  }, [courseData?.id, content_id, chatFilter]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    if (!shouldAutoScrollChatRef.current || activeBottomTab !== "chat") return;
    const timer = window.setTimeout(() => {
      scrollChatToBottom();
      shouldAutoScrollChatRef.current = false;
    }, 120);

    return () => window.clearTimeout(timer);
  }, [comments, activeBottomTab, scrollChatToBottom]);

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
        fetchComments({ scrollToBottom: true });
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
        fetchComments({ scrollToBottom: true });
      }
    } catch (err) {
      console.error("[LessonPage] Error saving reply:", err);
    } finally {
      setPostingComment(false);
    }
  };

  // Edit existing comment/reply
  const handleEditComment = (commentId, currentText) => {
    setEditingCommentId(commentId);
    setEditText(currentText);
    setActiveActionMenuId(null);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditText("");
  };

  const toggleActionMenu = (commentId) => {
    setActiveActionMenuId((prevId) => (prevId === commentId ? null : commentId));
  };

  const canModifyComment = (item) => {
    const createdAt = item?.created_at || item?.createdAt;
    if (!createdAt) return true;
    const ageMs = Date.now() - new Date(createdAt).getTime();
    return ageMs <= 3600000; // 1 hour
  };

  const handleUpdateComment = async (commentId) => {
    if (!editText.trim() || !content_id || postingComment) return;
    setPostingComment(true);
    try {
      const res = await UserCoursesServices.updateCommentReply(commentId, { comment: editText });
      if (res && res.status === "success") {
        handleCancelEdit();
        fetchComments({ scrollToBottom: true });
        toast.success("Comment updated successfully");
      }
    } catch (err) {
      console.error("[LessonPage] Error updating comment:", err);
      toast.error("Failed to update comment");
    } finally {
      setPostingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      const res = await UserCoursesServices.deleteCommentReply(commentId);
      if (res && res.status === "success") {
        fetchComments();
        toast.success("Comment deleted successfully");
      }
    } catch (err) {
      console.error("[LessonPage] Error deleting comment:", err);
      toast.error("Failed to delete comment");
    }
  };

  const isOwnComment = (item) => {
    if (!item) return false;
    if (item.is_mine !== undefined) return (item.is_mine === true || item.is_mine === 1 || item.is_mine === "1");
    
    const itemUserId = item.user_id || item.authable_id || item.authable?.id || item.user?.id;
    if (userId && itemUserId && String(itemUserId) === String(userId)) {
      return true;
    }
    const itemEmail = item.authable?.email || item.user?.email;
    if (userEmail && itemEmail && itemEmail === userEmail) {
      return true;
    }
    const itemUserName = item.authable?.name || item.user?.name;
    if (userName && itemUserName && itemUserName === userName) {
      return true;
    }
    return false;
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
      if (!enrollmentId) {
        toast.error("Enrollment ID not found. Please try again.");
        setSubmittingAssignment(false);
        return;
      }

      const formData = new FormData();
      formData.append("content_id", content_id);
      formData.append("enrollment_id", enrollmentId);
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
            const dur = typeof evt.target?.getDuration === "function" ? evt.target.getDuration() : 0;
            if (dur > 0) {
              setVideoProgress((prev) => ({
                ...prev,
                totalDurationSec: dur,
              }));
            }
            // Seek to saved position
            if (lastPostedTimeRef.current > 0 && typeof evt.target?.seekTo === "function") {
              evt.target.seekTo(lastPostedTimeRef.current, true);
            }
          },
          onStateChange: (evt) => {
            const state = evt.data;
            const cur = typeof evt.target?.getCurrentTime === "function" ? evt.target.getCurrentTime() : 0;
            const dur = typeof evt.target?.getDuration === "function" ? Math.max(evt.target.getDuration(), 1) : 1;
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
    if (!isAssignment && !isProject) return null;

    const submission = submissionContents.find(s => String(s.id) === String(content_id));
    const latestSubmission = submission?.latest_submission;

    const statusStr = String(latestSubmission?.status || "").toLowerCase();
    const isRejected = statusStr === "rejected" || statusStr === "reject";
    const isAccepted = statusStr === "accepted" || statusStr === "approve" || statusStr === "approved" || latestSubmission?.is_approved;
    
    // Status Display text and styling
    let statusText = "Pending Approval";
    let statusBg = "rgba(245, 158, 11, 0.1)";
    let statusColor = "#f59e0b";
    let statusIcon = "clock";

    if (isAccepted) {
      statusText = "Accepted";
      statusBg = "rgba(34, 197, 94, 0.1)";
      statusColor = "#22c55e";
      statusIcon = "check-circle";
    } else if (isRejected) {
      statusText = "Rejected";
      statusBg = "rgba(239, 68, 68, 0.1)";
      statusColor = "#ef4444";
      statusIcon = "x-circle";
    }

    return (
      <div ref={submissionRef} className="lesson-assignment-submission-container mt--40">
        <div className="section-title">
          <h4 className="mb--20">Assignment Submission</h4>
        </div>

        {latestSubmission && (
          <div className="bg-color-white rbt-shadow-box p--30 mb--30">
            <div className="submission-status-item mb--20 d-flex align-items-center gap-3">
              <span className="h6 mb--0 text-white">Status:</span>
              <span className="status-badge"
                style={{
                  padding: "4px 12px",
                  borderRadius: "4px",
                  fontSize: "14px",
                  backgroundColor: statusBg,
                  color: statusColor,
                  border: `1px solid ${statusColor}`,
                  textTransform: "uppercase",
                  fontWeight: "600"
                }}>
                <i className={`feather-${statusIcon} mr--5`}></i>
                {statusText}
              </span>
            </div>
            {latestSubmission.feedback && (
              <div className="submission-feedback mt--20 p--15 rounded border-0" style={{ backgroundColor: "rgba(255,255,255,0.05)", borderLeft: `4px solid ${statusColor} !important` }}>
                <h6 className="mb--5" style={{ color: statusColor }}>Feedback from Instructor:</h6>
                <p className="mb--0" style={{ color: "rgba(255,255,255,0.8)" }}>{latestSubmission.feedback}</p>
              </div>
            )}
            <div className="mt--20 text-secondary small">
              <p className="mb--0">Submitted on: {new Date(latestSubmission.submitted_at).toLocaleString()}</p>
            </div>
          </div>
        )}

        {(!latestSubmission || isRejected) && (
          <div className="bg-color-white rbt-shadow-box p--30">
            {isRejected && <h5 className="mb--20 text-white">Resubmit Assignment</h5>}
            <form onSubmit={handleAssignmentSubmit}>
              <div className="assignment-answer-form mb--20">
                <textarea
                  rows="6"
                  placeholder="Add your assignment content here..."
                  className="w-100 p--15 rounded border"
                  value={assignmentText}
                  onChange={(e) => setAssignmentText(e.target.value)}
                  style={{ backgroundColor: "var(--color-black-2)", color: "white", borderColor: "rgba(255,255,255,0.1)" }}
                ></textarea>
              </div>

              <div className="mt--30">
                <label className="mb--10 d-block font-weight-bold h6 text-white">Upload files (optional)</label>
                <div className="custom-file-upload-wrapper p--20 rounded text-center" style={{ border: "1px dashed rgba(255,255,255,0.2)", backgroundColor: "rgba(255,255,255,0.02)" }}>
                  <input
                    type="file"
                    id="assignment-file"
                    className="d-none"
                    onChange={(e) => setAssignmentFile(e.target.files[0])}
                  />
                  <label htmlFor="assignment-file" className="cursor-pointer mb--0 d-block">
                    <i className="feather-upload-cloud h3 d-block mb--10 text-primary"></i>
                    <span className="d-block text-white">{assignmentFile ? assignmentFile.name : "Click to upload or drag and drop"}</span>
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
                      {submittingAssignment ? "Submitting..." : (isRejected ? "Resubmit Assignment" : "Submit Assignment")}
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
    const renderVideo = () => {
      const renderWatermark = () => {
        if (!userEmail) return null;
        return (
          <div
            className="video-email-watermark fade-in"
            style={{
              top: `${watermarkPos.top}%`,
              left: `${watermarkPos.left}%`,
            }}
          >
            {userEmail}
          </div>
        );
      };

      const renderFullscreenBtn = () => (
        <button
          className="video-custom-fullscreen-btn"
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          <i className={isFullscreen ? "feather-minimize" : "feather-maximize"}></i>
        </button>
      );

      if (videoUrl.includes("vimeo.com")) {
        const vimeoId = videoUrl.split("/").pop();
        return (
          <div className="lesson-video-wrapper" ref={videoWrapperRef}>
            <iframe
              id={iframeIdRef.current}
              src={`https://player.vimeo.com/video/${vimeoId}?h=0&title=0&byline=0&portrait=0&fullscreen=0`}
              allow="autoplay; picture-in-picture"
              title="Vimeo Video"
              ref={(el) => { if (el && !vimeoPlayerRef.current) initVimeoPlayer(el); }}
            ></iframe>
            {renderWatermark()}
            {renderFullscreenBtn()}
          </div>
        );
      }
      if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
        let youtubeId = "";
        if (videoUrl.includes("v=")) youtubeId = videoUrl.split("v=")[1].split("&")[0];
        else if (videoUrl.includes("youtu.be/")) youtubeId = videoUrl.split("youtu.be/")[1].split("?")[0];
        else youtubeId = videoUrl.split("/").pop();

        return (
          <div className="lesson-video-wrapper" ref={videoWrapperRef}>
            <iframe
              id={iframeIdRef.current}
              src={`https://www.youtube.com/embed/${youtubeId}?enablejsapi=1&fs=0`}
              title="YouTube Video"
              ref={(el) => { if (el && !ytPlayerRef.current) initYouTubePlayer(el); }}
            ></iframe>
            {renderWatermark()}
            {renderFullscreenBtn()}
          </div>
        );
      }
      // Raw Video
      return (
        <div className="lesson-video-wrapper" ref={videoWrapperRef}>
          <video
            ref={videoRef}
            controls
            controlsList="nofullscreen"
            src={videoUrl}
            onLoadedMetadata={(e) => {
              const dur = e.target.duration || 0;
              setVideoProgress((prev) => ({ ...prev, totalDurationSec: prev.totalDurationSec > 0 ? prev.totalDurationSec : dur }));
              if (lastPostedTimeRef.current > 0) e.target.currentTime = lastPostedTimeRef.current;
            }}
            onPlay={() => {
              if (!progressTimerRef.current) {
                progressTimerRef.current = setInterval(() => {
                  if (videoRef.current && !videoRef.current.paused) postProgress(content_id, videoRef.current.currentTime);
                }, 5000);
              }
            }}
            onTimeUpdate={(e) => {
              const cur = e.target.currentTime;
              const dur = e.target.duration || 1;
              setVideoProgress({ currentTimeSec: cur, totalDurationSec: dur, percent: Math.round((cur / dur) * 100) });
            }}
            onPause={(e) => postProgress(content_id, e.target.currentTime)}
            onEnded={(e) => postProgress(content_id, e.target.duration || e.target.currentTime)}
          />
          {renderWatermark()}
          {renderFullscreenBtn()}
        </div>
      );
    };

    const renderPdf = () => (
      <div className="lesson-pdf-viewer">
        <iframe
          src={`https://docs.google.com/viewer?url=${encodeURIComponent(finalPdfUrl)}&embedded=true`}
          className="lesson-pdf-iframe"
          title="Document Preview"
        ></iframe>
      </div>
    );

    const renderHtml = () => (
      <div className="lesson-html-content" dangerouslySetInnerHTML={{ __html: htmlBody }} />
    );

    let contentNode = null;
    if (activeContentTab === "pdf" && hasPdf) {
      contentNode = renderPdf();
    } else if (hasVideo) {
      contentNode = renderVideo();
    } else if (hasPdf) {
      contentNode = renderPdf(); // if only pdf and no tabs
    } else if (hasHtml) {
      contentNode = renderHtml();
    } else {
      contentNode = (
        <div className="rbt-shadow-box text-center p--50">
          <h5>No media available for this lesson.</h5>
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
  const videoUrlForFlag = lessonContent?.url || lessonContent?.video_url;
  // Show progress bar for any video (also check icon field)
  const isVideoContent = !!(
    (videoUrlForFlag && isVideoUrl(videoUrlForFlag)) || lessonContent?.icon === "video"
  );
  const showChatSummary = isVideoContent;
  const isQuiz =
    lessonContent?.category?.slug === "quiz" ||
    (lessonContent?.course_quizzes && lessonContent.course_quizzes.length > 0);

  const chatVal = courseData?.chat ?? "";
  const isChatDisabled =
    String(chatVal).toLowerCase() === "no" ||
    String(chatVal).toLowerCase() === "disabled";
  const filteredComments = Array.isArray(comments) ? comments : [];

  // ── Overall course progress for header indicator ──
  const calculateOverallProgress = () => {
    if (!courseData?.topics) return 0;
    let totalSeconds = 0;
    let watchedSeconds = 0;

    courseData.topics.forEach((topic) => {
      topic.course_contents?.forEach((content) => {
        const dur = (content.hours || 0) * 3600 + (content.minutes || 0) * 60 + (content.seconds || 0);
        if (dur > 0) {
          totalSeconds += dur;
          const apiPct = lessonProgressMap[content.id] ?? 0;
          watchedSeconds += dur * (apiPct / 100);
        }
      });
    });
    return totalSeconds > 0 ? Math.round((watchedSeconds / totalSeconds) * 100) : 0;
  };

  const coursePct = calculateOverallProgress();

  if (error) {
    return (
      <div className="rbt-course-details-area ptb--60">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="alert alert-danger text-center">
                {error}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!courseData || (!canAccessLesson && profileChecked)) {
    return (
      <div className="rbt-lesson-area lesson-player-dark bg-color-darker">
        <div className="container">
          <div className="row g-5">
            <div className="col-xl-8 col-lg-7">
              <MirrorLoader widthClass="w-100" heightClass="h-400" radiusClass="radius-15" className="mb--20" />
              <MirrorLoader widthClass="w-100" heightClass="h-400" radiusClass="radius-15" />
            </div>
            <div className="col-xl-4 col-lg-5">
              <MirrorLoader widthClass="w-100" heightClass="h-200" radiusClass="radius-15" className="mb--20" />
              <MirrorLoader widthClass="w-100" heightClass="h-200" radiusClass="radius-15" />
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <div className="lesson-header-left">
                {/* <Link
                  href={course_slug ? `/course-details/${course_slug}` : "/course-details"}
                  className="lesson-strip-btn"
                  title="Back to Course"
                >
                  <i className="feather-arrow-left"></i>
                </Link> */}



                <button
                  className="lesson-strip-btn"
                  title="Toggle Sidebar"
                  onClick={() => setSidebar(!sidebar)}
                >
                  <i className="feather-menu"></i>
                </button>
              </div>
              <span className="lesson-strip-title">
                {lessonContent?.title || "Lesson"}
              </span>

              {/* ─── Relocated Tabs ─── */}
              {showTabs && (
                <div className="lesson-content-tabs ml--auto">
                  <button
                    className="lesson-content-tab-btn"
                    onClick={() => window.open(`https://docs.google.com/viewer?url=${encodeURIComponent(finalPdfUrl)}`, '_blank')}
                  >
                    <i className="feather-external-link"></i> Open PDF
                  </button>
                </div>
              )}

              {/* ─── Submission Button (Assignment/Project focus) ─── */}
              {(isAssignment || isProject) && (
                <div className={`lesson-content-tabs ${!showTabs ? 'ml--auto' : ''}`}>
                  <button
                    className="lesson-content-tab-btn active"
                    onClick={scrollToSubmission}
                    style={{ borderRadius: '8px', marginLeft: showTabs ? '10px' : '0' }}
                  >
                    <i className="feather-external-link"></i> Submission
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="lesson-right-scroll">
                <div className="lesson-main-content">
                  <MirrorLoader widthClass="w-100" heightClass="h-50" className="mb--20" />
                  <MirrorLoader widthClass="w-100" heightClass="h-40" className="mb--20" />
                  <MirrorLoader widthClass="w-100" heightClass="h-350" radiusClass="radius-15" />
                </div>
              </div>
            ) : (
              <div className="lesson-right-scroll">
                <div className="lesson-main-content">

                  {/* ─── QUIZ ─────────────────────────────────────────── */}
                  {isQuiz ? (() => {
                    const quizzes = lessonContent?.course_quizzes || [];
                    const latestAttempt = lessonContent?.latest_attempt || null;
                    return (
                      <QuizPlayer
                        quizzes={quizzes}
                        contentId={content_id}
                        enrollmentId={enrollmentId}
                        latestAttempt={latestAttempt}
                        remainingAttempt={lessonContent?.remaining_attempt}
                      />
                    );
                  })() : (
                    <>
                      {/* ─── Main asset (PDF/HTML/Video all auto-detected) ─── */}
                      {renderLessonAsset()}



                      {/* ─── Chat / Summary tabs (Hidden in PDF mode) ─── */}
                      {activeContentTab !== "pdf" && showChatSummary && (
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
                                    {/* Chat dropdown filter */}
                                    <div className="lesson-chat-filter-bar">
                                      <i className="feather-filter"></i>
                                      <select
                                        value={chatFilter}
                                        onChange={(e) => setChatFilter(e.target.value)}
                                        className="lesson-chat-filter-input"
                                      >
                                        <option value="current" style={{ backgroundColor: "#1c1d20" }}>Current Lesson</option>
                                        <option value="all" style={{ backgroundColor: "#1c1d20" }}>All Lessons</option>
                                      </select>
                                    </div>
                                    <div className="lesson-chat-messages" ref={chatMessagesRef}>
                                      {filteredComments.length === 0 ? (
                                        <p className="lesson-chat-empty">
                                          There are currently no comments in this lecture. You can try switching to
                                          {" "}“All Lectures” in the filter tab.
                                        </p>
                                      ) : (
                                        <div className="chat-list">
                                          {filteredComments.map((c) => (
                                              <div key={c.id} className="chat-item-wrapper premium-chat-item">
                                                <div className="chat-msg">
                                                  <div className="chat-user-avatar">
                                                    {c.authable?.profile?.file?.url || c.user?.profile?.file?.url || c.user?.avatar ? (
                                                      <img src={c.authable?.profile?.file?.url || c.user?.profile?.file?.url || c.user?.avatar} alt={c.authable?.name || c.user?.name || "User"} />
                                                    ) : (
                                                      <div className="avatar-placeholder">{(c.authable?.name || c.user?.name || "U")[0]}</div>
                                                    )}
                                                  </div>
                                                  <div className="chat-msg-content w-100">
                                                    <div className="chat-msg-header d-flex align-items-start justify-content-between">
                                                      <div>
                                                        <span className="chat-user-name">{c.authable?.name || c.user?.name || "User"}</span>
                                                        <span className="chat-time">{new Date(c.created_at).toLocaleString()}</span>
                                                      </div>
                                                      {isOwnComment(c) && (
                                                        <div className="chat-action-menu position-relative" style={{ display: 'inline-flex' }}>
                                                          <button
                                                            className="chat-action-menu-btn"
                                                            onClick={() => toggleActionMenu(c.id)}
                                                            style={{
                                                              background: 'transparent',
                                                              border: 'none',
                                                              color: 'var(--color-white)',
                                                              cursor: 'pointer',
                                                              padding: '4px 8px',
                                                            }}
                                                          >
                                                            <i className="feather-more-vertical" style={{ fontSize: '1.2rem' }}></i>
                                                          </button>

                                                          {activeActionMenuId === c.id && (
                                                            <div
                                                              className="chat-action-dropdown"
                                                              style={{
                                                                position: 'absolute',
                                                                right: 0,
                                                                top: 'calc(100% + 8px)',
                                                                zIndex: 10,
                                                                minWidth: '120px',
                                                                background: 'var(--color-black-2)',
                                                                border: '1px solid rgba(255,255,255,0.15)',
                                                                borderRadius: '8px',
                                                                boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
                                                                padding: '6px',
                                                              }}
                                                            >
                                                              <button
                                                                className="chat-action-dropdown-item"
                                                                onClick={() => handleEditComment(c.id, c.comment || c.content)}
                                                                disabled={!canModifyComment(c)}
                                                                style={{
                                                                  width: '100%',
                                                                  textAlign: 'left',
                                                                  padding: '8px 10px',
                                                                  background: 'transparent',
                                                                  border: 'none',
                                                                  color: canModifyComment(c) ? 'var(--color-white)' : 'rgba(255,255,255,0.45)',
                                                                  cursor: canModifyComment(c) ? 'pointer' : 'not-allowed',
                                                                }}
                                                              >
                                                                <i className="feather-edit-2 mr--5"></i> Edit
                                                              </button>
                                                              <button
                                                                className="chat-action-dropdown-item"
                                                                onClick={() => handleDeleteComment(c.id)}
                                                                disabled={!canModifyComment(c)}
                                                                style={{
                                                                  width: '100%',
                                                                  textAlign: 'left',
                                                                  padding: '8px 10px',
                                                                  background: 'transparent',
                                                                  border: 'none',
                                                                  color: canModifyComment(c) ? '#ff6b6b' : 'rgba(255,107,107,0.4)',
                                                                  cursor: canModifyComment(c) ? 'pointer' : 'not-allowed',
                                                                }}
                                                              >
                                                                <i className="feather-trash-2 mr--5"></i> Delete
                                                              </button>
                                                            </div>
                                                          )}
                                                        </div>
                                                      )}
                                                    </div>
                                                    
                                                    {editingCommentId === c.id ? (
                                                      <div className="chat-edit-wrapper mt--10 mb--10">
                                                        <input 
                                                          type="text" 
                                                          className="chat-edit-input p--10 w-100 mb--5" 
                                                          value={editText} 
                                                          onChange={(e) => setEditText(e.target.value)} 
                                                          onKeyDown={(e) => e.key === "Enter" && handleUpdateComment(c.id)}
                                                          style={{ borderRadius: "5px", border: "1px solid #ddd", background: "var(--color-black-2)", color: "inherit" }}
                                                        />
                                                        <div className="d-flex gap-2 mt--5">
                                                          <button
                                                            className="rbt-btn btn-xs btn-border"
                                                            onClick={handleCancelEdit}
                                                            style={{
                                                              borderColor: 'rgba(255,255,255,0.35)',
                                                              color: 'rgba(255,255,255,0.85)',
                                                              background: 'transparent',
                                                            }}
                                                          >
                                                            Cancel
                                                          </button>
                                                          <button className="rbt-btn btn-xs btn-gradient" onClick={() => handleUpdateComment(c.id)} disabled={postingComment}>Save</button>
                                                        </div>
                                                      </div>
                                                    ) : (
                                                      <p className="chat-msg-text">{c.comment || c.content}</p>
                                                    )}

                                                    <div className="chat-actions d-flex align-items-center gap-3 mt--10">
                                                      <button
                                                        className="chat-reply-btn"
                                                        onClick={() => {
                                                          setReplyingTo(replyingTo === c.id ? null : c.id);
                                                          setReplyText("");
                                                        }}
                                                      >
                                                        <i className="feather-corner-up-left mr--5"></i>
                                                        {replyingTo === c.id ? "Cancel Reply" : "Reply"}
                                                      </button>
                                                    </div>
                                                  </div>
                                                </div>

                                                {/* Replies list */}
                                                {c.replies && c.replies.length > 0 && (
                                                  <div className="chat-replies">
                                                    {c.replies.map((r) => (
                                                      <div key={r.id} className="chat-reply-item">
                                                        <div className="chat-user-avatar mini">
                                                          {r.authable?.profile?.file?.url || r.user?.profile?.file?.url || r.user?.avatar ? (
                                                            <img src={r.authable?.profile?.file?.url || r.user?.profile?.file?.url || r.user?.avatar} alt={r.authable?.name || r.user?.name || "User"} />
                                                          ) : (
                                                            <div className="avatar-placeholder">{(r.authable?.name || r.user?.name || "U")[0]}</div>
                                                          )}
                                                        </div>
                                                        <div className="chat-msg-content">
                                                          <div className="chat-msg-header d-flex align-items-start justify-content-between">
                                                            <div>
                                                              <span className="chat-user-name">{r.authable?.name || r.user?.name || "User"}</span>
                                                              <span className="chat-time">{new Date(r.created_at).toLocaleString()}</span>
                                                            </div>
                                                            {isOwnComment(r) && (
                                                              <div className="chat-action-menu position-relative" style={{ display: 'inline-flex' }}>
                                                                <button
                                                                  className="chat-action-menu-btn"
                                                                  onClick={() => toggleActionMenu(r.id)}
                                                                  style={{
                                                                    background: 'transparent',
                                                                    border: 'none',
                                                                    color: 'var(--color-white)',
                                                                    cursor: 'pointer',
                                                                    padding: '4px 8px',
                                                                  }}
                                                                >
                                                                  <i className="feather-more-vertical" style={{ fontSize: '1.2rem' }}></i>
                                                                </button>

                                                                {activeActionMenuId === r.id && (
                                                                  <div
                                                                    className="chat-action-dropdown"
                                                                    style={{
                                                                      position: 'absolute',
                                                                      right: 0,
                                                                      top: 'calc(100% + 8px)',
                                                                      zIndex: 10,
                                                                      minWidth: '120px',
                                                                      background: 'var(--color-black-2)',
                                                                      border: '1px solid rgba(255,255,255,0.15)',
                                                                      borderRadius: '8px',
                                                                      boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
                                                                      padding: '6px',
                                                                    }}
                                                                  >
                                                                    <button
                                                                      className="chat-action-dropdown-item"
                                                                      onClick={() => handleEditComment(r.id, r.comment || r.content)}
                                                                      disabled={!canModifyComment(r)}
                                                                      style={{
                                                                        width: '100%',
                                                                        textAlign: 'left',
                                                                        padding: '8px 10px',
                                                                        background: 'transparent',
                                                                        border: 'none',
                                                                        color: canModifyComment(r) ? 'var(--color-white)' : 'rgba(255,255,255,0.45)',
                                                                        cursor: canModifyComment(r) ? 'pointer' : 'not-allowed',
                                                                      }}
                                                                    >
                                                                      <i className="feather-edit mr--5"></i> Edit
                                                                    </button>
                                                                    <button
                                                                      className="chat-action-dropdown-item"
                                                                      onClick={() => handleDeleteComment(r.id)}
                                                                      disabled={!canModifyComment(r)}
                                                                      style={{
                                                                        width: '100%',
                                                                        textAlign: 'left',
                                                                        padding: '8px 10px',
                                                                        background: 'transparent',
                                                                        border: 'none',
                                                                        color: canModifyComment(r) ? '#ff6b6b' : 'rgba(255,107,107,0.4)',
                                                                        cursor: canModifyComment(r) ? 'pointer' : 'not-allowed',
                                                                      }}
                                                                    >
                                                                      <i className="feather-trash-2 mr--5"></i> Delete
                                                                    </button>
                                                                  </div>
                                                                )}
                                                              </div>
                                                            )}
                                                          </div>
                                                          
                                                          {editingCommentId === r.id ? (
                                                            <div className="chat-edit-wrapper mt--10 mb--10">
                                                              <input 
                                                                type="text" 
                                                                className="chat-edit-input p--10 w-100 mb--5" 
                                                                value={editText} 
                                                                onChange={(e) => setEditText(e.target.value)} 
                                                                onKeyDown={(e) => e.key === "Enter" && handleUpdateComment(r.id)}
                                                                style={{ borderRadius: "5px", border: "1px solid #ddd", background: "var(--color-black-2)", color: "inherit" }}
                                                              />
                                                              <div className="d-flex gap-2 mt--5">
                                                                <button
                                                                  className="rbt-btn btn-xs btn-border"
                                                                  onClick={handleCancelEdit}
                                                                  style={{
                                                                    borderColor: 'rgba(255,255,255,0.35)',
                                                                    color: 'rgba(255,255,255,0.85)',
                                                                    background: 'transparent',
                                                                  }}
                                                                >
                                                                  Cancel
                                                                </button>
                                                                <button className="rbt-btn btn-xs btn-gradient" onClick={() => handleUpdateComment(r.id)} disabled={postingComment}>Save</button>
                                                              </div>
                                                            </div>
                                                          ) : (
                                                            <p className="chat-msg-text">{r.comment || r.content}</p>
                                                          )}
                                                          
                                                        </div>
                                                      </div>
                                                    ))}
                                                  </div>
                                                )}

                                                {/* Reply Input */}
                                                {replyingTo === c.id && (
                                                  <div className="chat-reply-input-wrapper-premium">
                                                    <div className="input-group">
                                                      <input
                                                        type="text"
                                                        placeholder="Write a reply..."
                                                        className="chat-reply-input"
                                                        value={replyText}
                                                        onChange={(e) => setReplyText(e.target.value)}
                                                        onKeyDown={(e) => e.key === "Enter" && handleSaveReply(c.id)}
                                                        autoFocus
                                                      />
                                                      <button
                                                        className="chat-reply-send-btn"
                                                        onClick={() => handleSaveReply(c.id)}
                                                        disabled={postingComment || !replyText.trim()}
                                                      >
                                                        <i className="feather-send"></i>
                                                      </button>
                                                    </div>
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
                                        placeholder="Type a Message"
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
