"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

const CourseCarousel = ({ courses, title, subTitle }) => {
  return (
    <div className="rbt-course-area ">
      <div className="container">
        <div className="row mb--60">
          <div className="col-lg-12">
            <div className="section-title text-center">
              {subTitle && (
                <span className="subtitle bg-secondary-opacity">
                  {subTitle}
                </span>
              )}
              {title && (
                <h2 className="title">
                  {title}
                </h2>
              )}
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-12">
            <Swiper
              className="swiper rbt-arrow-between rbt-dot-bottom-center pb--60 icon-bg-primary"
              slidesPerView={1}
              spaceBetween={30}
              modules={[Navigation, Pagination]}
              pagination={{
                el: ".rbt-swiper-pagination",
                clickable: true,
              }}
              navigation={{
                nextEl: ".rbt-arrow-right",
                prevEl: ".rbt-arrow-left",
              }}
              breakpoints={{
                481: {
                  slidesPerView: 1,
                },
                768: {
                  slidesPerView: 2,
                },
                992: {
                  slidesPerView: 3,
                },
              }}
            >
              {courses.map((data, index) => (
                <SwiperSlide key={index}>
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

                      <div
                        className="rbt-card-text"
                        dangerouslySetInnerHTML={{ __html: data.desc }}
                      ></div>

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
                </SwiperSlide>
              ))}

              <div className="rbt-swiper-arrow rbt-arrow-left">
                <div className="custom-overfolow">
                  <i className="rbt-icon feather-arrow-left"></i>
                  <i className="rbt-icon-top feather-arrow-left"></i>
                </div>
              </div>

              <div className="rbt-swiper-arrow rbt-arrow-right">
                <div className="custom-overfolow">
                  <i className="rbt-icon feather-arrow-right"></i>
                  <i className="rbt-icon-top feather-arrow-right"></i>
                </div>
              </div>

              <div className="rbt-swiper-pagination" style={{ bottom: "0" }}></div>
            </Swiper>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCarousel;
