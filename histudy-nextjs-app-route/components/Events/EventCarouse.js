"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

import { Swiper, SwiperSlide } from "swiper/react";

import { Navigation, Pagination } from "swiper/modules";

import { UserCoursesServices } from "../../services/index";

const EventCarouse = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [playingVideo, setPlayingVideo] = useState(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await UserCoursesServices.UserAllTestimonials();
        if (res.success) {
          setTestimonials(res.data);
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error);
      }
    };
    fetchTestimonials();
  }, []);

  const handlePlayVideo = (id) => {
    setPlayingVideo(id);
  };

  return (
    <>
      <Swiper
        className="swiper event-activation-1 rbt-arrow-between rbt-dot-bottom-center pb--60 icon-bg-primary"
        slidesPerView={1}
        spaceBetween={30}
        modules={[Navigation, Pagination]}
        pagination={{
          el: ".rbt-swiper-pagination",
          clickable: true,
        }}
        navigation={{
          nextEl: ".rbt-arrow-left",
          prevEl: ".rbt-arrow-right",
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
        {testimonials.map((testimonial, index) => (
          <SwiperSlide className="swiper-wrapper" key={testimonial.id}>
            <div className="swiper-slide">
              <div className="single-slide">
                <div className="rbt-card testimonial-grid-card variation-01 rbt-hover-03" style={{ minHeight: '450px' }}>
                  <div className="rbt-card-img position-relative">
                    {playingVideo === testimonial.id ? (
                      <video
                        controls
                        autoPlay
                        width="100%"
                        height="240"
                        src={testimonial.video.url}
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <>
                        <Image
                          src={testimonial.thumbnail.url}
                          width={710}
                          height={240}
                          alt="Testimonial thumbnail"
                          style={{ objectFit: 'cover' }}
                        />
                        <button
                          className="rbt-btn rounded-player-2 popup-video position-to-top with-animation"
                          onClick={() => handlePlayVideo(testimonial.id)}
                          style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 2
                          }}
                        >
                          <span className="play-icon"></span>
                        </button>
                      </>
                    )}
                  </div>
                  <div className="rbt-card-body">
                    <h4 className="rbt-card-title">
                      {testimonial.name}
                    </h4>
                    <p className="description">{testimonial.review}</p>
                    <div className="rating mt--20">
                      {Array.from({ length: testimonial.rating }, (_, i) => (
                        <i key={i} className="fa fa-star"></i>
                      ))}
                    </div>
                  </div>
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
    </>
  );
};

export default EventCarouse;
