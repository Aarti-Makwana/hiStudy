"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import sal from "sal.js";

import MainDemoBanner from "./MainDemoBanner";
import Counter from "../Counters/Counter";
import ReviewSection from "../Reviews/ReviewSection";
import EventCarouse from "../Events/EventCarouse";
import TeamTwo from "../Team/TeamTwo";
import ContactForm from "../Contacts/Contact-Form";

import CourseCarousel from "../Course/CourseCarousel";
import MoneyBackGuarantee from "../MoneyBack/MoneyBackGuarantee";
import ServiceSplash from "../Services/ServiceSplash";

import { UserCoursesServices } from "../../services/User/Courses/index.service";
import { UserHomeServices } from "../../services/User/index";
import ComparisonTable from "../Addon/ComparisonTable";
import MainDemoData from "../../data/course-details/courseData.json";

const MainDemo = ({ blogs }) => {
  const [topCourses, setTopCourses] = useState([]);
  const [upcomingCourses, setUpcomingCourses] = useState([]);
  const [bundleCourses, setBundleCourses] = useState([]);
  const [homeSettings, setHomeSettings] = useState({});
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await UserHomeServices.getAllCourses();

        if (res && res.success) {
          const adaptedCourses = res.data.map((item) => {
            return {
              id: item.id,
              slug: item.slug,
              courseImg: item.file?.url || "/images/course/course-online-01.jpg",
              courseTitle: item.title,
              desc: item.desc || "",
              lesson: item.number_of_lectures,
              student: item.enrolled_users_count,
              review: 0,
              rating: item.ratings,
              price: item.discounted_price,
              offPrice: item.actual_price,
              offPricePercentage: item.actual_price > 0
                ? Math.round(((item.actual_price - item.discounted_price) / item.actual_price) * 100)
                : 0,
              is_live: item.is_live
            };
          });

          setTopCourses(adaptedCourses.filter(c => c.is_live).slice(0, 4));
          setUpcomingCourses(adaptedCourses.filter(c => !c.is_live).slice(0, 4));

        } else {
          console.error("API success false or invalid response", res);
        }

        // Static Bundle Courses
        const staticBundles = MainDemoData.courseDetails.map((item) => {
          let img = item.courseImg || "/images/course/course-online-01.jpg";
          // If it's a placeholder URL, try to set it to 710x488
          if (typeof img === 'string' && img.includes('placeholder')) {
            img = img.replace('400x117', '710x488').replace('400/117', '710/488');
          }
          return {
            id: item.id,
            slug: item.id, // Using ID as slug for static data if slug is missing
            courseImg: img,
            courseTitle: item.courseTitle,
            desc: item.desc || "",
            lesson: item.lesson,
            student: item.student,
            review: item.review,
            rating: item.star,
            price: item.price,
            offPrice: item.offPrice,
            offPricePercentage: item.offPrice > 0
              ? Math.round(((item.offPrice - item.price) / item.offPrice) * 100)
              : 0,
          }
        });
        setBundleCourses(staticBundles.slice(0, 4));

      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    const fetchHomeSettings = async () => {
      try {
        const res = await UserHomeServices.UserHome();
        if (res && res.status === 'success') {
          const settingsMap = {};
          res.data.forEach(item => {
            settingsMap[item.key] = item.value;
          });
          setHomeSettings(settingsMap);
        }
      } catch (error) {
        console.error("Error fetching home settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
    fetchHomeSettings();
  }, []);

  useEffect(() => {
    sal({
      threshold: 0.01,
      once: true,
    });
  }, [topCourses, upcomingCourses, bundleCourses]);

  return (
    <>
      <main className="rbt-main-wrapper">
        <div className="rbt-banner-area rbt-banner-1">
          <MainDemoBanner courses={topCourses} settings={homeSettings.hero_section} loading={loading} />
          {!homeSettings.hero_section && !loading && <p className="text-center">hero_section I didn't find</p>}
        </div>

        {/* Top Courses */}
        <CourseCarousel
          courses={topCourses}
          title={<>Histudy Course student <br /> can join with us.</>}
          subTitle="Top Popular Course"
        />

        {/* Coming Soon */}
        <CourseCarousel
          courses={upcomingCourses}
          title={<>Explore Our Upcoming <br /> Courses & Learning Paths</>}
          subTitle="Coming Soon"
        />

        {/* Course Bundles */}
        <CourseCarousel
          courses={bundleCourses}
          title={<>Get More For Less <br /> With Our Exclusive Bundles</>}
          subTitle="Course Bundles"
        />

        {/* Money Back Guarantee */}
        {homeSettings.moneyback_section ? (
          <MoneyBackGuarantee settings={homeSettings.moneyback_section} />
        ) : !loading ? (
          <div className="container mt-5 mb-5"><p className="text-center">moneyback_section I didn't find</p></div>
        ) : null}


        {/* Why Us */}
        {homeSettings.whyus_section ? (
          <div className="rbt-splash-service-area rbt-section-gapBottom">
            <div className="container">
              <ServiceSplash settings={homeSettings.whyus_section} />
            </div>
          </div>
        ) : (
          !loading && <div className="container my-5"><p className="text-center">whyus_section I didn't find</p></div>
        )}

        {/* Why Us (using AboutTwo) */}
        {/* <div className="rbt-about-area bg-color-white rbt-section-gapTop pb_md--80 pb_sm--80 about-style-1">
          <div className="container">
            <ParallaxProvider>
              <AboutTwo />
            </ParallaxProvider>
          </div>
        </div> */}

        {/* AddOnn In Numbers (Counter) */}
        <div className="rbt-counterup-area bg-color-extra2 rbt-section-gapBottom default-callto-action-overlap" style={{ paddingTop: '60px' }}>
          <div className="container">
            {homeSettings.counters ? (
              <Counter isDesc={false} settings={homeSettings.counters} />
            ) : !loading ? (
              <p className="text-center">counters I didn't find</p>
            ) : null}
          </div>
        </div>

        {/* AddOnn Advantage */}
        {/* <AddonAdvantage /> */}
        {homeSettings.comparison ? (
          <ComparisonTable settings={homeSettings.comparison} />
        ) : !loading ? (
          <div className="container mt-5 mb-5"><p className="text-center">comparison I didn't find</p></div>
        ) : null}

        {/* Reviews */}
        <div className="rbt-testimonial-area bg-color-white rbt-section-gap overflow-hidden">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-3 left-content">
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
              <div className="col-lg-9">
                <div className="testimonial-cards-wrapper" style={{ width: "100vw" }}>
                  <ReviewSection />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="rbt-event-area rbt-section-gap bg-gradient-3">
          <div className="container">
            <div className="row mb--55">
              <div className="section-title text-center">
                <span className="subtitle bg-white-opacity">
                  STIMULATED TO TAKE PART IN?
                </span>
                <h2 className="title color-white">Testimonials</h2>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12">
                <EventCarouse />
              </div>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="rbt-team-area bg-color-white rbt-section-gap">
          <div className="container">
            {/* <div className="row mb--60">
              <div className="col-lg-12">
                <div className="section-title text-center">
                  <span className="subtitle bg-primary-opacity">
                    Our Teacher
                  </span>
                  <h2 className="title">Whose Inspirations You</h2>
                </div>
              </div>
            </div> */}
            <TeamTwo />
          </div>
        </div>

        {/* Contact Us */}
        <div className="rbt-contact-area bg-color-extra2 rbt-section-gap">
          <ContactForm />
        </div>

        {/* <div className="rbt-rbt-blog-area rbt-section-gap bg-color-extra2">
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
        </div> */}

        {/* <div className="rbt-newsletter-area newsletter-style-2 bg-color-primary rbt-section-gap">
          <NewsletterTwo />
        </div> */}
      </main>
    </>
  );
};

export default MainDemo;
