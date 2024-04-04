import express from "express";
import {
  SignUp,
  contactUs,
  singleAppointment,
  myAppointments,
  viewSingleDoctor,
  updateReview,
  getReviews,
  makeReview,
  reScheduleAppointment,
  validatePatientPayment,
  cancelAppointment,
  viewAppointment,
  bookAppointment,
  getAllDoctor,
  verifyEmail,
  makePaymentDcotorValidate,
  makePaymentDcotor,
  allNotification,
  chekLicenseIsValid,
  forgot_password,
  login,
  resetPassword,
  logout,
  checkApplied,
  verifyForgotOtp,
  applyDoctorApplication,
} from "../controller/userController.js";
import {
  verifyAdmin,
  verifyDoctor,
  verifyToken,
  verifyUser,
} from "../utils/verifyToken.js";
import { SuccessMsg } from "../utils/sucess.js";
import { validateSignup } from "../middlewires/signUpvalidate.js";
import { loginValidation } from "../middlewires/loginValidation.js";
const router = express.Router();

//post routes from users
router.post("/SignUp", validateSignup, SignUp);
router.post("/login", loginValidation, login);
router.post("/logout", logout);
router.post("/verify_email", verifyEmail);
router.post("/forgot_password", forgot_password);
router.post("/resetPassword", resetPassword);
router.post("/verifyForgotOtp", verifyForgotOtp);
router.post("/apply_doctorApplication", verifyUser, applyDoctorApplication);
router.post("/chek_licenseIsValid", verifyUser, chekLicenseIsValid);

//make payment
router.post("/order", makePaymentDcotor);
router.post("/order/validate", makePaymentDcotorValidate);
router.post("/order/validatePatientPayment", validatePatientPayment);
router.get("/checkApplied/:userId", checkApplied);
router.get("/get_allNotification/:id", allNotification);
router.get("/get_allDoctor", getAllDoctor);
router.post("/make_appointment", bookAppointment);
router.get("/view_appointment/:id", viewAppointment);
router.post("/cancel_Appointment", cancelAppointment);
router.post("/reScheduleAppointment", reScheduleAppointment);
router.get("/view_doctor/:id", viewSingleDoctor);
router.post("/make_review", makeReview);
router.post("/update_review", updateReview);
router.get("/get_review/:id", getReviews);
router.get("/my_appointments/:id", myAppointments);
router.get("/single_appointments/:id", singleAppointment);
router.post("/contactUs", contactUs);

router.get("/check", (req, res, next) => {
  res.send("server started ");
});
export default router;
