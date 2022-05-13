module.exports.info = {
  name: 'reload',
  description: "Reload a command's file",
  aliases: ["command-reload", "reload-command", "command-update", "update-command"],
  usage: ['command'],
  module: "Owner"
}

const fs = require('fs')

module.exports.execute = async (client, message, args, send) => {
  if (message.author.id !== "833792409539444746") return send(message, 'This command can only be used by the bot owner to reload commands (This command is not for reloading a gun lol).')
    let loading = client.emojis.cache.get("588824651132567677").toString()
  let checkMark = client.emojis.cache.get('529719527999537162').toString()

  let commandName = args[0].toLowerCase()
  let search = client.commands.get(commandName) || client.commands.find(cmd => cmd.info.aliases && cmd.info.aliases.includes(commandName))
  if (!search) return send(message, "Command not found.")

    try {
      let load = await client.embed({title: "Reloading", description: loading})
      let msg = await send(message, load)
      delete require.cache[require.resolve(`./${search.info.name}.js`)]
      await client.commands.delete(search.info.name)
      const reloaded = require(`./${search.info.name}.js`)
      await message.client.commands.set(reloaded.info.name, reloaded)
      send(msg, {edit: true, embeds: client.embed({title: "Reloaded!", color: "948939"})})
    } catch(e) {
      send(message, client.embed({title: "There was an error while reloading " + search.info.name, description: "```\n" + e + "```"}))
    }
  }