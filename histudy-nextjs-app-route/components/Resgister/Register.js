"use client";

import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { registerSchema } from "../../validations/auth/validation";
import { UserAuthServices } from "../../services/User";
import OtpVerification from "../OtpVerification/OtpVerification";
import Swal from "sweetalert2";
import { getToken } from "../../utils/storage";
const Register = () => {
  const router = useRouter();
  const [showOtp, setShowOtp] = useState(false);
  const [otpProps, setOtpProps] = useState(null);
  const [step, setStep] = useState(1);
  const [showHint, setShowHint] = useState(false);
  const otpRef = useRef(null);

  useEffect(() => {
    if (getToken()) {
      router.push("/");
    }
  }, []);

  return (
    <>
      <div className="col-lg-6">
        <div className="rbt-contact-form contact-form-style-1 max-width-auto">
          <h3 className="title">Register</h3>
          <Formik
            initialValues={{ name: "", phone: "", email: "", password: "", confirmPassword: "", profession: "", company: "", university: "" }}
            validationSchema={registerSchema}
              onSubmit={async (values, { setSubmitting, setErrors }) => {
                try {
                  const formData = new FormData();
                  formData.append('name', values.name || '');
                  formData.append('phone', values.phone || '');
                  formData.append('email', values.email || '');
                  formData.append('password', values.password || '');

                  const professionValue = values.profession === 'Working Professional' ? (values.company || '') : (values.profession || '');
                  formData.append('profession', professionValue);

                  if (values.profession === '1st Year' || values.profession === 'Final Year') {
                    formData.append('university', values.university || '');
                  }

                  const res = await UserAuthServices.userRegister(formData);
                  if (res && res.status === 'success') {
                    Swal.fire('Success!', res.message || 'Registration successful', 'success');
                    const x_id = res?.data?.x_id;
                    const x_action = res?.data?.x_action;
                    setOtpProps({ email: values.email, xId: x_id, xAction: x_action, redirectPath: '/' });
                    setShowOtp(true);
                  } else {
                    setErrors({ submit: res?.message || 'Registration failed' });
                    Swal.fire('Oops!', res?.message || 'Registration failed', 'error');
                  }
                } catch (err) {
                  setErrors({ submit: err.message || 'Registration failed' });
                  Swal.fire('Oops!', err.message || 'Registration failed', 'error');
                } finally {
                  setSubmitting(false);
                }
              }}
          >
              {({ isSubmitting, errors, values, setFieldValue, validateForm, setErrors }) => (
              <Form className="max-width-auto">
                  {/* Email hint and 2-step flow implemented below */}

                  {step === 1 && (
                    <>
                      <div className="form-group">
                        <Field name="name" type="text" placeholder="Full name *" />
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
                              <input {...field} type="email" placeholder="Email address *" onFocus={() => setShowHint(true)} onBlur={() => setShowHint(false)} />
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
                        <label className="d-block">Profession</label>
                        <Field as="select" name="profession" className="w-100 p-2" onChange={(e) => setFieldValue('profession', e.target.value)} value={values.profession}>
                          <option value="">Select profession</option>
                          <option value="Working Professional">Working Professional</option>
                          <option value="1st Year">1st Year</option>
                          <option value="Final Year">Final Year</option>
                        </Field>
                        <div className="text-danger"><ErrorMessage name="profession" /></div>
                      </div>

                      {values.profession === 'Working Professional' && (
                        <div className="form-group">
                          <Field name="company" type="text" placeholder="Company name *" />
                          <span className="focus-border"></span>
                          <div className="text-danger"><ErrorMessage name="company" /></div>
                        </div>
                      )}

                      {(values.profession === '1st Year' || values.profession === 'Final Year') && (
                        <div className="form-group">
                          <Field name="university" type="text" placeholder="University name *" />
                          <span className="focus-border"></span>
                          <div className="text-danger"><ErrorMessage name="university" /></div>
                        </div>
                      )}

                      <div className="form-submit-group">
                        <button type="button" className="rbt-btn btn-md btn-gradient hover-icon-reverse w-100" onClick={async () => {
                          const errs = await validateForm();
                          if (!errs.name && !errs.email && !errs.phone) {
                            setStep(2);
                          } else {
                            setErrors({ submit: 'Please fix required fields before continuing' });
                          }
                        }}>
                          <span className="icon-reverse-wrapper">
                            <span className="btn-text">Next</span>
                          </span>
                        </button>
                      </div>

                      <div className="mt-3 text-center">
                        <span>Already have an account? </span>
                        <Link className="rbt-btn-link" href="/login">Login</Link>
                      </div>
                    </>
                  )}

                  {step === 2 && (
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

                      {errors.submit && <div className="text-danger mb-3">{errors.submit}</div>}

                      <div className="form-submit-group">
                        {!showOtp ? (
                          <div className="d-flex gap-2">
                            <button type="button" className="rbt-btn btn-md btn-outline w-50" onClick={() => setStep(1)}>
                              Back
                            </button>
                            <button type="submit" disabled={isSubmitting} className="rbt-btn btn-md btn-gradient hover-icon-reverse w-50">
                              <span className="icon-reverse-wrapper">
                                <span className="btn-text">Register</span>
                              </span>
                            </button>
                          </div>
                        ) : (
                          <div className="d-flex gap-2">
                            <button type="button" className="rbt-btn btn-md btn-outline w-50" onClick={() => setStep(1)}>
                              Back
                            </button>
                            <button type="button" className="rbt-btn btn-md btn-gradient hover-icon-reverse w-50" onClick={() => otpRef.current && otpRef.current.verify()}>
                              <span className="icon-reverse-wrapper">
                                <span className="btn-text">Verify OTP</span>
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                {showOtp && otpProps && (
                  <div className="mt-4">
                    <OtpVerification
                      ref={otpRef}
                      hideInternalButton={true}
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

export default Register;
