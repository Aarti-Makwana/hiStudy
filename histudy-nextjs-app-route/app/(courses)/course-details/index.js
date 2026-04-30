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

// Helper: format total seconds to "Xh Ym Zs"
const formatTime = (h, m, s) => {
  const totalSec = (h || 0) * 3600 + (m || 0) * 60 + (s || 0);
  if (totalSec === 0) return "";
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = Math.floor(totalSec % 60);
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
};

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
              isPurchased: apiData.is_purchased || false,
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
              language: apiData.language ? apiData.language.charAt(0).toUpperCase() + apiData.language.slice(1) : "English",
              date: apiData.updated_at ? new Date(apiData.updated_at).toLocaleDateString() : new Date().toLocaleDateString(),
              isBestseller: apiData.is_bestseller || false,
              courseAward: apiData.is_certificate_enabled ? "Certificate" : "No Certificate",
              certificateNumber: apiData.certificate_number || null,
              days: apiData.days_left || 10,
              quizCount: apiData.quizzes_count || 0,
              validity: apiData.validity_unit === 'unlimited' ? 'Lifetime' : (apiData.validity || 'Unlimited'),

              // Rating Distribution
              ratingDistribution: [
                { rating: 5, percentage: apiData.five_star_percentage || 0 },
                { rating: 4, percentage: apiData.four_star_percentage || 0 },
                { rating: 3, percentage: apiData.three_star_percentage || 0 },
                { rating: 2, percentage: apiData.two_star_percentage || 0 },
                { rating: 1, percentage: apiData.one_star_percentage || 0 },
              ],

              // Instructor
              userName: apiData.instructor?.display_name || apiData.instructor?.name || "Unknown Instructor",
              userImg: apiData.instructor?.file?.url || "/images/client/avatar-02.png", // Handle instructor image object
              userCategory: apiData.instructor?.short_description || "Instructor",
              instructorCompanies: apiData.instructor?.companies || [],
              hasMoneyBackGuarantee: apiData.has_money_back_guarantee || false,
              moneyBackDuration:
                apiData.money_back_guarantee_period || apiData.money_back_duration || 30,

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
                      time: formatTime(content.hours, content.minutes, content.seconds),
                      status: apiData.is_purchased ? true : !content.is_lock,
                      topicId: topic.id,
                      contentId: content.id,
                      icon: getItemIcon(content),
                      summary: content.summary,
                      videoUrl:
                        content.file?.url ||
                        content.preview_url ||
                        content.video_url ||
                        content.url ||
                        ""
                    })) || []
                  })) || []
                }
              ],
              courseInstructor: [
                {
                  title: "Instructor",
                  body: apiData.instructor ? [{
                    name: apiData.instructor.display_name || apiData.instructor.name,
                    desc: apiData.instructor.short_description || apiData.instructor.bio,
                    img: apiData.instructor.file?.url || "/images/client/avatar-02.png",
                    type: apiData.instructor.subtitle || "Instructor",
                    companies: apiData.instructor.companies || [],
                    ratingNumber: apiData.instructor.rating_count || 0,
                    star: apiData.instructor.instructor_rating || 0,
                    studentNumber: apiData.instructor.students_taught || 0,
                    course: apiData.instructor.courses_count || 0,
                    social: apiData.instructor.socialMedia?.map(social => ({
                      icon: social.platform,
                      link: social.url
                    })) || [],
                    linkedinUrl: apiData.instructor.socialMedia?.find(s => s.platform === 'linkedin')?.url || "#"
                  }] : []
                }
              ],
              courseRequirement: apiData.prerequisites
                ? [
                  {
                    title: "Prerequisites",
                    detailsList: apiData.prerequisites.split(/\r?\n/).filter(line => line.trim() !== "").map(line => ({ listItem: line.trim() }))
                  }
                ]
                : [],
              courseBenefits: apiData.benefits
                ? [
                  {
                    title: "Benefits",
                    detailsList: apiData.benefits.split(/\r?\n/).filter(line => line.trim() !== "").map(line => ({ listItem: line.trim() }))
                  }
                ]
                : [],
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
