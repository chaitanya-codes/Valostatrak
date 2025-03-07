module.exports.info = {
	name: "account",
	description: "View account level of any user",
	aliases: ["account-level", "level-account", "level", "acc"],
	usage: ['query', 'username'],
	ratelimit: true,
	module: "Statistics"
}

const Discord = require('discord.js')

module.exports.execute = async (client, message, args, send) => {
	let subcommand = args[0].toLowerCase()
	args.shift()

	let [name, tag] = args.join(" ").toLowerCase().split("#")
	if (!args.join(" ").includes("#") || !name || !tag) return message.reply("Account not found. Use the format name#tag")

	let region = client.accounts.get(args.join(" ").toLowerCase())

	if (!region && subcommand !== 'link') return client.newUser(args.join(" "), this.info.name, message, subcommand)

	if (subcommand === 'find') {
		await findAccount(client, name, tag, message, send)
	} else if (subcommand === 'link') {
		await linkAccount(client, name, tag, message, send)
	} else if (subcommand === 'settings') {
		await accountSettings(client, name, tag, message, send)
	}
}

async function findAccount(client, name, tag, message, send) {
	if (!client.linked.has(name+"#"+tag)) return send(message, { embeds: [client.embed({ color: '417543', title: "Account not linked", description: "This account is not linked with the bot!\nIf this is your account use `/account Link account`" })] })

	const linked = client.linked.get(name+"#"+tag)
	if (linked.private) return send(message, "Account is set to private by owner")

	let wait = new Discord.EmbedBuilder()
	.setColor(428985)
	.setTitle("Searching...")
	let msg = await send(message, { reply: true, embeds: [wait] })

	const response = await fetchAccountData(name, tag)

	if (!response || response.status !== 200) return send(message, client.notFound(response?.message || "Account not found."))
		const data = response.data
	if (!data) return send(message, client.notFound(response?.message || "No data found for account."))

	const levelborders = await client.getLevelborders()
	const statEmbed = new Discord.EmbedBuilder()
	.setColor(342852)
	.setTitle(`Account - ${name}#${tag}`)
	.setDescription(`**Account Level**: ${data.account_level}\n**Region**: ${data.region}`)
	.setFooter({ text: "To view match history, use /matches command" })
	.setImage(data.card?.large)
	.setThumbnail(levelborders.find(border => border.startingLevel == (Math.floor(data.account_level / 20) * 20))?.levelNumberAppearance || levelborders.find(border => border.startingLevel == 1)?.levelNumberAppearance)
	send(msg, { edit: true, embeds: [statEmbed] })
}

async function linkAccount(client, name, tag, message, send) {
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

	const response = await fetchAccountData(name, tag)

	if (!response || response.status !== 200) return send(message, client.notFound(response?.message || "Account not found."))

	const data = response.data
	if (!data) return send(message, client.notFound(response?.message || "No data found for the account."))

	message.showModal(modal)

	const filter = i => i.user.id === message.author.id
	message.awaitModalSubmit({ filter, time: 30000 })
	.then(interaction => {
		let lvl = interaction.fields.getTextInputValue('lvl')
		if (isNaN(lvl)) return send(interaction, 'Level entered was not a number!')

		if (data.account_level === Number(lvl)) {
			client.linked.set(name + "#" + tag, { id: message.author.id, private: false })
			send(interaction, { embeds: [new Discord.EmbedBuilder().setTitle("Linked account").setColor("Green").setDescription(`Your discord account has been linked to the valorant account \`${name}#${tag}\``)] })
		} else return send(interaction, { embeds: [new Discord.EmbedBuilder().setTitle("Failed verification").setColor("Red").setDescription("Account level did not match")] })
	})
}

async function accountSettings(client, name, tag, message, send) {
	const nametag = `${name}#${tag}`
	const linked = client.linked.get(nametag)

	if (!linked || linked.id !== message.author.id) return send(message, "You have not linked your valorant account with the bot!")

	const row = new Discord.ActionRowBuilder().addComponents([
		new Discord.ButtonBuilder().setCustomId("private").setLabel(linked.private ? "Statistics are private" : "Statistics are public").setStyle(linked.private ? "Danger" : "Primary"),
		new Discord.ButtonBuilder().setCustomId("remove").setLabel("Remove account from bot").setStyle("Secondary")
	])

	const emb = new Discord.EmbedBuilder()
		.setTitle("Account Settings")
		.setDescription("Statistics by default are set to be public which allows anyone to view your account info, however you can turn this off to only let you see your account statistics.\nYou can re-link your account by removing the linked account if you edited username.")
	
	const m = await send(message, { embeds: [emb], components: [row] })

	const filter = (i) => i.user.id === message.author.id
	const col = m.createMessageComponentCollector({ filter, time: 30000 })
	col.on("collect", async i => {
		if (i.customId === 'private') {
			client.linked.set(nametag, !linked.private, 'private')
			row.components[0].setStyle(!linked.private ? "Danger" : "Primary")
			row.components[0].setLabel(!linked.private ? "Statistics are private" : "Statistics are public")
			row.components[0].setDisabled(true)
			send(i, { edit: true, components: [row] })
		} else if (i.customId === 'remove') {
			client.accounts.delete(nametag)
			client.linked.delete(nametag)
			send(i, 'Removed account from the bot database!')
		}
	})
}

async function fetchAccountData(name, tag) {
	return new Promise((resolve, reject) => {
		require('request')({ url: `http://api.henrikdev.xyz/valorant/v1/account/${encodeURIComponent(name)}/${tag}`, headers: { "Authorization": process.env.HD_KEY } }, async (err, res, body) => {
			if (err) {
				console.error(err)
				return reject(err)
			}
			resolve(JSON.parse(body))
		})
	})
}