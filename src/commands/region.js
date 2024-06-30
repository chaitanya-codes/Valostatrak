module.exports.info = {
	name: "region",
	description: "Check region info like status and current client version",
	aliases: ["r", "version", "status"],
	usage: ['region'],
	module: "Statistics",
	cooldown: 50
}

const Discord = require('discord.js')
const request = require('request')

module.exports.execute = async (client, message, args, send) => {

	const region = args[0].toLowerCase()

	if (!region || !['eu', 'na', 'kr', 'ap'].includes(region)) return send(message, "You need to type the region codename to see its status. Usage: `/region <region>`\nRegion can be `eu`, `na`, `kr`, `ap`")

	try {
		const headers = { "Authorization": process.env.HD_KEY }

		const makeRequest = (url) => {
			return new Promise((resolve, reject) => {
				request({url: url, headers}, (err, res, body) => {
					if (err) reject(err)
					else resolve(body)
				})
			})
		}

		const versionData = await makeRequest(`http://api.henrikdev.xyz/valorant/v1/version/${region.toLowerCase()}`)
		const statusData = await makeRequest(`https://api.henrikdev.xyz/valorant/v1/status/${region.toLowerCase()}`)

		if (!versionData || !statusData) return send(message, "There was an error fetching version for that region! Try checking /status of that region")

		const version = JSON.parse(versionData).data
		const status = JSON.parse(statusData).data

		const format = (info, noInfoMessage) => {
			if (!info.length) return [noInfoMessage]
			return info.map(i => (
				`Created at: \`${i.created_at}\` | Archived at \`${i.archive_at}\`\n\n**${i.titles.map(t => t.content)}**\n${i.updates.map(u => u.translations.map(t => t.content) + "\n(\`" + u.created_at + "\`)")}\n*Maintainence status: \`${i.maintenance_status.replace("_", " ")}\`*\n*Severity: \`${i.incident_severity}\`*`
			))
		}
		const maintenances = format(status.maintenances, "No maintenances found.")
		const incidents = format(status.incidents, "No incidents reported recently.")

		const embed = new Discord.EmbedBuilder()
			.setTitle(`Region INFO - **${region}**`)
			.addFields({
				name: "Version", value: `API version: \`${version.version}\`\nClient version: \`${version.build_ver}\`\nBranch: \`${version.branch}\``
			}, {
				name: 'Maintenances', value: maintenances.join("\n"), inline: true
			}, {
				name: 'Incidents', value: incidents.join("\n"), inline: true
			})
			.setFooter({ text: "Author: Riot Games" })
		send(message, embed)
	} catch (e) {
		console.error("Error fetching region data: ", e)
		send(message, "An error occured while fetching the region data!")
	}
}