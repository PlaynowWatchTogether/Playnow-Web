import Mixin from '@ember/object/mixin';

export default Mixin.create({
  addPlaylistItemInternal(senderId, ref, video){
    const itemID = new Date().getTime().toString() + senderId;
    const item = video.get('data');
    item['playlistId'] = itemID;
    return ref.child(itemID).set(item);
  },
  removePlaylistItemInternal(ref, video){
    const itemID = video.get('playlistId')
    return ref.child(`${itemID}`).remove();
  },
});
