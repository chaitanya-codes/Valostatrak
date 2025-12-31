module.exports.info = {
	name: "statistics",
	description: "View statistics of a person",
	aliases: ["stats", "rank"],
	usage: ['username'],
	ratelimit: true,
	module: "Statistics"
}

const request = require('request');
const Discord = require('discord.js');
const progressBar = require("string-progressbar");
const Canvas = require('canvas');
const { AttachmentBuilder } = require('discord.js');

module.exports.execute = async (client, message, args, send) => {

	if (!args.join(" ").includes("#"))
		return send(message, "Usage: `/statistics <name#tag>` \nExample: `/statistics 100T Asuna#1111`");

	const [name, tag] = args.join(" ").split("#");
	const nametag = `${name}#${tag}`.toLowerCase();

	if (!(await client.linked.has(nametag)))
		return send(message, {
			embeds: [client.embed({
				color: '417543',
				title: "Account not linked",
				description: "This account is not linked with the bot!\nIf this is your account use `/account Link your Account`"
			})]
		});

	if (!(await client.accounts.has(nametag)))
		return client.newUser(nametag, this.info.name, message);

	const region = await client.accounts.get(nametag);
	const linked = await client.linked.get(args.join(" ").toLowerCase());

	if (linked.private)
		return send(message, "Account is set to private by owner");

	const msg = await send(message, { content: "Fetching stats..." });

	request({
		url: `https://api.henrikdev.xyz/valorant/v2/mmr/${region}/${name}/${tag}`,
		headers: { "Authorization": process.env.HD_KEY }
	}, async (err, res, body) => {
		if (err) return send(message, client.notFound(err));
		const json = JSON.parse(body);
		const data = json.data;

		if (err || json.status !== 200 || !data || !data['by_season'])
			return send(message, client.notFound(json.message));

		const seasons = Object.keys(data['by_season']);
		const currentData = data['current_data'];

		const generateCanvas = async (title, details) => {
			const canvas = Canvas.createCanvas(600, 280);
			const ctx = canvas.getContext('2d');

			const bgColor = '#0f1923';
			const sectionColor = '#1e2a38';
			const textColor = '#ffffff';

			ctx.fillStyle = bgColor;
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			ctx.fillStyle = sectionColor;
			ctx.fillRect(0, 0, canvas.width, 50);
			ctx.font = 'bold 24px Sans';
			ctx.fillStyle = textColor;
			ctx.fillText(title, 20, 32);

			const [rankImg, upImg, downImg] = await Promise.all([
				Canvas.loadImage(details.img),
				Canvas.loadImage(client.upEmoji.url),
				Canvas.loadImage(client.downEmoji.url)
			]);

			ctx.drawImage(rankImg, 440, 70, 130, 130);

			let y = 90;
			ctx.font = '18px Sans';
			ctx.fillStyle = textColor;

			for (const line of details.lines) {
				if (line.startsWith("Climbed: ")) {
					const climbed = line.slice(9).split(" → ");
					let chunk = "Climbed: ";
					for (let i = 0; i < climbed.length; i++) {
						const part = climbed[i] + (i !== climbed.length - 1 ? " → " : "");
						if ((chunk + part).length > 50) {
							ctx.fillText(chunk, 20, y);
							y += 25;
							chunk = "";
						}
						chunk += part;
					}
					if (chunk.length > 0) {
						ctx.fillText(chunk, 20, y);
						y += 25;
					}
				} else {
					ctx.fillText(line, 20, y);
					y += 25;
				}
			}

			if (details.progress !== undefined) {
				ctx.fillStyle = '#3b82f6';
				ctx.fillRect(20, y, details.progress * 2, 15);
				ctx.strokeStyle = '#ccc';
				ctx.strokeRect(20, y, 200, 15);
				y += 30;
			}

			if (details.change !== undefined) {
				const mmrChange = details.change;
				ctx.drawImage(mmrChange >= 0 ? upImg : downImg, 20, y, 30, 30);
				ctx.fillStyle = mmrChange >= 0 ? '#00ff88' : '#ff5555';
				ctx.font = '18px Sans';
				ctx.fillText(`${mmrChange >= 0 ? "+" : ""}${mmrChange} RR`, 60, y + 22);
			}

			return new AttachmentBuilder(canvas.toBuffer(), { name: 'valorant_stats.png' });
		};

		const makeCanvasData = (actId = null) => {
			if (!actId) {
				const rrBar = currentData.ranking_in_tier || 0;
				return {
					img: currentData.images.large,
					lines: [
						`Rank: ${currentData.currenttierpatched || "Unranked"}`,
						`RR: ${currentData.ranking_in_tier || 0}/100`
					],
					progress: rrBar,
					change: currentData.mmr_change_to_last_game
				};
			} else {
				const season = data['by_season'][actId];
				return {
					img: client.rankImg(season.final_rank_patched, season.final_rank),
					lines: [
						`Rank in act: ${season.final_rank_patched}`,
						`Wins: ${season.wins}`,
						`Games played: ${season.number_of_games}`,
						`Climbed: ${[...new Set(season.act_rank_wins.map(w => w.patched_tier).reverse())].join(" → ")}`
					]
				};
			}
		};

		const title = `Statistics - ${args.join(" ")}`;
		const attachment = await generateCanvas(title, makeCanvasData());

		const row = new Discord.ActionRowBuilder()
			.addComponents([new Discord.StringSelectMenuBuilder()
				.setCustomId("acts")
				.setPlaceholder("Choose act...")
				.addOptions([{ label: "Current statistics", value: "current" }, seasons.map(value => { return { label: value.replace("e", "Episode ").replace("a", ": Act "), value: value } }).reverse().slice(0, 24)].flat(1))])


		const statMsg = await send(msg, { content: "", files: [attachment], components: [row] });

		const collector = statMsg.createMessageComponentCollector({
			filter: i => i.user.id === message.author.id,
			time: 55000
		});

		collector.on('collect', async i => {
			const id = i.values[0];

			const dataObj = id === "current" ? makeCanvasData() : makeCanvasData(id);

			if (id !== "current" && !data['by_season'][id]?.number_of_games)
				return i.reply({ ephemeral: true, content: "This player has not played in that act." });

			const attachment = await generateCanvas(title, dataObj);
			await send(statMsg, { edit: true, files: [attachment], components: [row] });
		});

		collector.on('end', () => {
			statMsg.edit({ components: [] }).catch(() => { });
		});
	});
};
