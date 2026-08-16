import axios from 'axios';
import { showAlert } from './alert';

export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/updateMyPassword'
        : '/api/v1/users/updateMe';

    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });

    if (res.data.status === 'success') {
      showAlert(
        'success',
        `${type.toUpperCase()} updated successfully!`
      );
    }
  } catch (err) {
    // console.log('STATUS:', err.response?.status);
    // console.log('DATA:', err.response?.data);

    showAlert(
      'error',
      err.response?.data?.message ||
        err.message ||
        'Something went wrong!'
    );
  }
};