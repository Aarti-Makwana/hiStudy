"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { UserReviewServices } from "../../services/User";
import Loader from "../Common/Loader";

const ReviewSection = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await UserReviewServices.getAllReviews();
        if (res && res.success) {
          setReviews(res?.data);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  if (loading) {
    return <Loader />;
  }

  const half = Math.ceil(reviews.length / 2);
  const firstRow = reviews.slice(0, half);
  const secondRow = reviews.slice(half);

  const renderReviewCard = (review) => (
    <div className="rbt-testimonial-box testimonial-card-style" key={review.id}>
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
              {review.user_profession && <p className="designation">{review.user_profession}</p>}
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
  );

  return (
    <>
      <div className="scroll-animation-wrapper mt--50">
        <div className="scroll-animation scroll-right-left">
          {firstRow.map(renderReviewCard)}
          {firstRow.map(renderReviewCard)}
        </div>
      </div>
      <div className="scroll-animation-wrapper mt--30">
        <div className="scroll-animation scroll-left-right">
          {secondRow.map(renderReviewCard)}
          {secondRow.map(renderReviewCard)}
        </div>
      </div>
    </>
  );
};

export default ReviewSection;