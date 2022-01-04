const Discord = require('discord.js');
const client = new Discord.Client();
const chalk = require("chalk")

/* 

This is some stuff done with the bots ping
you will understand this code later!

*/

module.exports = class test {
    constructor(){
            this.name = 'ping',
            this.alias = ['pi'],
            this.usage = '?ping'
    }
 
    async run(bot, message, args) {
       
    
        message.channel.send("Pinging...").then(m =>{
            var ping = m.createdTimestamp - message.createdTimestamp;
            var botPing = Math.round(client.pi);
            console.log(chalk.greenBright('Ping Is'), `${ping}ms`);
            m.edit(`**Pong! Your Ping Is: ** ${ping}ms`);
        });
				
    }
    
}