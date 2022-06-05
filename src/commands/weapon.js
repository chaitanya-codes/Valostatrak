module.exports.info = {
	name: "weapon",
	description: "Get weapon info",
	aliases: ["weapons", "gun"],
	usage: ["weapon"],
	module: "Game Assets"
}

module.exports.execute = async (client, message, args, send) => {
	const Discord = require('discord.js')
	let weaponName;
	if (!args[0]) return send(message, "Command usage: /weapon <weapon-name>")
		else weaponName = args.join(' ')

			let weaponData = client.weaponData
		if (!weaponData) return send(message, "The bot just started, please wait until valorant-api.com is initialized.")
			if (["melee", "tactical knife", "knife"].includes(weaponName.toLowerCase())) weaponName = "Melee"
				let findWeapon = weaponData.filter(weapon => weapon.displayName.toLowerCase() === weaponName.toLowerCase())
			if (findWeapon && findWeapon[0]?.displayName) {
				findWeapon = findWeapon[0]
				let emb = new Discord.EmbedBuilder()
				.setTitle(findWeapon.displayName)
				.setColor(388422)
				.setImage(findWeapon.displayIcon)
				if (findWeapon && findWeapon.shopData) {
					emb.addFields([{name: "Category", value: findWeapon.shopData.category, inline: true},
					{name: "Cost", value: String(findWeapon.shopData.cost), inline: true}])
					emb.setDescription(`**Fire rate**: ${String(findWeapon.weaponStats.fireRate)}
						**Magazine size**: ${String(findWeapon.weaponStats.magazineSize)}
						**Equip time**: ${String(findWeapon.weaponStats.equipTimeSeconds)} second(s)
						**Reload time**: ${String(findWeapon.weaponStats.reloadTimeSeconds)} seconds
						**Damage ranges**:
						\\_\\_\\_\\_\\___ Head|Body|Leg__
						${String(findWeapon.weaponStats.damageRanges.map(range => {
							return range.rangeStartMeters + " - " + range.rangeEndMeters + ": " + range.headDamage + " | " + range.bodyDamage + "  | " + range.legDamage
						}).join("\n"))}
						**Wall Penetration**: ${String(findWeapon.weaponStats.wallPenetration.replace("EWallPenetrationDisplayType::", ""))}
						`)
				}
				send(message, {embeds: [emb]})
			} else send(message, "Weapon not found!\nUsage: `/weapon <name>`")
		}