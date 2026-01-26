"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { loginSchema, socialProfileSchema } from "../../validations/auth/validation";
import { UserAuthServices } from "../../services/User";
import OtpVerification from "../OtpVerification/OtpVerification";
import { showSuccess, showError } from "../../utils/swal";
import { getToken, setUser } from "../../utils/storage";
import { setLocalStorageToken } from "../../utils/common.util";
import config from "../../config";

const Login = () => {
  const router = useRouter();
  const [registeringSocialUser, setRegisteringSocialUser] = useState(null);
  const [completeRegistration, setCompleteRegistration] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpProps, setOtpProps] = useState(null);
  const [showHint, setShowHint] = useState(false);

  const handleSocialLogin = async (socialData) => {
    try {
      // Ensure provider_id is strictly a string
      const provider_id = socialData.provider_id ? String(socialData.provider_id) : "";
      const payload = {
        ...socialData,
        provider_id: provider_id,
        status: false
      };

      const res = await UserAuthServices.socialLoginService(payload);
      if (res && res.status === 'success') {
        const userData = res.data;

        // If there's a token, it's a normal login (already registered & verified)
        if (userData?.token) {
          showSuccess("Success!", res.message || "Login successful");
          const token = userData?.token || "";
          const userObj = userData?.user || null;
          if (token) setLocalStorageToken(token);
          if (userObj) setUser(userObj);
          window.dispatchEvent(new Event("auth-change"));
          router.push("/");
          return;
        }

        // Per requirement: if data.status is true, open profile collection screen
        if (userData?.status === true) {
          setRegisteringSocialUser(userData);
          setCompleteRegistration(true);
        }
      } else {
        showError('Oops!', res?.message || 'Social Login failed');
      }
    } catch (err) {
      showError('Oops!', err.message || 'Social Login failed');
    }
  };

  useEffect(() => {
    const handleMessage = (event) => {
      // Check if message is from our backend auth redirect
      if (event.data && event.data.provider && event.data.provider_id) {
        handleSocialLogin(event.data);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const initiateSocialLogin = (provider) => {
    const url = `${config.API_BASE_URL}/api/auth/${provider}/redirect`;
    const width = 600, height = 700;
    const left = window.innerWidth / 2 - width / 2;
    const top = window.innerHeight / 2 - height / 2;
    window.open(url, "SocialLogin", `width=${width},height=${height},left=${left},top=${top}`);
  };

  useEffect(() => {
    if (getToken()) {
      router.push("/");
    }
  }, []);

  return (
    <>
      <div className="col-lg-6">
        <div className="rbt-contact-form contact-form-style-1 max-width-auto">
          {!showOtp && !completeRegistration && (
            <>
              <h3 className="title">Login</h3>
              <div className="rbt-social-login-wrapper mb--40 d-flex flex-column gap-3 align-items-center w-100">
                <button
                  type="button"
                  onClick={() => initiateSocialLogin('google')}
                  className="rbt-btn btn-md btn-social w-100"
                >
                  <FcGoogle size={24} />
                  <span>Log in with Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => initiateSocialLogin('github')}
                  className="rbt-btn btn-md btn-social w-100"
                >
                  <FaGithub size={24} />
                  <span>Log in with GitHub</span>
                </button>
              </div>
              <div className="text-center mb--20">
                <span className="text-muted">OR</span>
              </div>
            </>
          )}
          <Formik
            initialValues={{
              email: "",
              password: "",
              rememberme: false,
              phone: "",
              profession: "",
              company: "",
              university: ""
            }}
            validationSchema={completeRegistration ? socialProfileSchema : loginSchema}
            onSubmit={async (values, { setSubmitting, setErrors }) => {
              if (completeRegistration) {
                try {
                  // Second hit: Original profile + details + status: true to trigger OTP
                  const payload = {
                    ...registeringSocialUser,
                    provider_id: registeringSocialUser?.provider_id ? String(registeringSocialUser.provider_id) : "",
                    phone: values.phone,
                    profession: values.profession === "Working Professional" ? values.company : values.university,
                    status: true,
                    // If backend expects phone and profession separately, we send them. 
                    // But usually "profession" for working is the company and for student is the university in your app's logic.
                    // Based on step1 handled in Register.js:
                    // If "Working Professional": profession = company name
                    // If Student: university = university name
                  };

                  // Re-matching Register.js logic exactly:
                  const finalPayload = {
                    ...registeringSocialUser,
                    provider_id: registeringSocialUser?.provider_id ? String(registeringSocialUser.provider_id) : "",
                    phone: values.phone,
                    status: true,
                  };

                  if (values.profession === "Working Professional") {
                    finalPayload.profession = values.company || "";
                    finalPayload.university = "";
                  } else {
                    finalPayload.profession = "";
                    finalPayload.university = values.university || "";
                  }

                  const res = await UserAuthServices.socialLoginService(finalPayload);
                  if (res && res.status === 'success') {
                    const x_id = res?.data?.x_id;
                    const x_action = res?.data?.x_action;
                    const email = res?.data?.email || registeringSocialUser?.email;
                    setOtpProps({ email, xId: x_id, xAction: x_action, redirectPath: '/' });
                    setCompleteRegistration(false);
                    setShowOtp(true);
                  } else {
                    showError('Error', res?.message || 'Failed to initiate OTP');
                  }
                } catch (err) {
                  showError('Error', err.message || 'An error occurred');
                } finally {
                  setSubmitting(false);
                }
                return;
              }

              try {
                const res = await UserAuthServices.userLogin(values);
                if (res && res.status === 'success') {
                  showSuccess('Success!', res.message || 'Login successful');
                  const x_id = res?.data?.x_id;
                  const x_action = res?.data?.x_action;
                  const email = values.email;
                  setOtpProps({ email, xId: x_id, xAction: x_action, redirectPath: '/' });
                  setShowOtp(true);
                } else {
                  setErrors({ submit: res?.message || 'Login failed' });
                  showError('Oops!', res?.message || 'Login failed');
                }
              } catch (err) {
                setErrors({ submit: err.message || 'Login failed' });
                showError('Oops!', err.message || 'Login failed');
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ isSubmitting, values }) => (
              <Form className="max-width-auto">
                {!showOtp && !completeRegistration && (
                  <>
                    <div className="form-group">
                      <Field name="email">
                        {({ field }) => (
                          <>
                            <input {...field} type="text" placeholder="Username or email *" onFocus={() => setShowHint(true)} onBlur={() => setShowHint(false)} />
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
                      <Field name="password" type="password" placeholder="Password *" />
                      <span className="focus-border"></span>
                      <div className="text-danger"><ErrorMessage name="password" /></div>
                    </div>

                    <div className="row mb--30">
                      <div className="col-lg-6">
                        <div className="rbt-checkbox">
                          <Field type="checkbox" id="rememberme" name="rememberme" />
                          <label htmlFor="rememberme">Remember me</label>
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <div className="rbt-lost-password text-end">
                          <Link className="rbt-btn-link" href="/forgot-password">
                            Lost your password?
                          </Link>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {showOtp && (
                  <div className="row mb--30">
                    <div className="col-lg-6"></div>
                    <div className="col-lg-6">
                      <div className="rbt-lost-password text-end">
                        <Link
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setShowOtp(false);
                          }}
                          className="otp-back-link"
                        >
                          <i className="feather-arrow-left me-2"></i>
                          Back to Login
                        </Link>

                      </div>
                    </div>
                  </div>
                )}

                {!showOtp && !completeRegistration && (
                  <div className="form-submit-group">
                    <button type="submit" disabled={isSubmitting} className="rbt-btn btn-md btn-gradient hover-icon-reverse w-100">
                      <span className="icon-reverse-wrapper">
                        <span className="btn-text">Log In</span>
                        <span className="btn-icon">
                          <i className="feather-arrow-right"></i>
                        </span>
                        <span className="btn-icon">
                          <i className="feather-arrow-right"></i>
                        </span>
                      </span>
                    </button>
                  </div>
                )}

                <div className="mt-3 text-center">
                  <span>Don't have an account? </span>
                  <Link className="rbt-btn-link" href="/register">Register</Link>
                </div>

                {showOtp && otpProps && (
                  <div className="mt-4">
                    <OtpVerification
                      email={otpProps.email}
                      xId={otpProps.xId}
                      xAction={otpProps.xAction}
                      redirectPath={otpProps.redirectPath}
                    />
                  </div>
                )}

                {completeRegistration && (
                  <div className="registration-completion mt-4">
                    <h4 className="title">Complete Your Profile</h4>
                    <div className="form-group">
                      <Field name="phone" type="text" placeholder="Phone Number (10 digits) *" />
                      <span className="focus-border"></span>
                      <div className="text-danger"><ErrorMessage name="phone" /></div>
                    </div>
                    <div className="form-group">
                      <Field as="select" name="profession" className="w-100 p-2" onChange={(e) => {
                        const val = e.target.value;
                        values.profession = val; // Manually update because of custom onChange
                        // Reset conditional fields
                        values.company = "";
                        values.university = "";
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
                        <Field name="company" type="text" placeholder="Company Name *" />
                        <span className="focus-border"></span>
                        <div className="text-danger"><ErrorMessage name="company" /></div>
                      </div>
                    )}

                    {(values.profession === "1st–Final Year" || values.profession === "Pre-Final Year") && (
                      <div className="form-group">
                        <Field name="university" type="text" placeholder="University Name *" />
                        <span className="focus-border"></span>
                        <div className="text-danger"><ErrorMessage name="university" /></div>
                      </div>
                    )}

                    <div className="form-submit-group">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rbt-btn btn-md btn-gradient hover-icon-reverse w-100"
                      >
                        Complete Registration
                      </button>
                    </div>
                  </div>
                )}

              </Form>
            )}
          </Formik>
        </div>
      </div>

    </>
  );
};

export default Login;
