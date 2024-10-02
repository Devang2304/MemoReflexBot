const User = require('../model/User');
const userJournal = require('../model/userJournal');
const PDFDocument = require('pdfkit');
const fs = require('fs-extra');
const dotenv = require('dotenv').config();
// const cron = require('node-cron');
// const axios = require('axios');




const convertTimestampToDate = (timestamp) =>{
    const date = new Date(timestamp*1000); 
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const year = date.getFullYear();
  
    return `${day}-${month}-${year}`; // Output: "29-09-2024"
  }


  const convertDateToTimestamp =(dateString,endOfDay = false) =>{
    const [day, month, year] = dateString.split("-");
    const dateObj = new Date(`${year}-${month}-${day}`);

    if (endOfDay) {
        // Set time to 23:59:59 for the end of the day
        dateObj.setHours(23, 59, 59, 999);
    }
    const timestamp = dateObj.getTime();
    return timestamp/1000;
  }
  


  const saveUserJournal = async(msg) =>{
    try{
        const {id,username} = msg.from;
        const {text,date} = msg;
        const convertedDate = convertTimestampToDate(date);
        const journalAdded = await userJournal.findOne({
                userName:username,
                date:convertedDate
        });
        if(!journalAdded){
            const newJournal = new userJournal({
                userName:username,
                date:convertedDate,
                message:text,
                messageId:id,
                dataInNumber:date
            });
            await newJournal.save();
            console.log('Journal saved');
        }else{
            journalAdded.message+=" "+text;
            await journalAdded.save();
            console.log('Journal updated');
        }
    }catch(error){
        console.log(error);
    }
  }

  const getSingleUserJournal = async (chatId,date) =>{
    try {
        const journal= await userJournal.findOne({
            messageId:chatId,
            date:date
        });
        if(journal){
            console.log(journal.message);
            const retrivedMessage=journal.message;
            return retrivedMessage;
        }else{
            return 'No journal found';
        }
    } catch (error) {
        console.log(error);
    }
  }

  const getUserJournalRange = async (chatId, startDate, endDate) =>{
    try {
        const startTimestamp = convertDateToTimestamp(startDate);
        const endTimestamp = convertDateToTimestamp(endDate,true);
        console.log(startTimestamp,endTimestamp);
        const journals = await userJournal.find({
            messageId:chatId,
            dataInNumber:{$gte:startTimestamp,$lte:endTimestamp}
        });
        if(journals.length>0){
            const journalMessages = journals.map(journal=>`${journal.date}:\n${journal.message}\n\n`).join('');
            return journalMessages;
        }else{
            return 'No journals found';
        }
    } catch (error) {
        console.log(error);
    }
  }

 const createPDF= (journalMessages,filePath) =>{
    return new Promise((resolve,reject)=>{
        const doc  = new PDFDocument();
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);

        doc.fontSize(12).text(journalMessages,{align:'left'});
        doc.end();
        writeStream.on('finish', ()=>{
            resolve(filePath);
        });
        writeStream.on('error', reject);
    })
 }

//  const  pingServer= () => {
//   console.log(process.env.BACKEND_URI);
//     axios.get(process.env.BACKEND_URI)
//       .then(response => {
//         console.log('Ping successful:', response.status); 
//       })
//       .catch(error => {
//         console.error('Error pinging server:', error); 
//       });
//   }

//  const cronJobKeepServerLive =cron.schedule('* * * * *', () => {
//     console.log('Keeping server live, CronJob Enabled to avoid server spin down');
//     pingServer();
//   });

  const deleteUser = async (chatId,username) =>{
    try {
      const user =await User.deleteOne({chatId:chatId});
      const messagesUser =await  userJournal.deleteMany({messageId:chatId,userName:username});
      console.log(messagesUser,user);
    } catch (error) {
      console.log(error);
    }
  }

module.exports = {
    saveUserJournal,
    getSingleUserJournal,
    getUserJournalRange,
    createPDF,
    // cronJobKeepServerLive,
    deleteUser
}