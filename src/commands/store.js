module.exports.info = {
	name: "store",
	description: "Check your store skin rotation",
	aliases: ["skins-rotation", "shop"],
	args: ['region'],
	ratelimit: true,
	module: "Game Assets"
}

const Discord = require('discord.js')
const Valorant = require('@liamcottle/valorant.js')
let valorantApi = new Valorant.API(Valorant.Regions.AsiaPacific)
const { Languages, ContentAPI } = require('@liamcottle/valorant.js')
const content = new ContentAPI(Languages.English)

module.exports.execute = async (client, message, args, send) => {

  let region = args[0]
	if (region !== 'ap') {
		valorantApi = new Valorant.API(region)
	}

	const modal = new Discord.ModalBuilder()
	.setTitle("Login to your valorant account")
	.setCustomId("login")

	const actionrow = [new Discord.TextInputBuilder()
	.setCustomId("username")
	.setLabel("Enter the username you use to login")
	.setStyle(Discord.TextInputStyle.Short), new Discord.TextInputBuilder()
	.setCustomId("password")
	.setLabel("Enter the password you use to login")
	.setStyle(Discord.TextInputStyle.Short), new Discord.TextInputBuilder()
	.setCustomId("confirmation")
	.setLabel("Confirm (details are not stored) yes/no")
	.setPlaceholder("You are responsible for sharing details with third party API. (yes/no)")
	.setStyle(Discord.TextInputStyle.Short)
	].map(input => new Discord.ActionRowBuilder().addComponents(input))
	modal.addComponents(actionrow)
	let filt = (i) => i.user.id === message.author.id
	message.showModal(modal)
	message.awaitModalSubmit({filt, time: 30000})
	.then(j => {
		let fields = j.fields.fields
		let username = fields.get('username').value
		let password = fields.get('password').value
		let confirm = fields.get('confirmation').value
		if (confirm.toLowerCase() !== 'yes') return message.reply("Cancelled store check because of confirmation denial.")
			valorantApi.authorize(username, password).then(() => {
				valorantApi.getPlayerStoreFront(valorantApi.user_id).then(async response => {
					const item1 = await content.getWeaponSkinLevelByUuid(
						response.data.SkinsPanelLayout.SingleItemOffers[0]
						)
					const item2 = await content.getWeaponSkinLevelByUuid(
						response.data.SkinsPanelLayout.SingleItemOffers[1]
						)
					const item3 = await content.getWeaponSkinLevelByUuid(
						response.data.SkinsPanelLayout.SingleItemOffers[2]
						)
					const item4 = await content.getWeaponSkinLevelByUuid(
						response.data.SkinsPanelLayout.SingleItemOffers[3]
						)

					const embeds = [item1,item2,item3,item4].map(i => new Discord.EmbedBuilder().setTitle(i.displayName).setThumbnail(i.displayIcon))
					send(j, {content: "Store for " + username + "\n\n`Account details are NOT stored by the bot, if you see them in the popup again they are cached by discord.\nBy using this command you are responsible for your account as store is checked using a third party API`", embeds: embeds})

				}).catch(e => send(j, "Could not retrieve store!"))
			}).catch(e => send(j, "Invalid username/password"))
	})


}