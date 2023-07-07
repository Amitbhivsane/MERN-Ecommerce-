const ErrorHander = require("../utils/ErrorHander");
const cathchAsyncError = require("../middleware/CatchAsyncError");
const User = require("../model/userModele");
const sendToken = require("../utils/jwtToken");
const sendemail = require("../utils/sendemail");
const crypto = require("crypto");
const cloudinary = require("cloudinary");
const { error } = require("console");

//Register User

exports.registerUser = cathchAsyncError(async (req, res, next) => {
  const mycloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
    folder: "avatars",
    width: 1500,
    crop: "scale",
  });

  const { name, email, password } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: mycloud.public_id,
      url: mycloud.secure_url,
    },
  });

  sendToken(user, 201, res);
});

//login user

exports.loginuser = cathchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  //checking if user  has given password and email both

  if (!email || !password) {
    return next(new ErrorHander("plz enter email & password ", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHander("invalid email and password", 401));
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHander("invalid email and password", 401));
  }
  sendToken(user, 200, res);
});

//logout User

exports.logout = cathchAsyncError(async (req, res, next) => {
  res.cookie("token", null),
    {
      expires: new Date(Date.now()),
      httpOnly: true,
    };

  res.status(200).json({
    success: true,
    message: "Loggin out",
  });
});

//forgot password

exports.forgotPassword = cathchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHander("user not found..", 404));
  }

  //get reset password token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;

  const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\n if you have not requestesd this email than plz ingnor it`;

  try {
    await sendemail({
      email: user.email,
      subject: `Eommerce password Recovery`,
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email send to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHander(error.message, 500));
  }
});

//reset password

exports.resetPassword = cathchAsyncError(async (req, res, next) => {
  //creating  token hash
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHander("Reset Password token is invalid has be expired", 404)
    );
  }
  if (req.body.password !== req.body.comparePassword) {
    return next(new ErrorHander("password does not matched"));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res);
});

//Get user details
exports.getUserDetails = cathchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

//Update user details
exports.updatePassword = cathchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHander("old password is incorrect", 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHander(" password does not match", 400));
  }

  user.password == req.body.newPassword;

  await user.save();
  sendToken(user, 200, res);
});

//Update profile details
exports.updateProfile = cathchAsyncError(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };

  //we well cloudinary letter
  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  sendToken(user, 200, res);

  res.status(200).json({
    success: true,
  });
});

//get all user --admin
exports.getAllUsers = cathchAsyncError(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});

//get single user --(admin)--
exports.getSingleUsers = cathchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHander(`user does not exist with id ${req.params.id} `)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});

//Update user Role --admin
exports.updateUserRole = cathchAsyncError(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  let user = User.findById();

  if (!user) {
    return next(
      new ErrorHander(`user does not exist with id :${req.params.id} `, 400)
    );
  }

  await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

//delete user details -admin
exports.deleteuser = cathchAsyncError(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(
      new ErrorHander(`user does not exist  wit id:${req.params.id}`)
    );
  }

  const imageId = user.avatar.public_id;

  await cloudinary.v2.uploader.destroy(imageId);

  await user.remove();

  res.status(200).json({
    success: true,
    message: "user deleted successfully",
  });
});
