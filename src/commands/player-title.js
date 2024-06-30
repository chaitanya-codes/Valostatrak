module.exports.info = {
	name: "player-title",
	description: "Get info about a player title",
	aliases: ["playertitle", "title", "caption", "player-titles"],
	usage: ['player-title'],
	module: "Game Assets"
}

const Discord = require('discord.js')

module.exports.execute = async (client, message, args, send) => {

	if (!args[0]) return send(message, "Command usage: `/title <player title name>`\nTo list all titles, use `/title list`")

	const data = await client.getPlayertitles()
	let findTitle = data.find(title => title.displayName?.toLowerCase() === (args.join(" ").toLowerCase() + " title") || title.displayName?.toLowerCase() === (args.join(" ").toLowerCase()))
	if (args[0].toLowerCase() === 'list') {
		let l = data.map(s => s.displayName?.replace(" Title", "")).join("`, `")
		let embeds = []
		for (var i = 0; i < l.length; i += 2046) {
			embeds.push(new Discord.EmbedBuilder().setDescription("`" + l.substring(i, i + 2046) + "`").setColor(371313))
		}
		return send(message, { embeds: embeds })
	} else if (findTitle && findTitle?.displayName) {
		const emb = new Discord.EmbedBuilder()
			.setTitle(findTitle.displayName)
			.setColor(388422)
			.setDescription("Title text: `" + findTitle.titleText + "`")
		send(message, { embeds: [emb] })
	} else return send(message, "Title not found. Command usage: `/title <title name>`\nIf you want to see the current titles I know, type `/title list`")
}