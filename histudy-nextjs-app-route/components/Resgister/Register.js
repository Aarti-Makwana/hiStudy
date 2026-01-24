"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { UserAuthServices } from "../../services/User";
import { getToken, setUser } from "../../utils/storage";
import { setLocalStorageToken } from "../../utils/common.util";
import { step1Schema, step2Schema, step3Schema } from "../../validations/auth/validation";
import { showSuccess, showError } from "../../utils/swal";

import { GoogleLogin } from "@react-oauth/google";

const Register = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [showHint, setShowHint] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    showSuccess("Success!", "Google Login successful! (Backend integration pending)");
  };

  const handleGoogleError = () => {
    showError("Error", "Google Login failed");
  };

  useEffect(() => {
    if (getToken()) {
      router.push("/");
    }
  }, []);

  const getValidationSchema = (currentStep) => {
    switch (currentStep) {
      case 1:
        return step1Schema;
      case 2:
        return step2Schema;
      case 3:
        return step3Schema;
      default:
        return step1Schema;
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="col-lg-6">
      <div className="rbt-contact-form contact-form-style-1 max-width-auto">
        <h3 className="title">Register</h3>
        {step === 1 && (
          <div className="rbt-social-login-wrapper mb--40 d-flex flex-column gap-3 align-items-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="filled_blue"
              text="continue_with"
              shape="rectangular"
              width="100%"
            />
            <div className="text-center mt--10">
              <span className="text-muted">OR</span>
            </div>
          </div>
        )}
        <Formik
          initialValues={{
            name: "",
            phone: "",
            email: "",
            profession: "",
            company: "",
            university: "",
            otp: "",
            password: "",
            confirmPassword: "",
          }}
          validationSchema={getValidationSchema(step)}
          onSubmit={async (values, { setSubmitting, setErrors }) => {
            try {
              const formData = new FormData();

              // Helper to append common fields
              const appendCommonFields = () => {
                formData.append("name", values.name);
                formData.append("phone", values.phone);
                formData.append("email", values.email);

                // Payload Logic:
                // If "Working Professional": profession = company name, university = null
                // If Student: profession = null, university = university name

                if (values.profession === "Working Professional") {
                  formData.append("profession", values.company || "");
                  formData.append("university", ""); // send empty/null
                } else if (["1st–Final Year", "Pre-Final Year"].includes(values.profession)) {
                  formData.append("profession", ""); // send empty/null
                  formData.append("university", values.university || "");
                } else {
                  // Fallback
                  formData.append("profession", "");
                  formData.append("university", "");
                }
              };

              if (step === 1) {
                appendCommonFields();
                formData.append("status", "register");

                const res = await UserAuthServices.userRegister(formData);
                // Check both API status and data.status flag
                if (res && res.status === "success" && res.data?.status === true) {
                  showSuccess("Success!", res.message || "Please check your email for OTP");
                  setStep(2);
                } else {
                  setErrors({ submit: res?.message || "Registration failed" });
                  showError("Oops!", res?.message || "Registration failed");
                }
              } else if (step === 2) {
                appendCommonFields();
                formData.append("otp", values.otp);
                formData.append("status", "otp_verify");

                const res = await UserAuthServices.userRegister(formData);

                if (res && res.status === "success" && res.data?.status === true) {
                  showSuccess("Success!", res.message || "OTP Verified");
                  setStep(3);
                } else {
                  setErrors({ submit: res?.message || "Invalid OTP" });
                  showError("Oops!", res?.message || "Invalid OTP");
                }
              } else if (step === 3) {
                appendCommonFields();
                formData.append("password", values.password);
                formData.append("password_confirmation", values.confirmPassword);
                formData.append("status", "set_password");

                const res = await UserAuthServices.userRegister(formData);

                // Success check for final step: Respone has token in data, status="success"
                if (res && res.status === "success" && res.data?.token) {
                  showSuccess("Success!", res.message || "Registration Complete");
                  // Store Token and User
                  setLocalStorageToken(res.data.token);
                  if (res.data.user) {
                    setUser(res.data.user);
                  }
                  // Notify header to update
                  window.dispatchEvent(new Event("auth-change"));

                  // Redirect to home page (auto-login)
                  router.push("/");
                } else {
                  // Handle custom error format: {"status":"error","message":"..."}
                  if (res?.status === "error") {
                    showError("Error", res.message || "Failed to set password");
                    setErrors({ submit: res.message });
                  } else {
                    setErrors({ submit: res?.message || "Failed to set password" });
                    showError("Oops!", res?.message || "Failed to set password");
                  }
                }
              }
            } catch (err) {
              setErrors({ submit: err.message || "An error occurred" });
              showError("Oops!", err.message || "An error occurred");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, errors, values, setFieldValue }) => (
            <Form className="max-width-auto">

              {/* Step 1: User Details */}
              {step === 1 && (
                <>
                  <div className="form-group">
                    <Field name="name" type="text" placeholder="Full Name *" />
                    <span className="focus-border"></span>
                    <div className="text-danger"><ErrorMessage name="name" /></div>
                  </div>

                  <div className="form-group">
                    <Field name="phone" type="text" placeholder="Phone *" />
                    <span className="focus-border"></span>
                    <div className="text-danger"><ErrorMessage name="phone" /></div>
                  </div>

                  <div className="form-group">
                    <Field name="email">
                      {({ field }) => (
                        <>
                          <input {...field} type="email" placeholder="Email Address *" onFocus={() => setShowHint(true)} onBlur={() => setShowHint(false)} />
                          <span className="focus-border"></span>
                        </>
                      )}
                    </Field>
                    <div className="text-danger"><ErrorMessage name="email" /></div>
                    {showHint && (
                      <p style={{ color: "#999", fontSize: "12px", marginTop: "6px" }}>Must be in format: example@email.com</p>
                    )}
                  </div>

                  <div className="form-group">
                    <Field as="select" name="profession" className="w-100 p-2" onChange={(e) => {
                      setFieldValue("profession", e.target.value);
                      // Clear conditional fields on change
                      setFieldValue("company", "");
                      setFieldValue("university", "");
                    }}>
                      <option value="">Select Profession</option>
                      <option value="Working Professional">Working Professional</option>
                      <option value="1st–Final Year">1st–Final Year</option>
                      <option value="Pre-Final Year">Pre-Final Year</option>
                    </Field>
                    <div className="text-danger"><ErrorMessage name="profession" /></div>
                  </div>

                  {values.profession === "Working Professional" && (
                    <div className="form-group">
                      <Field name="company" type="text" placeholder="Company Name" />
                      <span className="focus-border"></span>
                      <div className="text-danger"><ErrorMessage name="company" /></div>
                    </div>
                  )}

                  {(values.profession === "1st–Final Year" || values.profession === "Pre-Final Year") && (
                    <div className="form-group">
                      <Field name="university" type="text" placeholder="University Name" />
                      <span className="focus-border"></span>
                      <div className="text-danger"><ErrorMessage name="university" /></div>
                    </div>
                  )}

                  <div className="form-submit-group">
                    <button type="submit" disabled={isSubmitting} className="rbt-btn btn-md btn-gradient hover-icon-reverse w-100">
                      <span className="icon-reverse-wrapper">
                        <span className="btn-text">Next</span>
                      </span>
                    </button>
                  </div>
                </>
              )}

              {/* Step 2: OTP Verification */}
              {step === 2 && (
                <>
                  <div className="otp-verification mb--30">
                    <h4 className="title mb--20">Verify Email</h4>
                    <p className="mb--20">Enter the 6-digit code sent to <strong>{values.email}</strong></p>
                    <div className="form-group">
                      <Field name="otp" type="text" maxLength="6" placeholder="Enter 6-digit OTP *" />
                      <span className="focus-border"></span>
                      <div className="text-danger"><ErrorMessage name="otp" /></div>
                    </div>
                  </div>

                  <div className="form-submit-group d-flex gap-2">
                    <button type="button" className="rbt-btn btn-md btn-outline w-50" onClick={handleBack}>
                      Back
                    </button>
                    <button type="submit" disabled={isSubmitting} className="rbt-btn btn-md btn-gradient hover-icon-reverse w-50">
                      <span className="icon-reverse-wrapper">
                        <span className="btn-text">Verify & Next</span>
                      </span>
                    </button>
                  </div>
                </>
              )}

              {/* Step 3: Set Password */}
              {step === 3 && (
                <>
                  <div className="form-group">
                    <Field name="password" type="password" placeholder="Password *" />
                    <span className="focus-border"></span>
                    <div className="text-danger"><ErrorMessage name="password" /></div>
                  </div>

                  <div className="form-group">
                    <Field name="confirmPassword" type="password" placeholder="Confirm Password *" />
                    <span className="focus-border"></span>
                    <div className="text-danger"><ErrorMessage name="confirmPassword" /></div>
                  </div>

                  <div className="form-submit-group d-flex gap-2">
                    <button type="button" className="rbt-btn btn-md btn-outline w-50" onClick={handleBack}>
                      Back
                    </button>
                    <button type="submit" disabled={isSubmitting} className="rbt-btn btn-md btn-gradient hover-icon-reverse w-50">
                      <span className="icon-reverse-wrapper">
                        <span className="btn-text">Set Password</span>
                      </span>
                    </button>
                  </div>
                </>
              )}

              {errors.submit && <div className="text-danger mt-3">{errors.submit}</div>}

              {step === 1 && (
                <div className="mt-3 text-center">
                  <span>Already have an account? </span>
                  <Link className="rbt-btn-link" href="/login">Login</Link>
                </div>
              )}
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Register;
