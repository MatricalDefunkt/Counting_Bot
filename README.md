<!-- @format -->

# Counting Bot

Welcome to the counting bot's repository.
Following will be a tutorial on how to download the code from this repository and host your own instance of this bot.

I would recommend that you [invite this bot](https://discord.com/api/oauth2/authorize?client_id=1001198710266544288&permissions=17179937856&scope=bot%20applications.commands) for ease of use instead of having to set it up.

# Self Hosting

## Prerequisites

### Mandatory

<ul>
<li><a href="https://nodejs.org/en/">NodeJS</a>, version higher than 16.9</li>
<li>Any text file editor or code editor (notepad works as well)</li>
<li>A Discord account</li>
<li>A <a href="https://discord.com/developers/applications">Discord Bot</a> account (Small <a href="https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot">tutorial</a> on how to create one)</li>
</ul>

### Optional

<ul><li>A Discord server with a webhook for logging errors onto discord. (Small  <a href="https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks">tutorial</a> on how to create a webhook)</li></ul>

## Downloading

To begin with hosting your own instance, you must first dowload the source code for this repository:

<ol>
  <li>Click on the green labelled "code" towards the top-right of the files in the repository</li>
  <li>Click on "Download ZIP"</li>
  <li>A zip file will be downloaded, extract it wherever you would like.</li>
</ol>

## Initial Steps

Assuming that you have downloaded and installed NodeJS, and extracted the source code zip folder somewhere, you must now follow these steps:

<ol>
  <li>Copy the contents of <a href="https://github.com/MatricalDefunkt/Counting_Bot/blob/master/.env.example">.env.example</a> into a <b>new</b> text file.</li>
  <li>Fill in the appropriate values inside the quotes:
    <ul>
      <li><kbd>TOKEN:</kbd> This is your bot's token which you must copy from your bot's <a href="https://discord.com/developers/applications">application</a> screen</li>
      <li><kbd>TESTGUILDID:</kbd> This is the ID of the server where you will recieve login updates by the bot.</li>
      <li><kbd>TESTCHANNELID:</kbd> This is the ID of the channel where the bot will send the message.</li>
      <li><kbd>ERRORWEBHOOKURL:</kbd> This is the webhook URL using which you will recieve errors.</li>
    </ul>
  </li>
  <li>Save the text file in the primary folder (alongside .env.example), naming it <kbd>.env</kbd>.</li>
  <li>Create a folder names <kbd>logs</kbd> (casing matters).</li>
  <li>Open an instance of a shell in the folder.</li>
  <li>Run the command <kbd>npm install</kbd> in the shell window.</li>
  <li>Run the command <kbd>npm run start</kbd> in the shell window once the previous command succeeds.</li>
</ol>

If you have entered all the data correctly, the bot should start running.
If you face any errors, please create an issue on the <a href="https://github.com/MatricalDefunkt/Counting_Bot/issues">issues page</a> on the repository.

Thank you for reading!
