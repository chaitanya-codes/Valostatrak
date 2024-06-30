module.exports.info = {
	name: "esports",
	description: "View upcoming esports events!",
	aliases: ["vct", "champions"],
	usage: ["region-esports", "league"],
	ratelimit: true,
	optional: true,
	module: "Other",
};

const request = require("request");
const Discord = require("discord.js");

module.exports.execute = async (client, message, args, send) => {
	let [region, league] = args;
	let link;
	if (args[0]) {
		link = "";
		let data = {};
		message.options.data.forEach((arg) => (data[arg.name] = arg.value));
		if (data["region-esports"] && data["league"])
			link += `?region=${data["region-esports"]}&league=${data["league"]}`;
		else if (data['region-esports']) link += `?region=${data["region-esports"]}`;
		else link += `?league=${data["league"]}`;
	}

	let wait = new Discord.EmbedBuilder().setColor(428985).setTitle("Loading...");
	let m = await send(message, { content: "** **", embeds: [wait] })
	require("request")({ url: `https://api.henrikdev.xyz/valorant/v1/esports/schedule` + (link ? link : ""), headers: { "Authorization": process.env.HD_KEY } },
		async (err, res, body) => {
			if (err || JSON.parse(body).status !== 200)
				return send(message, "No events found!");
			let data = JSON.parse(body);
			data = data.data;
			console.log(data)
			if (!data || !data[0])
				return send(message, "No events found!");
			let row = new Discord.ActionRowBuilder().addComponents([new Discord.ButtonBuilder().setStyle("Success").setCustomId("back").setEmoji("◀️").setDisabled(true), new Discord.ButtonBuilder().setStyle("Success").setCustomId("next").setEmoji("▶️")])

			let page = 0
			const setPage = async (i) => {
				if (!i) i = m;
				let newemb = new Discord.EmbedBuilder()
					.addFields([{ name: "Date", value: data[page].date || null }])
					.setTitle(data[page].league.name)
					.setThumbnail(data[page].league.icon)
				let team1 = new Discord.EmbedBuilder()
					.setTitle(data[page].match.teams[0].name)
					.setThumbnail(data[page].match.teams[0].icon)
					.addFields([{ name: "Record", value: "Wins: " + data[page].match.teams[0].record.wins + "\nLosses: " + data[page].match.teams[0].record.losses }])
				let team2 = new Discord.EmbedBuilder()
					.setTitle(data[page].match.teams[1].name)
					.setThumbnail(data[page].match.teams[1].icon)
					.addFields([{ name: "Record", value: "Wins: " + data[page].match.teams[1].record.wins + "\nLosses: " + data[page].match.teams[1].record.losses }])
				m = await send(i, { content: data[page].vod, edit: true, embeds: [newemb, team1, team2], components: [row] })
			};
			await setPage();
			const filter = (i) => i.user.id === message.author.id;

			let col = await m.createMessageComponentCollector({ filter, idle: 35000 });
			col.on("collect", (i) => {
				if (i.customId === "back") {
					page--;
					row.components[1].setDisabled(false);
					if (page === 0) row.components[0].setDisabled(true);
					setPage(i);
				} else if (i.customId === "next") {
					page++;
					row.components[0].setDisabled(false);
					if (page === (body.length - 1))
						row.components[1].setDisabled(true);
					setPage(i);
				}
			});
			col.on("end", (i) => {
				send(m, { edit: true, components: [] });
			});
		}
	);
};
