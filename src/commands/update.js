module.exports.info = {
	name: "update",
	description: "View latest patch-notes and news",
	aliases: ["patch-notes", "news"],
	ratelimit: true,
	module: "Game Assets"
}

const request = require('request');
const Discord = require('discord.js')

module.exports.execute = async (client, message, args, send) => {

	require('request')({ url: `https://api.henrikdev.xyz/valorant/v1/website/en-us`, headers: { "Authorization": process.env.HD_KEY } }, async (err, res, body) => {

		if (err || JSON.parse(body).status !== 200) return send(message, client.notFound(JSON.parse(body).message))
		let data = JSON.parse(body).data
	
		let row = new Discord.ActionRowBuilder()
			.addComponents([new Discord.ButtonBuilder().setEmoji("⬅️").setCustomId("left").setDisabled(true).setStyle("Secondary"), new Discord.ButtonBuilder().setEmoji("➡️").setCustomId("right").setStyle("Secondary")])
		let row2 = new Discord.ActionRowBuilder()
			.addComponents([new Discord.ButtonBuilder().setLabel("View on valorant website").setStyle("Link").setURL("https://discord.com"), new Discord.ButtonBuilder().setLabel("YouTube video").setStyle("Link").setURL("https://youtube.com")])

		let page = 0
		let emb = new Discord.EmbedBuilder()
			.setTitle("Latest News | VALORANT")

		const updateInfo = () => {
			emb.setDescription(data[page].title)
			emb.setImage(data[page].banner_url)
			emb.setFooter({ text: data[page].category })
			row2.components[0].setURL(data[page].url)
			if (data[page].external_link) row2.components[1].setURL(data[page].external_link)
			else row2.components[1].setURL("https://this-news-has-no-youtube-video.com")
		}

		updateInfo()

		let cl = await send(message, { embeds: [emb], components: [row, row2] })

		let filter = i => i.user.id === message.author.id
		let coll = cl.createMessageComponentCollector({ filter, time: 80000, errors: ['time'] })
		coll.on('collect', async i2 => {
			if (i2.customId === 'left') {
				page--;
				if ((page + 1) <= data.length) row.components[1].setDisabled(false)
				if (page <= 0) row.components[0].setDisabled(true)
				await updateInfo()
				send(i2, { edit: true, embeds: [emb], components: [row, row2] })
			} else if (i2.customId === 'right') {
				page++;
				if ((page + 1) >= data.length) row.components[1].setDisabled(true)
				row.components[0].setDisabled(false)
				await updateInfo()
				send(i2, { edit: true, embeds: [emb], components: [row, row2] })
			}
		})


	})
}