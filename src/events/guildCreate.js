module.exports.guildCreate = (client, guild) => {
	client.guilds.cache.get("501396018395480065").channels.cache.get("958742750914814034").send(`**JOINED SERVER**\n${guild.name}\nNow at \`${client.guilds.cache.size}\` servers`)
}