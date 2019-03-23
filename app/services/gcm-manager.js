import Service from '@ember/service';
import {inject as service} from '@ember/service';
import {debug} from '@ember/debug';
import $ from 'jquery';

export default Service.extend({
  db: service(),
  sendMessage(receiverId, actualMessage, message) {
    this.get('db').tokens(receiverId).then((tokens) => {
      tokens.forEach((token) => {
        let badge = parseInt(token['badge_count'] || '0');
        let newBadge = badge + 1;
        this.get('db').updateBadge(receiverId, token.id, newBadge);
        let body = {
          to: token['token_id'],
          priority: 'high',
          content_available: true,
          badge: newBadge,
          sound: 'NotificationTone.mp3',
        };
        let notification = {};
        if (!actualMessage) {
          notification['body'] = message;
          notification['badge'] = newBadge;
          notification['title'] = message;
          notification['sound'] = 'NotificationTone.mp3';
        } else {
          notification = actualMessage;
          notification['title'] = message;
          notification['badge'] = newBadge;
          notification['sound'] = 'NotificationTone.mp3';
        }
        body['notification'] = notification;
        $.ajax({
          url: 'https://fcm.googleapis.com/fcm/send',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'key=AAAAcmEF2mM:APA91bH2adEb-c3jH7XRQg0GnZKigvH8cKK6I9LnOOmU4Zfcq_tqQXBWiwf4IwPIEPqi6W-mBzUFBTFKt_5S5MWDmYwKAkndF9lk5u_0ZxHkY7GTrfK5HdmTDz9TDi5WjrRMHjS5_-fp',
          },
          data: JSON.stringify(body),
          success: () => {
            debug('ok');
          },
          failure: () => {
            debug('fail');
          }
        })


      })
    })
  }
});
