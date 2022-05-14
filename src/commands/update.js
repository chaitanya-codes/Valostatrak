module.exports.info = {
	name: 'update',
	description: 'View the latest bot update',
	aliases: ["update", "bot-update", "bot-updates", "change-log", "changelog", "latest"],
	module: "Other"
}

module.exports.execute = (client, message, args, send) => {
	let updatesChannel = client.channels.cache.get('974211599176974396')

	updatesChannel.messages.fetch({ limit: 10 })
	.then(messages => {
		let latestUpdate = messages.filter(m => m.embeds[0]).first().embeds[0].description
		const Discord = require('discord.js')
		const updatesEm = new Discord.EmbedBuilder()
		.setColor(message.member.roles.highest.color)
		.setTitle('Bot updates')
		.setDescription('**Latest update:** ' + latestUpdate)
		send(message, updatesEm)
	})
}