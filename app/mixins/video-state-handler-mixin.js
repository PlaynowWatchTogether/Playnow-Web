import Mixin from '@ember/object/mixin';
import {debug} from '@ember/debug';

export default Mixin.create({
  sendVideoInternal(db,myId,convId,messageRoot,video){
    let path = messageRoot;
    let ref = path + "/" + convId + "/videoState";
    let values = {};
    values['type'] = 'new';
    values['syncAt'] = new Date().getTime() / 1000.0;
    values['updatedAt'] = new Date().getTime() / 1000.0;
    values['videoType'] = video.get('kind');
    values['videoId'] = video.get('id');
    values['videoName'] = video.get('title');
    values['videoThumbnail'] = video.get('thumbnail');
    values['videoCategory'] = video.get('category');
    values['videoUrl'] = video.get('url');
    values['senderId'] = myId;
    values['seconds'] = 0;
    debug('sendVideo ' + JSON.stringify(values));
    db.ref(ref).update(values).then((resolve) => {

    }).catch(() => {
      debug(`Failed to update videoState on path ${ref} to ${JSON.stringify(values)}`);
    });
  }
});
