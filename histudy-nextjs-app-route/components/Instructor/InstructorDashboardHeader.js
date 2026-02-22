"use client";

import React from "react";
import Image from "next/image";
import { useAppContext } from "../../context/Context";

const InstructorDashboardHeader = () => {
  const { userData, loadingUser } = useAppContext();

  if (loadingUser) return <div className="rbt-dashboard-content-wrapper skeleton" style={{ height: '350px' }}></div>;

  const u = userData || {};
  const prof = u.profile || {};
  const avgRating = u.reviews_avg_rating || 0;
  const reviewsCount = u.reviews_count || 0;

  return (
    <>
      <div className="rbt-dashboard-content-wrapper">
        <div className="tutor-bg-photo bg_image bg_image--22 height-350" />
        <div className="rbt-tutor-information">
          <div className="rbt-tutor-information-left">
            <div className="thumbnail rbt-avatars size-lg">
              <Image
                width={300}
                height={300}
                src={prof.file?.url || "/images/team/avatar.jpg"}
                alt={u.name || "Instructor"}
              />
            </div>
            <div className="tutor-content">
              <h5 className="title">{u.name}</h5>
              <div className="rbt-review">
                <div className="rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <i
                      key={star}
                      className={`${star <= Math.round(avgRating) ? "fas" : "far"} fa-star`}
                      style={{ color: star <= Math.round(avgRating) ? "#E5BA12" : "#e1e1e1" }}
                    />
                  ))}
                </div>
                <span className="rating-count"> ({reviewsCount} Reviews)</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default InstructorDashboardHeader;
