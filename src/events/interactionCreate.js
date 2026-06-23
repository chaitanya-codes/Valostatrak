const Discord = require('discord.js')
const { InteractionType } = require('discord.js')
const leagues = ["vct_americas", "challengers_na", "game_changers_na", "vct_emea", "vct_pacific", "challengers_br", "challengers_jpn", "challengers_kr", "challengers_latam", "challengers_latam_n", "challengers_latam_s", "challengers_apac", "challengers_sea_id", "challengers_sea_ph", "challengers_sea_sg_and_my", "challengers_sea_th", "challengers_sea_hk_and_tw", "challengers_sea_vn", "valorant_oceania_tour", "challengers_south_asia", "game_changers_sea", "game_changers_series_brazil", "game_changers_east_asia", "game_changers_emea", "game_changers_jpn", "game_changers_kr", "game_changers_latam", "game_changers_championship", "masters", "last_chance_qualifier_apac", "last_chance_qualifier_east_asia", "last_chance_qualifier_emea", "last_chance_qualifier_na", "last_chance_qualifier_br_and_latam", "vct_lock_in", "champions", "vrl_spain", "vrl_northern_europe", "vrl_dach", "vrl_france", "vrl_east", "vrl_turkey", "vrl_cis", "mena_resilence", "challengers_italy", "challengers_portugal"]
const mapInc = require("../utils/mapInc.js");

const embed = (object = {}) => {
	if (object.descriptionLink) object.description = `[${object.description}](${object.descriptionLink})`
	if (object.footer && typeof object.footer !== "object") object.footer = { "text": object.footer }
	if (object.author) object.author = { "name": (object.author.username || object.author), "iconURL": (object.author.displayAvatarURL ? object.author.displayAvatarURL() : null) }
	return new Discord.EmbedBuilder(object)
}

const getSlashArgs = (options = []) => {
	let args = []
	for (const option of options) {
		if (option.options?.length) {
			args.push(option.name)
			args.push(...getSlashArgs(option.options))
		} else if (option.value !== undefined) {
			args.push(String(option.value))
		}
	}

	return args
}

