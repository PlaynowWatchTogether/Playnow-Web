import EmberObject from '@ember/object';
import {Subject, asyncScheduler} from 'rxjs';
import {observeOn} from 'rxjs/operators';
import {debug} from "@ember/debug";

export default EmberObject.extend({
  init() {
    this._super(...arguments);
    this.state = 'closed';
    this.syncMode = 'awaiting';
    this.isMaster = true;
    this.lastState = {
      videoId: ''
    };
    this.currentVideo = {};
    this.stateSubject = new Subject();
    this.stateSubject.pipe(
      observeOn(asyncScheduler)
    ).subscribe({
      next: (newState) => {
        debug('Got new video state ' + newState.type);
        let nextState = this.state;
        let shouldSlide = this.syncMode === 'sliding' && !this.isMaster;
        let firebaseState = newState['type'];
        if (firebaseState === 'new') {
          if (shouldSlide)
            return;
          nextState = 'loading';
        } else if (firebaseState === 'slide') {
          if (shouldSlide)
            return;
          nextState = 'loading';
        } else if (firebaseState === 'sync') {
          if (shouldSlide) {
            nextState = 'loading';
          } else if (this.lastState.videoId !== newState['videoId']) {
            nextState = 'requestingSync';
          } else {
            nextState = 'syncing';
          }
        } else if (firebaseState === 'requestSync') {
          nextState = 'resyncing';
        } else if (firebaseState === 'pause') {
          nextState = 'paused';
        }
        this.handleNextState(nextState, newState);
        this.lastState = newState;
      }
    })
  },
  closeVideo() {
    this.lastState = {};
    this.state = 'closed';
    this.currentVideo = {};
  },
  handleVideoState(newState) {
    this.stateSubject.next(newState);
  },
  updateWatchers(watchers, seconds) {
    let allready = false;
    let watching = [];
    watchers.forEach((item) => {
      if (item['state'] !== 'loaded' && item['state'] !== 'closed') {
        watching.push(item);
      }
    });
    allready = watching.length === 0;
    if (this.state === 'loaded') {
      if (this.syncMode === 'sliding' && this.isMaster) {
        let syncAt = new Date().getTime() + 2000;
        this.play(2 + 0.5);
        this.delegate.updateState('sync', this.lastState.seconds, syncAt);
      } else if (this.syncMode === 'awaiting' && allready) {
        let lastWatcher = null;
        watchers.forEach((watcher) => {
          if (!lastWatcher) {
            lastWatcher = watcher;
          } else {
            if (lastWatcher['updatedAt'] < watcher['updatedAt']) {
              lastWatcher = watcher;
            }
          }
        });
        if (lastWatcher && lastWatcher['userId'] === this.myId) {
          let delay = 2 * 1000;
          this.delegate.updateState('sync', seconds, this.get('ntp').estimatedServerTimeMs() + delay);
        }
      }
    }
  },
  handleNextState(nextState, newState) {
    if (!this.canChangeState(nextState)) {
      debug('Cannot chage state from ' + this.state + " to " + nextState);
      return;
    }
    if (nextState === 'loading') {
      let seconds = newState['seconds'] ? newState['seconds'] : 0.0;
      debug('VideoSync: got seconds: ' + seconds);
      let shouldSlide = this.syncMode === 'sliding' && !this.isMaster;
      if (shouldSlide) {
        let syncAt = newState['syncAt'] || 0.0;
        debug('VideoSync: got syncAt: ' + syncAt);
        let timePassed = this.get('ntp').estimatedServerTimeMs() - syncAt * 1000;
        debug('VideoSync: timePassed: ' + timePassed);

        let addSeconds = timePassed / 1000 + 5.0;
        debug('VideoSync: addSeconds: ' + addSeconds);
        seconds += addSeconds;
        let startTime = 5000 + this.get('ntp.offset');
        debug('VideoSync: startTime: ' + startTime);
        this.play(startTime)
      }
      this.loadVideo(newState, seconds);
    } else if (nextState === 'syncing') {
      if (this.syncMode === 'awaiting') {
        let syncAt = newState['syncAt'] * 1000;
        debug('VideoSync: got syncAt = ' + syncAt);
        let time = this.get('ntp').estimatedServerTimeMs();
        debug('VideoSync: currentTime = ' + time);
        let startTime = (syncAt - time);
        debug('VideoSync: startTime = ' + startTime);
        this.play(startTime)
      }
    } else if (nextState === 'requestingSync') {
      this.delegate.updateState('requestSync');
    } else if (nextState === 'playing') {
      this.delegate.play();
    } else if (nextState === 'paused') {
      this.delegate.pause();
      //} else if (nextState === 'loaded') {

      //} else if (nextState === 'closed') {
    } else if (nextState === 'resyncing') {
      this.delegate.slideVideo()
    }
    debug('update current ' + this.state + ' to ' + nextState);
    this.state = nextState;
    this.delegate.updateWatching(this.lastState['videoId'] ? this.lastState['videoId'] : '', this.state);
  },
  play(seconds) {
    debug('VideoSync: schedule play after ' + seconds);
    setTimeout(() => {
      debug('VideoSync: scheduled play after ' + seconds + ' with state ' + this.state);
      if (this.state === 'loading') {
        this.handleNextState('loading', this.lastState);
      } else {
        this.handleNextState('playing', this.lastState);
      }
    }, Math.max(1000, seconds));

  },
  loadVideo(video, seconds) {
    let newVideo = this.currentVideo['id'] === video['id'];
    if (newVideo) {
      this.currentVideo = video;
      this.delegate.loadVideo(video, seconds)
    } else {
      this.delegate.seekVideo(seconds)
    }
  },
  canChangeState(nextState) {
    if (nextState === 'closed' || nextState === 'loading')
      return true;
    if (this.state === 'closed') {
      return nextState === 'requestingSync'
    } else if (this.state === 'loading') {
      return nextState === 'loaded' || nextState === 'resyncing'
    } else if (this.state === 'loaded') {
      return nextState === 'syncing' || nextState === 'resyncing' || nextState === 'playing'
    } else if (this.state === 'syncing') {
      return nextState === 'playing' || nextState === 'paused' || nextState === 'resyncing'
    } else if (this.state === 'requestingSync') {
      return nextState === 'loaded'
    } else if (this.state === 'playing') {
      return nextState === 'paused' || nextState === 'resyncing'
    } else if (this.state === 'paused') {
      return nextState === 'syncing' || nextState === 'resyncing'
    } else if (this.state === 'resyncing') {
      return nextState === 'syncing' || nextState === 'resyncing'
    }
    return false;
  }
});
