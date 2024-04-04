import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createError } from "../utils/error.js";
import ApprovedDoctorModel from "../models/Doctor/approvedDoctorModel.js";
import Appointment from "../models/AppointmentModel.js";

export const doctorLogin = async (req, res, next) => {
  try {
    const userExist = await User.findOne({ email: req.body.email });
    if (!userExist) return next(createError(400, "doctor not found"));
    const isDoctor = userExist.isDoctor;
    if (!isDoctor) return next(createError(401, "you are not an doctor"));
    const validPassword = await bcrypt.compare(
      req.body.password,
      userExist.password
    );
    if (!validPassword) return next(createError(400, "Invalid password"));

    const token = jwt.sign(
      {
        id: userExist._id,
        role: userExist.role,
        isAdmin: userExist.isAdmin,
        isDoctor: userExist.isDoctor,
      },
      process.env.JWT_SECRET,
      { expiresIn: 360000 }
    );
    res.cookie("token", token, { httpOnly: true });
    res.status(200).json({
      userExist,
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const setDates = async (req, res) => {
  const { doctorId, dateObj } = req.body;

  try {
    const findDoc = await ApprovedDoctorModel.findOneAndUpdate(
      { user: doctorId },
      {
        $push: {
          BookedDates: {
            date: dateObj.date,
            month: dateObj.month,
            year: dateObj.year,
            day: dateObj.day,
          },
        },
      },
      { new: true }
    );
    res.status(200).json(findDoc);
  } catch (error) {}
};

export const getAllDates = async (req, res) => {
  const userId = req.params.id;
  try {
    const response = await ApprovedDoctorModel.findOne(
      { user: userId },
      { BookedDates: 1 }
    );

    res.status(200).json(response.BookedDates);
  } catch (error) {
    console.log(error);
  }
};

//deleting setdates

export const deleteDate = async (req, res) => {
  const { userId, dateObjId } = req.body;
  try {
    const response = await ApprovedDoctorModel.findOneAndUpdate(
      { user: userId },
      { $pull: { BookedDates: { _id: dateObjId } } },
      { new: true }
    );

    return res.status(200).json(response);
  } catch (error) {}
};

//setting time
export const setTime = async (req, res, next) => {
  const { bookedDateId, userId, timeObj } = req.body;
  console.log(bookedDateId);
  console.log(userId);
  try {
    const response = await ApprovedDoctorModel.findOneAndUpdate(
      { user: userId, "BookedDates._id": bookedDateId },
      {
        $push: {
          "BookedDates.$.time": {
            from: timeObj.from,
            to: timeObj.to,
            availbaleTimes: generateTimeIntervals(timeObj.from, timeObj.to),
          },
        },
      },
      { new: true }
    );

    return res.status(200).json(response);
  } catch (error) {
    next(error)
  }
};

// Function to generate time intervals
const generateTimeIntervals = (startTime, endTime) => {
  const intervals = [];
  let startHour = parseInt(startTime);
  let endHour = parseInt(endTime);
  startHour.toString().length == 1 ? (startHour += 12) : "";
  endHour.toString().length == 1 ? (endHour += 12) : "";

  console.log("Start Time:", startHour);
  console.log("End Time:", endHour);
  const adjustedEndHour = endHour < startHour ? endHour + 24 : endHour;

  for (
    let currentHour = startHour;
    currentHour <= adjustedEndHour;
    currentHour++
  ) {
    if (currentHour >= 0 && currentHour < 23) {
      for (let currentMinute = 0; currentMinute < 60; currentMinute += 15) {
        let hour = currentHour % 24;
        hour > 12 ? (hour -= 12) : "";

        let from = `${hour < 10 ? "0" : ""}${hour}:${
          currentMinute < 10 ? "0" : ""
        }${currentMinute}`;
        intervals.push({
          from,
          status: "",
        });
      }
    }
  }

  console.log(intervals);
  return intervals;
};

//setting time
export const deleteTime = async (req, res, next) => {
  const { bookedDateId, userId, timeId } = req.body;
  console.log(bookedDateId);
  console.log(userId);
  try {
    const response = await ApprovedDoctorModel.findOneAndUpdate(
      { user: userId, "BookedDates._id": bookedDateId },
      { $pull: { "BookedDates.$.time": { _id: timeId } } },
      { new: true }
    );

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

//getting appointments
export const pendingAppointment = async (req, res, next) => {
  const { doctorId } = req.params;
  console.log("parms is :" + req.params.doctorId);
  try {
    const currentDoctor = await ApprovedDoctorModel.findOne({ user: doctorId });
    const checkAppointment = await Appointment.find({
      doctor: currentDoctor._id,
    });
    return res.status(200).json(checkAppointment);
  } catch (error) {
    next(error);
  }
};

//approved appointment
export const approveAppointment = async (req, res, next) => {
  const { apppointmentId, presciptionLink, myId } = req.body;
  try {
    const response = await Appointment.findOneAndUpdate(
      { _id: apppointmentId },
      { $set: { status: "completed", prescription: presciptionLink } },
      { new: true }
    );
    const accountBalanceUpdate = await User.findOneAndUpdate(
      { isAdmin: true },
      { $inc: { accountBalance: -799 } }
    );
    const Doctor = await User.findByIdAndUpdate(myId, {
      $inc: { accountBalance: 799 },
    });

    return res.status(200).json(response);
  } catch (error) {
    next(createError(400, error));
  }
};

//getPatientAnalaystics
export const getPatientAnalaystics = async (req, res, next) => {
  try {
    const date = new Date();
    const lastMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const previousMonth = new Date(lastMonth);
    previousMonth.setMonth(previousMonth.getMonth() - 1);

    const data = await Appointment.aggregate([
      {
        $match: {
          doctorListId: req.params.id,
          createdAt: { $gte: previousMonth },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
          amount: { $sum: 799 },
        },
      },
      {
        $project: {
          _id: 0,
          month: "$_id",
          count: 1,
          amount: 1,
        },
      },
    ]);
    res.status(200).json(data);
  } catch (error) {
    next(createError(400, error));
  }
};


//withdraw the amount
export const withDrawAmount = async (req, res, next) => {
  const { myId, amount } = req.body;
  try {
    const Doctor = await User.findByIdAndUpdate(myId, {
      $inc: { accountBalance: -amount },
    });
    return res.status(200).json("withdraw sucessfully");
  } catch (error) {
    next(createError(400, error));
  }
};
