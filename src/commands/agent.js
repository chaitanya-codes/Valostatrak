module.exports.info = {
	name: "agent",
	description: "Get agent info",
	aliases: ["character"],
	usage: ['agent'],
	module: "Game Assets",
	optional: true
}

const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js')

module.exports.execute = async (client, message, args, send) => {

	const data = await client.getAgents()
	data.sort((a, b) => a.displayName.localeCompare(b.displayName))
	const agentName = args[0] ? args.join(" ") : data[0].displayName

	let findAgent = data.find(agent => agent.displayName.toLowerCase() === agentName.toLowerCase())

	if (findAgent && findAgent?.displayName) {
		const row = new ActionRowBuilder()
			.addComponents([new StringSelectMenuBuilder()
				.addOptions(data.map(m => ({
					label: m.displayName.toLowerCase(),
					value: m.displayName.toLowerCase()
				})))
				.setCustomId("agents")
				.setPlaceholder("Select agent")])

		const createEmbed = (agent) => {
			const embed = new EmbedBuilder()
				.setTitle("Agent - " + agent.displayName)
				.setImage(agent.fullPortrait)
				.setColor(387121)
				.setDescription(agent.description)
				.addFields([{
					name: "Role",
					value: `**${agent.role.displayName}**: ${agent.role.description}\n\n**ABILITIES:**`,
					inline: true
				}])
				.setThumbnail(agent.role.displayIcon)
				.setFooter({ text: (agent.characterTags ? agent.characterTags.join(", ") : "No character tags") })
			agent.abilities.forEach(ability => embed.addFields([{ name: ability.displayName, value: `${ability.slot === "Passive" ? "(**Passive**) " : ""}${ability.description}` }]))
			return embed;
		}

		const emb = createEmbed(findAgent)
		const msg = await send(message, { reply: true, embeds: [emb], components: [row] })

		const filter = (interaction) => interaction.user.id === message.author.id
		const coll = msg.createMessageComponentCollector({ filter, time: 76000, errors: ['time'] })

		coll.on("collect", async i => {
			if (i.customId === 'agents') {
				findAgent = data.find(agent => agent.displayName.toLowerCase() === i.values[0].toLowerCase())
				const newEmbed = createEmbed(findAgent)
				send(msg, { edit: true, embeds: [newEmbed] })
			}
		})
	}
}