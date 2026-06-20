module.exports.info = {
	name: "say",
	description: "Make the bot say something",
	aliases: ["bot-say", "send"],
	usage: [],
	module: "Other",
}

const Discord = require('discord.js')

module.exports.execute = async (client, message, args, send) => {
	const user = message.author || message.user
	const modalId = `say_${user.id}`

	if (message.showModal) {
		const modal = new Discord.ModalBuilder()
			.setCustomId(modalId)
			.setTitle("Say something")

		const textInput = new Discord.TextInputBuilder()
			.setCustomId("text")
			.setLabel("What should I say?")
			.setStyle(Discord.TextInputStyle.Paragraph)
			.setRequired(true)
			.setMaxLength(4000)

		const row = new Discord.ActionRowBuilder().addComponents([textInput])
		modal.addComponents([row])

		await message.showModal(modal)
		const filter = i => i.user.id === user.id && i.customId === modalId

		try {
			const interaction = await message.awaitModalSubmit({ filter, time: 120000 })
			const text = interaction.fields.getTextInputValue("text")
			if (!text.trim()) return send(interaction, "Message cannot be empty")
			if (text.includes("@everyone") || text.includes("@here")) return send(interaction, user.tag + " tried to ping everyone :/")

			const sayEmbed = new Discord.EmbedBuilder()
				.setColor(message.member?.roles?.highest?.color || 0x00AE22)
				.setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
				.setDescription(text)

			return send(interaction, { embeds: [sayEmbed], allowedMentions: { parse: [] } })
		} catch {
			return;
		}
	}

	if (message.mentions?.everyone) return message.channel.send(user.tag + " tried to ping everyone :/")
	if (message.delete) message.delete().catch(() => {})
	if (!args.length || !args.join(" ").trim()) return message.reply("Usage: `/say`")

	const sayEmbed = new Discord.EmbedBuilder()
		.setColor(message.member?.roles?.highest?.color || 0x00AE22)
		.setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
		.setDescription(args.join(" "))

	send(message, { embeds: [sayEmbed], allowedMentions: { parse: [] } })
}