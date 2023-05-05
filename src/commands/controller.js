module.exports.info = {
	name: "controller",
	description: "TEST COMMAND",
	aliases: ["valo"],
	usage: ['input'],
	autocomplete: true,
	module: "Other"
}

const Discord = require('discord.js')
const session = {

}

module.exports.execute = async (client, message, args, send, currentValue) => {
	message.author = message.user
	if (args[0] === 'DONT PRESS ENTER!!') {
		delete session[message.author.id]
		return message.channel.send("Game ended.")
	}
	if (!session[message.user.id]) session[message.author.id] = "\n\n"
		
		let game = session[message.author.id]
	let character = 11

	if (!session[message.author.id].responded) {
		session[message.author.id]['responded']=true
		await message.respond([{name: "PRESS W/A/S/D TO MOVE | SPACE TO SHOOT | R TO RESET | SEND MESSAGE TO END GAME)", value: "DONT PRESS ENTER!!"}])
	}
	
	while (session[message.author.id]) {
		game[0] += " "
		game[10] += " "
		game[20] += " "
	}

	let input = currentValue[currentValue.length-1]
	if (input.toLowerCase() === 'w') {
		character -= 10
	} else if (input.toLowerCase()  === 'a') {
		character -= 1
	} else if (input.toLowerCase()  === 's') {
		character += 10
	} else if (input.toLowerCase()  === 'd') {
		character += 1
	} else if (input.toLowerCase()  === 'r') {
		character = 11
	}
	game[character] = ":grinning:"
	let findMsg = message.channel.messages.cache.last()
	if (findMsg && findMsg.author.id === '855083775460769793') findMsg.edit(game + "** **\n\n\n\n\n** **")
		else message.channel.send(game + "** **\n\n\n\n\n** **")


	}

