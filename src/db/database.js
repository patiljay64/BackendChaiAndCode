import mongoose from "mongoose";

import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInstanse = await mongoose.connect(
            `${process.env.MONGODB_URI}/${DB_NAME}`
        );
        console.log(
            `\n MongoDB Connected successfully !!! DB HOST ${connectionInstanse.connection.host}`
        );
    } catch (error) {
        console.log("MONGO_DB Connection Failed: ", error);
        process.exit(1);
    }
};

export default connectDB;
