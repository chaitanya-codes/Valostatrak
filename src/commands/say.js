module.exports.info = {
  name: "say",
  description: "Make the bot say something",
  aliases: ["bot-say", "send"],
  usage: ["text"],
  module: "Other",
}

const Discord = require('discord.js')

module.exports.execute = async (client, message, args, send) => {
  if (message.mentions?.everyone)
    return message.channel.send(message.author.tag + " tried to ping everyone :/")

  message.delete()
  if (!args[0] || args[0] === " ") return message.reply("Usage: `/say <text>`")
  let em = new Discord.EmbedBuilder()
  .setColor(message.member?.roles.highest.color)
  .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL(),})
  .setDescription(args.join(" "))
  send(message, em)
};
