module.exports.info = {
	name: "weapon",
	description: "Get weapon info",
	aliases: ["weapons", "gun"],
	usage: ["weapon"],
	module: "Game Assets"
}

const Discord = require('discord.js')
const format = (dmg) => (dmg % 1 === 0 ? String(dmg) : dmg.toFixed(1)).padEnd(4)

module.exports.execute = async (client, message, args, send) => {
	if (!args[0]) return send(message, "Command usage: /weapon <weapon-name>")

	const weaponName = args.join(" ").toLowerCase()
	const weaponData = await client.getWeapons()

	if (["melee", "tactical knife", "knife"].includes(weaponName.toLowerCase())) weaponName = "Melee"
	if (weaponName === "spike") return message.reply("https://static.wikia.nocookie.net/valorant/images/d/de/Spike.png/revision/latest?cb=20210826134702")

	let findWeapon = weaponData.find(weapon => weapon.displayName.toLowerCase() === weaponName)
	if (findWeapon) {
		const emb = new Discord.EmbedBuilder()
			.setTitle(findWeapon.displayName)
			.setColor(388422)
			.setImage(findWeapon.displayIcon)

		if (findWeapon.shopData) {
			emb.addFields([
				{ name: "Category", value: findWeapon.shopData.category, inline: true },
				{ name: "Cost", value: String(findWeapon.shopData.cost), inline: true }
			])
			emb.setDescription(`**Fire rate**: ${String(findWeapon.weaponStats.fireRate)}
							**Magazine size**: ${String(findWeapon.weaponStats.magazineSize)}
							**Equip time**: ${String(findWeapon.weaponStats.equipTimeSeconds)} second(s)
							**Reload time**: ${String(findWeapon.weaponStats.reloadTimeSeconds)} seconds
							**Damage ranges**:
							\`\`\`
Range     | Head | Body | Leg   
--------- | ---- | ---- | ----
${findWeapon.weaponStats.damageRanges.map(range => (
				`${String(range.rangeStartMeters).padEnd(2)}m - ${range.rangeEndMeters}m | ${format(range.headDamage)} | ${format(range.bodyDamage)} | ${format(range.legDamage)}`
			)).join("\n")}\`\`\`
							**Wall Penetration**: ${String(findWeapon.weaponStats.wallPenetration.replace("EWallPenetrationDisplayType::", ""))}
							`)
		}
		send(message, { embeds: [emb] })
	} else send(message, "Weapon not found!\nUsage: `/weapon <name>`")
}