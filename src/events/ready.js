const Discord = require('discord.js')
const request = require('request')
const { ActivityType } = require('discord.js')

let baseURL = 'https://valorant-api.com/v1/'

module.exports.Ready = async (client) => {
	console.log("Logged in as " + client.user.tag)
	client.wait = (time) => require('util').promisify(setTimeout)(time)
	client.user.setActivity(`/help`, { type: ActivityType.Playing })

	const endpoints = ['weapons', 'maps', 'agents', 'sprays', 'weapons/skinlevels', 'bundles', 'buddies', 'playertitles', 'playercards', 'contracts', 'weapons/skins', 'levelborders', 'flex'];
	const requestAPI = async (url, property) => {
		return new Promise((resolve, reject) => {
			request(baseURL + (url === 'agents' ? 'agents?isPlayableCharacter=true' : url), (err, res, body) => {
				if (err) reject(err)
				else {
					client[property] = JSON.parse(body).data
					console.log(`Loaded ${url} into database!`)
					resolve()
				}
			})
		})
	}
	for await (let api of endpoints) {
		// await client.wait(2500 * index)
		let func = "get" + api[0].toUpperCase() + api.slice(1)
		let data = api.substring(0, api.length - 1) + "Data"

		if (api === 'weapons/skinlevels') {
			func = 'getSkinLevels'
			data = 'skinLevelData'
		} else if (api === 'weapons/skins') {
			func = 'getSkins'
			data = 'skinData'
		} else if (api === 'buddies') data = 'buddiesData'
		else if (api === 'flex') data = 'flexData'

		client[func] = async () => {
			return new Promise(async (resolve, reject) => {
				if (!client[data]) {
					try {
						await requestAPI(api, data)
					} catch (e) {
						reject(e)
						return console.log(e)
					}
				}
				resolve(client[data])
			})
		}

		if (api === 'weapons') {
			await client.getWeapons()
			client.skins = client.weaponData.map(w => { return w.skins.map(a => a.displayName) }).flat(Infinity)
		}
	}

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
		if (tier === 24) tier = 21
		else if (tier === 25) tier = 22
		else if (tier === 26) tier = 23
		else if (tier === 27) tier = 24
		return `https://raw.githubusercontent.com/RumbleMike/ValorantStreamOverlay/main/Resources/TX_CompetitiveTier_Large_${tier}.png`//client.guilds.cache.get('501396018395480065').emojis.cache.find(e=>e.name===rank.split(' ')[0].toLowerCase()).url || 'https://raw.githubusercontent.com/RumbleMike/ValorantStreamOverlay/main/Resources/TX_CompetitiveTier_Large_0.png'
	}
}