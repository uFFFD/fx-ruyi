// ==UserScript==
// @name         Ruyi - xiami
// @namespace    https://github.com/uFFFD/fx-ruyi
// @description  enable media keys on xiami
// @author       uFFFD
// @version      20150418
// @license      GPLv3+
// @match        http://www.xiami.com/play*
// ==/UserScript==

"use strict";

(function(){
  let notifyTitle = undefined;
  let notifyOptions = undefined;
  let player = undefined;

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
    if (player == undefined)
      return;
    switch (e.keyCode) {
      case 0xB0: // next
        player.next();
        break;
      case 0xB1: // previous
        player.prev();
        break;
      case 0xB2: // stop
        player.pause();
        break;
      case 0xB3: // play_pause
        player.playOrPause();
        if (player.Audio.status() == "play")
          notify();
        break;
      default:
        break;
    }
  }, false);

  // http://g.tbcdn.cn/kissy/k/*/seed-min.js
  let htmlentities = {
    '&amp;': '&',
    '&gt;': '>',
    '&lt;': '<',
    '&#x60;': '`',
    '&#x2F;': '/',
    '&quot;': '"',
    '&#x27;': '\''
  };
  let patt = (() => {
    let p = "";
    for (let i in htmlentities)
      p += i + "|";
    p += "&#(\\d{1,5});";
    return RegExp(p, 'g');
  })();
  let unEscapeHtml = s => s.replace(patt, (a, b) => htmlentities[a] || String.fromCharCode(+b));

  let durationStr = secends => `${Math.floor(secends / 60)}:${("0" + secends % 60).slice(-2)}`;

  let onAfterTrackChange = data => {
    let song = JSON.parse(data.newVal);
    console.log(song);
    let options = {
      body: `${unEscapeHtml(song.song)} - ${unEscapeHtml(song.artist)}
[ ${unEscapeHtml(song.album)} ]
${durationStr(song.length)}`,
      icon: song.cover,
      tag: "xiamiplayer",
    };
    notify("虾米 Now Playing...", options);
  };

  let p = new Promise((resolve, reject) => {
    let timer = setInterval(() => {
      if (window.__PLAYER__)
        resolve(window.__PLAYER__);
    }, 1000);
    setTimeout(() => {
      clearInterval(timer);
      resolve(undefined);
    }, 10000);
  });
  p.then(pl => {
    if (pl) {
      player = pl;
      player.PlayerData.on("afterTrackChange", onAfterTrackChange);
    }
    else {
      console.warn("can't find __PLAYER__");
    }
  });
}())
