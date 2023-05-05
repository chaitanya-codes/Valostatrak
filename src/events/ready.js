const Discord = require('discord.js')
const { request } = require('undici')
const { ActivityType } = require('discord.js')

let baseURL = 'https://valorant-api.com/v1/'

module.exports.Ready = async (client) => {
	console.log("Logged in as " + client.user.tag)
	client.wait = (time) => require('util').promisify(setTimeout)(time)
	client.user.setActivity(`your stats | /help`, { type: ActivityType.Watching })

	let array = ['weapons', 'maps', 'agents', 'sprays', 'weapons/skinlevels', 'bundles', 'buddies', 'playertitles', 'playercards', 'contracts', 'weapons/skins', 'levelborders']
	await array.forEach(async (api, index) => {
		await client.wait(2500 * index)
		await request(baseURL + (api === 'agents' ? 'agents?isPlayableCharacter=true' : api), (err, res, body) => {
			if (api === 'weapons/skinlevels') client['skinLevelData'] = JSON.parse(body).data
				else if (api === 'weapons/skins') client['skinData'] = JSON.parse(body).data
					else if (api === 'buddies') client['buddiesData'] = JSON.parse(body).data
						else client[api.substring(0, api.length - 1) + "Data"] = JSON.parse(body).data
					if (api === 'maps') client.commands.get('map').info.choices = client.mapData.map(m => m.displayName)
						else if (api === 'agents') client.commands.get('agent').info.choices = client.agentData.map(a => a.displayName)
							else if (api === 'weapons') client.skins = client.weaponData.map(w => {return w.skins.map(a => a.displayName)}).flat(Infinity)
						})
		console.log("Loaded " + api + " into database!")
	})
	client.ratelimit = (id) => {
		client.ratelimits.set(id, true)
		let time = 10000
		if (client.bypassed.has(id)) time = 3000
			setTimeout(() => client.ratelimits.set(id, false), time)
	}

	client.upEmoji = client.emojis.cache.get("992868519190482954")
	client.downEmoji = client.emojis.cache.get("992868470213587034")
	client.rankImg = (rank, tier) => {
		if (tier === 23) return "https://static.wikia.nocookie.net/valorant/images/5/53/Ascendant_3_Rank.png/revision/latest/scale-to-width-down/250?cb=20220616175519"
			else if (tier === 22) return "https://static.wikia.nocookie.net/valorant/images/1/1e/Ascendant_2_Rank.png/revision/latest/scale-to-width-down/250?cb=20220616175514"
				else if (tier === 21) return "https://static.wikia.nocookie.net/valorant/images/e/e5/Ascendant_1_Rank.png/revision/latest/scale-to-width-down/250?cb=20220616175506"
					if (tier === 24) tier=21
						else if (tier === 25) tier = 22
							else if (tier===26) tier= 23
								else if (tier===27) tier = 24
	return `https://raw.githubusercontent.com/RumbleMike/ValorantStreamOverlay/main/Resources/TX_CompetitiveTier_Large_${tier}.png`//client.guilds.cache.get('501396018395480065').emojis.cache.find(e=>e.name===rank.split(' ')[0].toLowerCase()).url || 'https://raw.githubusercontent.com/RumbleMike/ValorantStreamOverlay/main/Resources/TX_CompetitiveTier_Large_0.png'
}
}