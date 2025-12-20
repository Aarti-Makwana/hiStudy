import * as Yup from 'yup';

export const registerSchema = Yup.object({
  email: Yup.string().email('Invalid email').required('Email is required'),
  name: Yup.string().min(3, 'Too short').required('Name is required'),
  password: Yup.string().min(6, 'Minimum 6 characters').required('Password is required'),
  phone: Yup.string().required('Phone is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Required'),
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
  registerSchema,
  loginSchema,
  forgotSchema,
  resetPasswordSchema,
};
