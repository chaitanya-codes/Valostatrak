module.exports.info = {
	name: 'bot-statistics',
	description: 'View the bot\'s current statistics',
	aliases: ['about', 'bot-stats', 'info'],
	cooldown: 12,
	module: "Other"
}

module.exports.execute = async (client, message, args, send) => {
	const ms = client.uptime;
	const uptime = new Date(ms).toISOString().substr(11, 8);

	const memory = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);

	const totalCommands = await client.statistics.get("total_commands") || 0;
	const today = new Date().toISOString().slice(0, 10);
	const daily = await client.statistics.get("daily") || {};
	const todayCommands = daily[today] || 0;

	const Discord = require('discord.js')
	const embed2 = new Discord.EmbedBuilder()
		.setColor('36393E')
		.setDescription('[Invite Bot](' + require("../info.json").bot.invite + ') • [Website](https://valostatrak.cf) • [Vote](https://top.gg/bot/855083775460769793/vote)')

	const stats = new Discord.EmbedBuilder()
		.setColor('828329')
		.setTitle("Bot Statistics")
		.addFields(
			{
				name: "💠 General",
				value:
				`- 📼 **Servers:** ${client.guilds.cache.size}\n` +
				`- 🗄️ **Channels:** ${client.channels.cache.size}\n` +
				`- 👥 **Users:** ${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)}\n`,
			},
			{
				name: "⚡ Performance",
				value:
				`- 🏓 **Ping:** ${Math.round(client.ws.ping)}ms\n` +
				`- ⏰ **Uptime:** ${uptime}\n` +
				`- 💾 **Memory:** ${memory} MB\n` +
				`- 📚 **Library:** discord.js@${Discord.version}\n`,
			},
			{
				name: "📈 Usage Analytics",
				value:
				`- 🔰 Commands: ${client.commands.size}\n` +
				`- 🔢 **Commands used:** ${totalCommands.toLocaleString()} (${todayCommands} today)\n`
			}
		)
		.setImage(`https://discordbots.org/api/widget/${client.user.id}.png?usernamecolor=18b2d4&topcolor=000000&middlecolor=1a1d23&datacolor=18d498`)
		.setThumbnail(client.user.displayAvatarURL({ size: 256 }))
		.setFooter({ text: 'Bot developed by @ExceedFlame' })
		.setTimestamp();

	send(message, { embeds: [stats, embed2] })
}