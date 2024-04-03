import mongoose from "mongoose";

const bannerSchema = mongoose.Schema({
    title: {
        type: String,
    },
    image: {
        type: String,
    },
    description: {
        type: String
    },
    type:{
        type: String 
    }
})

const BannerModel = mongoose.model("bannerModel", bannerSchema);
export default BannerModel;