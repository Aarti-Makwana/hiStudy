"use client";

import React, { useEffect, useState } from "react";
import { UserAuthServices } from "../../services/User";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await UserAuthServices.getUserDataService();
        if (!res) {
          throw new Error("Failed to fetch profile");
        }
        if (res.status && res.status !== "success") {
          throw new Error(res.message || "Failed to fetch profile");
        }
        setProfile(res.data || res);
      } catch (err) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
        <div className="content">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
        <div className="content">Error: {error}</div>
      </div>
    );
  }

  const p = profile || {};
  const prof = p.profile || {};

  return (
    <>
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
        <div className="content">
          <div className="section-title">
            <h4 className="rbt-title-style-3">My Profile</h4>
          </div>
          <div className="rbt-profile-row row row--15">
            <div className="col-lg-4 col-md-4">
              <div className="rbt-profile-content b2">Registration Date</div>
            </div>
            <div className="col-lg-8 col-md-8">
              <div className="rbt-profile-content b2">{p.created_at || "-"}</div>
            </div>
          </div>
          <div className="rbt-profile-row row row--15 mt--15">
            <div className="col-lg-4 col-md-4">
              <div className="rbt-profile-content b2">First Name</div>
            </div>
            <div className="col-lg-8 col-md-8">
              <div className="rbt-profile-content b2">{prof.first_name || "-"}</div>
            </div>
          </div>
          <div className="rbt-profile-row row row--15 mt--15">
            <div className="col-lg-4 col-md-4">
              <div className="rbt-profile-content b2">Last Name</div>
            </div>
            <div className="col-lg-8 col-md-8">
              <div className="rbt-profile-content b2">{prof.last_name || "-"}</div>
            </div>
          </div>
          <div className="rbt-profile-row row row--15 mt--15">
            <div className="col-lg-4 col-md-4">
              <div className="rbt-profile-content b2">Username</div>
            </div>
            <div className="col-lg-8 col-md-8">
              <div className="rbt-profile-content b2">{p.name || "-"}</div>
            </div>
          </div>
          <div className="rbt-profile-row row row--15 mt--15">
            <div className="col-lg-4 col-md-4">
              <div className="rbt-profile-content b2">Email</div>
            </div>
            <div className="col-lg-8 col-md-8">
              <div className="rbt-profile-content b2">{p.email || "-"}</div>
            </div>
          </div>
          <div className="rbt-profile-row row row--15 mt--15">
            <div className="col-lg-4 col-md-4">
              <div className="rbt-profile-content b2">Phone Number</div>
            </div>
            <div className="col-lg-8 col-md-8">
              <div className="rbt-profile-content b2">{p.phone || "-"}</div>
            </div>
          </div>
          <div className="rbt-profile-row row row--15 mt--15">
            <div className="col-lg-4 col-md-4">
              <div className="rbt-profile-content b2">Skill/Occupation</div>
            </div>
            <div className="col-lg-8 col-md-8">
              <div className="rbt-profile-content b2">{p.profession || "-"}</div>
            </div>
          </div>
          <div className="rbt-profile-row row row--15 mt--15">
            <div className="col-lg-4 col-md-4">
              <div className="rbt-profile-content b2">Biography</div>
            </div>
            <div className="col-lg-8 col-md-8">
              <div className="rbt-profile-content b2">{prof.bio || p.status || "-"}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
