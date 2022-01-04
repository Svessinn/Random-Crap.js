const Discord = require('discord.js'); //gets the discord.js library
const bot = new Discord.Client; //creates a discord client names "bot"
const prefix = ['!']; //set you prefixes in this array
const token = process.env.DISCORD_BOT_SECRET; //this get your bot's token
const fs = require('fs')
 
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Connecting to a database
const { createClient } = require('@supabase/supabase-js')
const SUPABASE_URL = process.env['SUPABASE_URL']
const SUPABASE_KEY = process.env['SUPABASE_KEY']

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// keeps the discord bot alive
const keep_alive = require('./keep_alive.js') //links keep_alive.js with this project


//getting installed node mudules

const winston = require("winston")

const logger = winston.createLogger({
	transports: [
		new winston.transports.Console(),
		new winston.transports.File({ filename: 'log' }),
	],
	format: winston.format.printf(log => `[${log.level.toUpperCase()}] - ${log.message}`),
});

//some logging stuff
bot.on('ready', () => logger.log('info', 'The bot is online!'));
bot.on('debug', m => logger.log('debug', m));
bot.on('warn', m => logger.log('warn', m));
bot.on('error', m => logger.log('error', m));

process.on('uncaughtException', error => logger.log('error', error));

//the good stuff the command handeler
const { CommandHandler } = require("djs-commands")
const CH = new CommandHandler({
    folder: __dirname + '/commands/',
    prefix: ['!'] //set your prefixes in this array
  });



const GetBundleID = async (bundle) => {
  
	let { data, error } = await supabase
	.from("Bundles")
	.select("id")
	.eq("name", bundle)

  if (error) {
    console.error(error)
    return
  }
  return data
}

const GetSeriesID = async (serie) => {
  
	let { data, error } = await supabase
	.from("Series")
	.select("id")
	.eq("name", serie)

  if (error) {
    console.error(error)
    return
  }
  return data
}

const InsertSeriesBundles = async (bund, seri) => {

	let { data, error } = await supabase
	.from("SeriesBundles")
	.insert([
		{ bundle_id: bund, series_id: seri }
	])

  if (error) {
    console.error(error)
    return
  }
  return data
}

const InsertNIG = async (name, seri, clai, like) => {

	let { data, error } = await supabase
	.from("NIG_Test")
	.insert([
		{ char_name: name, series_name: seri, claim_rank: clai, like_rank: like }
	])

  if (error) {
    console.error(error)
    return
  }
  return data
}

const InsertCharacterSeries = async (name, seri, clai, like) => {

	let { data, error } = await supabase
	.from("CharacterSeries")
	.insert([
		{ char_name: name, claim_rank: clai, like_rank: like, series_id: seri }
	])

  if (error) {
    console.error(error)
    return 
  }
  return data
}

const InsertCharacters = async (chName, chGen, chType, seri) => {

	let { data, error } = await supabase
	.from("Characters")
	.insert([
		{ name: chName, gender: chGen, type: chType, series_id: seri }
	])

	if (error) {
    console.error(error)
    return 
  }
  return data
}

const InsertBundles = async (bund_name) => {

	let { data, error } = await supabase
	.from("Bundles")
	.insert([
		{ name: bund_name }
	])

	if (error) {
		console.log(error)
		return
	}
	return data
}

const InsertSeries = async (seri) => {

	let { data, error } = await supabase
	.from("Series")
	.insert([
		{ name: seri }
	])

	if (error) {
		console.log(error)
		fs.appendFile('Output.txt', error, (err) => {
			if (err) logger.log('error', err);
		})
		return
	}
	return data
}

