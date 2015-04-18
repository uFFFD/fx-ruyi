// ==UserScript==
// @name         Ruyi - douban.fm
// @namespace    https://github.com/uFFFD/fx-ruyi
// @description  enable media keys on douban.fm
// @author       uFFFD
// @version      20150418
// @license      GPLv3+
// @match        http://douban.fm/*
// ==/UserScript==

"use strict";

(function(){
  let notifyTitle = undefined;
  let notifyOptions = undefined;
  let dbr = undefined;

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
    if (dbr == undefined)
      return;
    let paused = dbr.is_paused();
    switch (e.keyCode) {
      case 0xB0: // next
        if (paused)
          dbr.act("pause");
        dbr.act("skip");
        break;
      case 0xB2: // stop
        if (!paused)
          dbr.act("pause");
        break;
      case 0xB3: // play_pause
        if (paused)
          notify();
        dbr.act("pause");
        break;
      default:
        break;
    }
  }, false);

  let durationStr = secends => `${Math.floor(secends / 60)}:${("0" + secends % 60).slice(-2)}`;

  let onRadioStart = (a, b) => {
    if (b.song.adtype) { // ad??
      return;
    }
    let song = b.song;
    let options = {
      body: `${song.title} - ${song.artist}
[ ${song.albumtitle} ] ${song.pubtime}
${durationStr(song.len)}`,
      icon: song.picture,
      tag: "doubanfm",
    };
    notify("豆瓣FM Now Playing...", options);
  };

  let p = new Promise((resolve, reject) => {
    let timer = setInterval(() => {
      if (window.DBR)
        resolve(window.DBR);
    }, 1000);
    setTimeout(() => {
      clearInterval(timer);
      resolve(undefined);
    }, 10000);
  });
  p.then(d => {
    if (d) {
      dbr = d;
      window.$(window).bind("radio:start", onRadioStart);
    }
    else {
      console.warn("can't find DBR");
    }
  });
}())
