module.exports.info = {
	name: "matches",
	description: "View match history of someone",
	aliases: ["match", "match-history", "career"],
	usage: ['username', 'match-type'],
	ratelimit: true,
	module: "Statistics",
	optional: true
}

const request = require('request');
const Discord = require('discord.js')

const createButton = (value, id) => {
	let button = new Discord.ButtonBuilder()
		.setCustomId(id)
		.setEmoji(value)
		.setStyle('Primary')
	return button
}
const weapons = {}

module.exports.execute = async (client, message, args, send) => {

	client.ratelimits.set(message.author.id, true)
	setTimeout(() => client.ratelimits.set(message.author.id, false), 10000)

	const matchTypes = ['unrated', 'competitive', 'spikerush', 'deathmatch', 'replication', 'escalation', 'snowball', 'custom']

	let [name, tag] = args.join(" ").split("#")
	let matchType = tag.split(" ")[1]
	if (matchType) tag = tag.replace(" " + matchType, "")

	const nametag = `${name}#${tag}`

	if (!client.linked.has(nametag.toLowerCase())) return send(message, { embeds: [client.embed({ color: '417543', title: "Account not linked", description: "This account is not linked with the bot!\nIf this is your account use `/account Link your Account`" })] })
	if (!client.accounts.has(nametag.toLowerCase())) return client.newUser(nametag, this.info.name, message)
	const region = client.accounts.get(nametag.toLowerCase())

	const linked = client.linked.get(args.join(" ").toLowerCase())
	if (linked.private) return send(message, "Account is set to private by owner")
	if (!nametag.includes("#") || !region) return message.reply("User not found. Usage: `/matches <name#tag> [match-type-optional]`\nExample: `/matches 100T Asuna#1111 unrated`")

	let weaponData = await client.getWeapons()
	weaponData.forEach(w => weapons[w.uuid] = w.displayName)

	let waitEmbed = new Discord.EmbedBuilder()
		.setColor(428985)
		.setTitle("Searching...")
		.setFooter({ text: "This can take up to 30 seconds. If it still does not work, valorant API might be down." })
	let mm = await send(message, { embeds: [waitEmbed] })

	await request({ url: `https://api.henrikdev.xyz/valorant/v3/matches/${region}/${name}/${tag}` + (matchType ? `?filter=${matchType}` : ''), headers: { "Authorization": process.env.HD_KEY } }, async (err, res, body) => {

		const parsedBody = JSON.parse(body)
		if (err || !parsedBody || parsedBody.status !== 200) return send(message, client.notFound(parsedBody.message))
		const data = parsedBody.data
		if (!data || !data.length) return send(message, client.notFound("No recent data found."))

		const row = new Discord.ActionRowBuilder()
			.addComponents([createButton("1️⃣", "one"), createButton("2️⃣", "two"), createButton("3️⃣", "three"), createButton("4️⃣", "four"), createButton("5️⃣", "five")])
		const row2 = new Discord.ActionRowBuilder()
			.addComponents([createButton("⬅️", "left"), createButton("➡️", "right"), createButton("🔙", "back")])
		row2.components[0].disabled = true

		const matchesEmbed = new Discord.EmbedBuilder()
			.setColor(348425)
			.setTitle("Recent 5 Matches - " + args.join(" "))
			.setFooter({ text: "You can use the buttons below to view every round of a match" })

		for (const [num, match] of data.entries()) {
			const searchedPlayer = match.players.all_players.find(pl => pl.name.toLowerCase() === name.toLowerCase())
			const searchedPlayerTeam = searchedPlayer.team.toLowerCase()
			const opponentTeam = (searchedPlayerTeam === "blue" ? "red" : "blue")
			const kda = `${player.stats.kills}/${player.stats.deaths}/${player.stats.assists}`
			const emoji = client.guilds.cache.get("501396018395480065").emojis.cache.find(e => e.name === player.character.toLowerCase()) || ''

			matchesEmbed.addFields([{
				name: `${num + 1}) ${match.metadata.map} (${match.metadata.mode})`,
				value: `${emoji} K/D/A: ${kda}\n**${match.teams[searchedPlayerTeam]?.has_won ? "Won" : "Lost"} ${match.teams[searchedPlayerTeam]?.rounds_won || '-'} - ${match.teams[opponentTeam]?.rounds_won || '-'}**\n${match.metadata.game_start_patched}`,
				inline: true
			}])
		}

		mm.edit({ embeds: [matchesEmbed], components: [row] })
			.then(msg => {
				const filter = (interaction) => message.author.id === interaction.user.id
				const collector = msg.createMessageComponentCollector({ filter, idle: 40000, time: 70000 })
				collector.on('collect', async i => {
					const id = i.customId
					const indexMap = { "one": 0, "two": 1, "three": 2, "four": 3, "five": 4 }
					const matchIndex = indexMap[id]
					const match = data[matchIndex]

					if (!match || match.metadata.mode === 'Deathmatch') return message.reply("You cannot view deathmatch stats")

					const maps = await client.getMaps()
					const matchEmbed = new Discord.EmbedBuilder()
						.setColor(388531)
						.setTitle(match.metadata.map)
						.setThumbnail(maps.filter(m => m.displayName.toLowerCase() === match.metadata.map.toLowerCase())[0].splash)

					const currentRound = 0

					i.update({ embeds: [matchEmbed], components: [row2] }).then(ms => {
						const setRound = (roundIndex, interaction) => {
							const round = match.rounds[roundIndex]
							const killsTeam = []
							const killsEnemy = []
							const searchedPlayer = match.players.all_players.find(pl => pl.name.toLowerCase() === name.toLowerCase())
							const opponentTeam = (searchedPlayer.team === "Blue" ? "Red" : "Blue")

							round.player_stats.forEach(p => {
								const findPlayer = match.players.all_players.find(pl => pl.puuid === p.player_puuid)
								const playerEmoji = client.guilds.cache.get("501396018395480065").emojis.cache.find(e => e.name === findPlayer.character.toLowerCase())?.toString() || ''

								const killed = p.kill_events.map(kill => {
									const victim = match.players.all_players.find(pl => pl.puuid === kill.victim_puuid)
									return client.guilds.cache.get("501396018395480065").emojis.cache.find(e => e.name === victim.character.toLowerCase())?.toString() || ''
								}).join("")

								let gun = ''
								if (p.kill_events.length) {
									const namee = weapons[p.kill_events[0].damage_weapon_id.toLowerCase()] || 'Melee'
									gun = client.guilds.cache.get("501396018395480065").emojis.cache.find(e => e.name === namee?.toLowerCase())?.toString() || (p.kill_events[0].damage_weapon_id.toLowerCase() === 'grenadeability' ? "💣" : '')
								}

								if (p.player_team === searchedPlayer.team) {
									killsTeam.push(`${playerEmoji}${p.player_display_name}: ${p.kills} ${gun} ${killed} | :boom:${p.score}`)
								} else {
									killsEnemy.push(`${playerEmoji}${p.player_display_name}: ${p.kills} ${gun}${killed} | :boom:${p.score}`);
								}
							})

							const newEmb = new Discord.EmbedBuilder()
								.setTitle(`${match.metadata.map} - Round ${roundIndex + 1}`)
								.setColor("Random")
								.setThumbnail(maps.find(m => m.displayName.toLowerCase() === match.metadata.map.toLowerCase()).splash)
								.setDescription(`Round ${round.winning_team === "Blue" ? "Lost" : "Won"}`)
								.addFields([
									{ name: "Kills", value: `__TEAM__\n${killsTeam.join("\n")}\n\n__ENEMY__\n${killsEnemy.join("\n")}` },
									{ name: "Round outcome", value: round.end_type, inline: true }
								])

							if (round.bomb_planted) newEmb.addFields([{ name: "Bomb planted", value: `By ${round.plant_events.planted_by["display_name"]}`, inline: true }])
							if (round.bomb_defused) newEmb.addFields([{ name: "Bomb defused", value: `By ${round.defuse_events.defused_by["display_name"]}`, inline: true }])

							send(interaction, { edit: true, embeds: [newEmb], components: [row2] })
						}

						setRound(0, message)

						const collector2 = ms.createMessageComponentCollector({ filter, idle: 35000, time: 90000 })

						collector2.on('collect', async i => {
							if (i.customId === 'left') {
								currentRound--;
							} else if (i.customId === 'right') {
								currentRound++;
							} else if (i.customId === 'back') {
								i.update({ embeds: [matchesEmbed], components: [row] })
								collector2.stop()
								currentRound = 0;
								return;
							}
							
							row2.components[0].setDisabled(currentRound <= 0)
							row2.components[1].setDisabled((match.teams.blue.rounds_lost + match.teams.blue.rounds_won) <= (currentRound + 1))
							
							setRound(currentRound, i)
						})
						collector.on('end', collected => { })
					})
				})
			})
	})
}