module.exports.info = {
	name: "ping",
	description: "Latency of bot & api",
	aliases: ['latency'],
	module: "Other"
}

module.exports.execute = async (client, message, args, send) => {
	let m = await send(message, {content:"Pinging..", fetchReply: true})
	let ping = m.createdTimestamp - message.createdTimestamp
	let apiPing = message.client.ws.ping
	send(m, {edit: true, content: "Ping: " + ping + "ms\nAPI ping: " + apiPing + "ms"})
}