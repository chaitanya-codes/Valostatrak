module.exports.info = {
  name: "map",
  description: "Get map info",
  aliases: ["maps"],
  usage: ["map"],
  module: "Game Assets",
  optional: true
}

const Discord = require('discord.js')

module.exports.execute = async (client, message, args, send) => {
  let maps = client.mapData
  if (!args[0]) args = ['ascent']

    let findMap = maps.filter(m => m.displayName.toLowerCase() === args.join(' ').toLowerCase())[0]
  if (!findMap) return send(message, "Map not found.")
    let row = new Discord.ActionRowBuilder()
  .addComponents(new Discord.SelectMenuBuilder().addOptions(maps.map(m => {return {label: m.displayName.toLowerCase(), value: m.displayName.toLowerCase()}})).setCustomId("maps").setPlaceholder("Select map"))
  let mapEmb = new Discord.EmbedBuilder()
  .setTitle("Map - " + findMap.displayName)
  .setThumbnail(findMap.splash)
  .setColor(382111)
  if (findMap.displayIcon) mapEmb.setImage(findMap.displayIcon)
    else {
      mapEmb.setDescription("Only preview available ---->")
      mapEmb.setImage(null)
    }
    let msg = await send(message, {embeds: [mapEmb], components: [row]})
    let filter = (interaction) => interaction.user.id === message.author.id
    let coll = msg.createMessageComponentCollector({filter, time: 76000, errors: ['time']})
    coll.on("collect", i => {
      if (i.customId === 'maps') {
        findMap = maps.filter(m => m.displayName.toLowerCase() === i.values[0].toLowerCase())[0]
        mapEmb.setTitle("Map - " + findMap.displayName).setThumbnail(findMap.splash).setColor(382111)
        if (findMap.displayIcon) {mapEmb.setImage(findMap.displayIcon); mapEmb.description = undefined}
        else {mapEmb.setDescription("Only preview available ---->");mapEmb.image = undefined}
        send(msg, {edit: true, embeds: [mapEmb]})
      }
    })
  }