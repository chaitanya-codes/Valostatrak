module.exports.info = {
  name: 'evaluate',
  description: "Evaluate code",
  aliases: ["eval"],
  module: "Owner"
}

const Discord = require('discord.js')
const fs = require('fs')

let msg;
const clean = text => {
  if (typeof(text) === "string")
    return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203))
  else
    return text
}
const truncate = (string, length) => {
  if (string.length > length)
    return string.substring(0,length)+'...```';
  else
    return string;
}
const request = require('request');

module.exports.execute = async (client, message, args, send) => {

  if (message.author.id !== '833792409539444746') return message.reply('This command can only be used by the bot owner.')
    const Discord = require('discord.js')
  const modal = new Discord.ModalBuilder()
  .setCustomId('modal')
  .setTitle('Evaluate Code')
  const actionrow = new Discord.ActionRowBuilder().addComponents([new Discord.TextInputBuilder()
    .setCustomId("code")
    .setLabel("Code")
    .setStyle(Discord.TextInputStyle.Paragraph)
    ])
  modal.addComponents([actionrow])
  message.showModal(modal)
  let filt = (i) => i.user.id === message.author.id
  message.awaitModalSubmit({filt, time: 45000})
  .then(async j => {
    j.deferReply()
    let code = j.fields.fields.get('code').data.value
    args = code.split(" ")
    if (!code) return message.followUp("What to eval :/")
      if (args[0] === '--delete') {
       try {
         await message.channel.messages.cache.filter(m => m.author.id === client.user.id).last().delete()
         return await message.delete()
       } catch(e) {
         return;
       }
     } else {
       let onlyExec = false;
       let bot = client;

       let beforeEval = Date.now()
       const evalEmbed = new Discord.EmbedBuilder()
       .setColor('36393E')

       if (['--onlyexec', '--onlyeval', '--evalonly', '--execonly'].includes(args[0].toLowerCase())) {
        onlyExec = true;
        code = code.replace(args[0], "")
      }
      try {
        let evaled = await eval(code)
        if (onlyExec) return;
        let afterEval = Date.now()
        const getType = obj => { return {}.toString
        .call(obj)
        .match(/\s([a-zA-Z]+)/)[1]
        .toLowerCase()
      }
      let type = await getType(evaled)
      if (typeof evaled !== "string") evaled = require("util").inspect(evaled);
      if (evaled == process.env.BOT_TOKEN) {
        await require('node-fetch')('https://some-random-api.ml/bottoken')
        .then(async r => await r.json())
        .then(async r => evaled = r.token)
      }
      if (evaled == process.env.BOT_TOKEN) evaled = 't0ken'
       evalEmbed.setDescription(':inbox_tray: INPUT:```js\n' + code + '```\n :outbox_tray: OUTPUT:\n' + truncate(`\`\`\`js\n${clean(evaled)}\n\`\`\``, (1500 - String(code).length)) + '\n:information_source: Output Type\n```css\n' + type + '\n```')
     evalEmbed.setFooter({text: 'Took ' + (afterEval - beforeEval) + 'ms to evaluate'})
     if ((afterEval - beforeEval) > 200) {
       evalEmbed.setDescription(client.emojis.cache.get('588824651132567677').toString())
       await send(j, {embeds: [evalEmbed]}).then(async msg => {
         evalEmbed.setDescription(':inbox_tray: INPUT:```js\n' + code + '```\n :outbox_tray: OUTPUT:\n' + truncate(`\`\`\`js\n${clean(evaled)}\n\`\`\``, (1500 - String(code).length)) + '\n:information_source: Output Type\n```css\n' + type + '\n```')
         setTimeout(() => {send(msg, {edit: true, embeds: [evalEmbed]})}, 1500)
       })
     } else send(j, {embeds: [evalEmbed]})

     if (evalEmbed.data.description.length >= 1500) {
      const clean = text => {
        if (typeof(text) === "string")
          return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203))
        else
          return text
      }
      await require('fs').writeFile('src/eval.txt', `${clean(evaled)}`, (err, out) => {
        if (err) console.log(err)
      })
      send(msg, {files: ['src/eval.txt']})
    }

  }
  catch (err) {
   evalEmbed.setDescription(':inbox_tray: INPUT:```js\n' + code + '```\n :outbox_tray: ERROR: ```js\n' + clean(err) + '\n```')
   send(j, {embeds: [evalEmbed]})
 }
}
})
}