module.exports.info = {
	name: "bundle",
	description: "View a specific bundle",
	aliases: ["skinpack", "bundles"],
	usage: ['bundle'],
	module: "Game Assets"
}

const Discord = require('discord.js')

module.exports.execute = async (client, message, args, send) => {

	if (!args[0]) return send(message, "Command Usage: `/bundle <bundleName>`\nExample: `/bundle RGX 11z Pro`")

	let bundleName = args.join(' ')

	if (["matte black", "matte", "default"].includes(bundleName.toLowerCase())) return message.reply("Bruh moment")
		
	const bundleData = await client.getBundles()

	if (bundleName.toLowerCase() === 'list') {
		return send(message, client.embed({ title: "Bundles", description: "`" + bundleData.map(b => b.displayName.replace("//", " ")).join("`, `") + "`" }))
	}

	let findBundle = bundleData.find(b => b.displayName.toLowerCase() === bundleName.toLowerCase().replace("//", " "))

	if (findBundle) {
		let emb = new Discord.EmbedBuilder()
			.setTitle(findBundle.displayName)
			.setColor(388422)
			.setImage((findBundle.displayIcon ? findBundle.displayIcon : findBundle.displayIcon2))
			.setThumbnail(findBundle.verticalPromoImage)
		send(message, emb)
	} else send(message, "Bundle not found! You can get a list of bundles by using `/bundle list`\nUsage: `/bundle <bundleName>`\nExample: `/bundle RGX 11z Pro`")
}