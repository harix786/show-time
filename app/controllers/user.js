import getAndInitNewEpisodes from "../lib/getAndInitNewEpisodes";
import languages from "../lib/languages";

export default Ember.Controller.extend({
  isShowingModal: false,
  isReloading: false,
  isUpdating: false,
  messageTimeout: 7000,
  errorMessage: null,
  successMessage: null,
  messageID: null,
  includeSetting: null,
  excludeSetting: null,
  isReloadingProfile: false,
  indexController: Ember.inject.controller("user.index"),
  languages: function(){
    return languages.keys();
  }.property(),
  defaultLanguage: function(){
    return this.currentUser.defaultLanguage();
  }.property(),
  // Displays flash messages
  flash: function(message, error) {
    var messageID = Math.random();
    var self      = this;
    
    if(error) {
      this.set("errorMessage", message);
      this.set("successMessage", null);
    } else {
      this.set("errorMessage", null);
      this.set("successMessage", message);
    }

    this.set("messageID", messageID);

    // Clear message after {messageTimeout} seconds
    setTimeout(function() {
      var currentMessageID = self.get("messageID");
      // Another message has been used in-between
      if(currentMessageID != messageID) { return; }

      if(error) {
        self.set("errorMessage", null);
      } else {
        self.set("successMessage", null);
      }
    }, this.get("messageTimeout"));
  },
  actions: {
    showSettings: function(data){
      this.set("includeSetting", this.currentUser.get("include"));
      this.set("excludeSetting", this.currentUser.get("exclude"));
      this.toggleProperty("isShowingModal");
    },
    flushAll: function() {
      var okay = confirm("Are you sure you want to remove all episodes?");
      if(!okay) { return false; }

      localforage.clear(function(){
        location.reload();
      });
    },
    saveSettings: function() {
      this.currentUser.set("include", this.get("includeSetting"));
      this.currentUser.set("exclude", this.get("excludeSetting"));
      this.toggleProperty("isShowingModal");
      this.get("indexController").send("reloadAll");
    },
    selectLanguage: function(value) {
      this.currentUser.set("language", value);
    },
    logout: function() {
      var sure = confirm("Are you sure?");
      if(!sure) { return; }
      this.currentUser.logout();
      this.transitionToRoute("login");
    },
    reloadProfile: function(){
      this.set("isReloadingProfile", true);
      var self = this;
      this.currentUser.loadProfile().then(function(){
        self.set("isReloadingProfile", false);
      }, function() {
        self.set("isReloadingProfile", false);
      })
    },
    closeSuccessMessage: function() {
      this.set("successMessage", null);
    },
    closeErrorMessage: function() {
      this.set("errorMessage", null);
    },
    closeAllMessages: function() {
      this.set("successMessage", null);
      this.set("errorMessage", null);
    }
  }
});