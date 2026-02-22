"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { UserAuthServices } from "../../services/User";

import { useAppContext } from "../../context/Context";

const Reviews = () => {
  const { userData, loadingUser, fetchUserProfile } = useAppContext();

  // Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentReview, setCurrentReview] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editReviewText, setEditReviewText] = useState("");

  if (loadingUser) return <div className="skeleton" style={{ height: "400px" }}></div>;

  const u = userData || {};
  const reviews = u.reviews || [];

  const handleEditClick = (review) => {
    setCurrentReview(review);
    setEditRating(review.rating || 0);
    setEditReviewText(review.review || "");
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    // Mock API call to save review
    console.log("Saving Review:", { id: currentReview.id, rating: editRating, review: editReviewText });
    alert("Review updated successfully (Mock)");
    setShowEditModal(false);
    // await fetchUserProfile(); // Refresh data if API was real
  };

  const handleDelete = (review) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      console.log("Deleting Review:", review.id);
      alert("Review deleted successfully (Mock)");
    }
  };

  return (
    <>
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
        <div className="content">
          <div className="section-title">
            <h4 className="rbt-title-style-3">Reviews</h4>
          </div>
          <div className="advance-tab-button mb--30">
            <ul
              className="nav nav-tabs tab-button-style-2 justify-content-start"
              id="reviewTab-4"
              role="tablist"
            >
              <li role="presentation">
                <Link
                  href="#"
                  className="tab-button active"
                  id="received-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#received"
                  role="tab"
                  aria-controls="received"
                  aria-selected="true"
                >
                  <span className="title">Received</span>
                </Link>
              </li>
              <li role="presentation">
                <Link
                  href="#"
                  className="tab-button"
                  id="given-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#given"
                  role="tab"
                  aria-controls="given"
                  aria-selected="false"
                >
                  <span className="title">Given</span>
                </Link>
              </li>
            </ul>
          </div>
          <div className="tab-content">
            <div
              className="tab-pane fade active show"
              id="received"
              role="tabpanel"
              aria-labelledby="received-tab"
            >
              <div className="rbt-dashboard-table table-responsive mobile-table-750">
                <table className="rbt-table table table-borderless">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Date</th>
                      <th>Feedback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.length > 0 ? (
                      reviews.map((review, index) => (
                        <tr key={index}>
                          <th>{review.user?.name || "Student"}</th>
                          <td>{review.created_at}</td>
                          <td>
                            <span className="b3">
                              Course: <Link href="#">{review.item?.title || review.item?.course?.title || review.course?.title || review.item?.name || "N/A"}</Link>
                            </span>
                            <div className="rbt-review">
                              <div className="rating">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <i
                                    key={star}
                                    className={`${star <= review.rating ? "fas" : "far"} fa-star`}
                                    style={{ color: star <= review.rating ? "#E5BA12" : "#e1e1e1" }}
                                  />
                                ))}
                              </div>
                              <span className="rating-count"> ({review.rating} Stars)</span>
                            </div>
                            <p className="b2">{review.review}</p>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center">No reviews found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div
              className="tab-pane fade"
              id="given"
              role="tabpanel"
              aria-labelledby="given-tab"
            >
              <div className="rbt-dashboard-table table-responsive mobile-table-750">
                <table className="rbt-table table table-borderless">
                  <thead>
                    <tr>
                      <th>Course Name</th>
                      <th>Review</th>
                      <th>Timestamp</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.map((review, index) => (
                      <tr key={index}>
                        <th>{review.item?.title || review.item?.course?.title || review.course?.title || review.item?.name || "N/A"}</th>
                        <td>
                          <div className="rbt-review">
                            <div className="rating">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <i
                                  key={star}
                                  className={`${star <= (currentReview?.id === review.id ? editRating : review.rating) ? "fas" : "far"} fa-star`}
                                  style={{ color: star <= (currentReview?.id === review.id ? editRating : review.rating) ? "#E5BA12" : "#e1e1e1" }}
                                />
                              ))}
                            </div>
                            <span className="rating-count"> ({review.rating} Stars)</span>
                          </div>
                          <p className="b3">{review.review}</p>
                        </td>
                        <td>{review.created_at}</td>
                        <td>
                          <div className="rbt-button-group">
                            {review.status !== "verified" ? (
                              <>
                                <button
                                  className="rbt-btn-link left-icon border-0 bg-transparent"
                                  onClick={() => handleEditClick(review)}
                                >
                                  <i className="feather-edit" /> Edit
                                </button>
                                <button
                                  className="rbt-btn-link left-icon border-0 bg-transparent color-danger"
                                  onClick={() => handleDelete(review)}
                                >
                                  <i className="feather-trash-2" /> Delete
                                </button>
                              </>
                            ) : (
                              <span className="rbt-badge-5 bg-color-success-opacity color-success">Verified</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Review Modal */}
      {showEditModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 9999 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rbt-shadow-box">
              <div className="modal-header border-0 mt--20">
                <h5 className="modal-title">Edit Review</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="text-center mb-4">
                  <div className="rating" style={{ fontSize: "24px" }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i
                        key={star}
                        className={`${star <= editRating ? "fas" : "far"} fa-star pointer`}
                        onClick={() => setEditRating(star)}
                        style={{ color: "#E5BA12", cursor: "pointer", margin: "0 5px" }}
                      />
                    ))}
                  </div>
                  <p className="mt--10 b3">Rating: {editRating} Stars</p>
                </div>
                <div className="rbt-form-group">
                  <label htmlFor="reviewText" className="mb--10">Your Review</label>
                  <textarea
                    id="reviewText"
                    className="w-100"
                    rows="5"
                    value={editReviewText}
                    onChange={(e) => setEditReviewText(e.target.value)}
                    placeholder="Share your experience..."
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer border-0 mb--20">
                <button
                  className="rbt-btn btn-sm radius-round-10 btn-border"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="rbt-btn btn-sm radius-round-10 btn-gradient"
                  onClick={handleSaveEdit}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Reviews;
