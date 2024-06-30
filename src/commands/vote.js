module.exports.info = {
	name: "vote",
	description: "Get the link to vote for the bot",
	aliases: ['vote-bot', 'votes'],
	module: "Other"
}

const Discord = require('discord.js')

module.exports.execute = async (client, message, args, send) => {
	let voted = client.bypassed.has(message.author.id)
	let row = new Discord.ActionRowBuilder().addComponents([new Discord.ButtonBuilder().setLabel("Top.gg").setURL("https://top.gg/bot/855083775460769793/vote").setStyle("Link")])
	send(message, {content: (voted ? "You have already voted for the bot!" : "You have not voted yet"), components: [row]})
}