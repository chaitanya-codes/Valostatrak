module.exports.info = {
	name: "crosshair",
	description: "Generate an image of crosshair with a code!",
	aliases: ["generate-crosshair", "crosshair-generate"],
	ratelimit: true,
	usage: ['code'],
	module: "Game Assets"
}

const request = require('request');
const Discord = require('discord.js')


module.exports.execute = async (client, message, args, send) => {
	let id = args.join(" ")

	let emb = new Discord.EmbedBuilder()
	.setTitle("Crosshair Generator")
	.setDescription("Code: `" + args.join(" ") + '`')
	try {
		emb.setImage(`https://api.henrikdev.xyz/valorant/v1/crosshair/generate?id=${id}`)
	} catch (e) {
		return message.reply("Invalid code.")
	}
	send(message, {embeds: [emb]}).catch(e => message.reply("Invalid code."))
}