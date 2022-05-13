module.exports.info = {
	name: "help",
	description: "Get help with the bot's commands",
	aliases: ["help-bot", "commands"],
  usage: ["command"],
  optional: true,
  module: "Other"
}
const Discord = require('discord.js')
module.exports.execute = async (client, message, args, send) => {

const sortedCmds = {}
const sortCmds = client.commands.forEach(c => {
  let text = '[`/' + c.info.name + '`](https://valorant-api.com)'
  if (sortedCmds[c.info.module]) sortedCmds[c.info.module].push(text)
    else sortedCmds[c.info.module] = [text]
})
let helpEmb = new Discord.EmbedBuilder()
.setColor(753221)
.setTitle("Commands")
.setFooter("Most commands powered by https://valorant-api.com")
Object.keys(sortedCmds).forEach((key, n) => helpEmb.addField(key, (key === "Other" ? sortedCmds[key].join(", ") : sortedCmds[key].join("\n")), true))
if (!args[0]) send(message, {embeds: [helpEmb]})
else {
  const { commands } = client
  const name = args[0].toLowerCase();
let command = commands.get(name) || commands.find(c => c.info.aliases && c.info.aliases.includes(name))
if (!command) {
 let unknownCommand = new Discord.EmbedBuilder()
 .setColor(633333)
 .setDescription('"' + args[0] + '" command/module was not found.')
 return send(message, {embeds: [unknownCommand]})
}
command = command.info
const data = []
data.push(`**Command:** ${command.name}`);
if (command.description) data.push(`**Description:** ${command.description}`)
  if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(', ')}`)
    if (command.usage) data.push(`**Usage:** /${command.name} ${command.usage.map(p => (p.startsWith("_") ? `[${p}]` : `<${p}>`)).join(" ")}`)
      if (command.cooldown) data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`)
        if (command.permissions) data.push(`**Permissions required:** \`${command.permissions.map(p => p).join("`, `")}\``)
          const help = new Discord.EmbedBuilder()
        .setColor('#00FF0')
        .setTitle(`Command Info`)
        .setDescription(data.join("\n"))
        send(message, {embeds: [help]})
  
}
}