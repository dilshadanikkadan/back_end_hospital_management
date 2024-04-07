import User from "../models/userModel.js";
import dotenv from 'dotenv';
dotenv.config();
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createError } from "../utils/error.js";
import DoctorApplication from "../models/doctorApplicationModel.js";
import LicenseShema from "../models/licenseModel.js";
import NotificationRoom from "../models/socket/notificationRoom.js";
import InvoiceSchema from "../models/admin/invoiceModel.js";
import easyinvoice from "easyinvoice";
import { dataPdf } from "../utils/pdfData.js";
import cloudinary from "cloudinary";
import fs from "fs";
import ApprovedDoctorModel from "../models/Doctor/approvedDoctorModel.js";
import BannerModel from "../models/admin/BannerModel.js";
import SpecialityModel from "../models/admin/specialityModel.js";

//config for cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

//login admin 
export const admin_login = async (req, res, next) => {
  const { email } = req.body;
  try {
    const userExist = await User.findOne({ email: email });
    if (!userExist) return next(createError(400, "admin not found"));
    const isAdmin = userExist.isAdmin;
    if (!isAdmin) return next(createError(401, "you are not an admin"));
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

//gett all users
export const getAllUsers = async (req, res, next) => {
  try {
    const allUsers = await User.find(
      { isAdmin: { $ne: true } },
      { password: 0 }
    );

    return res.status(200).json(allUsers);
  } catch (error) {
    console.log(error);
  }
};

//gte signle user
export const singleUser = async (req, res, next) => {
  if (req.params.userId === "undefined") {
    console.log(" params id is " + req.params.userId);
    return next(createError(400, "no id here"));
  }
  const userId = req.params.userId;
  try {
    const singleuser = await User.findById(userId, { password: 0 });
    return res.status(200).json(singleuser);
  } catch (error) {
    next(error);
  }
};

//get all pending requests

export const pendingDoctorRequest = async (req, res, next) => {
  try {
    const allPendingRequest = await DoctorApplication.find();
    return res.status(200).json(allPendingRequest);
  } catch (error) {
    next(error);
  }
};

//get single pending doctor
export const singlePedingDoctor = async (req, res, next) => {
  try {
    const doctorId = req.params.doctorId;
    const singledoctor = await DoctorApplication.findById(doctorId);

    return res.status(200).json(singledoctor);
  } catch (error) {
    next(error);
  }
};

//delete  single User
export const deleteUser = async (req, res, next) => {
  const userId = req.params.userId;
  try {
    const deleteuser = await User.findByIdAndDelete(userId);
    return res.status(200).json("delted user successsfully");
  } catch (error) {
    next(error);
  }
};

// block user--------------------
export const blockUser = async (req, res, next) => {
  const { email } = req.body;
  try {
    const update = await User.findOneAndUpdate(
      { email },
      { $set: { status: "blocked" } }
    );
    return res.status(200).json("blocked successfully");
  } catch (error) {
    next(error);
  }
};

// unBlock user
export const unBlock = async (req, res, next) => {
  const { email } = req.body;
  try {
    const update = await User.findOneAndUpdate(
      { email },
      { $set: { status: "active" } }
    );

    console.log(update);
    return res.status(200).json("unblocked successfully");
  } catch (error) {
    next(error);
  }
};

//license adding
export const addLicenses = async (req, res, next) => {
  const { licenseNo } = req.body;
  let id = "6612ca6b7f9621bc7064d397";
  try {
    const lisenceAdding = await LicenseShema.updateOne(
      { _id: id },
      { $addToSet: { licenses: licenseNo } },
      { new: true }
    );

    if (lisenceAdding.modifiedCount === 0) {
      res.status(200).json("License already exists in the array.");
    } else {
      res.status(200).json("License added to the array.");
    }
  } catch (error) {
    next(error);
  }
};

//delteLicesnce
export const deleteLicense = async (req, res) => {
  const { licenseNo } = req.body;
  let id = "6612ca6b7f9621bc7064d397";

  try {
    const response = await LicenseShema.updateOne(
      { _id: id },
      { $pull: { licenses: licenseNo } },
      { new: true }
    );
    return res.json(200).json(response);
  } catch (error) {}
};

export const getAllLcense = async (req, res, next) => {
  let id = "6612ca6b7f9621bc7064d397";

  try {
    const response = await LicenseShema.findById(id);
    return res.status(200).json(response.licenses);
  } catch (error) {
    next(error);
  }
};

//sendinvice
export const sendInvoice = async (req, res, next) => {
  const { message, typeOfMessage, subject, name, invoice, unRead, recieverId } =
    req.body;

  try {
    easyinvoice.createInvoice(dataPdf, async function (result) {
      try {
        const response = await cloudinary.v2.uploader.upload(
          `data:application/pdf;base64,${result.pdf}`,
          {
            resource_type: "image",
            folder: "application",
          }
        );
        let url = response.secure_url;
        url?.replace(".pdf", ".jpg");
        console.log("PDF uploaded successfully:", url?.replace(".pdf", ".jpg"));

        const newInvoice = new InvoiceSchema({
          recieverId,
          message,
          typeOfMessage,
          invoice: url?.replace(".pdf", ".jpg"),
          unRead,
          subject,
          name,
        });
        const saved = await newInvoice.save();
        const updatStatus = await DoctorApplication.updateOne(
          { user: recieverId },
          { $set: { status: "payment" } },
          { new: true }
        );
        console.log(updatStatus);
        return res.status(200).json(saved);
      } catch (error) {
        console.error("Error uploading PDF to Cloudinary:", error);
      }
    });
  } catch (error) {
    next(error);
  }
};

//verifyApplicationDoctor
export const verifyApplicationDoctor = async (req, res, next) => {
  const { userId } = req.body;

  try {
    const current = await DoctorApplication.findOne({ user: userId });
    const UpdateDoc = await User.findOneAndUpdate(
      { _id: userId },
      { $set: { isDoctor: true, role: "doctor" } },
      { new: true }
    );
    const updateApplcation = await DoctorApplication.updateOne(
      { user: userId },
      { $set: { verification: "true" } },
      { new: true }
    );
    const updateSatatus = await InvoiceSchema.updateOne(
      { recieverId: userId },
      { $set: { verification: "true" } },
      { new: true }
    );

    //adding doctor in approved schema
    const newApprovedSchema = new ApprovedDoctorModel({
      user: userId,
      firstname: current.firstname,
      lastname: current.lastname,
      email: current.email,
      speciality: current.speciality,
      phoneNo: current.phoneNo,
      qualification: current.qualification,
      profileImage: current.profileImage,
      licenseNo: "MA3312",
    });

    await newApprovedSchema.save();

    return res.status(200).json("successfully done");
  } catch (error) {
    next(createError(400, error));
  }
};

//getting userAnalytics
export const userAnalytics = async (req, res, next) => {
  try {
    const date = new Date();
    const lastMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const previousMonth = new Date(lastMonth);
    previousMonth.setMonth(previousMonth.getMonth() - 1);

    const data = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: previousMonth,
          },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          month: "$_id",
          count: 1,
        },
      },
    ]);

    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

