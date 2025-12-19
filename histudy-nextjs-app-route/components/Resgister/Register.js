"use client";

import Link from "next/link";
import React from "react";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { registerSchema } from "../../validations/auth/validation";
import { UserAuthServices } from "../../services/User";
const Register = () => {
  const router = useRouter();

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
                const payload = {
                  name: values.name,
                  phone: values.phone,
                  email: values.email,
                  password: values.password,
                  profession:
                    values.profession === "Working Professional" ? values.company : values.profession || "",
                  university:
                    values.profession === "1st Year" || values.profession === "Final Year" ? values.university : "",
                };

                await UserAuthServices.userRegister(payload);
                router.push('/login');
              } catch (err) {
                setErrors({ submit: err.message || 'Registration failed' });
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ isSubmitting, errors, values, setFieldValue }) => (
              <Form className="max-width-auto">
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
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </>
  );
};

export default Register;
