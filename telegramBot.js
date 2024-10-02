const dotenv = require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs-extra');
const cron = require('node-cron');
const token =process.env.TelegramBotToken;
const {saveTelegramUser} = require('./controllers/userController');
const User = require('./model/User');
const userJournal = require('./model/userJournal');
const {saveUserJournal,getSingleUserJournal,getUserJournalRange,createPDF,cronJobKeepServerLive,deleteUser} = require('./controllers/chatController');

const bot = new TelegramBot(token, {polling: true});


const sendReminderToAllUsers =async ()=>{

  try {
      const allusers = await User.find({});
      allusers.forEach(user=>{
          bot.sendMessage(user.chatId, `Hello ${user.Name}, this is a reminder to add your journal for today :)`);
          console.log("sent message :)");
      })
  } catch (error) {
      console.log(error);      
  }
};


const task=  cron.schedule('0 20 * * *', () => {
  sendReminderToAllUsers();
  console.log('Sending Reminder to Users');
},{
  scheduled: true,
  timezone: "Asia/Kolkata"
});

task.start();

cronJobKeepServerLive.start();



bot.on('message', (msg) => {
    console.log(msg);
  const chatId = msg.chat.id;
  const username = msg.from.username;
  const messageText = msg.text;

  if (messageText === '/start') {
    saveTelegramUser(msg);
    bot.sendMessage(chatId, '<b>Welcome to MemoReflex Bot!</b>\n\n<i>I’m here to help you capture your thoughts and reflections every day.</i>',{parse_mode: 'HTML'});
    const messageDescription='<b>How it Works:</b>\n\n<b>1.Daily Reflection:</b>\nEach day at 8 PM, I will remind you to add your self-journal. You can respond with a paragraph or multiple messages until the day ends. I’ll save everything you send as your journal for the day.\n\n<b>2.Retrieve Memories:</b>\nWant to look back? Retrieve your past memories by providing a particular date or a date range. I’ll send you a PDF file with the saved journals.';
    bot.sendMessage(chatId,messageDescription,{parse_mode: 'HTML'});
    setTimeout(()=>{
        const messageCommands='<b>Commands:</b>\n\n<b>1. To add today’s reflection:</b>\nYou can just start typing when prompted or at any time throughout the day!\n\n<b>2. To retrive journals by date:</b>\n\nUse the command:\n\n/get_journal DD-MM-YYYY\nor for a date range:\n/get_journal DD-MM-YYYY DD-MM-YYYY\n\n3. <b>To Stop the service:</b>\nUse the command:\n/stop';
        bot.sendMessage(chatId, messageCommands,{parse_mode: 'HTML'});
    }, 1000)
    
  } else if(messageText ==='/command'){
        const commandMessage='<b>Commands:</b>\n\n<b>1. To add today’s reflection:</b>\nYou can just start typing when prompted or at any time throughout the day!\n\n<b>2. To retrive journals by date:</b>\n\nUse the command:\n\n/get_journal DD-MM-YYYY\nor for a date range:\n/get_journal DD-MM-YYYY DD-MM-YYYY\n\n3. <b>To Stop the service:</b>\nUse the command:\n/stop';
        bot.sendMessage(chatId, commandMessage,{parse_mode: 'HTML'});
  } else if(messageText==='/stop'){
        bot.sendMessage(chatId, 'Goodbye!');
        try {
          deleteUser(chatId,username);
        } catch (error) {
            console.log(error);
        }
  }
  else {
    if(messageText.startsWith('/get_journal')){
      const dateRange = messageText.split(' ');
      if(dateRange.length==2){
        const date = dateRange[1];
        const userJournalSingleRetrived=getSingleUserJournal(chatId,date);
        userJournalSingleRetrived.then((data)=>{
            bot.sendMessage(chatId, data,{parse_mode: 'HTML'});
        })
      }
      else if(dateRange.length==3){
        const startDate = dateRange[1];
        const endDate = dateRange[2];
        const userJournalRangeRetrived=getUserJournalRange(chatId, startDate, endDate);

        const username=msg.from.username;
        const filePath=`journal_${username}_${startDate}_${endDate}.pdf`;

        userJournalRangeRetrived.then((data)=>{
            createPDF(data,filePath)
            .then(()=>{
              bot.sendDocument(chatId,filePath).then(()=>{
                fs.remove(filePath).then(()=>{
                  console.log(`File ${filePath} deleted successfully!`);
                }).catch(err => console.error(`Failed to delete file: ${err}`));
              })
            })
        }).catch(err => bot.sendMessage(chatId, `Error generating PDF: ${err.message}`));
      }
    }else{
      saveUserJournal(msg);
    }
  }
});
