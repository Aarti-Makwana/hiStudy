import React from "react";

const Review = ({ checkMatchCourses }) => {
  const rating = checkMatchCourses?.star || 0;
  return (
    <>
      <div className="course-content">
        <div className="section-title">
          <h4 className="rbt-title-style-3">Review</h4>
        </div>
        <div className="row g-5 align-items-center">
          <div className="col-lg-3">
            <div className="rating-box">
              <div className="rating-number">{rating}</div>
              <div className="rating">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    width={16}
                    height={16}
                    fill="currentColor"
                    className={`bi bi-star-fill ${i < Math.round(rating) ? "" : "off"}`}
                    viewBox="0 0 16 16"
                    style={{ color: i < Math.round(rating) ? "#ffc107" : "#e4e5e9" }}
                  >
                    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                  </svg>
                ))}
              </div>
              <span className="sub-title">Course Rating</span>
            </div>
          </div>
          <div className="col-lg-9">
            <div className="review-wrapper">
              {/*  In a real app, you would map over distribution data here. 
                  Since the API doesn't provide rating distribution yet, 
                  we will hide the detailed progress bars or show empty state if needed.
                  For now, I'll keep one example row with 0% or remove them to avoid misleading data.
                  User want to see correct data, so showing 0s is better than fake data.
             */}
              {[5, 4, 3, 2, 1].map((num) => (
                <div key={num} className="single-progress-bar">
                  <div className="rating-text">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        width={16}
                        height={16}
                        fill="currentColor"
                        className={`bi ${i < num ? "bi-star-fill" : "bi-star"}`}
                        viewBox="0 0 16 16"
                        style={{ color: i < num ? "#ffc107" : "" }}
                      >
                        {i < num ? (
                          <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                        ) : (
                          <path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.565.565 0 0 0-.163-.505L1.71 6.745l4.052-.576a.525.525 0 0 0 .393-.288L8 2.223l1.847 3.658a.525.525 0 0 0 .393.288l4.052.575-2.906 2.77a.565.565 0 0 0-.163.506l.694 3.957-3.686-1.894a.503.503 0 0 0-.461 0z" />
                        )}
                      </svg>
                    ))}
                  </div>
                  <div className="progress">
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{ width: "0%" }}
                      aria-valuenow="0"
                      aria-valuemin="0"
                      aria-valuemax="100"
                    ></div>
                  </div>
                  <span className="value-text">0%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Review;
