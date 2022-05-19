module.exports.info = {
	name: "leaderboard",
	description: "View ranked leaderboard of a region",
	aliases: ["top", "lb"],
	ratelimit: true,
	usage: ['region'],
	module: "Statistics"
}

const request = require('request');
const Discord = require('discord.js')

module.exports.execute = async (client, message, args, send) => {

	if (!args[0] || !['eu', 'ap', 'na', 'kr', 'asia'].includes(args[0].toLowerCase())) return send(message, "Usage: `v!leaderboard <region>`\nRegions are: \`eu\`, \`ap\`, \`na\`, \`kr\`")
		if (args[0].toLowerCase() === 'asia') args[0] = 'ap'
			let m = await send(message, "Fetching......")

			await request("https://api.henrikdev.xyz/valorant/v2/leaderboard/" + args[0].toLowerCase(), async (err, res, body) => {
				if (err) console.log(err)
					let row = new Discord.ActionRowBuilder().addComponents([new Discord.ButtonBuilder().setStyle("Success").setCustomId("back").setEmoji("◀️").setDisabled(true), new Discord.ButtonBuilder().setStyle("Success").setCustomId("next").setEmoji("▶️"), new Discord.ButtonBuilder().setCustomId("imm").setStyle("Secondary").setLabel("Skip to immortal").setEmoji(client.emojis.cache.get("855816089937641475"))])
				let page = 0
				if (body) {
					body = JSON.parse(body)
					let emb = new Discord.EmbedBuilder()
					.setTitle("Leaderboard | " + args[0])
					.setColor(382348)
					.addFields([{name: "Thresholds (Minimum RR needed)", value: `**Radiant**: ${body['radiant_threshold']}RR | **IMM 3**: ${body['immortal_3_threshold']}RR | **IMM 2**: ${body['immortal_2_threshold']}RR | **IMM 1**: ${body['immortal_1_threshold']}RR`},
					{name: "Total players in leaderboard", value: String*(body['total_players'])}])
					.setFooter({text: "Last update: " + new Date(body['last_update'] * 1000)})
					let getPlayers = async (p) => {
						let i = 0
						return await body.players.slice(p * 10).map(player => {
						i++;
						if (i > 10) return;
						return `${client.emojis.cache.get((player.competitiveTier === 24 ? "855521624034902026" : "855816089937641475")).toString()} ${String(player.leaderboardRank)}) **${player.IsAnonymized ? "HIDDEN NAME" : player.gameName}#${player.tagLine}** : ${player.rankedRating} RR | ${player.numberOfWins} wins`
					}).filter(Boolean)
					}
					const setPage = async () => {
						let players = await getPlayers(page)
						emb.setDescription(`Page ${page + 1}/${Math.floor(body.players.length / 10)}\n` + players.join("\n"))
						m = await send(m, {content: "** **", edit: true, embeds: [emb], components: [row]})
					}
					await setPage()
					const filter = i => i.user.id === message.author.id
					let col = m.createMessageComponentCollector({filter, idle: 35000})
					col.on("collect", i => {
						if (i.customId === 'back') {
							page--;
							row.components[1].setDisabled(false)
							if (page === 0) row.components[0].setDisabled(true)
								setPage()
						} else if (i.customId === 'next') {
							page++;
							row.components[0].setDisabled(false)
							if (page === Math.floor(body.players.length / 10)) row.components[1].setDisabled(true)
								setPage()
						} else if (i.customId === 'imm') {
							page = 50
							row.components[0].setDisabled(false)
							setPage()
						}
					})
					col.on("end", i => {
						send(m, {edit: true, components: []})
					})
				} else send(message, "Failed to fetch")
			})
	}