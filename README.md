# dienterbot
My Basic Twitch Bot

This bot is used for Twitch channels to be able to customize responses to commands, as well as attempt to keep a list of commands used by people to think about future possibilities. 

# Configuration example
BOT_NAME='<BOT USERNAME>' - username of the desired bot
BOT_OAUTH_TOKEN='<OAUTH KEY>' - oauth key for the bot user
CHANNEL_LIST='<LIST OF CHANNELS COMMA SEPERATED>' - list of channels to take in to connect to
COMM_CHANNEL='<CHANNEL TO TALK TO>' - the chat channel to place messages
BEAT_SABER_SONG_FOLDER='<DIRECTORY OF BEAT SABER SONGS>' - for Beat Saber integration to be able to compile a list of songs
BEAT_SABER_COMMAND_ENABLED=<TRUE / FALSE> - to enable/disable Beat Saber integration
PASTEBIN_API_KEY=<API KEY FOR PASTEBIN> - pastebin link to upload temporary song list to
PASTEBIN_USERNAME=<USERNAME FOR PASTEBIN> - username for pastebin
PASTEBIN_PASSWORD=<PASSWORD FOR PASTEBIN> - password for pastebin
TWITTER_LINK=<TWITTER LINK> - for the !twitter command to show the Twitter page associated

# Default commands
!twitter - shows the user's twitter channel
!songlist - compiles a songlist for Beat Saber in the directory, and puts the list on pastebin, generating and posting a link in the channel
!suggest - saves the suggested command for a local file for review later
