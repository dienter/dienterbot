// Requires
// Twitch library
var tmi = require('tmi.js');
// filesync
const fs = require('fs');
const path = require('path');

// Constant for song folder location that shouldn't change
const songFolder = 'E:\\SteamLibrary\\steamapps\\common\\Beat Saber\\CustomSongs';

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
    username: 'DienterBot',
    password: 'oauth:6y3axy6zcmq5tajt31czq0ukireizj'
  },
  channels: ['Dienter']
};

// Create a client with the options
var client = new tmi.client(options);

// Connect using the above client to channel
client.connect();

// Do an action on connect
client.on('connected', function(address, port) {
  console.log('Address: ' + address + ' Port: ' + port);
});

// Every 5 minutes remind people to follow
setTimeout(followReminder, 600000);

var followReminder = funciton() {
  client.action('dienterbot', 'Don\'t forget to hit the follow button, it helps me a lot!')
}

// Respond to specific chat commands
client.on('chat', function(channel, user, message, self) {
  switch (message) {
    case '!twitter':
      client.action('dienter', 'twitter.com/dienter2');
    case '!songlist':
      list = loadSongs(songFolder);
      list.sort();
      console.log(list);
    default:
      console.log('Message not recognized');
      //client.action('dienter', user['display-name'] + ' this was a test')
  }
});

var loadSongs = function(dir, filelist) {
  var path = path || require('path');
  var fs = fs || require('fs');
  files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (path.join(dir, file).indexOf('.cache') > -1) {
      console.log('YEP');
      return;
    } else if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = loadSongs(path.join(dir, file), filelist);
    } else if (path.join(dir, file).indexOf('info.json') > -1) {
      try {
        var contents = fs.readFileSync(path.join(dir, file));
        var jsonContent = JSON.parse(contents);
        //filelist.push(join(jsonContent.songName, ' - ', jsonContent.songSubName));
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
