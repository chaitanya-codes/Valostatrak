module.exports.info = {
	name: 'evaluate',
	description: "Evaluate code",
	aliases: ["eval"],
	module: "Owner"
}

const Discord = require('discord.js')

const clean = text => {
	if (typeof (text) === "string")
		return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203))
	else
		return text
}

const truncate = (string, length) => {
	if (string.length > length)
		return string.substring(0, length) + '...```';
	else
		return string;
}
const request = require('request');

module.exports.execute = async (client, message, args, send) => {

	if (message.author.id !== '485885170080022556') return message.reply('This command can only be used by the bot owner.')
	let bot = client;

	const modal = new Discord.ModalBuilder()
		.setCustomId('modal')
		.setTitle('Evaluate Code')

	const actionrow = new Discord.ActionRowBuilder().addComponents([new Discord.TextInputBuilder()
		.setCustomId("code")
		.setLabel("Code")
		.setStyle(Discord.TextInputStyle.Paragraph)
	])

	modal.addComponents([actionrow])
	message.showModal(modal)

	let filter = (i) => i.user.id === message.author.id
	message.awaitModalSubmit({ filter, time: 90000 })
		.then(async j => {
			j.deferReply()

			const code = j.fields.getTextInputValue('code')
			if (!code) return message.followUp("No code provided.")

			if (args[0] === '--delete') {
				try {
					await message.channel.messages.cache.filter(m => m.author.id === client.user.id).last().delete()
					return await message.delete()
				} catch (e) {
					return;
				}
			} else {
				let onlyExec = false;
				if (['--onlyexec', '--onlyeval', '--evalonly', '--execonly'].includes(args[0].toLowerCase())) {
					onlyExec = true;
					code = code.replace(args[0], "")
				}

				const beforeEval = Date.now()
				const evalEmbed = new Discord.EmbedBuilder()
					.setColor('36393E')

				try {
					let evaled = await eval(code)
					const afterEval = Date.now()

					if (onlyExec) return;

					let type = typeof evaled;
					if (typeof evaled !== "string") evaled = require("util").inspect(evaled);

					if (evaled == process.env.BOT_TOKEN || evaled.includes(process.env.BOT_TOKEN)) {
						await request('https://some-random-api.com/bottoken', (error, response, body) => {
							const data = JSON.parse(body);
							evaled = data.token;
						})
					}
					if (evaled == process.env.BOT_TOKEN) evaled = 't0ken'

					evalEmbed.setDescription(':inbox_tray: INPUT:```js\n' + code + '```\n :outbox_tray: OUTPUT:\n' + truncate(`\`\`\`js\n${clean(evaled)}\n\`\`\``, (1500 - String(code).length)) + '\n:information_source: Output Type\n```css\n' + type + '\n```')
					evalEmbed.setFooter(`Took ${afterEval - beforeEval}ms to evaluate`);

					if ((afterEval - beforeEval) > 200) {
						evalEmbed.setDescription(client.emojis.cache.get('588824651132567677').toString())
						await send(j, { embeds: [evalEmbed] }).then(async msg => {
							evalEmbed.setDescription(':inbox_tray: INPUT:```js\n' + code + '```\n :outbox_tray: OUTPUT:\n' + truncate(`\`\`\`js\n${clean(evaled)}\n\`\`\``, (1500 - String(code).length)) + '\n:information_source: Output Type\n```css\n' + type + '\n```')
							setTimeout(() => { send(msg, { edit: true, embeds: [evalEmbed] }) }, 1000)
						})
					} else send(j, { embeds: [evalEmbed] })

					if (evalEmbed.data.description.length >= 1500) {
						const cleanText = clean(evaled)
						await require("util").promisify(require('fs').writeFile)('src/eval.txt', cleanText, (err, out) => {
							if (err) console.log(err)
						})
						send(message, { files: ['src/eval.txt'] })
					}
				}
				catch (err) {
					evalEmbed.setDescription(':inbox_tray: INPUT:```js\n' + code + '```\n :outbox_tray: ERROR: ```js\n' + clean(err) + '\n```')
					send(j, { embeds: [evalEmbed] })
				}
			}
		})
		.catch(e => console.log(e))
}