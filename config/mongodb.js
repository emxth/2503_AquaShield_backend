import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on('connected', ()=> console.log("Database Connected"))
    await mongoose.connect(`${process.env.MONGODB_URI}/AquaShield`)
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export default connectDB
