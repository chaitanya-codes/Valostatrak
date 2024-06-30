module.exports.info = {
	name: 'bot-update',
	description: 'View the latest bot update',
	aliases: ["updates", "bot-update", "bot-updates", "change-log", "changelog", "latest"],
	module: "Other"
}

module.exports.execute = (client, message, args, send) => {
	message.deferReply()
	const updatesChannel = client.channels.cache.get('974211599176974396')

	updatesChannel.messages.fetch({ limit: 10 })
	.then(messages => {
		const latestUpdate = messages.map(m => m.content).slice(0,5).reverse().join("\n\n")
		const Discord = require('discord.js')
		const updatesEm = new Discord.EmbedBuilder()
			.setColor(message.member.roles.highest.color)
			.setTitle('Bot updates')
			.setDescription('**Latest updates:**```yaml\n' + latestUpdate + '```')
		send(message, updatesEm)
	})
}