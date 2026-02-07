import Image from "next/image";
import { useFormik } from "formik";
import { toast } from "react-hot-toast";

import { useSettings } from "@/context/SettingsContext";
import MirrorLoader from "../Common/MirrorLoader";

import img from "../../public/images/about/contact.jpg";
import { generalInfoValidation } from "@/validations/GeneralInfo/validation";
import { GeneralInfoService } from "@/services/User";


const ContactForm = ({ gap }) => {
  const { settings, loading } = useSettings();
  const contactData = settings?.contact_us;

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
    validationSchema: generalInfoValidation,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        const response = await GeneralInfoService.generalInquiry(values);
        if (response.status === "success" || response.success) {
          toast.success(response.message || "Contact create successfully.");
          resetForm();
        } else {
          toast.error(response.message || "Something went wrong.");
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || "Internal Server Error");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <>
      <div className={`rbt-contact-address ${gap}`}>
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-6">
              <div className="thumbnail">
                <Image
                  className="w-100 radius-6"
                  src={img}
                  alt="Contact Images"
                />
              </div>
            </div>

            <div className="col-lg-6">
              <div className="rbt-contact-form contact-form-style-1 max-width-auto">
                <div className="section-title text-start">
                  <span className="subtitle bg-primary-opacity">
                    EDUCATION FOR EVERYONE
                  </span>
                </div>
                {loading ? (
                  <MirrorLoader widthClass="w-400" heightClass="h-40" className="mb-4" />
                ) : (
                  <h3
                    className="title"
                    dangerouslySetInnerHTML={{
                      __html: contactData?.form_heading?.replace(/\n/g, "<br />") || "Get a Free Course You Can Contact With Me",
                    }}
                  ></h3>
                )}

                <form
                  id="contact-form"
                  onSubmit={formik.handleSubmit}
                  className="rainbow-dynamic-form max-width-auto"
                >
                  <div className="form-group">
                    <input
                      name="name"
                      id="contact-name"
                      type="text"
                      placeholder="Name"
                      {...formik.getFieldProps("name")}
                    />
                    <span className="focus-border"></span>
                    {formik.touched.name && formik.errors.name ? (
                      <div className="text-danger mt-1">
                        {formik.errors.name}
                      </div>
                    ) : null}
                  </div>
                  <div className="form-group">
                    <input
                      name="email"
                      type="email"
                      placeholder="Email"
                      {...formik.getFieldProps("email")}
                    />
                    <span className="focus-border"></span>
                    {formik.touched.email && formik.errors.email ? (
                      <div className="text-danger mt-1">
                        {formik.errors.email}
                      </div>
                    ) : null}
                  </div>
                  <div className="form-group">
                    <input
                      name="phone"
                      type="text"
                      placeholder="Phone"
                      {...formik.getFieldProps("phone")}
                    />
                    <span className="focus-border"></span>
                    {formik.touched.phone && formik.errors.phone ? (
                      <div className="text-danger mt-1">
                        {formik.errors.phone}
                      </div>
                    ) : null}
                  </div>
                  <div className="form-group mb--20">
                    {loading ? (
                      <MirrorLoader widthClass="w-100p" heightClass="h-50" />
                    ) : (
                      <select
                        name="subject"
                        id="subject"
                        {...formik.getFieldProps("subject")}
                        className="rbt-select"
                      >
                        <option value="">Select Subject</option>
                        {contactData?.subjects?.map((subject, index) => (
                          <option key={index} value={subject}>
                            {subject}
                          </option>
                        ))}
                      </select>
                    )}
                    {formik.touched.subject && formik.errors.subject ? (
                      <div className="text-danger mt-1">
                        {formik.errors.subject}
                      </div>
                    ) : null}
                  </div>

                  <div className="form-group">
                    <textarea
                      name="message"
                      id="contact-message"
                      placeholder="Message"
                      {...formik.getFieldProps("message")}
                    ></textarea>
                    <span className="focus-border"></span>
                    {formik.touched.message && formik.errors.message ? (
                      <div className="text-danger mt-1">
                        {formik.errors.message}
                      </div>
                    ) : null}
                  </div>
                  <div className="form-submit-group">
                    <button
                      name="submit"
                      type="submit"
                      id="submit"
                      disabled={formik.isSubmitting}
                      className="rbt-btn btn-md btn-gradient hover-icon-reverse w-100"
                    >
                      <span className="icon-reverse-wrapper">
                        <span className="btn-text">
                          {formik.isSubmitting ? "Sending..." : "Submit"}
                        </span>
                        <span className="btn-icon">
                          <i className="feather-arrow-right"></i>
                        </span>
                        <span className="btn-icon">
                          <i className="feather-arrow-right"></i>
                        </span>
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactForm;
