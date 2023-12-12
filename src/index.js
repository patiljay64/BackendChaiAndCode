// require('dotenv').config({ path: './env' })

import dotenv from "dotenv";
import connectDB from "./db/database.js";
dotenv.config({
    path: './env'
});


connectDB()


/*
import express from "express";
const app = express();

// IIFE  function {defination and calling immideatly}
; (async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error) => {
            console.log("Appication unable to connect with DB");
            console.log("ERROR: ", error);
            throw error
        })


        app.listen(process.env.PORT, () => {
            console.log(`app is listening to the port ${process.env.PORT}`);
        })
    } catch (error) {
        console.error("ERROR: ", error);
        throw err
    }
})()

*/
