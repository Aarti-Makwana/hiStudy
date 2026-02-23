"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import LessonSidebar from "@/components/Lesson/LessonSidebar";
import LessonPagination from "@/components/Lesson/LessonPagination";
import LessonTop from "@/components/Lesson/LessonTop";
import { UserCoursesServices } from "@/services/User/Courses/index.service";
import Loader from "@/components/Common/Loader";
import QuizHead from "@/components/Lesson/Quiz/QuizHead";

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

  const renderLessonAsset = () => {
    if (!lessonContent?.file?.url && !lessonContent?.video_url && !lessonContent?.url) {
      return (
        <div className="rbt-shadow-box text-center p--50">
          <h5>No content available for this lesson.</h5>
        </div>
      );
    }

    const assetUrl = lessonContent.file?.url || lessonContent.url || lessonContent.video_url;

    // Check if it's a document/PDF
    if (lessonContent.icon === "document" || assetUrl.toLowerCase().includes(".pdf")) {
      return (
        <div className="rbt-shadow-box overflow-hidden" style={{ minHeight: "800px" }}>
          <iframe
            src={`https://docs.google.com/viewer?url=${encodeURIComponent(assetUrl)}&embedded=true`}
            className="w-100"
            style={{ height: "800px", border: "none" }}
            title="Document Preview"
          ></iframe>
        </div>
      );
    }

    // Check if it's a Vimeo URL
    if (assetUrl.includes("vimeo.com")) {
      const vimeoId = assetUrl.split("/").pop();
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
          src={assetUrl}
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
                <div className="content">
                  {lessonContent?.category?.slug === "quiz" || (lessonContent?.course_quizzes && lessonContent.course_quizzes.length > 0) ? (
                    <form id="quiz-form" className="quiz-form-wrapper">
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
                              {quiz.options?.map((option, oIndex) => (
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
                    renderLessonAsset()
                  )}

                  <div className="section-title mt--40">
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
