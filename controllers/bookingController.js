const axios = require('axios');

const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get currently booked tour
  const tour = await Tour.findById(req.params.tourId);
  // console.log(tour)

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  // 2) Initialize Paystack transaction
  const response = await axios({
    method: 'POST',
    url: 'https://api.paystack.co/transaction/initialize',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    data: {
      email: req.user.email,

      // Paystack expects amount in the currency subunit
      amount: tour.price * 100,

      currency: 'NGN',

      callback_url: `${req.protocol}://${req.get('host')}/`,

      metadata: {
        tourId: tour.id,
        userId: req.user.id,
        tourName: tour.name,
      },
    },
  });

  // 3) Send checkout information
  res.status(200).json({
    status: 'success',
    session: {
      authorizationUrl: response.data.data.authorization_url,
      accessCode: response.data.data.access_code,
      reference: response.data.data.reference,
    },
  });
});