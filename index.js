//**
// 
// Chipper | Sawdust Discord Bot
//
// Developed by: Griffin Dalby
// Project started: 2025.08.10
//
// This bot will come with multiple unique features, turning the discord
// server into a valuable development aspect as well. A couple things that
// this bot does:
//
// 1. Bridge issue & feature reports to github, providing a way to communicate
//    from the discord forum, to the actual issue report comments.
//
// 
//
// */

//// REQUIRES ////
require('dotenv').config();
const colors = require('colors')

const { Client, Events, GatewayIntentBits } = require('discord.js');

//// CONSTANTS ////
const bot_token = process.env.BOT_TOKEN;

//// VARIABLES ////
//// UTILITIES ////
//// START BOT ////
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, readyClient => {
    console.log(`[${colors.cyan(readyClient.user.tag)}] Logged in!`)
})

// LOG IN
client.login(bot_token)