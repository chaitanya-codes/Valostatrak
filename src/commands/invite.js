module.exports.info = {
	name: 'invite',
	description: 'Invite the bot to your server!',
	aliases: ['invite-bot', 'support', 'support-server'],
	module: "Other"
}

module.exports.execute = (client, message, args, send) => {
	let Discord = require('discord.js')
	let createButton = (obj) => {
		let b = new Discord.ButtonBuilder()
		.setStyle("Link")
		.setLabel(obj.label)
		.setURL(obj.link)
		return b;
	}
	let row = new Discord.ActionRowBuilder()
	.addComponents(createButton({link: "https://discord.gg/XYjdEZ76eh", label: "Support server"}), createButton({label: "Invite Bot", link: "https://discord.com/api/oauth2/authorize?client_id=855083775460769793&permissions=139855192128&scope=bot%20applications.commands"}))

	send(message, {components: [row], embeds: [{title: "INVITE", color: 488256}]})
	
}