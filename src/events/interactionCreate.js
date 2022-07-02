const Discord = require('discord.js')

const embed = (object = {}) => {
	if (object.descriptionLink) object.description = `[${object.description}](${object.descriptionLink})`
		if (object.footer && typeof object.footer !== "object") object.footer = {"text": object.footer}
			if (object.author) object.author = {"name": (object.author.username ? object.author.username : object.author), "iconURL": (object.author.displayAvatarURL ? object.author.displayAvatarURL() : null)}
				const embedObject = new Discord.EmbedBuilder(object)
			return {embeds: [embedObject]};
		}
		
const { InteractionType } = require('discord.js')

		module.exports.Interaction = async (client, interaction) => {

			if (interaction.isChatInputCommand() || interaction.type === InteractionType.ApplicationCommandAutocomplete) {
				let commandName = interaction.commandName
				let args = interaction.options.data
				if (commandName.endsWith("-t")) commandName = commandName.replace("-t", "")
					if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
						const currentValue = interaction.options.getFocused()
						const optionName = interaction.options.getFocused(true).name
						if (!currentValue || currentValue === '') return;
						if (optionName === 'skin') return await interaction.respond(client.skins.map(s => { if (s.toLowerCase().startsWith(currentValue.toLowerCase()) || s.toLowerCase().includes(currentValue.toLowerCase())) return {name: s.replace("//", " "), value: s.replace("//", " ")}}).filter(Boolean).slice(0,25))
							else if (optionName === 'buddy') return await interaction.respond(client.buddiesData.map(s => {if (s.displayName.toLowerCase().startsWith(currentValue.toLowerCase()) || s.displayName.toLowerCase().includes(currentValue.toLowerCase())) return {name: s.displayName, value: s.displayName}}).filter(Boolean).slice(0,25))
								else if (optionName === 'bundle') return await interaction.respond(client.bundleData.map(s => {if (s.displayName.toLowerCase().startsWith(currentValue.toLowerCase()) || s.displayName.toLowerCase().includes(currentValue.toLowerCase())) return {name: s.displayName, value: s.displayName}}).filter(Boolean).slice(0,25))
									else if (optionName === 'player-card') return await interaction.respond(client.playercardData.map(s => {if (s.displayName.toLowerCase().startsWith(currentValue.toLowerCase()) || s.displayName.toLowerCase().includes(currentValue.toLowerCase())) return {name: s.displayName, value: s.displayName}}).filter(Boolean).slice(0,25))
										else if (optionName === 'player-title') return await interaction.respond(client.playertitleData.map(s => {if (s.displayName.toLowerCase().startsWith(currentValue.toLowerCase()) || s.displayName.toLowerCase().includes(currentValue.toLowerCase())) return {name: s.displayName, value: s.displayName}}).filter(Boolean).slice(0,25))
											else if (optionName === 'spray') return await interaction.respond(client.sprayData.map(s => {if (s.displayName.toLowerCase().startsWith(currentValue.toLowerCase()) || s.displayName.toLowerCase().includes(currentValue.toLowerCase())) return {name: s.displayName, value: s.displayName}}).filter(Boolean).slice(0,25))
												else if (optionName === 'username') return await interaction.respond((client.accounts.map((region, name) => {if (name.toLowerCase().startsWith(currentValue.toLowerCase()) || name.toLowerCase().includes(currentValue.toLowerCase())) return {name: "👤" + name, value: name}}).filter(Boolean).slice(0,24)).concat([{name: "Search " + currentValue, value: currentValue}]))
													else if (optionName === 'command') return interaction.respond(client.commands.map(a => {if (a.info.name !== 'help' && (a.info.name.toLowerCase().startsWith(currentValue.toLowerCase()) || a.info.name.toLowerCase().includes(currentValue.toLowerCase()))) return{name: a.info.name, value: a.info.name}}).filter(Boolean))
														else return;
												}
												if (args && args.length >= 1) args = args.map(a => a.value || a).flat(Infinity).join(" ").split(" ")
													else args = []
														let command = client.commands.get(commandName) || client.commands.find(cmd => cmd.info.aliases && cmd.info.aliases.includes(commandName))
													if (!command || interaction.type === InteractionType.ApplicationCommandAutocomplete) return;
													if (client.ratelimits.has(interaction.user.id)) {
														let row = new Discord.ActionRowBuilder().addComponents([new Discord.ButtonBuilder().setLabel("Vote on top.gg").setURL("https://top.gg/bot/855083775460769793/vote").setStyle("Link")])
														if (client.ratelimits.get(interaction.user.id) === true) return interaction.reply({ephemeral: true, embeds: [{description: "There's a cooldown after using statistics related commands, you need to wait 10 seconds after the command.\n*You can bypass this for 12 hours if you vote using the button below, to reduce cooldown to 3 seconds.*"}], components: [row]})
													} else if (command.info.ratelimit) client.ratelimit(interaction.user.id)
												try {
													interaction.author = interaction.user
													interaction.edit = (o) => interaction.editReply(o)
													interaction.delete = () => {}
													if (interaction.author.id !== "833792409539444746")	client.channels.cache.get('958713047852122153').send(`${interaction.author.tag} \`(${interaction.author.id})\` used the command \`/${commandName} ${args.join(" ")}\` in server \`${interaction.guild.name}\``)
													//if (command.info.module === 'Statistics' && interaction.options.get("username") && client.linked.find((u, name) => u.private === true && (interaction.author.id !== name))) return interaction.reply("This profile is set to private by the linked account owner\nif this is your account, you can verify that to us in support server")
														await command.execute(client, interaction, args, client.send, client.ratelimit)
												}
												catch (error) {
													client.channels.cache.get('546320905035579396').send({embeds: [{color: 472422, description: `**There was an error in the server \`${interaction.guild.name}\` caused by the user \`${interaction.user.tag}\`(${interaction.user.id}) with the command \`${commandName}\`**\n\n*The error was:*\n\`\`\`prolog\n${error}\`\`\``}]})
													console.error(error)
													await interaction.reply({content: "There was an error while executing this command!", ephemeral: true})
												}
											}
										}