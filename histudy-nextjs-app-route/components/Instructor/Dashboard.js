"use client";

import React, { useEffect, useState } from "react";
import CounterWidget from "./Dashboard-Section/widgets/CounterWidget";
import { UserAuthServices } from "../../services/User";

import { useAppContext } from "../../context/Context";

const Dashboard = () => {
  const { userData, loadingUser } = useAppContext();

  if (loadingUser) {
    return (
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box mb--60">
        <div className="content">
          <div className="section-title">
            <h4 className="rbt-title-style-3">Dashboard</h4>
          </div>
          <div className="row g-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="col-lg-3 col-md-6 col-sm-6 col-12">
                <div className="skeleton" style={{ height: "150px", borderRadius: "10px" }}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const u = userData || {};

  return (
    <>
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box mb--60">
        <div className="content">
          <div className="section-title">
            <h4 className="rbt-title-style-3">Dashboard</h4>
          </div>
          <div className="row g-5">
            <div className="col-lg-3 col-md-6 col-sm-6 col-12">
              <CounterWidget
                counterStyle="two"
                styleClass="bg-primary-opacity"
                iconClass="bg-primary-opacity"
                numberClass="color-primary"
                icon="feather-book-open"
                title="Enrolled"
                value={u.total_courses || 0}
              />
            </div>
            <div className="col-lg-3 col-md-6 col-sm-6 col-12">
              <CounterWidget
                counterStyle="two"
                styleClass="bg-secondary-opacity"
                iconClass="bg-secondary-opacity"
                numberClass="color-secondary"
                icon="feather-monitor"
                title="Active"
                value={u.active_enrollments_count || 0}
              />
            </div>
            <div className="col-lg-3 col-md-6 col-sm-6 col-12">
              <CounterWidget
                counterStyle="two"
                styleClass="bg-violet-opacity"
                iconClass="bg-violet-opacity"
                numberClass="color-violet"
                icon="feather-award"
                title="Completed"
                value={u.completed_enrollments_count || 0}
              />
            </div>
            <div className="col-lg-3 col-md-6 col-sm-6 col-12">
              <CounterWidget
                counterStyle="two"
                styleClass="bg-pink-opacity"
                iconClass="bg-pink-opacity"
                numberClass="color-pink"
                icon="feather-refresh-ccw"
                title="Refunded"
                value={u.refunded_enrollments_count || 0}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
