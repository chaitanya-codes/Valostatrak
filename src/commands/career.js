module.exports.info = {
	name: "career",
	description: "View recent MMR changes of an user",
	aliases: ["mmr-changes", "mmr-history"],
	usage: ['username'],
	ratelimit: true,
	module: "Statistics"
}

const request = require('request');
const Discord = require('discord.js')

module.exports.execute = async (client, message, args, send) => {
	const query = args.joins(' ')
	if (!query.includes("#")) return send(message, "User not found. Usage: `/career <name#tag>`\nExample: `/career 100T Asuna#1111`")

	const [name, tag] = query.split("#")
	const nametag = `${name}#${tag}`

	if (!client.linked.has(nametag.toLowerCase())) return send(message, { embeds: [client.embed({ color: '417543', title: "Account not linked", description: "This account is not linked with the bot!\nIf this is your account use `/account Link your Account`" })] })

	if (!client.accounts.has(nametag.toLowerCase())) return client.newUser(nametag, this.info.name, message)

	let region = client.accounts.get(nametag.toLowerCase())

	let waitEmbed = new Discord.EmbedBuilder()
		.setColor(428985)
		.setTitle("Searching...")

	const msg = await send(message, { embeds: [waitEmbed] })

	require('request')({ url: `https://api.henrikdev.xyz/valorant/v1/mmr-history/${region}/${name}/${tag}`, headers: { "Authorization": process.env.HD_KEY } }, async (err, res, body) => {

		if (err || JSON.parse(body).status !== 200) return send(message, client.notFound(JSON.parse(body).message))
		const data = JSON.parse(body).data

		if (!data) return send(message, client.notFound(JSON.parse(body).message))
		
		const statEmbed = new Discord.EmbedBuilder()
			.setColor(342852)
			.setTitle("Career - " + args.join(" "))
			.addFields([{ name: "Current Rank", value: data[0].currenttierpatched, inline: true }])
			.setDescription(data.map(change => {
				return `**${change.currenttierpatched}**: ${change.ranking_in_tier}/100 RR (${(change.mmr_change_to_last_game < 0 ? client.downEmoji.toString() + " " + change.mmr_change_to_last_game : client.upEmoji.toString() + " +" + change.mmr_change_to_last_game)} RR)  ELO: ${change.elo}`
			}).join("\n"))
			.setFooter({ text: "To view match history, use /matches command" })
			.setThumbnail(client.rankImg(data[0].currenttierpatched, data[0].currenttier))
		send(msg, { edit: true, embeds: [statEmbed] })

	})
}