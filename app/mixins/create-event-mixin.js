import Mixin from '@ember/object/mixin';
import { debug } from '@ember/debug';
import { computed } from '@ember/object';
export default Mixin.create({
  init(){
    this._super(...arguments);
    this.resetNewEvent();
  },
  newEventSeats: computed('newEvent.seats.available', function(){
    return this.get('newEvent.seats.available');
  }),
  createEventShowed(){
    this.set('creatingEvent', true);
  },
  resetNewEvent(){
    this.set('creatingEvent',false);
    this.set('newEventErrors',{});
    this.set('newEvent', {
      date:{

      },
      seats:{
        available: -1
      }
    });
  },
  actions:{
    onSeatsPick(seats){
      this.set('newEvent.seats.available',parseInt(seats));
    },
    cancelCreateEvent(){
      this.resetNewEvent();
    },
    createEvent(){
      this.set('newEventErrors',{});
      const model = this.get('newEvent');
      debug(JSON.stringify(model));
      if (!model.title || model.title.length === 0){
        this.set('newEventErrors.title','Should not be empty');
        return;
      }
      if (!model.description || model.description.length === 0){
        this.set('newEventErrors.description','Should not be empty');
        return;
      }
      if (!model.date || !model.date.date || !model.date.timeStart || !model.date.timeEnd){
        this.set('newEventErrors.date','Should be set');
        return;
      }
      this.dataSource.createEvent(this.dataSource.feedId, model).then(()=>{
        this.resetNewEvent();
      });
    }
  }
});
