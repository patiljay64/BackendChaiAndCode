// require('dotenv').config({ path: './env' })

import dotenv from "dotenv";
import connectDB from "./db/database.js";
import app from "./app.js"
dotenv.config({
    path: './env'
});

//database connection  
connectDB()
    .then(() => {
        app.on("error", (error) => {
            console.log("Application Unable to connect with DB: ", error);
            throw error;
        });

        app.listen((process.env.PORT || 4000), () => {
            console.log(`Server is listen at the port ${process.env.PORT}`);
        });

    })
    .catch((err) => {
        console.log("Connection with DB Failed: ", err);
        process.exit(1);
    });


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
