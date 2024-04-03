import mongoose from "mongoose";

const reviewSchema = mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'approvedList',
        required: true
    },
    doctorListId: String,
    reviewText: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },

}, {
    timestamps: true
})

const ReviewModel = mongoose.model("reviewModel", reviewSchema);


export default ReviewModel