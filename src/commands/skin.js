module.exports.info = {
	name: "skin",
	description: "View skin and the weapon info",
	aliases: ['view-skin'],
	usage: ['skin'],
	module: "Game Assets"
}

module.exports.execute = async (client, message, args, send) => {

	const request = require('request')
	const Discord = require('discord.js')

	let skinName;

	if (!args[0]) return send(message, "Command usage: `/skin <collectionName> <weaponName>`\nExample: `/skin Reaver Vandal`")
		else skinName = args.join(' ')
			
			let weaponName = args.pop()
		let findWeapon = client.weaponData.filter(weapon => weapon.displayName.toLowerCase() === weaponName.toLowerCase())
		if (["melee", "tactical knife"].includes(weaponName.toLowerCase())) return message.reply("This is not a skin, use weapon command for this.")
			if (weaponName.toLowerCase() === "spike") return message.reply("https://static.wikia.nocookie.net/valorant/images/d/de/Spike.png/revision/latest?cb=20210826134702")
				if (!findWeapon || !findWeapon[0]?.displayName) findWeapon = client.weaponData.filter(weapon => weapon.displayName.toLowerCase() === "melee")

					if (findWeapon && findWeapon[0]?.displayName) {
						let findSkin= findWeapon[0].skins.filter(skin => skin.displayName.toLowerCase().replace("//", " ") === skinName.toLowerCase().replace("//", " "))

						findSkin = findSkin[0]
						findWeapon = findWeapon[0]
						if (!findSkin) return send(message, "Could not find skin! Command usage: `/skin <collectionName> <weaponName>`\nExample: `/skin Reaver Vandal`")
							if (['Luxe Knife', 'Prime Guardian', 'Sovereign Guardian', 'Sovereign Marshal', "Hush Ghost", "Soul Silencer Ghost", "Game Over Sheriff"].includes(findSkin.displayName)) findSkin.displayIcon = findSkin.levels[0].displayIcon
								
								let emb = new Discord.EmbedBuilder()
							.setTitle((findSkin.displayName ? findSkin.displayName : findWeapon.displayName))
							.setColor(388422)
							.setImage((findSkin.displayIcon ? findSkin.displayIcon : findSkin.chromas[0].displayIcon || findWeapon.displayIcon))
							if (findWeapon && findWeapon.displayName) {
								emb.setFooter({text: "If you want to see different skin levels and the preview of this skin ingame, use the button below"})

								let row = new Discord.ActionRowBuilder()
								.addComponents([new Discord.ButtonBuilder().setLabel("View skin levels and preview").setCustomId("levels").setStyle("Primary"), new Discord.ButtonBuilder().setLabel("View skin color variants").setCustomId("colors").setStyle("Primary")])
								let m = await send(message, {embeds: [emb], components: [row]})
								let page = 0;
								let skinLevels = client.skinLevelData.filter(s => s.displayName?.toLowerCase().startsWith(findSkin.displayName?.toLowerCase()))

								const showLevel = (p, int) => {
									send(int, {edit: true, components: [row2], content: `${findSkin.displayName} - Level ${p + 1}\n` + skinLevels[p].streamedVideo || "No video found!"})
								}

								let row2 = new Discord.ActionRowBuilder()
								.addComponents([new Discord.ButtonBuilder().setEmoji("⬅️").setCustomId("left").setDisabled(true).setStyle("Secondary"), new Discord.ButtonBuilder().setEmoji("➡️").setCustomId("right").setStyle("Secondary")])

								let filter = i => i.user.id === message.author.id
								let coll = m.createMessageComponentCollector({filter, time: 90000, errors: ['time']})
								
								coll.on('collect', async i => {
									if (i.customId === 'levels') {
										m.edit({components: []})
										if (!skinLevels || !skinLevels[0]) return send(message, "ERROR!")
											let preview = await send(i, {content: `${findSkin.displayName} - Level 1\n` + skinLevels[0].streamedVideo, components: [row2]})
										let coll2 = preview.createMessageComponentCollector({filter, time: 90000, errors: ['time']})
										coll2.on('collect', async i2 => {
											if (i2.customId === 'left') {
												page--;
												if ((page + 1) <= skinLevels.length) row2.components[1].setDisabled(false)
													if (page <= 0) row2.components[0].setDisabled(true)
														showLevel(page, i2)
												} else if (i2.customId === 'right') {
													page++;
													if ((page + 1) >= skinLevels.length) row2.components[1].setDisabled(true)
														row2.components[0].setDisabled(false)
													showLevel(page, i2)
												}
											})
									} else if (i.customId === 'colors') {
										if (!findSkin.chromas || !findSkin.chromas.length) return send(i, "This skin does not have color variants")
											await m.edit({components: []})
										let setEmb = await Discord.EmbedBuilder.from(m.embeds[0].data).setTitle(findSkin.chromas[page].displayName).setImage(findSkin.chromas[page].displayIcon || findSkin.chromas[page].fullRender).setThumbnail(findSkin.chromas[page].swatch)
										let clr = await send(i, {edit: true, embeds: [setEmb], components: [row2]})
										let coll3 = clr.createMessageComponentCollector({filter, time: 90000, errors: ['time']})
										coll3.on('collect', async i2 => {
											if (i2.customId === 'left') {
												page--;
												if ((page + 1) <= findSkin.chromas.length) row2.components[1].setDisabled(false)
													if (page <= 0) row2.components[0].setDisabled(true)
														send(i2, {edit: true, embeds: [Discord.EmbedBuilder.from(m.embeds[0].data).setTitle(findSkin.chromas[page].displayName).setImage(findSkin.chromas[page].displayIcon || findSkin.chromas[page].fullRender).setThumbnail(findSkin.chromas[page].swatch)], components: [row2]})
												} else if (i2.customId === 'right') {
													page++;
													if ((page + 1) >= findSkin.chromas.length) row2.components[1].setDisabled(true)
														row2.components[0].setDisabled(false)
													send(i2, {edit: true, embeds: [Discord.EmbedBuilder.from(m.embeds[0].data).setTitle(findSkin.chromas[page].displayName).setImage(findSkin.chromas[page].displayIcon || findSkin.chromas[page].fullRender).setThumbnail(findSkin.chromas[page].swatch)], components: [row2]})
												}
											})
									}
								})
							}
						} else send(message, "Skin not found!\nUsage: `/skin <CollectionName> <weaponName>`\nExample: `/skin Reaver Vandal`")
					}