import Swal from 'sweetalert2';

const defaultOptions = {
  confirmButtonText: 'OK',
  allowOutsideClick: false,
};

export const showSuccess = async (title = 'Success', text = '') => {
  return Swal.fire({
    icon: 'success',
    title,
    text,
    ...defaultOptions,
  });
};

export const showError = async (title = 'Error', text = '') => {
  return Swal.fire({
    icon: 'error',
    title,
    text,
    ...defaultOptions,
  });
};

export const showInfo = async (title = 'Info', text = '') => {
  return Swal.fire({
    icon: 'info',
    title,
    text,
    ...defaultOptions,
  });
};

export default { showSuccess, showError, showInfo };
