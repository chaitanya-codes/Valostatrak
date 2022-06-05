module.exports.info = {
	name: "store",
	description: "See the current store collection",
	aliases: ["store-skins", "shop"],
	ratelimit: true,
	module: "Game Assets"
}
const Discord = require('discord.js')
module.exports.execute = async (client, message, args, send) => {

	require('request')(`https://api.henrikdev.xyz/valorant/v1/store-featured`, async (err, res, body) => {
		if (err || JSON.parse(body).status !== 200) return send(message, "There was an error while fetching the store!")
			let data = JSON.parse(body)
		data = data.data
		const featuredBundle = data.FeaturedBundle
		const bundle = client.bundleData.filter(b => b.uuid === featuredBundle.Bundle.DataAssetID)[0]
		if (!bundle) return send(message, "Something went wrong!")
			let links = []
		const embed = new Discord.EmbedBuilder()
		.setColor("Random")
		.setTitle(bundle.displayName)
		.setDescription("Store Featured Bundle")
		.setImage(bundle.displayIcon)
		.setThumbnail(bundle.verticalPromoImage)
		featuredBundle.Bundle.Items.map(i => {
			let find = client.skinLevelData.filter(e => e.uuid === i.Item?.ItemID || null)
			if (find && find[0]) embed.addFields([{name: find[0].displayName + (i.Item.Amount > 1 ? ` - ${i.Item.Amount}` : ''), value: `[${i.BasePrice}](${find[0].streamedVideo}) VP`, inline: true}])
				links.push({name: find[0]?.displayName || '', preview: find[0]?.streamedVideo})
		})
		
		let row = new Discord.ActionRowBuilder().addComponents([new Discord.ButtonBuilder().setCustomId("preview").setLabel("Preview skins").setStyle("Secondary")])
		embed.setFooter({text: "Bundle Remaining Duration: " + new Date(featuredBundle.BundleRemainingDurationInSeconds * 1000).toISOString().substr(11, 8), iconURL: client.user.displayAvatarURL()})
		if (bundle.description && bundle.extraDescription) embed.addFields([{name: bundle.description, value: bundle.extraDescription}])
			let m = await send(message, {embeds: [embed], components: [row]})
		
		let page = 0;
		const filter = i => i.user.id === message.author.id
		let col = m.createMessageComponentCollector({filter, time: 50000, idle: 40000})
		col.on("collect", i => {
			row = new Discord.ActionRowBuilder()
			.addComponents([new Discord.ButtonBuilder().setEmoji("⬅️").setCustomId("left").setDisabled(true).setStyle("Secondary"), new Discord.ButtonBuilder().setEmoji("➡️").setCustomId("right").setStyle("Secondary")])

			if (i.customId === 'preview') {
				send(i, {edit: true, embeds: [], content: (links[0]?.name || 'No skin to preview') + '\n' + links[0].preview || '', components: [row]})
			} else if (i.customId === 'left') {
				page--;
				if ((page + 1) <= links.length) row.components[1].setDisabled(false)
					if (page <= 0) row.components[0].setDisabled(true)
						send(i, {edit: true, embeds: [], content: (links[page].name || 'No skin to preview') + '\n' + links[page].preview || '', components: [row]})
				} else if (i.customId === 'right') {
					page++;
					if ((page + 1) >= links.length) row.components[1].setDisabled(true)
						row.components[0].setDisabled(false)
					send(i, {edit: true, embeds: [], content: (links[page].name || 'No skin to preview') + '\n' + links[page].preview || '', components: [row]})
				}

			})
		col.on("end", () => {
			send(m, {edit: true, components: []})
		})
	})
}