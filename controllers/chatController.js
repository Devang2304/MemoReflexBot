const User = require('../model/User');
const userJournal = require('../model/userJournal');


const convertTimestampToDate = (timestamp) =>{
    const date = new Date(timestamp * 1000); 
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const year = date.getFullYear();
  
    return `${day}-${month}-${year}`; // Output: "29-09-2024"
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
                messageId:id
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

  const getSingleUserJournal = async (message) =>{
    try {
        const {username,id} = message.from;
        // const text
    } catch (error) {
        
    }
  }
  


module.exports = {
    saveUserJournal
}