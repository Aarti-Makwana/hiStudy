"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { showError, showSuccess } from "../../../../utils";
import { UserReviewServices, CertificateServices } from "../../../../services/User";

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
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [mounted, setMounted] = useState(false);
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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    document.body.style.overflow = showReviewModal ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showReviewModal, mounted]);

  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setReviewText("");
  };

  const handleReviewModalBackdropClick = (event) => {
    if (event.target.id === "course-review-modal-overlay") {
      handleCloseReviewModal();
    }
  };

  const handleSubmitReview = async (event) => {
    event.preventDefault();
    if (submittingReview) return;

    if (!reviewText.trim()) {
      showError("Please write your review before submitting.");
      return;
    }

    if (!userRating || userRating < 1) {
      showError("Please select a rating.");
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await UserReviewServices.giveReviewToCourse({
        course_id: data.id,
        review: reviewText,
        rating: userRating,
      });

      if (res?.success) {
        showSuccess("Review submitted successfully.");
        handleCloseReviewModal();
      } else {
        showError(res?.message || "Unable to submit review.");
      }
    } catch (error) {
      console.error("Review submit error", error);
      toast.error("Unable to submit your review at this time.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderReviewModal = () => (
    <div
      id="course-review-modal-overlay"
      className="modal fade show d-block"
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={handleReviewModalBackdropClick}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{ maxWidth: "500px" }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-content rbt-shadow-box">
          <div className="modal-header">
            <h5 className="modal-title">
              {userRating > 0 ? "Edit Review" : "Write a Review"}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleCloseReviewModal}
            ></button>
          </div>
          <form onSubmit={handleSubmitReview}>
            <div className="modal-body">
              <div className="text-center mb-4">
                <div className="rating" style={{ fontSize: "24px" }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <i
                      key={star}
                      className={`${star <= userRating ? "fas" : "far"} fa-star`}
                      onClick={() => setUserRating(star)}
                      style={{
                        color: "#E5BA12",
                        cursor: "pointer",
                        margin: "0 5px",
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="rbt-form-group">
                <label>Your Review</label>
                <textarea
                  className="w-100"
                  rows="4"
                  placeholder="Share your experience..."
                  style={{ border: "1px solid #ddd", padding: "8px", borderRadius: "4px" }}
                  value={reviewText}
                  onChange={(event) => setReviewText(event.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="rbt-btn btn-sm radius-round-10 btn-border"
                onClick={handleCloseReviewModal}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rbt-btn btn-sm radius-round-10 btn-gradient"
                disabled={submittingReview}
              >
                {submittingReview ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  const renderPortal = () => {
    if (!mounted) return null;
    return createPortal(renderReviewModal(), document.body);
  };

  const getCertificateStatus = () => {
    const status = data.certificateStatus?.toLowerCase();
    if (status === "granted" || status === "download now" || status === "downloaded") return "Download Certificate";
    if (status === "pending" || status === "requested") return "Request Pending";
    if (status === "rejected") return "Request Rejected";
    return "Request Certificate";
  };

  const handleCertificateRequest = async () => {
    try {
      const res = await CertificateServices.requestCertificate({
        enrollment_id: data.enrollment_id,
      });
      if (res?.success || res?.status === "success") {
        showSuccess(res?.message || "Certificate request sent successfully!");
        // We might want to trigger a profile refresh here, but for now just showing success
      } else {
        showError(res?.message || "Unable to send certificate request.");
      }
    } catch (error) {
      console.error("Certificate request error", error);
      showError("Error sending certificate request.");
    }
  };

  const handleDownloadCertificate = async (isAllowed) => {
    setShowQRModal(false);
    try {
      const res = await CertificateServices.downloadCertificate({
        enrollment_id: data.enrollment_id,
        is_allowed: isAllowed,
      });
      if (res?.success || res?.status === "success") {
        const downloadUrl = res.data?.download_url || res.data?.url;
        if (downloadUrl) {
          window.open(downloadUrl, "_blank");
          showSuccess("Downloading started...");
        } else {
          showError("Download URL not found in response.");
        }
      } else {
        showError(res?.message || "Unable to download certificate.");
      }
    } catch (error) {
      console.error("Certificate download error", error);
      showError("Error downloading certificate.");
    }
  };

  const handleCertificateClick = (e) => {
    e.preventDefault();
    const statusText = getCertificateStatus();
    if (statusText === "Download Certificate") {
      setShowQRModal(true);
    } else if (statusText === "Request Certificate") {
      handleCertificateRequest();
    }
  };

  return (
    <>
      <div className="rbt-card variation-01 rbt-hover">
        <div className="rbt-card-img">
          <Link href={`/course-details/${data.id}`}>
            {data.courseThumbnail ? (
              <Image
                width={330}
                height={227}
                src={data.courseThumbnail}
                alt={data.title}
              />
            ) : (
              <div style={{ width: "330px", height: "227px", backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span>No Image Available</span>
              </div>
            )}
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
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setReviewText(data.userReviewText || "");
                            setUserRating(data.userRating || data.rating.average || 0);
                            setShowReviewModal(true);
                          }}
                          className="ms-2 text-primary"
                          style={{ fontSize: "14px", textDecoration: "underline", border: "none", background: "none", cursor: "pointer", padding: "0" }}
                        >
                          (Edit)
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setReviewText("");
                          setUserRating(0);
                          setShowReviewModal(true);
                        }}
                        className="text-primary"
                        style={{ fontSize: "14px", textDecoration: "underline", border: "none", background: "none", cursor: "pointer", padding: "0" }}
                      >
                        (Write us a review)
                      </button>
                    )}
                  </span>
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
              {data.lectures || "N/A"} Lecture
            </li>
            <li>
              <i className="feather-clock" />
              {data.courseDuration || "N/A"} Duration
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
                  className={`rbt-btn btn-sm w-100 text-center ${getCertificateStatus() === "Download Certificate"
                    ? "btn-gradient"
                    : "bg-primary-opacity"
                    }`}
                >
                  {getCertificateStatus()}
                </button>
                {data.certificateMessage && (
                  <div style={{ marginTop: "10px", padding: "8px", backgroundColor: "#fff3cd", borderRadius: "4px", fontSize: "12px", color: "#856404" }}>
                    {data.certificateMessage}
                  </div>
                )}
              </div>
            </>
          ) : (
            ""
          )}

          {/* Review Modal */}
          {showReviewModal && renderPortal()}

          {/* QR Modal */}
          {showQRModal && (
            <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", position: "fixed", top: "0", left: "0", width: "100%", height: "100%", zIndex: "9999", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowQRModal(false)}>
              <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "500px" }} onClick={(e) => e.stopPropagation()}>
                <div className="modal-content rbt-shadow-box pt--30 pb--30">
                  <div className="modal-header border-0 pb-0 justify-content-end">
                    <button type="button" className="btn-close" onClick={() => setShowQRModal(false)}></button>
                  </div>
                  <div className="modal-body text-center pt-0">
                    <i className="feather-help-circle text-primary mb--20" style={{ fontSize: "50px" }}></i>
                    <h5 className="mb--20">QR Confirmation</h5>
                    <p>Do you want to print QR on the certificate to publicly access your report card?</p>
                  </div>
                  <div className="modal-footer justify-content-center border-0 gap-3">
                    <button className="rbt-btn btn-gradient btn-sm radius-round-10" style={{ height: "40px", lineHeight: "40px", padding: "0 25px" }} onClick={() => handleDownloadCertificate(true)}>Yes</button>
                    <button className="rbt-btn btn-border btn-sm radius-round-10" style={{ height: "40px", lineHeight: "40px", padding: "0 25px" }} onClick={() => handleDownloadCertificate(false)}>No</button>
                    <button className="rbt-btn btn-sm radius-round-10 bg-color-danger-opacity color-danger" style={{ height: "40px", lineHeight: "40px", padding: "0 25px", border: "none" }} onClick={() => setShowQRModal(false)}>Cancel</button>
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
