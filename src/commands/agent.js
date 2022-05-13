module.exports.info = {
	name: "agent",
	description: "Get agent info",
	aliases: ["character"],
	usage: ['agent'],
	module: "Game Assets"
}

module.exports.execute = async (client, message, args, send) => {

let data = client.agentData
if (!args[0]) args = ['astra']
	let agentName = args.join(" ")
let findAgent = data.filter(agent => agent.displayName.toLowerCase() === agentName.toLowerCase())

let Discord = require('discord.js')

if (findAgent && findAgent[0]?.displayName) {
	findAgent = findAgent[0]
	let row = new Discord.ActionRowBuilder()
	.addComponents(new Discord.SelectMenuBuilder().addOptions(data.map(m => {return {label: m.displayName.toLowerCase(), value: m.displayName.toLowerCase()}})).setCustomId("agents").setPlaceholder("Select agent"))

	let emb = new Discord.EmbedBuilder()
	.setTitle("Agent - " + findAgent.displayName)
	.setImage(findAgent.fullPortrait)
	.setColor(387121)
	.setDescription(findAgent.description)
	.addField("Role", "**" + findAgent.role.displayName + "**: " + findAgent.role.description + "\n\n**ABILITIES:**", true)
	findAgent.abilities.forEach(ability => emb.addField(ability.displayName, (ability.slot === "Passive" ? "(**Passive**) " : "") + ability.description))
	emb.setThumbnail(findAgent.role.displayIcon)
	emb.setFooter((findAgent.characterTags ? findAgent.characterTags.join(", ") : "No character tags"))
	let msg = await send(message, {reply: true, embeds: [emb], components: [row]})
	let filter = (interaction) => interaction.user.id === message.author.id
	let coll = msg.createMessageComponentCollector({filter, time: 76000, errors: ['time']})
	coll.on("collect", i => {
		if (i.customId === 'agents') {
			findAgent = data.filter(agent => agent.displayName.toLowerCase() === i.values[0].toLowerCase())[0]
			emb = new Discord.EmbedBuilder()
			.setTitle("Agent - " + findAgent.displayName)
			.setImage(findAgent.fullPortrait)
			.setColor(387121)
			.setDescription(findAgent.description)
			.addField("Role", "**" + findAgent.role.displayName + "**: " + findAgent.role.description + "\n\n**ABILITIES:**", true)
			findAgent.abilities.forEach(ability => emb.addField(ability.displayName, (ability.slot === "Passive" ? "(**Passive**) " : "") + ability.description))
			emb.setThumbnail(findAgent.role.displayIcon)
			emb.setFooter((findAgent.characterTags ? findAgent.characterTags.join(", ") : "No character tags"))
			send(msg, {edit: true, embeds: [emb]})
		}
	})
} else return send(message, "Agent not found. Usage: `v!agent <agent>`\nExample: `v!agent Phoenix`")
}