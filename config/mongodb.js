import mongoose from "mongoose";

<<<<<<< HEAD
const connectDB = async () =>{
    mongoose.connection.on('connected', ()=> console.log("Database Connected"))
=======
const connectDB = async () => {
  try {
    mongoose.connection.on('connected', () => console.log("Database Connected"))
    await mongoose.connect(`${process.env.MONGODB_URL}/AquaShield`)
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
>>>>>>> 0755a86 (modify report route)

    await mongoose.connect(`${process.env.MONGODB_URI}/AquaShield`)
}

export default connectDB