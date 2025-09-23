import mongoose from "mongoose";

const feoSchema = new mongoose.Schema({
    image: {
        type: String, 
        required: true,
    },
    fullname: {
        type: String,
        required: true
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
    date:{
        type:Number,
        required:true,
    }

})

const feoModel = mongoose.models.feo || mongoose.model('feo',feoSchema)

export default feoModel

