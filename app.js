// Requires
// Twitch library
var tmi = require('tmi.js');
var Repeat = require('Repeat');
require('dotenv').load();
// filesync
const fs = require('fs');
const path = require('path');

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
    password: process.env.BOT_KEY
  },
  channels: ['dienterbot']
};

// Create a client with the options
var client = new tmi.client(options);

// Connect using the above client to channel
client.connect();

// Do an action on connect
client.on('connected', function(address, port) {
  console.log('Address: ' + address + ' Port: ' + port);
  client.action(process.env.COMM_CHANNEL, 'I am now here');
});

// Every 5 minutes remind people to follow
Repeat(followReminder).every(20, 'min').start.in(5, 'sec');

function followReminder() {
  client.action(process.env.COMM_CHANNEL, 'RaccAttack Don\'t forget to hit the follow button, it helps me a lot! RaccAttack');
}

// Respond to specific chat commands
client.on('chat', function(channel, user, message, self) {
  switch (message) {
    case '!twitter':
      client.action(process.env.COMM_CHANNEL, 'twitter.com/dienter2');
      break;
    case '!songlist':
      if (process.env.BEAT_SABER_COMMAND_ENABLED) {
        console.log('!songlist is not enabled');
        break;
      }
      list = loadSongs(process.env.BEAT_SABER_SONG_FOLDER);
      list.sort();
      console.log(list);
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
        var contents = fs.readFileSync(path.join(dir, file));
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
      }
    }
  });
  return filelist;
};
