// ==UserScript==
// @name         Ruyi - 163 music
// @namespace    https://github.com/uFFFD/fx-ruyi
// @description  enable media keys on 163 music
// @author       uFFFD
// @version      20150418
// @license      GPLv3+
// @match        http://music.163.com/*
// @noframes
// ==/UserScript==

"use strict";

(function(){
  let notifyTitle = undefined;
  let notifyOptions = undefined;

  let notify = (title, options) => {
    if (title == undefined && options == undefined) {
      if (notifyTitle == undefined && notifyOptions == undefined)
        return;
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
    let keyCode = 0;
    let ctrl = false;
    switch (e.keyCode) {
      case 0xB0: // next
        keyCode = 39; // right
        ctrl = true;
        break;
      case 0xB1: // previous
        keyCode = 37; // left
        ctrl = true;
        break;
      case 0xB2: // stop
        if (document.querySelector("#g_player .ply.pas"))
          keyCode = 80; // p key
        break;
      case 0xB3: // play_pause
        keyCode = 80; // p key
        if (!document.querySelector("#g_player .ply.pas"))
          notify();
        break;
      default:
        break;
    }
    if (keyCode) {
      let evt = document.createEvent("KeyboardEvent");
      evt.initKeyEvent("keyup", // The type of event.
                       true, // bubbles
                       true, //  cancelable
                       window, // viewArg
                       ctrl, // ctrlKeyArg
                       false, // altKeyArg
                       false, // shiftKeyArg
                       false, // metaKeyArg
                       keyCode, // keyCodeArg
                       0  // charCodeArg
                      );
      document.dispatchEvent(evt);
    }
  }, false);

  let durationStr = secends => `${Math.floor(secends / 60)}:${("0" + secends % 60).slice(-2)}`;

  let onPlayChange = e => {
    let queue;
    let setting;
    try {
      queue = JSON.parse(localStorage["track-queue"]);
      setting = JSON.parse(localStorage["player-setting"]);
    }
    catch (err) {
      return;
    }
    let index = setting.index;
    if (queue.length < index)
      return;
    let song = queue[index];
    if (song.id != e.trackId) // will it ?
      return;
    let options = {
      body: `${song.name} - ${song.artists.map(el => el.name).join(", ")}
[ ${song.album.name} ] ${new Date(song.album.publishTime).toLocaleDateString()}
${durationStr(song.duration / 1000)}`,
      icon: song.album.picUrl,
      tag: "163.music",
    }
    notify("网易云音乐 Now Playing...", options);
  };

  let p = new Promise((resolve, reject) => {
    let timer = setInterval(() => {
      if (window.NEJ && window.NEJ.P("nej.v"))
        resolve(window.NEJ.P("nej.v"));
    }, 1000);
    setTimeout(() => {
      clearInterval(timer);
      resolve(undefined);
    }, 10000);
  });
  p.then(g => {
    if (g) {
      g.bs(window, "playchange", onPlayChange);
    }
    else {
      console.warn("can't find NEJ");
    }
  });
}())
