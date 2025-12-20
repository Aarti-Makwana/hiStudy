"use client";

import Link from "next/link";
import React from "react";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { loginSchema } from "../../validations/auth/validation";
import { UserAuthServices } from "../../services/User";
import Toaster, { showToast } from "../Toaster/Toaster";
import OtpVerification from "../OtpVerification/OtpVerification";

const Login = () => {
  const router = useRouter();
  const [showOtp, setShowOtp] = React.useState(false);
  const [otpProps, setOtpProps] = React.useState(null);

  return (
    <>
      <div className="col-lg-6">
        <div className="rbt-contact-form contact-form-style-1 max-width-auto">
          <h3 className="title">Login</h3>
          <Formik
            initialValues={{ email: "", password: "", rememberme: false }}
            validationSchema={loginSchema}
            onSubmit={async (values, { setSubmitting, setErrors }) => {
              try {
                const res = await UserAuthServices.userLogin(values);
                if (res && res.status === 'success') {
                  showToast('success', res.message || 'Login successful');
                  const x_id = res?.data?.x_id;
                  const x_action = res?.data?.x_action;
                  const email = values.email;
                  setOtpProps({ email, xId: x_id, xAction: x_action, redirectPath: '/dashboard' });
                  setShowOtp(true);
                } else {
                  setErrors({ submit: res?.message || 'Login failed' });
                }
              } catch (err) {
                setErrors({ submit: err.message || 'Login failed' });
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ isSubmitting, values }) => (
              <Form className="max-width-auto">
                <Toaster />
                {!showOtp && (
                  <>
                    <div className="form-group">
                      <Field name="email" type="text" placeholder="Username or email *" />
                      <span className="focus-border"></span>
                      <div className="text-danger"><ErrorMessage name="email" /></div>
                    </div>
                    <div className="form-group">
                      <Field name="password" type="password" placeholder="Password *" />
                      <span className="focus-border"></span>
                      <div className="text-danger"><ErrorMessage name="password" /></div>
                    </div>
                  </>
                )}

                <div className="row mb--30">
                  <div className="col-lg-6">
                    <div className="rbt-checkbox">
                      <Field type="checkbox" id="rememberme" name="rememberme" />
                      <label htmlFor="rememberme">Remember me</label>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="rbt-lost-password text-end">
                      <Link className="rbt-btn-link" href="#">
                        Lost your password?
                      </Link>
                    </div>
                  </div>
                </div>

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
