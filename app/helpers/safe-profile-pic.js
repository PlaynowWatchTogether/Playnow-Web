import { helper } from '@ember/component/helper';

export function safeProfilePic([from,...rest]) {
  if (!from || from.length === 0) {
    return '/assets/monalisa_rect.png';
  } else {
    return from;
  }
  return params;
}

export default helper(safeProfilePic);
