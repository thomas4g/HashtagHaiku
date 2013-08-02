var app = require('http').createServer(handler),
	//WebSocketServer = require('ws').Server,
//	wss = new WebSocketServer({'port':8081}),
	fs = require('fs'),
	util = require('util'),
	twitter = require('ntwitter');

var twit = new twitter({
	consumer_key:'xueYZaKIaJxYWjnefGCszA',
	consumer_secret:'6720dvGEb9yUtZQ3qPpOvMefvWq6yWb17wVoNTwkk',
	access_token_key:'614629351-BErJrNM8mj1ZvVaE3dNJhm69Qnk13Htq02O9n31U',
	access_token_secret:'AqH7peVufCyONGTwc5XqNf23rcAU0ubv49z4fIjisc'
});


var fives = [],
	latest_five = '',
	sevens = [],
	latest_seven = '',
	clients = [];


app.listen(process.env.PORT || 8080);

//wss.on('connection', function(client) {
//	client.send(generateHaikus());
//	clients.push(client);
//	client.on('close', function() {
//		clients.splice(clients.indexOf(client), 1);
//	});
//});

getTweets();
setInterval(getTweets, 60000);
//setInterval(updateHaikus, 10000);

function generateHaikus() {
	var first = random(0, fives.length-1, -1),
		last = random(0, fives.length-1, first),
		middle = random(0, sevens.length-1, -1),
		randomHaiku = formHaiku(fives[first],sevens[middle],fives[last]),
		recentHaiku = formHaiku(fives[fives.length-1],
									sevens[sevens.length-1],
									fives[fives.length-2]);
	return JSON.stringify({
		'recent': recentHaiku,
		'random': randomHaiku
	});
}

function getTweets() {
	console.log("fetching fives");
	fetchTweets('#haiku5', fives, latest_five);
	console.log("fetching sevens");
	fetchTweets('#haiku7', sevens, latest_seven);
}

function fetchTweets(hashtag, list, latest) {
	twit.search(hashtag,{'since_id': latest}, function(err, data) {
		latest = data.search_metadata.max_id;
		for(var i=data.statuses.length-1;i>=0;i--) {
			var line = {
				text: data.statuses[i].text.replace(hashtag, '').trim(),
				user: data.statuses[i].user.screen_name
			}
			if(list.indexOf(line) === -1) {
				latest = data.statuses[i].id;
				list.push(line);
			}
		}
	});
}

//function updateHaikus() {
//	var response = generateHaikus();
//	for(var i=0;i<clients.length;i++) {
//		clients[i].send(response);
//	}
//}

function formHaiku(first, middle, last) {
	var result= [first, middle, last];
	return result;
}



function random(min, max, exclude) {
	var result = exclude;
	while(result === exclude) {
		result = Math.floor(Math.random()*(max-min+1) + min);
	}
	return result;
}

function handler(req, res) {
	if(req.url.replace('/','') === 'poll') {
		res.writeHead(200);
		res.end(generateHaikus());
		return;
	}
	fs.readFile(__dirname +'/index.html',
		function(err, data) {
			if(err) {
				res.writeHead(404);
				return res.end('Couldn\'t find this yo.');
			}
			
			res.writeHead(200);
			res.end(data);
		})
}
