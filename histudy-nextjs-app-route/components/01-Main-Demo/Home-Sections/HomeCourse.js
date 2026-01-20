import Image from "next/image";
import Link from "next/link";

import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCards, Pagination, Autoplay } from "swiper/modules";

import MainDemoData from "../../../data/course-details/courseData.json";

const HomeCourses = ({ start, end, courses }) => {
  const isLoading = !courses || courses.length === 0;
  const displayCourses = courses && courses.length > 0 ? courses.slice(start, end) : [1, 2, 3]; // Mock data for skeleton

  return (
    <>
      <Swiper
        className="swiper-wrapper"
        effect={"cards"}
        modules={[EffectCards, Pagination, Autoplay]}
        grabCursor={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        pagination={{
          el: ".rbt-swiper-pagination",
          clickable: true,
        }}
      >
        {displayCourses &&
          displayCourses.map((data, index) => (
            <SwiperSlide className="swiper-slide" key={index}>
              <div className={`rbt-card variation-01 rbt-hover ${isLoading ? "skeleton-card" : ""}`}>
                <div className={`rbt-card-img ${isLoading ? "rbt-skeleton-loading" : ""}`} style={isLoading ? { height: '240px', width: '100%' } : {}}>
                  {!isLoading ? (
                    <Link href={`/course-details/${data.slug || data.id}`}>
                      <Image
                        src={data.courseImg}
                        width={710}
                        height={488}
                        alt="Card image"
                      />
                      {(data.offPricePercentage || data.discount) > 0 && (
                        <div className="rbt-badge-3 bg-white">
                          <span>-{data.offPricePercentage || data.discount}%</span>
                          <span>Off</span>
                        </div>
                      )}
                    </Link>
                  ) : null}
                </div>
                <div className="rbt-card-body">
                  <ul className="rbt-meta">
                    <li className={isLoading ? "rbt-skeleton-loading" : ""} style={isLoading ? { width: '80px', height: '14px' } : {}}>
                      {!isLoading && (
                        <>
                          <i className="feather-book"></i>
                          {data.lesson} Lessons
                        </>
                      )}
                    </li>
                    <li className={isLoading ? "rbt-skeleton-loading" : ""} style={isLoading ? { width: '80px', height: '14px' } : {}}>
                      {!isLoading && (
                        <>
                          <i className="feather-users"></i>
                          {data.student} Students
                        </>
                      )}
                    </li>
                  </ul>
                  <h4 className={`rbt-card-title ${isLoading ? "rbt-skeleton-loading" : ""}`} style={isLoading ? { width: '100%', height: '24px' } : {}}>
                    {!isLoading && (
                      <Link href={`/course-details/${data.slug || data.id}`}>
                        {data.courseTitle}
                      </Link>
                    )}
                  </h4>
                  <p className={`rbt-card-text ${isLoading ? "rbt-skeleton-loading" : ""}`} style={isLoading ? { width: '100%', height: '40px' } : {}}>
                    {!isLoading && data.desc?.substring(0, 100)}
                  </p>
                  <div className="rbt-review">
                    <div className={`rating ${isLoading ? "rbt-skeleton-loading" : ""}`} style={isLoading ? { width: '100px', height: '14px' } : {}}>
                      {!isLoading && [...Array(5)].map((_, i) => (
                        <i
                          key={i}
                          className={`fas fa-star ${i < Math.round(data.rating || 5) ? "" : "off"}`}
                          style={{ color: i < Math.round(data.rating || 5) ? "#ffc107" : "#e4e5e9" }}
                        ></i>
                      ))}
                    </div>
                    {!isLoading && (
                      <span className="rating-count">
                        ({data.review} Reviews)
                      </span>
                    )}
                  </div>
                  <div className="rbt-card-bottom">
                    <div className={`rbt-price ${isLoading ? "rbt-skeleton-loading" : ""}`} style={isLoading ? { width: '80px', height: '20px' } : {}}>
                      {!isLoading && (
                        <>
                          <span className="current-price">${data.price}</span>
                          <span className="off-price">${data.offPrice}</span>
                        </>
                      )}
                    </div>
                    {!isLoading && (
                      <Link
                        className="rbt-btn-link"
                        href={`/course-details/${data.slug || data.id}`}
                      >
                        Learn More
                        <i className="feather-arrow-right"></i>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        <div
          className="rbt-swiper-pagination"
          style={{ bottom: "-40px" }}
        ></div>
      </Swiper>
    </>
  );
};

export default HomeCourses;
