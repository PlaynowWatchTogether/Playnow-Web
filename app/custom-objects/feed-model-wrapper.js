import ObjectProxy from '@ember/object/proxy';
import {computed} from '@ember/object';
import moment from 'moment';
import { get } from '@ember/object';
import FeedItemAccessMixin from '../mixins/model/feed-item-model-access';
export default ObjectProxy.extend(FeedItemAccessMixin, {

});
