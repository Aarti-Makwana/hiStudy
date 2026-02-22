"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import LessonSidebar from "@/components/Lesson/LessonSidebar";
import LessonPagination from "@/components/Lesson/LessonPagination";
import LessonTop from "@/components/Lesson/LessonTop";
import { UserCoursesServices } from "@/services/User/Courses/index.service";
import Loader from "@/components/Common/Loader";

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

  useEffect(() => {
    if (courseData && content_id) {
      const allContents = [];
      courseData.topics?.forEach((topic) => {
        topic.course_contents?.forEach((content) => {
          allContents.push({
            topicId: topic.id,
            contentId: content.id,
          });
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

  useEffect(() => {
    const fetchLessonContent = async () => {
      if (topic_id && content_id) {
        setLoading(true);
        try {
          const res = await UserCoursesServices.UserGetSingleCourseTopicContent(
            topic_id,
            content_id
          );
          if (res && res.status === "success") {
            setLessonContent(res.data);
          }
        } catch (error) {
          console.error("Error fetching lesson content:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchLessonContent();
  }, [topic_id, content_id]);

  const renderVideoPlayer = () => {
    if (!lessonContent?.file?.url && !lessonContent?.video_url && !lessonContent?.url) {
      return (
        <div className="rbt-shadow-box text-center p--50">
          <h5>No video available for this lesson.</h5>
        </div>
      );
    }

    const videoUrl = lessonContent.file?.url || lessonContent.url || lessonContent.video_url;

    // Check if it's a Vimeo URL
    if (videoUrl.includes("vimeo.com")) {
      const vimeoId = videoUrl.split("/").pop();
      return (
        <div className="plyr__video-embed rbtplayer">
          <iframe
            src={`https://player.vimeo.com/video/${vimeoId}?h=0&title=0&byline=0&portrait=0`}
            className="w-100"
            style={{ minHeight: "615px" }}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      );
    }

    // Check if it's a YouTube URL
    if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
      let youtubeId = "";
      if (videoUrl.includes("v=")) {
        youtubeId = videoUrl.split("v=")[1].split("&")[0];
      } else if (videoUrl.includes("youtu.be/")) {
        youtubeId = videoUrl.split("youtu.be/")[1].split("?")[0];
      } else {
        youtubeId = videoUrl.split("/").pop();
      }
      return (
        <div className="plyr__video-embed rbtplayer">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}`}
            className="w-100"
            style={{ minHeight: "615px" }}
            allowFullScreen
          ></iframe>
        </div>
      );
    }

    // Default to HTML5 Video player
    return (
      <div className="plyr__video-embed rbtplayer">
        <video
          className="w-100"
          controls
          style={{ minHeight: "615px" }}
          src={videoUrl}
        ></video>
      </div>
    );
  };

  return (
    <>
      <div className="rbt-lesson-area bg-color-white">
        <div className={`rbt-lesson-content-wrapper ${sidebar ? "" : "sidebar-hide"}`}>
          <div className={`rbt-lesson-leftsidebar ${sidebar ? "" : "sidebar-hide"}`}>
            <LessonSidebar courseData={courseData} courseSlug={course_slug} />
          </div>

          <div className={`rbt-lesson-rightsidebar overflow-hidden lesson-video ${sidebar ? "" : "sidebar-hide"}`}>
            <LessonTop
              sidebar={sidebar}
              setSidebar={() => setSidebar(!sidebar)}
              courseTitle={courseData?.title}
              courseSlug={course_slug}
            />
            {loading ? (
              <div className="inner">
                <Loader />
              </div>
            ) : (
              <div className="inner">
                {renderVideoPlayer()}
                <div className="content">
                  <div className="section-title">
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
                        __html: lessonContent?.description || lessonContent?.summary || "No description available for this lesson.",
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
            <LessonPagination urlPrev={prevLesson} urlNext={nextLesson} />
          </div>
        </div>
      </div>
    </>
  );
};

export default LessonPage;
