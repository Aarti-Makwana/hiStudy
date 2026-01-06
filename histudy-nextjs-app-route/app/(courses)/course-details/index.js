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
              courseImg: apiData.file || "/images/course/course-01.jpg", // Fallback image
              courseVideo: apiData.introVideos?.[0]?.url || "",
              desc: apiData.short_description,
              longDesc: apiData.long_description,
              category: apiData.categories?.[0]?.name || "Uncategorized",
              sellsType: apiData.course_type === "paid" ? "Paid" : "Free",
              price: apiData.discounted_price,
              offPrice: apiData.actual_price,
              discount: Math.round(
                ((apiData.actual_price - apiData.discounted_price) /
                  apiData.actual_price) *
                100
              ),
              star: apiData.average_rating || 0,
              ratingNumber: apiData.ratings || 0,
              review: apiData.ratings || 0,
              studentNumber: apiData.students_taught || 0,
              lesson: apiData.number_of_lectures,
              duration: apiData.duration,
              language: apiData.language,
              date: new Date(apiData.updated_at || Date.now()).toLocaleDateString(),
              courseAward: apiData.is_certificate_enabled ? "Certificate" : "No Certificate",

              // Instructor
              userName: apiData.instructors?.[0]?.name || "Unknown Instructor",
              userImg: apiData.instructors?.[0]?.file || "/images/client/avatar-02.png", // Fallback avatar
              userCategory: apiData.instructors?.[0]?.expertise || "Instructor",

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
                    time: "10 min", // Placeholder as API doesn't seem to have topic duration yet
                    listItem: [] // Placeholder for lessons inside topics if available
                  })) || []
                }
              ],
              courseInstructor: [
                {
                  title: "Instructor",
                  body: apiData.instructors?.map(inst => ({
                    name: inst.name,
                    desc: inst.bio,
                    img: inst.file || "/images/client/avatar-02.png",
                    type: inst.subject || "Instructor",
                    ratingNumber: inst.rating_count || 0,
                    studentNumber: inst.students_taught || 0,
                    social: []
                  })) || []
                }
              ],
              courseRequirement: [
                {
                  title: "Requirements",
                  detailsList: [] // API doesn't have explicit requirements list yet
                }
              ],
              featuredReview: [], // API doesn't have reviews list yet
              similarCourse: [], // API doesn't return similar courses yet
              relatedCourse: [],
              roadmap: [
                { text: "Start Date", desc: new Date(apiData.start_date || Date.now()).toLocaleDateString() },
                { text: "Enrolled", desc: apiData.students_taught || 0 },
                { text: "Lectures", desc: apiData.number_of_lectures || 0 },
                { text: "Skill Level", desc: apiData.difficulty_level || "All Levels" },
                { text: "Language", desc: apiData.language || "English" },
                { text: "Duration", desc: apiData.duration || "0 hours" }
              ]
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
