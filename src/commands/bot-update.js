module.exports.info = {
	name: 'bot-update',
	description: 'View the latest bot update',
	aliases: ["updates", "bot-update", "bot-updates", "change-log", "changelog", "latest"],
	module: "Other"
}

const Discord = require('discord.js')

module.exports.execute = async (client, message, args, send) => {
	try {
		if (message.deferReply) await message.deferReply()
		const updatesChannel = await client.channels.fetch('974211599176974396')
		if (!updatesChannel) return send(message, "Could not find updates channel. You can check on support server")

		const messages = await updatesChannel.messages.fetch({ limit: 10 })

		const latestUpdate = messages.filter(m => m.author.id === client.user.id).first(5).reverse().map(m => m.content || m.embeds[0]?.description || m.embeds[0]?.title).filter(Boolean).join("\n\n")
		if (!latestUpdate.length) return send(message, "Could not fetch latest update. You can check on support server")

		const updatesEm = new Discord.EmbedBuilder()
			.setColor(message.member?.roles?.highest?.color || 342852)
			.setTitle('Bot updates')
			.setDescription('**Latest updates:**\n' + latestUpdate)

		send(message, { embeds: [updatesEm] })
	} catch (e) {
		console.error("Error fetching bot updates: ", e)
		send(message, "Could not fetch latest update. You can check on support server")
	}
}