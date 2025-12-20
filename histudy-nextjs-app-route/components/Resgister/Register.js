"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { registerSchema } from "../../validations/auth/validation";
import { UserAuthServices } from "../../services/User";
import Toaster, { showToast } from "../Toaster/Toaster";
import OtpVerification from "../OtpVerification/OtpVerification";
const Register = () => {
  const router = useRouter();
  const [showOtp, setShowOtp] = useState(false);
  const [otpProps, setOtpProps] = useState(null);

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

                // If you later add file inputs (avatar etc.) append them here, e.g.:
                // formData.append('avatar', values.avatarFile);

                const res = await UserAuthServices.userRegister(formData);
                // Expect response: { status: 'success', message: '', data: { x_id, x_action } }
                if (res && res.status === 'success') {
                  showToast('success', res.message || 'Registration successful');
                  const x_id = res?.data?.x_id;
                  const x_action = res?.data?.x_action;
                  setOtpProps({ email: values.email, xId: x_id, xAction: x_action, redirectPath: '/login' });
                  setShowOtp(true);
                } else {
                  setErrors({ submit: res?.message || 'Registration failed' });
                }
              } catch (err) {
                setErrors({ submit: err.message || 'Registration failed' });
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ isSubmitting, errors, values, setFieldValue }) => (
              <Form className="max-width-auto">
                {!showOtp && (
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
                      <Field name="email" type="email" placeholder="Email address *" />
                      <span className="focus-border"></span>
                      <div className="text-danger"><ErrorMessage name="email" /></div>
                    </div>

                    <div className="form-group">
                      <label className="d-block">Profession</label>
                      <Field as="select" name="profession" className="w-100 p-2" onChange={(e)=> setFieldValue('profession', e.target.value)} value={values.profession}>
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
                      <button type="submit" disabled={isSubmitting} className="rbt-btn btn-md btn-gradient hover-icon-reverse w-100">
                        <span className="icon-reverse-wrapper">
                          <span className="btn-text">Register</span>
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
                      <span>Already have an account? </span>
                      <Link className="rbt-btn-link" href="/login">Login</Link>
                    </div>
                  </>
                )}

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

export default Register;
