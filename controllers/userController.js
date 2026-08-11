const multer = require('multer');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

const multerStorage = multer.diskStorage({
  destination: (req, file, cd) => {
    cd(null, 'public/img/users');
  },
  filename: (req, file, cd) => {
    // user-78987546ba-3322467862.jpeg
    const ext = file.mimetype.split('/')[1];
    cd(null, `user-${req.user.id}-${Date.now()}.${ext}`);
  }
});

const multerFilter = (req, file, cd) => {
  if (file.mimetype.startsWith('image')) {
    cd(null, true)
  } else {
    cd(new AppError('Not am image! Please upload only images.', 400), false)
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('photo')

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if(allowedFields.includes(el)) newObj[el] = obj[el];
  })
  return newObj;
}

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};;

exports.updateMe = catchAsync(async (req, res, next) => {
  console.log(req.file);
  console.log(req.body);

  // 1) create an error if user post password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError(
      'This route is not for password update. Please use /updateMyPassword.',
       400
      )
    );
  }

  // 2) filtered out unwanted names
  const filteredBody = filterObj(req.body, 'name', 'email');

  // 2) update user documents
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true, 
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, {active: false})

  res.status(204).json({
    status: 'success',
    data: null
  });
});


exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! and Please use /signup instead'
  });
};
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);

// do not update passwords with this!
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);