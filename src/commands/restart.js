module.exports.info = {
	name: 'restart',
	description: "Restart the bot",
	aliases: ["rs", "restart-bot"],
	module: "Owner"
}

module.exports.execute = async (client, message, args, send) => {
	if (message.author.id !== "485885170080022556") return send(message, 'This command can only be used by the bot owner to restart the bot.')
	await send(message, 'Restarting!')
		.then(() => process.exit())
}