"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

import { UserAuthServices } from "../../services/User";
import { getUser, setUser } from "../../utils/storage";

import { useAppContext } from "../../context/Context";

const Setting = () => {
  const { userData, fetchUserProfile } = useAppContext();
  const [form, setForm] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    profession: "",
    university: "",
    email: "",
    phone: "",
    bio: "",
    facebook: "",
    instagram: "",
    linkedin: "",
    website: "",
    github: "",
    twitter: "",
    otp: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [loading, setLoading] = useState(false);
  const [isPhoneEditable, setIsPhoneEditable] = useState(false);
  const [isEmailEditable, setIsEmailEditable] = useState(false);

  useEffect(() => {
    if (userData) {
      setForm({
        first_name: userData.profile?.first_name || userData.first_name || "",
        middle_name: userData.profile?.middle_name || "",
        last_name: userData.profile?.last_name || userData.last_name || "",
        profession: userData.profile?.profession || "",
        university: userData.profile?.university || "",
        email: userData.email || "",
        phone: userData.profile?.phone || userData.phone || "",
        bio: userData.profile?.bio || "",
        facebook: userData.profile?.facebook || "",
        instagram: userData.profile?.instagram || "",
        linkedin: userData.profile?.linkedin || "",
        website: userData.profile?.website || "",
        github: userData.profile?.github || "",
        twitter: userData.profile?.twitter || "",
        otp: "",
      });
    }
  }, [userData]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((s) => ({ ...s, [id]: value }));
  };

  const handlePasswordChange = (e) => {
    const { id, value } = e.target;
    setPasswordForm((s) => ({ ...s, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Call the updateProfileService with nested socials
      const body = {
        bio: form.bio,
        profession: form.profession,
        university: form.university,
        socials: {
          facebook: form.facebook,
          instagram: form.instagram,
          linkedin: form.linkedin,
          website: form.website,
          github: form.github,
          twitter: form.twitter,
        },
      };
      const res = await UserAuthServices.updateProfileService(body);
      if (res && res.status === "success") {
        await fetchUserProfile();
        alert(res.message || "Profile updated");
      } else {
        alert(res?.message || "Failed to update profile");
      }
    } catch (err) {
      alert(err.message || "Update error");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("avatar", file);
      setLoading(true);
      try {
        const res = await UserAuthServices.profileAvatarService(formData);
        if (res && res.status === "success") {
          await fetchUserProfile();
          alert("Avatar updated successfully");
        } else {
          alert(res?.message || "Failed to update avatar");
        }
      } catch (err) {
        alert(err.message || "Avatar update error");
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.password !== passwordForm.password_confirmation) {
      alert("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await UserAuthServices.profileChangePasswordService(passwordForm);
      if (res && res.status === "success") {
        alert(res.message || "Password updated successfully");
        setPasswordForm({
          current_password: "",
          password: "",
          password_confirmation: "",
        });
      } else {
        alert(res?.message || "Failed to update password");
      }
    } catch (err) {
      alert(err.message || "Password update error");
    } finally {
      setLoading(false);
    }
  };

  const handleContactSubmit = async () => {
    if (!form.otp) {
      alert("Please enter OTP");
      return;
    }
    setLoading(true);
    try {
      const body = {
        email: form.email,
        phone: form.phone,
        otp: form.otp,
      };
      const res = await UserAuthServices.profileChangeContactService(body);
      if (res && res.status === "success") {
        await fetchUserProfile();
        alert(res.message || "Contact updated successfully");
        setIsEmailEditable(false);
        setIsPhoneEditable(false);
      } else {
        alert(res?.message || "Failed to update contact");
      }
    } catch (err) {
      alert(err.message || "Contact update error");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setLoading(true);
    try {
      const res = await UserAuthServices.resendOtp({
        email: form.email || userData.email,
        type: "change_contact",
      });
      if (res && res.status === "success") {
        alert("OTP sent successfully");
      } else {
        alert(res?.message || "Failed to send OTP");
      }
    } catch (err) {
      alert(err.message || "Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
        <div className="content">
          <div className="section-title">
            <h4 className="rbt-title-style-3">Settings</h4>
          </div>

          <div className="advance-tab-button mb--30">
            <ul
              className="nav nav-tabs tab-button-style-2 justify-content-start"
              id="settinsTab-4"
              role="tablist"
            >
              <li role="presentation">
                <Link
                  href="#"
                  className="tab-button active"
                  id="profile-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#profile"
                  role="tab"
                  aria-controls="profile"
                  aria-selected="true"
                >
                  <span className="title">Profile</span>
                </Link>
              </li>
              <li role="presentation">
                <Link
                  href="#"
                  className="tab-button"
                  id="password-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#password"
                  role="tab"
                  aria-controls="password"
                  aria-selected="false"
                >
                  <span className="title">Password</span>
                </Link>
              </li>
              <li role="presentation">
                <Link
                  href="#"
                  className="tab-button"
                  id="social-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#social"
                  role="tab"
                  aria-controls="social"
                  aria-selected="false"
                >
                  <span className="title">Social list</span>
                </Link>
              </li>
            </ul>
          </div>

          <div className="tab-content">
            <div
              className="tab-pane fade active show"
              id="profile"
              role="tabpanel"
              aria-labelledby="profile-tab"
            >
              <div className="rbt-dashboard-content-wrapper">
                <div className="tutor-bg-photo bg_image bg_image--22 height-245"></div>
                <div className="rbt-tutor-information">
                  <div className="rbt-tutor-information-left">
                    <div className="thumbnail rbt-avatars size-lg position-relative">
                      <Image
                        width={300}
                        height={300}
                        src={userData?.profile?.avatar || "/images/team/avatar.jpg"}
                        alt="Instructor"
                        style={{ objectFit: 'cover' }}
                      />
                      <div className="rbt-edit-photo-inner">
                        <label className="rbt-edit-photo" title="Upload Photo" style={{ cursor: 'pointer' }}>
                          <i className="feather-camera" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            style={{ display: 'none' }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="rbt-tutor-information-right">
                    <div className="tutor-btn">
                      <Link
                        className="rbt-btn btn-sm btn-border color-white radius-round-10"
                        href="#"
                      >
                        Edit Cover Photo
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <form
                onSubmit={handleSubmit}
                className="rbt-profile-row rbt-default-form row row--15"
              >
                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="rbt-form-group">
                    <label htmlFor="first_name">First Name</label>
                    <input id="first_name" type="text" value={form.first_name} onChange={handleChange} readOnly style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }} />
                  </div>
                </div>
                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="rbt-form-group">
                    <label htmlFor="middle_name">Middle Name</label>
                    <input id="middle_name" type="text" value={form.middle_name} onChange={handleChange} readOnly style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }} />
                  </div>
                </div>
                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="rbt-form-group">
                    <label htmlFor="last_name">Last Name</label>
                    <input id="last_name" type="text" value={form.last_name} onChange={handleChange} readOnly style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }} />
                  </div>
                </div>
                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="rbt-form-group">
                    <label htmlFor="profession">Occupation</label>
                    <select id="profession" value={form.profession} onChange={handleChange} className="w-100">
                      <option value="">Select Occupation</option>
                      <option value="Instructor">Instructor</option>
                      <option value="Developer">Developer</option>
                      <option value="Designer">Designer</option>
                      <option value="Manager">Manager</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="rbt-form-group">
                    <label htmlFor="university">University/Company</label>
                    <input id="university" type="text" value={form.university} onChange={handleChange} />
                  </div>
                </div>
                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="rbt-form-group">
                    <label htmlFor="email">Email</label>
                    <div className="position-relative">
                      <input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        readOnly={!isEmailEditable}
                        style={!isEmailEditable ? { backgroundColor: '#f8f9fa' } : { borderColor: '#6b7385' }}
                        autoFocus={isEmailEditable}
                      />
                      <i
                        className={`feather-${isEmailEditable ? 'check' : 'edit'} position-absolute`}
                        onClick={() => {
                          if (isEmailEditable) {
                            handleContactSubmit();
                          } else {
                            setIsEmailEditable(true);
                          }
                        }}
                        style={{ right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: isEmailEditable ? '#2ecc71' : '#6b7385' }}
                        title={isEmailEditable ? "Save" : "Edit Email"}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="rbt-form-group">
                    <label htmlFor="phone">Number</label>
                    <div className="position-relative">
                      <input
                        id="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        readOnly={!isPhoneEditable}
                        style={!isPhoneEditable ? { backgroundColor: '#f8f9fa' } : { borderColor: '#6b7385' }}
                        autoFocus={isPhoneEditable}
                      />
                      <i
                        className={`feather-${isPhoneEditable ? 'check' : 'edit'} position-absolute`}
                        onClick={() => {
                          if (isPhoneEditable) {
                            handleContactSubmit();
                          } else {
                            setIsPhoneEditable(true);
                          }
                        }}
                        style={{ right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: isPhoneEditable ? '#2ecc71' : '#6b7385' }}
                        title={isPhoneEditable ? "Save" : "Edit Number"}
                      />
                    </div>
                  </div>
                </div>
                {(isEmailEditable || isPhoneEditable) && (
                  <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                    <div className="rbt-form-group">
                      <label htmlFor="otp">OTP</label>
                      <div className="position-relative">
                        <input
                          id="otp"
                          type="text"
                          value={form.otp}
                          onChange={handleChange}
                          placeholder="Enter OTP"
                          className="pr--100"
                        />
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          className="rbt-btn btn-sm btn-gradient position-absolute"
                          style={{ right: '5px', top: '50%', transform: 'translateY(-50%)', height: '35px', padding: '0 15px' }}
                        >
                          Send OTP
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <div className="col-12 mt--20">
                  <div className="rbt-form-group">
                    <label htmlFor="bio">Bio</label>
                    <textarea
                      id="bio"
                      cols="30"
                      rows="6"
                      value={form.bio}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>
                <div className="col-12 mt--20">
                  <div className="rbt-form-group">
                    <button className="rbt-btn btn-gradient" type="submit">{loading ? 'Updating...' : 'Update Info'}</button>
                  </div>
                </div>
              </form>
            </div>

            <div
              className="tab-pane fade"
              id="password"
              role="tabpanel"
              aria-labelledby="password-tab"
            >
              <form
                onSubmit={handlePasswordSubmit}
                className="rbt-profile-row rbt-default-form row row--15"
              >
                <div className="col-12">
                  <div className="rbt-form-group">
                    <label htmlFor="current_password">Current Password</label>
                    <input
                      id="current_password"
                      type="password"
                      placeholder="Current Password"
                      value={passwordForm.current_password}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-12">
                  <div className="rbt-form-group">
                    <label htmlFor="password">New Password</label>
                    <input
                      id="password"
                      type="password"
                      placeholder="New Password"
                      value={passwordForm.password}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-12">
                  <div className="rbt-form-group">
                    <label htmlFor="password_confirmation">
                      Re-type New Password
                    </label>
                    <input
                      id="password_confirmation"
                      type="password"
                      placeholder="Re-type New Password"
                      value={passwordForm.password_confirmation}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-12 mt--10">
                  <div className="rbt-form-group">
                    <button className="rbt-btn btn-gradient" type="submit">
                      {loading ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <div
              className="tab-pane fade"
              id="social"
              role="tabpanel"
              aria-labelledby="social-tab"
            >
              <form
                onSubmit={handleSubmit}
                className="rbt-profile-row rbt-default-form row row--15"
              >
                <div className="col-12">
                  <div className="rbt-form-group">
                    <label htmlFor="facebook">
                      <i className="feather-facebook"></i> Facebook
                    </label>
                    <input
                      id="facebook"
                      type="text"
                      value={form.facebook}
                      onChange={handleChange}
                      placeholder="https://facebook.com/"
                    />
                  </div>
                </div>
                <div className="col-12">
                  <div className="rbt-form-group">
                    <label htmlFor="instagram">
                      <i className="feather-instagram"></i> Instagram
                    </label>
                    <input
                      id="instagram"
                      type="text"
                      value={form.instagram}
                      onChange={handleChange}
                      placeholder="https://instagram.com/"
                    />
                  </div>
                </div>
                <div className="col-12">
                  <div className="rbt-form-group">
                    <label htmlFor="linkedin">
                      <i className="feather-linkedin"></i> Linkedin
                    </label>
                    <input
                      id="linkedin"
                      type="text"
                      value={form.linkedin}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/"
                    />
                  </div>
                </div>
                <div className="col-12">
                  <div className="rbt-form-group">
                    <label htmlFor="website">
                      <i className="feather-globe"></i> Portfolio
                    </label>
                    <input
                      id="website"
                      type="text"
                      value={form.website}
                      onChange={handleChange}
                      placeholder="https://website.com/"
                    />
                  </div>
                </div>
                <div className="col-12">
                  <div className="rbt-form-group">
                    <label htmlFor="github">
                      <i className="feather-github"></i> Git
                    </label>
                    <input
                      id="github"
                      type="text"
                      value={form.github}
                      onChange={handleChange}
                      placeholder="https://github.com/"
                    />
                  </div>
                </div>
                <div className="col-12">
                  <div className="rbt-form-group">
                    <label htmlFor="twitter">
                      <i className="feather-twitter"></i> Twitter
                    </label>
                    <input
                      id="twitter"
                      type="text"
                      value={form.twitter}
                      onChange={handleChange}
                      placeholder="https://twitter.com/"
                    />
                  </div>
                </div>
                <div className="col-12 mt--10">
                  <div className="rbt-form-group">
                    <button className="rbt-btn btn-gradient" type="submit">
                      {loading ? 'Updating...' : 'Update Profile'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Setting;
