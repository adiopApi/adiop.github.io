// VERSION 1.2.1
importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.1.0/workbox-sw.js');
//   self.importScripts('adiop.api.events.js');
//   self.importScripts('adiop.news.sw.js');
const __ = {};
//   self.importScripts('epoxy.js');
//   self.importScripts('wispTlsClient.js');
self.sockets = [];
// __.wispServerUrl = "wss://localhost:9010/";
__.wispServerUrl = "wss://wisp.mercurywork.shop/";
const adiop_windows_endpoint_sha = "949c402f04a0d6bca33d4d681c9781b8957f7ae1488c3775f7df2c402e086d1c";
const nativeWebSocket = self.WebSocket;
self.WebSocket = function(...args){
  const socket = new nativeWebSocket(...args);
  socket.addEventListener('close',(e) => {
    ___(`..SW Socket ${socket._index} closed!`)
  });
  socket._index = self.sockets.length;
  self.sockets.push(socket);
  ___('self.sockets:', self.sockets.length)
  return socket;
};
__.clockToDate = (clock, a = {}) => {
  //clock = '06:56:00'
  let [hours, minute, seconds = '00'] = clock.split(':').map(i => Number(i));
  const date = new Date();
  // Set the hours, minutes, and seconds
  date.setHours(hours);
  date.setMinutes(minute);
  date.setSeconds(seconds);
  return date;
};
async function sha256(input){
  // (async()=>{let a = await sha256('.....'); ___(a);})();
  const utf8 = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", utf8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((bytes) => bytes.toString(16).padStart(2, "0")).join("");
  return hashHex;
}
function getTargetSevenAM(clock='07:00:00') {
  //clock = '06:56:00'
  let [hours, minute, seconds = '00'] = clock.split(':').map(i => Number(i));
  const now = new Date();
  const targetTime = new Date(now); // Start with today's date and time

  targetTime.setHours(hours, minute, seconds, 0); // Set the time to 7 hours, 0 minutes, 0 seconds, 0 milliseconds

  // If the current time is past 7 AM today, set the target to 7 AM tomorrow
  if (now.getTime() > targetTime.getTime()) {
    targetTime.setDate(targetTime.getDate() + 1); // Add one day
  }

  return targetTime;
}
function __timeago(timestamp,o){
    o=o||{};
      let settings= {
        allowPast: true,
        allowFuture: true,
        prefixAgo: null,
        prefixFromNow: null,
        suffixAgo: "ago",// ago
        suffixFromNow: "ahead",
        inPast: 'any moment now',
        seconds: "just now",
        minute: "a minute",
        minutes: "%d minutes",
        hour: "an hour",
        hours: "%d hours",
        day: "a day",
        days: "%d days",
        month: "a month",
        months: "%d months",
        year: "a year",
        years: "%d years",
        wordSeparator: " ",
        numbers: []
      };
    // OVER-WRITE SETTIBGS OPTIONS
    Object.keys(settings).map(k=>{ if(o.hasOwnProperty(k)) settings[k] = o[k]; });
      var parse= function(iso8601) {
        var s = iso8601.trim();
        s = s.replace(/\.\d+/,""); // remove milliseconds
        s = s.replace(/-/,"/").replace(/-/,"/");
        s = s.replace(/T/," ").replace(/Z/," UTC");
        s = s.replace(/([\+\-]\d\d)\:?(\d\d)/," $1$2"); // -04:00 -> -0400
        s = s.replace(/([\+\-]\d\d)$/," $100"); // +09 -> +0900
        return new Date(s);
      };
      function distance(date) {
        return (new Date().getTime() - date.getTime());
      }
      var inWords= function(distanceMillis) {
        if(!(distanceMillis instanceof Date)) return '';
        if (!settings.allowPast && ! settings.allowFuture) {
          throw 'timeago allowPast and allowFuture settings can not both be set to false.';
        }
        ///
        distanceMillis = distance(distanceMillis);
        var $l = settings;
        var prefix = $l.prefixAgo;
        var suffix = $l.suffixAgo;
        if (settings.allowFuture) {
          if (distanceMillis < 0) {
            prefix = $l.prefixFromNow;
            suffix = $l.suffixFromNow;
          }
        }

        if (!settings.allowPast && distanceMillis >= 0) {
          return settings.inPast;
        }

        var seconds = Math.abs(distanceMillis) / 1000;
        var minutes = seconds / 60;
        var hours = minutes / 60;
        var days = hours / 24;
        var years = days / 365;

        function substitute(stringOrFunction, number) {
          var string = stringOrFunction instanceof Function ? stringOrFunction(number, distanceMillis) : stringOrFunction;
          var value = ($l.numbers && $l.numbers[number]) || number;
          return string.replace(/%d/i, value);
        };
 
        var words = seconds < 45 && substitute($l.seconds, Math.round(seconds)) ||
            seconds < 90 && substitute($l.minute, 1) ||
            minutes < 45 && substitute($l.minutes, Math.round(minutes)) ||
            minutes < 90 && substitute($l.hour, 1) ||
            hours < 24 && substitute($l.hours, Math.round(hours)) ||
            hours < 42 && substitute($l.day, 1) ||
            days < 30 && substitute($l.days, Math.round(days)) ||
            days < 45 && substitute($l.month, 1) ||
            days < 365 && substitute($l.months, Math.round(days / 30)) ||
            years < 1.5 && substitute($l.year, 1) ||
            substitute($l.years, Math.round(years));

        var separator = $l.wordSeparator || "";
        if ($l.wordSeparator === undefined) { separator = " "; }
        return ([prefix, words, suffix].join(separator)).trim();
      };
      //   return inWords(distance(_date));
      if (timestamp instanceof Date) {
        return inWords(timestamp);
      } 
      else if (typeof timestamp === "string") {
        return inWords(Date.parse(timestamp));
      } 
      else if (typeof timestamp === "number") {
        return inWords(new Date(timestamp));
      } 
      else {
        return '';//inWords($.timeago.datetime(timestamp));
      }
    }
