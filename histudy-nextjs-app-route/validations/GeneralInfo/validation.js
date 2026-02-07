import * as Yup from "yup";

/**
 * Validation schema for the General Inquiry (Contact Us) form.
 */
export const generalInfoValidation = Yup.object().shape({
    name: Yup.string()
        .required("Name is required")
        .min(2, "Name must be at least 2 characters"),
    email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
    phone: Yup.string()
        .matches(/^[0-9]{10}$/, "Phone number must be exactly 10 digits")
        .nullable()
        .transform((value) => (value === "" ? null : value)),
    subject: Yup.string()
        .required("Subject is required")
        .min(5, "Subject must be at least 5 characters"),
    message: Yup.string()
        .required("Message is required")
        .min(10, "Message must be at least 10 characters"),
});

export default {
    generalInfoValidation,
};
