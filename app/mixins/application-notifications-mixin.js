import Mixin from '@ember/object/mixin';
import {inject as service} from '@ember/service';

export default Mixin.create({
  db: service(),
  handleNotificationSync(){
    const myId = this.get('db').myId();
    this.get('db').userNotifications((notifications)=>{

      this.get('db').set('notificationsUpdated',new Date());
      const contrl = this.controllerFor('application');
      contrl.set('userNotifications',notifications);
      contrl.set('notificationsLastUpdate', new Date());
    })
  }
});
