import mongoose from "mongoose";

const specialitySchema = mongoose.Schema({
    title: {
        type: String,
    },
    image: {
        type: String,
    },
    description: {
        type: String
    },
 
})

const SpecialityModel = mongoose.model("specialityModel", specialitySchema);
export default SpecialityModel;