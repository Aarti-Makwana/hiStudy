"use client";

import React, { useState } from "react";
import { Formik, Form, Field } from "formik";
import Toaster, { showToast } from "../../components/Toaster/Toaster";
import OtpVerification from "../../components/OtpVerification/OtpVerification";
import { UserAuthServices } from "../../services/User";
import Link from "next/link";

const ForgotPasswordPage = () => {
    const [showOtp, setShowOtp] = useState(false);
    const [otpProps, setOtpProps] = useState(null);

    return (
        <div className="container">
            <div className="row justify-content-center">

                <div className="col-lg-6">

                    <div className="rbt-contact-form contact-form-style-1 max-width-auto">
                        <div className="d-flex justify-content-end mb-2 my-3">
                            <Link href="/login" className="otp-back-link">
                                <i className="feather-arrow-left me-2"></i>
                                Back to Login
                            </Link>
                        </div>
                        {!showOtp ? <h3 className="title">Forgot Password</h3> : (
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <a href="#" onClick={(e) => { e.preventDefault(); setShowOtp(false); }} className="otp-back-link">&larr; Back</a>
                            </div>
                        )}

                        <Formik
                            initialValues={{ email: "", last4: "" }}
                            onSubmit={async (values, { setSubmitting, setErrors }) => {
                                try {
                                    const formData = new FormData();
                                    formData.append('email', values.email || '');
                                    formData.append('last4', values.last4 || '');

                                    const res = await UserAuthServices.UserForgotPassword(formData);
                                    if (res && res.status === 'success') {
                                        showToast('success', res.message || 'OTP sent to email');
                                        const x_id = res?.data?.x_id;
                                        const x_action = res?.data?.x_action;
                                        setOtpProps({ email: values.email, xId: x_id, xAction: x_action, redirectPath: '/reset-password' });
                                        setShowOtp(true);
                                    } else {
                                        setErrors({ submit: res?.message || 'Request failed' });
                                    }
                                } catch (err) {
                                    setErrors({ submit: err?.message || 'Request failed' });
                                } finally {
                                    setSubmitting(false);
                                }
                            }}
                        >
                            {({ isSubmitting, errors }) => (
                                <Form>
                                    <Toaster />
                                    {!showOtp && (
                                        <>
                                            <div className="form-group">
                                                <Field name="email" type="email" placeholder="Email address *" />
                                                <span className="focus-border"></span>
                                            </div>

                                            <div className="form-group">
                                                <Field name="last4" type="text" placeholder="Last 4 digits of mobile number *" maxLength={4} />
                                                <span className="focus-border"></span>
                                            </div>

                                            {errors.submit && <div className="text-danger mb-3">{errors.submit}</div>}

                                            <div className="form-submit-group">
                                                <button type="submit" disabled={isSubmitting} className="rbt-btn btn-md btn-gradient hover-icon-reverse w-100">Send OTP</button>
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
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
