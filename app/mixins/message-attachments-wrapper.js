import Mixin from '@ember/object/mixin';

export default Mixin.create({
  wrapMessageAttachments(model){
    const type = model['type'];
    const attachments = [];
    if (type === 'photo'){//back compatible photo
      attachments.push({
        type:'image/*',
        url: model.thumbnail
      });
    }
    if (type === 'Video'){//back compatible video
      attachments.push({
        type:'video/*',
        url: model.media
      });
    }
    if (type === 'attachment'){//back compatible one attachment
      attachments.push(model.attachment);
    }
    if (model.attachments){
      model.attachments.forEach((elem)=>{
        attachments.push(elem);
      });
    }
    return attachments;
  }
});
