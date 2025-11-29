module.exports.info = {
    name: 'flex',
    description: "Preview flex inventory item",
    aliases: ["flex-item"],
	usage: ['flex'],
    module: "Game Assets"
}

const Discord = require('discord.js')

module.exports.execute = async (client, message, args, send) => {
    if (!args[0]) return send(message, "Command usage: `/flex <flex-item>`\nUse /flex list to get a list of all in-game flex")

    const data = await client.getFlex()
    let findFlex = data.find(flex => flex.displayName.toLowerCase() === args.join(" ").toLowerCase());
    if (args[0].toLowerCase() === 'list') {
        let l = data.map(s => s.displayName).join("`, `")
        let embeds = []
        for (var i = 0; i < l.length; i += 2046) {
            embeds.push(new Discord.EmbedBuilder().setDescription("`" + l.substring(i, i + 2046) + "`").setColor(371313))
        }
        return send(message, { embeds: embeds })
    } else if (findFlex && findFlex?.displayName) {
        const emb = new Discord.EmbedBuilder()
            .setTitle(findFlex.displayName)
            .setImage(findFlex.displayIcon)
            .setColor(288422)
        send(message, { embeds: [emb] })
    } else return send(message, "Flex not found. Command usage: `/flex <flex name>`\nIf you want to see the list of all flex, type `/flex list`")
}