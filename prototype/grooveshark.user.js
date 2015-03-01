// ==UserScript==
// @name         Ruyi - grooveshark
// @namespace    https://github.com/uFFFD/fx-ruyi
// @description  enable media keys on grooveshark
// @author       uFFFD
// @version      20150301
// @license      GPLv3+
// @match        http://grooveshark.com/*
// @match        http://preview.grooveshark.com/*
// ==/UserScript==

"use strict";

// http://developers.grooveshark.com/docs/js_api/

(function() {
  let notifyTitle = undefined;
  let notifyOptions = undefined;
  let Grooveshark = undefined;

  let notify = (title, options) => {
    if (title == undefined && options == undefined) {
      title = notifyTitle;
      options = notifyOptions;
    }
    else {
      notifyTitle = title;
      notifyOptions = options;
    }
    if (Notification.permission == "granted") {
      let notification = new Notification(title, options);
    }
    else if (Notification.permission != 'denied') {
      Notification.requestPermission(function (perm) {
        if (perm == "granted") {
          let notification = new Notification(title, options);
        }
      });
    }
  };

  document.addEventListener("keyup", e => {
    if (Grooveshark == undefined)
      return;
    if (GS.isBroadcaster() || GS.isBroadcastListener()) // in broadcast mode
      return;
    switch(e.keyCode){
      case 0xB0: // next
        Grooveshark.next();
        break;
      case 0xB1: // previous
        Grooveshark.previous();
        break;
      case 0xB2: // stop
        Grooveshark.pause();
        Grooveshark.seekToPosition(0);
        break;
      case 0xB3: // play_pause
        Grooveshark.togglePlayPause();
        break;
      default:
        break;
    }
  }, false);

  let durationStr = secends => `${Math.floor(secends / 60)}:${("0" + secends % 60).slice(-2)}`;

  let onSongStatusChanged = s => {
    if (s.status == "playing") {
      let song = s.song;
      let options = {
        body: `${song.songName} - ${song.artistName}
[ ${song.albumName} ]
${durationStr(song.calculatedDuration / 1000)}`,
        icon: song.artURL
      };
      notify("Grooveshark Now Playing...", options);
    }
  };

  let p = new Promise((resolve, reject) => {
    let timer = setInterval(() => {
      if (window.Grooveshark) {
        resolve(window.Grooveshark);
      }
    }, 1000);
    setTimeout(() => {
      clearInterval(timer);
      resolve(undefined);
    }, 10000);
  });
  p.then(gs => {
    if (gs) {
      Grooveshark = gs;
      // setSongStatusCallback is broken on preview.grooveshark.com atm
      gs.setSongStatusCallback(onSongStatusChanged);
    }
    else {
      console.warn("can't find Grooveshark");
    }
  });
}())
