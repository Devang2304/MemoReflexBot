const User = require('../model/User');
const userJournal = require('../model/userJournal');
const PDFDocument = require('pdfkit');
const fs = require('fs-extra');




const convertTimestampToDate = (timestamp) =>{
    const date = new Date(timestamp*1000); 
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const year = date.getFullYear();
  
    return `${day}-${month}-${year}`; // Output: "29-09-2024"
  }
//   console.log(convertTimestampToDate(1727705698));

  const convertDateToTimestamp =(dateString,endOfDay = false) =>{
    const [day, month, year] = dateString.split("-");
    const dateObj = new Date(`${year}-${month}-${day}`);

    if (endOfDay) {
        // Set time to 23:59:59 for the end of the day
        dateObj.setHours(23, 59, 59, 999);
    }
    const timestamp = dateObj.getTime();
    // console.log(timestamp);
    return timestamp/1000;
  }
  


  const saveUserJournal = async(msg) =>{
    try{
        const {id,username} = msg.from;
        const {text,date} = msg;
        // console.log(date);
        const convertedDate = convertTimestampToDate(date);
        const journalAdded = await userJournal.findOne({
                userName:username,
                date:convertedDate
        });
        if(!journalAdded){
            console.log("date in timestamp",date);
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
            journalAdded.message+=text;
            await journalAdded.save();
            console.log('Journal updated');
        }
    }catch(error){
        console.log(error);
    }
  }

  const getSingleUserJournal = async (chatId,date) =>{
    try {
        // const convertedDate = convertTimestampToDate(date);
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
            console.log("Journals pdf =>",journals);
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

  
  
  


module.exports = {
    saveUserJournal,
    getSingleUserJournal,
    getUserJournalRange,
    createPDF
}