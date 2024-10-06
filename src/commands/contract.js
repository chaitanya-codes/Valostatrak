module.exports.info = {
	name: "contract",
	description: "View any agent contract",
	aliases: ["rewards", "agent-contract", "free-skins", "freeskins", "contracts", "agent-skins"],
	usage: ['agent'],
	module: "Game Assets"
}

const Discord = require('discord.js')

module.exports.execute = async (client, message, args, send) => {
	if (!args[0]) return send(message, "Command Usage: `/contract <agent>`\nExample: `/contract sova`")

	let contractName = args.join(' ')
	const contracts = await client.getContracts()
	let findContract = contracts.find(b => b.displayName.toLowerCase().replace(" gear", "") === contractName.toLowerCase() && b.content.relationType === 'Agent')

	if (findContract) {
		const emojis = {
			0: '0⃣', 1: '1⃣', 2: '2⃣', 3: '3⃣', 4: '4⃣', 5: '5⃣', 6: '6⃣', 7: '7⃣', 8: '8⃣', 9: '9⃣', 10: '🔟'
		}
		let row = new Discord.ActionRowBuilder().addComponents([1, 2, 3, 4, 5].map(e => new Discord.ButtonBuilder().setStyle("Secondary").setCustomId(String(e)).setEmoji(emojis[e])))
		let row2 = new Discord.ActionRowBuilder().addComponents([6, 7, 8, 9, 10].map(e => new Discord.ButtonBuilder().setStyle("Secondary").setCustomId(String(e)).setEmoji(emojis[e])))
		row.components[0].setDisabled(true)
		let data = findContract.content

		let chapter = 0
		let level = 0

		const getCollection = async (t) => {
			if (t === "Character") return await client.getAgents()
			else if (t === "Title") return await client.getPlayertitles()
			else if (t === 'PlayerCard') return await client.getPlayercards()
			else if (t === 'Spray') return await client.getSprays()
			else if (t === 'EquippableCharmLevel') return await client.getBuddies()
			else if (t === 'EquippableSkinLevel') return await client.getSkinLevels()
			else if (t === 'Currency') return [{"uuid":"85ca954a-41f2-ce94-9b45-8ca3dd39a00d","displayName":"Kingdom Credits","displayNameSingular":"Kingdom Credit","displayIcon":"https://media.valorant-api.com/currencies/85ca954a-41f2-ce94-9b45-8ca3dd39a00d/displayicon.png","largeIcon":"https://media.valorant-api.com/currencies/85ca954a-41f2-ce94-9b45-8ca3dd39a00d/largeicon.png","assetPath":"ShooterGame/Content/Currencies/Currency_Dough_DataAsset"}]
			else return client[t.toLowerCase() + "Data"]
		}

		const getLevel = async (l) => {
			const lvl = data.chapters[chapter].levels[(chapter === 0 ? level : level - 5)]
			let entity = (await getCollection(lvl.reward.type)).find(a => a.uuid === lvl.reward.uuid) || undefined
			if (!entity) {
				entity = (await client.getBuddies()).find(a => a.levels.some(l => l.uuid === lvl.reward.uuid))
				entity = entity.levels.find(l => l.uuid === lvl.reward.uuid)
			}

			const rewardType = (t) => {
				if (t === 'EquippableCharmLevel') return 'Buddy'
				else if (t === 'EquippableSkinLevel') return 'Skin'
				else return t
			}

			const emb = new Discord.EmbedBuilder()
				.setTitle(findContract.displayName)
				.setDescription(client.guilds.cache.get("501396018395480065").emojis.cache.find(e => e.name === findContract.displayName.toLowerCase().replace(" gear", ""))?.toString() || client.emojis.cache.find(e => e.name === findContract.displayName.toLowerCase().replace(" gear", ""))?.toString() || "** **")
				.setColor('Random')
				.setImage(entity?.displayIcon || entity?.displayIcon2 || null)
				.addFields([{ name: "CHAPTER " + (chapter + 1) + " LEVEL " + (level + 1), value: "** **" },
				{ name: "XP Required", value: `${lvl.xp} XP` },
				{ name: "Purchasable with VP", value: (lvl.isPurchasableWithVP ? `${lvl.vpCost} VP` : "No") },
				{ name: "Reward", value: rewardType(lvl.reward.type) + " - " + (entity.displayName || "") + (lvl.reward.amount > 1 ? ` (${lvl.reward.amount})` : "")}])
				.setThumbnail((findContract.displayIcon ? findContract.displayIcon : findContract.displayIcon2))
			return emb;
		}

		let embed = await getLevel(level)
		const msg = await send(message, { embeds: [embed], components: [row, row2] })

		const filter = i => i.user.id === message.author.id
		const collector = msg.createMessageComponentCollector({ filter, idle: 45000 })
		collector.on('collect', async i => {
			level = Number(i.customId) - 1
			if (level > 4) chapter = 1
			else chapter = 0
			row.components.forEach(c => c.setDisabled(false))
			row2.components.forEach(c => c.setDisabled(false))
			if (chapter === 0) row.components[level].setDisabled(true)
			if (chapter === 1) row2.components[level - 5].setDisabled(true)
			embed = await getLevel(level)
			await send(i, { edit: true, embeds: [embed], components: [row, row2] })
		})
	} else send(message, "Contract not found! Make sure you type the agent name correct.")
}