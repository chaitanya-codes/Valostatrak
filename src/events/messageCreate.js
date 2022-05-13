const Discord = require('discord.js')
const escapeRegex = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports.Message = async (client, message) => {
  if (message.author.bot) return;
  let prefix = "v!"
  const prefixRegex = new RegExp(`^(<@!?${client.user.id}> |${escapeRegex(prefix)})\\s*`);
  if (!prefixRegex.test(message.content)) return;
  
  const [, matchedPrefix] = message.content.match(prefixRegex)
  prefix = matchedPrefix

  const args = message.content.slice(prefix.length).split(/ +/g);
  const commandName = args.shift().toLowerCase()
  let command = client.commands.get(commandName) || client.commands.find(cmd => cmd.info.aliases && cmd.info.aliases.includes(commandName))
  if (!command) return;
  if (client.ratelimits.has(message.author.id)) {
    let row = new Discord.ActionRowBuilder().addComponents(new Discord.ButtonBuilder().setLabel("Vote on top.gg").setURL("https://top.gg/bot/855083775460769793/vote").setStyle("LINK"))
    if (client.ratelimits.get(message.author.id) === true && message.author.id !== "833792409539444746") return client.send(message, {embeds: [{description: "There's a cooldown after using statistics related commands, you need to wait 10 seconds after the command.\n*You can bypass this for 12 hours if you vote using the button below, to reduce cooldown to 3 seconds.*"}], components: [row]})
  } else if (command.info.ratelimit) client.ratelimit(message.author.id)
try {
 if (message.author.id !== "833792409539444746") client.channels.cache.get('958713047852122153').send(`${message.author.tag} \`(${message.author.id})\` used the command \`${message.content}\` in server \`${message.guild.name}\``)
   await command.execute(client, message, args, client.send)
 if (message.content.startsWith("v!")) message.channel.send({embeds: [client.embed({title: "Notice", color: 323843, description: "From September 1, 2022, Discord will make message content a privileged intent. This means that I won't able to read messages unless the message mentions me or is in my DMs.\n\nI recommend you to use slash commands (/) or my @ mention to use my commands."})]})
}
catch (error) {
  console.log(error)
  client.channels.cache.get('546320905035579396').send(client.embed({color: 472422, description: `**There was an error in the server \`${message.guild.name}\` caused by the user \`${message.author.tag}\`(${message.author.id}) with the command \`${commandName}\`**\n\n*The error was:*\n\`\`\`prolog\n${error}\`\`\``}), message)
}
}