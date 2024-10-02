const express = require("express");
const cors=require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const connectDb = require('./config/connectDB');
const TelegramBot = require('./telegramBot');

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
dotenv.config();


connectDb().then(()=>{
    app.listen(PORT,()=>{
        console.log(`Server listening to  http://localhost:${PORT}`);
    })
});


app.get('/cronJob',(req,res)=>{
    console.log("Cron job triggered");
    res.status(200).send("Cron job triggered");
})

