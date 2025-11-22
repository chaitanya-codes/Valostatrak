const dotenv = require('dotenv');
dotenv.config();

const Discord = require('discord.js')
const { Client, Collection } = require("discord.js")
const client = new Client({
	disableEveryone: true,
	intents: ['Guilds', 'GuildMessages', 'GuildMessageReactions']
})
const fs = require('fs')
const Enmap = require("enmap")

client.commands = new Collection()
client.ratelimits = new Collection()
client.bypassed = new Collection()
client.triviaStatsTemp = new Collection()
client.triviaStats = new Enmap({
	name: "stats",
	autoFetch: true
})
client.statistics = new Enmap({
	name: "statistics",
	autoFetch: true
})
client.accounts = new Enmap({
	name: "accounts",
	autoFetch: true
})
client.linked = new Enmap({
	name: "linked",
	autoFetch: true
})

const Topgg = require("@top-gg/sdk")
const webhook = new Topgg.Webhook('valorant')

const path = require('path');
const express = require("express")
const app = express()

app.use(express.static("public"))

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, '/public/index.html'));
})
app.use("/commands", require("./routes/commands.js")(client))
app.get("/about", (req, res) => {
  res.send("This page still WIP :)")
})
app.get("/verify", (req, res) => {
	res.send("Verification system is still WIP!\nCurrently in " + client.guilds.cache.size + " servers!")
})
app.get("/api/servercount", (req, res) => {
	res.json({count: client.guilds.cache.size})
})
app.get("/api/stats/commands", (req, res) => {
    const obj = client.statistics.get("commands") || {};
    const arr = Object.keys(obj).map(k => ({
        command: k,
        count: obj[k] || 0
    }));
    arr.sort((a, b) => b.count - a.count);
    res.json(arr);
});

app.get("/api/stats/total", (req, res) => {
    res.json({ total: client.statistics.get("total_commands") || 0 });
});

app.get("/api/stats/daily", (req, res) => {
    const days = parseInt(req.query.days) || 30;
    const now = new Date();
    const daily = client.statistics.get("daily") || {};

    const output = [];

    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const today = d.toISOString().slice(0, 10);

        output.push({
            day: today,
            count: daily[today] || 0
        });
    }
    res.json(output);
});
app.get("/api/health", (req, res) => res.json({ ok: true }));
app.get("/terms-of-service", (req, res) => {
	res.send(`You agree to these rules when you use our bots.<br>
Failure to follow the rules would result in a warn or blacklist from the bot depending on the severeness<br>
⌂ Don't spam the Discord API's ratelimits using the bot [Blacklist + Report]<br>
⌂ Don't represent yourself as owning/developing the bot if you don't own/develop it [Blacklist]<br>
⌂ Don't spread false info about the bot [Warn]<br>
⌂ Don't use commands like \`say\` to break a server's rule [Warn]<br>
⌂ Don't send troll reports [Warn]`)
})
app.listen(8080, () => {
  console.log("App listening on port 8081")
})

app.post("/dblwebhook", webhook.listener(vote => {
	client.guilds.cache.get('501396018395480065').channels.cache.get('522420279352492049').send("<@" + vote.user + "> voted for me on top.gg!")
	client.bypassed.set(vote.user, true)
}))

const { AutoPoster } = require('topgg-autoposter')
const ap = AutoPoster(process.env.DBL_TOKEN, client)
ap.on('posted', () => {
	console.log('Posted stats to Top.gg!')
})

client.send = async (response, object = {}) => {
	let sendObject = {}
	let sendBack;
	let channel;
	let isInteraction = false
	if (response instanceof Discord.Message) channel = response.channel
	else isInteraction = response.isButton() || response.isChatInputCommand() || response.isContextMenuCommand() || response.isMessageContextMenuCommand() || response.isStringSelectMenu() || response instanceof Discord.ModalSubmitInteraction
	if (isInteraction) {
		object.interaction = response
		channel = response.channel
	} else channel = response
	if (!response || !object) return console.error("No value was given to send/edit.")
	if (!channel) return console.error("No channel provided to send in.")
			
	if (object.edit && object.timeout) {
		await require('util').promisify(setTimeout)(object.timeout)
		delete object["timeout"]
	}
	
	if (typeof object === "string") sendObject["content"] = object
	else if (object instanceof Discord.Embed || object instanceof Discord.EmbedBuilder) sendObject["embeds"] = [object].flat(Infinity)
		else if (object instanceof Discord.Attachment) sendObject["files"] = [object].flat(Infinity)
			else if (typeof object === 'object') {
		Object.keys(object).map((key, n) => {
			if (["embeds", "components"].includes(key.toLowerCase())) sendObject[key] = [object[key]].flat(Infinity)
				else sendObject[key] = object[key]
		})
	}
	
	if (isInteraction) {
		delete sendObject["interaction"]
		if (object.defer) {
			response.deferReply()
			delete sendObject["defer"]
		}
		if (object.edit) {
			delete sendObject["edit"]
			await response.editReply(sendObject).catch(e => response.update(sendObject).then(m => sendBack = m).catch(e => console.log(e)))
			await response.fetchReply().then(m => sendBack = m).catch(e => console.log(e))
		} else {
			sendObject["fetchReply"] = true
			await response.reply(sendObject)
			.then(m => sendBack = m)
			.catch(e => response.followUp(sendObject).then(m => sendBack = m).catch(e => console.log(e)))
		}
	} else {
		if (object.edit) {
			delete sendObject["edit"]
			await response.edit(sendObject).then(m => sendBack = m).catch(e => console.log(e))
		} else {
			if (object.reply) {
				delete sendObject["reply"]
				await response.reply(sendObject).then(m => sendBack = m).catch(e => console.log(e))
			} else await response.channel.send(sendObject).then(m => sendBack = m).catch(e => console.log(e))
		}
	}
	if (!sendBack) return console.log("FAILED TO SEND: \n" + sendObject)
		return sendBack;
}

