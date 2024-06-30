module.exports.info = {
	name: "level-border",
	description: "Preview a level border",
	aliases: ["border", "lvl-border"],
	usage: ['level'],
	module: "Game Assets"
}

const Discord = require('discord.js')

module.exports.execute = async (client, message, args, send) => {

	if (!args[0] || isNaN(Number(args.join(" ")))) return send(message, "Command usage: `/level-border <account level>`\nShould be 1 or multiple of 20.")

	const data = await client.getLevelborders()
	let findLevel = data.find(level => level.startingLevel === Number(args.join(" ")))
	if (findLevel && findLevel?.startingLevel) {
		let emb = new Discord.EmbedBuilder()
			.setTitle("Level border [" + args.join(" ") + "]")
			.setColor(388422)
			.setImage(findLevel.smallPlayerCardAppearance)
			.setThumbnail(findLevel.levelNumberAppearance)
		send(message, { embeds: [emb] })
	} else return send(message, "Level border not found. Should be 1 or multiple of 20.")
}