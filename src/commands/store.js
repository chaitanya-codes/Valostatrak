module.exports.info = {
	name: "store",
	description: "See the current store collection",
	aliases: ["store-skins", "shop"],
	ratelimit: true,
	module: "Game Assets"
}
const Discord = require('discord.js')
module.exports.execute = async (client, message, args, send) => {

require('request')(`https://api.henrikdev.xyz/valorant/v1/store-featured`, async (err, res, body) => {
    if (err || JSON.parse(body).status !== 200) return send(message, "There was an error while fetching the store!")
		let data = JSON.parse(body)
	data = data.data
	const featuredBundle = data.FeaturedBundle
	const bundle = client.bundleData.filter(b => b.uuid === featuredBundle.Bundle.DataAssetID)[0]
	if (!bundle) return send(message, "Something went wrong!")
	const embed = new Discord.EmbedBuilder()
	.setColor("RANDOM")
	.setTitle(bundle.displayName)
	.setDescription("Store Featured Bundle")
	.setImage(bundle.displayIcon)
	.setThumbnail(bundle.verticalPromoImage)
	featuredBundle.Bundle.Items.map(i => {
		let find = client.skinLevelData.filter(e => e.uuid === i.Item?.ItemID || null)
		if (find && find[0]) embed.addField(find[0].displayName + (i.Item.Amount > 1 ? ` - ${i.Item.Amount}` : ''), `[${i.BasePrice}](${find[0].streamedVideo}) VP`, true)
	})
	embed.setFooter("Bundle Remaining Duration: " + new Date(featuredBundle.BundleRemainingDurationInSeconds * 1000).toISOString().substr(11, 8), client.user.displayAvatarURL())
	if (bundle.description && bundle.extraDescription) embed.addField(bundle.description, bundle.extraDescription)
	send(message, {embeds: [embed]})
})
}