const Discord = require('discord.js');
const client = new Discord.Client();
const unirest = require("unirest");
const {token} = require('./config.json');

client.on('ready', () => {
    console.log(`🚀 Connecté en tant que ${client.user.tag}!`);
});

client.on('message', msg => {

    if (msg.author === client.user) {
        return;
    }

    let chan = msg.channel;
    let req = unirest("POST", "https://languagetool.org/api/v2/check");

    req.query({
        "text": `${msg.content}`,
        "language": "fr",
        "enabledOnly": false

    });

    req.headers({
        'Content-Type': 'application/x-www-form-urlencoded'
    });

    req.end(function (res) {
        if (res.error) throw new Error(res.error);
        let response = res.body.matches;

        let nbrFautes = response.length;

        let lines = [];

        if (nbrFautes === 1) {
            lines.push(`${msg.author} Tu as fais une faute dans cette phrase : ` + response[0].sentence);
            response.forEach(word => {
                if (response[0].replacements[0]) {
                    if (word.message === "Possible spelling mistake found.") {
                        lines.push("Elle s'écrit plutôt comme ça : " + word.replacements[0].value);
                    } else {
                        lines.push(word.message);
                    }
                } else {
                    lines.push("Mais je ne sais pas où exactement");
                }
            })
        } else {
            lines.push(`${msg.author} Tu as fais plusieurs fautes dans cette phrase : ` + response[0].sentence);

            response.forEach(word => {
                if (word.message === "Possible spelling mistake found.") {
                    if (word.replacements[0]) {
                        lines.push("Une de tes fautes s'écrit plutôt comme ça : " + word.replacements[0].value);
                    } else {
                        lines.push("Je n'arrive pas à cerner une de tes fautes mais elle est bien présente");
                    }
                } else {
                    lines.push(word.message);
                }
            })
        }

        chan.send(lines.join("\n"));
    });

});

client.login(token);
