module.exports.info = {
  name: 'deploy',
  description: "Deploy slash commands",
  aliases: ["dep"],
  usage: ['code'],
  optional: true,
  module: "Owner"
}

const Discord = require('discord.js')
const { ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js')

module.exports.execute = async (client, message, args, send) => {

  if (message.author.id !== '485885170080022556') return message.reply('This command can only be used by the bot owner.')
    
    const commonArgs = { "user": "User", "role": "Role", "number": "Integer", "avatar": "User", "channel": "Channel", "member": "User"}
    
    const checkChoices = (arg) => {
      if (arg === 'region') return [{name: "Asia", value: "ap"}, {name: "North America / LATAM / BR", value: "na"}, {name: "Korea", value: "kr"}, {name: "Europe", value: "eu"}, ]
        else if (arg === 'agent') return client.agentData.map(a => {return{name: a.displayName, value: a.displayName}})
          else if (arg === 'leaderboard') return ['global', 'this-server'].map(e => {return{name: e, value: e}})
            else if (arg === 'weapon') return client.weaponData.map(a => {return{name: a.displayName, value: a.displayName}})
              else if (arg === 'match-type') return ['unrated', 'competitive', 'spikerush', 'deathmatch', 'replication', 'escalation', 'snowball', 'custom'].map(a => {return{name: a, value: a}})
                else if (arg === 'map') return client.mapData.map(a => {return{name: a.displayName, value: a.displayName}})
                  else if (arg === 'query') return [{name: 'Find an account', value: "find"}, {name: "Link your account", value: 'link'}, {name: 'Change settings for your linked account', value: 'settings'}]
                    else if (arg === 'region-esports') return ['international', 'north america', 'emea', 'brazil', 'japan', 'korea', 'latin_america', 'latin_america_south', 'latin_america_north', 'southeast_asia', 'vietnam', 'oceania'].map(r => {return{name: r.replace("_", " "), value: r.replace(" ", "_")}})                      
                      else return null;
                }
                const desc = (arg) => {
                  if (arg === 'username') return "Username of the player in the format- name#tag"
                    else if (arg === 'match-type') return "Sort by gamemode"
                      else if (['agent', 'buddy', 'bundle', 'command', 'region', 'skin', 'map', 'player-card', 'player-title', 'spray', 'weapon'].includes(arg)) return arg.charAt(0).toUpperCase() + arg.slice(1) + " name"
                        else if (arg === 'text') return "What should I say?"
                          else if (arg === 'level') return "Account level"
                            else return arg
                        }

                        const data = async (guild) => {
                          return await client.commands.map(cmd => {
                            return {
                              name: (guild ? cmd.info.name + '-t' : cmd.info.name),
                              description: cmd.info.description || null,
                              options: (cmd.info.usage ? cmd.info.usage.map(arg => {return {name: arg.toLowerCase(), description: desc(arg.toLowerCase()), autocomplete: (['command', 'username', 'skin', 'buddy', 'bundle', 'player-card', 'player-title', 'spray', 'input', 'league'].includes(arg) ? true : false), choices: checkChoices(arg), type: (commonArgs[arg] ? ApplicationCommandOptionType[commonArgs[arg]] : ApplicationCommandOptionType.String), required: (cmd.info.optional && (arg.toLowerCase() !== "username") ? false : true)}}) : null)
                            }
                          })
                        }

                        if (args[0] && args[0] === '--global') {
                          client.application.commands.set(await data(false))
                          send(message, "Deployed slash commands globally!")
                        } else if (args[0] && args[0] === '--delete') {
                          message.guild.commands.set([])
                          send(message, "Deleted slash commands from this server")
                        } else {
                          message.guild.commands.set(await data(true))
                          send(message, "Deployed slash commands in this server")
                        }
                      }