import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service} from '@ember/service';
import BroadcastStreamer from '../custom-objects/broadcast-streamer';
import $ from 'jquery';
import { debug } from '@ember/debug';
export default Component.extend({
  db: service(),
  init(){
    this._super(...arguments);
    this.streamer = BroadcastStreamer.create();

  },
  mediaUrl:computed('model', function(){
    return `https://stream.tunebrains.com/WebRTCApp/streams/${this.get('model.stream')}.ts`;
  }),
  videoElemId: computed(function(){
    return `${this.elementId}-video`;
  }),
  didInsertElement(){
    this._super(...arguments);
    this.streamer.playStream(this.get('videoElemId'),this.get('model.stream'), this.get('db').myId());
    // this.tryToPlay(this.get('model.stream'));
  },
  willDestroyElement(){
    this.streamer.stopStream(this.get('videoElemId'),this.get('model.stream'),this.get('db').myId());
    this._super(...arguments);
  },
  initializePlayer(name, extension, token) {
			var type;
			var liveStream = false;
			if (extension == "mp4") {
				type = "video/mp4";
				liveStream = false;
			} else if (extension == "m3u8") {
				type = "application/x-mpegurl";
				liveStream = true;
			} else {
				debug("Unknown extension: " + extension);
				return;
			}

			var preview = name;
			if (name.endsWith("_adaptive")) {
				preview = name.substring(0, name.indexOf("_adaptive"));
			}

			flowplayer(`#${this.get('videoElemId')}`, {
				poster : "https://stream.tunebrains.com/WebRTCApp/previews/" + preview + ".png",
				autoplay : true,
				ratio : 9 / 16,
				fullscreen : false,
				native_fullscreen : false,
				clip : {
					live : liveStream,
					sources : [ {
						type : type,
						src : "https://stream.tunebrains.com/WebRTCApp/streams/" + name + "." + extension + "?token=" + token
					} ]
				},
				hlsjs: {
					recoverMediaError: true,
					recoverNetworkError: true,
				}
			});

		},
  tryToPlay(name, token)
  {
  	fetch("https://stream.tunebrains.com/WebRTCApp/streams/"+ name +".m3u8", {method:'HEAD'})
  	.then((response) =>{
  		if (response.status == 200) {
  			// adaptive m3u8 exists,play it
  			this.initializePlayer(name, "m3u8", token);
  		}
  		else
  		{
  			//adaptive m3u8 not exists, try m3u8 exists.
  			fetch("https://stream.tunebrains.com/WebRTCApp/streams/"+ name +".m3u8", {method:'HEAD'})
  			.then((response) =>{
  				if (response.status == 200) {
  					//m3u8 exists, play it
  					this.initializePlayer(name, "m3u8", token);
  				}
  				else {
  					//no m3u8 exists, try vod file
  					fetch("https://stream.tunebrains.com/WebRTCApp/streams/"+ name +".mp4", {method:'HEAD'})
  					.then((response)=> {
  						if (response.status == 200) {
  							//mp4 exists, play it
  							this.initializePlayer(name, "mp4", token);
  						}
  						else {
  							debug("No stream found");
  							setTimeout(()=> { this.tryToPlay(name); }, 5000);
  						}
  					}).catch((err)=> {
  						debug("Error: " + err);
  					});

  				}
  			}).catch((err)=> {
  				debug("Error: " + err);
  			});
  		}
  	}).catch((err)=> {
  		debug("Error: " + err);
  	});
  }
});
