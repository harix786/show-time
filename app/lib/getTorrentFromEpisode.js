var request = nRequire("request");

export default function(episode) {
  // Searches on kickass
  var search = function(query) {
    return new Promise(function(resolve, reject) {
      var params = {
        qs: {
          q: query,
          field: "seeders",
          order: "desc"
        },
        url: "https://kat.cr/json.php"
      };

      request(params, function(err, response, raw){
        if(err) { return reject(err); }

        try {
          var data = JSON.parse(raw);
        } catch(err) {
          return reject(err);
        }

        if (!data.list.length) {
          reject("No torrent matches when searching for '" + query + "'");
        } else {
          resolve(data.list[0]);
        }
      });
    });
  };

  return new Promise(function(resolve, reject) {
    var query1 = episode.get("show") + " " + episode.get("what");
    var query2 = episode.get("show") + " " + episode.get("title");

    var resultToMagnet = function(torrent) {
      // TODO: Make this shorter
      return "magnet:?xt=urn:btih:" + torrent.hash + "&tr=udp%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&tr=udp%3A%2F%2Fopen.demonii.com%3A1337";
    };

    // First, search for show and episode number
    // Example: Mythbusters s16e06
    search(query1).then(function(result) {
      resolve(resultToMagnet(result));
    }, function(err) {
      // On no-match, search for show and episode title
      // Example: Mythbusters Unfinished Business
      search(query2).then(function(result) {
        resolve(resultToMagnet(result));
      }, function(err) {
        reject(err);
      })
    });
  });
}