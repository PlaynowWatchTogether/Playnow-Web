import EmberObject from '@ember/object';
import {Subject, from, asyncScheduler} from 'rxjs';
import {observeOn} from 'rxjs/operators';

export default EmberObject.extend({
  init() {
    this._super(...arguments);
    this.state = 'closed';
    this.syncMode = 'awaiting';
    this.isMaster = true;
    this.lastState = {
      videoId: ''
    }
    this.currentVideo = {}
    this.stateSubject = new Subject();
    this.stateSubject.pipe(
      observeOn(asyncScheduler)
    ).subscribe({
      next: (newState) => {
        console.log('Got new video state ' + newState.type);
        let nextState = this.state;
        let shouldSlide = this.syncMode === 'sliding' && !this.isMaster
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
          newState = 'paused';
        }
        this.handleNextState(nextState, newState);
        this.lastState = newState;
      }
    })
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
        })
        if (lastWatcher && lastWatcher['userId'] === this.myId) {
          //let delay = 2 * 1000;
          this.delegate.updateState('sync', seconds);
        }
      }
    }
  },
  handleNextState(nextState, newState) {
    if (!this.canChangeState(nextState)) {
      console.log('Cannot chage state from ' + this.state + " to " + nextState);
      return;
    }
    if (nextState === 'loading') {
      let seconds = newState['seconds'] ? newState['seconds'] : 0.0;
      let shouldSlide = this.syncMode === 'sliding' && !this.isMaster;
      if (shouldSlide) {
        let syncAt = newState['syncAt']
        let timePassed = Date().getTime() - syncAt * 1000;
        seconds += timePassed / 1000 + 5.0;
        let startTime = 5000 + 40//

      }
      this.loadVideo(newState, seconds);
    } else if (nextState === 'syncing') {
      if (this.syncMode === 'awaiting') {
        let syncAt = newState['syncAt'] * 1000;
        let time = new Date().getTime();
        let startTime = (syncAt - time)
        this.play(startTime)
      }
    } else if (nextState === 'requestingSync') {
      this.delegate.updateState('requestSync');
    } else if (nextState === 'playing') {

    } else if (nextState === 'paused') {

    } else if (nextState === 'loaded') {

    } else if (nextState === 'closed') {

    } else if (nextState === 'resyncing') {
      this.delegate.slideVideo()
    }
    console.log('update current ' + this.state + ' to new ' + nextState);
    this.state = nextState;
    this.delegate.updateWatching(this.lastState['videoId'] ? this.lastState['videoId'] : '', this.state);
  },
  play(seconds) {
    this.delegate.playVideo()
  },
  loadVideo(video, seconds) {
    let newVideo = this.currentVideo['id'] === video['id'];
    if (newVideo) {
      this.delegate.loadVideo(video, seconds)
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
