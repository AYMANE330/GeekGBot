const Discord = require('discord.js');
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL'] });
const config = require('./config.json');
const mysql = require('mysql');
const ms = require('ms');
const delay = require('delay');
const cooldown = new Set();
var dateDifference = require('date-difference');
var dateFormat = require('dateformat');
var JSONbig = require('json-bigint');

var pm2 = require('pm2');

var start_timestamp = new Date().getTime();
var reboot_interval = 6 * 60 * 60 * 1000;

pm2.connect(function(err) {
	if (err) throw err;

	if(reboot_interval <= 0)
		return;

	setTimeout(function worker() {
		// console.log("Restarting app...");
		start_timestamp = new Date().getTime();
		pm2.restart('geekgbot', function() {});
		setTimeout(worker, reboot_interval);
	}, reboot_interval);
});

// Server Info
const ServerWebSite			=	"https://geek-gamers.com";

// Owners
const D4RQS1D3R				=	"475272055495852052";

// DM Responder
const DMResponder			=	D4RQS1D3R;

// Channels
const private_room			=	"615163085665075211";
const invites_tracker		=	"693406316244369448";
const invite_logs			=	"698524549636947977";
const join_and_leave		=	"585562116702863381";
const server_rules			=	"585564021185314857";
const get_roles				=	"652833159896891413";
const mod_log				=	"615997932985909279";
const giveaways				=	"656546435126525954";
const general_chat			=	"475613409447247903";
const bot_commands			=	"616373389787136001";
const rythm					=	"595007765282553878";
const rythm2				=	"641013304013225984";

// Roles
const NitroBooster			=	"659752160254361611";
const MemberRole			=	"592729384650145844";
const NewMemberRole			=	"695617116371550260";
const DJRole				=	"672945077471150090";
const MutedRole				=	"616427227072036864";
const PlatformsRole			=	"657621479286112287";
const GamesRole				=	"657621568326991902";

// Database Tables
const db_Giveaways			=	"Giveaways";
const db_InviteBonus		=	"InviteBonus";
const db_InviteCount		=	"InviteCount";
const db_InviteLogs			=	"InviteLogs";
const db_LevelSystem		=	"LevelSystem";
const db_ModLogs			=	"ModLogs";
const db_ModWarns			=	"ModWarns";
const db_ReactionRoles		=	"ReactionRoles";

// Commands Cooldown
var commandsCooldown = {};

// Invite Manager
var invites = {};

// Reaction Roles
var reactionRoles = {};

// DJ Role Manager
const MusicChannels = [rythm, rythm2];
var joinsIDs = {};

// Snipe Deleted Messages
var deletedMessages = {};
var CleardeletedMessages;
var deletedMessages4Admin = {};

/*=====================================[ DataBase Connection ]=====================================*/
var db = mysql.createConnection({
	host: config.db_host,
	user: config.db_user,
	password: config.db_password,
	database: config.db_database,
	charset: "utf8mb4"
});


db.connect(err => {
	if(err) throw err;
	console.log(`>> GeekGBot connected to the database.`);
/*
	const DbTables = [
		`CREATE TABLE IF NOT EXISTS ${db_Giveaways} (ID INT(10) UNSIGNED NOT NULL AUTO_INCREMENT, GuildID VARCHAR(255) NOT NULL, Status VARCHAR(255) NOT NULL, Prize VARCHAR(255) NOT NULL, GuildID VARCHAR(255) NOT NULL, ChannelID VARCHAR(255) NOT NULL, MsgID VARCHAR(255) NOT NULL, HosterID VARCHAR(255) NOT NULL, WinnersNum VARCHAR(255) NOT NULL, WinnersID VARCHAR(255) NOT NULL, ReqInvites VARCHAR(255) NOT NULL, ReqNewInvites VARCHAR(255) NOT NULL, ReqMessages VARCHAR(255) NOT NULL, ReqLevel VARCHAR(255) NOT NULL, ReqRole VARCHAR(255) NOT NULL, StartDate VARCHAR(255) NOT NULL, EndDate BIGINT(8) NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
		`CREATE TABLE IF NOT EXISTS ${db_InviteBonus} (ID INT(10) UNSIGNED NOT NULL AUTO_INCREMENT, GuildID VARCHAR(255) NOT NULL, AddedBonus INT(10) NOT NULL, Reason VARCHAR(255) NOT NULL, ModID VARCHAR(255) NOT NULL, ModTag VARCHAR(255) NOT NULL, UserID VARCHAR(255) NOT NULL, UserTag VARCHAR(255) NOT NULL, Date BIGINT(8) NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
		`CREATE TABLE IF NOT EXISTS ${db_InviteCount} (ID INT(10) UNSIGNED NOT NULL AUTO_INCREMENT, GuildID VARCHAR(255) NOT NULL, UserID VARCHAR(255) NOT NULL, Regular INT(10) NOT NULL, Bonus INT(10) NOT NULL, Fake INT(10) NOT NULL, Leaves INT(10) NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
		`CREATE TABLE IF NOT EXISTS ${db_InviteLogs} (ID INT(10) UNSIGNED NOT NULL AUTO_INCREMENT, GuildID VARCHAR(255) NOT NULL, Action VARCHAR(255) NOT NULL, UserID VARCHAR(255) NOT NULL, UserTag VARCHAR(255) NOT NULL, InviterID VARCHAR(255) NOT NULL, InviterTag VARCHAR(255) NOT NULL, InviteCode VARCHAR(255) NOT NULL, InviteCreateDate VARCHAR(255) NOT NULL, InviteChannel VARCHAR(255) NOT NULL, Date BIGINT(8) NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
		`CREATE TABLE IF NOT EXISTS ${db_LevelSystem} (ID INT(10) UNSIGNED NOT NULL AUTO_INCREMENT, GuildID VARCHAR(255) NOT NULL, UserID VARCHAR(255) NOT NULL, Level INT(10) NOT NULL, EXP INT(10) NOT NULL, EXP2 INT(10) NOT NULL, MessagesCount INT(10) NOT NULL, LastMessageSentTime BIGINT(8) NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=latin1`,
		`CREATE TABLE IF NOT EXISTS ${db_ModLogs} (ID INT(10) UNSIGNED NOT NULL AUTO_INCREMENT, GuildID VARCHAR(255) NOT NULL, ChannelID VARCHAR(255) NOT NULL, ChannelID VARCHAR(255) NOT NULL, MsgID VARCHAR(255) NOT NULL, Action VARCHAR(255) NOT NULL, Reason VARCHAR(255) NOT NULL, ModID VARCHAR(255) NOT NULL, ModTag VARCHAR(255) NOT NULL, ModAvatar VARCHAR(255) NOT NULL, UserID VARCHAR(255) NOT NULL, UserTag VARCHAR(255) NOT NULL, UserAvatar VARCHAR(255) NOT NULL, Date VARCHAR(255) NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
		`CREATE TABLE IF NOT EXISTS ${db_ModWarns} (ID INT(10) UNSIGNED NOT NULL AUTO_INCREMENT, GuildID VARCHAR(18) NOT NULL, UserID VARCHAR(18) NOT NULL, Warnings INT(10) NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=latin1`,
		`CREATE TABLE IF NOT EXISTS ${db_ReactionRoles} (ID INT(10) UNSIGNED NOT NULL AUTO_INCREMENT, GuildID VARCHAR(18) NOT NULL, ChannelID VARCHAR(18) NOT NULL, MsgID VARCHAR(18) NOT NULL, ReactionEmoji VARCHAR(18) NOT NULL, ReactionRoleID VARCHAR(18) NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin`,
	];

	for(var i = 0; i < DbTables.length; i++) {
		db.query(DbTables[i], (erro, results, fields) => {
			if(erro) throw erro;
		});
	}
*/
});

/*=====================================[ Functions ]=====================================*/
function setIntervalAndExecute(fn, t) {
    fn();
    return (setInterval(fn, t));
}

/*=====================================[ Ping for Roles Assignment ]=====================================*/
var hasRoles = {};
var recentJoins = [];

var PingforRolesAssignment = async () => {
	let recentJoinsMessage = "";
	
	for(var i = 0; i < recentJoins.length; i++) {
		recentJoinsMessage += "<@" + recentJoins[i] + "> ";
	}
	
	if(recentJoinsMessage != "") {
		const get_roles_channel = client.channels.cache.get(get_roles);
		await get_roles_channel.send(recentJoinsMessage).then(msg => {
			setTimeout(() => {
				msg.delete().catch(console.error);
			}, 2 * 1000);
		}).catch(console.error);
		
		recentJoins = [];
	}
}

/*=====================================[ Guess The Number ]=====================================*/
var guessTheNumber = {};
const guessTheNumberInterval = 13 * 1000;
const guessTheNumberCountdownAt = 10 * 1000;
const guessTheNumberEmoji = "🎲";

async function prepareGuessTheNumber(channel, StartAfter, FromNumber, ToNumber, Prize, HosterID) {
	const GuessedNumber = Math.floor(Math.random() * (ToNumber - FromNumber + 1)) + FromNumber;
	const StartsAt = new Date().getTime() + parseInt(StartAfter);

	guessTheNumber[channel.id] = {
		ChannelTopic: channel.topic,
		MsgID: "",
		FromNumber: FromNumber,
		ToNumber: ToNumber,
		GuessedNumber: GuessedNumber,
		StartsAt: StartsAt,
		Prize: Prize,
		HosterID: HosterID,
		TotalTries: 0,
		LastTries: {}
	};

	await channel.updateOverwrite(channel.guild.id, {
		SEND_MESSAGES: false
	}).catch(console.error);

	await channel.setTopic(`${guessTheNumber[channel.id].ChannelTopic} \nGuess the set number between **${FromNumber}** and **${ToNumber}**.${Prize ? " \n**Prize:** " + Prize : ""}`).catch(console.error);

	const Embed = new Discord.MessageEmbed()
	.setColor('#ac1414')
	.setTitle("Preparing Guess The Number Game..");

	await channel.send(`${guessTheNumberEmoji} **Guess The Number** ${guessTheNumberEmoji}`, {embed: Embed}).then(msg => {
		guessTheNumber[channel.id].MsgID = msg.id;
		updateGuessTheNumberTimer(channel);
	}).catch(console.error);
}

async function updateGuessTheNumberTimer(channel) {
	const currentTimestamp = new Date().getTime();
	const StartsAt = guessTheNumber[channel.id].StartsAt;

	if(currentTimestamp >= StartsAt) {
		startGuessTheNumber(channel);
		return;
	}

	const diffDate = dateDifference(new Date(), new Date(StartsAt), {bold: true});

	const Embed = new Discord.MessageEmbed()
	.setColor(`${currentTimestamp >= StartsAt - guessTheNumberCountdownAt ? "eda93b" : "#ac1414"}`)
	.setTitle(`${currentTimestamp >= StartsAt - guessTheNumberCountdownAt ? "⚠️ Prepare yourself!!! ⚠️" : guessTheNumberEmoji + " Guess The Number Game !"}`)
	.setDescription(`\n⏱️ **Starting in**: ${diffDate}\n${guessTheNumber[channel.id].Prize ? "🎁 **Prize:** " + guessTheNumber[channel.id].Prize + "\n" : ""}\n**How to play:**\n• Guess the set number between \`${guessTheNumber[channel.id].FromNumber}\` and \`${guessTheNumber[channel.id].ToNumber}\`.\n• Multiple numbers in a single message doesn't count.\n• Counting up or down also doesn't count.\n• A winner will be determined right after guessing the correct number.`)
	.setFooter(`${channel.guild.name} ─ Starts at: ${dateFormat(new Date(StartsAt), "GMT:ddd, mmm dd, yyyy, hh:MM TT (Z)")}`, BotAvatar);

	await channel.messages.fetch(guessTheNumber[channel.id].MsgID).then(msg => {
		msg.edit(`${guessTheNumberEmoji} **Guess The Number** ${guessTheNumberEmoji}`, {embed: Embed}).catch(console.error);
	}).catch(console.error);

	let Timeout;
	if(currentTimestamp >= StartsAt - guessTheNumberCountdownAt) {
		Timeout = 1 * 1000;
	} else if(currentTimestamp + guessTheNumberInterval - (StartsAt - guessTheNumberCountdownAt) > 0) {
		Timeout = StartsAt - currentTimestamp - guessTheNumberCountdownAt;
	} else {
		Timeout = guessTheNumberInterval;
	}

	setTimeout(() => {
		updateGuessTheNumberTimer(channel);
	}, Timeout);
}

async function startGuessTheNumber(channel) {
	const Embed = new Discord.MessageEmbed()
	.setColor('#ac1414')
	.setTitle(`${guessTheNumberEmoji} Guess The Number Game Started!! Good luck!`)
	.setDescription(`\n${guessTheNumber[channel.id].Prize ? "🎁 **Prize:** " + guessTheNumber[channel.id].Prize + "\n" : ""}\n**How to play:**\n• Guess the set number between \`${guessTheNumber[channel.id].FromNumber}\` and \`${guessTheNumber[channel.id].ToNumber}\`.\n• Multiple numbers in a single message doesn't count.\n• Counting up or down also doesn't count.\n• A winner will be determined right after guessing the correct number.`)
	.setFooter(`${channel.guild.name} ─ Started at: ${dateFormat(new Date(guessTheNumber[channel.id].StartsAt), "GMT:ddd, mmm dd, yyyy, hh:MM TT (Z)")}`, BotAvatar);

	await channel.messages.fetch(guessTheNumber[channel.id].MsgID).then(msg => {
		msg.edit(`${guessTheNumberEmoji} **Guess The Number** ${guessTheNumberEmoji}`, {embed: Embed}).catch(console.error);
	}).catch(console.error);

	const Embed2 = new Discord.MessageEmbed()
	.setColor('#ac1414')
	.setTitle(`${guessTheNumberEmoji} Guess The Number Game Started !`)
	.setDescription(`[Guess The Number](https://discordapp.com/channels/${channel.guild.id}/${channel.id}) game has started.\n**The Correct Number**: \`${guessTheNumber[channel.id].GuessedNumber}\`${guessTheNumber[channel.id].Prize ? "\n🎁 **Prize:** " + guessTheNumber[channel.id].Prize : ""}`)
	.setTimestamp()
	.setFooter(channel.guild.name, BotAvatar);

	await client.users.cache.get(guessTheNumber[channel.id].HosterID).send(Embed2).catch(console.error);

	await channel.updateOverwrite(channel.guild.id, {
		SEND_MESSAGES: null
	}).catch(console.error);
}

async function endGuessTheNumber(channel, Winner) {
	await channel.updateOverwrite(channel.guild.id, {
		SEND_MESSAGES: false
	}).catch(console.error);

	await channel.setTopic(guessTheNumber[channel.id].ChannelTopic).catch(console.error);

	const Embed = new Discord.MessageEmbed()
	.setColor('#d0021b')
	.setAuthor(`${Winner.username} Won the game !`, Winner.displayAvatarURL())
	.setDescription(`🎉 Congratulations <@${Winner.id}>!\n${guessTheNumber[channel.id].Prize ? "You won the **" + guessTheNumber[channel.id].Prize + "** for guessing the right number in **Guess The Number** game!" : "You guessed the right number and won **Guess The Number** game!"}`)
	.addField('Number of Participants', `${Object.keys(guessTheNumber[channel.id].LastTries).length}`, true)
	.addField('Total Tries', `${guessTheNumber[channel.id].TotalTries}`, true)
	.addField('\u200b', '\u200b', true)
	.addField('The Correct Number', `${guessTheNumber[channel.id].GuessedNumber}`, true)
	.addField('Time elapsed', `${dateDifference(new Date(guessTheNumber[channel.id].StartsAt), new Date())}`, true)
	.addField('\u200b', '\u200b', true)
	.setFooter(`${channel.guild.name} ─ Ended at: ${dateFormat(new Date(), "GMT:ddd, mmm dd, yyyy, hh:MM TT (Z)")}`, BotAvatar);

	let WinnermsgID;

	await channel.send(`${guessTheNumberEmoji} **Guess The Number** ${guessTheNumberEmoji}`, {embed: Embed}).then(msg => WinnermsgID = msg.id).catch(console.error);

	const Embed2 = new Discord.MessageEmbed()
	.setColor('#d0021b')
	.setTitle(`${guessTheNumberEmoji} Guess The Number Game Ended !`)
	.setDescription(`[Guess The Number](https://discordapp.com/channels/${channel.guild.id}/${channel.id}/${WinnermsgID}) game has ended.\n🏅 **Winner**: <@${Winner.id}>${guessTheNumber[channel.id].Prize ? "\n🎁 **Prize:** " + guessTheNumber[channel.id].Prize : ""}`)
	.setTimestamp()
	.setFooter(channel.guild.name, BotAvatar);
	
	await client.users.cache.get(guessTheNumber[channel.id].HosterID).send(Embed2).catch(console.error);

	delete guessTheNumber[channel.id];
}

/*=====================================[ Giveaways ]=====================================*/
var GiveawayCreate = [];
var clearGiveawayCreate;
var Giveaways = [];
var giveawayCountdown = {};
const giveawayInterval = 23 * 1000;
const giveawayCountdownAt = 5 * 1000;
const GiveawayAuthorAvatar = "https://cdn.discordapp.com/attachments/615163085665075211/682370072081203320/gift.png";
const GiveawayEmoji = "🎉";
const GiveawayGGEmoji = "662682620437463040";

async function startGiveaway(Id) {
	const Status = GiveawayCreate[Id]["Status"];
	const Prize = GiveawayCreate[Id]["Prize"];
	const GuildID = GiveawayCreate[Id]["GuildID"];
	const ChannelID = GiveawayCreate[Id]["ChannelID"];
	const MsgID = "";
	const HosterID = GiveawayCreate[Id]["HosterID"];
	const WinnersNum = GiveawayCreate[Id]["WinnersNum"];
	const WinnersID = GiveawayCreate[Id]["WinnersID"];
	const ReqInvites = GiveawayCreate[Id]["ReqInvites"];
	const ReqNewInvites = GiveawayCreate[Id]["ReqNewInvites"];
	const ReqMessages = GiveawayCreate[Id]["ReqMessages"];
	const ReqLevel = GiveawayCreate[Id]["ReqLevel"];
	const ReqRole = GiveawayCreate[Id]["ReqRole"];
	const StartDate = new Date().getTime();
	const EndDate = StartDate + GiveawayCreate[Id]["EndDate"];

	db.query(`INSERT INTO ${db_Giveaways} (Status, Prize, GuildID, ChannelID, MsgID, HosterID, WinnersNum, WinnersID, ReqInvites, ReqNewInvites, ReqMessages, ReqLevel, ReqRole, StartDate, EndDate) VALUES ('${Status}', '${Prize}', '${GuildID}', '${ChannelID}', '${MsgID}', '${HosterID}', '${WinnersNum}', '${WinnersID}', '${ReqInvites}', '${ReqNewInvites}', '${ReqMessages}', '${ReqLevel}', '${ReqRole}', '${StartDate}', '${EndDate}')`, (err, rows, fields) => {
		if(err) throw err;

		const Embed = new Discord.MessageEmbed()
		.setColor('#ac1414')
		.setTitle("Creating Giveaway..");

		const giveaway_guild = client.guilds.cache.get(GuildID);
		const giveaway_channel = giveaway_guild.channels.cache.get(ChannelID);
		giveaway_channel.send(`${GiveawayEmoji} **GIVEAWAY** ${GiveawayEmoji}`, {embed: Embed}).then(async msg => {
			db.query(`UPDATE ${db_Giveaways} SET MsgID = '${msg.id}' WHERE ID = '${rows.insertId}'`);
			await msg.react(GiveawayEmoji).catch(console.error);

			Giveaways.push({
				ID: rows.insertId,
				Status: Status,
				Prize: Prize,
				GuildID: GuildID,
				ChannelID: ChannelID,
				MsgID: msg.id,
				HosterID: HosterID,
				WinnersNum: WinnersNum,
				WinnersID: "",
				ReqInvites: ReqInvites,
				ReqNewInvites: ReqNewInvites,
				ReqMessages: ReqMessages,
				ReqLevel: ReqLevel,
				ReqRole: ReqRole,
				StartDate: StartDate,
				EndDate: EndDate
			});

			let GiveawayID = Giveaways.length - 1;
			setTimeout(() => {
				updateGiveaway(GiveawayID);
			}, 1000);

			clearTimeout(clearGiveawayCreate);
			GiveawayCreate.splice(Id, 1);
		}).catch(console.error);
	});
}

async function updateGiveaway(Id) {
	const currentTimestamp = new Date().getTime();
	const EndDate = parseInt(Giveaways[Id].EndDate);
	const diffDate = dateDifference(new Date(), new Date(EndDate), {bold: true});

	const giveaway_guild = client.guilds.cache.get(Giveaways[Id].GuildID);
	const giveaway_channel = giveaway_guild.channels.cache.get(Giveaways[Id].ChannelID);
	const giveaway_message = Giveaways[Id].MsgID;

	if(currentTimestamp >= EndDate) {
		endGiveaway(Id);
		return;
	}

	if(currentTimestamp >= EndDate - giveawayCountdownAt) {
		setTimeout(() => {
			updateGiveaway(Id);
		}, 1 * 1000);
	} else {
		const comparison = currentTimestamp + giveawayInterval - (EndDate - giveawayCountdownAt);
		const StartCountdown = EndDate - currentTimestamp - giveawayCountdownAt;

		if(!giveawayCountdown[Id] && comparison > 0) {
			giveawayCountdown[Id] = true;
			setTimeout(() => {
				updateGiveaway(Id);
			}, StartCountdown);
		}
	}

	let Reqs = "";
	if(Giveaways[Id]["ReqInvites"]) {
		Reqs += `\n📢 Must have **${Giveaways[Id]["ReqInvites"]} invite${parseInt(Giveaways[Id]["ReqInvites"]) > 1 ? "s" : ""}**`;
	}
	if(Giveaways[Id]["ReqNewInvites"]) {
		Reqs += `\n📢 Must have **${Giveaways[Id]["ReqNewInvites"]} new invite${parseInt(Giveaways[Id]["ReqNewInvites"]) > 1 ? "s" : ""}**`;
	}
	if(Giveaways[Id]["ReqMessages"]) {
		Reqs += `\n📢 Must send **${Giveaways[Id]["ReqMessages"]} message${parseInt(Giveaways[Id]["ReqMessages"]) > 1 ? "s" : ""}**`;
	}
	if(Giveaways[Id]["ReqLevel"]) {
		Reqs += `\n📢 Must have **level ${Giveaways[Id]["ReqLevel"]}**`;
	}
	if(Giveaways[Id]["ReqRole"]) {
		let iReqRole = JSONbig.parse("[" + Giveaways[Id]["ReqRole"] + "]");
		let ReqRoles = "";
		for(j = 0; j < iReqRole.length; j++) {
			if(ReqRoles != "") ReqRoles += ", ";
			ReqRoles += "<@&" + iReqRole[j] + ">";
		}
		Reqs += `\n📢 Must have the **${ReqRoles} role${iReqRole.length > 1 ? "s" : ""}**`;
	}

	const Embed = new Discord.MessageEmbed()
	.setColor(`${currentTimestamp >= EndDate - giveawayCountdownAt ? "eda93b" : "#ac1414"}`)
	.setAuthor(Giveaways[Id].Prize, GiveawayAuthorAvatar)
	.setTitle(`${currentTimestamp >= EndDate - giveawayCountdownAt ? "⚠️ Last chance to enter!!! ⚠️" : "React with " + GiveawayEmoji + " to enter the giveaway!"}`)
	.setDescription(`🏅 **Winners**: ${Giveaways[Id].WinnersNum}${Reqs}\n⏱️ **Time remaining**: ${diffDate}\n**Hosted by**: <@${Giveaways[Id].HosterID}>`)
	.setFooter(`ID: ${Giveaways[Id].ID} ─ Ends at: ${dateFormat(new Date(EndDate), "GMT:ddd, mmm dd, yyyy, hh:MM TT (Z)")}`, BotAvatar);

	await giveaway_channel.messages.fetch(giveaway_message).then(msg => {
		msg.edit(`${GiveawayEmoji} **GIVEAWAY** ${GiveawayEmoji}`, {embed: Embed}).catch(console.error);
	}).catch(console.error);
}

