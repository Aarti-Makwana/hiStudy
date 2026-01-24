"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

import { Swiper, SwiperSlide } from "swiper/react";

import { Navigation, Pagination, Autoplay } from "swiper/modules";

import { UserCoursesServices } from "../../services/index";

const EventCarouse = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [swiperInstance, setSwiperInstance] = useState(null);

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
    if (swiperInstance) {
      swiperInstance.autoplay.stop();
    }
  };

  const handleStopVideo = () => {
    setPlayingVideo(null);
    if (swiperInstance) {
      swiperInstance.autoplay.start();
    }
  };

  return (
    <>
      <Swiper
        className="swiper event-activation-1 rbt-arrow-between rbt-dot-bottom-center pb--60 icon-bg-primary"
        slidesPerView={1}
        spaceBetween={30}
        modules={[Navigation, Pagination, Autoplay]}
        onSwiper={setSwiperInstance}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
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
            slidesPerView: 4,
          },
        }}
      >
        {testimonials.map((testimonial) => (
          <SwiperSlide className="swiper-wrapper" key={testimonial.id}>
            <div className="swiper-slide">
              <div
                className={`video-testimonial-card ${playingVideo === testimonial.id ? "video-playing" : ""}`}
                onClick={() => handlePlayVideo(testimonial.id)}
              >
                <div className="thumbnail">
                  {playingVideo === testimonial.id ? (
                    <video
                      controls
                      autoPlay
                      width="100%"
                      height="100%"
                      src={testimonial.video?.url}
                      style={{ objectFit: "contain", position: "absolute", top: 0, left: 0, backgroundColor: "#000" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Optional: toggle stop on click if already playing, 
                        // but let's just make sure it stops when finished
                      }}
                      onEnded={handleStopVideo}
                    />
                  ) : (
                    <Image
                      src={testimonial.thumbnail?.url || "/images/testimonial/client-01.png"}
                      width={494}
                      height={650}
                      alt={testimonial.name}
                      style={{ height: '100%', objectFit: 'cover' }}
                    />
                  )}
                </div>

                {playingVideo !== testimonial.id && (
                  <>
                    <div className="play-btn">
                      <i className="feather-play"></i>
                    </div>
                    <div className="card-content">
                      <h5 className="title">{testimonial.name}</h5>
                      <div className="rating">
                        {[...Array(5)].map((_, i) => (
                          <i
                            key={i}
                            className={`fas fa-star ${i < Math.round(parseFloat(testimonial.rating || 5)) ? "" : "off"}`}
                          ></i>
                        ))}
                      </div>
                    </div>
                  </>
                )}
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
