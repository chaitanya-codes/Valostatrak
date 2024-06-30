module.exports.info = {
	name: 'deploy',
	description: "Deploy slash commands",
	aliases: ["dep"],
	usage: ['code'],
	optional: true,
	module: "Owner"
}

const { ApplicationCommandOptionType } = require('discord.js')

const commonArgs = { "user": "User", "role": "Role", "number": "Integer", "avatar": "User", "channel": "Channel", "member": "User" }

const desc = (arg) => {
	if (arg === 'username') return "Username of the player in the format- name#tag"
	else if (arg === 'match-type') return "Sort by gamemode"
	else if (['agent', 'buddy', 'bundle', 'command', 'region', 'skin', 'map', 'player-card', 'player-title', 'spray', 'weapon'].includes(arg)) return arg.charAt(0).toUpperCase() + arg.slice(1) + " name"
	else if (arg === 'text') return "What should I say?"
	else if (arg === 'level') return "Account level"
	else return arg
}

const choicesMap = {
	'region': [{ name: "Asia", value: "ap" }, { name: "North America / LATAM / BR", value: "na" }, { name: "Korea", value: "kr" }, { name: "Europe", value: "eu" }],
	'agent': [],
	'leaderboard': ['global', 'this-server'].map(e => ({ name: e, value: e })),
	'weapon': [],
	'match-type': ['unrated', 'competitive', 'spikerush', 'deathmatch', 'teamdeathmatch', 'replication', 'escalation', 'snowballfight', 'swiftplay', 'premier', 'custom'].map(a => ({ name: a, value: a })),
	'map': [],
	'query': [{ name: 'Find account', value: "find" }, { name: "Link account", value: 'link' }, { name: 'Change account settings', value: 'settings' }],
	'region-esports': ['international', 'north america', 'emea', 'brazil', 'japan', 'korea', 'latin_america', 'latin_america_south', 'latin_america_north', 'southeast_asia', 'vietnam', 'oceania'].map(r => ({ name: r.replace("_", " "), value: r.replace(" ", "_") }))
}

const checkChoices = (arg) => choicesMap[arg] || null;

const data = async (client, guild) => {
	return await client.commands.map(cmd => ({
		name: (guild ? cmd.info.name + '-t' : cmd.info.name),
		description: cmd.info.description || null,
		options: (cmd.info.usage ? cmd.info.usage.map(arg => ({
			name: arg.toLowerCase(),
			description: desc(arg.toLowerCase()),
			autocomplete: (['command', 'username', 'skin', 'buddy', 'bundle', 'player-card', 'player-title', 'spray', 'input', 'league'].includes(arg) ? true : false),
			choices: checkChoices(arg),
			type: (commonArgs[arg] ? ApplicationCommandOptionType[commonArgs[arg]] : ApplicationCommandOptionType.String),
			required: (cmd.info.optional && (arg.toLowerCase() !== "username") ? false : true)
		})) : null)
	}))
}

module.exports.execute = async (client, message, args, send) => {
	if (message.author.id !== '485885170080022556') return message.reply('This command can only be used by the bot owner.')
		
	try {
		await client.getAgents().then(agents => {
			choicesMap['agent'] = agents.map(a => ({ name: a.displayName, value: a.displayName }))
		})
		await client.getWeapons().then(weapons => {
			choicesMap['weapon'] = weapons.map(w => ({ name: w.displayName, value: w.displayName }))
		})
		await client.getMaps().then(maps => {
			choicesMap['map'] = maps.map(a => ({ name: a.displayName, value: a.displayName }))
		})
		
		if (args[0] && args[0] === '--global') {
			client.application.commands.set(await data(client, false))
			send(message, "Deployed slash commands globally!")
		} else if (args[0] && args[0] === '--delete') {
			message.guild.commands.set([])
			send(message, "Deleted slash commands from this server")
		} else {
			message.guild.commands.set(await data(client, true))
			send(message, "Deployed slash commands in this server")
		}
	} catch (e) {
		console.error("Error deploying slash commands: ", e)
		send(message, "An error occured while deploying slash commands.")
	}
}