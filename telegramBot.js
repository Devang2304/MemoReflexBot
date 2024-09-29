const dotenv = require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const token =process.env.TelegramBotToken;
const {saveTelegramUser} = require('./controllers/userController');
const {saveUserJournal} = require('./controllers/chatController');


const bot = new TelegramBot(token, {polling: true});


bot.on('message', (msg) => {
    console.log(msg);
  const chatId = msg.chat.id;
  const messageText = msg.text;

  if (messageText === '/start') {
    saveTelegramUser(msg);
    bot.sendMessage(chatId, '<b>Welcome to MemoReflex Bot!</b>\n\n<i>I’m here to help you capture your thoughts and reflections every day.</i>',{parse_mode: 'HTML'});
    const messageDescription='<b>How it Works:</b>\n\n<b>1.Daily Reflection:</b>\nEach day at 8 PM, I will remind you to add your self-journal. You can respond with a paragraph or multiple messages until the day ends. I’ll save everything you send as your journal for the day.\n\n<b>2.Retrieve Memories:</b>\nWant to look back? Retrieve your past memories by providing a particular date or a date range. I’ll send you a PDF file with the saved journals.';
    bot.sendMessage(chatId,messageDescription,{parse_mode: 'HTML'});
    setTimeout(()=>{
        const messageCommands='<b>Commands:</b>\n\n<b>1. To add today’s reflection:</b>\nYou can just start typing when prompted or at any time throughout the day!\n\n<b>2. To retrive journals by date:</b>\n\nUse the command:\n\n/get_journal YYYY-MM-DD\nor for a date range:\n/get_journal YYYY-MM-DD YYYY-MM-DD\n\n<b>To get a random memory:</b>\n\nUse the command:\n/random_memory';
        bot.sendMessage(chatId, messageCommands,{parse_mode: 'HTML'});
    }, 1000)
    
  } else if(messageText ==='/command'){
        const commandMessage='<b>Commands:</b>\n\n<b>1. To add today’s reflection:</b>\nYou can just start typing when prompted or at any time throughout the day!\n\n<b>2. To retrive journals by date:</b>\n\nUse the command:\n\n/get_journal YYYY-MM-DD\nor for a date range:\n/get_journal YYYY-MM-DD YYYY-MM-DD\n\n<b>To get a random memory:</b>\n\nUse the command:\n/random_memory';
        bot.sendMessage(chatId, commandMessage,{parse_mode: 'HTML'});
  } 
  else {
    saveUserJournal(msg);
  }
});
