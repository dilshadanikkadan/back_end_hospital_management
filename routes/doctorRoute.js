import express from "express";

import {
  verifyAdmin,
  verifyDoctor,
  verifyToken,
  verifyUser,
} from "../utils/verifyToken.js";
import {
  doctorLogin,
  getPatientAnalaystics,
  withDrawAmount,
  approveAppointment,
  pendingAppointment,
  deleteTime,
  setDates,
  getAllDates,
  deleteDate,
  setTime,
} from "../controller/doctorController.js";

const router = express.Router();

router.post("/doctor_login", doctorLogin);
router.post("/setdates", verifyDoctor,setDates);
router.get("/get_Alldates/:id", getAllDates);
router.post("/delete_date",verifyDoctor, deleteDate);
router.post("/add_time", verifyDoctor,setTime);
router.post("/delete_time", verifyDoctor,deleteTime);
router.get("/get_pendingAppointment/:doctorId", pendingAppointment);
router.post("/approve_appointment", approveAppointment);
router.get("/get_patientAnalystics/:id", getPatientAnalaystics);
router.post("/withdraw_amount",verifyDoctor, withDrawAmount);

export default router;
