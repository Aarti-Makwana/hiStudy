"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { loginSchema } from "../../validations/auth/validation";
import { UserAuthServices } from "../../services/User";
import OtpVerification from "../OtpVerification/OtpVerification";
import Swal from "sweetalert2";
import { getToken } from "../../utils/storage";

const Login = () => {
  const router = useRouter();
  const [showOtp, setShowOtp] = React.useState(false);
  const [otpProps, setOtpProps] = React.useState(null);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (getToken()) {
      router.push("/");
    }
  }, []);

  return (
    <>
      <div className="col-lg-6">
        <div className="rbt-contact-form contact-form-style-1 max-width-auto">
          {!showOtp && (
            <>
              <h3 className="title">Login</h3>
              <div className="rbt-social-login-wrapper mb--20 d-flex flex-column gap-2">
                <button type="button" className="rbt-btn btn-md w-100 btn-white" style={{ border: "1px solid #ddd" }}>
                  <span className="icon-reverse-wrapper">
                    <span className="btn-text">Login with Google</span>
                  </span>
                </button>
                <button type="button" className="rbt-btn btn-md w-100 btn-white" style={{ border: "1px solid #ddd" }}>
                  <span className="icon-reverse-wrapper">
                    <span className="btn-text">Login with GitHub</span>
                  </span>
                </button>
              </div>
              <div className="text-center mb--20">
                <span className="text-muted">OR</span>
              </div>
            </>
          )}
          <Formik
            initialValues={{ email: "", password: "", rememberme: false }}
            validationSchema={loginSchema}
            onSubmit={async (values, { setSubmitting, setErrors }) => {
              try {
                const res = await UserAuthServices.userLogin(values);
                if (res && res.status === 'success') {
                  Swal.fire('Success!', res.message || 'Login successful', 'success');
                  const x_id = res?.data?.x_id;
                  const x_action = res?.data?.x_action;
                  const email = values.email;
                  setOtpProps({ email, xId: x_id, xAction: x_action, redirectPath: '/' });
                  setShowOtp(true);
                } else {
                  setErrors({ submit: res?.message || 'Login failed' });
                  Swal.fire('Oops!', res?.message || 'Login failed', 'error');
                }
              } catch (err) {
                setErrors({ submit: err.message || 'Login failed' });
                Swal.fire('Oops!', err.message || 'Login failed', 'error');
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ isSubmitting, values }) => (
              <Form className="max-width-auto">
                {!showOtp && (
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

                {!showOtp && (
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

              </Form>
            )}
          </Formik>
        </div>
      </div>

    </>
  );
};

export default Login;