async function endGiveaway(Id) {
	const currentTimestamp = new Date().getTime();

	const giveaway_guild = client.guilds.cache.get(Giveaways[Id].GuildID);
	const giveaway_channel = giveaway_guild.channels.cache.get(Giveaways[Id].ChannelID);
	const giveaway_message = Giveaways[Id].MsgID;

	let Winners = [], WinnersIDs = [], WinnersEmbed = "", WinnersMsg = "";

	await giveaway_channel.messages.fetch(giveaway_message).then(async msg => {
		if(!msg.reactions.cache.size)
			return;

		let reaction = msg.reactions.cache.find(r => r.emoji.name == GiveawayEmoji);
		if(!reaction)
			return;

		db.query(`SELECT * FROM ${db_Giveaways} WHERE ID = '${Giveaways[Id].ID}'`, (err, rows) => {
			if(err) throw err;
			
			if(!rows[0].WinnersID)
				return;

			Winners = JSONbig.parse("[" + rows[0].WinnersID + "]");
		});

		if(Winners[0])
			return;

		var userscount = 0;
		var fetchedusers = 1;
		var userscoll = [];
		while(userscount < reaction.count) {
			await reaction.users.fetch({before: fetchedusers}).then(async user => {
				userscount += user.size;
				fetchedusers = user.last();
				await user.forEach(async usr => {
					if(!giveaway_guild.members.cache.get(usr.id))
						return;

					if(giveaway_guild.members.cache.get(usr.id).bot)
						return;

					if(usr.id == Giveaways[Id].HosterID)
						return;

					if(giveaway_guild.members.cache.get(usr.id).roles.cache.has(NitroBooster)) {
						for(var i = 0; i < 2; i++) {
							userscoll.push(usr.id);
						}
						return;
					}

					if(Giveaways[Id]["ReqInvites"]) {
						let Regular = 0, Bonus = 0, Fake = 0, Leaves = 0, Invites = 0;
						await new Promise((resolve, reject) => {
							db.query(`SELECT * FROM ${db_InviteCount} WHERE GuildID = '${Giveaways[Id].GuildID}' AND UserID = '${usr.id}'`, (err, rows) => {
								if(err) throw err;
								
								if(!rows[0])
									return resolve();

								Regular = parseInt(rows[0].Regular);
								Bonus = parseInt(rows[0].Bonus);
								Fake = parseInt(rows[0].Fake);
								Leaves = parseInt(rows[0].Leaves);
								Invites = Regular + Bonus + Fake + Leaves;
								resolve();
							});
						});

						let ReqInvitesRemaining = parseInt(Giveaways[Id]["ReqInvites"]) - Invites;
						if(ReqInvitesRemaining > 0)
							return;
					}

					if(Giveaways[Id]["ReqNewInvites"]) {
						let NewInvites = 0;
						await new Promise((resolve, reject) => {
							db.query(`SELECT * FROM ${db_InviteLogs} WHERE GuildID = '${Giveaways[Id].GuildID}' AND Action = 'Join' AND UserID <> '${user.id}' AND InviterID = '${user.id}' AND Date > ${Giveaways[Id].StartDate}`, async (err, rows) => {
								if(err) throw err;

								if(!rows[0])
									return resolve();

								for(var i = 0; i < rows.length; i++) {
									let currentNewInvites = NewInvites;
									await new Promise((resolve2, reject2) => {
										db.query(`SELECT * FROM ${db_InviteLogs} WHERE GuildID = '${Giveaways[Id].GuildID}' AND Action = 'Join' AND UserID = '${rows[i].UserID}' AND Date < ${rows[i].Date}`, (err2, rows2) => {
											if(err2) throw err2;

											if(rows2[0])
												return resolve2();

											NewInvites ++;
											resolve2();
										});
									});
									
									if(NewInvites == currentNewInvites)
										continue;

									await new Promise((resolve2, reject2) => {
										db.query(`SELECT * FROM ${db_InviteLogs} WHERE GuildID = '${Giveaways[Id].GuildID}' AND Action = 'Leave' AND UserID = '${rows[i].UserID}' AND Date > ${rows[i].Date}`, (err2, rows2) => {
											if(err2) throw err2;

											if(!rows2[0])
												return resolve2();

											NewInvites --;
											resolve2();
										});
									});

									if(NewInvites == parseInt(Giveaways[Id]["ReqNewInvites"]))
										break;
								}
								resolve();
							});
						});

						let ReqNewInvitesRemaining = parseInt(Giveaways[Id]["ReqNewInvites"]) - NewInvites;
						if(ReqNewInvitesRemaining > 0)
							return;
					}
					
					if(Giveaways[Id]["ReqMessages"] || Giveaways[Id]["ReqLevel"]) {
						let Level = 0, EXP = 0, EXP2 = 0, MessagesCount = 0;
						await new Promise((resolve, reject) => {
							db.query(`SELECT * FROM ${db_LevelSystem} WHERE GuildID = '${Giveaways[Id].GuildID}' AND UserID = '${usr.id}'`, (err, rows) => {
								if(err) throw err;
								
								if(!rows[0])
									return resolve();

								Level = parseInt(rows[0].Level);
								EXP = parseInt(rows[0].EXP);
								EXP2 = parseInt(rows[0].EXP2);
								MessagesCount = parseInt(rows[0].MessagesCount);
								resolve();
							});
						});

						if(Giveaways[Id]["ReqMessages"]) {
							let ReqMessagesRemaining = parseInt(Giveaways[Id]["ReqMessages"]) - MessagesCount;
							if(ReqMessagesRemaining > 0)
								return;
						}

						if(Giveaways[Id]["ReqLevel"]) {
							if(Level < parseInt(Giveaways[Id]["ReqLevel"]))
								return;
						}
					}

					if(Giveaways[Id]["ReqRole"]) {
						let ReqRole = JSONbig.parse("[" + Giveaways[Id]["ReqRole"] + "]");
						let ReqRoles = "", ReqRolesCount = 0;
						for(i = 0; i < ReqRole.length; i++) {
							if(giveaway_guild.members.cache.get(usr.id).roles.cache.has(""+ReqRole[i]))
								continue;
							
							if(ReqRoles != "") ReqRoles += ", ";
							ReqRoles += "**" + giveaway_guild.roles.cache.get(""+ReqRole[i]).name + "**";
							ReqRolesCount ++;
						}

						if(ReqRolesCount > 0)
							return;
					}

					userscoll.push(usr.id);
				});
			}).catch(console.error);
		}

		let iWinnersNum;
		if(userscoll.length < parseInt(Giveaways[Id].WinnersNum))
			iWinnersNum = userscoll.length;
		else iWinnersNum = parseInt(Giveaways[Id].WinnersNum);

		while(Winners.length < iWinnersNum) {
			let randomWinners = userscoll[Math.floor(Math.random() * userscoll.length)];

			if(!Winners.includes(randomWinners))
				Winners.push(randomWinners);
		}
	}).catch(console.error);
	
	if(!Winners[0]) {
		db.query(`UPDATE ${db_Giveaways} SET Status = 'Ended', EndDate = '${currentTimestamp}' WHERE ID = '${Giveaways[Id].ID}'`, async (err, rows, fields) => {
			if(err) throw err;

			const Embed = new Discord.MessageEmbed()
			.setColor('#d0021b')
			.setAuthor(Giveaways[Id].Prize, GiveawayAuthorAvatar)
			.setDescription(`Could not determine a winner!\n**Hosted by**: <@${Giveaways[Id].HosterID}>`)
			.setFooter(`ID: ${Giveaways[Id].ID} ─ Ended at: ${dateFormat(new Date(currentTimestamp), "GMT:ddd, mmm dd, yyyy, hh:MM TT (Z)")}`, BotAvatar);

			await giveaway_channel.messages.fetch(giveaway_message).then(msg => {
				msg.edit(`${GiveawayEmoji} **GIVEAWAY ENDED** ${GiveawayEmoji}`, {embed: Embed}).catch(console.error);
			}).catch(console.error);

			giveaway_channel.send(`💥 A **winner** could not be determined!\nhttps://discordapp.com/channels/${Giveaways[Id].GuildID}/${Giveaways[Id].ChannelID}/${giveaway_message}`);

			const Embed2 = new Discord.MessageEmbed()
			.setColor('#d0021b')
			.setTitle("Giveaway Ended")
			.setDescription(`[your giveaway](https://discordapp.com/channels/${Giveaways[Id].GuildID}/${Giveaways[Id].ChannelID}/${giveaway_message}) has ended without **any winners**.`);

			client.users.cache.get(Giveaways[Id].HosterID).send(Embed2).catch(console.error);

			Giveaways.splice(Id, 1);
			delete giveawayCountdown[Id];
		});

		return;
	}

	for(var i = 0; i < Giveaways[Id].WinnersNum; i++) {
		if(!Winners[i])
			continue;

		WinnersIDs.push(Winners[i]);

		if(Giveaways[Id].WinnersNum > 1) {
			WinnersEmbed += "\n";
			if(i == 0)
				WinnersEmbed += "🥇 ";
			else if(i == 1)
				WinnersEmbed += "🥈 ";
			else if(i == 2)
				WinnersEmbed += "🥉 ";
			else
				WinnersEmbed += "🔹 ";
		}
		WinnersEmbed += `<@${Winners[i]}>`;

		if(i > 0)
			WinnersMsg += `, `;
		WinnersMsg += `<@${Winners[i]}>`;
	}

	db.query(`UPDATE ${db_Giveaways} SET Status = 'Ended', WinnersID = '${WinnersIDs}', EndDate = '${currentTimestamp}' WHERE ID = '${Giveaways[Id].ID}'`, async (err, rows, fields) => {
		if(err) throw err;

		const Embed = new Discord.MessageEmbed()
		.setColor('#d0021b')
		.setAuthor(Giveaways[Id].Prize, GiveawayAuthorAvatar)
		.setDescription(`🏅 **Winner${Giveaways[Id].WinnersNum > 1 ? "s" : ""}**: ${WinnersEmbed}\n**Hosted by**: <@${Giveaways[Id].HosterID}>`)
		.setFooter(`ID: ${Giveaways[Id].ID} ─ Ended at: ${dateFormat(new Date(currentTimestamp), "GMT:ddd, mmm dd, yyyy, hh:MM TT (Z)")}`, BotAvatar);

		await giveaway_channel.messages.fetch(giveaway_message).then(msg => {
			msg.edit(`${GiveawayEmoji} **GIVEAWAY ENDED** ${GiveawayEmoji}`, {embed: Embed}).catch(console.error);
		}).catch(console.error);

		giveaway_channel.send(`${GiveawayEmoji} Congratulations ${WinnersMsg}! You won the **${Giveaways[Id].Prize}**!\nhttps://discordapp.com/channels/${Giveaways[Id].GuildID}/${Giveaways[Id].ChannelID}/${giveaway_message}`).then(msg => {
			msg.react(GiveawayGGEmoji);
		}).catch(console.error);

		const Embed2 = new Discord.MessageEmbed()
		.setColor('#d0021b')
		.setTitle("Giveaway Ended")
		.setDescription(`[your giveaway](https://discordapp.com/channels/${Giveaways[Id].GuildID}/${Giveaways[Id].ChannelID}/${giveaway_message}) has ended with **${Giveaways[Id].WinnersNum} winners**.`);

		client.users.cache.get(Giveaways[Id].HosterID).send(Embed2).catch(console.error);

		Giveaways.splice(Id, 1);
		delete giveawayCountdown[Id];
	});
}

async function reRollGiveaway(Id, Placement, message, command) {
	db.query(`SELECT * FROM ${db_Giveaways} WHERE ID = '${Id}'`, async (err, rows) => {
		if(err) throw err;

		if(!rows[0])
			return message.reply("Please type a valid **ID** of the giveaway!\n**Usage:** `" + config.prefix + command + " <Giveaway ID>`");

		if(rows[0].Status != "Ended")
			return message.reply("The giveaway is not ended yet.");

		if(Placement < 1 || Placement > parseInt(rows[0].WinnersNum))
			return message.reply("Choose a correct winner **Placement**.");

		const EndDate = parseInt(rows[0].EndDate);

		const giveaway_guild = client.guilds.cache.get(rows[0].GuildID);
		const giveaway_channel = giveaway_guild.channels.cache.get(rows[0].ChannelID);
		const giveaway_message = rows[0].MsgID;

		let randomWinner, Winners, WinnersIDs = [], WinnersEmbed = "", WinnersMsg = "";

		await giveaway_channel.messages.fetch(giveaway_message).then(async msg => {
			if(!msg.reactions.cache.size)
				return;

			let reaction = msg.reactions.cache.find(r => r.emoji.name == GiveawayEmoji);
			if(!reaction)
				return;

			var userscount = 0;
			var fetchedusers = 1;
			var userscoll = [];
			while(userscount < reaction.count) {
				await reaction.users.fetch({before: fetchedusers}).then(async user => {
					userscount += user.size;
					fetchedusers = user.last();
					await user.forEach(async usr => {
						if(!giveaway_guild.members.cache.get(usr.id))
							return;

						if(giveaway_guild.members.cache.get(usr.id).bot)
							return;

						if(usr.id == rows[0].HosterID)
							return;

						if(giveaway_guild.members.cache.get(usr.id).roles.cache.has(NitroBooster)) {
							for(var i = 0; i < 2; i++) {
								userscoll.push(usr.id);
							}
							return;
						}

						if(rows[0]["ReqInvites"]) {
							let Regular = 0, Bonus = 0, Fake = 0, Leaves = 0, Invites = 0;
							await new Promise((resolve, reject) => {
								db.query(`SELECT * FROM ${db_InviteCount} WHERE GuildID = '${rows[0].GuildID}' AND UserID = '${usr.id}'`, (err, rows) => {
									if(err) throw err;
									
									if(!rows[0])
										return resolve();

									Regular = parseInt(rows[0].Regular);
									Bonus = parseInt(rows[0].Bonus);
									Fake = parseInt(rows[0].Fake);
									Leaves = parseInt(rows[0].Leaves);
									Invites = Regular + Bonus + Fake + Leaves;
									resolve();
								});
							});

							let ReqInvitesRemaining = parseInt(rows[0]["ReqInvites"]) - Invites;
							if(ReqInvitesRemaining > 0)
								return;
						}

						if(rows[0]["ReqNewInvites"]) {
							let NewInvites = 0;
							await new Promise((resolve, reject) => {
								db.query(`SELECT * FROM ${db_InviteLogs} WHERE GuildID = '${rows[0].GuildID}' AND Action = 'Join' AND UserID <> '${user.id}' AND InviterID = '${user.id}' AND Date > ${rows[0].StartDate}`, async (err2, rows2) => {
									if(err) throw err;

									if(!rows2[0])
										return resolve();

									for(var i = 0; i < rows2.length; i++) {
										let currentNewInvites = NewInvites;
										await new Promise((resolve2, reject2) => {
											db.query(`SELECT * FROM ${db_InviteLogs} WHERE GuildID = '${rows2[0].GuildID}' AND Action = 'Join' AND UserID = '${rows2[i].UserID}' AND Date < ${rows2[i].Date}`, (err3, rows3) => {
												if(err3) throw err3;

												if(rows3[0])
													return resolve2();

												NewInvites ++;
												resolve2();
											});
										});
										
										if(NewInvites == currentNewInvites)
											continue;

										await new Promise((resolve2, reject2) => {
											db.query(`SELECT * FROM ${db_InviteLogs} WHERE GuildID = '${rows2[0].GuildID}' AND Action = 'Leave' AND UserID = '${rows2[i].UserID}' AND Date > ${rows2[i].Date}`, (err3, rows3) => {
												if(err3) throw err3;

												if(!rows3[0])
													return resolve2();

												NewInvites --;
												resolve2();
											});
										});

										if(NewInvites == parseInt(rows[0]["ReqNewInvites"]))
											break;
									}
									resolve();
								});
							});

							let ReqNewInvitesRemaining = parseInt(rows[0]["ReqNewInvites"]) - NewInvites;
							if(ReqNewInvitesRemaining > 0)
								return;
						}
						
						if(rows[0]["ReqMessages"] || rows[0]["ReqLevel"]) {
							let Level = 0, EXP = 0, EXP2 = 0, MessagesCount = 0;
							await new Promise((resolve, reject) => {
								db.query(`SELECT * FROM ${db_LevelSystem} WHERE GuildID = '${rows[0].GuildID}' AND UserID = '${usr.id}'`, (err, rows) => {
									if(err) throw err;
									
									if(!rows[0])
										return resolve();

									Level = parseInt(rows[0].Level);
									EXP = parseInt(rows[0].EXP);
									EXP2 = parseInt(rows[0].EXP2);
									MessagesCount = parseInt(rows[0].MessagesCount);
									resolve();
								});
							});

							if(rows[0]["ReqMessages"]) {
								let ReqMessagesRemaining = parseInt(rows[0]["ReqMessages"]) - MessagesCount;
								if(ReqMessagesRemaining > 0)
									return;
							}

							if(rows[0]["ReqLevel"]) {
								if(Level < parseInt(rows[0]["ReqLevel"]))
									return;
							}
						}

						if(rows[0]["ReqRole"]) {
							let ReqRole = JSONbig.parse("[" + rows[0]["ReqRole"] + "]");
							let ReqRoles = "", ReqRolesCount = 0;
							for(i = 0; i < ReqRole.length; i++) {
								if(giveaway_guild.members.cache.get(usr.id).roles.cache.has(""+ReqRole[i]))
									continue;
								
								if(ReqRoles != "") ReqRoles += ", ";
								ReqRoles += "**" + giveaway_guild.roles.cache.get(""+ReqRole[i]).name + "**";
								ReqRolesCount ++;
							}

							if(ReqRolesCount > 0)
								return;
						}

						userscoll.push(usr.id);
					});
				}).catch(console.error);
			}

			Winners = JSONbig.parse("[" + rows[0].WinnersID + "]");
			for(var i = 0; i < Winners.length; i++) {
				Winners[i] = Winners[i].toString();
			}

			randomWinner = userscoll[Math.floor(Math.random() * userscoll.length)];
			Winners[Placement - 1] = randomWinner;
		}).catch(console.error);

		if(!randomWinner)
			return giveaway_channel.send(`💥 A **winner** could not be determined!\nhttps://discordapp.com/channels/${rows[0].GuildID}/${rows[0].ChannelID}/${giveaway_message}`);

		for(var i = 0; i < parseInt(rows[0].WinnersNum); i++) {
			if(!Winners[i])
				continue;

			WinnersIDs.push(Winners[i]);

			if(parseInt(rows[0].WinnersNum) > 1) {
				WinnersEmbed += "\n";
				if(i == 0)
					WinnersEmbed += "🥇 ";
				else if(i == 1)
					WinnersEmbed += "🥈 ";
				else if(i == 2)
					WinnersEmbed += "🥉 ";
				else
					WinnersEmbed += "🔹 ";
			}
			WinnersEmbed += `<@${Winners[i]}>`;
		}

		db.query(`UPDATE ${db_Giveaways} SET Status = 'Ended', WinnersID = '${WinnersIDs}' WHERE ID = '${rows[0].ID}'`, async (err2, rows2, fields2) => {
			if(err2) throw err2;

			const Embed = new Discord.MessageEmbed()
			.setColor('#d0021b')
			.setAuthor(rows[0].Prize, GiveawayAuthorAvatar)
			.setDescription(`🏅 **Winner${rows[0].WinnersNum > 1 ? "s" : ""}**: ${WinnersEmbed}\n**Hosted by**: <@${rows[0].HosterID}>`)
			.setFooter(`ID: ${rows[0].ID} ─ Ended at: ${dateFormat(new Date(EndDate), "GMT:ddd, mmm dd, yyyy, hh:MM TT (Z)")}`, BotAvatar);

			await giveaway_channel.messages.fetch(giveaway_message).then(msg => {
				msg.edit(`${GiveawayEmoji} **GIVEAWAY ENDED** ${GiveawayEmoji}`, {embed: Embed}).catch(console.error);
			}).catch(console.error);

			giveaway_channel.send(`${GiveawayEmoji} Congratulations <@${Winners[Placement - 1]}>! You're the new winner of **${rows[0].Prize}**!\nhttps://discordapp.com/channels/${rows[0].GuildID}/${rows[0].ChannelID}/${giveaway_message}`).then(msg => {
				msg.react(GiveawayGGEmoji);
			});
			
			const Embed2 = new Discord.MessageEmbed()
			.setColor('#d0021b')
			.setTitle("Giveaway Reroll")
			.setDescription(`[your giveaway](https://discordapp.com/channels/${rows[0].GuildID}/${rows[0].ChannelID}/${giveaway_message}) has rerolled.`);
			
			client.users.cache.get(rows[0].HosterID).send(Embed2).catch(console.error);
		});
	});
}

/*=====================================[ Ready Event ]=====================================*/
client.on('ready', async () => {
	if(client.partial)
		await client.fetch();
	
	await delay(1000);

	console.log(`>> Logged in as ${client.user.tag} - ID: ${client.user.id}.`);

	// Bot Activity
	client.user.setActivity('you. DM me for help!', {
		url: 'https://www.geek-gamers.com',
		type: 'LISTENING'
	});

	// Reaction Roles
	db.query(`SELECT * FROM ${db_ReactionRoles}`, async (err, rows) => {
		if(err) throw err;
		
		if(!rows[0]) return;
		
		for(var i = 0; i < rows.length; i++) {
			if(!reactionRoles[rows[i].GuildID])
				reactionRoles[rows[i].GuildID] = [];

			reactionRoles[rows[i].GuildID].push({
				ChannelID: rows[i].ChannelID,
				MsgID: rows[i].MsgID,
				ReactionEmoji: rows[i].ReactionEmoji,
				ReactionRoleID: rows[i].ReactionRoleID
			});
		}
	});
	
	// Ping for Roles Assignment
	setInterval(PingforRolesAssignment, 2 * 60 * 1000);
	
	// Invite Manager
	setInterval(function() {
		client.guilds.cache.forEach(g => {
			g.fetchInvites().then(guildInvites => {
				invites[g.id] = guildInvites;
			});
		});
	}, 15 * 1000);
	
	// Giveaways
	db.query(`SELECT * FROM ${db_Giveaways} WHERE Status = 'Live'`, async (err, rows) => {
		if(err) throw err;
		
		if(!rows[0]) return;

		for(var i = 0; i < rows.length; i++) {
			Giveaways.push({
				ID: rows[i].ID,
				Status: rows[i].Status,
				Prize: rows[i].Prize,
				GuildID: rows[i].GuildID,
				ChannelID: rows[i].ChannelID,
				MsgID: rows[i].MsgID,
				HosterID: rows[i].HosterID,
				WinnersNum: rows[i].WinnersNum,
				WinnersID: rows[i].WinnersID,
				ReqInvites: rows[i].ReqInvites,
				ReqNewInvites: rows[i].ReqNewInvites,
				ReqMessages: rows[i].ReqMessages,
				ReqLevel: rows[i].ReqLevel,
				ReqRole: rows[i].ReqRole,
				StartDate: rows[i].StartDate,
				EndDate: rows[i].EndDate
			});
		}
	});
	
	setInterval(function() {
		for(var Id = 0; Id < Giveaways.length; Id++) {
			if(!giveawayCountdown[Id]) {
				updateGiveaway(Id);
			}
		}
	}, giveawayInterval);
	
	// Moderation Tasks
	setIntervalAndExecute(function() {
		db.query(`SELECT * FROM ModTasks WHERE Date < ${new Date().getTime()}`, async (err, rows) => {
			if(err) throw err;
			
			if(!rows[0]) return;
			
			for(var i = 0; i < rows.length; i++) {
				let CaseID = rows[i].CaseID;

				db.query(`SELECT * FROM ${db_ModLogs} WHERE ID = '${CaseID}'`, async (err2, rows2) => {
					if(err2) throw err2;
					
					if(!rows2[0]) return;
					
					let GuildID = rows2[0].GuildID;
					let ChannelID = rows2[0].ChannelID;
					let MsgID = rows2[0].MsgID;
					let Action = rows2[0].Action.toLowerCase();
					let Reason = rows2[0].Reason;
					let ModTag = rows2[0].ModTag;
					let ModID = rows2[0].ModID;
					let UserID = rows2[0].UserID;
					let iDate = parseInt(rows2[0].Date);
					let diffDate = dateDifference(new Date(iDate), new Date(), {ms: true, compact: true});
					
					let command;
					if(Action.includes("mute")) {
						command = "mute";
					} else if(Action.includes("ban")) {
						command = "ban";
					}
					
					cooldown.add("BotPermissions");
					const mod_log_guild = client.guilds.cache.get(GuildID);
					const mod_log_channel = mod_log_guild.channels.cache.get(ChannelID);
					await mod_log_channel.send(`!un${command} ${UserID} Automatic un${command} made **${diffDate} ago** by **${ModTag}** (<@${ModID}>) in [Case ${CaseID}](https://discordapp.com/channels/${GuildID}/${ChannelID}/${MsgID})`).catch(console.error);
					
					db.query(`DELETE FROM ModTasks WHERE CaseID = '${CaseID}'`);
				});
			}
		});
	}, 1.5 * 60 * 1000);
	
	console.log(`>> ${client.user.tag} has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`);
});

/*=====================================[ Guild Create Event ]=====================================*/
client.on("guildCreate", async guild => {
	console.log(`>> New guild joined: ${guild.name} (ID: ${guild.id}). This guild has ${guild.memberCount} members!`);
	
	const owner = guild.client.users.cache.get(D4RQS1D3R);
	await owner.send(`New guild joined: ${guild.name} (ID: ${guild.id}). This guild has ${guild.memberCount} members!`);
});

/*=====================================[ Guild Delete Event ]=====================================*/
client.on("guildDelete", async guild => {
	console.log(`>> A guild left: ${guild.name} (ID: ${guild.id})`);
	
	const owner = guild.client.users.cache.get(D4RQS1D3R);
	await owner.send(`A guild left: ${guild.name} (ID: ${guild.id})`);
});

