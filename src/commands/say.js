module.exports.info = {
	name: "say",
	description: "Make the bot say something",
	aliases: ["bot-say", "send"],
	usage: ['text'],
	module: "Other"
}

module.exports.execute = async (client, message, args, send) => {
	if (message.mentions?.everyone) return message.channel.send(message.author.tag + " tried to ping everyone :/")
		message.delete()

	if (message.author.id === '833792409539444746') {
		send(message, args.join(' '))
	} else {
		if (!args[0]) return message.reply("Usage: `/say <text>`")
			send(message, client.embed({color: message.member?.roles.highest.color, author: {name: message.author.tag, iconURL: message.author.displayAvatarURL()}, description: args.join(" ")}))
		}
	}