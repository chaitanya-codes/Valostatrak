module.exports.info = {
	name: 'quiz',
	description: 'Test your valorant knowledge by guessing skins!',
	aliases: ['guess', 'trivia', 'triv'],
	usage: ['leaderboard'],
	optional: true,
	module: "Other"
}
const Discord = require('discord.js')

module.exports.execute = async (client, message, args, send) => {
	let filt = m => m.user.id === message.author.id
	if (args[0] && ['global', 'this-server', 'score', 'leaderboard'].includes(args[0]?.toLowerCase())) {
		message.deferReply()
		if (!client.triviaStats.has(message.author.id)) client.triviaStats.set(message.author.id, 0)
			if (!client.triviaStatsTemp.has(message.author.id)) client.triviaStatsTemp.set(message.author.id, 0)
				let row1 = new Discord.ActionRowBuilder().addComponents([new Discord.ButtonBuilder().setLabel("This server").setCustomId("server").setStyle("Secondary"), new Discord.ButtonBuilder().setLabel("Global").setCustomId("global").setStyle("Success").setDisabled(true)])
			let row2 = new Discord.ActionRowBuilder().addComponents([new Discord.ButtonBuilder().setLabel("Today").setCustomId("temp").setStyle("Secondary"), new Discord.ButtonBuilder().setLabel("All time").setCustomId("all").setStyle("Success").setDisabled(true)])
			let lb;
			let server = false;
			let temp = false;
			let order = async (editMsg, msg) => {
				let stats = client.triviaStatsTemp
				if (!temp) stats = client.triviaStats
					let list = stats.map((a,b) => b)
				let sorted = list.sort((a,b) => stats.get(b) - stats.get(a))
				if (server) sorted = sorted.filter(id => message.guild.members.cache.has(id))
					sorted = sorted.splice(0,10)
				let n = 0;
				lb = await sorted.map(a => {
					n++;
					return (n + ") " + (client.users.cache.get(a)?.tag || client.users.fetch(a).then(a => a.tag)) + ": " + stats.get(a))
				}).join("\n")
				if (editMsg) send(msg, {edit: true, components: [row1,row2], embeds: new Discord.EmbedBuilder()
				.setTitle("Quiz Score Leaderboard")
				.setColor("Random") 
				.setDescription(lb)
				.setFooter({text: "If you see some weird code inbetween, then run the command again"})
			})
			}
			let colorButton = (row, opposite) => {
				row.components[0].setStyle((opposite ? "Secondary" : "Success")).setDisabled((opposite ? false : true))
				row.components[1].setStyle((opposite ? "Success" : "Secondary")).setDisabled((opposite ? true : false))
			}
			if (args[0].toLowerCase() === 'global') {server = false; temp = false; colorButton(row1, true); colorButton(row2, true)} 
			await order()
			await client.wait(500)
			let m = await send(message, {components: [row1,row2], embeds: new Discord.EmbedBuilder()
				.setTitle("Quiz Score Leaderboard")
				.setColor("Random") 
				.setDescription(lb)
				.setFooter({text: "If you see some weird code inbetween, then run the command again"})
			})
			let col = m.createMessageComponentCollector({filt, time: 80000, idle: 45000})
			col.on("collect", i => {
				let id = i.customId
				if (id === 'server') {server=true;colorButton(row1)}
				else if (id === 'global') {server=false;colorButton(row1, true)}
				else if (id === 'temp') {temp=true;colorButton(row2)}
				else if (id === 'all') {temp=false;colorButton(row2, true)}
				order(true, i)

			})
			col.on("end", i => send(m, {edit: true, components: []}))
		} else {
			let trivia = ['skin', 'ability', 'spray', 'buddy', 'playercard']
			let random = trivia[Math.floor(Math.random() * trivia.length)]

			let abilities = client.agentData.map(a => a.abilities.filter(e=>e.slot !== "Passive")).flat(Infinity)
			let weapons = client.weaponData
			let sprays = client.sprayData
			let buddies = client.buddiesData
			let playercards = client.playercardData
			if (!weapons) return send(message, "Bot just started, please wait.")
				let randomType;
			let randomSkin;

			function getRandom() {
				if (random === 'spray') {
					if (!randomType) randomType = sprays[Math.floor(Math.random() * sprays.length)]
						randomSkin = sprays[Math.floor(Math.random() * sprays.length)]
				} else if (random === 'buddy') {
					if (!randomType) randomType = buddies[Math.floor(Math.random() * buddies.length)]
						randomSkin = buddies[Math.floor(Math.random() * buddies.length)]
				} else if (random === 'skin') {
					if (!randomType) randomType = weapons[Math.floor(Math.random() * weapons.length)]
						randomSkin = randomType.skins[Math.floor(Math.random() * randomType.skins.length)]
					if (!randomSkin.displayIcon) randomSkin = randomType.skins[Math.floor(Math.random() * randomType.skins.length)]
						if (randomSkin.displayName.startsWith('Standard')) randomSkin = randomType.skins[Math.floor(Math.random() * randomType.skins.length)]
							if (randomSkin.displayName.startsWith('Standard')) randomSkin = randomType.skins[Math.floor(Math.random() * randomType.skins.length)]
								if (randomSkin.displayName.startsWith('Melee')) randomSkin = randomType.skins[Math.floor(Math.random() * randomType.skins.length)]
									if (['Luxe Knife', 'Prime Guardian', 'Sovereign Guardian', 'Sovereign Marshal', "Hush Ghost", "Soul Silencer Ghost", "Game Over Sheriff"].includes(randomSkin.displayName)) randomSkin.displayIcon = randomSkin.levels[0].displayIcon
								} else if (random === 'playercard') {
									if (!randomType) randomType = ""
										randomSkin = playercards[Math.floor(Math.random() * buddies.length)]
								} else {
									if (!randomType) randomType = abilities[Math.floor(Math.random() * abilities.length)]
										randomSkin = abilities[Math.floor(Math.random() * abilities.length)]
								}
							}
							getRandom()

							let row = new Discord.ActionRowBuilder().addComponents([new Discord.ButtonBuilder().setCustomId("again").setLabel("Play Again").setStyle("Success")])
							let createCollector = (m) => {
								let filter = i => 1===1
								let col = m.createMessageComponentCollector({filter, errors: ['time'], time:15000})
								col.on("collect", i => {
									if (i.customId === 'again') {
										i.author = i.user
										i.edit = (o) => i.editReply(o)
										i.delete = () => {}
										client.commands.get("quiz").execute(client, i, args, send)
										col.stop()
									}
								})
								col.on("end", i => m.edit({components:[]}))
							}

							const choices = []
							let correctChoice = Math.floor(Math.random() * 8)
							for (var i in Array.from(Array(8).keys())) {
								if (correctChoice === i) choices.push(randomSkin)
									else {
										getRandom()
										do { getRandom() } while (choices.includes(randomSkin))
										choices.push(randomSkin)
									}
								}
								

								const options1 = new Discord.ActionRowBuilder().addComponents(choices.slice(0,4).map((c,index) => new Discord.ButtonBuilder().setCustomId(String(index)).setLabel(c.displayName).setStyle("Secondary")))
								const options2 = new Discord.ActionRowBuilder().addComponents(choices.slice(4,9).map((c,index) => new Discord.ButtonBuilder().setCustomId(String(4+index)).setLabel(c.displayName).setStyle("Secondary")))
								
								let emb = new Discord.EmbedBuilder()
								.setColor(382145)
								.setTitle("Which " + random + " is this?")
								.setImage(choices[correctChoice].displayIcon)
								.setFooter({text: "You have 6 seconds to guess | " + message.author.username})

								let answered = []

								let optionMsg = await send(message, {embeds: [emb], components: [options1,options2]})
								let coll4 = optionMsg.createMessageComponentCollector({filt, time: 6000, errors: ['time']})
								randomSkin = choices[correctChoice]
								coll4.on('collect', i => {
									if (answered.includes(i.user.id)) return i.reply({ephemeral: true, content: "You already answered!"})
										else answered.push(i.user.id)
											i.deferUpdate()
										if (Number(i.customId) === correctChoice) {
											if (client.triviaStats.has(i.user.id)) {
												client.triviaStats.math(i.user.id, "+", 1)
											} else client.triviaStats.set(i.user.id, 1)
											if (client.triviaStatsTemp.has(i.user.id)) {
												client.triviaStatsTemp.set(i.user.id, (client.triviaStatsTemp.get(i.user.id) + 1))
											} else client.triviaStatsTemp.set(i.user.id, 1)
											send(message, {content: i.user.toString(), components: [row], embeds: [new Discord.EmbedBuilder().setColor("Random").setTitle("You got it right!").setDescription(`Your score today: ${client.triviaStatsTemp.get(i.user.id)} \nAll time score: ${client.triviaStats.get(i.user.id)}`).setFooter({text: "Use /quiz leaderboard to view leaderboard"})]}).then(m => createCollector(m))
										} else send(message, {ephemeral: true, components: [row], content:"Wrong! The " + random + " was: `" + randomSkin.displayName + '`'}).then(m => createCollector(m))
									})
								coll4.on('end', () => {
									if (!answered.includes(message.author.id)) message.channel.send({components: [row], content:"You didn't answer in 6 seconds! The " + random + " was: `" + choices[correctChoice].displayName + '`'}).then(m => createCollector(m))
								})
							}
						}