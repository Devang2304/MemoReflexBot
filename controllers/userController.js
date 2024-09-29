const User = require('../model/User');

const saveTelegramUser=async (msg)=>{
    try {
        const {id,first_name,last_name,username} = msg.from;
        const user = await User.findOne({username:username});

        if(!user){
            const newUser = new User({
                Name: first_name+' '+last_name,
                username: username,
                chatId: id
            })
            await newUser.save();
            console.log('User saved');
        }else{
            console.log('User already exists');
        }
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    saveTelegramUser
}