import { helper } from '@ember/component/helper';

export function safeProfilePic([from,mode,...rest]) {
  if (!from || from.length === 0) {
    if (mode === 'user'){
      return '/assets/default_profile.png';
    }else if (mode === 'group'){
      return '/assets/default_groups.png';
    }else{
      return '/assets/monalisa_rect.png';
    }
  } else {
    return from;
  }
  return params;
}

export default helper(safeProfilePic);