function __echo(ev,detail){
      detail = detail||{init:true};
      var _event = new CustomEvent(ev, {
        detail: detail
      });
      self.dispatchEvent(_event);
    }
function __on(ev,func){
      self.addEventListener(ev,function(e){
        if(func && func.constructor === Function) func(e);
       try{ self.removeEventListener(ev,func); }catch(_){console.log(_)}
      });
    }
function __isDataProperty(name,value){
  return new Promise((resolve, reject) => {
    let set = [];
    self.registration.getNotifications()
        .then(notifications => {
          // LOOP THROUGH ALL NOTIFICATIONS
          for(let i = 0; i < notifications.length; i++) {
            // FIND THE ONE THAT IS SET TO EXPIRE
            if (notifications[i].data &&
                notifications[i].data.hasOwnProperty(name)) {
              if(value && notifications[i].data[name] === value) set.push(notifications[i]);
              else if(!value) set.push(notifications[i]);
            }
          }
      return resolve(set);
        }).catch(error=>{reject(error)});
      });
}
function __autoExpireNotification(notification,callback){
  if(notification){
    // GET EXPIRATION TIME
    let delay = notification.data.expire - (new Date()).getTime();
    delay = delay < 0 ? 0 : delay;
    // THEN REMOVE IT WHEN IT EXPIRES
    self.timeouts = setTimeout(()=>{
        delete self.timeouts;
//       console.log(notification);
      notification.expired = true;
      __closeNotification(notification);
      console.log('Notification Expired!');
      callback && callback(true);
    },delay);
  }
}
function __reminder(notification,callback){
  if(notification){
    let lapsInseconds = 5;
    let laps = notification.data.remindEvery;
    if(laps[1]=='s')lapsInseconds = laps[0];
    if(laps[1]=='m')lapsInseconds = laps[0] * 60;
    if(laps[1]=='h')lapsInseconds = laps[0] * 60 * 60;
    let totalLaps = 10;
//     let totalTime = lapsInseconds*(totalLaps+1);
    let count = 1;
    // GET EXPIRATION TIME
//     let expiration = (new Date( (new Date).getTime() + 1000 * totalTime )).getTime();
//     let delay = expiration - (new Date()).getTime();
    let DeadLine = notification.data.reminder;
    let prefix = notification.data.prefix||'';
    let max = notification.data.max;
    let delay = DeadLine - (new Date()).getTime();
    delay = delay < 0 ? 0 : delay;
    let startTime = delay-(max*lapsInseconds);
    let tickets = [];
    let trash = [];
    for (var i = 0, l = max; i < l; i++) {
      let timeToPost = DeadLine - ((i+1)*lapsInseconds*1000);
      tickets.push(timeToPost);
    }
    let stopme = (e)=>{
      console.log('notification_terninated event is on..');
      if(e&&e.detail&&e.detail.notification == notification && e.detail.notification.data && e.detail.notification.data.reminder){
        console.log('Stopped..');
        clearInterval(self.timeinterval);
        clearTimeout(self.timeouts);
        self.timeinterval = undefined;
        self.timeouts = undefined;
        callback && callback(true);
//         self.removeEventListener('notification_terninated',stopme);
        stopme = undefined;
      
    };
    }
//     __on('notification_terninated',stopme);
    // THEN REMOVE IT WHEN IT EXPIRES
    self.timeouts = setTimeout(()=>{
      console.log('Notification Expired!');
        clearInterval(self.timeinterval);
        clearTimeout(self.timeouts);
        delete self.timeinterval;
        delete self.timeouts;
//       console.log(notification);
      __closeNotification(notification);
      callback && callback(true);
    },delay);
    //
    self.timeinterval = setInterval(function(){
      tickets.forEach((time,i)=>{
//       console.log('time: '+(time - (new Date()).getTime()));
        if(!trash[i] && time <= (new Date()).getTime() ){
          trash[i] = true;
      let _timeLeft = __timeago(new Date(DeadLine),{suffixFromNow: "left"});
          let title = prefix+_timeLeft;
      self.registration.showNotification(title, notification);
      console.log('> '+title);
        }
      });
        
//       let _timeLeft = __timeago(new Date(DeadLine),{suffixFromNow: "left"});
//       self.registration.showNotification(_timeLeft, notification);
// //       count++;
//       console.log('Notification: '+_timeLeft);
  },1000 * lapsInseconds);
//   },1000);
//      setTimeout(__closeNotification(notification,false,false,true),1000*60*5);
  }
}
function __alarmNotification(notification,callback){
  if(notification){
    let lapsInseconds = 5;
    let totalLaps = 10;
    let totalTime = lapsInseconds*(totalLaps+1);
    let count = 1;
    // GET EXPIRATION TIME
    let expiration = (new Date( (new Date).getTime() + 1000 * totalTime )).getTime();
    let delay = expiration - (new Date()).getTime();
    delay = delay < 0 ? 0 : delay;
    let stopme = (e)=>{
      console.log('notification_terninated event is on..');
      if(e.detail.notification = notification && e.detail.notification.data && e.detail.notification.data.alarm){
        console.log('Stopped..');
        clearInterval(self.timeinterval);
        clearTimeout(self.timeouts);
        self.timeinterval = undefined;
        self.timeouts = undefined;
        callback && callback(true);
//         self.removeEventListener('notification_terninated',stopme);
        stopme = undefined;
      
    };
    }
//     __on('notification_terninated',stopme);
    // THEN REMOVE IT WHEN IT EXPIRES
    self.timeouts = setTimeout(()=>{
        clearInterval(self.timeinterval);
        clearTimeout(self.timeouts);
        delete self.timeinterval;
        delete self.timeouts;
//       console.log(notification);
      __closeNotification(notification);
      console.log('Notification Expired!');
      callback && callback(true);
    },delay);
    //
    self.timeinterval = setInterval(function(){
      if(count > (totalLaps-1)){
      console.log('Maximum Reached!');
        clearInterval(self.timeinterval);
        clearTimeout(self.timeouts);
        delete self.timeinterval;
        delete self.timeouts;
      __closeNotification(notification);
      callback && callback(true);
        return;
      }
      self.registration.showNotification(notification.title, notification);
      count++;
      console.log('Notification #'+count);
  },1000 * lapsInseconds);
  }
}
function __closeNotification(notification,opened,closed,noEcho){
  console.log('Notification Closing..');
  var _onExitUrl = notification.data && notification.data.onExitUrl;
  if(!closed) notification.close();
  if(!opened&&closed) console.log('Notification Cleared!');
  else if(!opened&&!closed) console.log('Notification Dismissed!');
  else if(opened) console.log('Notification Visited!');
  if(!noEcho) __echo('notification_terninated',{notification:notification});
  if(_onExitUrl && !notification.expired){ fetch(_onExitUrl, {mode: 'no-cors'}); }
}
function __openWindow(e,notification,url){
    let found = false;
  if(url){
        e.waitUntil(
          clients.matchAll().then(function(clis) {
            for (let i = 0; i < clis.length; i++) {
              if (clis[i].url === url) {
                // We already have a window to use, focus it.
                found = true;
                clis[i].focus();
                __closeNotification(notification,true);
                break;
              }
            }
            if (!found){
            var client = clis.find(function(c) {
              return c.visibilityState === 'visible';
            });
            if (client !== undefined) {
              client.navigate(url);
              client.focus();
//               notification.close();
              __closeNotification(notification,true);
            } 
            else {
              // there are no visible windows. Open one.
              clients.openWindow(url);
              __closeNotification(notification,true);
            }
            }
          })
        );
      return;
      }
}
function __openUrl(e,url){
    let found = false;
  if(url){
    let host = (url+' ').match(/[a-z_0-9\.\-]{1,}\.[^(\d|\W|-|_)]{2,14}/)[0].replace(/www\./,'');
        e.waitUntil(
          clients.matchAll().then(function(clis) {
            for (let i = 0; i < clis.length; i++) {
              if (Boolean(clis[i].url.match(new RegExp(host.replace(/(?=[.?*+^$[\]\\(){}-])/g, "\\"),'i')))) {
//               if (clis[i].url === url) {
                // We already have a window to use, focus it.
                found = true;
                console.log('found: '+clis[i].url);
//                 clis[i].navigate(url);
                clis[i].focus();
                break;
              }
            }
            if (!found){
               console.log('not found..');
              // there are no visible windows. Open one.
//               clients.openWindow(url);
            }
          })
        );
      return;
      }
}
function __getEndpoint(){
  return new Promise((resolve, reject) => {
    // Get the push subscription
    self.registration.pushManager.getSubscription()
      .then(function(subscription) {
      if (subscription) {
        // Access the endpoint
        const endpoint = subscription.endpoint;
        //console.log('Push subscription endpoint:', endpoint);
        resolve(endpoint);
        // Use the endpoint as needed, for example, to sync with your server
        // syncSubscriptionWithServer(subscription);
      } else {
        console.log('No active push subscription found.');
        reject('No active push subscription found.')
      }
    })
      .catch(function(err) {
      console.error('Error getting push subscription:', err);
      reject(err)
    });
  });
}
function __clock(){
  ___('clock started..')
  try {
    let run = function(){
      if(self.every_15_minutes && self.every_15_minutes < Date.now()){
        // TRIGGER EVERY 15 MINUTES EVENT
        ____('15 minutes break!')
        // RESET TIMER
        self.every_15_minutes = Date.now() + 5*(60*1000);
      }
/*       if(self.news_update_time && self.news_update_time < Date.now()){
        // TRIGGER EVERY 15 MINUTES EVENT
        ____('news_update_time!')
        // RESET TIMER FOR NEXT DAY
//         self.news_update_time = (new Date(now.getFullYear(), now.getMonth(), now.getDate()+1, now.getHours(), now.getMinutes(), now.getSeconds())).getTime();
        self.news_update_time = getTargetSevenAM('07:00:00').getTime();
        (async()=>{
          const endpoint = await __getEndpoint();
          const endppoint_sha = await sha256(endpoint);
          if(endppoint_sha==adiop_windows_endpoint_sha){
            let res = await ADIOP_NEWS_UPDATER({
              task:'batchLoad_2',
              notify:true
            });
            ___(res)
          }
        })()
      } */
      if(self.news_update_evening_time && self.news_update_evening_time < Date.now()){
        // TRIGGER EVENT
        ____('It\'s New Update Evening Time!')
        // RESET TIMER FOR NEXT DAY
        self.news_update_evening_time = getTargetSevenAM('19:00:00').getTime();
        (async()=>{
          const endpoint = await __getEndpoint();
          const endppoint_sha = await sha256(endpoint);
          if(endppoint_sha==adiop_windows_endpoint_sha){
            let res = await ADIOP_NEWS_UPDATER({
              task:'batchLoad_2',
              notify:true
            });
            ___(res)
          }
        })()
      }
    };
    run();
    setInterval(function(){
      run();
    },1000);
  } catch (error) {}
}
// http://craig-russell.co.uk/2016/01/29/service-worker-messaging.html#.XQdAJG9KhsZ
// send_message_to_sw("Hello").then(m => console.log(m));
// Set up channel with same name as in app.js
// let count = 0;
// BROADCAST WORKS FROM CONTEXTS FROM THE SAME HOST ON SAME BOWSER OS. EX: IFRAME, TABS ETC..
const broadcast = new BroadcastChannel('adiop');
broadcast.onmessage = (event) => {
//   if (event.data && event.data.type === 'INCREASE_COUNT') {
//     broadcast.postMessage({ payload: ++count });
//   }
  console.log("Broadcast Received Message: " + JSON.stringify(event.data));
//   self.registration.showNotification(event.data.message.title, event.data.message)
};
  self.addEventListener('message', async(e) => {
    // LOCAL COMMUNICATION
    // https://felixgerschau.com/how-to-communicate-with-service-workers/
  // navigator.serviceWorker.controller.postMessage({url:'https://photo.app.adiop.com/?q=WVD1K'});
    if(e.data && e.data.findNotif){
      let tkn = e.data.token;
      // FIND NOTIFICATION WITH TOKEN
      __isDataProperty(tkn).then(notifications=>{
        if(!notifications||!notifications.length) return;
        if(notifications){

          console.log('notifications found!',notifications);
          // Select who we want to respond to
          self.clients.matchAll({
            includeUncontrolled: true,
            type: 'window',
          }).then((clients) => {
            if (clients && clients.length) {
              // Send a response - the clients
              // array is ordered by last focused
              clients[0].postMessage({
                type:'notif',
                msg: "notifications found!",
              });
            }
          });
        }
        else{
          // Select who we want to respond to
          self.clients.matchAll({
            includeUncontrolled: true,
            type: 'window',
          }).then((clients) => {
            if (clients && clients.length) {
              // Send a response - the clients
              // array is ordered by last focused
              clients[0].postMessage({
                type:'notif',
                msg: "nothing found!",
                error:true
              });
            }
          });

        }
      })
        .catch(r=>{

      });
      return;
    }
    if(e.data && e.data.notification){
      //   console.log("..SW Received Message: " + JSON.stringify(e.data));
/*       navigator.serviceWorker.controller.postMessage({notification:{
    title: 'Adiop News update was successful!',
      options: {
      title: 'Adiop News update was successful!',
      body: 'We are happy to have you on board.',
      tag: 'tag_'+Math.random().toString(36).substring(2, 15),
      icon: 'https://adiop.com/adiop_icon_final_256.png',
      badge: 'https://adiop.com/adiop_icon_final_badge_96.png'
    }
    }}); */
      //     return;
      let data = e.data.notification;
      if (data.options.data && data.options.data.alarm && data.options.data.schedule){
        console.log('skeduled time!');
        let expiration = data.options.data.schedule;
        let delay = expiration - (new Date()).getTime();
        delay = delay < 0 ? 0 : delay;
        self.timeouts = setTimeout(()=>{
          clearTimeout(self.timeouts);
          delete self.timeouts;
          //       console.log(notification);
          const __notification = self.registration.showNotification(data.title, data.options)
          .then(()=>{
            // FIND NOTIFICATION WITH RENOTIFY INTERVAL
            __isDataProperty('schedule',expiration).then(notifications=>{
              if(!notifications||!notifications.length) return;
              console.log('set alarm!');
              // SET TO EXPIRE
              notifications.forEach(notification=>{
                __alarmNotification(notification);
              });
            });
          }).catch(error=>{console.log(error)});
          //           e.waitUntil(
          __notification
          //           );
        },delay);
      }
      else if (data.options.data && data.options.data.reminder){
        let tkn = data.options.data.token||'_'+Math.round(100000 * Math.random());
        data.options.data[tkn] = true;
        const __notification = self.registration.showNotification(data.title, data.options)
        .then(()=>{
          // FIND NOTIFICATION WITH REMINDER
          __isDataProperty(tkn).then(notifications=>{
            if(!notifications||!notifications.length) return;
            console.log('Testing reminder!');
            // SET TO EXPIRE
            notifications.forEach(notification=>{
              __reminder(notification);
            });
          });
        }).catch(error=>{console.log(error)});
        e.waitUntil(
          __notification
        );
      }
      else{
        //     const __notification = self.registration.showNotification(e.data.notification.title, e.data.notification.options).then(()=>{});
        const __notification = self.registration.showNotification(data.title, data.options).then(()=>{
          // FIND NOTIFICATION WITH EXPIRE DATA
          __isDataProperty('expire').then(notifications=>{
            if(!notifications||!notifications.length) return;
            // SET TO EXPIRE
            notifications.forEach(notification=>{
              __autoExpireNotification(notification);
            });
          });
          // FIND NOTIFICATION WITH ALARM RENOTIFY INTERVAL
          __isDataProperty('alarm').then(notifications=>{
            if(!notifications||!notifications.length) return;
            console.log('Testing alarm!');
            // SET TO EXPIRE
            notifications.forEach(notification=>{
              __alarmNotification(notification);
            });
          });
          // FIND NOTIFICATION WITH REMINDER
          __isDataProperty('reminder').then(notifications=>{
            if(!notifications||!notifications.length) return;
            console.log('Testing reminder!');
            // SET TO EXPIRE
            notifications.forEach(notification=>{
              __reminder(notification);
            });
          });
        }).catch(error=>{console.log(error)});
        e.waitUntil(
          __notification
        );
      }
      return;
    }
    if(e.data && e.data.newsUpdateRequest){
      let res = await ADIOP_NEWS_UPDATER({
        channel:e.data.channel,
        clients:e.data.clients,
        testing:e.data.testing,
        task:e.data.task||'reload',
        url:e.data.url,
        verbose:e.data.verbose,
        notify:e.data.notify
      });
      return ___(res)
    }
    if(e.data && e.data.url){
      return __openUrl(e,e.data.url);
    }
    if(e.data && e.data.test){
//       navigator.serviceWorker.controller.postMessage({test:'Function'});
      return console.log(`Service Worker Typeof ${e.data.test}: ${typeof self[(e.data.test)]}`);
    }
    if(e.data && e.data.type == 'getNewsFeeds'){
//       ___('getNewsFeeds')
      const N = new ADIOP_NEWS();
      let feeds = await N.getAllFeeds();
//       ___(feeds)
      // ToDo: Detect the target cient using some type of fingerprint
      // Select who we want to respond to
      self.clients.matchAll({
        includeUncontrolled: true,
        type: 'window',
      }).then((clients) => {
//         ___('clients.length:',clients.length)
        if (clients && clients.length) {
          // Send a response - the clients
          clients.forEach(client=>{
          // array is ordered by last focused
          client.postMessage({
            type:e.data.type,
            token:e.data.token,
            data: feeds,
          });
          });
        }
      });
      
      return
    }
    if(e.data && e.data.selfUpdateRequest){
      // navigator.serviceWorker.controller.postMessage({selfUpdateRequest:true});
      // ONLY APPLIES IF THIS FILE (sw.js) IS ALTERED
      try{
        self.registration.update();
//         "serviceWorker" in navigator&&navigator.serviceWorker.register("./sw.js",{scope:"."}).then(function(registration){},function(){});
      }
      catch(_){___(_)}
    }
    // EXPERIMENT WITH BROADCAST AS IT ONLY WORKS LOCALLY
  if(e.data && e.data.type == 'broadcast'){
    if(broadcast) broadcast.postMessage({ message: e.data.message });
//    return;
  }
    if (e.data && e.data.type == 'alert') {
      // Select who we want to respond to
      self.clients.matchAll({
        includeUncontrolled: true,
        type: 'window',
      }).then((clients) => {
        if (clients && clients.length) {
          // Send a response - the clients
          clients.forEach(client=>{
          // array is ordered by last focused
          client.postMessage({
            type:'alert',
            msg: e.data.msg,
          });
          });
        }
      });
  }
    if(e.data&&e.data.action=='skipWaiting'){
      self.skipWaiting();
    }
    if(e.data && e.data.libcurlBlobUrl){
      //self.libcurlBlobUrl = e.data.libcurlBlobUrl;
      if(typeof self.libcurl === 'undefined') loadCachedScript();
      else console.log(`Cached Worker loaded libcurl.js ${libcurl.version.lib}`);
//       self.registration.update();
      return;
    }
  console.log("SW Received Message: " + JSON.stringify(e.data));
//   e.ports&&e.ports[0].postMessage("SW Says 'Hello back!'");
});
__on('notification_terninated',(e)=>{
//   console.log('notification_terninated event is on..');
  if(e.detail.notification && e.detail.notification.data && (e.detail.notification.data.alarm||e.detail.notification.data.dismissable)){
    console.log('Stopped..');
    clearInterval(self.timeinterval);
    clearTimeout(self.timeouts);
    delete self.timeinterval;
    delete self.timeouts;
//     // Clear the badge
//     navigator.clearAppBadge().catch((error) => {
//       // Do something with the error.
//     });
  };
});
  __on('notificationclose', function(e) {
        clearInterval(self.timeinterval);
//         clearTimeout(self.timeouts);
        delete self.timeinterval;
//         delete self.timeouts;
    var notification = e.notification;
    __closeNotification(notification,false,true);
  });
  __on('notificationclick', function(e) {
    var notification = e.notification;
    var url = notification.data && notification.data.url;
    var action = e.action;
        clearInterval(self.timeinterval);
//         clearTimeout(self.timeouts);
        delete self.timeinterval;
//         delete self.timeouts;
    if(action){
      if (action === 'close') {
        __closeNotification(notification);
        return;
      } 
      else if(url){
        __openWindow(e,notification,url);
        return;
      }
    }
    else if(url){
      __openWindow(e,notification,url);
      return;
    }
    __closeNotification(notification);
  });
  __on('push', async function(e) {
    // DEVICE COMMUNICATION
      console.log("Received push event: ", e.data);
    if(!e.data) return 'Error: No Push Event Data Found: '+JSON.stringify(e.data);
    let data={};
    try{ data = e.data.json(); }catch(er){}
    if (data.method === "notification") {
      if (data.options.data && data.options.data.alarm && data.options.data.schedule){
        console.log('skeduled time!');
        let expiration = data.options.data.schedule;
        let delay = expiration - (new Date()).getTime();
        delay = delay < 0 ? 0 : delay;
        self.timeouts = setTimeout(()=>{
          clearTimeout(self.timeouts);
          delete self.timeouts;
          //       console.log(notification);
          const __notification = self.registration.showNotification(data.title, data.options)
          .then(()=>{
            // FIND NOTIFICATION WITH RENOTIFY INTERVAL
            __isDataProperty('schedule',expiration).then(notifications=>{
              console.log('set alarm!');
              // SET TO EXPIRE
              notifications.forEach(notification=>{
                __alarmNotification(notification);
              });
            });
          }).catch(error=>{console.log(error)});
//           e.waitUntil(
            __notification
//           );
        },delay);
      }
      else if (data.options.data && data.options.data.reminder){
        let tkn = '_'+Math.round(100000 * Math.random());
        data.options.data[tkn] = true;
        const __notification = self.registration.showNotification('Reminder is activated!', data.options)
          .then(()=>{
             // FIND NOTIFICATION WITH REMINDER
            __isDataProperty(tkn).then(notifications=>{
              console.log('Testing reminder!');
              // SET TO EXPIRE
              notifications.forEach(notification=>{
                __reminder(notification);
              });
            });
          }).catch(error=>{console.log(error)});
          e.waitUntil(
            __notification
          );
      }
      else{
        
      const __notification = self.registration.showNotification(data.title, data.options).then(()=>{
        // FIND NOTIFICATION WITH EXPIRE DATA
        __isDataProperty('expire').then(notifications=>{
          if(!notifications||!notifications.length) return;
            // SET TO EXPIRE
          notifications.forEach(notification=>{
            __autoExpireNotification(notification);
          });
        });
        // FIND NOTIFICATION WITH ALARM RENOTIFY INTERVAL
        __isDataProperty('alarm').then(notifications=>{
          if(!notifications||!notifications.length) return;
      console.log('Testing alarm!');
            // SET TO EXPIRE
          notifications.forEach(notification=>{
            __alarmNotification(notification);
          });
        });
        // FIND NOTIFICATION WITH REMINDER
        __isDataProperty('reminder').then(notifications=>{
          if(!notifications||!notifications.length) return;
          console.log('Testing reminder!');
          // SET TO EXPIRE
          notifications.forEach(notification=>{
            __reminder(notification);
          });
        });
      }).catch(error=>{console.log(error)});
        //
      e.waitUntil(
        __notification
      );
      }
    } 
    else if (data.method === "news_update"){
//       return ___(data)
      return ADIOP_NEWS_UPDATER({
        channel:data.options.channel,
        clients:data.options.clients,
        testing:data.options.testing,
        task:data.options.task||'reload',
        url:data.options.url,
        verbose:data.options.verbose,
        notify:data.options.notify
      }).then(res=>{
        ___(res)
      });
    }
    else if (data.method === "push_message___"){
      if(data.options.getPlatform___){
        const API_URL = `https://script.google.com/macros/s/AKfycbzk61dQGtLMgAoxWqHPfeRHHhJS8lxZs2JFhwpH1i5RQFKpm5-nl-Uy9JFaDN9KkqqKsg/exec`;
        const endpoint = 'https://fcm.googleapis.com/fcm/send/cJyRUi7l3ks:APA91bHgIoQJQ8TaaD23WtEyBNki_eYG8aPwnnCMpwPn1WRVPeeKjNeOwIp_WRlKnAd0VPsoAP9sKg5bGLQLWvvVfPhSpn4yabkkYXZWVvQw4Vcs2GtPz18fjZ0CUkdPeX41UKP5fdB7';
//         let msg = `${API_URL}?vpk=true`
        const response = await fetch(API_URL, {
          method: 'POST',
          headers:{
            "Content-Type": "text/plain;charset=utf-8",// IMPORTANT!
          },
          body:JSON.stringify({
            notify:{
              task:'push',
              method:'push_message',
              endpoint:endpoint,
              notificationMessage:{
                platform: navigator.platform
              }
            }
          })
        }).catch(e=>{
          ___(e);
        });
      }
      else{
      console.log("Received Push-Message: ", data, e);
        return
      }
    }
    else {
      console.log("Received Push with unknown method: ", data, e);
    }
  });
