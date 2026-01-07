import Image from "next/image";
import Link from "next/link";

import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCards, Pagination, Autoplay } from "swiper/modules";

import MainDemoData from "../../../data/course-details/courseData.json";

const HomeCourses = ({ start, end, courses }) => {
  const displayCourses = courses && courses.length > 0
    ? courses.slice(start, end)
    : MainDemoData.courseDetails.slice(start, end);

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
              <div className="rbt-card variation-01 rbt-hover">
                <div className="rbt-card-img">
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
                    <Link href={`/course-details/${data.slug || data.id}`}>
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
                      href={`/course-details/${data.slug || data.id}`}
                    >
                      Learn More
                      <i className="feather-arrow-right"></i>
                    </Link>
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
