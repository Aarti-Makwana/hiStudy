"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

const CourseWidget = ({
  data,
  courseStyle,
  showDescription,
  showAuthor,
  isProgress,
  isCompleted,
  isEdit,
}) => {
  const [userRating, setUserRating] = useState(data.rating.average || 0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [totalReviews, setTotalReviews] = useState("");
  const [rating, setRating] = useState("");

  const getDiscountPercentage = () => {
    let discount = data.coursePrice * ((100 - data.offerPrice) / 100);
    setDiscountPercentage(discount.toFixed(0));
  };

  const getTotalReviews = () => {
    let reviews =
      data.reviews.oneStar +
      data.reviews.twoStar +
      data.reviews.threeStar +
      data.reviews.fourStar +
      data.reviews.fiveStar;
    setTotalReviews(reviews);
  };

  const getTotalRating = () => {
    let ratingStar = data.rating.average;
    setRating(ratingStar.toFixed(0));
  };

  useEffect(() => {
    getDiscountPercentage();
    getTotalReviews();
    getTotalRating();
  }, [data]);

  const certificateStatus = () => {
    if (data.progressValue === 100) return "Download Certificate";
    if (data.progressValue > 70) return "Request Pending";
    return "Request Certificate";
  };

  const handleCertificateClick = (e) => {
    e.preventDefault();
    if (certificateStatus() === "Download Certificate") {
      setShowQRModal(true);
    } else if (certificateStatus() === "Request Certificate") {
      alert("Certificate Request Sent!");
    }
  };

  return (
    <>
      <div className="rbt-card variation-01 rbt-hover">
        <div className="rbt-card-img">
          <Link href={`/course-details/${data.id}`}>
            <Image
              width={330}
              height={227}
              src={data.courseThumbnail}
              alt={data.title}
            />
            <div className="rbt-badge-3 bg-white">
              <span>{`-${discountPercentage}%`}</span>
              <span>Off</span>
            </div>
          </Link>
        </div>
        <div className="rbt-card-body">
          {courseStyle === "two" && (
            <>
              <div className="rbt-card-top">
                <div className="rbt-review">
                  <div className="rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i
                        key={star}
                        className={`${star <= userRating ? "fas" : "far"
                          } fa-star`}
                        style={{ color: star <= userRating ? "#E5BA12" : "#e1e1e1" }}
                      />
                    ))}
                  </div>
                  <span className="rating-count">
                    {userRating > 0 ? (
                      <>
                        {userRating}{" "}
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setShowReviewModal(true);
                          }}
                          className="ms-2 text-primary"
                          style={{ fontSize: "14px", textDecoration: "underline" }}
                        >
                          (Edit)
                        </a>
                      </>
                    ) : (
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowReviewModal(true);
                        }}
                        className="text-primary"
                        style={{ fontSize: "14px", textDecoration: "underline" }}
                      >
                        (Write us a review)
                      </a>
                    )}
                  </span>
                </div>
                <div className="rbt-bookmark-btn">
                  <Link className="rbt-round-btn" title="Bookmark" href="#">
                    <i className="feather-bookmark" />
                  </Link>
                </div>
              </div>
              <h4 className="rbt-card-title">
                <Link href={`/course-details/${data.id}`}>{data.title}</Link>
              </h4>
            </>
          )}
          <ul className="rbt-meta">
            <li>
              <i className="feather-video" />
              {data.lectures} Lectures ({data.courseDuration})
            </li>
            <li>
              <i className="feather-users" />
              {data.enrolledStudent} Students
            </li>
          </ul>

          {isProgress ? (
            <>
              <div className="rbt-progress-style-1 mb--20 mt--10">
                <div className="single-progress">
                  <h6 className="rbt-title-style-2 mb--10">Complete</h6>
                  <div className="progress">
                    <div
                      className="progress-bar wow fadeInLeft bar-color-success"
                      data-wow-duration="0.5s"
                      data-wow-delay=".3s"
                      role="progressbar"
                      style={{ width: `${data.progressValue}%` }}
                      aria-valuenow={data.progressValue}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    ></div>
                    <span className="rbt-title-style-2 progress-number">
                      {data.progressValue}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="rbt-card-bottom">
                <button
                  onClick={handleCertificateClick}
                  className={`rbt-btn btn-sm w-100 text-center ${certificateStatus() === "Download Certificate"
                    ? "btn-gradient"
                    : "bg-primary-opacity"
                    }`}
                >
                  {certificateStatus()}
                </button>
              </div>
            </>
          ) : (
            ""
          )}

          {/* Review Modal */}
          {showReviewModal && (
            <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content rbt-shadow-box">
                  <div className="modal-header">
                    <h5 className="modal-title">{userRating > 0 ? "Edit Review" : "Write a Review"}</h5>
                    <button type="button" className="btn-close" onClick={() => setShowReviewModal(false)}></button>
                  </div>
                  <div className="modal-body">
                    <div className="text-center mb-4">
                      <div className="rating" style={{ fontSize: "24px" }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <i
                            key={star}
                            className={`${star <= userRating ? "fas" : "far"} fa-star pointer`}
                            onClick={() => setUserRating(star)}
                            style={{ color: "#E5BA12", cursor: "pointer", margin: "0 5px" }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="rbt-form-group">
                      <label>Your Review</label>
                      <textarea className="w-100" rows="4" placeholder="Share your experience..."></textarea>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button className="rbt-btn btn-sm radius-round-10 btn-border" onClick={() => setShowReviewModal(false)}>Cancel</button>
                    <button className="rbt-btn btn-sm radius-round-10 btn-gradient" onClick={() => setShowReviewModal(false)}>Submit</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* QR Modal */}
          {showQRModal && (
            <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content rbt-shadow-box pt--30 pb--30">
                  <div className="modal-body text-center">
                    <i className="feather-help-circle text-primary mb--20" style={{ fontSize: "50px" }}></i>
                    <h5 className="mb--20">QR Confirmation</h5>
                    <p>Do you want to print QR on the certificate to access your report card?</p>
                  </div>
                  <div className="modal-footer justify-content-center border-0">
                    <button className="rbt-btn btn-border btn-md radius-round-10" onClick={() => { setShowQRModal(false); alert("Downloading started (without QR)..."); }}>No</button>
                    <button className="rbt-btn btn-gradient btn-md radius-round-10" onClick={() => { setShowQRModal(false); alert("Downloading started (with QR)..."); }}>Yes</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {courseStyle === "one" && (
            <h4 className="rbt-card-title">
              <Link href="#">{data.title}</Link>
            </h4>
          )}

          {showDescription ? (
            <p className="rbt-card-text">{data.shortDescription}</p>
          ) : (
            ""
          )}

          {courseStyle === "two" && showAuthor && (
            <div className="rbt-author-meta mb--20">
              <div className="rbt-avater">
                <Link href="components/widgets#">
                  <Image
                    width={40}
                    height={40}
                    src="/images/client/avater-01.png"
                    alt="Sophia Jaymes"
                  />
                </Link>
              </div>
              <div className="rbt-author-info">
                By <Link href="#">Patrick</Link> In
                <Link href="#">Languages</Link>
              </div>
            </div>
          )}

          {courseStyle === "one" && (
            <div className="rbt-review">
              <div className="rating">
                {Array.from({ length: rating }, (_, i) => (
                  <i className="fas fa-star" key={i} />
                ))}
              </div>
              <span className="rating-count"> ({totalReviews} Reviews)</span>
            </div>
          )}

          {!isProgress ? (
            <div className="rbt-card-bottom">
              <div className="rbt-price">
                <span className="current-price">${data.offerPrice}</span>
                <span className="off-price">${data.coursePrice}</span>
              </div>

              {isEdit ? (
                <Link className="rbt-btn-link left-icon" href="#">
                  <i className="feather-edit"></i> Edit
                </Link>
              ) : (
                <Link className="rbt-btn-link" href="#">
                  Learn More
                  <i className="feather-arrow-right" />
                </Link>
              )}
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
    </>
  );
};

export default CourseWidget;
