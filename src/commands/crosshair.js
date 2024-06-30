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
		request({encoding: null, url: `https://api.henrikdev.xyz/valorant/v1/crosshair/generate?id=${id}`, headers: { "Authorization": process.env.HD_KEY }}, (err, res, body) => {
			const attachment = new Discord.AttachmentBuilder(Buffer.from(body), { name: 'crosshair.png' });
			emb.setImage(`attachment://${attachment.name}`)
			send(message, { embeds: [emb], files: [attachment]})
		})
	} catch (e) {
		return message.reply("Invalid code.")
	}
}

/*
module.exports.info = {
	name: "crosshair",
	description: "Generate an image of crosshair with a code!",
	aliases: ["generate-crosshair", "crosshair-generate"],
	ratelimit: true,
	usage: ['code'],
	module: "Game Assets"
}

const Discord = require('discord.js')
const request = require('request')
const fs = require('fs')

module.exports.execute = async (client, message, args, send) => {
	let id = args.join(" ")

	let emb = new Discord.EmbedBuilder()
	.setTitle("Crosshair Generator")
	.setDescription("Code: `" + args.join(" ") + '`')
	try {
		const imagePath = path.join(__dirname, "crosshair.png")
		request(`https://api.henrikdev.xyz/valorant/v1/crosshair/generate?id=${id}&api_key=${process.env.HD_KEY}`)
		.pipe(fs.createWriteStream())
		.on('close', async () => {
			const attachment = new Discord.AttachmentBuilder()
			send(message, {embeds: [emb], files: [attachment]}).catch(e => message.reply("Invalid code."))
		})
	} catch (e) {
		return message.reply("Invalid code.")
	}
}

*/