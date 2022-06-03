module.exports.info = {
	name: "statistics",
	description: "View statistics of a person",
	aliases: ["stats", "rank"],
	usage: ['username'],
	ratelimit: true,
	module: "Statistics"
}

const request = require('request');
const Discord = require('discord.js')
const progressBar = require("string-progressbar")
const Canvas = require('canvas')

module.exports.execute = async (client, message, args, send) => {
	let query = args

	if (!args.join(" ").includes("#")) return send(message, "Usage: `v!stats <name#tag>` \nExample: `v!stats 100T Asuna#1111`")

		let name = query.join(" ").split("#").shift()
	let tag = query.join(" ").split("#").pop()
	let nametag = `${name}#${tag}`
	let region;
	if (client.accounts.has(nametag.toLowerCase())) region = client.accounts.get(nametag.toLowerCase())
		else return client.newUser(nametag, this.info.name, message)
			
			let mm;
		let wait = new Discord.EmbedBuilder()
		.setColor(428985)
		.setTitle("Searching...")
		await send(message, {embeds: [wait]})
		.then(m => mm = m)
		require('request')(`https://api.henrikdev.xyz/valorant/v2/mmr/${region}/${name}/${tag}`, async (err, res, body) => {

			if (err || JSON.parse(body).status !== 200) return send(message, client.notFound(JSON.parse(body).message))
				let data = JSON.parse(body)
			data = data.data
			if (!data || !data['by_season']) return send(message, client.notFound(JSON.parse(body).message))
				let seasons = Object.keys(data['by_season']).map(a => a)
			const createButton = (value) => {
				let button = new Discord.ButtonBuilder()
				.setCustomId(value)
				.setLabel()
				.setStyle('Secondary')
				return button
			}

			let menu = []
			let i = 0;

			let row = new Discord.ActionRowBuilder()
			.addComponents([new Discord.SelectMenuBuilder().setCustomId("acts").addOptions([{label: "Current statistics", value: "current"}, seasons.map(value => {return {label: value.replace("e", "Episode ").replace("a", ": Act "), value: value}})].flat(1))])
			let currentData = data['current_data']
			let rr
			if (currentData.ranking_in_tier) rr = progressBar.filledBar(100, currentData.ranking_in_tier, 20)[0]
				else rr = ""
					let statEmbed = new Discord.EmbedBuilder()
				.setColor(342852)
				.setTitle("Statistics - " + args.join(" "))
				.setFields([{name: "Rank", value: (currentData.currenttierpatched ? currentData.currenttierpatched + `\n${currentData.ranking_in_tier}/100 ${rr || ""}` : "Unranked")},
					{name: "Recent MMR change", value: String((currentData.mmr_change_to_last_game < 0 ? client.downEmoji.toString() + " " + currentData.mmr_change_to_last_game : client.upEmoji.toString() + " +" + currentData.mmr_change_to_last_game)), inline: true},
					{name: "ELO", value: String(currentData.elo), inline: true}])
				.setFooter({text: "To view match history, use v!matches command"})
				.setThumbnail(`https://raw.githubusercontent.com/RumbleMike/ValorantStreamOverlay/main/Resources/TX_CompetitiveTier_Large_${currentData.currenttier}.png`)
				send(mm, {edit: true, embeds: [statEmbed], components: [row]})
				.then(msg => {
					const filter = (interaction) => message.author.id === interaction.user.id
					const collector = msg.createMessageComponentCollector({filter, time: 55000 })
					collector.on('collect', async i => {
						let id = i.values[0]
						if (seasons.includes(id)) {
							let bySeason = data['by_season'][id]
							if (!bySeason.number_of_games) return send(message, {ephemeral: true, content: "This player has not played in that act"})
								let newEmb = new Discord.EmbedBuilder()
							.setColor(349842)
							.setTitle("Statistics - " + args.join(" "))
							.setDescription(id.replace("e", "Episode ").replace("a", " Act "))
							.setThumbnail(`https://raw.githubusercontent.com/RumbleMike/ValorantStreamOverlay/main/Resources/TX_CompetitiveTier_Large_${bySeason.final_rank}.png`)
							.setFields([{name: "Wins", value: String(bySeason.wins)},
								{name: "Number of games played", value: String(bySeason.number_of_games)},
								{name: "Rank in this act", value: bySeason.final_rank_patched}])
							send(i, {edit: true, embeds: [newEmb]})
						} else if (id === 'current') send(i, {edit: true, embeds: [statEmbed]})
					})
					collector.on('end', collected => {})
				})

				const canvas = new Canvas.createCanvas(550, 300)
				let ctx = canvas.getContext('2d')
				let downImg = await Canvas.loadImage(client.downEmoji.url)
				let upImg = await Canvas.loadImage(client.upEmoji.url)
				let rankImg = await Canvas.loadImage(`https://raw.githubusercontent.com/RumbleMike/ValorantStreamOverlay/main/Resources/TX_CompetitiveTier_Large_${currentData.currenttier}.png`)
				ctx.drawImage(rankImg, canvas.width / 1.1, 0, 50, 50)
				ctx.fillStyle = '#baa096'
				ctx.fillRect(0, 0, 159, canvas.height)
				ctx.fillStyle = '#94a22e'
				ctx.fillRect(0, 0, canvas.width, 50)
				ctx.strokeStyle = 'rgba(0,0,0,0.5)'
				ctx.beginPath()
				ctx.lineTo(0, 50)
				ctx.lineTo(canvas.width, 50)
				ctx.stroke()

				ctx.font = `25px comic-sans`
				ctx.fillStyle = '#ffffff'
				ctx.fillText((currentData.currenttierpatched ? currentData.currenttierpatched + `\n${currentData.ranking_in_tier}/100 ${rr || ""}` : "Unranked"), canvas.width / 2.31, 36)
				if (currentData.mmr_change_to_last_game < 0) ctx.drawImage(downImg, canvas.width / 2.4, 70)
					else ctx.drawImage(upImg, canvas.width / 2.4, 40)
						ctx.font = `bold 25px sans-serif`
					ctx.fillStyle = '#3f04f4'
					ctx.fillText(args.join(" "), canvas.width / 3.3, 75)

					let image = new Discord.Attachment(canvas.toBuffer(), 'test.png')
	//				send(message, image)
				})
}