module.exports.Interaction = async (client, interaction) => {
	if (interaction.isChatInputCommand() || interaction.type === InteractionType.ApplicationCommandAutocomplete) {
		let commandName = interaction.commandName
		let args = interaction.options.data

		if (commandName.endsWith("-t")) commandName = commandName.replace("-t", "")

		if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
			const currentValue = interaction.options.getFocused()
			const optionName = interaction.options.getFocused(true).name

			if (!currentValue || currentValue === '') return;

			async function respondFiltered(dataArray, currentValue, respondUsername = false) {
				interaction.respond(dataArray
					.filter(item => item.toLowerCase().startsWith(currentValue.toLowerCase()) || item.toLowerCase().includes(currentValue.toLowerCase()))
					.slice(0, !respondUsername ? 25 : 24)
					.map(item => !respondUsername ? ({ name: item, value: item }) : ({ name: "👤" + item, value: item }))
					.concat((!respondUsername ? [] : [{ name: "Search " + currentValue, value: currentValue }]))
				)
			}

			switch (optionName) {
				case 'agent':
					return client.getAgents()
						.then(agents => respondFiltered(agents.map(a => a.displayName), currentValue))
				case 'skin':
					return client.getSkins()
						.then(skins => respondFiltered(skins.map(s => s.displayName.replace("//", " ")), currentValue))
				case 'buddy':
					return client.getBuddies()
						.then(buddies => respondFiltered(buddies.map(b => b.displayName), currentValue))
				case 'bundle':
					return client.getBundles()
						.then(bundles => respondFiltered(bundles.map(b => b.displayName), currentValue))
				case 'player-card':
					return client.getPlayercards()
						.then(playercards => respondFiltered(playercards.map(p => p.displayName), currentValue))
				case 'player-title':
					return client.getPlayertitles()
						.then(playertitles => respondFiltered(playertitles.map(p => p.displayName), currentValue))
				case 'spray':
					return client.getSprays()
						.then(sprays => respondFiltered(sprays.map(s => s.displayName), currentValue))
				case 'username':
					return client.accounts.map((region, name) => name).then(accounts => respondFiltered(accounts, currentValue, true))
				case 'league':
					return interaction.respond(leagues.filter(l => l.startsWith(currentValue.toLowerCase())).map(l => ({ name: l.split("_").join(" "), value: l })))
				case 'command':
					const commands = client.commands.filter(c => c.info.name !== "help")
					if (!["", " "].includes(currentValue)) return await respondFiltered(commands.map(c => c.info.name), currentValue)
					else return await interaction.respond(commands.map(c => ({ name: c.info.name, value: c.info.name })).slice(0, 25))
				case 'flex':
					return client.getFlex().then(flex => respondFiltered(flex.map(f => f.displayName), currentValue))
				default:
					return;
			}
		}
		args = getSlashArgs(interaction.options.data);

		let command = client.commands.get(commandName) || client.commands.find(cmd => cmd.info.aliases && cmd.info.aliases.includes(commandName))

		if (!command || interaction.type === InteractionType.ApplicationCommandAutocomplete) return;

		if (client.ratelimits.has(interaction.user.id)) {
			let row = new Discord.ActionRowBuilder().addComponents([new Discord.ButtonBuilder().setLabel("Vote on top.gg").setURL("https://top.gg/bot/855083775460769793/vote").setStyle("Link")])
			if (client.ratelimits.get(interaction.user.id) === true) return interaction.reply({ ephemeral: true, embeds: [{ description: "There's a cooldown after using statistics related commands, you need to wait 10 seconds after the command.\n*You can bypass this for 12 hours if you vote using the button below, to reduce cooldown to 3 seconds.*" }], components: [row] })
		} else if (command.info.ratelimit) client.ratelimit(interaction.user.id)

		try {
			interaction.author = interaction.user
			interaction.edit = (o) => interaction.editReply(o);
			interaction.delete = () => { }
			if (interaction.author.id !== "485885170080022556") client.channels.cache.get('958713047852122153').send(`${interaction.author.username} \`(${interaction.author.id})\` used the command \`/${commandName}${args.length ? ' ' + args.join(" ") : ''}\` in server \`${interaction.guild.name}\``)
			//if (command.info.module === 'Statistics' && interaction.options.get("username") && client.linked.find((u, name) => u.private === true && (interaction.author.id !== name))) return interaction.reply("This profile is set to private by the linked account owner\nif this is your account, you can verify that to us in support server")
			await command.execute(client, interaction, args, client.send, client.ratelimit)
			await mapInc(client.statistics, "total_commands");
			await mapInc(client.statistics, "commands", commandName);
			const day = new Date().toISOString().slice(0, 10);
			await mapInc(client.statistics, "daily", day);
		} catch (error) {
			client.channels.cache.get('546320905035579396').send({ embeds: [{ color: 472422, description: `**There was an error in the server \`${interaction.guild.name}\` caused by the user \`${interaction.user.username}\`(${interaction.user.id}) with the command \`${commandName}\`**\n\n*The error was:*\n\`\`\`prolog\n${error}\`\`\`` }] })
			console.error(error)
			await interaction.reply({ content: "There was an error while executing this command!\nPlease try again later", ephemeral: true })
		}
	} else if (interaction.isSelectMenu()) {
		if (interaction.values[0].startsWith("self-role|") && interaction.guild.id === '501396018395480065') {
			let role = interaction.guild.roles.cache.get(interaction.values[0].replace("self-role|", ""))
			if (interaction.member.roles.cache.has(role.id)) {
				interaction.member.roles.remove(role.id)
				return await interaction.reply({ embeds: [embed({ title: "Role removed!", description: role.toString() })], ephemeral: true })
			} else {
				interaction.member.roles.add(role.id)
				return await interaction.reply({ embeds: [embed({ title: "Role added!", description: role.toString() })], ephemeral: true })
			}
		}
		return await interaction.deferUpdate()
	}
}