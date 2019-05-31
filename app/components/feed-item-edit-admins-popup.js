import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service} from '@ember/service';
import J from 'jquery';
import { debug } from '@ember/debug';
export default Component.extend({
  firebaseApp: service(),
  db:service(),
  attributeBindings: ['tabindex', 'role', 'aria-labelledby', 'aria-hidden'],
  didInsertElement(){
    this._super(...arguments);
    $(this.element).on('show.bs.modal', ()=>{
      this.set('searchQuery', '');
      this.set('resultQuery', '');
      this.set('isLoadingSearch', false);
      this.set('searchResults', []);
    });
  },
  groupAdmins: computed('model.Admins', function(){
    const creatorId = this.get('model.creatorId');
    return Object.values(this.get('model.Admins') || {}).sort((a,b)=>{
      const adminA = a.id===creatorId;
      const adminB = b.id===creatorId;
      return adminA ? -1 : (adminB ? 1 : 0);
    });
  }),
  actions: {
    hideModal(){
      $(this.element).modal('hide');
    },
    triggerSearch(){
      const q = this.get('searchQuery');
      this.set('resultQuery',q);
      if (!q || q.length === 0)
        return;
      this.set('isLoadingSearch',true);
      this.set('searchResults',[]);
      this.firebaseApp.database().ref("Users").orderByChild('Email').startAt(q).limitToFirst(10).once('value', (users)=>{
        this.set('isLoadingSearch',false);
        const payload = users.val();
        Object.keys(payload).forEach((u)=>{
          payload[u].id = u;
        });
        this.set('searchResults', Object.values(payload));
        debug(`found ${users.length} length`);
      });
    },
    removeAsAdmin(member){
      this.get('removeAsAdmin')(member);
    }

  }
});
