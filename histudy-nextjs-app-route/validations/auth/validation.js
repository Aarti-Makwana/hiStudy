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
export default {
  registerSchema,
  loginSchema,
};
