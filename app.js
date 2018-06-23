// Requires
// Twitch library
var tmi = require('tmi.js');
var Repeat = require('Repeat');
require('dotenv').load();
var PastebinAPI = require('pastebin-js');
// filesync
const fs = require('fs');
const path = require('path');
const sys = require('sys');
// Setup the options for the channel connection
var options = {
  options: {
    debug: true
  },
  connection: {
    cluster: 'aws',
    reconnect: true
  },
  identity: {
    username: process.env.BOT_NAME,
    password: process.env.BOT_OAUTH_TOKEN
  },
  channels: process.env.CHANNEL_LIST.split(',')
};

// Create a PastebinAPI object for beat saber song list uploading
var pastebin = new PastebinAPI({
  'api_dev_key': process.env.PASTEBIN_API_KEY,
  'api_user_name': process.env.PASTEBIN_USERNAME,
  'api_user_password': process.env.PASTEBIN_PASSWORD
});
// Variable to check if you can upload to pastebin based on time limit - resets on Repeat
var canUploadToPastebin = false;

// Create a client with the options
var client = new tmi.client(options);

console.log(client);

// Connect using the above client to channel
client.connect();

// Do an action on connect
client.on('connected', function(address, port) {
  console.log('Address: ' + address + ' Port: ' + port);
  client.action(process.env.COMM_CHANNEL, 'I am now here');
});

Repeat(clearPastebinLimit).every(1, 'hour').start.in(1, 'sec');

function clearPastebinLimit() {
  console.log('Clearing the pastebin check to allow upload again.');
  canUploadToPastebin = true;
}
// Every 5 minutes remind people to follow
Repeat(followReminder).every(20, 'min').start.in(5, 'sec');

function followReminder() {
  botSpeakMessage('RaccAttack Don\'t forget to hit the follow button, it helps me out a lot! RaccAttack');
}

// Respond to specific chat commands
client.on('chat', function(channel, user, message, self) {
  switch (message) {
    case '!twitter':
      botSpeakMessage('You can find ' + process.env.COMM_CHANNEL + ' active on twitter @ ' + process.env.TWITTER_LINK);
      break;
    case '!songlist':
      if (process.env.BEAT_SABER_COMMAND_ENABLED == false) {
        console.log('!songlist is not enabled');
        break;
      } else {
        if (canUploadToPastebin) {
          console.log('Generating new song list');
          list = loadSongs(process.env.BEAT_SABER_SONG_FOLDER);
          list.sort();
          uploadSongList(list);
        } else {
          botSpeakMessage('Command is still on cooldown - find the most recent song list at ' + getTmpFileContents('beatlist.txt'));
        }
        break;
      }
    case (message.match(/^!suggest/) || {}).input:
      writeFileContents('suggestionlist.txt', message, 'append');
      botSpeakMessage('Added your suggestion to the list of commands. Will review when able!');
      break;
    case (message.match(/^!/) || {}).input:
      console.error(message + ' -- Recognized an attempted command that is not created.');
      break;
    default:
      console.log('Message: "' + message + '" not recognized');
      //client.action('dienter', user['display-name'] + ' this was a test')
  }
});

// Function to loop through the directory and add to an array of list of songs
var loadSongs = function(dir, filelist) {
  var path = path || require('path');
  var fs = fs || require('fs');
  files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (path.join(dir, file).indexOf('.cache') > -1) {
      return;
    } else if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = loadSongs(path.join(dir, file), filelist);
    } else if (path.join(dir, file).indexOf('info.json') > -1) {
      try {
        var contents = fs.readFileSync(path.join(dir, file), "utf8");
        contents = contents.replace(/[^a-z0-9{}:,"@!?#$%&\*()\\\[\]]+/gi, '');
        var jsonContent = JSON.parse(contents);

        // If the array doesn't already exist, be sure to create it
        if (!Array.isArray(filelist)) {
          filelist = [];
        }
        // Create a string and push it to the array
        var fullString = "".concat(jsonContent.songName, ' -- ', jsonContent.songSubName, ' -- ', jsonContent.authorName);
        // Clean up the string before pushing
        fullString.replace(/[\s]{2,}/g, /\s/);
        filelist.push(fullString);
      } catch (error) {
        console.error('Error reading file at: ' + path.join(dir, file));
        console.error(error);
        console.error(contents);
      }
    }
  });
  return filelist;
};

var uploadSongList = function(songList) {
  console.log('Uploading song list to pastebin');
  pastebin.createPaste({
    text: songList.join('\n'),
    title: 'Dienter Beat Saber Song List',
    format: null,
    privacy: 1,
    expiration: '1H'
  }).then(function(data) {
    botSpeakMessage('Songlist was generated, you can find it at ' + data);
    writeFileContents('beatlist.txt', data, 'new');
    canUploadToPastebin = false;
  }).fail(function(err) {
    botSpeakMessage('Something went horribly wrong generating the song list. Try again in a little bit!');
    console.error(err);
  });
};

var writeFileContents = function(file, content, type) {
  if (type === 'new') {
    fs.writeFile(file, content, function(err) {
      if (err) {
        return console.log(err);
      }
      console.log("The file was saved!");
    });
  }
  else if(type === 'append') {
    fs.appendFile(file, content, function (err) {
      if (err) throw err;
      console.log('Saved!');
    });
  }
};

var getTmpFileContents = function(file) {
  return fs.readFileSync((file), "utf8");
};

var botSpeakMessage = function(message) {
  client.say(process.env.COMM_CHANNEL, message);
};
