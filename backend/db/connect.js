import mongoose from "mongoose";

const connectToMongoDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URL);
    console.log("connected to Mongodb");
  } catch (error) {
    console.log("Error connecting to MongoDB");
  }
};

export default connectToMongoDb;