/////

async function loadEpoxy(){
  // https://github.com/MercuryWorkshop
  // https://github.com/MercuryWorkshop/rustls-wasm/blob/master/index.html
  // https://developer.puter.com/blog/unrestricted-browser-networking-raw-tcp-sockets-modern-tls-and-cors-free-http/
//   import epoxyInit, { EpoxyClient, EpoxyClientOptions, info as epoxyInfo } from "@mercuryworkshop/epoxy-tls/minimal-epoxy";
// import { settings } from "./store";
// import { WebSocketStream } from "./loggingws";
const { EpoxyClient, EpoxyClientOptions, epoxyInfo, epoxyInit, WebSocketStream } = EpoxyTLS;
let epoxyVersion = epoxyInfo.version + epoxyInfo.commit + epoxyInfo.release;
  
  if(!self.epoxy_settings) self.epoxy_settings = {};
const settings = self.epoxy_settings;
  settings.epoxyVersion = epoxyVersion;
  settings.wispServer = 'wss://localhost:9010/';
const EPOXY_PATH = "https://cdn.jsdelivr.net/npm/@mercuryworkshop/epoxy-tls@2.1.17-1/minimal/epoxy.wasm";

let cache = await caches.open("epoxy");
let initted  = false;

let currentClient;//: EpoxyClient;
let currentWispUrl;//: string;

async function evictEpoxy() {
	await cache.delete(EPOXY_PATH);
}

async function instantiateEpoxy() {
	if (!await cache.match(EPOXY_PATH)) {
		await cache.add(EPOXY_PATH);
	}
	const module = await cache.match(EPOXY_PATH);
	await epoxyInit({ module_or_path: module });
	initted = true;
}

async function createEpoxy() {
	let options = new EpoxyClientOptions();
	options.user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36';
  if(typeof navigator !== 'undefined') options.user_agent = navigator.userAgent;
	options.udp_extension_required = false;

	currentWispUrl = settings.wispServer;
	// @ts-ignore TODO fix types
	currentClient = new EpoxyClient(async () => {
		try {
			const wss = new WebSocketStream(settings.wispServer);
			const ws = await wss.opened;
			return { read: ws.readable, write: ws.writable };
		} catch {
			throw new Error("Failed to connect to Wisp Server: " + settings.wispServer);
		}
	}, options);
}

async function fetch(url, options){
	if (!initted) {
		if (epoxyVersion === settings.epoxyVersion) {
			await instantiateEpoxy();
		} else {
			await evictEpoxy();
			await instantiateEpoxy();
			console.log(`evicted epoxy "${settings.epoxyVersion}" from cache because epoxy "${epoxyVersion}" is available`);
			settings.epoxyVersion = epoxyVersion;
		}
	}

	if (currentWispUrl !== settings.wispServer) {
		await createEpoxy();
	}
	try {
		return await currentClient.fetch(url, options);
	} catch (err2) {
// 		let err = err2 as Error;
		console.log(err2);

		//throw err2;
      return null;
	}
}

  ___('Epoxy:',epoxyVersion)
// @ts-ignore
self.epoxyFetch = fetch;
}
// Function to load the cached script
async function loadCachedScript() {
  // https://cdn.jsdelivr.net/npm/libcurl.js@0.7.1/libcurl_full.min.js
  const scriptUrl_old = 'https://cdn.jsdelivr.net/npm/libcurl.js@latest/libcurl_full.js'; // Replace with the actual URL of your script
  const scriptUrl = 'https://cdn.jsdelivr.net/npm/libcurl.js@0.7.1/libcurl_full.min.js'; // Replace with the actual URL of your script

  try {
    const cache = await caches.open('main-cache'); // Replace with your cache name
    const cachedResponse_old = await cache.match(scriptUrl_old);
    if(cachedResponse_old){
      await cache.delete(scriptUrl_old);
      console.log('File deleted from cache successfully.');
    }
    const cachedResponse = await cache.match(scriptUrl);

    if (cachedResponse) {
      let scriptText = await cachedResponse.text();
      
     scriptText += `\r\nself&&(self.libcurl = libcurl);`;

      // Execute the script using eval() (use with caution)
      // eval(scriptText);

      // Alternatively, use new Function() (safer than eval())
      const execute = new Function(scriptText);
      execute(); // Execute the function
      
      libcurl.onload = async() => {
//         console.log("SW libcurl.js ready!");
        libcurl.set_websocket(__.wispServerUrl||"wss://wisp.mercurywork.shop/");
        console.log(`Worker loaded libcurl.js ${libcurl.version.lib}`);
        __.echo(`sw:libcurl_ready`);
      };
      

      console.log('Cached script loaded and executed successfully!');
    } else {
      console.warn('Script not found in cache:', scriptUrl);
    }
  } catch (error) {
    console.error('Failed to load cached script:', error);
  }
}
////
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'rss-fetch') {
    console.log('Periodic sync event triggered');
    event.waitUntil(showNotification('RSS Feed Updated!', 'New articles are available.'));
  }
});
// https://nanmu.me/en/posts/2020/why-my-content-served-by-pwa-service-worker-not-updating/
// https://www.oreilly.com/library/view/building-progressive-web/9781491961643/ch04.html
// https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/basics
// https://gist.github.com/Rich-Harris/fd6c3c73e6e707e312d7c5d7d0f3b2f9 | Stuff I wish I'd known sooner about service workers
function ADIOP_NEWS_UPDATER(o){
  return new Promise(async(resolve, reject) => {
    try{
     // if(typeof self.libcurl !== 'object') await loadCachedScript();
      
//       __libcurl = self.libcurl;

      const N = new ADIOP_NEWS();
      //
      N.channel = o.channel;
      N.verbose = o.verbose;
      N.testing = o.testing;
      if(o.clients) N.clients = o.clients;
      let bundle;
      if(o.notify){
        let __notification={
          title: 'Adiop News update started!',
          options: {
            //title: 'Adiop News update was successful!',
            body: `Please wait while we update [${o.channel||'all'}] news feeds.`,
            tag: 'ADIOP_NEWS_UPDATER',
            icon: 'https://adiop.com/adiop_icon_final_256.png',
            badge: 'https://adiop.com/adiop_icon_final_badge_96.png'
          }
        }
        self.registration.showNotification(__notification.title, __notification.options);
      }
      N.onError = (err)=>{
        ____(err)
      if(o.notify){
        let __notification={
          title: 'Error on Adiop News update!',
          options: {
            //title: 'Adiop News update was successful!',
            body: 'Error message: '+err,
            tag: 'ADIOP_NEWS_UPDATER',
            icon: 'https://adiop.com/adiop_icon_final_256.png',
            badge: 'https://adiop.com/adiop_icon_final_badge_96.png'
          }
        }
        self.registration.showNotification(__notification.title, __notification.options);
      }
      };
      if(o.task=='trend') bundle = await N.reloadTrends();
      else if(o.task=='upload') bundle = await N.upload();
      else if(o.task=='batch_load') bundle = await N.batchLoad();
      else if(o.task=='batch_trend') bundle = await N.batchTrend();
      else if(o.task=='update') bundle = await N.update();
      else if(o.task=='loadSystem') bundle = await N.loadSystem();
      else if(o.task=='loadSystem_all') bundle = await N.loadSystem_all();
      else if(o.task=='getContent') bundle = await N.getContent(o.url);
      else if(o.task=='parseFeed') bundle = await N.parseFeed(o.url);
      else if(typeof N[(o.task)] === "function") bundle = await N[(o.task)]();
      else if(o.channel) bundle = await N.reloadFeeds();
      if(bundle && o.notify){
        let __notification={
          title: 'Adiop News update was successful!',
          options: {
            //title: 'Adiop News update was successful!',
            body: 'Reload the app to catch up with the latest news.',
            tag: 'ADIOP_NEWS_UPDATER',
            icon: 'https://adiop.com/adiop_icon_final_256.png',
            badge: 'https://adiop.com/adiop_icon_final_badge_96.png',
            vibrate: [100, 50, 100],
            requireInteraction: true,
            //renotify: true,
            data: {
              dateOfArrival: Date.now(),
              url: 'https://adiop.com'
            },
            actions: [
              { action: 'explore', title: 'View' },
              { action: 'close', title: 'Close' },
            ]
          }
        }
        self.registration.showNotification(__notification.title, __notification.options);
      }
      return resolve(bundle);
    }catch(e){
      reject(e)
      console.log(e)
    }
  });
}
async function showNotification(title, body) {
  if (self.registration.pushManager) {
    self.registration.showNotification(title, {
          title: title,
          body: body,
          tag: 'test 2',
          icon: 'https://adiop.com/adiop_icon_final_256.png',
          badge: 'https://adiop.com/adiop_icon_badge_96.png',
          vibrate: [100, 50, 100],
          requireInteraction: true,
          //renotify: true,
          data: {
            dateOfArrival: Date.now(),
            url: 'https://adiop.com'
          },
          actions: [
            { action: 'explore', title: 'Go to the site' },
            { action: 'close', title: 'Close the notification' },
          ]
        });
  } else {
    console.warn("Push notifications not supported.");
  }
}
///////////// https://livebook.manning.com/book/progressive-web-apps/chapter-4/46
self.addEventListener('install', function(event) {
  event.waitUntil(self.skipWaiting());
});
self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
  console.log('SW activated!');
