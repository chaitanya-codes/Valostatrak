module.exports.info = {
	name: "bundle",
	description: "View a specific bundle",
	aliases: ["skinpack", "bundles"],
	usage: ['bundle'],
	module: "Game Assets"
}

module.exports.execute = async (client, message, args, send) => {
	const Discord = require('discord.js')
	if (!args[0]) return send(message, "Command Usage: `v!bundle <bundleName>`\nExample: `v!bundle RGX 11z Pro`")
		let bundleName = args.join(' ')
	if (!client.bundleData) return send(message, "The bot just started, please wait until valorant-api.com is initialized.")

		if (["matte black", "matte", "default"].includes(bundleName.toLowerCase())) return message.reply("Bruh moment")
			if (bundleName.toLowerCase() === 'list') {
				return send(message, client.embed({title: "Bundles", description: "`" + client.bundleData.map(b => b.displayName.replace("//", " ")).join("`, `") + "`"}))
			}
			let findBundle = client.bundleData.filter(b => b.displayName.toLowerCase() === bundleName.toLowerCase().replace("//", " "))[0]

			if (findBundle && findBundle.displayName) {								
				let emb = new Discord.EmbedBuilder()
				.setTitle(findBundle.displayName)
				.setColor(388422)
				.setImage((findBundle.displayIcon ? findBundle.displayIcon : findBundle.displayIcon2))
				.setThumbnail(findBundle.verticalPromoImage)
				send(message, emb)
			} else send(message, "Bundle not found! You can get a list of bundles by using `v!bundle list`\nUsage: `v!bundle <bundleName>`\nExample: `v!bundle RGX 11z Pro`")		
		}