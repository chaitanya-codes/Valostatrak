module.exports.info = {
	name: "skin",
	description: "View skin and the weapon info",
	aliases: ['view-skin'],
	usage: ['skin'],
	module: "Game Assets"
}

const Discord = require('discord.js')

module.exports.execute = async (client, message, args, send) => {

	if (!args[0]) return send(message, "Command usage: `/skin <collectionName> <weaponName>`\nExample: `/skin Reaver Vandal`")

	const skinName = args.join(' ')
	const weaponName = args.pop()

	const weaponData = await client.getWeapons()
	let findWeapon = weaponData.find(weapon => weapon.displayName.toLowerCase() === weaponName.toLowerCase())

	if (["melee", "tactical knife"].includes(weaponName.toLowerCase())) return message.reply("This is not a skin, use weapon command for this.")
	if (weaponName.toLowerCase() === "spike") return message.reply("https://static.wikia.nocookie.net/valorant/images/d/de/Spike.png/revision/latest?cb=20210826134702")
	if (!findWeapon) findWeapon = weaponData.find(weapon => weapon.displayName.toLowerCase() === "melee")

	const findSkin = findWeapon.skins.find(skin => skin.displayName.toLowerCase().replace("//", " ") === skinName.toLowerCase().replace("//", " "))
	if (!findSkin) return send(message, "Could not find skin! Command usage: `/skin <collectionName> <weaponName>`\nExample: `/skin Reaver Vandal`")

	if (['Luxe Knife', 'Prime Guardian', 'Sovereign Guardian', 'Sovereign Marshal', "Hush Ghost", "Soul Silencer Ghost", "Game Over Sheriff"].includes(findSkin.displayName)) findSkin.displayIcon = findSkin.levels[0].displayIcon
	
	const contentTier = findSkin.contentTierUuid;
	const contentTiers = await client.getContentTiers();

	const tier = contentTiers.find(tier => tier.uuid === contentTier);

	const emb = new Discord.EmbedBuilder()
		.setTitle(findSkin.displayName || findWeapon.displayName)
		.setDescription(tier.displayName)
		.setThumbnail(tier.displayIcon)
		.setImage(findSkin.displayIcon || findSkin.chromas[0].displayIcon || findWeapon.displayIcon)
		.setColor(388422)
		.setFooter({ text: "If you want to view skin levels and preview of the skin in-game, use the buttons below" })

	const row = new Discord.ActionRowBuilder()
		.addComponents([new Discord.ButtonBuilder().setLabel("View skin levels and preview").setCustomId("levels").setStyle("Primary"), new Discord.ButtonBuilder().setLabel("View skin color variants").setCustomId("colors").setStyle("Primary")])

	const m = await send(message, { embeds: [emb], components: [row] })

	const filter = i => i.user.id === message.author.id
	const coll = m.createMessageComponentCollector({ filter, time: 90000, errors: ['time'] })

	let page = 0;

	const skinLevelData = await client.getSkinLevels()
	const skinLevels = skinLevelData.filter(s => s.displayName?.toLowerCase().startsWith(findSkin.displayName?.toLowerCase()))

	const row2 = new Discord.ActionRowBuilder()
		.addComponents([new Discord.ButtonBuilder().setEmoji("⬅️").setCustomId("left").setDisabled(true).setStyle("Secondary"), new Discord.ButtonBuilder().setEmoji("➡️").setCustomId("right").setStyle("Secondary")])

	const showLevel = (p, int) => {
		send(int, { edit: true, components: [row2], content: `${findSkin.displayName} - Level ${p + 1}\n${skinLevels[p].streamedVideo || "No video found!"}` })
	}

	coll.on('collect', async i => {
		if (i.customId === 'levels') {
			m.edit({ components: [] })
			if (!skinLevels.length) return send(message, "ERROR!")

			const preview = await send(i, { content: `${findSkin.displayName} - Level 1\n${skinLevels[0].streamedVideo}`, components: [row2] })
			const coll2 = preview.createMessageComponentCollector({ filter, time: 90000, errors: ['time'] })

			coll2.on('collect', async i2 => {
				if (i2.customId === 'left') {
					page--;
					row2.components[1].setDisabled(false)
					row2.components[0].setDisabled(page <= 0)
					showLevel(page, i2)
				} else if (i2.customId === 'right') {
					page++;
					row2.components[1].setDisabled(page + 1 >= skinLevels.length)
					row2.components[0].setDisabled(false)
					showLevel(page, i2)
				}
			})
		} else if (i.customId === 'colors') {
			if (!findSkin.chromas?.length) return send(i, "This skin does not have color variants")

			await m.edit({ components: [] })

			const setEmb = await Discord.EmbedBuilder.from(m.embeds[0].data).setTitle(findSkin.chromas[page].displayName).setImage(findSkin.chromas[page].displayIcon || findSkin.chromas[page].fullRender).setThumbnail(findSkin.chromas[page].swatch)

			const clr = await send(i, { edit: true, embeds: [setEmb], components: [row2] })
			const coll3 = clr.createMessageComponentCollector({ filter, time: 90000, errors: ['time'] })

			coll3.on('collect', async i2 => {
				if (i2.customId === 'left') {
					page--;
					row2.components[1].setDisabled(false)
					row2.components[0].setDisabled(page <= 0)
				} else if (i2.customId === 'right') {
					page++;
					row2.components[1].setDisabled(page + 1 >= findSkin.chromas.length)
					row2.components[0].setDisabled(false)
				} else return;
				send(i2, { edit: true, embeds: [Discord.EmbedBuilder.from(m.embeds[0].data).setTitle(findSkin.chromas[page].displayName).setImage(findSkin.chromas[page].displayIcon || findSkin.chromas[page].fullRender).setThumbnail(findSkin.chromas[page].swatch)], components: [row2] })
			})
		}
	})
}