"use client";

import React, { useState, useEffect } from "react";

const ReviewModal = ({ show, onClose, onSubmit, initialRating = 0, initialReview = "" }) => {
    const [rating, setRating] = useState(initialRating);
    const [review, setReview] = useState(initialReview);

    useEffect(() => {
        setRating(initialRating);
        setReview(initialReview);
    }, [initialRating, initialReview, show]);

    if (!show) return null;

    return (
        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{initialRating ? "Edit Review" : "Write a Review"}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <div className="mb-3">
                            <label className="form-label">Rating</label>
                            <div className="rating">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <i
                                        key={star}
                                        className={`fas fa-star ${star <= rating ? "text-warning" : "text-secondary"}`}
                                        style={{ cursor: "pointer", marginRight: "5px" }}
                                        onClick={() => setRating(star)}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Review</label>
                            <textarea
                                className="form-control"
                                rows="4"
                                value={review}
                                onChange={(e) => setReview(e.target.value)}
                                placeholder="Write your review here..."
                            ></textarea>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => onSubmit(rating, review)}
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;
