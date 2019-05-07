import Mixin from '@ember/object/mixin';

export default Mixin.create({
  isTypePublicRoom(type){
    return type === 'feed' || type === 'room';
  }
});
