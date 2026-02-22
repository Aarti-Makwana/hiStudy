"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import sal from "sal.js";
import { Provider } from "react-redux";
import Store from "@/redux/store";
import Context from "@/context/Context";

import MobileMenu from "@/components/Header/MobileMenu";
import HeaderStyleTen from "@/components/Header/HeaderStyle-Ten";
import Cart from "@/components/Header/Offcanvas/Cart";
import Separator from "@/components/Common/Separator";
import FooterOne from "@/components/Footer/Footer-One";
import CourseHead from "@/components/Course-Details/Course-Sections/course-head";
import CourseDetailsOne from "@/components/Course-Details/CourseDetails-One";
import CourseActionBottom from "@/components/Course-Details/Course-Sections/Course-Action-Bottom";
import SimilarCourses from "@/components/Course-Details/Course-Sections/SimilarCourses";
import Loader from "@/components/Common/Loader";

import { UserCoursesServices } from "@/services/User/Courses/index.service";

const SingleCourse = ({ getParams }) => {
  const router = useRouter();
  const courseId = getParams.courseId;
  const [courseData, setCourseData] = useState(null);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        if (courseId) {
          // Fetch single course details directly using slug from params
          const singleCourseRes = await UserCoursesServices.UserGetCourse(
            courseId
          );

          if (singleCourseRes && singleCourseRes.status === "success") {
            const apiData = singleCourseRes.data;

            // Adapt API data to the component's expected structure
            const adaptedData = {
              id: apiData.id,
              courseTitle: apiData.title,
              courseImg: apiData.file?.url || "/images/course/course-01.jpg", // Extract URL from file object
              courseVideo: apiData.introVideos?.[0]?.url || "",
              desc: apiData.short_description,
              longDesc: apiData.long_description,
              category: apiData.categories?.[0]?.name || "Uncategorized",
              sellsType: apiData.course_type === "paid" ? "Paid" : "Free",
              price: apiData.discounted_price,
              offPrice: apiData.actual_price,
              discount: apiData.actual_price ? Math.round(
                ((apiData.actual_price - apiData.discounted_price) /
                  apiData.actual_price) *
                100
              ) : 0,
              star: apiData.average_star_rating || 0,
              ratingNumber: apiData.total_star_ratings || 0,
              review: apiData.total_star_ratings || 0,
              studentNumber: apiData.enrolled_users_count || 0,
              lesson: apiData.number_of_lectures,
              duration: apiData.duration,
              language: apiData.language,
              date: new Date(apiData.updated_at || Date.now()).toLocaleDateString(),
              courseAward: apiData.is_certificate_enabled ? "Certificate" : "No Certificate",

              // Rating Distribution
              ratingDistribution: [
                { rating: 5, percentage: apiData.five_star_percentage || 0 },
                { rating: 4, percentage: apiData.four_star_percentage || 0 },
                { rating: 3, percentage: apiData.three_star_percentage || 0 },
                { rating: 2, percentage: apiData.two_star_percentage || 0 },
                { rating: 1, percentage: apiData.one_star_percentage || 0 },
              ],

              // Instructor
              userName: apiData.instructor?.name || "Unknown Instructor",
              userImg: apiData.instructor?.file?.url || "/images/client/avatar-02.png", // Handle instructor image object
              userCategory: apiData.instructor?.short_description || "Instructor",

              // Complex structures adapted
              courseOverview: [
                {
                  title: "Course Description",
                  desc: apiData.long_description,
                  overviewList: []
                }
              ],
              courseContent: [
                {
                  title: "Course Curriculum",
                  contentList: apiData.topics?.map(topic => ({
                    title: topic.name,
                    time: topic.progres?.total || "0m",
                    listItem: topic.course_contents?.map(content => ({
                      text: content.title,
                      playIcon: content.icon === "play" || content.category?.slug === "lesson",
                      time: `${content.hours}h ${content.minutes}m`,
                      status: !content.is_lock,
                      topicId: topic.id,
                      contentId: content.id
                    })) || []
                  })) || []
                }
              ],
              courseInstructor: [
                {
                  title: "Instructor",
                  body: apiData.instructor ? [{
                    name: apiData.instructor.name,
                    desc: apiData.instructor.short_description,
                    img: apiData.instructor.file?.url || "/images/client/avatar-02.png",
                    type: "Instructor",
                    ratingNumber: apiData.instructor.rating_count || 0,
                    star: apiData.instructor.instructor_rating || 0,
                    studentNumber: apiData.instructor.students_taught || 0,
                    course: apiData.instructor.courses_count || 0,
                    social: apiData.instructor.socialMedia?.map(social => ({
                      icon: social.platform,
                      link: social.url
                    })) || []
                  }] : []
                }
              ],
              courseRequirement: [
                {
                  title: "Requirements",
                  detailsList: [] // API doesn't have explicit requirements list yet
                }
              ],
              featuredReview: [
                {
                  title: "Featured Reviews",
                  body: apiData.reviews?.map(rev => ({
                    userName: rev.name,
                    desc: rev.review,
                    star: rev.rating,
                    userImg: rev.file?.url || "/images/client/avatar-02.png"
                  })) || []
                }
              ],
              similarCourse: apiData.related_courses?.map(related => ({
                id: related.id,
                title: related.title,
                img: related.file?.url || "/images/course/course-01.jpg",
                price: related.discounted_price,
                offPrice: related.actual_price,
                rating: related.average_star_rating,
                review: related.total_star_ratings,
                lesson: related.number_of_lectures,
                student: related.enrolled_users_count,
                author: apiData.instructor?.name || "Instructor",
                avatar: apiData.instructor?.file?.url || "/images/client/avatar-02.png",
                post: "Instructor",
                link: `/course-details/${related.slug}`,
                desc: related.short_description
              })) || [],
              relatedCourse: [],
              roadmap: [
                { text: "Start Date", desc: apiData.start_date || "N/A" },
                { text: "Enrolled", desc: apiData.enrolled_users_count || 0 },
                { text: "Lectures", desc: apiData.number_of_lectures || 0 },
                { text: "Skill Level", desc: apiData.difficulty_level || "All Levels" },
                { text: "Language", desc: apiData.language || "English" },
                { text: "Duration", desc: apiData.duration || "0 hours" }
              ],
              slug: apiData.slug
            };

            setCourseData(adaptedData);
          }
        }
      } catch (error) {
        console.error("Error fetching course details:", error);
      }
    };

    fetchCourseDetails();

    sal({
      threshold: 0.01,
      once: true,
    });
  }, [courseId, router]);

  if (!courseData) {
    return <Loader />;
  }

  return (
    <>
      <Provider store={Store}>
        <Context>
          <MobileMenu />
          <HeaderStyleTen headerSticky="" headerType={true} />
          <Cart />

          <div className="rbt-breadcrumb-default rbt-breadcrumb-style-3">
            <CourseHead
              checkMatch={courseData}
            />
          </div>

          <div className="rbt-course-details-area ptb--60">
            <div className="container">
              <div className="row g-5">
                <CourseDetailsOne
                  checkMatchCourses={courseData}
                  courseSlug={courseId}
                />
              </div>
            </div>
          </div>

          <CourseActionBottom
            checkMatchCourses={courseData}
          />

          <div className="rbt-related-course-area bg-color-white pt--60 rbt-section-gapBottom">
            <SimilarCourses
              checkMatchCourses={courseData.similarCourse}
            />
          </div>

          <Separator />
          <FooterOne />
        </Context>
      </Provider>
    </>
  );
};

export default SingleCourse;
