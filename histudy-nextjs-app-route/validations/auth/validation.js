import * as Yup from 'yup';

// Step 1: User Details
export const step1Schema = Yup.object().shape({
  name: Yup.string().required("Full name is required"),
  phone: Yup.string().required("Phone number is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  profession: Yup.string().required("Profession is required"),
});

// Step 2: OTP
export const step2Schema = Yup.object({
  otp: Yup.string().length(6, "OTP must be 6 digits").required("OTP is required"),
});

// Step 3: Password
export const step3Schema = Yup.object({
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Confirm Password is required"),
});

export const loginSchema = Yup.object({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

export const forgotSchema = Yup.object({
  email: Yup.string().email('Invalid email').required('Email is required'),
  last4: Yup.string()
    .matches(/^[0-9]{4}$/, 'Enter last 4 digits')
    .required('Last 4 digits are required'),
});

export const resetPasswordSchema = Yup.object({
  new_password: Yup.string().min(6, 'Minimum 6 characters').required('New password is required'),
  new_password_confirmation: Yup.string()
    .oneOf([Yup.ref('new_password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

export default {
  step1Schema,
  step2Schema,
  step3Schema,
  loginSchema,
  forgotSchema,
  resetPasswordSchema,
};
