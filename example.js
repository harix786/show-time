var moment = require("moment");

var getNewEpisodes = function(callback) {
  var request = require('request');
  var _ = require('underscore');
  var zpad = require('zpad');
  var util = require('util')

  var access_token = "c89ad7e48248156a18bad053b5b0eb15debddc3560005c9888ccd4e9e62add54"
  var refresh_token = "26a5d6d6d7a8a0e825626d9ce51435140d6c6b2d3334f08f975f43add03aab82"

  var headers = {
    "Content-Type": "application/json",
    "trakt-api-key": "123eaefe74369e41a98369af821d59a52c9283b20d79fead29e284ada23a1874",
    "trakt-api-version": "2",
    "Authorization": "Bearer c89ad7e48248156a18bad053b5b0eb15debddc3560005c9888ccd4e9e62add54"
  }

  var days = 7;
  var date = new Date();
  date.setDate(date.getDate() - days);
  var printableDate = moment(date).format("YYYY-MM-DD");

  var options = {
    url: "https://api-v2launch.trakt.tv/calendars/my/shows/" + printableDate + "/" + days,
    headers: headers
  };

  request(options, function(error, response, body){
    var raw = JSON.parse(body)
    var episodes = _.map(raw, function(data) {
      var episode = data["episode"]
      var season = zpad(episode["season"], 2);
      var number = zpad(episode["number"], 2);
      var show = data["show"]["title"]
      return { 
        "show": show, 
        "what": util.format('s%se%s', season, number)
      }
    });

    callback(episodes)
  });
}

getNewEpisodes(function(episodes) {
  console.info(episodes)
})