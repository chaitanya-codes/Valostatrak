module.exports.info = {
	name: "buddy",
	description: "View a gun buddy",
	aliases: ["gun-buddy", "buddies"],
	usage: ['buddy'],
	module: "Game Assets"
}

module.exports.execute = async (client, message, args, send) => {
	const Discord = require('discord.js')
	if (!args[0]) return send(message, "Command Usage: `/buddy <buddyName>`\nExample: `/buddy Spectrum`\nTo get a list of buddies, use `/buddy list`")
		let buddyName = args.join(' ')
	if (!client.buddiesData) return send(message, "The bot just started, please wait until valorant-api.com is initialized.")
		if (buddyName === 'list') {
			let l = client.buddiesData.map(s => s.displayName.replace(" Buddy", "")).join("`, `")
			let embeds = []
			let i = 0;
			while (i < l.length) {
				embeds.push(new Discord.EmbedBuilder().setDescription("`" + l.substring(i, i+2046) + "`").setColor(371313))
				i += 2046
			}
			return send(message, {embeds: embeds})
		}
		if (["matte black", "matte", "default"].includes(buddyName.toLowerCase())) return message.reply("Bruh moment")
			let findBuddy = client.buddiesData.filter(b => b.displayName.toLowerCase() === buddyName.toLowerCase() || b.displayName.toLowerCase() === (buddyName.toLowerCase() + " buddy"))[0]
		if (findBuddy && findBuddy.displayName) {								
			let emb = new Discord.EmbedBuilder()
			.setTitle(findBuddy.displayName)
			.setColor(388422)
			.setImage(findBuddy.displayIcon)
			if (findBuddy?.levels?.length) emb.setThumbnail(findBuddy.levels[0].displayIcon)
				send(message, emb)
		} else send(message, "Buddy not found!\nUsage: `/buddy <buddyName>`\nExample: `/buddy Spectrum`\nTo get a list of buddies, use `/buddy list`")		
	}