import Mixin from '@ember/object/mixin';
import {debug} from '@ember/debug';

export default Mixin.create({
  sendVideoInternal(db,myId,convId,messageRoot,video,mode = 'youtubeVideo'){    
    let path = messageRoot;
    let ref = path + "/" + convId + "/videoState";
    let values = {};
    values['type'] = 'new';
    values['syncAt'] = new Date().getTime() / 1000.0;
    values['updatedAt'] = new Date().getTime() / 1000.0;
    values['videoType'] = mode;
    values['videoId'] = video['id'];
    values['videoName'] = video['snippet']['title'];
    values['videoThumbnail'] = video['snippet']['thumbnails']['high']['url'];
    values['senderId'] = myId;
    values['seconds'] = 0;
    debug('sendVideo ' + JSON.stringify(values));
    db.ref(ref).update(values).then((resolve) => {

    }).catch(() => {
      debug(`Failed to update videoState on path ${ref} to ${JSON.stringify(values)}`);
    });
  }
});
