"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { UserReviewServices } from "../../../services/User";
import Loader from "../../../components/Common/Loader";

const ReviewPage = () => {
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchReviews = useCallback(async (pageNum) => {
    setLoading(true);
    try {
      const res = await UserReviewServices.getAllReviews({ per_page: 9, page: pageNum });
      if (res && res.success) {
        const verifiedReviews = res.data.filter(review => review.verified === 1);
        if (pageNum === 1) {
          setReviews(verifiedReviews);
        } else {
          setReviews(prev => [...prev, ...verifiedReviews]);
        }
        if (res.meta.current_page >= res.meta.last_page) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews(1);
  }, [fetchReviews]);

  const handleScroll = useCallback(() => {
    if (loading || !hasMore) return;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    if (scrollTop + windowHeight >= documentHeight - 100) {
      setPage(prev => prev + 1);
    }
  }, [loading, hasMore]);

  useEffect(() => {
    if (page > 1) {
      fetchReviews(page);
    }
  }, [page, fetchReviews]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const renderReviewCard = (review) => (
    <div className="col-lg-4 col-md-6 col-sm-6 col-12 mt--30" key={review.id}>
      <div className="rbt-testimonial-box testimonial-card-style">
        <div className="inner">
          <div className="header">
            <div className="clint-info-wrapper">
              <div className="thumb">
                <Image
                  src={review.file?.url || "/images/client/client-01.png"}
                  width={494}
                  height={494}
                  alt="Client Images"
                />
              </div>
              <div className="client-info">
                <h5 className="title">{review.name}</h5>
                {review.user_profession ? (
                  <p className="designation">{review.user_profession}</p>
                ) : (
                  <p className="designation">Student</p>
                )}
              </div>
            </div>
            <div className="quote-icon">
              <i className="feather-quote"></i>
            </div>
          </div>
          <div className="description">
            <p className="subtitle-3">{review.review}</p>
            <div className="footer-content">
              <div className="rbt-review">
                <div className="rating">
                  {[...Array(5)].map((_, i) => (
                    <i
                      key={i}
                      className={`fas fa-star ${i < Math.round(parseFloat(review.rating)) ? "" : "off"}`}
                    ></i>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <main className="rbt-main-wrapper">
      <div className="rbt-breadcrumb-default ptb--100 ptb_md--50 ptb_sm--30 bg-gradient-1">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="breadcrumb-inner text-center">
                <h1 className="title">Student Reviews</h1>
                <ul className="page-list">
                  <li className="rbt-breadcrumb-item">
                    <a href="/">Home</a>
                  </li>
                  <li>
                    <div className="icon-right">
                      <i className="feather-chevron-right"></i>
                    </div>
                  </li>
                  <li className="rbt-breadcrumb-item active">Reviews</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rbt-course-area bg-color-white rbt-section-gap">
        <div className="container">
          <div className="row mb--60">
            <div className="col-lg-12">
              <div className="section-title text-center">
                <span className="subtitle bg-primary-opacity">REVIEWS</span>
                <h2 className="title">What Our Students Say</h2>
              </div>
            </div>
          </div>
          <div className="row g-5">
            {reviews.map(renderReviewCard)}
            {loading && <Loader />}
            {!hasMore && <div className="col-12 text-center">No more reviews</div>}
          </div>
        </div>
      </div>
    </main>
  );
};

export default ReviewPage;