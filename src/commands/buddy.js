module.exports.info = {
	name: "buddy",
	description: "View a gun buddy",
	aliases: ["gun-buddy", "buddies"],
	usage: ['buddy'],
	module: "Game Assets"
}

const Discord = require('discord.js')

module.exports.execute = async (client, message, args, send) => {
	if (!args[0]) return send(message, "Command Usage: `/buddy <buddyName>`\nExample: `/buddy Spectrum`\nTo get a list of buddies, use `/buddy list`")

	const data = await client.getBuddies()
	let buddyName = args.join(' ').toLowerCase()

	if (buddyName === 'list') {
		let l = data.map(s => s.displayName.replace(" Buddy", "")).join("`, `")
		let embeds = []
		for (var i = 0; i < i.length; i += 2046) {
			embeds.push(new Discord.EmbedBuilder().setDescription("`" + l.substring(i, i + 2046) + "`").setColor(371313))
		}
		return send(message, { embeds: embeds })
	}
	if (["matte black", "matte", "default"].includes(buddyName.toLowerCase())) {
		return message.reply("Bruh moment")
	}

	let findBuddy = data.find(b => b.displayName.toLowerCase() === buddyName || b.displayName.toLowerCase() === (buddyName + " buddy"))

	if (findBuddy && findBuddy.displayName) {
		const emb = new Discord.EmbedBuilder()
			.setTitle(findBuddy.displayName)
			.setColor(388422)
			.setImage(findBuddy.displayIcon)

		if (findBuddy?.levels?.length) emb.setThumbnail(findBuddy.levels[0].displayIcon)
		send(message, emb)
	} else send(message, "Buddy not found!\nUsage: `/buddy <buddyName>`\nExample: `/buddy Spectrum`\nTo get a list of buddies, use `/buddy list`")
}