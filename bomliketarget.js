const inquirer = require('inquirer');
const insta = require('../func.js');
const Client = require('instagram-private-api').V1;
const _ = require('lodash');
const rp = require('request-promise');
const chalk = require('chalk');

const bomLikeTarget = async (session) => {
  const question = [
    {
      type:'input',
      name:'target',
      message:'Insert Username Target (Without @[at])',
      validate: function(value){
        if(!value) return 'Can\'t Empty';
        return true;
      }
    },
    {
      type:'input',
      name:'sleep',
      message:'Insert Sleep (In MiliSeconds)',
      validate: function(value){
        value = value.match(/[0-9]/);
        if (value) return true;
        return 'Delay is number';
      }
    }
  ]
  try {
    const answers = await inquirer.prompt(question);
    const requestOption = {
      url:'https://www.instagram.com/'+answers.target+'/?__a=1',
      json:true
    }
    var targetId = await rp(requestOption);
    targetId = targetId.user.id;
    const feeds = new Client.Feed.UserMedia(session, targetId);
    var cursor;
    do {
      if (cursor) feeds.setCursor(cursor);
      var media = await feeds.get();
      media = _.chunk(media, 5);
      for (media of media) {
        await Promise.all(media.map(async(media) => {
          var timeNow = new Date();
          timeNow = `${timeNow.getHours()}:${timeNow.getMinutes()}:${timeNow.getSeconds()}`
          const result = await insta.doLike(media.id);
          console.log(chalk`[{magenta ${media.id}}] {cyanBright ${media.params.webLink}} => ${result ? chalk`{bold.green SUKSES}` : `{bold.red GAGAL}`}`)
        }));
        await insta.doSleep(answers.sleep, `Sleep for ${answers.sleep} MiliSeconds...`);
      }
    } while(feeds.isMoreAvailable())
  } catch (e) {
    return Promise.reject(e);
  }
}

module.exports = bomLikeTarget;