client.embed = (object = {}) => {
	if (object.descriptionLink) object.description = `[${object.description}](${object.descriptionLink})`
	if (object.footer && typeof object.footer !== "object") object.footer = {"text": object.footer}
	if (object.author && object.author.tag) object.author = {"name": (object.author.tag ? object.author.tag : object.author.toString()), "iconURL": (object.author.displayAvatarURL ? object.author.displayAvatarURL() : null)}
	if (object.fields && object.fields[0][0]) object.fields = object.fields.map(f => {return{name: f[0], value: String(f[1]), inline: object.inlineFields || false}})
		if (object.image && !object.image.url) object.image = {url: object.image} 
	if (object.thumbnail && !object.thumbnail.url) object.thumbnail = {url: object.thumbnail}
	const embedObject = new Discord.Embed(object)
	return embedObject;
}

client.notFound = (error) => {
	return client.embed({title: "User not found", description: (error ? `Error: ${error}` : "This could be because of API issues / ratelimit. Please recheck the username#tag and try again later")})
}

client.newUser = async (id, cmd, message, sub) => {
	if (client.accounts.has(id.toLowerCase())) return;
	let name = id.split("#").shift()
	let tag = id.split("#").pop()
	if (!name || !tag) return client.send(message, "Format for username is `name#tag`")
		
	let msg = await client.send(message, client.embed({color: "346264", title: "Searching for " + id + "... (first time search)", footer: "This is only for first-time search of a riot ID", description: "Fetching region " + client.emojis.cache.get('588824651132567677').toString()}))
	
	await require('request')({url: `http://api.henrikdev.xyz/valorant/v1/account/${name}/${tag}`, headers: {"Authorization": process.env.HD_KEY}}, async (err, res, body) => {
		if (err || JSON.parse(body).status !== 200) return client.send(msg, {edit: true, content: "User not found. Make sure you typed the name and tag correctly in format `name#tag`", embeds: []})
		const data = JSON.parse(body).data
		
		if (data && data.region) await client.accounts.set(id.toLowerCase(), data.region)
			else return client.send(msg, {embeds: [], edit: true, content: "User not found. Make sure you typed the name and tag correctly in format `name#tag`"})
		let m = await client.send(msg, {edit: true, embeds: client.embed({footer: "If it does not work automatically, please run the command again.", color: "565473", title: "Found " + id, description: ":white_check_mark: Added to list for faster search next time\nRe-executing the command..."})})
		const arg = sub ? [sub, id] : [id]
			await client.commands.get(cmd).execute(client, message, arg, client.send)
		await client.wait(2500)
		return m.delete()
	})
}

client.statistics.ensure("total_commands", 0);
client.statistics.ensure("commands", {});
client.statistics.ensure("daily", {});

const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
	const command = require(`./src/commands/${file}`)
	if (!command || !command.info || !command.info.name || !command.execute) console.log('[ValoStatrack] Error in file ' + file + '! File not loaded.')
		client.commands.set(command.info.name, command)
	console.log(`[ValoStatrack] Loaded Command ${command.info.name}`)
	client.statistics.ensure("commands", 0, command.info.name);
}

client.on('ready', () => require('./src/events/ready.js').Ready(client))
client.on('messageCreate', message => require('./src/events/messageCreate.js').Message(client, message))
client.on('interactionCreate', interaction => require('./src/events/interactionCreate.js').Interaction(client, interaction))
client.on('guildCreate', guild => require('./src/events/guildCreate.js').guildCreate(client, guild))
client.on('guildDelete', guild => require('./src/events/guildDelete.js').guildDelete(client, guild))

client.on('error', err => console.log(err.stack))

process.on("uncaughtException", (err) => {
	console.error(`There was an uncaught error:\n${err.stack ?? err.toString()}`)
})

client.login(process.env.BOT_TOKEN)