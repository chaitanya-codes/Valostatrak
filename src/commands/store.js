const Discord = require('discord.js')
const request = require('request')

module.exports.info = {
	name: "store",
	description: "See the current store collection",
	aliases: ["store-skins", "store-collection"],
	ratelimit: true,
	module: "Game Assets"
}

module.exports.execute = async (client, message, args, send) => {
	message.deferReply()

	const url = `https://api.henrikdev.xyz/valorant/v2/store-featured`
	const headers = { "Authorization": process.env.HD_KEY }

	request({ url, headers }, async (err, res, body) => {
		if (String(body).startsWith('<')) return message.reply("API is slow right now, try again later.")

		let json
		try {
			json = JSON.parse(body)
		} catch (e) {
			return send(message, "Invalid response from API.")
		}

		if (err || json.status !== 200) {
			return send(message, "There was an error while fetching the store! " + (json.errors?.[0]?.message || 'Unknown error'))
		}

		const stores = json.data
		if (!stores?.length) return send(message, "Something went wrong!")
		let storePage = 0

		const bundles = await client.getBundles()
		let bundle = stores[storePage]

		const bundleEmbed = () => {
			const bundleData = bundles.find(b => b.uuid === bundle.bundle_uuid)
			if (!bundleData) send(message, "Bundle data not found! New bundle probably just came out, try again later.")

			const embed = new Discord.EmbedBuilder()
				.setColor("Random")
				.setTitle(bundleData.displayName)
				.setDescription(`Store Featured Bundle\nWhole sale only: ${bundle.whole_sale_only ? "Yes" : "No"}\nBundle price: **${bundle.bundle_price}** VP`)
				.setImage(bundleData.displayIcon)
				.setThumbnail(bundleData.verticalPromoImage)
				.setFooter({
					text: "Bundle expires on: " + new Date(bundle.expires_at).toLocaleDateString('en-GB'),
					iconURL: client.user.displayAvatarURL()
				})

			bundle.items.map(item => {
				embed.addFields([{
					name: item.name,
					value: `[${item.base_price}](${item.image || "https://playvalorant.com"}) VP\n${(item.type !== 'skin_level' ? item.type.split("_").join(" ") : '') + (item.amount > 1 ? ` (x${item.amount})` : '')}`,
					inline: true
				}])
			})

			if (bundle.description && bundle.extraDescription) {
				embed.addFields([{ name: bundle.description, value: bundle.extraDescription }])
			}
			return embed
		}

		let page = 0
		const storeRow = () => {
			return new Discord.ActionRowBuilder().addComponents(
				new Discord.ButtonBuilder().setLabel("⬅ Previous Store").setCustomId("prev-store").setStyle("Primary").setDisabled(storePage === 0),
				new Discord.ButtonBuilder().setLabel("Preview Skins").setCustomId("preview").setStyle("Success"),
				new Discord.ButtonBuilder().setLabel("Next Store ➡").setCustomId("next-store").setStyle("Primary").setDisabled(storePage >= stores.length - 1)
			)
		}

		const row = () => {
			const disableLeft = page <= 0
			const disableRight = page >= bundle.items.length - 1
			const disablePreview = bundle.items[page].type !== 'skin_level'

			return new Discord.ActionRowBuilder().addComponents(
				new Discord.ButtonBuilder().setEmoji("⬅️").setCustomId("left").setDisabled(disableLeft).setStyle("Secondary"),
				new Discord.ButtonBuilder().setLabel("Preview").setCustomId("preview-skin").setDisabled(disablePreview).setStyle("Secondary"),
				new Discord.ButtonBuilder().setEmoji("➡️").setCustomId("right").setDisabled(disableRight).setStyle("Secondary")
			)
		}

		const messageSent = await send(message, { reply: true, embeds: [bundleEmbed()], components: [storeRow()] })

		const filter = i => i.user.id === message.author.id
		const collector = messageSent.createMessageComponentCollector({ filter, time: 50000, idle: 40000 })

		const updateStore = async (i) => {
			bundle = stores[storePage]
			page = 0
			await send(i, { edit: true, embeds: [bundleEmbed(bundle)], components: [storeRow()] })
		}

		const updatePreview = (i) => {
			const item = bundle.items[page]
			let previewEmbed = new Discord.EmbedBuilder()
				.setColor("Random")
				.setTitle(item.name)
				.setDescription(`Price: ${item.base_price ?? 0}VP ${item.discounted_price && item.discount_percent > 0 ? `| Discounted price: ${item.discounted_price}VP (${item.discount_percent}%)` : ""}`)
				.setImage(item.image)

			send(i, {
				edit: true,
				embeds: [previewEmbed],
				components: [row(), new Discord.ActionRowBuilder().addComponents(new Discord.ButtonBuilder().setLabel("Go back").setCustomId("back").setStyle("Secondary"))]
			})
		}

		collector.on("collect", async i => {
			switch (i.customId) {
				case 'preview':
					page = 0
					updatePreview(i)
					break
				case 'left':
					page--
					updatePreview(i)
					break
				case 'right':
					page++
					updatePreview(i)
					break
				case 'preview-skin':
					await client.commands.get("skin").execute(client, message, bundle.items[page].name.split(" "), send)
					i.deferUpdate()
					break
				case 'prev-store':
					storePage--
					await updateStore(i)
					break
				case 'next-store':
					storePage++
					await updateStore(i)
					break
				case 'back':
					await updateStore(i)
					break
			}
		})

		collector.on("end", () => {
			send(messageSent, { edit: true, components: [] })
		})
	})
}