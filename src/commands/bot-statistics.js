module.exports.info = {
	name: 'bot-statistics',
	description: 'View the bot\'s current statistics',
	aliases: ['about', 'bot-stats', 'info'],
	cooldown: 12,
	module: "Other"
}

module.exports.execute = async (client, message, args, send) => {

	let uptimeOfBot = client.uptime
	if (uptimeOfBot < 60) uptimeOfBot = `00:00:${uptimeOfBot.toFixed(0)}`
		else uptimeOfBot = new Date(client.uptime).toISOString().substr(11, 8)

			let memory = (process.memoryUsage().rss / 1048576).toFixed()
		const Discord = require('discord.js')
		const embed2 = new Discord.EmbedBuilder()
		.setColor('36393E')
		.setDescription('[Invite Bot](' + require("../info.json").bot.invite + ') • [Website](https://valostatrak.cf) • [Vote](https://top.gg/bot/855083775460769793/vote)')

		const stats = new Discord.EmbedBuilder()
		.setColor('828329')
		.setTitle("Bot Statistics")
.setDescription("*Valostatrak is a bot that can be used to view player statistics for Valorant, and in-game assets*\n\n:bust_in_silhouette:**Author**: ExceedFlame#4950\n" + ":vhs:**Servers**: " + client.guilds.cache.size +  "\n:file_cabinet:**Channels**: " + client.channels.cache.size + "\n:busts_in_silhouette:**Users**: " + client.guilds.cache.reduce((a, guild) => a+ guild.memberCount, 0) + " (Inaccurate)\n:books:**Library:** discord.js@" + require('discord.js').version + "\n:beginner:**Commands:** " + client.commands.size +"\n:alarm_clock:**Uptime**: " + uptimeOfBot + "\n:heartbeat:**Heartbeat (ping)**: " + Math.round(client.ws.ping) + "ms\n:floppy_disk:**Memory being used currently**: " + `${memory}MB` /*(${((memory / 512) * 100).toFixed(1)}%)*/)  // `[${(process.memoryUsage().rss / 1048576).toFixed()}MB]`
.setImage(`https://discordbots.org/api/widget/${client.user.id}.png?usernamecolor=18b2d4&topcolor=000000&middlecolor=1a1d23&datacolor=18d498`)
.setFooter({text: 'Bot developed by ExceedFlame#0435'})
send(message, {embeds: [stats, embed2]})

}