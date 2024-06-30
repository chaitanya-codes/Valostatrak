module.exports.info = {
	name: "store",
	description: "See the current store collection",
	aliases: ["store-skins", "store-collection"],
	ratelimit: true,
	module: "Game Assets"
}

const Discord = require('discord.js')

module.exports.execute = async (client, message, args, send) => {
	message.deferReply()
	require('request')({ url: `https://api.henrikdev.xyz/valorant/v2/store-featured`, headers: { "Authorization": process.env.HD_KEY } }, async (err, res, body) => {
		if (String(body).startsWith('<')) return message.reply("API is slow right now, try again later.")
		if (err || JSON.parse(body).status !== 200) return send(message, "There was an error while fetching the store! " + JSON.parse(body).errors[0].message)
		const data = JSON.parse(body).data

		const bundle = data[0]
		if (!bundle) return send(message, "Something went wrong!")
		
		const bundles = await client.getBundles()
		const bundleData = bundles.filter(b => b.uuid === bundle.bundle_uuid)[0]

		const embed = new Discord.EmbedBuilder()
			.setColor("Random")
			.setTitle(bundleData.displayName)
			.setDescription("Store Featured Bundle\n" + "Bundle price: " + String(bundle.bundle_price) + "VP")
			.setImage(bundleData.displayIcon)
			.setThumbnail(bundleData.verticalPromoImage)
		let links = []
		bundle.items.map(i => {
			embed.addFields([{ name: i.name + (i.amount > 1 ? ` - ${i.amount}` : ''), value: `[${i.base_price}](${i.image || "https://playvalorant.com"}) VP\n${(i.type !== 'skin level' ? i.type : '')}`, inline: true }])
			links.push({ name: i.name, preview: i.image || "Could not fetch", type: i.type.split("_").join(" ") })
		})

		let row = new Discord.ActionRowBuilder().addComponents([new Discord.ButtonBuilder().setCustomId("preview").setLabel("Preview skins").setStyle("Secondary")])
		embed.setFooter({ text: "Bundle expires at: " + new Date(bundle.expires_at).toLocaleDateString('en-GB'), iconURL: client.user.displayAvatarURL() })
		if (bundle.description && bundle.extraDescription) embed.addFields([{ name: bundle.description, value: bundle.extraDescription }])
		let m = await send(message, { reply: true, embeds: [embed], components: [row] })

		let page = 0;
		const filter = i => i.user.id === message.author.id
		let col = m.createMessageComponentCollector({ filter, time: 50000, idle: 40000 })
		row = new Discord.ActionRowBuilder()
			.addComponents([new Discord.ButtonBuilder().setEmoji("⬅️").setCustomId("left").setDisabled(true).setStyle("Secondary"), new Discord.ButtonBuilder().setLabel("Preview").setCustomId("preview2").setStyle("Secondary"), new Discord.ButtonBuilder().setEmoji("➡️").setCustomId("right").setStyle("Secondary")])
		col.on("collect", i => {
			if (links[page].type !== 'skin_level') row.components[1].setDisabled(true)
			else row.components[1].setDisabled(false)
			if (i.customId === 'preview') {
				send(i, { edit: true, embeds: [], content: (links[0]?.name || 'No skin to preview') + '\n' + links[0].preview || '', components: [row] })
			} else if (i.customId === 'left') {
				page--;
				if ((page + 1) <= links.length) row.components[2].setDisabled(false)
				if (page <= 0) row.components[0].setDisabled(true)
				if (links[page].type !== 'skin_level') row.components[1].setDisabled(true)
				else row.components[1].setDisabled(false)
				send(i, { edit: true, content: (links[page].name || 'No skin to preview') + '\n' + links[page].preview, components: [row] })
			} else if (i.customId === 'right') {
				page++;
				if ((page + 1) >= links.length) row.components[2].setDisabled(true)
				row.components[0].setDisabled(false)
				if (links[page].type !== 'skin_level') row.components[1].setDisabled(true)
				else row.components[1].setDisabled(false)
				send(i, { edit: true, content: (links[page].name || 'No skin to preview') + '\n' + links[page].preview, components: [row] })
			} else if (i.customId === 'preview2') {
				client.commands.get("skin").execute(client, message, links[page].name.split(" "), send)
				i.deferUpdate()
			}
		})
		col.on("end", () => {
			send(m, { edit: true, components: [] })
		})
	})
}