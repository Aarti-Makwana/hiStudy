"use client";

import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import Swal from "sweetalert2";
import { useRouter, useSearchParams } from "next/navigation";
import { UserAuthServices } from "../../services/User";
import { resetPasswordSchema } from "../../validations/auth/validation";

const ResetPasswordPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="rbt-contact-form contact-form-style-1 max-width-auto">
            <h3 className="title">Reset Password</h3>
            <Formik
              initialValues={{ new_password: "", new_password_confirmation: "" }}
              validationSchema={resetPasswordSchema}
              onSubmit={async (values, { setSubmitting, setErrors }) => {
                try {
                  const body = {
                    new_password: values.new_password,
                    new_password_confirmation: values.new_password_confirmation,
                  };
                  const queryParams = { email, token };
                  const res = await UserAuthServices.resetPasswordService(body, queryParams);
                  if (res && res.status === 'success') {
                    Swal.fire('Success!', res.message || 'Password reset successful', 'success');
                    router.push('/login');
                  } else {
                    setErrors({ submit: res?.message || 'Reset failed' });
                  }
                } catch (err) {
                  setErrors({ submit: err?.message || 'Reset failed' });
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({ isSubmitting, errors }) => (
                <Form>

                  <div className="form-group">
                    <Field name="new_password" type="password" placeholder="New password *" />
                    <span className="focus-border"></span>
                    <div className="text-danger"><ErrorMessage name="new_password" /></div>
                  </div>

                  <div className="form-group">
                    <Field name="new_password_confirmation" type="password" placeholder="Confirm new password *" />
                    <span className="focus-border"></span>
                    <div className="text-danger"><ErrorMessage name="new_password_confirmation" /></div>
                  </div>

                  {errors.submit && <div className="text-danger mb-3">{errors.submit}</div>}

                  <div className="form-submit-group">
                    <button type="submit" disabled={isSubmitting} className="rbt-btn btn-md btn-gradient hover-icon-reverse w-100">Reset Password</button>
                  </div>

                </Form>
              )}
            </Formik>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
