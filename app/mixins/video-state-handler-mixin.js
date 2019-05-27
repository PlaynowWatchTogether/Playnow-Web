import Mixin from '@ember/object/mixin';
import {debug} from '@ember/debug';
import { get } from '@ember/object';
export default Mixin.create({
  sendVideoInternal(db,myId,convId,messageRoot,video){
    let path = messageRoot;
    let ref = path + "/" + convId + "/videoState";
    let values = {};
    values['type'] = 'new';
    values['syncAt'] = new Date().getTime() / 1000.0;
    values['updatedAt'] = new Date().getTime() / 1000.0;
    values['videoType'] = get(video,'kind');
    values['videoId'] = get(video,'id');
    values['videoName'] = get(video,'title');
    values['videoThumbnail'] = get(video,'thumbnail');
    values['videoCategory'] = get(video,'category') || '0';
    values['videoUrl'] = get(video,'url');
    values['senderId'] = myId;
    values['seconds'] = 0;
    debug('sendVideo ' + JSON.stringify(values));
    db.ref(ref).update(values).then((resolve) => {

    }).catch(() => {
      debug(`Failed to update videoState on path ${ref} to ${JSON.stringify(values)}`);
    });
  }
});
