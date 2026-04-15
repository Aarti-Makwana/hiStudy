import React, { useState } from "react";
import Link from "next/link";

const initialReviews = [
  {
    id: 1,
    courseName: "Speaking Korean for Beginners",
    rating: 4,
    reviewText: "Good",
    timestamp: "02-03-2026 6:39 PM",
  },
  {
    id: 2,
    courseName: "Introduction to Calculus",
    rating: 5,
    reviewText: "Excellent content and pacing.",
    timestamp: "03-03-2026 10:15 AM",
  },
  {
    id: 3,
    courseName: "How to Write Your First Novel",
    rating: 1,
    reviewText: "Needs better examples.",
    timestamp: "05-03-2026 8:20 PM",
  },
];

const Reviews = () => {
  const [reviews, setReviews] = useState(initialReviews);
  const [editReviewId, setEditReviewId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editText, setEditText] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);

  const openEditModal = (review) => {
    setEditReviewId(review.id);
    setEditRating(review.rating);
    setEditText(review.reviewText);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditReviewId(null);
    setEditRating(0);
    setEditText("");
  };

  const handleSave = () => {
    setReviews((prevReviews) =>
      prevReviews.map((review) =>
        review.id === editReviewId
          ? { ...review, rating: editRating, reviewText: editText }
          : review
      )
    );
    closeEditModal();
  };

  const handleDelete = (reviewId) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      setReviews((prevReviews) => prevReviews.filter((review) => review.id !== reviewId));
    }
  };

  const renderStars = (value, clickable = false, onChange) => {
    return Array.from({ length: 5 }, (_, index) => {
      const starIndex = index + 1;
      const active = starIndex <= value;
      return (
        <button
          key={starIndex}
          type={clickable ? "button" : "button"}
          className={`rbt-btn btn-star ${active ? "active" : ""} ${clickable ? "clickable" : ""}`}
          onClick={() => clickable && onChange(starIndex)}
          style={{
            background: "transparent",
            border: "none",
            padding: 0,
            marginRight: "4px",
            cursor: clickable ? "pointer" : "default",
            color: active ? "#ffb400" : "#d4d4d4",
          }}
          aria-label={`${starIndex} star${starIndex > 1 ? "s" : ""}`}
        >
          <i className="fas fa-star"></i>
        </button>
      );
    });
  };

  return (
    <>
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
        <div className="content">
          <div className="section-title">
            <h4 className="rbt-title-style-3">Reviews</h4>
          </div>

          <div className="rbt-dashboard-table table-responsive mobile-table-750">
            <table className="rbt-table table table-borderless">
              <thead>
                <tr>
                  <th>Course Name</th>
                  <th>Rating</th>
                  <th>Review</th>
                  <th>Timestamp</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {reviews.length > 0 ? (
                  reviews.map((review) => {
                    const isDisabled = review.rating === 0 || review.rating === 1;
                    return (
                      <tr key={review.id}>
                        <th>
                          <span className="b3">
                            <Link href="#">{review.courseName}</Link>
                          </span>
                        </th>
                        <td>
                          <div className="rbt-review">
                            <div className="rating">{renderStars(review.rating)}</div>
                          </div>
                        </td>
                        <td>
                          <p className="b2">{review.reviewText}</p>
                        </td>
                        <td>
                          <p className="b2 mb--0">{review.timestamp}</p>
                        </td>
                        <td>
                          <div className="rbt-button-group justify-content-end">
                            <button
                              type="button"
                              className={`rbt-btn btn-xs bg-primary-opacity radius-round ${isDisabled ? "disabled" : ""}`}
                              onClick={() => !isDisabled && openEditModal(review)}
                              disabled={isDisabled}
                            >
                              <i className="feather-edit pl--0"></i> Edit
                            </button>
                            <button
                              type="button"
                              className={`rbt-btn btn-xs bg-color-danger-opacity radius-round color-danger ${isDisabled ? "disabled" : ""}`}
                              onClick={() => !isDisabled && handleDelete(review.id)}
                              disabled={isDisabled}
                            >
                              <i className="feather-trash-2 pl--0"></i> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-5">
                      No reviews available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showEditModal && (
        <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Review</h5>
                <button type="button" className="btn-close" onClick={closeEditModal}></button>
              </div>
              <div className="modal-body">
                <div className="mb--20">
                  <label className="form-label d-block mb--10">Rating</label>
                  <div className="d-flex align-items-center">{renderStars(editRating, true, setEditRating)}</div>
                </div>
                <div className="mb--20">
                  <label className="form-label d-block mb--10">Review</label>
                  <textarea
                    className="form-control"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="rbt-btn btn-border" onClick={closeEditModal}>
                  Cancel
                </button>
                <button type="button" className="rbt-btn btn-gradient" onClick={handleSave}>
                  Save
                </button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </div>
      )}
    </>
  );
};

export default Reviews;
