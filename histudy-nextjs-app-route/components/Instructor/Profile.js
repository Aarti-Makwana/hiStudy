"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserAuthServices } from "../../services/User";
import { getToken } from "../../utils/storage";
import { getLocalStorageToken } from "../../utils";

import { useAppContext } from "../../context/Context";

const Profile = () => {
  const { userData, loadingUser } = useAppContext();
  const router = useRouter();

  if (loadingUser) {
    return (
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
        <div className="content">Loading profile...</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
        <div className="content">No profile data found.</div>
      </div>
    );
  }

  const p = userData || {};
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
              <div className="rbt-profile-content b2">Registration</div>
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
              <div className="rbt-profile-content b2">Middle Name</div>
            </div>
            <div className="col-lg-8 col-md-8">
              <div className="rbt-profile-content b2">{prof.middle_name || "-"}</div>
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
              <div className="rbt-profile-content b2">Email</div>
            </div>
            <div className="col-lg-8 col-md-8">
              <div className="rbt-profile-content b2">{p.email || "-"}</div>
            </div>
          </div>
          <div className="rbt-profile-row row row--15 mt--15">
            <div className="col-lg-4 col-md-4">
              <div className="rbt-profile-content b2">Phone</div>
            </div>
            <div className="col-lg-8 col-md-8">
              <div className="rbt-profile-content b2">{p.phone || "-"}</div>
            </div>
          </div>
          <div className="rbt-profile-row row row--15 mt--15">
            <div className="col-lg-4 col-md-4">
              <div className="rbt-profile-content b2">Profession/Occupation</div>
            </div>
            <div className="col-lg-8 col-md-8">
              <div className="rbt-profile-content b2">{p.profession || prof.profession || "-"}</div>
            </div>
          </div>
          <div className="rbt-profile-row row row--15 mt--15">
            <div className="col-lg-4 col-md-4">
              <div className="rbt-profile-content b2">University/Company</div>
            </div>
            <div className="col-lg-8 col-md-8">
              <div className="rbt-profile-content b2">{prof.university || prof.company || p.university || "-"}</div>
            </div>
          </div>
          {(prof.bio || p.status) && (
            <div className="rbt-profile-row row row--15 mt--15">
              <div className="col-lg-4 col-md-4">
                <div className="rbt-profile-content b2">Bio</div>
              </div>
              <div className="col-lg-8 col-md-8">
                <div className="rbt-profile-content b2">
                  {prof.bio || p.status}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;
