const Discord = require('discord.js')
const request = require('request')

let baseURL = 'https://valorant-api.com/v1/'
module.exports.Ready = async (client) => {
	console.log("Logged in as " + client.user.tag)
	client.wait = (time) => require('util').promisify(setTimeout)(time)
	client.user.setActivity(`your stats | /help`, { type: 'WATCHING' })

	let array = ['weapons', 'maps', 'agents', 'sprays', 'weapons/skinlevels', 'bundles', 'buddies', 'playertitles', 'playercards', 'contracts']
	await array.forEach(async (api, index) => {
		await client.wait(2500 * index)
		await request(baseURL + (api === 'agents' ? 'agents?isPlayableCharacter=true' : api), (err, res, body) => {
			if (api === 'weapons/skinlevels') client['skinLevelData'] = JSON.parse(body).data
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

	client.upEmoji = client.emojis.cache.get("977208845774495744")
	client.downEmoji = client.emojis.cache.get("977208908970065940")
}