//   if(typeof self.libcurl === 'undefined') loadCachedScript();
  if(typeof self.wispTlsClient !== 'undefined') console.log('self.wispTlsClient is ready!');
//   if(typeof self.epoxyFetch === 'undefined') loadEpoxy();
  // RESET TIMER
//   self.every_15_minutes = Date.now() + 5*(60*1000);
//   self.news_update_time = __.clockToDate('07:00:00').getTime();
  self.news_update_time = getTargetSevenAM('07:00:00').getTime();
  self.news_update_evening_time = getTargetSevenAM('19:00:00').getTime();
//   __clock();
});
/////////
if (workbox) {
  //console.log(`Yay! Workbox is loaded 🎉`);
  workbox.routing.registerRoute(
    /\/index\.html|\/.*[^(\/p\/)]|.*\.js*/,
    workbox.strategies.networkFirst({
      // Use a custom cache name
      cacheName: 'main-cache',
    })
  );
  workbox.routing.registerRoute(
    // Cache image files
    /.*\.(?:png|jpg|jpeg|svg|gif)|.*img\.adiop\.com*/,
//     new RegExp('^https://img.adiop.com/(.*)'),
    // Use the cache if it's available
    workbox.strategies.cacheFirst({
      // Use a custom cache name
      cacheName: 'image-cache',
      plugins: [
        new workbox.expiration.Plugin({
          // Cache only 20 images
          maxEntries: 20,
          // Cache for a maximum of a week
          maxAgeSeconds: 7 * 24 * 60 * 60,
          // Automatically cleanup if quota is exceeded.
          purgeOnQuotaError: true,
        })
      ],
    })
  );
  workbox.routing.registerRoute(
    new RegExp('^https://fonts.(?:googleapis|gstatic).com/(.*)'),
    workbox.strategies.cacheFirst(),
  ); 
} 
else {
    console.log(`Boo! Workbox didn't load 😬`);
}
