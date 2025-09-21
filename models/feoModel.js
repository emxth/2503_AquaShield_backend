import mongoose from "mongoose";

const feoSchema = new mongoose.Schema({
    photo: {
        type: String, 
        required: true,
        default:"data:image/png;base64,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"
    },
    fullname: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    department: {
        type: String,
        enum: ['Marine Police', 'Coastal Surveillance', 'Fisheries Department'],
        required: true
    },
    designation: {
        type: String,
        enum: ['Officer', 'Inspector', 'Senior Officer'],
        required: true
    },
    employeeId: {
        type: String,
        required: true,
        unique: true
    },
    assignedArea: {
        type: String,
        required: true
    },
    nicNo: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    officeContact: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    officeId: {
        type: String, 
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    date:{
        type:Number,
        required:true,
    }

})

const feoModel = mongoose.models.feo || mongoose.model('feo',feoSchema)

export default feoModel

