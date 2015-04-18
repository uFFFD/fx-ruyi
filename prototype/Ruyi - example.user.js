// ==UserScript==
// @name         Ruyi - example
// @namespace    https://github.com/uFFFD/fx-ruyi
// @description  shows how to work with firefox extension "Media Key Support"
// @author       uFFFD
// @version      20150418
// @license      GPLv3+
// @include      *
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
    switch (e.keyCode) {
      case 0xB0:
        console.log("next");
        notify("Ruyi - example", { body: "next" });
        break;
      case 0xB1:
        console.log("previous");
        notify("Ruyi - example", { body: "previous" });
        break;
      case 0xB2:
        console.log("stop");
        notify("Ruyi - example", { body: "stop" });
        break;
      case 0xB3:
        console.log("play_pause");
        notify("Ruyi - example", { body: "play_pause" });
        break;
      default:
        break;
    }
  }, false);
}())
