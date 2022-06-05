module.exports.info = {
	name: "region",
	description: "Check region info like status and current client version",
	aliases: ["r", "version", "status"],
	usage: ['region'],
	module: "Statistics",
	cooldown: 50
}

const request = require('request')

module.exports.execute = async (client, message, args, send) => {

	let region = args[0]
	if (!region || !['eu', 'na', 'kr', 'ap'].includes(region.toLowerCase())) return send(message, "You need to type the region codename to see its status. Usage: `/region <region>` (Region can be eu, na, kr, ap)")
		await request(`http://api.henrikdev.xyz/valorant/v1/version/${region.toLowerCase()}`, async (err, res, body) => {
			await request(`https://api.henrikdev.xyz/valorant/v1/status/${region.toLowerCase()}`, async (err2, res2, body2) => {

				if (err || err2 || JSON.parse(body).status !== 200) return send(message, "There was an error fetching version for that region! Try checking /status of that region")
					let version = JSON.parse(body).data
				let status = JSON.parse(body2).data

				let maintenances, incidents;
				if (!status.maintenances.length) maintenances = ["No maintainances found."]
					else maintenances = status.maintenances.map(m => {
						return `Created at: \`${m.created_at}\` | Archived at \`${m.archive_at}\`\n\n**${m.titles.map(t => t.content)}**\n${m.updates.map(u => u.translations.map(t => t.content) + "\n(\`" + u.created_at + "\`)")}\n*Maintainence status: \`${m.maintenance_status.replace("_", " ")}\`*\n*Severity: \`${m.incident_severity}\`*`
					})
						if (!status.incidents.length) incidents = ["No incidents reported recently."]
							else incidents = status.incidents.map(i => {
								return `Created at: \`${i.created_at}\` | Archived at \`${i.archive_at}\`\n\n**${i.titles.map(t => t.content)}**\n${i.updates.map(u => u.translations.map(t => t.content) + "\n(\`" + u.created_at + "\`)")}\n*Maintainence status: \`${i.maintenance_status.replace("_", " ")}\`*\n*Severity: \`${i.incident_severity}\`*`
							})
								send(message, client.embed({title: `Region INFO - **${region}**`, footer: {text: "Author: Riot Games"}, fields: [{
									name: "Version", value: `API version: \`${version.version}\`\nClient version: \`${version.clientVersion}\`\nBranch: \`${version.branch}\``
								}, {
									name: 'Maintenances', value: maintenances.join("\n"), inline: true
								}, {
									name: 'Incidents', value: incidents.join("\n"), inline: true
								}]}))

							})
		})

}