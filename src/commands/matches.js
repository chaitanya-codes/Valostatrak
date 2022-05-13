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
	.setStyle('PRIMARY')
	return button
}
const weapons = {}

module.exports.execute = async (client, message, args, send) => {

	client.ratelimits.set(message.author.id, true)
	setTimeout(() => client.ratelimits.set(message.author.id, false), 10000)
	let query = args
	let matchTypes = ['unrated', 'competitive', 'spikerush', 'deathmatch', 'replication', 'escalation', 'snowball', 'custom']
	let [name, tag] = query.join(" ").split("#")
	let matchType = tag.split(" ")[1]
	if (matchType) tag = tag.replace(" " + matchType, "")
		let nametag = `${name}#${tag}`
	let region;
	if (client.accounts.has(nametag.toLowerCase())) region = client.accounts.get(nametag.toLowerCase())
		else return client.newUser(nametag, this.info.name, message)

			if (!nametag.includes("#") || !region) return message.reply("User not found. Usage: `v!matches <name#tag> [match-type-optional]`\nExample: `v!matches 100T Asuna#1111 unrated`")
			client.weaponData.forEach(w => weapons[w.uuid] = w.displayName)
					let mm;
					let wait = new Discord.EmbedBuilder()
					.setColor(428985)
					.setTitle("Searching...")
					.setFooter("This can take up to 30 seconds. If it still does not work, valorant API might be down.")
					await send(message, {embeds: [wait]})
					.then(m => mm = m)
					await require('request')(`https://api.henrikdev.xyz/valorant/v3/matches/${region}/${name}/${tag}` + (matchType ? `?filter=${matchType}` : ''), async (err, res, body) => {
						if (!body || !JSON.parse(body)) return send(message, client.notFound(JSON.parse(body).message))
							if (JSON.parse(body)?.message && JSON.parse(body)?.message === 'The User has to many incoming Friend Invites, can not get puuid') return message.reply("This user has too many pending friend requests, cannot fetch data.")
								if (err || JSON.parse(body).status !== 200) return send(message, client.notFound(JSON.parse(body).message))
									let data = JSON.parse(body)
								data = data.data

								let row = new Discord.ActionRowBuilder()
								.addComponents([createButton("1️⃣", "one"), createButton("2️⃣", "two"), createButton("3️⃣", "three"),createButton("4️⃣", "four"), createButton("5️⃣", "five")])
								let row2 = new Discord.ActionRowBuilder()
								.addComponents([createButton("⬅️", "left"), createButton("➡️", "right"), createButton("🔙", "back")])
								row2.components[0].disabled = true
								if (!data || !data.length) return send(message, client.notFound((`No recent data found. https://api.henrikdev.xyz/valorant/v3/matches/${region}/${name}/${tag}` + (matchType ? `?filter=${matchType}` : ''))))
									let matchesEmbed = new Discord.EmbedBuilder()
								.setColor(348425)
								.setTitle("Recent 5 Matches - " + args.join(" "))
								.setFooter("You can use the buttons below to view every round of a match")
								let emoji;
								let player;
								let searchedPlayerTeam2;
								let opponentTeam2
								await data.forEach(async (match, num) => {
									searchedPlayerTeam2 = match.players.all_players.filter(pl => pl.name.toLowerCase() === name.toLowerCase())[0].team.toLowerCase()
									opponentTeam2 = (searchedPlayerTeam2 === "blue" ? "red" : "blue")
									player = match.players.all_players.filter(pl => pl.name.toLowerCase() === name.toLowerCase())[0]
									let kda = String(player.stats.kills+"/"+player.stats.deaths+"/"+player.stats.assists)
									emoji = await client.guilds.cache.get("855091537696129064").emojis.cache.find(e => e.name === player.character.toLowerCase())
									if (!emoji) emoji = ''
										else emoji = emoji.toString()
											matchesEmbed.addField(String(num+1) + ") " + match.metadata.map + ` (${match.metadata.mode})`, emoji + `K/D/A: ${kda}\n${(match.teams[searchedPlayerTeam2]?.has_won ? "**Won " : "**Lost ") + match.teams[searchedPlayerTeam2]?.rounds_won + " - " + match.teams[opponentTeam2]?.rounds_won}**\n`+ match.metadata.game_start_patched, true)
										console.log(searchedPlayerTeam2, match.teams)
										console.log(match.players.all_players.filter(pl => pl.name.toLowerCase() === name.toLowerCase())[0])
									})
								mm.edit({embeds: [matchesEmbed], components: [row]})
								.then(msg => {
									const filter = (interaction) => message.author.id === interaction.user.id
									const collector = msg.createMessageComponentCollector({filter, idle: 40000, time: 70000 })
									collector.on('collect', async i => {
										let id = i.customId
										let a = {"one": 0, "two": 1, "three": 2, "four": 3, "five": 4}
										if (!a[id] && id !== "one") return;
										let match = data[a[id]]
										if (!match) return send(message, "Match not found!")
											if (match.metadata.mode === 'Deathmatch') return message.reply("You cannot view deathmatch stats")
												let maps = client.mapData
											let matchEmbed = new Discord.EmbedBuilder()
											.setColor(388531)
											.setTitle(match.metadata.map)
											.setThumbnail(maps.filter(m => m.displayName.toLowerCase() === match.metadata.map.toLowerCase())[0].splash)
											let currentRound = 0

											msg.edit({embeds: [matchEmbed], components: [row2]})
											.then(ms => {
												function setRound(r) {
													let round = match.rounds[r]
													let findPlayer;
													let playerEmoji;
													let killsTeam = []
													let killsEnemy = []
													let gun;
													let searchedPlayer = match.players.all_players.filter(pl => pl.name.toLowerCase() === name.toLowerCase())[0]
													let opponentTeam = (searchedPlayer.team === "Blue" ? "Red" : "Blue")
													let kills = round.player_stats.forEach(async p => {
														findPlayer = match.players.all_players.filter(pl => pl.puuid === p.player_puuid)[0]
														playerEmoji = client.guilds.cache.get("855091537696129064").emojis.cache.find(e => e.name === findPlayer.character.toLowerCase())
														if (!playerEmoji) playerEmoji = ''
															else playerEmoji = playerEmoji.toString()
																let killed = p.kill_events.map(kill => {
																	if (p.player_puuid === kill.victim_puuid) {p.kills--;
																		return ""}
																		let victim = match.players.all_players.filter(pl => pl.puuid === kill.victim_puuid)[0]
																		return client.guilds.cache.get("855091537696129064").emojis.cache.find(e => e.name === victim.character.toLowerCase()).toString()
																	}).join("")

															if (p.kill_events.length >0) {
																let namee = weapons[p.kill_events[0].damage_weapon_id.toLowerCase()]
																if (!namee) namee = 'Melee'
																	let emote = client.guilds.cache.get("855091537696129064").emojis.cache.find(e => e.name === namee?.toLowerCase())
																if (emote) gun = emote.toString()
																	else if (p.kill_events[0].damage_weapon_id.toLowerCase() === 'grenadeability') gun ="💣"
																		else gun = ''
																	}
																if (p.player_team === searchedPlayer.team) {
																	killsTeam.push(playerEmoji + p.player_display_name + ": " + p.kills + " " + (gun ||'') + (killed || ''))
																} else {
																	killsEnemy.push(playerEmoji + p.player_display_name + ": " + p.kills + " " + (gun ||'') + (killed || ''))
																}
															})
													let newEmb = new Discord.EmbedBuilder()
													.setTitle(match.metadata.map + ' - Round ' + String(r + 1))
													.setColor(473825)
													.setThumbnail(maps.filter(m => m.displayName.toLowerCase() === match.metadata.map.toLowerCase())[0].splash)
													.setDescription("Round " + (round.winning_team === "Blue" ? "Lost" : "Won"))
													.addField("Kills", "__TEAM__\n"+killsTeam.join("\n")+"\n\n__ENEMY__\n"+killsEnemy.join("\n"))
													.addField("Round outcome", round.end_type, true)
													if (round.bomb_planted) newEmb.addField("Bomb planted", "By "+round.plant_events.planted_by["display_name"], true)
														if (round.bomb_defused) newEmb.addField("Bomb defused", "By "+round.defuse_events.defused_by["display_name"], true)
															msg.edit({embeds: [newEmb], components: [row2]})
													}
													setRound(0)
													const filter2 = (interaction) => message.author.id === interaction.user.id
													const collector2 = ms.createMessageComponentCollector({filter2, idle: 35000, time: 90000 })
													collector2.on('collect', async i => {
														if (i.customId === 'left') {
															currentRound--;
														} else if (i.customId === 'right') {
															currentRound++;
														} else if (i.customId === 'back') {
															mm.edit({embeds: [matchesEmbed], components: [row]})
															collector2.stop()
															currentRound = 0;
															return;
														}
														if (currentRound <= 0) row2.components[0].disabled = true
															else row2.components[0].disabled = false
																if ((match.teams.blue.rounds_lost + match.teams.blue.rounds_won) <= (currentRound + 1)) row2.components[1].disabled = true
																	else row2.components[1].disabled = false
																		setRound(currentRound)
																})
													collector.on('end', collected => {})
												})
})
})
})
}