bot.on('message', (message) => {
	if (message.author.bot && message.author.id === "432610292342587392") {

		
		mIF: if (message.embeds[0]) {
			// console.log(Object.keys(message.embeds[0]))
// Connect Series to Bundles
			let desc = message.embeds[0].description
			let auth = message.embeds[0].author

			if (!auth) {
				break mIF
			};
			if (auth['name'].includes('\'s wishlist')) {
				break mIF
			};
			if (desc.includes('=>')) {
				break mIF
			};

			// Bundle Collector
			if (auth['name'].includes('(bundle)')) {
				tI = message.embeds[0].author.name.split('\n').slice(0, 1)

				;(async () => {
					InsertBundles(tI)
				})
			};

			if (auth['name'].includes('(Bundle - ')) {
				let bundle = auth['name'].split('\n').slice(0, 1).toString()
				let lst = desc.split('\n')
				for (let i in lst) {
					lst[i] = lst[i].slice(2, ).split(' ')
					lst[i].splice(-1)
					lst[i] = lst[i].join(' ')
				};

				;(async () => {
					InsertBundles(bundle)
					let bID = await GetBundleID(bundle)
					bID = bID[0]['id']
					// console.log(bID)
					for (let i in lst) {
						InsertSeries(lst[i])
						let sID = await GetSeriesID(lst[i])
						sID = sID[0]['id']
						InsertSeriesBundles(bID, sID)
						console.log('updated', bID, sID)
					};
				} )()
// Collecting Characters, ranks, series
			} else if (desc.includes('Claims: #') && desc.includes('Likes: #')){
				let msg = desc.split('\n')
				let series_name = msg[0]
				let claim_rank = 0
				let like_rank = 0
				for (let i in msg) {
					if (msg[i].includes('Claims: #')){
						claim_rank = msg[i].slice(9, )
					};
					if (msg[i].includes('Likes: #')){
						like_rank = msg[i].slice(8, )
					};
				};

				if (series_name.includes('wishprotect')) {
					series_name = series_name.slice(0, -33)
					series_name = series_name.trim()
				};

				;(async () => {
					InsertNIG(auth['name'], series_name, claim_rank, like_rank)
					let o = 1
					while (!msg[o].includes('Claims: #') && !msg[o].includes('key:') && !msg[o].includes('<:kakera:') && !msg.includes('SOULMATE')) {
						series_name = series_name+' '+msg[o]
						o = o + 1
					};
					let sID = await GetSeriesID(series_name)
					sID = sID[0]['id']
					InsertCharacterSeries(auth['name'], sID, claim_rank, like_rank)
					console.log(auth['name'], sID)
				})()

			} else if (desc.includes('Claim Rank: #') && desc.includes('Like Rank: #')) {
				let msg = desc.split('\n')
				let series_name = msg[0]
				let o = 1
				while (!series_name.includes('male:') || o >= 5) {
					series_name = series_name + ' ' + msg[o]
					o = o+1
				};
				// Getting Gender
				let gender = 'Both'
				if (series_name.includes(':male:')) {
					series_name = series_name.slice(0, -28)
					gender = 'Male'
					if (series_name.includes(':female:')) {
						series_name = series_name.slice(0, -28)
						gender = 'Both'
					};
				} else if (series_name.includes(':female:')) {
					series_name = series_name.slice(0, -29)
					gender = 'Female'
				};
				// Getting Ranks adn Roll Types
				let claim_rank = 0
				let like_rank = 0
				let type = ''
				for (let i in msg) {
					if (msg[i].includes('Claim Rank: #')){
						claim_rank = msg[i].slice(13, )
					};
					if (msg[i].includes('Like Rank: #')){
						like_rank = msg[i].slice(12, )
					};
					if (msg[i].includes('Game roulette')) {
						type = 'Game'
					} else if (msg[i].includes('Animanga roulette')) {
						type = 'Animanga'
					} else if (msg[i].includes('Game & Animanga')) {
						type = 'Both'
					};
				};
				
				;(async () => {
					InsertNIG(auth['name'], series_name, claim_rank, like_rank)
					let sID = await GetSeriesID(series_name)
					sID = sID[0]['id']
					InsertCharacterSeries(auth['name'], sID, claim_rank, like_rank)
					console.log(auth['name'], sID)
				})()
				;(async () => {
					let sID = await GetSeriesID(series_name)
					sID = sID[0]['id']
					InsertCharacters(auth['name'], gender, type, sID)
					console.log('Character added:', auth['name'])
				})()

			};


	  };
	
			
  };
});

bot.on('messageUpdate', (oldMessage, message) => {
	if (message.author.bot && message.author.id === "432610292342587392") {
		mIF_2: if (message.embeds[0]) {
			let desc = message.embeds[0].description
			let auth = message.embeds[0].author

			if (!auth) {
				break mIF_2
			};
			if (auth['name'].includes('\'s wishlist')) {
				break mIF_2
			};
			if (desc.includes('=>')) {
				break mIF_2
			};

			if (desc.includes('Claim Rank: #') && desc.includes('Like Rank: #')) {
				let msg = desc.split('\n')
				let series_name = msg[0]
				let o = 1
				while (!series_name.includes('male:') || o >= 5) {
					series_name = series_name + ' ' + msg[o]
					o = o+1
				};
				let gender = 'Both'
				if (series_name.includes(':male:')) {
					series_name = series_name.slice(0, -28)
					gender = 'Male'
					if (series_name.includes(':female:')) {
						series_name = series_name.slice(0, -28)
						gender = 'Both'
					};
				} else if (series_name.includes(':female:')) {
					series_name = series_name.slice(0, -29)
					gender = 'Female'
				};
				let claim_rank = 0
				let like_rank = 0
				let type = ''
				for (let i in msg) {
					if (msg[i].includes('Claim Rank: #')){
						claim_rank = msg[i].slice(13, )
					};
					if (msg[i].includes('Like Rank: #')){
						like_rank = msg[i].slice(12, )
					};
					if (msg[i].includes('Game roulette')) {
						type = 'Game'
					} else if (msg[i].includes('Animanga roulette')) {
						type = 'Animanga'
					} else if (msg[i].includes('Game & Animanga')) {
						type = 'Both'
					};
				};
				
				;(async () => {
					InsertNIG(auth['name'], series_name, claim_rank, like_rank)
					let sID = await GetSeriesID(series_name)
					sID = sID[0]['id']
					InsertCharacterSeries(auth['name'], sID, claim_rank, like_rank)
					console.log(auth['name'], sID)
				})()
				;(async () => {
					let sID = await GetSeriesID(series_name)
					sID = sID[0]['id']
					InsertCharacters(auth['name'], gender, type, sID)
					console.log('Character added:', auth['name'])
				})()
			};

			if (auth['name'].includes('(Bundle - ')) {
				let bundle = auth['name'].split('\n').slice(0, 1).toString()
				let lst = desc.split('\n')
				for (let i in lst) {
					lst[i] = lst[i].slice(2, ).split(' ')
					lst[i].splice(-1)
					lst[i] = lst[i].join(' ')
				};
				;(async () => {
					InsertBundles(bundle)
					let bID = await GetBundleID(bundle)
					bID = bID[0]['id']
					// console.log(bID)
					for (let i in lst) {
						InsertSeries(lst[i])
						let sID = await GetSeriesID(lst[i])
						sID = sID[0]['id']
						InsertSeriesBundles(bID, sID)
						console.log('updated', bID, sID)
					};
				} )()
			};
		};
	};
});


//login to your bot
bot.login(token);