/*=====================================[ Member Join Event ]=====================================*/
client.on('guildMemberAdd', async member => {
	if(member.partial)
		await member.fetch();
	
	if(member.user.bot)
		return;
	
	const memberscount = member.guild.members.cache.filter(member => !member.user.bot).size;
	const server_rules_channel = member.guild.channels.cache.get(server_rules);
	const get_roles_channel = member.guild.channels.cache.get(get_roles);
	
	// Send Welcome Message to Join & Leave Channel
	const Embed = new Discord.MessageEmbed()
	.setColor('#7ed321')
	.setTitle(`${member.user.username} Joined !`)
	.setDescription(`Hello **${member.user.tag}** (${member}), Welcome to **${member.guild.name}** server! you are the **${memberscount}th** member. Please check out the ${server_rules_channel} and head on over to ${get_roles_channel} to grab some roles. We hope you enjoy your stay and have a pleasant time!`)
	.setThumbnail(member.user.displayAvatarURL())
	.setTimestamp()
	.setFooter(member.guild.name, BotAvatar);

	const join_and_leave_channel = member.guild.channels.cache.get(join_and_leave);
	if(join_and_leave_channel) {
		await join_and_leave_channel.send(Embed).catch(console.error);
	}
	
	// Send Welcome Embed Message to DM
	const Embed2 = new Discord.MessageEmbed()
	.setColor('#7ed321')
	.setAuthor(`${member.guild.name}`, member.user.displayAvatarURL(), ServerWebSite)
	.setDescription(`Hello ${member}, Welcome to **${member.guild.name}** server! you are the **${memberscount}th** member out there. Please check out the ${server_rules_channel} and head on over to ${get_roles_channel} to grab some roles. We hope you enjoy your stay and have a pleasant time!\nIf you have any question do not hesitate to contact us here at anytime!`)
	.setTimestamp()
	.setFooter(member.guild.name, BotAvatar);
	
	const receiver = client.users.cache.get(member.id);
	await receiver.send(Embed2).catch(console.error);
	
	// Add Member Role
	const mrole = member.guild.roles.cache.get(MemberRole);
	await member.roles.add(mrole).catch(console.error);
	/*
	const nmrole = member.guild.roles.cache.get(NewMemberRole);
	await member.roles.add(nmrole).catch(console.error);
	*/
	
	// Add Categories Roles
	const prole = member.guild.roles.cache.get(PlatformsRole);
	await member.roles.add(prole).catch(console.error);
	const grole = member.guild.roles.cache.get(GamesRole);
	await member.roles.add(grole).catch(console.error);
	
	// Add Selected Roles
	const memberRoles = member.roles;
	hasRoles[member.id] = [];
	for(var i = 0; i < reactionRoles[member.guild.id].length; i++) {
		let ChannelID = reactionRoles[member.guild.id][i].ChannelID;
		let MsgID = reactionRoles[member.guild.id][i].MsgID;
		let ReactionEmoji = reactionRoles[member.guild.id][i].ReactionEmoji;
		let ReactionRoleID = reactionRoles[member.guild.id][i].ReactionRoleID;

		if(member.roles.cache.has(ReactionRoleID))
			continue;

		const channel = member.guild.channels.cache.get(ChannelID);
		await channel.messages.fetch(MsgID).then(msg => {
			msg.reactions.cache.forEach(async reaction => {
				if(ReactionEmoji == reaction.emoji.id || ReactionEmoji == reaction.emoji.name) {
					var userscount = 0;
					var fetchedusers = 1;
					while(userscount < reaction.count) {
						if(hasRoles[member.id].includes(ReactionEmoji))
							break;

						await reaction.users.fetch({before: fetchedusers}).then(async user => {
							userscount += user.size;
							fetchedusers = user.last();
							if(user.has(member.id)) {
								const mrole = member.guild.roles.cache.get(ReactionRoleID);
								await member.roles.add(mrole).catch(console.error);
								hasRoles[member.id].push(ReactionEmoji);
							}
						}).catch(console.error);
					}
				}
			});
		}).catch(console.error);
	}

	// Ping for Roles Assignment
	if(memberRoles == member.roles) {
		recentJoins.push(member.id);
		if(recentJoins.length >= 85) {
			setTimeout(PingforRolesAssignment, 500);
		}
	}

	// Ping for Giveaways
	/*
	var sentGiveawayNotifs = [];
	for(var i = 0; i < Giveaways.length; i++) {
		if(sentGiveawayNotifs.includes(Giveaways[i].ChannelID))
			continue;

		const giveaways_channel = member.guild.channels.cache.get(Giveaways[i].ChannelID);
		await giveaways_channel.send(`<@${member.id}>`).then(msg => {
			sentGiveawayNotifs.push(Giveaways[i].ChannelID);
			msg.delete().catch(console.error);
		}).catch(console.error);
	}
	*/
	// Check if Muted
	db.query(`SELECT * FROM ${db_ModLogs} WHERE UserID = '${member.id}'`, async (err, rows) => {
		if(err) throw err;
		
		if(!rows[0]) return;
			
		for(var i = 0; i < rows.length; i++) {
			let Action = rows[i].Action.toLowerCase();
			
			if(!Action.includes("mute"))
				continue;
			
			db.query(`SELECT * FROM ModTasks WHERE CaseID = '${i+1}'`, async (err2, rows2) => {
				if(err2) throw err2;
				
				if(!rows2[0]) return;
				
				let Timestamp = parseInt(rows2[0].Date);
				
				if(new Date().getTime() < Timestamp) {
					const mrole = member.guild.roles.cache.get(MutedRole);
					await member.roles.add(mrole).catch(console.error);
				}
			});
		}
	});
	
	// Invite Manager
	await member.guild.fetchInvites().then(async guildInvites => {
		const ei = invites[member.guild.id];
		invites[member.guild.id] = guildInvites;
		let invite = guildInvites.find(i => ei.get(i.code).uses < i.uses);

		if(!invite) {
			await new Promise(async (resolve, reject) => {
				delay(750);
				await member.guild.channels.cache.get(invites_tracker).messages.fetch().then(msgs => {
					let getMessage = msgs.filter(msg => msg.content.includes(`<@${member.id}> **joined**`) && msg.createdTimestamp >= member.joinedTimestamp);
					let Message = getMessage.entries().next().value;

					if(!Message || Message.length == 0)
						return resolve();

					let message_content = Message[1].content;
					let inviteCode = message_content.substring(message_content.lastIndexOf("code **") + 7, message_content.lastIndexOf("**"));
					invite = guildInvites.find(i => i.code == inviteCode);
					resolve();
				}).catch(console.error);
			});
		}
		
		let GuildID = member.guild.id;
		let Action = "Join";
		let UserID = member.id;
		let UserTag = member.user.tag;
		const currentTimestamp = new Date().getTime();

		let firstJoined = currentTimestamp, numberofJoins = 1;
		await new Promise(async (resolve, reject) => {
			db.query(`SELECT * FROM ${db_InviteLogs} WHERE GuildID = '${GuildID}' AND Action = 'Join' AND UserID = '${UserID}'`, (err, rows) => {
				if(err) throw err;

				if(!rows[0])
					return resolve();

				firstJoined = rows[0].Date;
				numberofJoins = rows.length + 1;
				resolve();
			});
		});

		if(!invite) {
			db.query(`INSERT INTO ${db_InviteLogs} (GuildID, Action, UserID, UserTag, InviterID, InviterTag, InviteCode, InviteCreateDate, InviteChannel, Date) VALUES ('${GuildID}', '${Action}', '${UserID}', ${db.escape(UserTag)}, '', '', '', '', '', '${currentTimestamp}')`, async (err, rows, fields) => {
				if(err) throw err;

				const Embed = new Discord.MessageEmbed()
				.setColor('#7ed321')
				.setAuthor(`${member.user.username} Joined !`, member.user.displayAvatarURL())
				.addField(`Name`, `${UserTag} **|** <@${UserID}>`, true)
				.addField(`Account created`, `${dateFormat(new Date(Discord.SnowflakeUtil.deconstruct(UserID).timestamp), "GMT:ddd, mmm dd, yyyy, hh:MM TT (Z)")}\n(${dateDifference(new Date(Discord.SnowflakeUtil.deconstruct(UserID).timestamp), new Date(), {bold: true})} ago)`, true)
				.addField(`\u200b`, `\u200b`, true)
				.addField(`Number of joins`, `${numberofJoins}`, true)
				.addField(`First joined`, `${dateFormat(new Date(firstJoined), "GMT:ddd, mmm dd, yyyy, hh:MM TT (Z)")}${numberofJoins > 1 ? "\n(" + dateDifference(new Date(firstJoined), new Date(), {bold: true}) + " ago)" : ""}`, true)
				.addField(`\u200b`, `\u200b`, true)
				.addField(`Total Member Count`, `${memberscount}`, true)
				.setTimestamp()
				.setFooter(member.guild.name, BotAvatar);

				await member.guild.channels.cache.get(invite_logs).send(Embed).catch(console.error);
			});

			return;
		}

		const inviter = invite.inviter;
		let InviterID = inviter.id;
		let InviterTag = inviter.username + '#' + inviter.discriminator;
		let InviteCode = invite.code;
		let InviteCreateDate = invite.createdTimestamp;
		let InviteChannel = invite.channel.id;

		db.query(`INSERT INTO ${db_InviteLogs} (GuildID, Action, UserID, UserTag, InviterID, InviterTag, InviteCode, InviteCreateDate, InviteChannel, Date) VALUES ('${GuildID}', '${Action}', '${UserID}', ${db.escape(UserTag)}, '${InviterID}', ${db.escape(InviterTag)}, '${InviteCode}', '${InviteCreateDate}', '${InviteChannel}', '${currentTimestamp}')`);

		let Regular = 0, Bonus = 0, Fake = 0, Leaves = 0;
		await new Promise(async (resolve, reject) => {
			db.query(`SELECT * FROM ${db_InviteLogs} WHERE GuildID = '${GuildID}' AND Action = 'Join' AND UserID = '${UserID}' AND InviterID = '${InviterID}' AND Date < ${currentTimestamp}`, (err, rows) => {
				if(err) throw err;

				db.query(`SELECT * FROM ${db_InviteCount} WHERE GuildID = '${GuildID}' AND UserID = '${InviterID}'`, (err2, rows2) => {
					if(err2) throw err2;

					if(!rows2[0]) {
						if(UserID != InviterID) {
							Regular = 1;
							db.query(`INSERT INTO ${db_InviteCount} (GuildID, UserID, Regular, Bonus, Fake, Leaves) VALUES ('${GuildID}', '${InviterID}', '${Regular}', '${Bonus}', '${Fake}', '${Leaves}')`);
						}
					} else {
						Regular = parseInt(rows2[0].Regular);
						Bonus = parseInt(rows2[0].Bonus);
						Fake = parseInt(rows2[0].Fake);
						Leaves = parseInt(rows2[0].Leaves);
						
						if(rows[0] || UserID == InviterID) {
							Regular += 1;
							Fake -= 1;
							Leaves += 1;
						} else {
							Regular += 1;
						}
						
						db.query(`UPDATE ${db_InviteCount} SET Regular = '${Regular}', Bonus = '${Bonus}', Fake = '${Fake}', Leaves = '${Leaves}' WHERE GuildID = '${GuildID}' AND UserID = '${InviterID}'`);
					}
					resolve();
				});
			});
		});

		const Embed = new Discord.MessageEmbed()
		.setColor('#7ed321')
		.setAuthor(`${member.user.username} Joined !`, member.user.displayAvatarURL())
		.addField(`Name`, `${UserTag} **|** <@${UserID}>`, true)
		.addField(`Account created`, `${dateFormat(new Date(Discord.SnowflakeUtil.deconstruct(UserID).timestamp), "GMT:ddd, mmm dd, yyyy, hh:MM TT (Z)")}\n(${dateDifference(new Date(Discord.SnowflakeUtil.deconstruct(UserID).timestamp), new Date(), {bold: true})} ago)`, true)
		.addField(`\u200b`, `\u200b`, true)
		.addField(`Number of joins`, `${numberofJoins}`, true)
		.addField(`First joined`, `${dateFormat(new Date(firstJoined), "GMT:ddd, mmm dd, yyyy, hh:MM TT (Z)")}${numberofJoins > 1 ? "\n(" + dateDifference(new Date(firstJoined), new Date(), {bold: true}) + " ago)" : ""}`, true)
		.addField(`\u200b`, `\u200b`, true)
		.addField(`Invited by`, `${InviterTag} **|** <@${InviterID}>`, true)
		.addField(`Inviter's invites`, `**${Regular + Bonus + Fake + Leaves}** invites (**${Regular}** regular, **${Bonus}** bonus, **${Fake}** fake, **${Leaves}** leaves)`, true)
		.addField(`\u200b`, `\u200b`, true)
		.addField(`Invite Code`, `${InviteCode}`, true)
		.addField(`Invite Channel`, `<#${InviteChannel}>`, true)
		.addField(`\u200b`, `\u200b`, true)
		.addField(`Total Member Count`, `${memberscount}`, true)
		.setTimestamp()
		.setFooter(member.guild.name, BotAvatar);

		await member.guild.channels.cache.get(invite_logs).send(Embed).catch(console.error);
	});
});

/*=====================================[ Member Leave Event ]=====================================*/
client.on('guildMemberRemove', async member => {
	if(member.partial)
		await member.fetch();
	
	if(member.user.bot)
		return;
	
	const memberscount = member.guild.members.cache.filter(member => !member.user.bot).size;
	
	// Send Left Message to Join & Leave Channel
	const Embed = new Discord.MessageEmbed()
	.setColor('#d0021b')
	.setTitle(`${member.user.username} Left !`)
	.setDescription(`**${member.user.tag}** (<@${member.id}>) just left the server, **${memberscount}** members are in the server now!`)
	.setThumbnail(member.user.displayAvatarURL())
	.setTimestamp()
	.setFooter(member.guild.name, BotAvatar);
	
	const join_and_leave_channel = member.guild.channels.cache.get(join_and_leave);
	if(join_and_leave_channel) {
		await join_and_leave_channel.send(Embed).catch(console.error);
	}
	
	// Invite Manager
	db.query(`SELECT * FROM ${db_InviteLogs} WHERE GuildID = '${member.guild.id}' AND UserID = '${member.id}' ORDER BY id DESC`, async (err, rows) => {
		if(err) throw err;
		
		if(!rows[0]) return;
		
		if(rows[0].Action != "Join")
			return;
		
		let GuildID = member.guild.id;
		let Action = rows[0].Action;
		let UserID = member.id;
		let UserTag = member.user.tag;
		let InviterID = rows[0].InviterID;
		let InviterTag = rows[0].InviterTag;
		let InviteCode = rows[0].InviteCode;
		let InviteCreateDate = rows[0].InviteCreateDate;
		let InviteChannel = rows[0].InviteChannel;
		let Timestamp = parseInt(rows[0].Date);
		const currentTimestamp = new Date().getTime();

		if(InviterID && InviteCode) {
			if(client.users.cache.get(InviterID))
				InviterTag = client.users.cache.get(InviterID).tag;
			else {
				await member.guild.fetchInvites().then(guildInvites => {
					const invite = guildInvites.find(i => i.code == InviteCode);
					const inviter = invite.inviter;
					if(invite) {
						if(invite.username)
							InviterTag = inviter.username + '#' + inviter.discriminator;
					}
				});
			}
		}
		
		db.query(`INSERT INTO ${db_InviteLogs} (GuildID, Action, UserID, UserTag, InviterID, InviterTag, InviteCode, InviteCreateDate, InviteChannel, Date) VALUES ('${GuildID}', 'Leave', '${UserID}', ${db.escape(UserTag)}, '${InviterID}', ${db.escape(InviterTag)}, '${InviteCode}', '${InviteCreateDate}', '${InviteChannel}', '${currentTimestamp}')`);

		let numberofJoins = 1;
		await new Promise(async (resolve, reject) => {
			db.query(`SELECT * FROM ${db_InviteLogs} WHERE GuildID = '${GuildID}' AND Action = 'Join' AND UserID = '${UserID}'`, (err, rows) => {
				if(err) throw err;

				if(!rows[0])
					return resolve();

				numberofJoins = rows.length;
				resolve();
			});
		});
		
		if(!InviterID) {
			const Embed = new Discord.MessageEmbed()
			.setColor('#d0021b')
			.setAuthor(`${member.user.username} Left !`, member.user.displayAvatarURL())
			.addField(`Name`, `${UserTag} **|** <@${UserID}>`, true)
			.addField(`Account created`, `${dateFormat(new Date(Discord.SnowflakeUtil.deconstruct(UserID).timestamp), "GMT:ddd, mmm dd, yyyy, hh:MM TT (Z)")}\n(${dateDifference(new Date(Discord.SnowflakeUtil.deconstruct(UserID).timestamp), new Date(), {bold: true})} ago)`, true)
			.addField(`\u200b`, `\u200b`, true)
			.addField(`Number of joins`, `${numberofJoins}`, true)
			.addField(`Joined at`, `${dateFormat(new Date(Timestamp), "GMT:ddd, mmm dd, yyyy, hh:MM TT (Z)")}\n(${dateDifference(new Date(Timestamp), new Date(), {bold: true})} ago)`, true)
			.addField(`\u200b`, `\u200b`, true)
			.addField(`Total Member Count`, `${memberscount}`, true)
			.setTimestamp()
			.setFooter(member.guild.name, BotAvatar);

			await member.guild.channels.cache.get(invite_logs).send(Embed).catch(console.error);

			return;
		}

		db.query(`SELECT * FROM ${db_InviteCount} WHERE GuildID = '${GuildID}' AND UserID = '${InviterID}'`, async (err2, rows2) => {
			if(err2) throw err2;
			
			if(!rows2[0]) return;

			let Regular = parseInt(rows2[0].Regular);
			let Bonus = parseInt(rows2[0].Bonus);
			let Fake = parseInt(rows2[0].Fake);
			let Leaves = parseInt(rows2[0].Leaves);
			
			Leaves -= 1;
			
			db.query(`UPDATE ${db_InviteCount} SET Leaves = '${Leaves}' WHERE GuildID = '${GuildID}' AND UserID = '${InviterID}'`);

			const Embed = new Discord.MessageEmbed()
			.setColor('#d0021b')
			.setAuthor(`${member.user.username} Left !`, member.user.displayAvatarURL())
			.addField(`Name`, `${UserTag} **|** <@${UserID}>`, true)
			.addField(`Account created`, `${dateFormat(new Date(Discord.SnowflakeUtil.deconstruct(UserID).timestamp), "GMT:ddd, mmm dd, yyyy, hh:MM TT (Z)")}\n(${dateDifference(new Date(Discord.SnowflakeUtil.deconstruct(UserID).timestamp), new Date(), {bold: true})} ago)`, true)
			.addField(`\u200b`, `\u200b`, true)
			.addField(`Number of joins`, `${numberofJoins}`, true)
			.addField(`Joined at`, `${dateFormat(new Date(Timestamp), "GMT:ddd, mmm dd, yyyy, hh:MM TT (Z)")}\n(${dateDifference(new Date(Timestamp), new Date(), {bold: true})} ago)`, true)
			.addField(`\u200b`, `\u200b`, true)
			.addField(`Invited by`, `${InviterTag} **|** <@${InviterID}>`, true)
			.addField(`Inviter's invites`, `**${Regular + Bonus + Fake + Leaves}** invites (**${Regular}** regular, **${Bonus}** bonus, **${Fake}** fake, **${Leaves}** leaves)`, true)
			.addField(`\u200b`, `\u200b`, true)
			.addField(`Invite Code`, `${InviteCode}`, true)
			.addField(`Invite Channel`, `<#${InviteChannel}>`, true)
			.addField(`\u200b`, `\u200b`, true)
			.addField(`Total Member Count`, `${memberscount}`, true)
			.setTimestamp()
			.setFooter(member.guild.name, BotAvatar);

			await member.guild.channels.cache.get(invite_logs).send(Embed).catch(console.error);
		});
	});
});

/*=====================================[ Voice State Update Event ]=====================================*/
client.on('voiceStateUpdate', async (oldVoiceState, newVoiceState) => {
	if(newVoiceState.guild.members.cache.get(newVoiceState.id).user.bot)
		return;
	
	const mrole = newVoiceState.guild.roles.cache.get(DJRole);
	
	for(var i = 0; i < MusicChannels.length; i++) {
		if(!joinsIDs[MusicChannels[i]])
			joinsIDs[MusicChannels[i]] = [];
		
		// Member joins Music voice channel
		if(newVoiceState.channelID == MusicChannels[i]) {
			joinsIDs[newVoiceState.channelID].push(newVoiceState.id);
			
			await newVoiceState.channel.members.cache.forEach(async vcmember => {
				if(vcmember.id == joinsIDs[newVoiceState.channelID][0]) {
					let firstJoinedUser = vcmember.guild.members.cache.get(joinsIDs[newVoiceState.channelID][0]);
					await firstJoinedUser.roles.add(mrole).catch(console.error);
				}
				else {
					if(vcmember.roles.cache.has(DJRole)) {
						await vcmember.roles.remove(mrole).catch(console.error);
					}
				}
			});
		}
		
		// Member leaves Music voice channel
		if(oldVoiceState.channelID == MusicChannels[i]) {
			if(oldVoiceState.member.roles.cache.has(DJRole)) {
				await oldVoiceState.member.roles.remove(mrole).catch(console.error);
			}
			
			for(var j = 0; j < joinsIDs[oldVoiceState.channelID].length; j++) {
				if(joinsIDs[oldVoiceState.channelID][j] !== oldVoiceState.id)
					continue;
				
				joinsIDs[oldVoiceState.channelID].splice(j, 1);
				break;
			}
			
			await oldVoiceState.channel.members.cache.forEach(async vcmember => {
				if(vcmember.id == joinsIDs[oldVoiceState.channelID][0]) {
					let firstJoinedUser = vcmember.guild.members.cache.get(joinsIDs[oldVoiceState.channelID][0]);
					await firstJoinedUser.roles.add(mrole).catch(console.error);
				}
				else {
					if(vcmember.roles.cache.has(DJRole)) {
						await vcmember.roles.remove(mrole).catch(console.error);
					}
				}
			});
		}
	}
});

/*=====================================[ Message Delete Event ]=====================================*/
client.on("messageDelete", async message => {
	if(message.partial)
		await message.fetch();
	
	if(message.author.bot)
		return;

	let message_content = "";
	message_content = message.content;
	if(message.attachments.size > 0) {
		message.attachments.cache.forEach(attachment => {
			message_content += `\n${attachment.url}`;
		});
	}

	if(CleardeletedMessages)
		clearTimeout(CleardeletedMessages);

	deletedMessages[message.channel.id] = {};
	deletedMessages[message.channel.id]["Message"] = message_content;
	deletedMessages[message.channel.id]["UserTag"] = message.author.tag;
	deletedMessages[message.channel.id]["UserAvatar"] = message.author.displayAvatarURL();
	deletedMessages[message.channel.id]["Date"] = new Date().getTime();

	CleardeletedMessages = setTimeout(() => {
		delete deletedMessages[message.channel.id];
	}, 900 * 1000);
	
	if(!deletedMessages4Admin[message.channel.id])
		deletedMessages4Admin[message.channel.id] = [];
	
	deletedMessages4Admin[message.channel.id].push({
		Message: message_content,
		UserTag: message.author.tag,
		UserAvatar: message.author.displayAvatarURL(),
		Date: new Date().getTime()
	});
});

