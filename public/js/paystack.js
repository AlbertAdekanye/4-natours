import axios from 'axios';
import { showAlert } from './alert';

export const bookTour = async tourId => {
  try {
    const res = await axios({
      method: 'GET',
      url: `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`,
    });

    if (res.data.status === 'success') {
      const checkoutUrl = res.data.session.authorizationUrl;

      console.log('CHECKOUT URL:', checkoutUrl);

      if (!checkoutUrl) {
        throw new Error('No Paystack checkout URL returned');
      }

      window.location.assign(checkoutUrl);
    }
  } catch (err) {
    console.log(err.response?.data || err);

    showAlert(
      'error',
      err.response?.data?.message || 'Unable to start payment.'
    );
  }
};