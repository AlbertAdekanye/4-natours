const axios = require('axios');

const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');

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

      callback_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,

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

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { reference } = req.query;

  if (!reference) {
    return next();
  }

  const response = await axios({
    method: 'GET',
    url: `https://api.paystack.co/transaction/verify/${reference}`,
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    },
  });

  const transaction = response.data.data;

  if (transaction.status !== 'success') {
    return next(
      new AppError('Payment could not be verified.', 400)
    );
  }

  const { tourId, userId } = transaction.metadata;

  const tour = await Tour.findById(tourId);

  if (!tour) {
    return next(new AppError('Tour not found.', 404));
  }

  await Booking.create({
    tour: tourId,
    user: userId,
    price: tour.price,
  });

  res.redirect('/');
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);