/*=====================================[ Message Event ]=====================================*/
client.on('message', async message => {
	if(message.partial)
		await message.fetch();
	
	if(message.author.bot && !cooldown.has("BotPermissions"))
		return;
	
	if(message.author.bot)
		cooldown.delete("BotPermissions");

	const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();
	
	// DM Chat
	if(message.channel.type == "dm") {
		const sender_id = message.author.id;
		const sender_tag = message.author.tag;
		let receiver_id, message_content = "";
		message_content = message.content;
		if(message.attachments.size > 0) {
			message.attachments.cache.forEach(attachment => {
				message_content += `\n${attachment.url}`;
			});
		}
		
		if(sender_id == DMResponder) {
			if(command === "dm") {
				receiver_id = args.slice(0, 1).join();
				message_content = args.slice(1).join(' ');
				
				const receiver = message.client.users.cache.get(receiver_id);
				await receiver.send(message_content).catch(console.error);
			}
			
			return;
		}
		
		const Embed = new Discord.MessageEmbed()
		.setColor('#ac1414')
		.setAuthor(`New message received from ${sender_tag}`, message.author.displayAvatarURL(), `https://discordapp.com/channels/@me/${sender_id}`)
		.addField('Name :', message.author.username, true)
		.addField('ID :', sender_id, true)
		.addField('Message :', message_content)
		.setThumbnail(message.author.displayAvatarURL())
		.setTimestamp()
		.setFooter("GeekGamers", BotAvatar);
		
		receiver_id = DMResponder;
		const receiver = message.client.users.cache.get(receiver_id);
		await receiver.send(Embed).catch(console.error);
		
		return;
	}

	// Guess The Number
	if(guessTheNumber[message.channel.id]) {
		if(!isNaN(message.content) && parseInt(message.content) >= guessTheNumber[message.channel.id].FromNumber && parseInt(message.content) <= guessTheNumber[message.channel.id].ToNumber) {
			if(parseInt(message.content) == guessTheNumber[message.channel.id].LastTries[message.member.id] + 1 || parseInt(message.content) == guessTheNumber[message.channel.id].LastTries[message.member.id] - 1) {
				message.delete().catch(console.error);

				const Embed = new Discord.MessageEmbed()
				.setColor('#d0021b')
				.setTitle("🚫 ANSWER DENIED")
				.setDescription(`Your answer \`${message.content}\` got denied! You can't count up or down, try to guess random number.\n[Click here](https://discordapp.com/channels/${message.guild.id}/${message.channel.id}) to go back to the game. Good luck!`)
				.setTimestamp()
				.setFooter(`${message.guild.name} ─ Guess The Number`, BotAvatar);

				message.author.send(Embed).catch(console.error);
				
				return;
			}

			guessTheNumber[message.channel.id].LastTries[message.member.id] = parseInt(message.content);
			guessTheNumber[message.channel.id].TotalTries ++;

			if(parseInt(message.content) == guessTheNumber[message.channel.id].GuessedNumber) {
				endGuessTheNumber(message.channel, message.author);
			}
		}
	}

	// Giveaways
	for(var i = 0; i < GiveawayCreate.length; i++) {
		if(GiveawayCreate[i]["GuildID"] != message.guild.id || GiveawayCreate[i]["SetupChannelID"] != message.channel.id || GiveawayCreate[i]["CreatorID"] != message.author.id)
			continue;

		message.delete().catch(console.error);

		if(message.content.toLowerCase() == "cancel") {
			GiveawayCreate.splice(i, 1);
			await message.channel.messages.fetch(GiveawayCreate[i]["MsgID"]).then(msg => {
				msg.delete().catch(console.error);
			}).catch(console.error);
		}

		if(!GiveawayCreate[i]["ChannelID"]) {
			if(message.mentions.channels.first()) {
				GiveawayCreate[i]["ChannelID"] = message.mentions.channels.first().id;
			} else if(message.guild.channels.cache.get(message.content)) {
				GiveawayCreate[i]["ChannelID"] = message.content;
			} else {
				const Embed = new Discord.MessageEmbed()
				.setColor('#eda93b')
				.setTitle("⚠️ Invalid Channel")
				.setDescription("Please mention a valid **Channel/Channel ID** to host the giveaway in.");

				await message.channel.send(Embed).then(msg => {
					setTimeout(() => {
						msg.delete().catch(console.error);
					}, 4 * 1000);
				}).catch(console.error);
				return;
			}

			const Embed = new Discord.MessageEmbed()
			.setColor('#ac1414')
			.setAuthor("Giveaway Setup - 2/6", message.author.displayAvatarURL())
			.setDescription("What will you be giving away ?")
			.setTimestamp()
			.setFooter(message.guild.name, BotAvatar);

			await message.channel.messages.fetch(GiveawayCreate[i]["MsgID"]).then(msg => {
				msg.edit(Embed).catch(console.error);
			}).catch(console.error);
			return;
		}

		if(!GiveawayCreate[i]["Prize"]) {
			if(!message.content) {
				const Embed = new Discord.MessageEmbed()
				.setColor('#eda93b')
				.setTitle("⚠️ Invalid Answer")
				.setDescription("Please mention what will you be giving away.");

				message.channel.send(Embed).then(msg => {
					setTimeout(() => {
						msg.delete().catch(console.error);
					}, 4 * 1000);
				}).catch(console.error);
			} else {
				GiveawayCreate[i]["Prize"] = message.content;

				const Embed = new Discord.MessageEmbed()
				.setColor('#ac1414')
				.setAuthor("Giveaway Setup - 3/6", message.author.displayAvatarURL())
				.setDescription("How long do you want the giveaway to last ?")
				.setTimestamp()
				.setFooter(message.guild.name, BotAvatar);

				await message.channel.messages.fetch(GiveawayCreate[i]["MsgID"]).then(msg => {
					msg.edit(Embed).catch(console.error);
				}).catch(console.error);
			}
			return;
		}

		if(!GiveawayCreate[i]["EndDate"]) {
			if(!message.content) {
				const Embed = new Discord.MessageEmbed()
				.setColor('#eda93b')
				.setTitle("⚠️ Invalid Time")
				.setDescription("Please type how long do you want the giveaway to last.");

				message.channel.send(Embed).then(msg => {
					setTimeout(() => {
						msg.delete().catch(console.error);
					}, 4 * 1000);
				}).catch(console.error);
			} else if(ms(message.content.toLowerCase()) === undefined) {
				const Embed = new Discord.MessageEmbed()
				.setColor('#eda93b')
				.setTitle("⚠️ Invalid Time")
				.setDescription("Please type a valid time format. Example: `1m | 1h | 1d`");

				message.channel.send(Embed).then(msg => {
					setTimeout(() => {
						msg.delete().catch(console.error);
					}, 4 * 1000);
				}).catch(console.error);
			} else if(ms(message.content.toLowerCase()) < 5000) {
				const Embed = new Discord.MessageEmbed()
				.setColor('#eda93b')
				.setTitle("⚠️ Invalid Time")
				.setDescription("The giveaway can't last for less than `5 seconds`.");

				message.channel.send(Embed).then(msg => {
					setTimeout(() => {
						msg.delete().catch(console.error);
					}, 4 * 1000);
				}).catch(console.error);
			} else {
				GiveawayCreate[i]["EndDate"] = ms(message.content.toLowerCase());

				const Embed = new Discord.MessageEmbed()
				.setColor('#ac1414')
				.setAuthor("Giveaway Setup - 4/6", message.author.displayAvatarURL())
				.setDescription("How many **winners** will there be ?")
				.setTimestamp()
				.setFooter(message.guild.name, BotAvatar);

				await message.channel.messages.fetch(GiveawayCreate[i]["MsgID"]).then(msg => {
					msg.edit(Embed).catch(console.error);
				}).catch(console.error);
			}
			return;
		}

		if(!GiveawayCreate[i]["WinnersNum"]) {
			if(!message.content) {
				const Embed = new Discord.MessageEmbed()
				.setColor('#eda93b')
				.setTitle("⚠️ Invalid Winners")
				.setDescription("Please mention how many **winners** will there be.");

				message.channel.send(Embed).then(msg => {
					setTimeout(() => {
						msg.delete().catch(console.error);
					}, 4 * 1000);
				}).catch(console.error);
			} else if(isNaN(message.content)) {
				const Embed = new Discord.MessageEmbed()
				.setColor('#eda93b')
				.setTitle("⚠️ Invalid Winners")
				.setDescription("The **number of winners** must be a number.");

				message.channel.send(Embed).then(msg => {
					setTimeout(() => {
						msg.delete().catch(console.error);
					}, 4 * 1000);
				}).catch(console.error);
			} else if(parseInt(message.content) < 1 || parseInt(message.content) > 20) {
				const Embed = new Discord.MessageEmbed()
				.setColor('#eda93b')
				.setTitle("⚠️ Invalid Winners")
				.setDescription("The **number of winners** must be between 1 and 20 winners.");

				message.channel.send(Embed).then(msg => {
					setTimeout(() => {
						msg.delete().catch(console.error);
					}, 4 * 1000);
				}).catch(console.error);
			} else {
				GiveawayCreate[i]["WinnersNum"] = parseInt(message.content);

				const Embed = new Discord.MessageEmbed()
				.setColor('#ac1414')
				.setAuthor("Giveaway Setup - 5/6", message.author.displayAvatarURL())
				.setDescription("Will you set the giveaway's **hoster** ? (`Y|Yes` or `N|No`)")
				.setTimestamp()
				.setFooter(message.guild.name, BotAvatar);

				await message.channel.messages.fetch(GiveawayCreate[i]["MsgID"]).then(msg => {
					msg.edit(Embed).catch(console.error);
				}).catch(console.error);
			}
			return;
		}

		if(!GiveawayCreate[i]["HosterID"]) {
			if(message.content.toLowerCase() != "y" && message.content.toLowerCase() != "yes" && message.content.toLowerCase() != "n" && message.content.toLowerCase() != "no") {
				const Embed = new Discord.MessageEmbed()
				.setColor('#eda93b')
				.setTitle("⚠️ Invalid Answer")
				.setDescription("Please answer with `Y|Yes` or `N|No`.");

				message.channel.send(Embed).then(msg => {
					setTimeout(() => {
						msg.delete().catch(console.error);
					}, 4 * 1000);
				}).catch(console.error);
			} else {
				if(message.content.toLowerCase() == "y" || message.content.toLowerCase() == "yes") {
					GiveawayCreate[i]["HosterID"] = "answering";

					const Embed = new Discord.MessageEmbed()
					.setColor('#ac1414')
					.setAuthor("Hoster Setup", message.author.displayAvatarURL())
					.setDescription("Please mention **by whom** the giveaway will be hosted.")
					.setTimestamp()
					.setFooter(message.guild.name, BotAvatar);

					await message.channel.messages.fetch(GiveawayCreate[i]["MsgID"]).then(msg => {
						msg.edit(Embed).catch(console.error);
					}).catch(console.error);
				} else if(message.content.toLowerCase() == "n" || message.content.toLowerCase() == "no") {
					GiveawayCreate[i]["HosterID"] = message.author.id;
					
					const Embed = new Discord.MessageEmbed()
					.setColor('#ac1414')
					.setAuthor("Giveaway Setup - 6/6", message.author.displayAvatarURL())
					.setDescription("Will there be any **requirements** for this giveaway ? (`Y|Yes` or `N|No`)")
					.setTimestamp()
					.setFooter(message.guild.name, BotAvatar);

					await message.channel.messages.fetch(GiveawayCreate[i]["MsgID"]).then(msg => {
						msg.edit(Embed).catch(console.error);
					}).catch(console.error);
				}
			}
			return;
		}
		
		if(GiveawayCreate[i]["HosterID"] == "answering") {
			if(!message.content) {
				const Embed = new Discord.MessageEmbed()
				.setColor('#eda93b')
				.setTitle("⚠️ Invalid Winners")
				.setDescription("Please mention **by whom** the giveaway will be hosted.");

				message.channel.send(Embed).then(msg => {
					setTimeout(() => {
						msg.delete().catch(console.error);
					}, 4 * 1000);
				}).catch(console.error);
			} else if(!message.mentions.members.first() && !message.guild.members.cache.get(message.content)) {
				const Embed = new Discord.MessageEmbed()
				.setColor('#eda93b')
				.setTitle("⚠️ Invalid Winners")
				.setDescription("Please mention a valid member **by whom** the giveaway will be hosted.");

				message.channel.send(Embed).then(msg => {
					setTimeout(() => {
						msg.delete().catch(console.error);
					}, 4 * 1000);
				}).catch(console.error);
			} else {
				if(message.mentions.members.first())
					GiveawayCreate[i]["HosterID"] = message.mentions.members.first().id;
				else if(message.guild.members.cache.get(message.content))
					GiveawayCreate[i]["HosterID"] = message.content;

				const Embed = new Discord.MessageEmbed()
				.setColor('#ac1414')
				.setAuthor("Giveaway Setup - 6/6", message.author.displayAvatarURL())
				.setDescription("Will there be any **requirements** for this giveaway ? (`Y|Yes` or `N|No`)")
				.setTimestamp()
				.setFooter(message.guild.name, BotAvatar);

				await message.channel.messages.fetch(GiveawayCreate[i]["MsgID"]).then(msg => {
					msg.edit(Embed).catch(console.error);
				}).catch(console.error);
			}
			return;
		}

		if(!GiveawayCreate[i]["Requirements"]) {
			if(message.content.toLowerCase() != "y" && message.content.toLowerCase() != "yes" && message.content.toLowerCase() != "n" && message.content.toLowerCase() != "no") {
				const Embed = new Discord.MessageEmbed()
				.setColor('#eda93b')
				.setTitle("⚠️ Invalid Answer")
				.setDescription("Please answer with `Y|Yes` or `N|No`.");

				message.channel.send(Embed).then(msg => {
					setTimeout(() => {
						msg.delete().catch(console.error);
					}, 4 * 1000);
				}).catch(console.error);
			} else {
				if(message.content.toLowerCase() == "y" || message.content.toLowerCase() == "yes") {
					GiveawayCreate[i]["Requirements"] = "1";

					const Embed = new Discord.MessageEmbed()
					.setColor('#ac1414')
					.setAuthor("Requirement Setup", message.author.displayAvatarURL())
					.setTitle("Which requirement would you like ?")
					.setDescription("1️⃣  Invites\n2️⃣  New Invites\n3️⃣  Messages\n4️⃣  Level\n5️⃣  Role\n\n✅  Done")
					.setTimestamp()
					.setFooter(message.guild.name, BotAvatar);

					await message.channel.messages.fetch(GiveawayCreate[i]["MsgID"]).then(async msg => {
						msg.edit(Embed).catch(console.error);
						try {
							await msg.react("1️⃣");
							await msg.react("2️⃣");
							await msg.react("3️⃣");
							await msg.react("4️⃣");
							await msg.react("5️⃣");
							await msg.react("✅");
						} catch (error) {
							console.error('One of the emojis failed to react.');
						}
						msg.edit(Embed).catch(console.error);
					}).catch(console.error);
				} else if(message.content.toLowerCase() == "n" || message.content.toLowerCase() == "no") {
					GiveawayCreate[i]["Requirements"] = "";

					await message.channel.messages.fetch(GiveawayCreate[i]["MsgID"]).then(msg => {
						msg.delete();
					}).catch(console.error);

					startGiveaway(i);
				}
			}
			return;
		}

		if(GiveawayCreate[i]["Requirements"] == "0") {
			if(GiveawayCreate[i]["ReqInvites"] == "answering") {
				if(!message.content) {
					const Embed = new Discord.MessageEmbed()
					.setColor('#eda93b')
					.setTitle("⚠️ Invalid Invites")
					.setDescription("Please mention how many **invites** will be required to join the giveaway.");

					message.channel.send(Embed).then(msg => {
						setTimeout(() => {
							msg.delete().catch(console.error);
						}, 4 * 1000);
					}).catch(console.error);
				} else if(isNaN(message.content)) {
					const Embed = new Discord.MessageEmbed()
					.setColor('#eda93b')
					.setTitle("⚠️ Invalid Invites")
					.setDescription("The **invites number** must be a number.");

					message.channel.send(Embed).then(msg => {
						setTimeout(() => {
							msg.delete().catch(console.error);
						}, 4 * 1000);
					}).catch(console.error);
				} else {
					GiveawayCreate[i]["ReqInvites"] = parseInt(message.content);
					GiveawayCreate[i]["Requirements"] = "1";

					const Embed = new Discord.MessageEmbed()
					.setColor('#ac1414')
					.setAuthor("Requirement Setup", message.author.displayAvatarURL())
					.setTitle("Which requirement would you like ?")
					.setDescription("1️⃣  Invites\n2️⃣  New Invites\n3️⃣  Messages\n4️⃣  Level\n5️⃣  Role\n\n✅  Done")
					.setTimestamp()
					.setFooter(message.guild.name, BotAvatar);

					await message.channel.messages.fetch(GiveawayCreate[i]["MsgID"]).then(async msg => {
						msg.edit(Embed).catch(console.error);
						try {
							await msg.react("1️⃣");
							await msg.react("2️⃣");
							await msg.react("3️⃣");
							await msg.react("4️⃣");
							await msg.react("5️⃣");
							await msg.react("✅");
						} catch (error) {
							console.error('One of the emojis failed to react.');
						}
					}).catch(console.error);
				}
			}
			else if(GiveawayCreate[i]["ReqNewInvites"] == "answering") {
				if(!message.content) {
					const Embed = new Discord.MessageEmbed()
					.setColor('#eda93b')
					.setTitle("⚠️ Invalid Invites")
					.setDescription("Please mention how many **new invites** will be required to join the giveaway.");

					message.channel.send(Embed).then(msg => {
						setTimeout(() => {
							msg.delete().catch(console.error);
						}, 4 * 1000);
					}).catch(console.error);
				} else if(isNaN(message.content)) {
					const Embed = new Discord.MessageEmbed()
					.setColor('#eda93b')
					.setTitle("⚠️ Invalid Invites")
					.setDescription("The **invites number** must be a number.");

					message.channel.send(Embed).then(msg => {
						setTimeout(() => {
							msg.delete().catch(console.error);
						}, 4 * 1000);
					}).catch(console.error);
				} else {
					GiveawayCreate[i]["ReqNewInvites"] = parseInt(message.content);
					GiveawayCreate[i]["Requirements"] = "1";

					const Embed = new Discord.MessageEmbed()
					.setColor('#ac1414')
					.setAuthor("Requirement Setup", message.author.displayAvatarURL())
					.setTitle("Which requirement would you like ?")
					.setDescription("1️⃣  Invites\n2️⃣  New Invites\n3️⃣  Messages\n4️⃣  Level\n5️⃣  Role\n\n✅  Done")
					.setTimestamp()
					.setFooter(message.guild.name, BotAvatar);

					await message.channel.messages.fetch(GiveawayCreate[i]["MsgID"]).then(async msg => {
						msg.edit(Embed).catch(console.error);
						try {
							await msg.react("1️⃣");
							await msg.react("2️⃣");
							await msg.react("3️⃣");
							await msg.react("4️⃣");
							await msg.react("5️⃣");
							await msg.react("✅");
						} catch (error) {
							console.error('One of the emojis failed to react.');
						}
					}).catch(console.error);
				}
			}
			else if(GiveawayCreate[i]["ReqMessages"] == "answering") {
				if(!message.content) {
					const Embed = new Discord.MessageEmbed()
					.setColor('#eda93b')
					.setTitle("⚠️ Invalid Messages")
					.setDescription("Please mention how many **sent messages** will be required to join the giveaway.");

					message.channel.send(Embed).then(msg => {
						setTimeout(() => {
							msg.delete().catch(console.error);
						}, 4 * 1000);
					}).catch(console.error);
				} else if(isNaN(message.content)) {
					const Embed = new Discord.MessageEmbed()
					.setColor('#eda93b')
					.setTitle("⚠️ Invalid Messages")
					.setDescription("The **messages number** must be a number.");

					message.channel.send(Embed).then(msg => {
						setTimeout(() => {
							msg.delete().catch(console.error);
						}, 4 * 1000);
					}).catch(console.error);
				} else {
					GiveawayCreate[i]["ReqMessages"] = parseInt(message.content);
					GiveawayCreate[i]["Requirements"] = "1";

					const Embed = new Discord.MessageEmbed()
					.setColor('#ac1414')
					.setAuthor("Requirement Setup", message.author.displayAvatarURL())
					.setTitle("Which requirement would you like ?")
					.setDescription("1️⃣  Invites\n2️⃣  New Invites\n3️⃣  Messages\n4️⃣  Level\n5️⃣  Role\n\n✅  Done")
					.setTimestamp()
					.setFooter(message.guild.name, BotAvatar);

					await message.channel.messages.fetch(GiveawayCreate[i]["MsgID"]).then(async msg => {
						msg.edit(Embed).catch(console.error);
						try {
							await msg.react("1️⃣");
							await msg.react("2️⃣");
							await msg.react("3️⃣");
							await msg.react("4️⃣");
							await msg.react("5️⃣");
							await msg.react("✅");
						} catch (error) {
							console.error('One of the emojis failed to react.');
						}
					}).catch(console.error);
				}
			}
			else if(GiveawayCreate[i]["ReqLevel"] == "answering") {
				if(!message.content) {
					const Embed = new Discord.MessageEmbed()
					.setColor('#eda93b')
					.setTitle("⚠️ Invalid Level")
					.setDescription("Please mention the required **level** to join the giveaway.");

					message.channel.send(Embed).then(msg => {
						setTimeout(() => {
							msg.delete().catch(console.error);
						}, 4 * 1000);
					}).catch(console.error);
				} else if(isNaN(message.content)) {
					const Embed = new Discord.MessageEmbed()
					.setColor('#eda93b')
					.setTitle("⚠️ Invalid Level")
					.setDescription("The **level** must be a number.");

					message.channel.send(Embed).then(msg => {
						setTimeout(() => {
							msg.delete().catch(console.error);
						}, 4 * 1000);
					}).catch(console.error);
				} else {
					GiveawayCreate[i]["ReqLevel"] = parseInt(message.content);
					GiveawayCreate[i]["Requirements"] = "1";

					const Embed = new Discord.MessageEmbed()
					.setColor('#ac1414')
					.setAuthor("Requirement Setup", message.author.displayAvatarURL())
					.setTitle("Which requirement would you like ?")
					.setDescription("1️⃣  Invites\n2️⃣  New Invites\n3️⃣  Messages\n4️⃣  Level\n5️⃣  Role\n\n✅  Done")
					.setTimestamp()
					.setFooter(message.guild.name, BotAvatar);

					await message.channel.messages.fetch(GiveawayCreate[i]["MsgID"]).then(async msg => {
						msg.edit(Embed).catch(console.error);
						try {
							await msg.react("1️⃣");
							await msg.react("2️⃣");
							await msg.react("3️⃣");
							await msg.react("4️⃣");
							await msg.react("5️⃣");
							await msg.react("✅");
						} catch (error) {
							console.error('One of the emojis failed to react.');
						}
					}).catch(console.error);
				}
			}
			else if(GiveawayCreate[i]["ReqRole"] == "answering") {
				let ReqRoles = message.content.slice(0).trim().split(/ +/g), ReqRolesCount = 0, iReqRole = "";
				for(var j = 0; j < ReqRoles.length; j++) {
					let ReqRole;
					if(message.guild.roles.cache.get(ReqRoles[j])) {
						ReqRole = ReqRoles[j];
					} else {
						ReqRole = ReqRoles[j].substring(ReqRoles[j].lastIndexOf("<@&") + 3, ReqRoles[j].lastIndexOf(">"));
					}

					if(message.guild.roles.cache.get(ReqRole)) {
						if(j > 0) iReqRole += ", ";
						iReqRole += ReqRole;
						ReqRolesCount ++;
					}
				}

				if(!message.content || ReqRolesCount < 1) {
					const Embed = new Discord.MessageEmbed()
					.setColor('#eda93b')
					.setTitle("⚠️ Invalid Level")
					.setDescription("Please type the **role(s)** or **role(s) id** that the user must have in order to join the giveaway.\nIf multiple, separate each **role** with a space.");

					message.channel.send(Embed).then(msg => {
						setTimeout(() => {
							msg.delete().catch(console.error);
						}, 4 * 1000);
					}).catch(console.error);
					return;
				}

				GiveawayCreate[i]["ReqRole"] = iReqRole;
				GiveawayCreate[i]["Requirements"] = "1";

				const Embed = new Discord.MessageEmbed()
				.setColor('#ac1414')
				.setAuthor("Requirement Setup", message.author.displayAvatarURL())
				.setTitle("Which requirement would you like ?")
				.setDescription("1️⃣  Invites\n2️⃣  New Invites\n3️⃣  Messages\n4️⃣  Level\n5️⃣  Role\n\n✅  Done")
				.setTimestamp()
				.setFooter(message.guild.name, BotAvatar);

				await message.channel.messages.fetch(GiveawayCreate[i]["MsgID"]).then(async msg => {
					msg.edit(Embed).catch(console.error);
					try {
						await msg.react("1️⃣");
						await msg.react("2️⃣");
						await msg.react("3️⃣");
						await msg.react("4️⃣");
						await msg.react("5️⃣");
						await msg.react("✅");
					} catch (error) {
						console.error('One of the emojis failed to react.');
					}
				}).catch(console.error);
			}
			return;
		}
	}
	
	if(/(?:https?:\/)?discord(?:app.com\/invite|.gg)/gi.test(message.content)) {
		if(message.member.guild.owner.id != message.author.id) {
			message.delete().catch(console.error);
			
			const server_rules_channel = message.guild.channels.cache.get(server_rules);
			await message.reply(`You've been warned for posting discord server invite link. Please read the ${server_rules_channel}!`).then(msg => {
				setTimeout(() => {
					msg.delete().catch(console.error);
				}, 6 * 1000);
			});
			
			const Embed = new Discord.MessageEmbed()
			.setColor('#ac1414')
			.setAuthor(`Message Deleted | ${message.author.tag}`, message.author.displayAvatarURL())
			.addField('Offender:', `${message.author.tag} **|** <@${message.author.id}>`, true)
			.addField('Responsible moderator:', `${client.user.tag} **|** <@${client.user.id}>`, true)
			.addField('Reason:', `Automatic action carried out for posting invites.`)
			.setTimestamp()
			.setFooter(`ID: ${message.author.id}`, client.user.displayAvatarURL());
			
			const mod_log_channel = message.guild.channels.cache.get(mod_log);
			await mod_log_channel.send(Embed).catch(console.error);

			cooldown.add("BotPermissions");
			await mod_log_channel.send(`!warn <@${message.author.id}> Automatic action carried out for posting invites.`).catch(console.error);
		}
	}
	
	if(!message.author.bot && message.channel.id != private_room) {
		db.query(`SELECT * FROM ${db_LevelSystem} WHERE GuildID = '${message.guild.id}' AND UserID = '${message.author.id}'`, async (err, rows) => {
			if(err) throw err;
			
			function getEXP2(Level) {
				return 5 * (Level * Level) + 50 * Level + 100;
			}

			let AddedEXP = Math.floor(Math.random() * (25 - 15 + 1)) + 15;
			const currentTimestamp = new Date().getTime();
			
			if(!rows[0]) {
				db.query(`INSERT INTO ${db_LevelSystem} (GuildID, UserID, Level, EXP, EXP2, MessagesCount, LastMessageSentTime) VALUES ('${message.guild.id}', '${message.author.id}', '0', '${AddedEXP}', '${getEXP2(0)}', '1', '${currentTimestamp}')`);
				return;
			}

			let Level = parseInt(rows[0].Level);
			let EXP = parseInt(rows[0].EXP);
			let EXP2 = parseInt(rows[0].EXP2);
			let MessagesCount = parseInt(rows[0].MessagesCount);
			let LastMessageSentTime = parseInt(rows[0].LastMessageSentTime);
			
			MessagesCount ++;

			if(currentTimestamp > LastMessageSentTime + 60000) {
				if((EXP + AddedEXP) < EXP2) {
					EXP += AddedEXP;
				} else {
					Level ++;
					EXP = AddedEXP - (EXP2 - EXP);
					EXP2 = getEXP2(Level);
				
					const Embed = new Discord.MessageEmbed()
					.setColor('#ac1414')
					.setAuthor("Level Up!", message.author.displayAvatarURL())
					.setDescription("GG <@" + message.author.id + ">, you just advanced to **level " + Level + "**!\nType `" + config.prefix + "rank` to see your rank in the server on <#" + bot_commands + ">, and `" + config.prefix + "lb` or `" + config.prefix + "top` to see the leaderboard!")
					.setTimestamp()
					.setFooter(message.guild.name, BotAvatar);
					
					await message.channel.send(Embed).catch(console.error);
				}
			}
			
			db.query(`UPDATE ${db_LevelSystem} SET Level = '${Level}', EXP = '${EXP}', EXP2 = '${EXP2}', MessagesCount = '${MessagesCount}', LastMessageSentTime = '${currentTimestamp}' WHERE GuildID = '${message.guild.id}' AND UserID = '${message.author.id}'`);
		});
	}
	
	if(message.content.indexOf(config.prefix) !== 0)
		return;
	
	if(command === "snowflake" || command === "sftd") {
		let snowflake = args.slice(0, 1).join();
		let timestamp = Discord.SnowflakeUtil.deconstruct(snowflake).timestamp;

		const Embed = new Discord.MessageEmbed()
		.setColor('#ac1414')
		.setAuthor(`Discord Snowflake to Date`, message.author.displayAvatarURL())
		.addField(`Timestamp`, `${timestamp}`, true)
		.addField(`Date`, `${dateFormat(new Date(timestamp), "GMT:ddd, mmm dd, yyyy, hh:MM TT (Z)")}`, true)
		.setTimestamp()
		.setFooter(message.guild.name, BotAvatar);
			
		await message.channel.send(Embed).catch(console.error);
	}
	if(command === "invcode" || command === "invitecode" || command === "invitelink") {
		if(!message.member.hasPermission('KICK_MEMBERS'))
			return;

		let InviteCode = args.slice(0, 1).join();

		await message.guild.fetchInvites().then(async guildInvites => {
			let invite = guildInvites.find(i => i.code == InviteCode);

			if(!invite)
				return;

			let inviter = invite.inviter;
			let InviterID = inviter.id;
			let InviterTag = inviter.username + '#' + inviter.discriminator;
			let InviteCreateDate = invite.createdTimestamp;
			let InviteChannel = invite.channel.id;
			
			const Embed = new Discord.MessageEmbed()
			.setColor('#ac1414')
			.setAuthor(`Invite Informations`, `https://cdn.discordapp.com/avatars/${InviterID}/${inviter.avatar}.webp`)
			.addField(`Invite Code`, `${InviteCode}`)
			.addField(`Inviter`, `${InviterTag} **|** <@${InviterID}>`, true)
			.addField(`Invite Channel`, `<#${InviteChannel}>`, true)
			.addField(`\u200b`, `\u200b`, true)
			.addField(`Invite Created Timestamp`, `${InviteCreateDate}`, true)
			.addField(`Invite Created Date`, `${dateFormat(new Date(InviteCreateDate), "GMT:ddd, mmm dd, yyyy, hh:MM TT (Z)")}`, true)
			.addField(`\u200b`, `\u200b`, true)
			.setTimestamp()
			.setFooter(message.guild.name, BotAvatar);
				
			await message.channel.send(Embed).catch(console.error);
		});
	}
	if(command === "dm") {
		if(message.member.guild.owner.id != message.author.id)
			return;
		
		let receiver_id = args.slice(0, 1).join();
		let message_content = "";
		message_content = args.slice(1).join(' ');
		if(message.attachments.size > 0) {
			message.attachments.cache.forEach(attachment => {
				message_content += `\n${attachment.url}`;
			});
		}
		
		const receiver = message.client.users.cache.get(receiver_id);
		await receiver.send(message_content).catch(error => {
			message.reply(`Could not send message to ${receiver.name}!\n**Reason**: ${error}`)
		});
	}
	if(command === "dmall") {
		if(message.member.guild.owner.id != message.author.id)
			return;
		
		let sayMessage = "";
		let sentMessages = 0;

		sayMessage = args.join(' ');
		if(message.attachments.size > 0) {
			message.attachments.cache.forEach(attachment => {
				sayMessage += `\n${attachment.url}`;
			});
		}

		await message.guild.members.cache.filter(member => !member.user.bot).forEach(async member => {
			await member.send(sayMessage).then(() => {
				sentMessages ++;
			}).catch(error => {
				message.reply(`Could not send message to ${member.name}!\n**Reason**: ${error}`).catch(console.error);
			});
		}).then(() => {
			message.channel.send(`Message sent to \`${sentMessages}/${message.guild.members.cache.size}\` members.`).catch(console.error);
		}).catch(console.error);
	}
	if(command === "say") {
		if(message.member.guild.owner.id != message.author.id)
			return;
		
		message.delete().catch(console.error);
		
		let sayMessage = "";
		sayMessage = args.join(' ');
		if(message.attachments.size > 0) {
			message.attachments.cache.forEach(attachment => {
				sayMessage += `\n${attachment.url}`;
			});
		}

		cooldown.add("BotPermissions");
		await message.channel.send(sayMessage).catch(console.error);
	}
	if(command === "edit") {
		if(message.member.guild.owner.id != message.author.id)
			return;
		
		message.delete().catch(console.error);
		
		let message_channel, message_channel_id;
		if(message.mentions.channels.first()) {
			message_channel = message.mentions.channels.first();
			message_channel_id = message_channel.id;
		} else if(message.guild.channels.cache.get(args.slice(0, 1).join())) {
			message_channel_id = args.slice(0, 1).join();
			message_channel = message.guild.channels.cache.get(message_channel_id);
		} else {
			return message.reply("Please mention a valid **Channel** in this server!\n**Usage:** `" + config.prefix + command + " <Channel/Channel ID> <Message ID> <Text>`");
		}
		
		let message_id = args.slice(1, 2).join();
		if(!message_id)
			return message.reply("Please mention a valid **Message ID** in this server!\n**Usage:** `" + config.prefix + command + " <Channel/Channel ID> <Message ID> <Text>`");
		
		let message_content = args.slice(2).join(' ');
		if(message.attachments.size > 0) {
			message.attachments.cache.forEach(attachment => {
				message_content += `\n${attachment.url}`;
			});
		}
		if(!message_content)
			return message.reply("Please type the **text** to edit the message!\n**Usage:** `" + config.prefix + command + " <Channel/Channel ID> <Message ID> <Text>`");
		
		await message_channel.messages.fetch(message_id).then(msg => {
			msg.edit(message_content).catch(error => {
				message.reply(`Couldn't edit message!\n**Reason**: ${error}`);
			});
		}).catch(console.error);
	}
	if(command === "warn") {
		if(!message.member.hasPermission('KICK_MEMBERS'))
			return;
		
		message.delete().catch(console.error);
		
		if(message.member.guild.owner.id != message.author.id) {
			const cooldown = 15 * 1000;
			if(commandsCooldown[message.guild.id + message.author.id + "-" + command]) {
				const timeleft = dateDifference(new Date(), new Date(commandsCooldown[message.guild.id + message.author.id + "-" + command]), {ms: true});
				const Embed = new Discord.MessageEmbed()
				.setColor('#ac1414')
				.setAuthor("Slow it down!", message.author.displayAvatarURL())
				.setDescription("You can run this command again in `" + timeleft + "` !")
				.setTimestamp()
				.setFooter(message.guild.name, BotAvatar);
					
				return await message.channel.send(Embed).catch(console.error);
			} else {
				commandsCooldown[message.guild.id + message.author.id + "-" + command] = new Date().getTime() + cooldown;
				setTimeout(() => {
					delete commandsCooldown[message.guild.id + message.author.id + "-" + command];
				}, cooldown);
			}
		}
		
		let User, UserID, UserTag, UserAvatar;
			
		if(message.mentions.members.first()) {
			User = message.mentions.members.first();
			UserID = User.id;
			UserTag = User.user.tag;
			UserAvatar = User.user.displayAvatarURL();
		} else if(message.guild.members.cache.get(args[0])) {
			UserID = args.slice(0, 1).join();
			User = message.guild.members.cache.get(UserID);
			UserTag = User.user.tag;
			UserAvatar = User.user.displayAvatarURL();
		} else {
			return message.reply("Please mention a valid member of this server!\n**Usage:** `" + config.prefix + command + " <Member/Member ID> <Reason>`");
		}
		
		let Reason = args.slice(1).join(' ');
		if(!Reason)
			Reason = "No reason provided";
		
		let ModID = message.author.id;
		let ModTag = message.author.tag;
		let ModAvatar = message.author.displayAvatarURL();
		
		const currentTimestamp = new Date().getTime();
		
		db.query(`SELECT * FROM ${db_ModWarns} WHERE GuildID = '${message.guild.id}' AND UserID = '${UserID}'`, (err, rows) => {
			if(err) throw err;
			
			let Warnings;
			
			if(!rows[0]) {
				Warnings = 1;
				db.query(`INSERT INTO ${db_ModWarns} (GuildID, UserID, Warnings) VALUES ('${message.guild.id}', '${UserID}', '${Warnings}')`);
			} else {
				Warnings = parseInt(rows[0].Warnings) + 1;
				db.query(`UPDATE ${db_ModWarns} SET Warnings = '${Warnings}' WHERE UserID = '${UserID}'`);
			}
			
			db.query(`INSERT INTO ${db_ModLogs} (GuildID, ChannelID, MsgID, Action, Reason, ModID, ModTag, ModAvatar, UserID, UserTag, UserAvatar, Date) VALUES ('${message.guild.id}', '${mod_log}', '', 'Warning ${Warnings}', '${Reason}', '${ModID}', ${db.escape(ModTag)}, '${ModAvatar}', '${UserID}', ${db.escape(UserTag)}, '${UserAvatar}', '${currentTimestamp}')`, async (err2, rows2, fields2) => {
				if(err2) throw err2;
				
				let editReason = "";
				if(Reason == "No reason provided")
					editReason = ", use `" + config.prefix + "reason " + rows2.insertId + " <Text>` to add one.";
				
				// Send to Mod Log
				const Embed = new Discord.MessageEmbed()
				.setColor('#ac1414')
				.setAuthor(`Warning ${Warnings} | ${UserTag}`, UserAvatar)
				.addField('Offender:', `${UserTag} **|** <@${UserID}>`, true)
				.addField('Responsible moderator:', `${ModTag} **|** <@${ModID}>`, true)
				.addField('Reason:', `${Reason + editReason}`)
				.setTimestamp()
				.setFooter(`Case: ${rows2.insertId} | ID: ${UserID}`, ModAvatar);
				
				await message.guild.channels.cache.get(mod_log).send(Embed).then(async msg => {
					db.query(`UPDATE ${db_ModLogs} SET MsgID = '${msg.id}' WHERE ID = '${rows2.insertId}'`);
					
					// Send to DM
					const Embed2 = new Discord.MessageEmbed()
					.setColor('#ac1414')
					.setAuthor(`Warning ${Warnings}`, UserAvatar)
					.setDescription(`You have been warned from [${message.guild.name}](https://discordapp.com/channels/${message.guild.id}/${mod_log}/${msg.id}) by **${ModTag}** (<@${ModID}>) !\n**Reason**: ${Reason}`)
					.setTimestamp()
					.setFooter(message.guild.name, BotAvatar);
					
					await User.send(Embed2).catch(console.log);
				}).catch(console.error);
			});
			
			if(Warnings > 1) {
				const mod_log_channel = message.guild.channels.cache.get(mod_log);
				setTimeout(async () => {
					if(Warnings == 2) {
						cooldown.add("BotPermissions");
						await mod_log_channel.send(`!mute ${UserID} 24hours 2nd warning from **${ModTag}** (**reason:** ${Reason})`).catch(console.error);;
					} else if(Warnings == 3) {
						cooldown.add("BotPermissions");
						await mod_log_channel.send(`!mute ${UserID} 96hours 3th warning from **${ModTag}** (**reason:** ${Reason})`).catch(console.error);;
					} else if(Warnings == 4) {
						cooldown.add("BotPermissions");
						await mod_log_channel.send(`!ban ${UserID} 1week 4th warning from **${ModTag}** (**reason:** ${Reason})`).catch(console.error);;
					} else if(Warnings == 5) {
						cooldown.add("BotPermissions");
						await mod_log_channel.send(`!ban ${UserID} 0 5th and last warning from **${ModTag}** (**reason:** ${Reason})`).catch(console.error);;
					}
				}, 3 * 1000);
			}
		});
	}
	if(command === "warnings" || command === "warns") {
		if(!message.member.hasPermission('KICK_MEMBERS'))
			return;
		
		message.delete().catch(console.error);
		
		if(message.member.guild.owner.id != message.author.id) {
			const warnings_cooldown = 10 * 1000;
			if(commandsCooldown[message.guild.id + message.author.id + "-" + "warnings"]) {
				const timeleft = dateDifference(new Date(), new Date(commandsCooldown[message.guild.id + message.author.id + "-" + "warnings"]), {ms: true});
				const Embed = new Discord.MessageEmbed()
				.setColor('#ac1414')
				.setAuthor("Slow it down!", message.author.displayAvatarURL())
				.setDescription("You can run this command again in `" + timeleft + "` !")
				.setTimestamp()
				.setFooter(message.guild.name, BotAvatar);
					
				return await message.channel.send(Embed).catch(console.error);
			} else {
				commandsCooldown[message.guild.id + message.author.id + "-" + "warnings"] = new Date().getTime() + cooldown;
				setTimeout(() => {
					delete commandsCooldown[message.guild.id + message.author.id + "-" + "warnings"];
				}, cooldown);
			}
		}
		
		let UserID, UserTag, UserAvatar;
		
		if(message.mentions.members.first()) {
			UserID = message.mentions.members.first().id;
			UserTag = message.mentions.members.first().user.tag;
			UserAvatar = message.mentions.members.first().user.displayAvatarURL();
		} else if(args.slice(0, 1).join()) {
			UserID = args.slice(0, 1).join();
			if(message.client.users.cache.get(UserID)) {
				UserTag = message.client.users.cache.get(UserID).tag;
				UserAvatar = message.client.users.cache.get(UserID).displayAvatarURL();
			}
		}
		
		db.query(`SELECT * FROM ${db_ModLogs} WHERE GuildID = '${message.guild.id}' AND UserID = '${UserID}' AND Action LIKE '%Warning%'`, async (err, rows) => {
			if(err) throw err;
			
			if(!rows[0])
				return message.channel.send("This user has no **Warnings**.");
			
			let Description = "";
			
			for(var i = 0; i < rows.length; i++) {
				let Pos = i + 1;
				let CaseID = rows[i].ID;
				let GuildID = rows[i].GuildID;
				let ChannelID = rows[i].ChannelID;
				let MsgID = rows[i].MsgID;
				let Reason = rows[i].Reason;
				let ModID = rows[i].ModID;
				let ModTag = rows[i].ModTag;
				let Timestamp = parseInt(rows[i].Date);
				const diffDate = dateDifference(new Date(Timestamp), new Date(), {bold: true});

				Description += `\`${Pos}.\` [Case #${CaseID}](https://discordapp.com/channels/${GuildID}/${ChannelID}/${MsgID}) - ${diffDate} ago\n**Moderator —** ${ModTag} **|** <@${ModID}>\n**Reason —** ${Reason}\n\n`;
			}
			
			if(!UserTag)
				UserTag = rows[rows.length-1].UserTag;
			
			if(!UserAvatar)
				UserAvatar = rows[rows.length-1].UserAvatar;

			const Embed = new Discord.MessageEmbed()
			.setColor('#ac1414')
			.setAuthor(`Warnings for ${UserTag}`, UserAvatar)
			.setDescription(Description)
			.setFooter(`${message.guild.name} ─ ${rows.length} Warnings`, BotAvatar);
			
			await message.channel.send(Embed).catch(console.error);
		});
	}
	/*
	if(command === "clearwarns") {
		if(message.member.guild.owner.id != message.author.id)
			return;
		
		let UserID;
		
		if(message.mentions.members.first()) {
			UserID = message.mentions.members.first().id;
		} else if(message.guild.members.cache.get(args[0])) {
			UserID = args.slice(0, 1).join();
		}
		
		db.query(`SELECT * FROM ${db_ModWarns} WHERE UserID = '${UserID}'`, (err, rows) => {
			if(err) throw err;
			
			if(!rows[0])
				return;
			
			db.query(`UPDATE ${db_ModWarns} SET Warnings = '0' WHERE ID = '${UserID}'`);
		});
	}
	*/
	if(command === "mute") {
		if(!message.member.hasPermission('MUTE_MEMBERS'))
			return;
		
		message.delete().catch(console.error);
		
		if(message.member.guild.owner.id != message.author.id) {
			const cooldown = 15 * 1000;
			if(commandsCooldown[message.guild.id + message.author.id + "-" + command]) {
				const timeleft = dateDifference(new Date(), new Date(commandsCooldown[message.guild.id + message.author.id + "-" + command]), {ms: true});
				const Embed = new Discord.MessageEmbed()
				.setColor('#ac1414')
				.setAuthor("Slow it down!", message.author.displayAvatarURL())
				.setDescription("You can run this command again in `" + timeleft + "` !")
				.setTimestamp()
				.setFooter(message.guild.name, BotAvatar);
					
				return await message.channel.send(Embed).catch(console.error);
			} else {
				commandsCooldown[message.guild.id + message.author.id + "-" + command] = new Date().getTime() + cooldown;
				setTimeout(() => {
					delete commandsCooldown[message.guild.id + message.author.id + "-" + command];
				}, cooldown);
			}
		}
		
		let User, UserID, UserTag, UserAvatar;
			
		if(message.mentions.members.first()) {
			User = message.mentions.members.first();
			UserID = User.id;
			UserTag = User.user.tag;
			UserAvatar = User.user.displayAvatarURL();
		} else if(message.guild.members.cache.get(args[0])) {
			UserID = args.slice(0, 1).join();
			User = message.guild.members.cache.get(UserID);
			UserTag = User.user.tag;
			UserAvatar = User.user.displayAvatarURL();
		} else {
			return message.reply("Please mention a valid member of this server!\n**Usage:** `" + config.prefix + command + " <Member/Member ID> <Duration> <Reason>`");
		}
		
		let duration = args.slice(1,2).join().toLowerCase();
		if(!duration || (ms(duration) === undefined && !duration.includes("perm")))
			return message.reply("Please type the duration of mute for this member!\n**Usage:** `" + config.prefix + command + " <Mention Member> <Duration> <Reason>`");
		
		let Reason = args.slice(2).join(' ');
		if(!Reason)
			Reason = "No reason provided";
		
		let ModID = message.author.id;
		let ModTag = message.author.tag;
		let ModAvatar = message.author.displayAvatarURL();
		
		const currentTimestamp = new Date().getTime();
		
		let Action;
		if(!duration.includes("perm") && duration != "0") {
			Action = `Mute for ${ms(ms(duration), { long: true })}`;
		} else {
			Action = `Permanent Mute`;
		}

		const mrole = message.guild.roles.cache.get(MutedRole);
		await User.roles.add(mrole).then(() => {
			db.query(`INSERT INTO ${db_ModLogs} (GuildID, ChannelID, MsgID, Action, Reason, ModID, ModTag, ModAvatar, UserID, UserTag, UserAvatar, Date) VALUES ('${message.guild.id}', '${mod_log}', '', '${Action}', '${Reason}', '${ModID}', ${db.escape(ModTag)}, '${ModAvatar}', '${UserID}', ${db.escape(UserTag)}, '${UserAvatar}', '${currentTimestamp}')`, async (err, rows, fields) => {
				if(err) throw err;
				
				let editReason = "";
				if(Reason == "No reason provided")
					editReason = ", use `" + config.prefix + "reason " + rows.insertId + " <Text>` to add one.";
				
				if(!duration.includes("perm") && duration != "0") {
					db.query(`INSERT INTO ModTasks (CaseID, Date) VALUES ('${rows.insertId}', '${currentTimestamp + ms(duration)}')`);
				}
				
				// Send to Mod Log
				const Embed = new Discord.MessageEmbed()
				.setColor('#ac1414')
				.setAuthor(`${Action} | ${UserTag}`, UserAvatar)
				.addField('Offender:', `${UserTag} **|** <@${UserID}>`, true)
				.addField('Responsible moderator:', `${ModTag} **|** <@${ModID}>`, true)
				.addField('Reason:', `${Reason + editReason}`)
				.setTimestamp()
				.setFooter(`Case: ${rows.insertId} | ID: ${UserID}`, ModAvatar);
				
				await message.guild.channels.cache.get(mod_log).send(Embed).then(async msg => {
					db.query(`UPDATE ${db_ModLogs} SET MsgID = '${msg.id}' WHERE ID = '${rows.insertId}'`);
					
					// Send to DM
					const Embed2 = new Discord.MessageEmbed()
					.setColor('#ac1414')
					.setAuthor(`${Action}`, UserAvatar, msg.url)
					.setDescription(`You have been muted from [${message.guild.name}](https://discordapp.com/channels/${message.guild.id}/${mod_log}/${msg.id}) for **${duration}** by **${ModTag}** (<@${ModID}>) !\n**Reason**: ${Reason}`)
					.setTimestamp()
					.setFooter(message.guild.name, BotAvatar);
					
					await User.send(Embed2).catch(console.log);
				}).catch(console.error);
			});
		}).catch(error => {
			message.reply(`Couldn't mute ${UserTag}!\n**Reason**: ${error}`)
		});
	}
	if(command === "unmute") {
		if(!message.member.hasPermission('MUTE_MEMBERS'))
			return;
		
		message.delete().catch(console.error);
		
		if(message.member.guild.owner.id != message.author.id) {
			const cooldown = 15 * 1000;
			if(commandsCooldown[message.guild.id + message.author.id + "-" + command]) {
				const timeleft = dateDifference(new Date(), new Date(commandsCooldown[message.guild.id + message.author.id + "-" + command]), {ms: true});
				const Embed = new Discord.MessageEmbed()
				.setColor('#ac1414')
				.setAuthor("Slow it down!", message.author.displayAvatarURL())
				.setDescription("You can run this command again in `" + timeleft + "` !")
				.setTimestamp()
				.setFooter(message.guild.name, BotAvatar);
					
				return await message.channel.send(Embed).catch(console.error);
			} else {
				commandsCooldown[message.guild.id + message.author.id + "-" + command] = new Date().getTime() + cooldown;
				setTimeout(() => {
					delete commandsCooldown[message.guild.id + message.author.id + "-" + command];
				}, cooldown);
			}
		}
		
		let User, UserID, UserTag, UserAvatar;
			
		if(message.mentions.members.first()) {
			User = message.mentions.members.first();
			UserID = User.id;
			UserTag = User.user.tag;
			UserAvatar = User.user.displayAvatarURL();
		} else if(message.guild.members.cache.get(args[0])) {
			UserID = args.slice(0, 1).join();
			User = message.guild.members.cache.get(UserID);
			UserTag = User.user.tag;
			UserAvatar = User.user.displayAvatarURL();
		} else {
			return message.reply("Please mention a valid member of this server!\n**Usage:** `" + config.prefix + command + " <Member/Member ID> <Reason>`");
		}

		if(!User.roles.cache.has(MutedRole))
			return message.reply("This member is not muted!");
		
		let Reason = args.slice(1).join(' ');
		if(!Reason)
			Reason = "No reason provided";
		
		let ModID = message.author.id;
		let ModTag = message.author.tag;
		let ModAvatar = message.author.displayAvatarURL();
		
		const currentTimestamp = new Date().getTime();
		
		const mrole = message.guild.roles.cache.get(MutedRole);
		await User.roles.remove(mrole).then(() => {
			db.query(`INSERT INTO ${db_ModLogs} (GuildID, ChannelID, MsgID, Action, Reason, ModID, ModTag, ModAvatar, UserID, UserTag, UserAvatar, Date) VALUES ('${message.guild.id}', '${mod_log}', '', 'Unmute', '${Reason}', '${ModID}', ${db.escape(ModTag)}, '${ModAvatar}', '${UserID}', ${db.escape(UserTag)}, '${UserAvatar}', '${currentTimestamp}')`, async (err, rows, fields) => {
				if(err) throw err;
				
				let editReason = "";
				if(Reason == "No reason provided")
					editReason = ", use `" + config.prefix + "reason " + rows2.insertId + " <Text>` to add one.";
				
				// Send to Mod Log
				const Embed = new Discord.MessageEmbed()
				.setColor('#ac1414')
				.setAuthor(`Unmute | ${UserTag}`, UserAvatar)
				.addField('Offender:', `${UserTag} **|** <@${UserID}>`, true)
				.addField('Responsible moderator:', `${ModTag} **|** <@${ModID}>`, true)
				.addField('Reason:', `${Reason + editReason}`)
				.setTimestamp()
				.setFooter(`Case: ${rows.insertId} | ID: ${UserID}`, ModAvatar);
				
				await message.guild.channels.cache.get(mod_log).send(Embed).then(async msg => {
					db.query(`UPDATE ${db_ModLogs} SET MsgID = '${msg.id}' WHERE ID = '${rows.insertId}'`);
					
					// Send to DM
					const Embed2 = new Discord.MessageEmbed()
					.setColor('#ac1414')
					.setAuthor(`Unmute`, UserAvatar, msg.url)
					.setDescription(`You have been unmuted from [${message.guild.name}](https://discordapp.com/channels/${message.guild.id}/${mod_log}/${msg.id}) by **${ModTag}** (<@${ModID}>) !\n**Reason**: ${Reason}`)
					.setTimestamp()
					.setFooter(message.guild.name, BotAvatar);
					
					await User.send(Embed2).catch(console.log);
				}).catch(console.error);
			});
		}).catch(error => {
			message.reply(`Couldn't unmute ${UserTag}!\n**Reason**: ${error}`)
		});
	}
	if(command === "kick") {
		if(!message.member.hasPermission('KICK_MEMBERS'))
			return;
		
		message.delete().catch(console.error);
		
		if(message.member.guild.owner.id != message.author.id) {
			const cooldown = 60 * 1000;
			if(commandsCooldown[message.guild.id + message.author.id + "-" + command]) {
				const timeleft = dateDifference(new Date(), new Date(commandsCooldown[message.guild.id + message.author.id + "-" + command]), {ms: true});
				const Embed = new Discord.MessageEmbed()
				.setColor('#ac1414')
				.setAuthor("Slow it down!", message.author.displayAvatarURL())
				.setDescription("You can run this command again in `" + timeleft + "` !")
				.setTimestamp()
				.setFooter(message.guild.name, BotAvatar);
					
				return await message.channel.send(Embed).catch(console.error);
			} else {
				commandsCooldown[message.guild.id + message.author.id + "-" + command] = new Date().getTime() + cooldown;
				setTimeout(() => {
					delete commandsCooldown[message.guild.id + message.author.id + "-" + command];
				}, cooldown);
			}
		}
		
		let User, UserID, UserTag, UserAvatar;
			
		if(message.mentions.members.first()) {
			User = message.mentions.members.first();
			UserID = User.id;
			UserTag = User.user.tag;
			UserAvatar = User.user.displayAvatarURL();
		} else if(message.guild.members.cache.get(args[0])) {
			UserID = args.slice(0, 1).join();
			User = message.guild.members.cache.get(UserID);
			UserTag = User.user.tag;
			UserAvatar = User.user.displayAvatarURL();
		} else {
			return message.reply("Please mention a valid member of this server!\n**Usage:** `" + config.prefix + command + " <Member/Member ID> <Reason>`");
		}

		if(!User.kickable)
			return message.reply("I cannot kick this user!");
		
		let Reason = args.slice(1).join(' ');
		if(!Reason)
			Reason = "No reason provided";
		
		let ModID = message.author.id;
		let ModTag = message.author.tag;
		let ModAvatar = message.author.displayAvatarURL();
		
		// Send to DM
		const Embed = new Discord.MessageEmbed()
		.setColor('#ac1414')
		.setAuthor(`Kick`, UserAvatar)
		.setDescription(`You have been kicked from [${message.guild.name}](https://discordapp.com/channels/${message.guild.id}/${mod_log}) by **${ModTag}** (<@${ModID}>) !\n**Reason**: ${Reason}`)
		.setTimestamp()
		.setFooter(message.guild.name, BotAvatar);
		
		await User.send(Embed).catch(console.log);
		
		const currentTimestamp = new Date().getTime();
		
		await User.kick(`${Reason} - By: ${ModTag} | ${ModID}`).then(() => {
			db.query(`INSERT INTO ${db_ModLogs} (GuildID, ChannelID, MsgID, Action, Reason, ModID, ModTag, ModAvatar, UserID, UserTag, UserAvatar, Date) VALUES ('${message.guild.id}', '${mod_log}', '', 'Kick', '${Reason}', '${ModID}', ${db.escape(ModTag)}, '${ModAvatar}', '${UserID}', ${db.escape(UserTag)}, '${UserAvatar}', '${currentTimestamp}')`, async (err, rows, fields) => {
				if(err) throw err;
				
				let editReason = "";
				if(Reason == "No reason provided")
					editReason = ", use `" + config.prefix + "reason " + rows2.insertId + " <Text>` to add one.";
				
				// Send to Mod Log
				const Embed = new Discord.MessageEmbed()
				.setColor('#ac1414')
				.setAuthor(`Kick | ${UserTag}`, UserAvatar)
				.addField('Offender:', `${UserTag} **|** <@${UserID}>`, true)
				.addField('Responsible moderator:', `${ModTag} **|** <@${ModID}>`, true)
				.addField('Reason:', `${Reason + editReason}`)
				.setTimestamp()
				.setFooter(`Case: ${rows.insertId} | ID: ${UserID}`, ModAvatar);
				
				await message.guild.channels.cache.get(mod_log).send(Embed).then(msg => {
					db.query(`UPDATE ${db_ModLogs} SET MsgID = '${msg.id}' WHERE ID = '${rows.insertId}'`);
				}).catch(console.log);
			});
		}).catch(error => {
			message.reply(`Couldn't kick ${UserTag}!\n**Reason**: ${error}`)
		});
	}
	if(command === "ban") {
		if(!message.member.hasPermission('BAN_MEMBERS'))
			return;
		
		message.delete().catch(console.error);
		
		if(message.member.guild.owner.id != message.author.id) {
			const cooldown = 60 * 1000;
			if(commandsCooldown[message.guild.id + message.author.id + "-" + command]) {
				const timeleft = dateDifference(new Date(), new Date(commandsCooldown[message.guild.id + message.author.id + "-" + command]), {ms: true});
				const Embed = new Discord.MessageEmbed()
				.setColor('#ac1414')
				.setAuthor("Slow it down!", message.author.displayAvatarURL())
				.setDescription("You can run this command again in `" + timeleft + "` !")
				.setTimestamp()
				.setFooter(message.guild.name, BotAvatar);
					
				return await message.channel.send(Embed).catch(console.error);
			} else {
				commandsCooldown[message.guild.id + message.author.id + "-" + command] = new Date().getTime() + cooldown;
				setTimeout(() => {
					delete commandsCooldown[message.guild.id + message.author.id + "-" + command];
				}, cooldown);
			}
		}
		
		let User, UserID, UserTag, UserAvatar;
			
		if(message.mentions.members.first()) {
			User = message.mentions.members.first();
			UserID = User.id;
			UserTag = User.user.tag;
			UserAvatar = User.user.displayAvatarURL();
		} else if(message.guild.members.cache.get(args[0])) {
			UserID = args.slice(0, 1).join();
			User = message.guild.members.cache.get(UserID);
			UserTag = User.user.tag;
			UserAvatar = User.user.displayAvatarURL();
		} else {
			return message.reply("Please mention a valid member of this server!\n**Usage:** `" + config.prefix + command + " <Member/Member ID> <Duration> <Reason>`");
		}

		if(!User.bannable)
			return message.reply("I cannot ban this user!");
		
		let duration = args.slice(1,2).join().toLowerCase();
		if(!duration || (ms(duration) === undefined && !duration.includes("perm")))
			return message.reply("Please type the duration of ban for this member!\n**Usage:** `" + config.prefix + command + " <Mention Member> <Duration> <Reason>`");
		
		let Reason = args.slice(2).join(' ');
		if(!Reason)
			Reason = "No reason provided";
		
		let ModID = message.author.id;
		let ModTag = message.author.tag;
		let ModAvatar = message.author.displayAvatarURL();
		
		const currentTimestamp = new Date().getTime();
		
		let Action;
		if(!duration.includes("perm") && duration != "0") {
			Action = `Ban for ${ms(ms(duration), { long: true })}`;
		} else {
			Action = `Permanent Ban`;
		}
		
		// Send to DM
		const Embed = new Discord.MessageEmbed()
		.setColor('#ac1414')
		.setAuthor(`${Action}`, UserAvatar)
		.setDescription(`You have been banned from [${message.guild.name}](https://discordapp.com/channels/${message.guild.id}/${mod_log}) by **${ModTag}** (<@${ModID}>) !\n**Reason**: ${Reason}`)
		.setTimestamp()
		.setFooter(message.guild.name, BotAvatar);

		await User.send(Embed).catch(console.log);
		
		await User.ban({days: 0, reason: `${Reason} - By: ${ModTag} | ${ModID}`}).then(() => {
			db.query(`INSERT INTO ${db_ModLogs} (GuildID, ChannelID, MsgID, Action, Reason, ModID, ModTag, ModAvatar, UserID, UserTag, UserAvatar, Date) VALUES ('${message.guild.id}', '${mod_log}', '', '${Action}', '${Reason}', '${ModID}', ${db.escape(ModTag)}, '${ModAvatar}', '${UserID}', ${db.escape(UserTag)}, '${UserAvatar}', '${currentTimestamp}')`, async (err, rows, fields) => {
				if(err) throw err;
				
				let editReason = "";
				if(Reason == "No reason provided")
					editReason = ", use `" + config.prefix + "reason " + rows.insertId + " <Text>` to add one.";
				
				if(!duration.includes("perm") && duration != "0") {
					db.query(`INSERT INTO ModTasks (CaseID, Date) VALUES ('${rows.insertId}', '${currentTimestamp + ms(duration)}')`);
				}
				
				// Send to Mod Log
				const Embed = new Discord.MessageEmbed()
				.setColor('#ac1414')
				.setAuthor(`${Action} | ${UserTag}`, UserAvatar)
				.addField('Offender:', `${UserTag} **|** <@${UserID}>`, true)
				.addField('Responsible moderator:', `${ModTag} **|** <@${ModID}>`, true)
				.addField('Reason:', `${Reason + editReason}`)
				.setTimestamp()
				.setFooter(`Case: ${rows.insertId} | ID: ${UserID}`, ModAvatar);
				
				await message.guild.channels.cache.get(mod_log).send(Embed).then(msg => {
					db.query(`UPDATE ${db_ModLogs} SET MsgID = '${msg.id}' WHERE ID = '${rows.insertId}'`);
				}).catch(console.log);
			});
		}).catch(error => {
			message.reply(`Couldn't ban ${UserTag}!\n**Reason**: ${error}`)
		});
	}
	if(command === "unban") {
		if(!message.member.hasPermission('BAN_MEMBERS'))
			return;
		
		message.delete().catch(console.error);
		
		if(message.member.guild.owner.id != message.author.id) {
			const ban_cooldown = 60 * 1000;
			if(commandsCooldown[message.guild.id + message.author.id + "-" + command]) {
				const timeleft = dateDifference(new Date(), new Date(commandsCooldown[message.guild.id + message.author.id + "-" + command]), {ms: true});
				const Embed = new Discord.MessageEmbed()
				.setColor('#ac1414')
				.setAuthor("Slow it down!", message.author.displayAvatarURL())
				.setDescription("You can run this command again in `" + timeleft + "` !")
				.setTimestamp()
				.setFooter(message.guild.name, BotAvatar);
					
				return await message.channel.send(Embed).catch(console.error);
			} else {
				commandsCooldown[message.guild.id + message.author.id + "-" + command] = new Date().getTime() + cooldown;
				setTimeout(() => {
					delete commandsCooldown[message.guild.id + message.author.id + "-" + command];
				}, cooldown);
			}
		}

		const banList = await message.guild.fetchBans();
		let member = banList.cache.get(args[0]);
		if(!member)
			return message.reply("This user is not banned from this server!\n**Usage:** `" + config.prefix + command + " <Member/Member ID> <Reason>`");
		
		let Reason = args.slice(2).join(' ');
		if(!Reason)
			Reason = "No reason provided";
		
		let UserID = member.user.id;
		let User = message.client.users.cache.get(UserID);
		let UserTag = `${member.user.username}#${member.user.discriminator}`;
		let UserAvatar = `https://cdn.discordapp.com/avatars/${UserID}/${banList.cache.get(UserID).user.avatar}.webp`;
		let ModID = message.author.id;
		let ModTag = message.author.tag;
		let ModAvatar = message.author.displayAvatarURL();
		
		const currentTimestamp = new Date().getTime();
		
		await message.guild.members.unban(UserID, `${Reason} - By: ${ModTag} | ${ModID}`).then(() => {
			db.query(`INSERT INTO ${db_ModLogs} (GuildID, ChannelID, MsgID, Action, Reason, ModID, ModTag, ModAvatar, UserID, UserTag, UserAvatar, currentTimestamp) VALUES ('${message.guild.id}', '${mod_log}', '', 'Unban', '${Reason}', '${ModID}', ${db.escape(ModTag)}, '${ModAvatar}', '${UserID}', ${db.escape(UserTag)}, '${UserAvatar}', '${currentTimestamp}')`, async (err, rows, fields) => {
				if(err) throw err;
				
				let editReason = "";
				if(Reason == "No reason provided")
					editReason = ", use `" + config.prefix + "reason " + rows.insertId + " <Text>` to add one.";
				
				// Send to Mod Log
				const Embed = new Discord.MessageEmbed()
				.setColor('#ac1414')
				.setAuthor(`Unban | ${UserTag}`, UserAvatar)
				.addField('Offender:', `${UserTag} **|** <@${UserID}>`, true)
				.addField('Responsible moderator:', `${ModTag} **|** <@${ModID}>`, true)
				.addField('Reason:', `${Reason + editReason}`)
				.setTimestamp()
				.setFooter(`Case: ${rows.insertId} | ID: ${UserID}`, ModAvatar);
				
				await message.guild.channels.cache.get(mod_log).send(Embed).then(async msg => {
					db.query(`UPDATE ${db_ModLogs} SET MsgID = '${msg.id}' WHERE ID = '${rows.insertId}'`);

					// Send to DM
					if(User) {
						const Embed2 = new Discord.MessageEmbed()
						.setColor('#ac1414')
						.setAuthor(`Unban`, UserAvatar, msg.url)
						.setDescription(`You have been unbanned from [${message.guild.name}](https://discordapp.com/channels/${message.guild.id}/${mod_log}/${msg.id}) by **${ModTag}** (<@${ModID}>) !\n**Reason**: ${Reason}`)
						.setTimestamp()
						.setFooter(message.guild.name, BotAvatar);
						
						await User.send(Embed2).catch(console.log);
					}
				}).catch(console.log);
			});
		}).catch(error => {
			message.reply(`Couldn't unban ${UserTag}!\n**Reason**: ${error}`)
		});
	}
	if(command === "reason") {
		if(!message.member.hasPermission('KICK_MEMBERS'))
			return;
		
		message.delete().catch(console.error);
		
		let CaseID = args.slice(0,1).join();
		if(!CaseID)
			return message.reply("Please mention a valid **Case ID**!\n**Usage:** `" + config.prefix + command + " <Case ID> <Reason>`");
		
		let Reason = args.slice(1).join(' ');
		if(!Reason)
			return message.reply("Please enter a **reason** for this Case!\n**Usage:** `" + config.prefix + command + " <Case ID> <Reason>`");
		
		db.query(`SELECT * FROM ${db_ModLogs} WHERE GuildID = '${message.guild.id}' AND ID = '${CaseID}'`, (err, rows) => {
			if(err) throw err;
			
			if(!rows[0])
				return message.reply("Please mention a valid **Case ID**!\n**Usage:** `" + config.prefix + command + " <Case ID> <Reason>`");
			
			let GuildID = rows[0].GuildID;
			let ChannelID = rows[0].ChannelID;
			let MsgID = rows[0].MsgID;
			let Action = rows[0].Action;
			let ModID = rows[0].ModID;
			let ModTag;
			let ModAvatar;
			if(message.client.users.cache.get(ModID)) {
				ModTag = message.client.users.cache.get(ModID).tag;
				ModAvatar = message.client.users.cache.get(ModID).displayAvatarURL();
			} else {
				ModTag = rows[0].ModTag;
				ModAvatar = rows[0].ModAvatar;
			}
			let UserID = rows[0].UserID;
			let UserTag;
			let UserAvatar;
			if(message.client.users.cache.get(UserID)) {
				UserTag = message.client.users.cache.get(UserID).tag;
				UserAvatar = message.client.users.cache.get(UserID).displayAvatarURL();
			} else {
				UserTag = rows[0].UserTag;
				UserAvatar = rows[0].UserAvatar;
			}
			let Timestamp = parseInt(rows[0].Date);
			
			if(!message.member.hasPermission('ADMINISTRATOR')) {
				if(message.author.id != ModID) {
					message.reply("You must be the case's **responsible moderator** to modify its reason!");
					return;
				}
			}
			
			db.query(`UPDATE ${db_ModLogs} SET Reason = '${Reason}' WHERE ID = '${CaseID}'`, async (err2, rows2, fields) => {
				if(err2) throw err2;
				
				const Embed = new Discord.MessageEmbed()
				.setColor('#ac1414')
				.setAuthor(`${Action} | ${UserTag}`, UserAvatar)
				.addField('Offender:', `${UserTag} **|** <@${UserID}>`, true)
				.addField('Responsible moderator:', `${ModTag} **|** <@${ModID}>`, true)
				.addField('Reason:', `${Reason}`)
				// .setTimestamp(Discord.SnowflakeUtil.deconstruct(MsgID).timestamp)
				.setTimestamp(Timestamp)
				.setFooter(`Case: ${CaseID} | ID: ${UserID}`, ModAvatar);

				const mod_log_channel = message.member.guild.channels.cache.get(ChannelID);
				await mod_log_channel.messages.fetch(MsgID).then(msg => {
					msg.edit(Embed).catch(console.error);
				}).catch(console.error);
			});
		});
	}
	if(command === "purge" || command === "clear") {
		if(!message.member.hasPermission('MANAGE_MESSAGES'))
			return;
		
		if(message.member.guild.owner.id != message.author.id) {
			const cooldown = 5 * 1000;
			if(commandsCooldown[message.guild.id + message.author.id + "-" + "purge"]) {
				const timeleft = dateDifference(new Date(), new Date(commandsCooldown[message.guild.id + message.author.id + "-" + "purge"]), {ms: true});
				const Embed = new Discord.MessageEmbed()
				.setColor('#ac1414')
				.setAuthor("Slow it down!", message.author.displayAvatarURL())
				.setDescription("You can run this command again in `" + timeleft + "` !")
				.setTimestamp()
				.setFooter(message.guild.name, BotAvatar);
					
				return await message.channel.send(Embed).catch(console.error);
			} else {
				commandsCooldown[message.guild.id + message.author.id + "-" + "purge"] = new Date().getTime() + cooldown;
				setTimeout(() => {
					delete commandsCooldown[message.guild.id + message.author.id + "-" + "purge"];
				}, cooldown);
			}
		}

		const deleteCount = parseInt(args[0], 10);

		if(!deleteCount || deleteCount < 1 || deleteCount > 99)
			return message.reply("Please provide a number between 1 and 99 for the number of messages to delete!\n**Usage:** `" + config.prefix + command + " <Number of messages to delete (1-99)>`");

		const fetched = await message.channel.messages.fetch({limit: deleteCount+1});
		await message.channel.bulkDelete(fetched).catch(error => message.reply(`Couldn't delete messages!\n**Reason**: ${error}`));
	}
	if(command === "lock" || command === "lockdown") {
		if(!message.member.hasPermission('MANAGE_MESSAGES'))
			return;

		let Channel = message.channel;
		if(message.mentions.channels.first()) {
			Channel = message.mentions.channels.first();
		} else if(message.guild.channels.cache.get(args[0])) {
			Channel = message.guild.channels.cache.get(args[0]);
		}

		if(Channel.permissionOverwrites.cache.get(message.guild.id).deny.serialize().SEND_MESSAGES)
			return message.reply(`This channel is already locked down.`);
		
		Channel.updateOverwrite(message.guild.id, {
			SEND_MESSAGES: false
		}).then(channel => {
			message.channel.send(`✅ Successfully **locked down** ${Channel}.`);
		}).catch(console.error);
	}
	if(command === "unlock" || command === "unlockdown") {
		if(!message.member.hasPermission('MANAGE_MESSAGES'))
			return;

		let Channel = message.channel;
		if(message.mentions.channels.first()) {
			Channel = message.mentions.channels.first();
		} else if(message.guild.channels.cache.get(args[0])) {
			Channel = message.guild.channels.cache.get(args[0]);
		}

		if(!Channel.permissionOverwrites.cache.get(message.guild.id).deny.serialize().SEND_MESSAGES)
			return message.reply(`This channel is not locked down.`);
		
		Channel.updateOverwrite(message.guild.id, {
			SEND_MESSAGES: null
		}).then(channel => {
			message.channel.send(`✅ Successfully **unlocked** ${Channel}.`);
		}).catch(console.error);
	}
	if(command === "slowmode" || command === "ratelimit") {
		if(!message.member.hasPermission('MANAGE_MESSAGES'))
			return;
		
		let Channel, rateLimit;
		let ChannelID = args.slice(0, 1).join();
		console.log(ChannelID);
		ChannelID = ChannelID.substring(ChannelID.lastIndexOf("<#") + 2, ChannelID.lastIndexOf(">"));
		console.log(ChannelID);
		
		if(message.mentions.channels.first() || message.guild.channels.cache.get(ChannelID)) {
			Channel = message.guild.channels.cache.get(ChannelID);
			rateLimit = args.slice(1, 2).join();
		} else {
			Channel = message.channel;
			rateLimit = args.slice(0, 1).join();
		}
		
		rateLimit = rateLimit.toLowerCase();
		if(!rateLimit || ms(rateLimit) === undefined)
			return message.reply("Please type how many **seconds** to set the slowmode for <#" + Channel + ">!\n**Usage:** `" + config.prefix + command + " <Channel/Channel ID (optional)> <Seconds>`");
		
		if(ms(rateLimit) > 21600000)
			return message.reply("Slowmode **duration** must be `6 hours` or less!\n**Usage:** `" + config.prefix + command + " <Channel/Channel ID (optional)> <Seconds>`");
		
		Channel.setRateLimitPerUser(parseInt(ms(rateLimit) * 0.001), `Changed by ${message.author.tag} (${message.author.id}), using ${config.prefix+command} command.`).then(() => {
			message.channel.send(`✅ Successfully set **slowmode** to \`${ms(ms(rateLimit), { long: true })}\` for ${Channel}.`);
		}).catch(console.error);
	}
	if(command === "ui" || command === "userinfo" || command === "info" || command === "whois") {
		if(!message.member.hasPermission('ADMINISTRATOR')) {
			if(message.member.guild.owner.id != message.author.id) {
				const bot_commands_channel = message.guild.channels.cache.get(bot_commands);
				if(message.channel.id != bot_commands) {
					return message.reply(`You can only use <@${client.user.id}> commands in ${bot_commands_channel}!`);
				}
			}
			
			if(message.member.guild.owner.id != message.author.id) {
				const cooldown = 10 * 1000;
				if(commandsCooldown[message.guild.id + message.author.id + "-" + "ui"]) {
					const timeleft = dateDifference(new Date(), new Date(commandsCooldown[message.guild.id + message.author.id + "-" + "ui"]), {ms: true});
					const Embed = new Discord.MessageEmbed()
					.setColor('#ac1414')
					.setAuthor("Slow it down!", message.author.displayAvatarURL())
					.setDescription("You can run this command again in `" + timeleft + "` !")
					.setTimestamp()
					.setFooter(message.guild.name, BotAvatar);
						
					return await message.channel.send(Embed).catch(console.error);
				} else {
					commandsCooldown[message.guild.id + message.author.id + "-" + "ui"] = new Date().getTime() + cooldown;
					setTimeout(() => {
						delete commandsCooldown[message.guild.id + message.author.id + "-" + "ui"];
					}, cooldown);
				}
			}
			
			let UserID = message.author.id;
			let UserName = message.author.username;
			let UserTag = message.author.tag;
			let DisplayName = message.member.displayName;
			let CreatedAt = message.author.createdAt;
			let JoinedAt = message.member.joinedAt;
			let UserAvatar = message.author.displayAvatarURL();
			
			if(message.mentions.members.first()) {
				UserID = message.mentions.members.first().id;
				UserName = message.mentions.members.first().user.username;
				UserTag = message.mentions.members.first().user.tag;
				DisplayName = message.mentions.members.first().displayName;
				CreatedAt = message.mentions.members.first().user.createdAt;
				JoinedAt = message.mentions.members.first().joinedAt;
				UserAvatar = message.mentions.members.first().user.displayAvatarURL();
			} else if(message.guild.members.cache.get(args[0])) {
				UserID = args.slice(0, 1).join();
				UserName = message.guild.members.cache.get(UserID).user.username;
				UserTag = message.guild.members.cache.get(UserID).user.tag;
				DisplayName = message.guild.members.cache.get(UserID).displayName;
				CreatedAt = message.guild.members.cache.get(UserID).user.createdAt;
				JoinedAt = message.guild.members.cache.get(UserID).joinedAt;
				UserAvatar = message.guild.members.cache.get(UserID).user.displayAvatarURL();
			}
			
			db.query(`SELECT * FROM ${db_LevelSystem} WHERE GuildID = '${message.guild.id}' AND UserID = '${UserID}'`, async (err, rows) => {
				if(err) throw err;
				
				let Level, EXP, EXP2;
				
				if(rows[0]) {
					Level = rows[0].Level;
					EXP = rows[0].EXP;
					EXP2 = rows[0].EXP2;
					Level = Level + " (" + EXP + "/" + EXP2 + ")";
				} else {
					Level = "0";
				}
				
				const Embed = new Discord.MessageEmbed()
				.setColor('#ac1414')
				.setAuthor(`${UserTag} - ${UserID}`)
				.addField('Created at', `${CreatedAt}`, true)
				.addField('Joined at', `${JoinedAt}`, true)
				.addField('Level', `${Level}`, true)
				.addField('Avatar URL', `[Click Here](${UserAvatar})`, true)
				.addField('Nickname', `${DisplayName}`, true)
				.setThumbnail(UserAvatar)
				.setTimestamp()
				.setFooter(message.guild.name, BotAvatar);
				
				await message.channel.send(Embed).catch(console.log);
			});

			return;
		}

		if(args[1] === "bonus") {
			if(message.member.guild.owner.id != message.author.id) {
				const cooldown = 5 * 1000;
				if(commandsCooldown[message.guild.id + message.author.id + "-" + "ui" + "-" + "bonus"]) {
					const timeleft = dateDifference(new Date(), new Date(commandsCooldown[message.guild.id + message.author.id + "-" + "ui" + "-" + "bonus"]), {ms: true});
					const Embed = new Discord.MessageEmbed()
					.setColor('#ac1414')
					.setAuthor("Slow it down!", message.author.displayAvatarURL())
					.setDescription("You can run this command again in `" + timeleft + "` !")
					.setTimestamp()
					.setFooter(message.guild.name, BotAvatar);
						
					return await message.channel.send(Embed).catch(console.error);
				} else {
					commandsCooldown[message.guild.id + message.author.id + "-" + "ui" + "-" + "bonus"] = new Date().getTime() + cooldown;
					setTimeout(() => {
						delete commandsCooldown[message.guild.id + message.author.id + "-" + "ui" + "-" + "bonus"];
					}, cooldown);
				}
			}

			let UserID, UserTag, UserAvatar;
			
			if(message.mentions.members.first()) {
				UserID = message.mentions.members.first().id;
				UserTag = message.mentions.members.first().user.tag;
				UserAvatar = message.mentions.members.first().user.displayAvatarURL();
			} else if(args.slice(0, 1).join()) {
				UserID = args.slice(0, 1).join();
				if(message.client.users.cache.get(UserID)) {
					UserTag = message.client.users.cache.get(UserID).tag;
					UserAvatar = message.client.users.cache.get(UserID).displayAvatarURL();
				}
			}

			db.query(`SELECT * FROM ${db_InviteBonus} WHERE GuildID = '${message.guild.id}' AND UserID = '${UserID}'`, (err, rows) => {
				if(err) throw err;
				
				if(!rows[0])
					return message.channel.send("This user has no **Bonus Invites**.");

				let Description = "";
				
				for(var i = 0; i < rows.length; i++) {
					let Pos = i + 1;
					let AddedBonus = parseInt(rows[i].AddedBonus);
					let Reason = rows[i].Reason;
					let ModID = rows[i].ModID;
					let ModTag = rows[i].ModTag;
					let Timestamp = parseInt(rows[i].Date);
					const diffDate = dateDifference(new Date(Timestamp), new Date(), {bold: true}, {ms: true});
					
					let Action;
					if(AddedBonus < 0) {
						Action = "Removed";
					} else {
						Action = "Added";
					}

					Description += `\`${Pos}.\` ${Action} **${Math.abs(AddedBonus)}** Invites - ${diffDate} ago\n**Moderator —** ${ModTag} **|** <@${ModID}>\n**Reason —** ${Reason}\n\n`;
				}
				
				if(!UserTag)
					UserTag = rows[rows.length-1].UserTag;
				
				if(!UserAvatar)
					UserAvatar = rows[rows.length-1].UserAvatar;

				db.query(`SELECT * FROM ${db_InviteCount} WHERE UserID = '${UserID}'`, async (err2, rows2) => {
					if(err2) throw err2;
					
					if(!rows2[0]) return;
					
					let Bonus = rows2[0].Bonus;
				
					const Embed = new Discord.MessageEmbed()
					.setColor('#ac1414')
					.setAuthor(`Added Invites for ${UserTag}`, UserAvatar)
					.setDescription(Description)
					.setTimestamp()
					.setFooter(`${message.guild.name} ─ ${Bonus} Bonus`, BotAvatar);
					
					await message.channel.send(Embed).catch(console.log);
				});
			});
			
			return;
		} else {
			if(message.member.guild.owner.id != message.author.id) {
				const cooldown = 5 * 1000;
				if(commandsCooldown[message.guild.id + message.author.id + "-" + "ui"]) {
					const timeleft = dateDifference(new Date(), new Date(commandsCooldown[message.guild.id + message.author.id + "-" + "ui"]), {ms: true});
					const Embed = new Discord.MessageEmbed()
					.setColor('#ac1414')
					.setAuthor("Slow it down!", message.author.displayAvatarURL())
					.setDescription("You can run this command again in `" + timeleft + "` !")
					.setTimestamp()
					.setFooter(message.guild.name, BotAvatar);
						
					return await message.channel.send(Embed).catch(console.error);
				} else {
					commandsCooldown[message.guild.id + message.author.id + "-" + "ui"] = new Date().getTime() + cooldown;
					setTimeout(() => {
						delete commandsCooldown[message.guild.id + message.author.id + "-" + "ui"];
					}, cooldown);
				}
			}

			let UserID = message.author.id;
			let UserName = message.author.username;
			let UserTag = message.author.tag;
			let DisplayName = message.member.displayName;
			let CreatedAt = message.author.createdAt;
			let JoinedAt = message.member.joinedAt;
			let UserAvatar = message.author.displayAvatarURL();
			
			if(message.mentions.members.first()) {
				UserID = message.mentions.members.first().id;
				UserName = message.mentions.members.first().user.username;
				UserTag = message.mentions.members.first().user.tag;
				DisplayName = message.mentions.members.first().displayName;
				CreatedAt = message.mentions.members.first().user.createdAt;
				JoinedAt = message.mentions.members.first().joinedAt;
				UserAvatar = message.mentions.members.first().user.displayAvatarURL();
			} else if(message.client.users.cache.get(args[0])) {
				UserID = args.slice(0, 1).join();
				UserName = message.guild.members.cache.get(UserID).user.username;
				UserTag = message.guild.members.cache.get(UserID).user.tag;
				DisplayName = message.guild.members.cache.get(UserID).displayName;
				CreatedAt = message.guild.members.cache.get(UserID).user.createdAt;
				JoinedAt = message.guild.members.cache.get(UserID).joinedAt;
				UserAvatar = message.guild.members.cache.get(UserID).user.displayAvatarURL();
			}
			
			db.query(`SELECT * FROM ${db_LevelSystem} WHERE GuildID = '${message.guild.id}' AND UserID = '${UserID}'`, async (err, rows) => {
				if(err) throw err;
				
				let Level, EXP, EXP2;
				
				if(rows[0]) {
					Level = rows[0].Level;
					EXP = rows[0].EXP;
					EXP2 = rows[0].EXP2;
					Level = Level + " (" + EXP + "/" + EXP2 + ")";
				} else {
					Level = "0";
				}
				
				const Embed = new Discord.MessageEmbed()
				.setColor('#ac1414')
				.setAuthor(`${UserTag} - ${UserID}`)
				.addField('Created at', `${CreatedAt}`, true)
				.addField('Joined at', `${JoinedAt}`, true)
				.addField('Level', `${Level}`, true)
				.addField('Avatar URL', `[Click Here](${UserAvatar})`, true)
				.addField('Nickname', `${DisplayName}`, true)
				.setThumbnail(UserAvatar)
				.setTimestamp()
				.setFooter(message.guild.name, BotAvatar);
				
				await message.channel.send(Embed).catch(console.log);
			});
		}
	}
	if(command === "snipe") {
		if(!deletedMessages[message.channel.id] || deletedMessages[message.channel.id].length == 0)
			return message.channel.send("There's nothing to snipe!");
		
		const Embed = new Discord.MessageEmbed()
		.setColor('#ac1414')
		.setAuthor(deletedMessages[message.channel.id]["UserTag"], deletedMessages[message.channel.id]["UserAvatar"])
		.setDescription(deletedMessages[message.channel.id]["Message"])
		.setTimestamp(deletedMessages[message.channel.id]["Date"])
		.setFooter(message.guild.name, BotAvatar);
		
		await message.channel.send(Embed).catch(console.log);
	}
	if(command === "asnipe") {
		if(!message.member.hasPermission('ADMINISTRATOR'))
			return;
		
		let ChannelID = message.channel.id;

		if(message.mentions.channels.first()) {
			ChannelID = message.mentions.channels.first().id;
		} else if(message.guild.channels.cache.get(args.slice(0, 1).join())) {
			ChannelID = args.slice(0, 1).join();
		}
		
		if(!deletedMessages4Admin[ChannelID] || deletedMessages4Admin[ChannelID].length == 0)
			return message.channel.send("There's nothing to snipe!");
		
		for(var i = 0; i < deletedMessages4Admin[ChannelID].length; i++) {
			const Embed = new Discord.MessageEmbed()
			.setColor('#ac1414')
			.setAuthor(deletedMessages4Admin[ChannelID][i]["UserTag"], deletedMessages4Admin[ChannelID][i]["UserAvatar"])
			.setDescription(deletedMessages4Admin[ChannelID][i]["Message"])
			.setTimestamp(deletedMessages4Admin[ChannelID][i]["Date"])
			.setFooter(message.guild.name, BotAvatar);
			
			await message.channel.send(Embed).catch(console.log);
		}
		
		message.delete().catch(console.error);
	}
	if(command === "clearasnipe") {
		if(!message.member.hasPermission('ADMINISTRATOR'))
			return;
		
		let ChannelID = message.channel.id;

		if(message.mentions.channels.first()) {
			ChannelID = message.mentions.channels.first().id;
		} else if(message.guild.channels.cache.get(args.slice(0, 1).join())) {
			ChannelID = args.slice(0, 1).join();
		}
		
		delete deletedMessages4Admin[ChannelID];
	}
	if(command === "rank" || command === "level" || command === "lvl" || command === "profile") {
		if(message.member.guild.owner.id != message.author.id) {
			const bot_commands_channel = message.guild.channels.cache.get(bot_commands);
			if(message.channel.id != bot_commands) {
				return message.reply(`You can only use <@${client.user.id}> commands in ${bot_commands_channel}!`);
			}
		}
		
		if(message.member.guild.owner.id != message.author.id) {
			const cooldown = 10 * 1000;
			if(commandsCooldown[message.guild.id + message.author.id + "-" + "rank"]) {
				const timeleft = dateDifference(new Date(), new Date(commandsCooldown[message.guild.id + message.author.id + "-" + "rank"]), {ms: true});
				const Embed = new Discord.MessageEmbed()
				.setColor('#ac1414')
				.setAuthor("Slow it down!", message.author.displayAvatarURL())
				.setDescription("You can run this command again in `" + timeleft + "` !")
				.setTimestamp()
				.setFooter(message.guild.name, BotAvatar);
					
				return await message.channel.send(Embed).catch(console.error);
			} else {
				commandsCooldown[message.guild.id + message.author.id + "-" + "rank"] = new Date().getTime() + cooldown;
				setTimeout(() => {
					delete commandsCooldown[message.guild.id + message.author.id + "-" + "rank"];
				}, cooldown);
			}
		}
		
		let UserID = message.author.id;
		let UserName = message.author.username;
		let UserAvatar = message.author.displayAvatarURL();
		let IsBot = message.author.bot;
		
		if(message.mentions.members.first()) {
			UserID = message.mentions.members.first().id;
			UserName = message.mentions.members.first().user.username;
			UserAvatar = message.mentions.members.first().user.displayAvatarURL();
			IsBot = message.mentions.members.first().user.bot;
		} else if(message.guild.members.cache.get(args[0])) {
			UserID = args.slice(0, 1).join();
			UserName = message.guild.members.cache.get(UserID).user.username;
			UserAvatar = message.guild.members.cache.get(UserID).user.displayAvatarURL();
			IsBot = message.guild.members.cache.get(UserID).user.bot;
		}
		
		if(IsBot)
			return;
		
		db.query(`SELECT * FROM ${db_LevelSystem} WHERE GuildID = '${message.guild.id}' AND UserID = '${UserID}'`, async (err, rows) => {
			if(err) throw err;
			
			if(!rows[0])
				return message.channel.send("This user has no **EXP**.");
			
			let Level, EXP, EXP2, MessagesCount;
			
			Level = rows[0].Level;
			EXP = rows[0].EXP;
			EXP2 = rows[0].EXP2;
			MessagesCount = rows[0].MessagesCount;
			
			const Embed = new Discord.MessageEmbed()
			.setColor('#ac1414')
			.setTitle(`${UserName}'s rank`)
			.addField('Level', `${Level}`, true)
			.addField('EXP', `${EXP}/${EXP2}`, true)
			.addField('Total Sent Messages', `${MessagesCount}`)
			.setThumbnail(UserAvatar)
			.setTimestamp()
			.setFooter(message.guild.name, BotAvatar);
			
			await message.channel.send(Embed).catch(console.log);
		});
	}
	if(command === "leaderboard" || command === "lb" || command === "top") {
		if(message.member.guild.owner.id != message.author.id) {
			const bot_commands_channel = message.guild.channels.cache.get(bot_commands);
			if(message.channel.id != bot_commands) {
				return message.reply(`You can only use <@${client.user.id}> commands in ${bot_commands_channel}!`);
			}
		}
		
		if(message.member.guild.owner.id != message.author.id) {
			const cooldown = 15 * 1000;
			if(commandsCooldown[message.guild.id + message.author.id + "-" + "leaderboard"]) {
				const timeleft = dateDifference(new Date(), new Date(commandsCooldown[message.guild.id + message.author.id + "-" + "leaderboard"]), {ms: true});
				const Embed = new Discord.MessageEmbed()
				.setColor('#ac1414')
				.setAuthor("Slow it down!", message.author.displayAvatarURL())
				.setDescription("You can run this command again in `" + timeleft + "` !")
				.setTimestamp()
				.setFooter(message.guild.name, BotAvatar);
					
				return await message.channel.send(Embed).catch(console.error);
			} else {
				commandsCooldown[message.guild.id + message.author.id + "-" + "leaderboard"] = new Date().getTime() + cooldown;
				setTimeout(() => {
					delete commandsCooldown[message.guild.id + message.author.id + "-" + "leaderboard"];
				}, cooldown);
			}
		}
		
		let lb_length = 10;
		let lb_pages = 10;
		let pages = lb_pages;
		let page = args.slice(0, 1).join();
		
		if(!page)
			page = 1;
		
		db.query(`SELECT * FROM ${db_LevelSystem} WHERE GuildID = '${message.guild.id}' ORDER BY Level DESC, EXP DESC, MessagesCount DESC`, async (err, rows) => {
			if(err) throw err;
			
			let rows_length = 0;
			for(var i = 0; i < rows.length; i++) {
				if(!rows[i].UserID || !message.guild.members.cache.get(rows[i].UserID))
					continue;

				rows_length ++;
			}

			let get_pages = parseInt((rows_length / lb_length) + 1);
			if(get_pages >= 0 && get_pages < lb_pages)
				pages = get_pages;
			
			if(page <= 0 || page > lb_pages || page > pages) {
				message.channel.send("Page `" + page + "` doesn't exist. There's only `" + pages + "` pages.");
				return;
			}
			
			var iRank = 0;
			let LeaderBoard = "";
			
			for(var i = 0; i < rows.length; i++) {
				if(iRank >= lb_length * page)
					break;
				
				iRank ++;
				
				let UserID, User, Level, EXP, EXP2, MessagesCount;
				
				UserID = rows[i].UserID;
				User = message.guild.members.cache.get(UserID);
				Level = parseInt(rows[i].Level);
				EXP = parseInt(rows[i].EXP);
				EXP2 = parseInt(rows[i].EXP2);
				MessagesCount = parseInt(rows[i].MessagesCount);
				
				if(!User || !UserID) {
					iRank --;
					continue;
				}
				
				if((iRank > lb_length * (page - 1)) && (iRank <= lb_length * page)) {
					LeaderBoard += "**" + iRank + ".** <@" + UserID + "> - Level **" + Level + "** (**" + EXP + "**/**" + EXP2 + "** EXP, **" + MessagesCount + "** Sent Messages)\n";
				}
			}
		
			const Embed = new Discord.MessageEmbed()
			.setColor('#ac1414')
			.setTitle(`Top users in the server\n\u200b`)
			.setDescription(`${LeaderBoard}\n\u200b`)
			.setFooter(`${message.guild.name} ─ Page ${page} of ${pages}`, BotAvatar);
			
			await message.channel.send(Embed).catch(console.log);
		});
	}
	if(command === "invites" || command === "invite" || command === "inv") {
		if(message.member.guild.owner.id != message.author.id) {
			const bot_commands_channel = message.guild.channels.cache.get(bot_commands);
			if(message.channel.id != bot_commands) {
				return message.reply(`You can only use <@${client.user.id}> commands in ${bot_commands_channel}!`);
			}
		}
		
		if(message.member.guild.owner.id != message.author.id) {
			const cooldown = 10 * 1000;
			if(commandsCooldown[message.guild.id + message.author.id + "-" + invites]) {
				const timeleft = dateDifference(new Date(), new Date(commandsCooldown[message.guild.id + message.author.id + "-" + invites]), {ms: true});
				const Embed = new Discord.MessageEmbed()
				.setColor('#ac1414')
				.setAuthor("Slow it down!", message.author.displayAvatarURL())
				.setDescription("You can run this command again in `" + timeleft + "` !")
				.setTimestamp()
				.setFooter(message.guild.name, BotAvatar);
					
				return await message.channel.send(Embed).catch(console.error);
			} else {
				commandsCooldown[message.guild.id + message.author.id + "-" + invites] = new Date().getTime() + cooldown;
				setTimeout(() => {
					delete commandsCooldown[message.guild.id + message.author.id + "-" + invites];
				}, cooldown);
			}
		}
		
		let UserID = message.author.id;
		let UserName = message.author.username;
		
		if(message.mentions.members.first()) {
			UserID = message.mentions.members.first().id;
			UserName = message.mentions.members.first().user.username;
		} else if(message.guild.members.cache.get(args[0])) {
			UserID = args.slice(0, 1).join();
			UserName = message.guild.members.cache.get(UserID).user.username;
		}
		
		db.query(`SELECT * FROM ${db_InviteCount} WHERE GuildID = '${message.guild.id}' AND UserID = '${UserID}'`, async (err, rows) => {
			if(err) throw err;
			
			let Regular = 0, Bonus = 0, Fake = 0, Leaves = 0, Invites = 0;
			let EmDescription;
			
			if(rows[0]) {
				Regular = parseInt(rows[0].Regular);
				Bonus = parseInt(rows[0].Bonus);
				Fake = parseInt(rows[0].Fake);
				Leaves = parseInt(rows[0].Leaves);
				Invites = Regular + Bonus + Fake + Leaves;
			}
			
			if(message.mentions.members.first() || message.guild.members.cache.get(args[0])) {
				EmDescription = "<@" + UserID + "> has **" + Invites + "** invites! (**" + Regular + "** regular, **" + Bonus + "** bonus, **" + Fake + "** fake, **" + Leaves + "** leaves)";
			} else {
				EmDescription = "You have **" + Invites + "** invites! (**" + Regular + "** regular, **" + Bonus + "** bonus, **" + Fake + "** fake, **" + Leaves + "** leaves)";
			}
			
			const Embed = new Discord.MessageEmbed()
			.setColor('#ac1414')
			.setAuthor(`${UserName}'s Invites`, message.guild.members.cache.get(UserID).user.displayAvatarURL())
			.setDescription(EmDescription)
			.setTimestamp()
			.setFooter(message.guild.name, BotAvatar);
			
			await message.channel.send(Embed).catch(console.log);
		});
	}
	if(command === "inviteleaderboard" || command === "ileaderboard" || command === "invitelb" || command === "ilb" || command === "topinvite" || command === "topinvites" || command === "topinviter" || command === "topinviters" || command === "itop") {
		if(message.member.guild.owner.id != message.author.id) {
			const bot_commands_channel = message.guild.channels.cache.get(bot_commands);
			if(message.channel.id != bot_commands) {
				return message.reply(`You can only use <@${client.user.id}> commands in ${bot_commands_channel}!`);
			}
		}
		
		if(message.member.guild.owner.id != message.author.id) {
			const cooldown = 15 * 1000;
			if(commandsCooldown[message.guild.id + message.author.id + "-" + "inviteleaderboard"]) {
				const timeleft = dateDifference(new Date(), new Date(commandsCooldown[message.guild.id + message.author.id + "-" + "inviteleaderboard"]), {ms: true});
				const Embed = new Discord.MessageEmbed()
				.setColor('#ac1414')
				.setAuthor("Slow it down!", message.author.displayAvatarURL())
				.setDescription("You can run this command again in `" + timeleft + "` !")
				.setTimestamp()
				.setFooter(message.guild.name, BotAvatar);
					
				return await message.channel.send(Embed).catch(console.error);
			} else {
				commandsCooldown[message.guild.id + message.author.id + "-" + "inviteleaderboard"] = new Date().getTime() + cooldown;
				setTimeout(() => {
					delete commandsCooldown[message.guild.id + message.author.id + "-" + "inviteleaderboard"];
				}, cooldown);
			}
		}
		
		let lb_length = 10;
		let lb_pages = 10;
		let pages = lb_pages;
		let page = args.slice(0, 1).join();
		
		if(!page)
			page = 1;
		
		db.query(`SELECT * FROM ${db_InviteCount} WHERE GuildID = '${message.guild.id}' ORDER BY (Regular + Bonus + Fake + Leaves) DESC`, async (err, rows) => {
			if(err) throw err;
			
			let rows_length = 0;
			for(var i = 0; i < rows.length; i++) {
				if(!rows[i].UserID || !message.guild.members.cache.get(rows[i].UserID))
					continue;

				rows_length ++;
			}
			
			let get_pages = parseInt((rows_length / lb_length) + 1);
			if(get_pages >= 0 && get_pages < lb_pages)
				pages = get_pages;
			
			if(page <= 0 || page > lb_pages || page > pages) {
				message.channel.send("Page `" + page + "` doesn't exist. There's only `" + pages + "` pages.");
				return;
			}
			
			var iRank = 0;
			let LeaderBoard = "";
			
			for(var i = 0; i < rows.length; i++) {
				if(iRank >= lb_length * page)
					break;
				
				iRank ++;
				
				let UserID, User, Invites, Regular, Bonus, Fake, Leaves;
				
				UserID = rows[i].UserID;
				User = client.users.cache.get(UserID);
				Regular = parseInt(rows[i].Regular);
				Bonus = parseInt(rows[i].Bonus);
				Fake = parseInt(rows[i].Fake);
				Leaves = parseInt(rows[i].Leaves);
				Invites = Regular + Bonus + Fake + Leaves;
				
				if(!User || !UserID) {
					iRank --;
					continue;
				}
				
				if((iRank > lb_length * (page - 1)) && (iRank <= lb_length * page)) {
					LeaderBoard += "**" + iRank + ".** <@" + UserID + "> - **" + Invites + "** invites (**" + Regular + "** regular, **" + Bonus + "** bonus, **" + Fake + "** fake, **" + Leaves + "** leaves)\n";
				}
			}
		
			const Embed = new Discord.MessageEmbed()
			.setColor('#ac1414')
			.setTitle(`Top inviters in the server\n\u200b`)
			.setDescription(`${LeaderBoard}\n\u200b`)
			.setFooter(`${message.guild.name} ─ Page ${page} of ${pages}`, BotAvatar);
			
			await message.channel.send(Embed).catch(console.log);
		});
	}
	if(command === "addinvites") {
		if(!message.member.hasPermission('ADMINISTRATOR'))
			return;
		
		if(message.member.guild.owner.id != message.author.id) {
			const cooldown = 10 * 1000;
			if(commandsCooldown[message.guild.id + message.author.id + "-" + command]) {
				const timeleft = dateDifference(new Date(), new Date(commandsCooldown[message.guild.id + message.author.id + "-" + command]), {ms: true});
				const Embed = new Discord.MessageEmbed()
				.setColor('#ac1414')
				.setAuthor("Slow it down!", message.author.displayAvatarURL())
				.setDescription("You can run this command again in `" + timeleft + "` !")
				.setTimestamp()
				.setFooter(message.guild.name, BotAvatar);
					
				return await message.channel.send(Embed).catch(console.error);
			} else {
				commandsCooldown[message.guild.id + message.author.id + "-" + command] = new Date().getTime() + cooldown;
				setTimeout(() => {
					delete commandsCooldown[message.guild.id + message.author.id + "-" + command];
				}, cooldown);
			}
		}
		
		let ModID = message.author.id;
		let ModTag = message.author.tag;
		let UserID, UserTag, UserAvatar;
		
		if(message.mentions.members.first()) {
			UserID = message.mentions.members.first().id;
			UserTag = message.mentions.members.first().user.tag;
			UserAvatar = message.mentions.members.first().user.displayAvatarURL();
		} else if(message.guild.members.cache.get(args[0])) {
			UserID = args.slice(0, 1).join();
			UserTag = message.guild.members.cache.get(UserID).user.tag;
			UserAvatar = message.guild.members.cache.get(UserID).user.displayAvatarURL();
		} else {
			return message.reply("Please mention a valid **member** of this server!\n**Usage:** `" + config.prefix + command + " <Member/Member ID> <Bonus> <Reason>`");
		}
		
		let AddedBonus = args.slice(1, 2).join();
		if(!AddedBonus || isNaN(AddedBonus))
			return message.reply("Please enter a valid number of **Bonus** to add!\n**Usage:** `" + config.prefix + command + " <Member/Member ID> <Bonus> <Reason>`");
		
		let Reason = args.slice(2).join(' ');
		if(!Reason)
			Reason = "No reason provided";
		
		const currentTimestamp = new Date().getTime();
		
		db.query(`INSERT INTO ${db_InviteBonus} (GuildID, AddedBonus, Reason, ModID, ModTag, UserID, UserTag, Date) VALUES ('${message.guild.id}', '${AddedBonus}', '${Reason}', '${ModID}', ${db.escape(ModTag)}, '${UserID}', ${db.escape(UserTag)}, '${currentTimestamp}')`, (err, rows, fields) => {
			if(err) throw err;
			
			db.query(`SELECT * FROM ${db_InviteCount} WHERE UserID = '${UserID}'`, async (err2, rows2) => {
				if(err2) throw err2;
				
				let Regular, Bonus, Fake, Leaves;
				Regular = parseInt(rows2[0].Regular);
				Bonus = parseInt(rows2[0].Bonus) + parseInt(AddedBonus);
				Fake = parseInt(rows2[0].Fake);
				Leaves = parseInt(rows2[0].Leaves);
				Invites = Regular + Bonus + Fake + Leaves;
				
				if(!rows2[0]) {
					db.query(`INSERT INTO ${db_InviteCount} (UserID, Regular, Bonus, Fake, Leaves) VALUES ('${UserID}', '0', '${AddedBonus}', '0', '0')`);
				} else {
					db.query(`UPDATE ${db_InviteCount} SET Bonus = '${Bonus}' WHERE UserID = '${UserID}'`);
				}
				
				let Action;
				if(parseInt(AddedBonus) < 0) {
					Action = "Remov";
				} else {
					Action = "Add";
				}
				
				const Embed = new Discord.MessageEmbed()
				.setColor('#ac1414')
				.setAuthor(`${Action}ing Invites for ${UserTag}`, UserAvatar)
				.setDescription(`${Action}ed **${Math.abs(parseInt(AddedBonus))}** invites for <@${UserID}>, now at: **${Invites}** invites.\n**Reason**: ${Reason}`)
				.setTimestamp()
				.setFooter(message.guild.name, BotAvatar);
				
				await message.channel.send(Embed).catch(console.log);
			});
		});
	}
	if(command === "gstart" || command === "gcreate") {
		if(!message.member.hasPermission('MANAGE_SERVER'))
			return;
		
		message.delete().catch(console.error);

		for(var i = 0; i < GiveawayCreate.length; i++) {
			if(GiveawayCreate[i]["GuildID"] == message.guild.id && GiveawayCreate[i]["SetupChannelID"] == message.channel.id && GiveawayCreate[i]["CreatorID"] == message.author.id)
				return message.reply("You are already creating a **Giveaway** in this Channel!");
		}

		const Embed = new Discord.MessageEmbed()
		.setColor('#ac1414')
		.setAuthor("Giveaway Setup - 1/6", message.author.displayAvatarURL())
		.setDescription("Please mention the **Channel/Channel ID** you want to host the giveaway in.")
		.setTimestamp()
		.setFooter(message.guild.name, BotAvatar);

		await message.channel.send(Embed).then(msg => {
			GiveawayCreate.push({
				Status: "Live",
				Prize: "",
				GuildID: message.guild.id,
				ChannelID: "",
				SetupChannelID: message.channel.id,
				MsgID: msg.id,
				CreatorID: message.author.id,
				HosterID: "",
				WinnersNum: "",
				WinnersID: "",
				Requirements: "",
				ReqInvites: "",
				ReqNewInvites: "",
				ReqMessages: "",
				ReqLevel: "",
				ReqRole: "",
				StartDate: "",
				EndDate: ""
			});

			let GiveawayID = GiveawayCreate.length - 1;
			clearGiveawayCreate = setTimeout(() => {
				msg.delete().catch(console.error);
				GiveawayCreate.splice(GiveawayID, 1);
			}, 5 * 60 * 1000);
		}).catch(console.error);
	}
	if(command === "gend") {
		if(!message.member.hasPermission('MANAGE_SERVER'))
			return;
		
		// message.delete().catch(console.error);
		
		let GiveawayID = args.slice(0, 1).join();
		let GiveawayArrayID = Giveaways.findIndex(x => x.ID === parseInt(GiveawayID));
		if(!GiveawayID || isNaN(GiveawayID) || !Giveaways[GiveawayArrayID])
			return message.reply("Please type a valid **ID** of the giveaway!\n**Usage:** `" + config.prefix + command + " <Giveaway ID>`");

		endGiveaway(GiveawayArrayID);
	}
	if(command === "greroll") {
		if(!message.member.hasPermission('MANAGE_SERVER'))
			return;
		
		// message.delete().catch(console.error);
		
		let GiveawayID = args.slice(0, 1).join();
		if(!GiveawayID || isNaN(GiveawayID))
			return message.reply("Please type a valid **ID** of the giveaway!\n**Usage:** `" + config.prefix + command + " <Giveaway ID> <Winner Placement>`");
		
		let GiveawayPlacement = args.slice(1, 2).join();
		if(GiveawayPlacement && isNaN(GiveawayPlacement))
			return message.reply("Please type the **Winner's Placement** to reroll!\n**Usage:** `" + config.prefix + command + " <Giveaway ID> <Winner Placement>`");
		if(!GiveawayPlacement)
			GiveawayPlacement = 1;
		
		reRollGiveaway(parseInt(GiveawayID), parseInt(GiveawayPlacement), message, command);
	}
	if(command === "gwinner") {
		if(message.member.guild.owner.id != message.author.id)
			return;
		
		message.delete().catch(console.error);
		
		let GiveawayID = args.slice(0, 1).join();
		if(!GiveawayID || isNaN(GiveawayID))
			return message.author.send("Please type a valid **ID** of the giveaway!\n**Usage:** `" + config.prefix + command + " <Giveaway ID> <Winner>`");
		
		let GiveawayWinner = args.slice(1);
		if(!GiveawayWinner)
			return message.author.send("Please type the **Winner** of the giveaway!\n**Usage:** `" + config.prefix + command + " <Giveaway ID> <Winner>`");

		db.query(`SELECT * FROM ${db_Giveaways} WHERE ID = '${GiveawayID}' AND Status = 'Live'`, async (err, rows) => {
			if(err) throw err;
			
			if(!rows[0])
				return await message.author.send("Please type a valid **ID** of the giveaway!\n**Usage:** `" + config.prefix + command + " <Giveaway ID> <Winner>`").catch(console.log);

			db.query(`UPDATE ${db_Giveaways} SET WinnersID = '${GiveawayWinner}' WHERE ID = '${GiveawayID}'`, async (err2, rows2, fields2) => {
				if(err2) throw err2;

				await message.author.send(`Successfuly set **the winner(s)** of the giveaway to be: **${GiveawayWinner}**!\nhttps://discordapp.com/channels/${rows[0].GuildID}/${rows[0].ChannelID}/${rows[0].MsgID}`).catch(console.log);
			});
		});
	}
	if(command === "reactionrole") {
		if(message.member.guild.owner.id != message.author.id)
			return;
		
		let reaction_channel, reaction_channel_id;
		if(message.mentions.channels.first()) {
			reaction_channel = message.mentions.channels.first();
			reaction_channel_id = reaction_channel.id;
		} else if(message.guild.channels.cache.get(args.slice(0, 1).join())) {
			reaction_channel_id = args.slice(0, 1).join();
			reaction_channel = message.guild.channels.cache.get(reaction_channel_id);
		} else {
			return message.reply("Please mention a valid **Channel** in this server!\n**Usage:** `" + config.prefix + command + " <Channel/Channel ID> <Message ID> <Emoji/Emoji ID> <Role/Role ID>`");
		}
		
		let reaction_message_id = args.slice(1, 2).join();
		if(!reaction_message_id)
			return message.reply("Please mention a valid **Message ID** in this server!\n**Usage:** `" + config.prefix + command + " <Channel/Channel ID> <Message ID> <Emoji/Emoji ID> <Role/Role ID>`");
		
		let reaction_emoji = args.slice(2, 3).join();
		reaction_emoji = reaction_emoji.substring(reaction_emoji.lastIndexOf(":") + 1, reaction_emoji.lastIndexOf(">"));
		if(!reaction_emoji)
			return message.reply("Please mention a valid **Emoji**!\n**Usage:** `" + config.prefix + command + " <Channel/Channel ID> <Message ID> <Emoji/Emoji ID> <Role/Role ID>`");
		
		let reaction_role, reaction_role_id;
		if(message.mentions.roles.first()) {
			reaction_role = message.mentions.roles.first();
			reaction_role_id = reaction_role.id;
		} else if(message.guild.roles.cache.get(args.slice(3, 4).join())) {
			reaction_role_id = args.slice(3, 4).join();
			reaction_role = message.guild.roles.cache.get(reaction_role_id);
		} else {
			return message.reply("Please mention a valid **Role** in this server!\n**Usage:** `" + config.prefix + command + " <Channel/Channel ID> <Message ID> <Emoji/Emoji ID> <Role/Role ID>`");
		}
		
		if(reaction_role.permissions.cache.has('ADMINISTRATOR'))
			return message.reply("This role can't be given!");
		
		db.query(`INSERT INTO ${db_ReactionRoles} (GuildID, ChannelID, MsgID, ReactionEmoji, ReactionRoleID) VALUES ('${message.guild.id}', '${reaction_channel_id}', '${reaction_message_id}', '${reaction_emoji}', '${reaction_role.id}')`, (err, rows, fields) => {
			if(err) throw err;

			if(!reactionRoles[message.guild.id])
				reactionRoles[message.guild.id] = [];

			reactionRoles[message.guild.id].push({
				ChannelID: reaction_channel_id,
				MsgID: reaction_message_id,
				ReactionEmoji: reaction_emoji,
				ReactionRoleID: reaction_role.id
			});
		});
		
		await reaction_channel.messages.fetch(reaction_message_id).then(msg => {
			msg.react(reaction_emoji);
		}).catch(console.error);
	}
	/*
	if(command === "reactionroles") {
		if(message.member.guild.owner.id != message.author.id)
			return;

		let Description = "";

		for(var i = 0; i < reactionRoles[message.guild.id].length; i++) {
			let Pos = i + 1;
			let GuildID = message.guild.id;
			let ChannelID = reactionRoles[message.guild.id][i].ChannelID;
			let MsgID = reactionRoles[message.guild.id][i].MsgID;
			let ReactionEmoji = reactionRoles[message.guild.id][i].ReactionEmoji;
			let ReactionRoleID = reactionRoles[message.guild.id][i].ReactionRoleID;
			
			// Description += `\`${Pos}.\` ${Action} **${Math.abs(AddedBonus)}** Invites - ${diffDate} ago\n**Moderator —** ${ModTag} **|** <@${ModID}>\n**Reason —** ${Reason}\n\n`;
		}

		const Embed = new Discord.MessageEmbed()
		.setColor('#ac1414')
		.setTitle(`Server Reaction Roles`)
		.setDescription(Description)
		.setTimestamp()
		.setFooter(`${message.guild.name} ─ ${reactionRoles[message.guild.id].length} Reaction Roles`, BotAvatar);
		
		await message.channel.send(Embed).catch(console.log);
	}
	*/
	if(command === "guessthenumber" || command === "gtn") {
		if(!message.member.hasPermission('MANAGE_SERVER'))
			return;
		
		if(guessTheNumber[message.channel.id])
			return message.reply("the **Guess The Number** game is already running in this channel!");
		
		let StartAfter = args.slice(0, 1).join().toLowerCase();
		if(!StartAfter || ms(StartAfter) === undefined)
			return message.reply("Please type the **Duration** to start **Guess The Number** game!\n**Usage:** `" + config.prefix + command + " <Duration to start> <From Number> <To Number> <Prize (optional)>`");

		let FromNumber = args.slice(1, 2).join();
		if(!FromNumber || isNaN(FromNumber))
			return message.reply("Please type a valid **Number** from where to start **Guess The Number** game!\n**Usage:** `" + config.prefix + command + " <Duration to start> <From Number> <To Number> <Prize (optional)>`");
		
		let ToNumber = args.slice(2, 3).join();
		if(!ToNumber || isNaN(ToNumber))
			return message.reply("Please type a valid **Number** to where to start **Guess The Number** game!\n**Usage:** `" + config.prefix + command + " <Duration to start> <From Number> <To Number> <Prize (optional)>`");
		
		let Prize = args.slice(3).join(' ');

		prepareGuessTheNumber(message.channel, ms(StartAfter), parseInt(FromNumber), parseInt(ToNumber), Prize, message.author.id);
	}
});

