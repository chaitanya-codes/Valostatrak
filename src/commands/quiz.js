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

	const filter = m => m.user.id === message.author.id

	if (args[0] && ['global', 'server', 'score', 'leaderboard'].includes(args[0]?.toLowerCase())) {
		message.deferReply()
		if (!client.triviaStats.has(message.author.id)) client.triviaStats.set(message.author.id, 0)
		if (!client.triviaStatsTemp.has(message.author.id)) client.triviaStatsTemp.set(message.author.id, 0)

		const row1 = new Discord.ActionRowBuilder().addComponents([new Discord.ButtonBuilder().setLabel("This server").setCustomId("server").setStyle("Secondary"), new Discord.ButtonBuilder().setLabel("Global").setCustomId("global").setStyle("Success").setDisabled(true)])
		const row2 = new Discord.ActionRowBuilder().addComponents([new Discord.ButtonBuilder().setLabel("Today").setCustomId("temp").setStyle("Secondary"), new Discord.ButtonBuilder().setLabel("All time").setCustomId("all").setStyle("Success").setDisabled(true)])

		let [server, temp] = [false, false];

		const updateLeaderboard = async (msg, edit = false) => {
			return new Promise(async (resolve, reject) => {

				let stats = temp ? client.triviaStatsTemp : client.triviaStats
				let sortedStats = Array.from(stats.entries()).sort((a, b) => b[1] - a[1]) // Comparing score, a[0] is id

				if (server) sortedStats = sortedStats.filter(id => message.guild.members.cache.has(id))

				const topPlayers = sortedStats.slice(0, 10)
				let leaderboard = '';

				for (let i = 0; i < topPlayers.length; i++) {
					const [userId, score] = topPlayers[i]
					const username = client.users.cache.get(userId)?.username || (await client.users.fetch(userId)).username
					leaderboard += `${i + 1}) ${username}: ${score}\n`
				}
				let m = await send(msg, {
					edit: edit, components: [row1, row2], embeds: new Discord.EmbedBuilder()
						.setTitle("Quiz Score Leaderboard")
						.setColor("Random")
						.setDescription(leaderboard)
						.setFooter({ text: "If you see unloaded data, then try switching global/server" })
				}).catch(() => reject())
				resolve(m)
			})
		}

		const colorButton = (row, opposite) => {
			row.components[0].setStyle((opposite ? "Secondary" : "Success")).setDisabled((opposite ? false : true))
			row.components[1].setStyle((opposite ? "Success" : "Secondary")).setDisabled((opposite ? true : false))
		}

		if (args[0].toLowerCase() === 'server') {
			server = true; colorButton(row1, false) // Set global to false
		}

		let m = await updateLeaderboard(message)

		const col = m.createMessageComponentCollector({ filter, time: 60000, idle: 25000 })
		col.on("collect", i => {
			let id = i.customId
			if (id === 'server') { server = true; colorButton(row1) }
			else if (id === 'global') { server = false; colorButton(row1, true) }
			else if (id === 'temp') { temp = true; colorButton(row2) }
			else if (id === 'all') { temp = false; colorButton(row2, true) }
			updateLeaderboard(true, i)
		})
		col.on("end", i => send(m, { edit: true, components: [] }))
	} else {
		const [agents, weapons, sprays, buddies, playercards] = await Promise.all([
			client.getAgents(),
			client.getWeapons(),
			client.getSprays(),
			client.getBuddies(),
			client.getPlayercards()
		])
		const abilities = agents.flatMap(a => a.abilities.filter(e => e.slot !== "Passive"))

		const trivia = ['skin', 'ability', 'spray', 'buddy', 'playercard']
		const random = trivia[Math.floor(Math.random() * trivia.length)]

		if (!weapons) return send(message, "Error fetching asset data!")

		const getRandomItem = (collection) => collection[Math.floor(Math.random() * collection.length)]

		const collections = {
			'skin': weapons.flatMap(w => w.skins),
			'ability': abilities,
			'spray': sprays,
			'buddy': buddies,
			'playercard': playercards,
		}

		let randomItem = getRandomItem(collections[random])

		if (randomItem === 'skin') {
			while (randomItem.displayName.startsWith('Standard') || randomItem.displayName.startsWith('Melee') || !randomItem.displayIcon) {
				randomItem = getRandomItem(collections[random])
			}
			if (['Luxe Knife', 'Prime Guardian', 'Sovereign Guardian', 'Sovereign Marshal', "Hush Ghost", "Soul Silencer Ghost", "Game Over Sheriff"].includes(randomItem.displayName)) randomItem.displayIcon = randomItem.levels[0].displayIcon
		}

		const choices = []
		const correctChoice = Math.floor(Math.random() * 8)

		for (var i = 0; i < 8; i++) {
			if (correctChoice === i) choices.push(randomItem.displayName)
			else {
				let newItem;
				do {
					newItem = await getRandomItem(collections[random])
				} while (choices.includes(newItem.displayName))
				choices.push(newItem.displayName)
			}
		}

		const row = new Discord.ActionRowBuilder().addComponents([new Discord.ButtonBuilder().setCustomId("again").setLabel("Play Again").setStyle("Success")])
		const createCollector = (m) => {
			const col = m.createMessageComponentCollector({ filter: () => true, errors: ['time'], time: 15000 })
			col.on("collect", i => {
				if (i.customId === 'again') {
					i.author = i.user
					i.edit = (o) => i.editReply(o)
					i.delete = () => { }
					client.commands.get("quiz").execute(client, i, args, send)
					col.stop()
				}
			})
			col.on("end", i => m.edit({ components: [] }))
		}

		const options1 = new Discord.ActionRowBuilder().addComponents(choices.slice(0, 4).map((name, index) => new Discord.ButtonBuilder().setCustomId(String(index)).setLabel(name).setStyle("Secondary")))
		const options2 = new Discord.ActionRowBuilder().addComponents(choices.slice(4, 9).map((name, index) => new Discord.ButtonBuilder().setCustomId(String(4 + index)).setLabel(name).setStyle("Secondary")))

		const emb = new Discord.EmbedBuilder()
			.setColor(382145)
			.setTitle("Which " + random + " is this?")
			.setImage(randomItem.displayIcon)
			.setFooter({ text: "You have 7 seconds to guess | " + message.author.username })

		let answered = []

		const optionMsg = await send(message, { embeds: [emb], components: [options1, options2] })
		const collectAnswer = optionMsg.createMessageComponentCollector({ filter, time: 7000, errors: ['time'] })

		collectAnswer.on('collect', i => {
			if (answered.includes(i.user.id)) return i.reply({ ephemeral: true, content: "You already answered!" })
			else answered.push(i.user.id)
			i.deferUpdate()

			if (Number(i.customId) === correctChoice) {
				if (client.triviaStats.has(i.user.id)) {
					client.triviaStats.math(i.user.id, "+", 1)
				} else client.triviaStats.set(i.user.id, 1)

				client.triviaStatsTemp.set(i.user.id, (client.triviaStatsTemp.get(i.user.id) || 0) + 1)

				send(message, { content: i.user.toString(), components: [row], embeds: [new Discord.EmbedBuilder().setColor("Random").setTitle("You got it right!").setDescription(`Your score today: ${client.triviaStatsTemp.get(i.user.id)} \nAll time score: ${client.triviaStats.get(i.user.id)}`).setFooter({ text: "Use /quiz leaderboard to view leaderboard" })] }).then(m => createCollector(m))
			} else send(message, { ephemeral: true, components: [row], content: `Wrong! The ${random} was: \`${randomItem.displayName}\`` }).then(m => createCollector(m))
		})
		collectAnswer.on('end', () => {
			if (!answered.includes(message.author.id)) message.channel.send({ components: [row], content: `You didn't answer in 6 seconds! The ${random} was: \`${randomItem.displayName}\`` }).then(m => createCollector(m))
		})
	}
}