"use client";

import Link from "next/link";
import React from "react";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { loginSchema, loginUser } from "../../validations/auth/validation";

const Login = () => {
  const router = useRouter();

  return (
    <>
      <div className="col-lg-6">
        <div className="rbt-contact-form contact-form-style-1 max-width-auto">
          <h3 className="title">Login</h3>
          <Formik
            initialValues={{ identifier: "", password: "", rememberme: false }}
            validationSchema={loginSchema}
            onSubmit={async (values, { setSubmitting, setErrors }) => {
              try {
                await loginUser(values);
                router.push('/dashboard');
              } catch (err) {
                setErrors({ submit: err.message || 'Login failed' });
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ isSubmitting, values }) => (
              <Form className="max-width-auto">
                <div className="form-group">
                  <Field name="identifier" type="text" placeholder="Username or email *" />
                  <span className="focus-border"></span>
                  <div className="text-danger"><ErrorMessage name="identifier" /></div>
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

              </Form>
            )}
          </Formik>
        </div>
      </div>

    </>
  );
};

export default Login;
