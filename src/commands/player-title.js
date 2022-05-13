module.exports.info = {
	name: "player-title",
	description: "Get info about a player title",
	aliases: ["playertitle", "title", "caption", "player-titles"],
	usage: ['player-title'],
	module: "Game Assets"
}
const Discord = require('discord.js')
module.exports.execute = async (client, message, args, send) => {

	if (!args[0]) return send(message, "Command usage: `v!title <player title name>`\nTo list all titles, use `v!title list`")

		let data = client.playertitleData
	let findTitle = data.filter(title => title.displayName.toLowerCase() === (args.join(" ").toLowerCase() + " title") || title.displayName.toLowerCase() === (args.join(" ").toLowerCase()))
	if (args[0].toLowerCase() === 'list') {
		let l = data.map(s => s.displayName.replace(" Title", "")).join("`, `")
		let embeds = []
		let i = 0;
		while (i < l.length) {
			embeds.push(new Discord.EmbedBuilder().setDescription("`" + l.substring(i, i+2046) + "`").setColor(371313))
			i += 2046
		}
		return send(message, {embeds: embeds})
	}
	else if (findTitle && findTitle[0]?.displayName) {
		findTitle = findTitle[0]
		const Discord = require('discord.js')
		let emb = new Discord.EmbedBuilder()
		.setTitle(findTitle.displayName)
		.setColor(388422)
		.setDescription("title text: `" + findTitle.titleText + "`")
		send(message, {embeds: [emb]})
	} else return send(message, "Title not found. Command usage: `v!title <title name>`\nIf you want to see the current titles I know, type `v!title list`")
}