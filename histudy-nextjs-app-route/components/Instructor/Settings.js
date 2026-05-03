"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";

import { UserAuthServices } from "../../services/User";
import { getUser, setUser } from "../../utils/storage";

import { useAppContext } from "../../context/Context";

const Setting = () => {
  const { userData, fetchUserProfile } = useAppContext();
  const occupationOptions = [
    { value: "", label: "Select Occupation" },
    { value: "Working Professional", label: "Working Professional" },
    { value: "1st–Final Year", label: "1st–Final Year" },
    { value: "Pre-Final Year", label: "Pre-Final Year" },
  ];

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
  const [occupationType, setOccupationType] = useState("");
  const [editingContact, setEditingContact] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [loading, setLoading] = useState(false);
  const [isPhoneEditable, setIsPhoneEditable] = useState(false);
  const [isEmailEditable, setIsEmailEditable] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [coverPhotoLoading, setCoverPhotoLoading] = useState(false);

  useEffect(() => {
    if (userData) {
      const occupationValue = userData.profile?.profession && !userData.university
        ? "Working Professional"
        : userData.university
        ? "1st–Final Year"
        : "";

      setForm({
        first_name: userData.profile?.first_name || userData.first_name || "",
        middle_name: userData.profile?.middle_name || "",
        last_name: userData.profile?.last_name || userData.last_name || "",
        profession: userData.profile?.profession || "",
        university: userData.university || userData.profile?.university || "",
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
      setOccupationType(occupationValue);
      setEditingContact(null);
      setOtpSent(false);
      setIsEmailEditable(false);
      setIsPhoneEditable(false);
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

  const openInfoModal = (title, message) => {
    setModalTitle(title);
    setModalMessage(message);
    setShowInfoModal(true);
  };

  const closeInfoModal = () => {
    setShowInfoModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const body = {
        bio: form.bio,
        socials: {
          facebook: form.facebook,
          instagram: form.instagram,
          linkedin: form.linkedin,
          website: form.website,
          github: form.github,
          twitter: form.twitter,
        },
      };

      if (occupationType === "Working Professional") {
        body.profession = form.profession;
        body.university = "";
      } else if (["1st–Final Year", "Pre-Final Year"].includes(occupationType)) {
        body.profession = "";
        body.university = form.university;
      } else {
        body.profession = form.profession;
        body.university = form.university;
      }

      const res = await UserAuthServices.updateProfileService(body);
      if (res && res.status === "success") {
        await fetchUserProfile();
        toast.success(res.message || "Profile updated");
      } else {
        toast.error(res?.message || "Failed to update profile");
      }
    } catch (err) {
      openInfoModal("Update error", err.message || "Update error");
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
          toast.success("Avatar updated successfully");
        } else {
          toast.error(res?.message || "Failed to update avatar");
        }
      } catch (err) {
        openInfoModal("Avatar update error", err.message || "Avatar update error");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCoverPhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("cover_photo", file);
      setCoverPhotoLoading(true);
      try {
        const res = await UserAuthServices.profileCoverPhotoService(formData);
        if (res && res.status === "success") {
          await fetchUserProfile();
          toast.success("Cover photo updated successfully");
        } else {
          toast.error(res?.message || "Failed to update cover photo");
        }
      } catch (err) {
        openInfoModal("Cover photo update error", err.message || "Cover photo update error");
      } finally {
        setCoverPhotoLoading(false);
      }
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.password !== passwordForm.password_confirmation) {
      openInfoModal("Validation failed", "Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await UserAuthServices.profileChangePasswordService(passwordForm);
      if (res && res.status === "success") {
        toast.success(res.message || "Password updated successfully");
        setPasswordForm({
          current_password: "",
          password: "",
          password_confirmation: "",
        });
      } else {
        toast.error(res?.message || "Failed to update password");
      }
    } catch (err) {
      openInfoModal("Password update error", err.message || "Password update error");
    } finally {
      setLoading(false);
    }
  };

  const handleContactEdit = (field) => {
    setEditingContact(field);
    setOtpSent(false);
    setForm((s) => ({ ...s, otp: "" }));
    setIsEmailEditable(field === "email");
    setIsPhoneEditable(field === "phone");
  };

  const handleContactVerify = async () => {
    if (!form.otp) {
      openInfoModal("OTP required", "Please enter OTP");
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
        toast.success(res.message || "Contact updated successfully");
        setIsEmailEditable(false);
        setIsPhoneEditable(false);
        setEditingContact(null);
        setOtpSent(false);
        setForm((s) => ({ ...s, otp: "" }));
      } else {
        openInfoModal("Contact update failed", res?.message || "Failed to update contact");
      }
    } catch (err) {
      openInfoModal("Contact update error", err.message || "Contact update error");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!editingContact) {
      openInfoModal("Select field", "Please select Email or Number to edit first.");
      return;
    }
    setLoading(true);
    try {
      const res = await UserAuthServices.resendOtp({
        email: form.email || userData?.email,
        type: "change_contact",
      });
      if (res && res.status === "success") {
        setOtpSent(true);
        toast.success("OTP sent successfully. Enter it below to verify.");
      } else {
        openInfoModal("OTP send failed", res?.message || "Failed to send OTP");
      }
    } catch (err) {
      openInfoModal("Error sending OTP", err.message || "Error sending OTP");
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
                        src={userData?.profile?.file?.url || userData?.profile?.avatar || "/images/team/avatar.jpg"}
                        alt={userData?.first_name || "Instructor"}
                        style={{ objectFit: 'cover' }}
                      />
                      <div className="rbt-edit-photo-inner">
                        <button
                          type="button"
                          className="rbt-edit-photo"
                          title="Upload Photo"
                          onClick={() => document.getElementById('avatarUpload').click()}
                          disabled={loading}
                       
                        >
                          <i className="feather-camera" />
                        </button>
                        <input
                          id="avatarUpload"
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          style={{ display: 'none' }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="rbt-tutor-information-right">
                    <div className="tutor-btn">
                      <button
                        type="button"
                        className="rbt-btn btn-sm btn-border color-white radius-round-10"
                        onClick={() => document.getElementById('coverPhotoUpload').click()}
                        disabled={coverPhotoLoading}
                      >
                        {coverPhotoLoading ? 'Uploading...' : 'Edit Cover Photo'}
                      </button>
                      <input
                        id="coverPhotoUpload"
                        type="file"
                        accept="image/*"
                        onChange={handleCoverPhotoChange}
                        style={{ display: 'none' }}
                      />
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
                    <label htmlFor="occupationType">Occupation</label>
                    <select id="occupationType" value={occupationType} onChange={(e) => {
                      const value = e.target.value;
                      setOccupationType(value);
                      if (value === "Working Professional") {
                        setForm((s) => ({ ...s, university: "" }));
                      } else {
                        setForm((s) => ({ ...s, profession: "" }));
                      }
                    }} className="w-100">
                      {occupationOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="rbt-form-group">
                    <label htmlFor="occupationField">
                      {occupationType === "Working Professional" ? "Company" : occupationType ? "University" : "University/Company"}
                    </label>
                    <input
                      id="occupationField"
                      type="text"
                      value={occupationType === "Working Professional" ? form.profession : form.university}
                      onChange={(e) => {
                        if (occupationType === "Working Professional") {
                          setForm((s) => ({ ...s, profession: e.target.value }));
                        } else {
                          setForm((s) => ({ ...s, university: e.target.value }));
                        }
                      }}
                    />
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
                        className={`feather-${editingContact === 'email' ? 'edit' : 'edit'} position-absolute`}
                        onClick={() => handleContactEdit('email')}
                        style={{ right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: editingContact === 'email' ? '#6b7385' : '#6b7385' }}
                        title={editingContact === 'email' ? "Editing Email" : "Edit Email"}
                      />
                    </div>
                    {editingContact === 'email' && !otpSent && (
                      <button type="button" className="rbt-btn btn-sm btn-gradient mt-3" onClick={handleSendOtp}>
                        Send OTP
                      </button>
                    )}
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
                        className={`feather-${editingContact === 'phone' ? 'edit' : 'edit'} position-absolute`}
                        onClick={() => handleContactEdit('phone')}
                        style={{ right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: editingContact === 'phone' ? '#6b7385' : '#6b7385' }}
                        title={editingContact === 'phone' ? "Editing Number" : "Edit Number"}
                      />
                    </div>
                    {editingContact === 'phone' && !otpSent && (
                      <button type="button" className="rbt-btn btn-sm btn-gradient mt-3" onClick={handleSendOtp}>
                        Send OTP
                      </button>
                    )}
                  </div>
                </div>
                {otpSent && editingContact && (
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
                          onClick={handleContactVerify}
                          className="rbt-btn btn-sm btn-gradient position-absolute"
                          style={{ right: '5px', top: '50%', transform: 'translateY(-50%)', height: '35px', padding: '0 15px' }}
                        >
                          Verify OTP
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
      {showInfoModal && (
        <div
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
          onClick={closeInfoModal}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            style={{ maxWidth: "500px", width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content rbt-shadow-box">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title">{modalTitle || "Information"}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeInfoModal}
                ></button>
              </div>
              <div className="modal-body text-center pt--20 pb--20">
                <p className="mb--0">{modalMessage}</p>
              </div>
              <div className="modal-footer border-0 justify-content-end">
                <button
                  type="button"
                  className="rbt-btn btn-sm btn-gradient radius-round-10"
                  onClick={closeInfoModal}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Setting;
