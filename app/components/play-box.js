var wjs = nRequire("wcjs-player");
var peerflix = nRequire("peerflix");
import downloadSubtitle from "../lib/downloadSubtitle";
import toHHMMSS from "../lib/toHHMMSS";

export default Ember.Component.extend({
  classNames: ["player-box"],
  loaded: 0,
  defaultLanguageKey: function(){
    return this.currentUser.defaultLanguageKey();
  },
  defaultLanguage: function(){
    return this.currentUser.defaultLanguage();
  },
  didInsertElement: function() {
    var self = this;
    var title = this.get("episode").get("magnetTitle");
    var engine = peerflix(this.get("episode").get("magnet"));

    engine.server.on("listening", function() {
      self.set("url", "http://localhost:" + 
        engine.server.address().port + 
        "/"
      );
      self.isLoaded();
    });

    // Load default subtitle language from settings
    var langKey = this.defaultLanguageKey();
    if(langKey){
      downloadSubtitle(title, langKey).then(function(path){
        self.set("subtitle", path);
        self.isLoaded();
      }).catch(function(err){
        self.isLoaded();
      });
    } else {
      self.isLoaded();
    }
  },
  isLoaded: function(){
    this.incrementProperty("loaded");
    if(this.get("loaded") == 2) {
      this.everytingIsLoaded();
    }
  },
  everytingIsLoaded: function(){
    var language  = this.currentUser.defaultLanguage();
    var self      = this;
    var url       = this.get("url");
    var subtitle  = this.get("subtitle");
    var subtitles = {};
    var seenInMs  = this.get("episode").get("seenInMs") || 0;
    var player    = new wjs("#player").addPlayer({ autoplay: true });

    if(subtitle) {
      subtitles[language] = subtitle;
    }

    player.addPlaylist({
      url: url,
      subtitles: subtitles,
      title: this.get("episode").get("shortTitle")
    });
    player.ui(true);
    player.video(true);
    player.volume(0);
    player.playlist(false);
    player.time(seenInMs);
    player.subTrack(0);
    player.subTrack(1);

    if(seenInMs) {
      player.notify(`Starting at ${toHHMMSS(seenInMs / 1000)}`);
    }

    this.sendAction("videoTime", player.time());

    var currentTime = 0;
    player.onTime(function(time){
      currentTime = time;
    });

    var interval = setInterval(function(){
      self.sendAction("time", currentTime);
    }, 10000);

    player.onState(function(state){
      if(state === "ended") {
        console.info("=======> has ended")
        self.sendAction("videoTime", currentTime);
        self.sendAction("time", currentTime);
        self.sendAction("close");
      }

      console.info("state", state);

      if(state === "buffering") {
        self.onFirstFrame();
      }
    });
  
    this.set("player", player);
    this.set("interval", interval);

    $(document).on("keyup", { _self: this }, this.onESC);
  },
  onESC: function(e){
    console.info(e.keyCode);
    if(e.keyCode === 27) {
      e.data._self.sendAction("close");
    }
  },
  willDestroyElement: function(){
    var player = this.get("player");
    if(player) { 
      try {
        // Crashes for some reason if the application
        // is aborted before buffering is done
        player.stop();
      } catch(e){
        console.info("player error", e);
      }
    }

    var engine = this.get("engine");
    if(engine) { engine.destroy(); }

    var interval = this.get("interval");
    if(interval) { clearInterval(interval); }

    $(document).off("keyup", this.onESC);
  },
  onFirstFrame: function(){
    var $close = this.$().find("#close");
    var $toolbar = this.$().find(".wcp-toolbar");
    var self = this;

    $close.click(function(){
      self.sendAction("close");
    });

    new MutationObserver(function(mutations,b){
      if($toolbar.is(":visible")) {
        $close.removeClass("hide");
      } else {
        $close.addClass("hide");
      }
    }).observe($toolbar.get(0), {
      attributes: true,
      subtree: false
    });
  }
})