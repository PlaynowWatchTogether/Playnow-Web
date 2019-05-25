import Mixin from '@ember/object/mixin';
import {get} from '@ember/object';
export default Mixin.create({
  wrapMessageAttachments(model){
    if (!model)
      return [];
    const type = get(model,'type');
    const attachments = [];
    if (type === 'photo'){//back compatible photo
      attachments.push({
        type:'image/*',
        url: get(model,'thumbnail')
      });
    }
    if (type === 'Video'){//back compatible video
      attachments.push({
        type:'video/*',
        url: get(model,'media')
      });
    }
    if (type === 'attachment'){//back compatible one attachment
      attachments.push(get(model,'attachment'));
    }
    if (get(model,'attachments')){
      get(model,'attachments').forEach((elem)=>{
        attachments.push(elem);
      });
    }
    return attachments;
  }
});