//getting total profitAnalystics
export const profitAnalystics = async (req, res, next) => {
  try {
    const date = new Date();
    const lastMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const previousMonth = new Date(lastMonth);
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    const data = await ApprovedDoctorModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: previousMonth,
          },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
          amount: { $sum: 20000 },
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
    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

// managing the banner
export const addBanner = async (req, res, next) => {
  const { title, image, type, description } = req.body;
  try {
    const newBannerSchmea = new BannerModel({
      title,
      image,
      description,
      type,
    });
    const saved = await newBannerSchmea.save();
    res.status(200).json(saved);
  } catch (error) {
    next(error);
  }
};

// updating the banner
export const updateBanner = async (req, res, next) => {
  const { title, image, type, description } = req.body;
  try {
    const update = await BannerModel.findOneAndUpdate(
      { type: type },
      { $set: { ...req.body } },
      { new: true }
    );
    res.status(200).json(update);
  } catch (error) {
    console.log(error);
  }
};

// all banner
export const getBanner = async (req, res) => {
  try {
    const response = await BannerModel.find();
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
  }
};

//  maneging the specialities
export const addSpecialities = async (req, res) => {
  const { title, image, description } = req.body;
  try {
    const newSpecialitySchmea = new SpecialityModel({
      title,
      image,
      description,
    });
    const saved = await newSpecialitySchmea.save();
    res.status(200).json(saved);
  } catch (error) {
    console.log(error);
  }
};

// all specialities
export const getSpecialities = async (req, res) => {
  try {
    const response = await SpecialityModel.find();
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
  }
};

//delete specialities
export const deleteSpecialities = async (req, res, next) => {
  try {
    const response = await SpecialityModel.findByIdAndDelete(req.params.id);
    return res.status(200).json("deleted success fully");
  } catch (error) {
    next(error);
  }
};
