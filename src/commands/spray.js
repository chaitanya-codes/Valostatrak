module.exports.info = {
	name: "spray",
	description: "Get info about a spray",
	aliases: ["sprays", "grafitti"],
	usage: ['spray'],
	module: "Game Assets"
}
const Discord = require('discord.js')
module.exports.execute = async (client, message, args, send) => {

	if (!args[0]) return send(message, "Command usage: `v!spray <spray name>`\nTo list all sprays, use `v!spray list`")

		let data = client.sprayData
	let findSpray = data.filter(spray => spray.displayName.toLowerCase() === (args.join(" ").toLowerCase() + " spray") || spray.displayName.toLowerCase() === (args.join(" ").toLowerCase()))
	if (args[0].toLowerCase() === 'list') {
		let l = data.map(s => s.displayName.replace(" Spray", "")).join("`, `")
		let embeds = []
		let i = 0;
		while (i < l.length) {
			embeds.push(new Discord.EmbedBuilder().setDescription("`" + l.substring(i, i+2046) + "`").setColor(371313))
			i += 2046
		}
		return send(message, {embeds: embeds})
	}
	else if (findSpray && findSpray[0]?.displayName) {
		findSpray = findSpray[0]
		const Discord = require('discord.js')
		let emb = new Discord.EmbedBuilder()
		.setTitle(findSpray.displayName)
		.setColor(388422)
		.setImage(findSpray.displayIcon)
		.setThumbnail(findSpray.fullIcon)
		send(message, {embeds: [emb]})
	} else return send(message, "Spray not found. Command usage: `v!spray <spray name>`\nIf you want to see the current sprays I know, type `v!spray list`")
}