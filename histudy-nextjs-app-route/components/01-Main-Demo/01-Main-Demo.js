"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import sal from "sal.js";

import CategoryOne from "../Category/CategoryOne";
import MainDemoBanner from "./MainDemoBanner";
import AboutTwo from "../Abouts/About-Two";
import CallToAction from "../Call-To-Action/CallToAction";
import Counter from "../Counters/Counter";
import TestimonialSeven from "../Testimonials/Testimonial-Seven";
import ReviewSection from "../Reviews/ReviewSection";
import EventCarouse from "../Events/EventCarouse";
import TeamTwo from "../Team/TeamTwo";
import BlogGridTop from "../Blogs/Blog-Sections/BlogGrid-Top";
import NewsletterTwo from "../Newsletters/Newsletter-Two";

import { ParallaxProvider } from "react-scroll-parallax";
import { UserCoursesServices } from "../../services/User/Courses/index.service";

import brand1 from "../../public/images/brand/partner-5.webp";

const MainDemo = ({ blogs }) => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await UserCoursesServices.UserAllCourses();
        console.log("UserAllCourses response:", res); // Debug log

        if (res && res.success) {
          const adaptedCourses = res.data.map((item) => {
            let img = item.file ? item.file : "/images/course/course-online-01.jpg";
            // If it's a placeholder URL, try to set it to 710x488
            if (typeof img === 'string' && img.includes('placeholder')) {
              img = img.replace('400x117', '710x488').replace('400/117', '710/488');
            }
            return {
              id: item.id,
              slug: item.slug || item.id,
              courseImg: img,
              courseTitle: item.title,
              desc: item.short_description || item.long_description,
              lesson: item.number_of_lectures,
              student: item.students_taught || 0,
              review: item.rating_count || item.ratings || 0,
              rating: item.average_rating || 0,
              price: item.discounted_price,
              offPrice: item.actual_price,
              offPricePercentage: Math.round(((item.actual_price - item.discounted_price) / item.actual_price) * 100)
            };
          });
          console.log("Adapted courses:", adaptedCourses); // Debug log
          setCourses(adaptedCourses);
        } else {
          console.error("API success false or invalid response", res);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    sal({
      threshold: 0.01,
      once: true,
    });
  }, [courses]);

  return (
    <>
      <main className="rbt-main-wrapper">
        <div className="rbt-banner-area rbt-banner-1">
          <MainDemoBanner courses={courses} />
        </div>

        <div className="rbt-categories-area bg-color-white rbt-section-gapBottom">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="section-title text-center">
                  <span className="subtitle bg-primary-opacity">
                    CATEGORIES
                  </span>
                  <h2 className="title">
                    Explore Top Courses Caterories <br /> That Change Yourself
                  </h2>
                </div>
              </div>
            </div>
            <div className="row g-5 mt--20">
              <CategoryOne />
            </div>
          </div>
        </div>

        <div id="popular-courses" className="rbt-course-area bg-color-extra2 rbt-section-gap">
          <div className="container">
            <div className="row mb--60">
              <div className="col-lg-12">
                <div className="section-title text-center">
                  <span className="subtitle bg-secondary-opacity">
                    Top Popular Course
                  </span>
                  <h2 className="title">
                    Histudy Course student <br /> can join with us.
                  </h2>
                </div>
              </div>
            </div>
            <div className="row g-5">
              {courses.length === 0 && <div className="col-12 text-center">No courses available.</div>}

              {courses?.slice(0, 3).map((data, index) => (
                <div
                  className="col-lg-4 col-md-6 col-sm-6 col-12 mt--30"
                  data-sal-delay="150"
                  data-sal="slide-up"
                  data-sal-duration="800"
                  key={index}
                >
                  <div className="rbt-card variation-01 rbt-hover">
                    <div className="rbt-card-img">
                      <Link href={`/course-details/${data.slug}`}>
                        <Image
                          src={data.courseImg}
                          width={710}
                          height={488}
                          alt="Card image"
                        />
                        {data.offPricePercentage > 0 ? (
                          <div className="rbt-badge-3 bg-white">
                            <span>-{data.offPricePercentage}%</span>
                            <span>Off</span>
                          </div>
                        ) : (
                          ""
                        )}
                      </Link>
                    </div>
                    <div className="rbt-card-body">
                      <ul className="rbt-meta">
                        <li>
                          <i className="feather-book"></i>
                          {data.lesson} Lessons
                        </li>
                        <li>
                          <i className="feather-users"></i>
                          {data.student} Students
                        </li>
                      </ul>

                      <h4 className="rbt-card-title">
                        <Link href={`/course-details/${data.slug}`}>
                          {data.courseTitle}
                        </Link>
                      </h4>

                      <p className="rbt-card-text">{data.desc?.substring(0, 100)}</p>

                      <div className="rbt-review">
                        <div className="rating">
                          {[...Array(5)].map((_, i) => (
                            <i
                              key={i}
                              className={`fas fa-star ${i < Math.round(data.rating || 5) ? "" : "off"}`}
                              style={{ color: i < Math.round(data.rating || 5) ? "#ffc107" : "#e4e5e9" }}
                            ></i>
                          ))}
                        </div>
                        <span className="rating-count">
                          ({data.review} Reviews)
                        </span>
                      </div>

                      <div className="rbt-card-bottom">
                        <div className="rbt-price">
                          <span className="current-price">${data.price}</span>
                          <span className="off-price">${data.offPrice}</span>
                        </div>
                        <Link
                          className="rbt-btn-link"
                          href={`/course-details/${data.slug}`}
                        >
                          Learn More<i className="feather-arrow-right"></i>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="row">
              <div className="col-lg-12">
                <div className="load-more-btn mt--60 text-center">
                  <Link
                    className="rbt-btn btn-gradient btn-lg btn-mobile hover-icon-reverse"
                    href="#"
                  >
                    <span className="icon-reverse-wrapper">
                      <span className="btn-text">Load More Course (40)</span>
                      <span className="btn-icon">
                        <i className="feather-arrow-right"></i>
                      </span>
                      <span className="btn-icon">
                        <i className="feather-arrow-right"></i>
                      </span>
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rbt-about-area bg-color-white rbt-section-gapTop pb_md--80 pb_sm--80 about-style-1">
          <div className="container">
            <ParallaxProvider>
              <AboutTwo />
            </ParallaxProvider>
          </div>
        </div>

        <div className="rbt-callto-action-area mt_dec--half">
          <CallToAction />
        </div>

        <div className="rbt-counterup-area bg-color-extra2 rbt-section-gapBottom default-callto-action-overlap">
          <div className="container">
            <Counter isDesc={false} />
          </div>
        </div>

        <div className="rbt-testimonial-area bg-color-white rbt-section-gap overflow-hidden">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-4 left-content">
                <div className="section-title">
                  <span className="subtitle bg-primary-opacity">
                    EDUCATION FOR EVERYONE
                  </span>
                  <h2 className="title">
                    What Our <br /> Learners Say
                  </h2>
                </div>
                <p className="mt--20">Learning communicate to global world and build a bright future with our histudy.</p>
                <div className="mt--30">
                  <Link href="/review" className="rbt-btn btn-gradient">
                    View All Reviews
                  </Link>
                </div>
              </div>
              <div className="col-lg-8">
                <div className="testimonial-cards-wrapper">
                  <ReviewSection />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rbt-event-area rbt-section-gap bg-gradient-3">
          <div className="container">
            <div className="row mb--55">
              <div className="section-title text-center">
                <span className="subtitle bg-white-opacity">
                  STIMULATED TO TAKE PART IN?
                </span>
                <h2 className="title color-white">Upcoming Events</h2>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12">
                <EventCarouse />
              </div>
            </div>
          </div>
        </div>

        <div className="rbt-team-area bg-color-white rbt-section-gap">
          <div className="container">
            <div className="row mb--60">
              <div className="col-lg-12">
                <div className="section-title text-center">
                  <span className="subtitle bg-primary-opacity">
                    Our Teacher
                  </span>
                  <h2 className="title">Whose Inspirations You</h2>
                </div>
              </div>
            </div>
            <TeamTwo />
          </div>
        </div>

        <div className="rbt-rbt-blog-area rbt-section-gap bg-color-extra2">
          <div className="container">
            <div className="row g-5 align-items-center mb--30">
              <div className="col-lg-6 col-md-6 col-12">
                <div className="section-title">
                  <span className="subtitle bg-pink-opacity">Blog Post</span>
                  <h2 className="title">Post Popular Post.</h2>
                </div>
              </div>
              <div className="col-lg-6 col-md-6 col-12">
                <div className="read-more-btn text-start text-md-end">
                  <Link
                    className="rbt-btn btn-gradient hover-icon-reverse"
                    href="/blog"
                  >
                    <div className="icon-reverse-wrapper">
                      <span className="btn-text">See All Articles</span>
                      <span className="btn-icon">
                        <i className="feather-arrow-right"></i>
                      </span>
                      <span className="btn-icon">
                        <i className="feather-arrow-right"></i>
                      </span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
            <BlogGridTop BlogData={blogs} />
          </div>
        </div>

        <div className="rbt-newsletter-area newsletter-style-2 bg-color-primary rbt-section-gap">
          <NewsletterTwo />
        </div>
      </main>
    </>
  );
};

export default MainDemo;
