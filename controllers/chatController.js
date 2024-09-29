const User = require('../model/User');
const userJournal = require('../model/userJournal');


const convertTimestampToDate = (timestamp) =>{
    const date = new Date(timestamp * 1000); 
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const year = date.getFullYear();
  
    return `${day}-${month}-${year}`; // Output: "29-09-2024"
  }
  

  
const get_journal = async (msg) =>{
    
}