module.exports.info = {
	name: "map",
	description: "Get map info",
	aliases: ["maps"],
	usage: ["map"],
	module: "Game Assets",
	optional: true
}

const Discord = require('discord.js')

module.exports.execute = async (client, message, args, send) => {

	const maps = await client.getMaps()
	if (!args[0]) args = ['ascent']

	let findMap = maps.find(m => m.displayName.toLowerCase() === args.join(' ').toLowerCase())
	if (!findMap) return send(message, "Map not found.")

	let mapsList = maps.map(m => m.displayName.toLowerCase())
	mapsList = [...new Set(mapsList)].slice(0, 25)
	let row = new Discord.ActionRowBuilder()
		.addComponents([new Discord.StringSelectMenuBuilder()
			.addOptions(mapsList.map(map => ({ label: map, value: map }))).setCustomId("maps").setPlaceholder("Select map")])
	let mapEmb = new Discord.EmbedBuilder()
		.setTitle("Map - " + findMap.displayName)
		.setThumbnail(findMap.splash)
		.setColor(382111)

	if (findMap.displayIcon) mapEmb.setImage(findMap.displayIcon)
	else {
		mapEmb.setDescription("Only preview available ---->")
		mapEmb.setImage(null)
	}
	let msg = await send(message, { embeds: [mapEmb], components: [row] })

	const filter = (interaction) => interaction.user.id === message.author.id
	const collector = msg.createMessageComponentCollector({ filter, time: 76000, errors: ['time'] })
	collector.on("collect", async i => {
		if (i.customId === 'maps') {
			findMap = maps.find(m => m.displayName.toLowerCase() === i.values[0].toLowerCase())
			mapEmb
				.setTitle("Map - " + findMap.displayName)
				.setThumbnail(findMap.splash)
				.setColor(382111)

			if (findMap.displayIcon) {
				mapEmb.setImage(findMap.displayIcon)
				mapEmb.setDescription("** **")
			} else {
				mapEmb.setDescription("Only preview available ---->");
				mapEmb.setImage(null)
			}
			send(msg, { edit: true, embeds: [mapEmb] })
		}
	})
	collector.on("end", () => {
		row.components[0].setDisabled(true)
		msg.edit({ components: [row] })
	})
}