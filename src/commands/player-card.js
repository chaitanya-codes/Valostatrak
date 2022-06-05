module.exports.info = {
	name: "player-card",
	description: "Get info about a player card",
	aliases: ["playercard", "card", "collection-card", "player-cards"],
	usage: ['player-card'],
	module: "Game Assets"
}
const Discord = require('discord.js')
module.exports.execute = async (client, message, args, send) => {

	if (!args[0]) return send(message, "Command usage: `/card <player card name>`\nTo list all cards, use `/card list`")

		let data = client.playercardData
	let findCard = data.filter(card => card.displayName.toLowerCase() === (args.join(" ").toLowerCase() + " card") || card.displayName.toLowerCase() === (args.join(" ").toLowerCase()))
	if (args[0].toLowerCase() === 'list') {
		let l = data.map(s => s.displayName.replace(" Card", "")).join("`, `")
		let embeds = []
		let i = 0;
		while (i < l.length) {
			embeds.push(new Discord.EmbedBuilder().setDescription("`" + l.substring(i, i+2046) + "`").setColor(371313))
			i += 2046
		}
		return send(message, {embeds: embeds})
	}
	else if (findCard && findCard[0]?.displayName) {
		findCard = findCard[0]
		const Discord = require('discord.js')
		let emb = new Discord.EmbedBuilder()
		.setTitle(findCard.displayName)
		.setColor(388422)
		.setImage(findCard.largeArt)
		.setThumbnail(findCard.displayIcon)
		send(message, {embeds: [emb]})
	} else return send(message, "Card not found. Command usage: `/card <card name>`\nIf you want to see the current cards I know, type `/card list`")
}