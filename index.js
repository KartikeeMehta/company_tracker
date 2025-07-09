require('dotenv').config();

const express = require("express");
const mongoose = require("mongoose")
const app = express();
const port = 8000;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected Successfully "))
.catch((err) => console.log("MongoDb Connection error", err));


app.listen(port, (req,res)=>{
    console.log(`Port is listening on: ${port}`)
})