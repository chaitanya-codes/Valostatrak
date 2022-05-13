module.exports.guildDelete = (client, guild) => {
	if (!guild.name || guild.name === undefined || guild.name === 'undefined') return;
	client.guilds.cache.get("501396018395480065").channels.cache.get("958742750914814034").send(`**LEFT SERVER**\n${guild.name}\nNow at \`${client.guilds.cache.size}\` servers`)
}