module.exports.info = {
	name: "account",
	description: "View account level of any user",
	aliases: ["account-level", "level-account", "level", "acc"],
	usage: ['query', 'username'],
	ratelimit: true,
	module: "Statistics"
}

const request = require('request');
const Discord = require('discord.js')

module.exports.execute = async (client, message, args, send) => {
	let subcommand = args[0].toLowerCase()
	args.shift()

	let name = args.join(" ").split("#").shift()
	let tag = args.join(" ").split("#").pop()
  if (!args.join(" ").includes("#")) return message.reply("Account not found. Use the format name#tag")
	let region;

	if (client.accounts.has(args.join(" ").toLowerCase())) region = client.accounts.get(name.toLowerCase())
		else return client.newUser(args.join(" "), this.info.name, message, subcommand)

	if (subcommand === 'find') {
	    if (!client.linked.has(args.join(" ").toLowerCase())) return send(message, {embeds: [client.embed({color: '417543', title: "Account not linked", description: "This account is not linked with the bot!\nIf this is your account use `/account Link account`"})]})
			let linked = client.linked.get(args.join(" ").toLowerCase())
      if (linked.private) return send(message, "Account is set to private by owner")
      let mm;
			let wait = new Discord.EmbedBuilder()
			.setColor(428985)
			.setTitle("Searching...")
			await send(message, {reply: true, embeds: [wait]})
			.then(m => mm = m)
			require('request')({url: `http://api.henrikdev.xyz/valorant/v1/account/${name}/${tag}`, headers: {"Authorization": process.env.HD_KEY}}, async (err, res, body) => {

				if (err || JSON.parse(body).status !== 200) return send(message, client.notFound(JSON.parse(body).message))
					let data = JSON.parse(body)
				data = data.data
				if (!data) return send(message, client.notFound(JSON.parse(body).message))

					let statEmbed = new Discord.EmbedBuilder()
				.setColor(342852)
				.setTitle("Account  - " + name + "#" + tag)
				.setDescription("**Account Level**: " + data.account_level + "\n**Region**: " + data.region)
				.setFooter({text: "To view match history, use /matches command"})
				.setImage(data.card?.large)
				.setThumbnail(client.levelborderData.filter(border => border.startingLevel == (Math.floor(data.account_level / 20) * 20))[0].levelNumberAppearance || client.levelborderData.filter(border => border.startingLevel ==1)[0].levelNumberAppearance)
				send(mm, {edit: true, embeds: [statEmbed]})
			})
		}
		else if (subcommand === 'link') {
			const Discord = require('discord.js')
			const modal = new Discord.ModalBuilder()
			.setCustomId('modal')
			.setTitle('Verification')
			const actionrow = new Discord.ActionRowBuilder().addComponents([new Discord.TextInputBuilder()
				.setCustomId("lvl")
				.setLabel("What is your account level? (verification)")
				.setStyle(Discord.TextInputStyle.Short)
				])
			modal.addComponents([actionrow])
			let filt = (i) => i.user.id === message.author.id
			message.showModal(modal)
			message.awaitModalSubmit({filt, time: 30000})
			.then(j => {
				let fields = j.fields.fields
				let lvl = fields.get('lvl').value
				if (isNaN(lvl)) return send(j, 'Level entered was not a number!')

					require('request')(`http://api.henrikdev.xyz/valorant/v1/account/${name}/${tag}`, async (err, res, body) => {

						if (err || JSON.parse(body).status !== 200) return send(message, client.notFound(JSON.parse(body).message))
							let data = JSON.parse(body)
						data = data.data
						if (!data) return send(message, client.notFound(JSON.parse(body).message))

							if (data.account_level===Number(lvl)) {
								client.linked.set(name+"#"+tag, {id: message.author.id, private: false})
								send(j, {embeds: [new Discord.EmbedBuilder().setColor("Green").setTitle("Linked account").setDescription("Your discord account has been linked to the valorant account `" + name + "`")]})
							} else return send(j, {embeds: [new Discord.EmbedBuilder().setTitle("Failed verification").setDescription("Account level did not match").setColor("Red")]})
						})
			})
		} 
		else if (subcommand === 'settings') {
			let nametag = name+'#'+tag
			let linked = client.linked.get(nametag)
			if (linked.id !== message.author.id) return send(message, "You have not linked your valorant account with the bot!")
				const row = new Discord.ActionRowBuilder().addComponents([new Discord.ButtonBuilder().setCustomId("private").setLabel("Statistics are public").setStyle("Primary"), new Discord.ButtonBuilder().setCustomId("remove").setLabel("Remove account from bot").setStyle("Secondary")])
			if (linked.private) row.components[0].setLabel("Statistics are private").setStyle("Danger")
				const emb = new Discord.EmbedBuilder().setTitle("Account Settings").setDescription("Statistics by default are set to be public which allows anyone to view your account info, however you can turn this off to only let you see your account statistics.\nYou can re-link your account by removing the linked account if you edited username.")
			let m = await send(message, {embeds: [emb], components: [row]})
			let filt = (i) => i.user.id === message.author.id
			let col = m.createMessageComponentCollector({filt, time: 30000})
			col.on("collect", async i => {
				if (i.customId === 'private') {
					if (!linked.private) client.linked.set(nametag, true, 'private')
						else await client.linked.set(nametag, false, 'private')
					linked = client.linked.get(nametag)
					send(i, 'Changed your linked account statistics to: ' + (linked.private ? '`PRIVATE`' : '`PUBLIC`'))
				}
				else if (i.customId === 'remove') {
					client.accounts.delete(nametag)
					send(i, 'Removed account from the bot database!')
				}
			})
		}
	}