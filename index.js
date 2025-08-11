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
const { ChipperGIT } = require('./modules/chipper-git')

const { Client, Events, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { Octokit, App } = require('@octokit/rest');

//// CONSTANTS ////
const bot_token = process.env.BOT_TOKEN;

const idToPriority = {
    ['1404215265658404925']: 1,
    ['1404215290728022056']: 2,
    ['1404215307954028795']: 3, } // ID to Priority Level
    
const idToLabel = { // ID to Github/Readable Label
    ['1404215265658404925']: 'High Priority',
    ['1404215290728022056']: 'Medium Priority',
    ['1404215307954028795']: 'Low Priority',

    ['1404213034859233431']: 'core.networking',
    ['1404213064521486367']: 'core.cdn',
    ['1404213082166923485']: 'core.cache',
    ['1404214464332431440']: 'core.promise',
    ['1404213125363794062']: 'core.service_manager',
    ['1404213212978876488']: 'core.service_builder',
}

//// VARIABLES ////
//// UTILITIES ////
//// LOGIN GIT ////
console.log(`[${colors.green('GitHub')}] Initalizing REST interface...`)

const chipper_git = new ChipperGIT();
console.log(`[${colors.green('GitHub')}] Created REST interface!`)

//// START BOT ////
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const BUG_REPORTS_FORUM_ID      = "1403983578462949396";
const FEATURE_REQUESTS_FORUM_ID = "1403983613313159229";

client.once(Events.ClientReady, readyClient => {
    console.log(`[${colors.blue('Discord')}] Logged in as ${readyClient.user.tag}!`)
})

// THREAD BEHAVIOR (Github Sync)
client.on('threadCreate', async (thread) => {
    if (!thread.parent || thread.parent.type !== 15) return;

    if (thread.parent.id === BUG_REPORTS_FORUM_ID) {
        console.log(`[${colors.blue('Discord')}] New ${colors.red('bug report')}: "${thread.name}"`)
        const starterMessage = await thread.fetchStarterMessage();
        if (!starterMessage) {
            console.log(`[${colors.blue('Discord')}][${colors.yellow('WARN')}] Failed to find starter message...`);
            return; }

        // Get author tag safely
        const authorTag = starterMessage.author
            ? starterMessage.author.tag
            : (await thread.fetchOwner())?.user.tag || "Unknown User";

        // Tags
        let priority = 3 // 1: High | 2: Med | 3: Low
        let addedLabels = []
        
        thread.appliedTags.forEach(tagId => {
            if (idToLabel[tagId]) { // Valid Tag ID

                const thisPriority = idToPriority[tagId]
                if (thisPriority) { // This is a priority tag
                    if (thisPriority > priority) priority == thisPriority } // Higher than ours
                else {
                    if (thisPriority) return;

                    addedLabels.push(idToLabel[tagId])
                }
                
            }
        });

        console.log(starterMessage.content)
        const data = await chipper_git.createIssue(authorTag, priority, addedLabels, thread.name, starterMessage.content)
        if (data==false) { // Error is handled in chipper_git
            return }
        console.log(`[${colors.green('GitHub')}] Posted new issue in repo! (#${data.number})`)
        const issue_number = data.number
        
        // Save to SQL

        // Respond in Discord
        const response_embed = new EmbedBuilder()
            .setColor(0xb32d00)
            .setTitle('Tracking issue on GitHub!')
            .setDescription('Comments can now start being added to the issue.')
            .addFields(
                { name: 'Issue Number', value: issue_number.toString(), inline: true },
                { name: 'Issue URL', value: data.html_url, inline: true }
            )
            .setURL(data.html_url)
            .setAuthor({ name: 'Thank you for helping to improve Sawdust ❤', iconURL: 'https://res.cloudinary.com/dfqdmigla/image/upload/v1754898277/SawdustFaviconSmall_lxpmok.png' })
            .setTimestamp()

        starterMessage.reply({
            embeds: [ response_embed ]
        }).catch((error) => {
            console.log(`[${colors.blue('Discord')}][${colors.red('ERROR')}] Failed to send report success text in forum!`)
            if (error) console.log(`[${colors.blue('Discord')}][${colors.red('ERROR')}] ${colors.bgRed(error)}`)
        })

        console.log(data)
    } else if (thread.parent.id == FEATURE_REQUESTS_FORUM_ID) {
        console.log(`[${colors.blue('Discord')}] New ${colors.cyan('feature request')}: ${thread.name}`)
        
    }
})

// LOG IN
console.log(`[${colors.blue('Discord')}] Logging in as Discord bot...`)
client.login(bot_token)