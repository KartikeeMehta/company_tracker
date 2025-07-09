require('dotenv').config();

const express = require("express");
const mongoose = require("mongoose")
const app = express();
const port = 8000;
const authRoutes = require('./routes/authRoutes');
const bodyParser = require('body-parser');


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());


mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected Successfully "))
.catch((err) => console.log("MongoDb Connection error", err));

app.use('/api', authRoutes);

app.get("/home", (req,res)=>{
    res.send("server workig on home ")
})


app.listen(port, (req,res)=>{
    console.log(`Port is listening on: ${port}`)
})