/*=====================================[ Message Reaction Add Event ]=====================================*/
client.on("messageReactionAdd", async (reaction, user) => {
	if(reaction.message.partial)
		await reaction.message.fetch();
	
	if(user.bot)
		return;
	
	if(!reaction.message.channel.guild)
		return;

	var GiveawayCreation = async () => {
		for(var i = 0; i < GiveawayCreate.length; i++) {
			if(GiveawayCreate[i]["MsgID"] != reaction.message.id || GiveawayCreate[i]["CreatorID"] != user.id)
				continue;

			if(GiveawayCreate[i]["Requirements"] != "1")
				continue;

			if(reaction.emoji.name == "1️⃣") {
				reaction.message.reactions.removeAll().catch(error => console.error('Failed to clear reactions!\nReason: ', error));
				GiveawayCreate[i]["ReqInvites"] = "answering";
				GiveawayCreate[i]["Requirements"] = "0";

				const Embed = new Discord.MessageEmbed()
				.setColor('#ac1414')
				.setAuthor("Requirement Setup", user.displayAvatarURL())
				.setDescription("Please mention how many **invites** will be required to join the giveaway.")
				.setTimestamp()
				.setFooter(reaction.message.guild.name, BotAvatar);

				await reaction.message.channel.messages.fetch(GiveawayCreate[i]["MsgID"]).then(msg => {
					msg.edit(Embed).catch(console.error);
				}).catch(console.error);
			}
			else if(reaction.emoji.name == "2️⃣") {
				reaction.message.reactions.removeAll().catch(error => console.error('Failed to clear reactions!\nReason: ', error));
				GiveawayCreate[i]["ReqNewInvites"] = "answering";
				GiveawayCreate[i]["Requirements"] = "0";

				const Embed = new Discord.MessageEmbed()
				.setColor('#ac1414')
				.setAuthor("Requirement Setup", user.displayAvatarURL())
				.setDescription("Please mention how many **new invites** will be required to join the giveaway.")
				.setTimestamp()
				.setFooter(reaction.message.guild.name, BotAvatar);

				await reaction.message.channel.messages.fetch(GiveawayCreate[i]["MsgID"]).then(msg => {
					msg.edit(Embed).catch(console.error);
				}).catch(console.error);
			}
			else if(reaction.emoji.name == "3️⃣") {
				reaction.message.reactions.removeAll().catch(error => console.error('Failed to clear reactions!\nReason: ', error));
				GiveawayCreate[i]["ReqMessages"] = "answering";
				GiveawayCreate[i]["Requirements"] = "0";

				const Embed = new Discord.MessageEmbed()
				.setColor('#ac1414')
				.setAuthor("Requirement Setup", user.displayAvatarURL())
				.setDescription("Please mention how many **sent messages** will be required to join the giveaway.")
				.setTimestamp()
				.setFooter(reaction.message.guild.name, BotAvatar);

				await reaction.message.channel.messages.fetch(GiveawayCreate[i]["MsgID"]).then(msg => {
					msg.edit(Embed).catch(console.error);
				}).catch(console.error);
			}
			else if(reaction.emoji.name == "4️⃣") {
				reaction.message.reactions.removeAll().catch(error => console.error('Failed to clear reactions!\nReason: ', error));
				GiveawayCreate[i]["ReqLevel"] = "answering";
				GiveawayCreate[i]["Requirements"] = "0";

				const Embed = new Discord.MessageEmbed()
				.setColor('#ac1414')
				.setAuthor("Requirement Setup", user.displayAvatarURL())
				.setDescription("Please mention the required **level** to join the giveaway.")
				.setTimestamp()
				.setFooter(reaction.message.guild.name, BotAvatar);

				await reaction.message.channel.messages.fetch(GiveawayCreate[i]["MsgID"]).then(msg => {
					msg.edit(Embed).catch(console.error);
				}).catch(console.error);
			}
			else if(reaction.emoji.name == "5️⃣") {
				reaction.message.reactions.removeAll().catch(error => console.error('Failed to clear reactions!\nReason: ', error));
				GiveawayCreate[i]["ReqRole"] = "answering";
				GiveawayCreate[i]["Requirements"] = "0";

				const Embed = new Discord.MessageEmbed()
				.setColor('#ac1414')
				.setAuthor("Requirement Setup", user.displayAvatarURL())
				.setDescription("Please type the **role(s)** or **role(s) id** that the user must have in order to join the giveaway.\nIf multiple, separate each **role** with a space.")
				.setTimestamp()
				.setFooter(reaction.message.guild.name, BotAvatar);

				await reaction.message.channel.messages.fetch(GiveawayCreate[i]["MsgID"]).then(msg => {
					msg.edit(Embed).catch(console.error);
				}).catch(console.error);
			}
			else if(reaction.emoji.name == "✅") {
				reaction.message.reactions.removeAll().catch(error => console.error('Failed to clear reactions!\nReason: ', error));
				await reaction.message.channel.messages.fetch(GiveawayCreate[i]["MsgID"]).then(msg => {
					msg.delete();
				}).catch(console.error);

				startGiveaway(i);
			}
		}
	};
	GiveawayCreation();

	var GiveawayEntry = async () => {
		for(var i = 0; i < Giveaways.length; i++) {
			if(reaction.emoji.name != GiveawayEmoji || Giveaways[i]["MsgID"] != reaction.message.id)
				continue;
			
			if(reaction.message.guild.members.cache.get(user.id).roles.cache.has(NitroBooster))
				continue;
			
			if(!Giveaways[i]["ReqInvites"] && !Giveaways[i]["ReqNewInvites"] && !Giveaways[i]["ReqMessages"] && !Giveaways[i]["ReqLevel"] && !Giveaways[i]["ReqRole"])
				continue;

			if(Giveaways[i]["ReqInvites"]) {
				let Regular = 0, Bonus = 0, Fake = 0, Leaves = 0, Invites = 0;
				await new Promise((resolve, reject) => {
					db.query(`SELECT * FROM ${db_InviteCount} WHERE GuildID = '${reaction.message.guild.id}' AND UserID = '${user.id}'`, (err, rows) => {
						if(err) throw err;

						if(!rows[0])
							return resolve();

						Regular = parseInt(rows[0].Regular);
						Bonus = parseInt(rows[0].Bonus);
						Fake = parseInt(rows[0].Fake);
						Leaves = parseInt(rows[0].Leaves);
						Invites = Regular + Bonus + Fake + Leaves;
						resolve();
					});
				});

				let ReqInvitesRemaining = parseInt(Giveaways[i]["ReqInvites"]) - Invites;
				if(ReqInvitesRemaining > 0) {
					const Embed = new Discord.MessageEmbed()
					.setColor('#d0021b')
					.setTitle("🚫 ENTRY DENIED")
					.setDescription(`You need to invite **${ReqInvitesRemaining}** more people to enter [this giveaway](https://discordapp.com/channels/${Giveaways[i]["GuildID"]}/${Giveaways[i]["ChannelID"]}/${Giveaways[i]["MsgID"]}).\n**Tip:** use \`${config.prefix}invites\` in <#${bot_commands}> to check your **invites**.`)
					.setFooter(reaction.message.guild.name, BotAvatar);

					user.send(Embed).catch(console.error);
					reaction.users.remove(user.id);

					return;
				}
			}

			if(Giveaways[i]["ReqNewInvites"]) {
				let NewInvites = 0;
				await new Promise((resolve, reject) => {
					db.query(`SELECT * FROM ${db_InviteLogs} WHERE GuildID = '${reaction.message.guild.id}' AND Action = 'Join' AND UserID <> '${user.id}' AND InviterID = '${user.id}' AND Date > ${Giveaways[i]["StartDate"]}`, async (err, rows) => {
						if(err) throw err;

						if(!rows[0])
							return resolve();

						for(var j = 0; j < rows.length; j++) {
							let currentNewInvites = NewInvites;
							await new Promise((resolve2, reject2) => {
								db.query(`SELECT * FROM ${db_InviteLogs} WHERE GuildID = '${reaction.message.guild.id}' AND Action = 'Join' AND UserID = '${rows[j].UserID}' AND Date < ${rows[j].Date}`, (err2, rows2) => {
									if(err2) throw err2;

									if(rows2[0])
										return resolve2();

									NewInvites ++;
									resolve2();
								});
							});

							if(NewInvites == currentNewInvites)
								continue;

							await new Promise((resolve2, reject2) => {
								db.query(`SELECT * FROM ${db_InviteLogs} WHERE GuildID = '${reaction.message.guild.id}' AND Action = 'Leave' AND UserID = '${rows[j].UserID}' AND Date > ${rows[j].Date}`, (err2, rows2) => {
									if(err2) throw err2;

									if(!rows2[0])
										return resolve2();

									NewInvites --;
									resolve2();
								});
							});

							if(NewInvites == parseInt(Giveaways[i]["ReqNewInvites"]))
								break;
						}
						resolve();
					});
				});

				let ReqNewInvitesRemaining = parseInt(Giveaways[i]["ReqNewInvites"]) - NewInvites;
				if(ReqNewInvitesRemaining > 0) {
					const Embed = new Discord.MessageEmbed()
					.setColor('#d0021b')
					.setTitle("🚫 ENTRY DENIED")
					.setDescription(`You need to invite **${ReqNewInvitesRemaining}** more people to enter [this giveaway](https://discordapp.com/channels/${Giveaways[i]["GuildID"]}/${Giveaways[i]["ChannelID"]}/${Giveaways[i]["MsgID"]}).\n**Tip:** use \`${config.prefix}invites\` in <#${bot_commands}> to check your **invites**.`)
					.setFooter(reaction.message.guild.name, BotAvatar);

					user.send(Embed).catch(console.error);
					reaction.users.remove(user.id);

					return;
				}
			}

			if(Giveaways[i]["ReqMessages"] || Giveaways[i]["ReqLevel"]) {
				let Level = 0, EXP = 0, EXP2 = 0, MessagesCount = 0;
				await new Promise((resolve, reject) => {
					db.query(`SELECT * FROM ${db_LevelSystem} WHERE GuildID = '${reaction.message.guild.id}' AND UserID = '${user.id}'`, (err, rows) => {
						if(err) throw err;
						
						if(!rows[0])
							return resolve();

						Level = parseInt(rows[0].Level);
						EXP = parseInt(rows[0].EXP);
						EXP2 = parseInt(rows[0].EXP2);
						MessagesCount = parseInt(rows[0].MessagesCount);
						resolve();
					});
				});
			}

			if(Giveaways[i]["ReqMessages"]) {
				let ReqMessagesRemaining = parseInt(Giveaways[i]["ReqMessages"]) - MessagesCount;
				if(ReqMessagesRemaining > 0) {
					const Embed = new Discord.MessageEmbed()
					.setColor('#d0021b')
					.setTitle("🚫 ENTRY DENIED")
					.setDescription(`You need to send **${ReqMessagesRemaining} messages** to enter [this giveaway](https://discordapp.com/channels/${Giveaways[i]["GuildID"]}/${Giveaways[i]["ChannelID"]}/${Giveaways[i]["MsgID"]}).\n**Tip:** use \`${config.prefix}rank\` in <#${bot_commands}> to check your **total sent messages**.`)
					.setFooter(reaction.message.guild.name, BotAvatar);

					user.send(Embed).catch(console.error);
					reaction.users.remove(user.id);
					
					return;
				}
			}

			if(Giveaways[i]["ReqLevel"]) {
				if(Level < parseInt(Giveaways[i]["ReqLevel"])) {
					const Embed = new Discord.MessageEmbed()
					.setColor('#d0021b')
					.setTitle("🚫 ENTRY DENIED")
					.setDescription(`You must have **level ${Giveaways[i]["ReqLevel"]}** to enter [this giveaway](https://discordapp.com/channels/${Giveaways[i]["GuildID"]}/${Giveaways[i]["ChannelID"]}/${Giveaways[i]["MsgID"]}).\n**Tip:** use \`${config.prefix}rank\` in <#${bot_commands}> to check your **level**.`)
					.setFooter(reaction.message.guild.name, BotAvatar);

					user.send(Embed).catch(console.error);
					reaction.users.remove(user.id);
					
					return;
				}
			}

			if(Giveaways[i]["ReqRole"]) {
				let ReqRole = JSONbig.parse("[" + Giveaways[i]["ReqRole"] + "]");
				let ReqRoles = "", ReqRolesCount = 0;
				for(j = 0; j < ReqRole.length; j++) {
					if(reaction.message.guild.members.cache.get(user.id).roles.cache.has(""+ReqRole[j]))
						continue;

					if(ReqRoles != "") ReqRoles += ", ";
					ReqRoles += "**" + reaction.message.guild.roles.cache.get(""+ReqRole[j]).name + "**";
					ReqRolesCount ++;
				}

				if(ReqRolesCount > 0) {
					const Embed = new Discord.MessageEmbed()
					.setColor('#d0021b')
					.setTitle("🚫 ENTRY DENIED")
					.setDescription(`You must have ${ReqRoles} **role${ReqRolesCount > 1 ? "s" : ""}** to enter [this giveaway](https://discordapp.com/channels/${Giveaways[i]["GuildID"]}/${Giveaways[i]["ChannelID"]}/${Giveaways[i]["MsgID"]}).`)
					.setFooter(reaction.message.guild.name, BotAvatar);

					user.send(Embed).catch(console.error);
					reaction.users.remove(user.id);
					
					return;
				}
			}
		}
	};
	GiveawayEntry();

	for(var i = 0; i < reactionRoles[reaction.message.guild.id].length; i++) {
		let ChannelID = reactionRoles[reaction.message.guild.id][i].ChannelID;
		let MsgID = reactionRoles[reaction.message.guild.id][i].MsgID;
		let ReactionEmoji = reactionRoles[reaction.message.guild.id][i].ReactionEmoji;
		let ReactionRoleID = reactionRoles[reaction.message.guild.id][i].ReactionRoleID;

		if(MsgID != reaction.message.id)
			continue;

		if(ReactionEmoji == reaction.emoji.id || ReactionEmoji == reaction.emoji.name) {
			const mrole = reaction.message.guild.roles.cache.get(ReactionRoleID);
			reaction.message.guild.member(user).roles.add(mrole).catch(console.error);
			break;
		}
	}
});

/*=====================================[ Message Reaction Remove Event ]=====================================*/
client.on("messageReactionRemove", async (reaction, user) => {
	if(reaction.message.partial)
		await reaction.message.fetch();
	
	if(user.bot)
		return;
	
	if(!reaction.message.channel.guild)
		return;
	
	for(var i = 0; i < reactionRoles[reaction.message.guild.id].length; i++) {
		let ChannelID = reactionRoles[reaction.message.guild.id][i].ChannelID;
		let MsgID = reactionRoles[reaction.message.guild.id][i].MsgID;
		let ReactionEmoji = reactionRoles[reaction.message.guild.id][i].ReactionEmoji;
		let ReactionRoleID = reactionRoles[reaction.message.guild.id][i].ReactionRoleID;
		
		if(MsgID != reaction.message.id)
			continue;
		
		if(ReactionEmoji == reaction.emoji.id || ReactionEmoji == reaction.emoji.name) {
			const mrole = reaction.message.guild.roles.cache.get(ReactionRoleID);
			reaction.message.guild.member(user).roles.remove(mrole).catch(console.error);
			break;
		}
	}
});

client.login(config.token);