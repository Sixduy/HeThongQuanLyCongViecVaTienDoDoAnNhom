// ==============================================================================
// DANH MỤC TÀI NGUYÊN CHIBI CHUYÊN BIỆT CHO ĐỒ ÁN (ĐÃ TINH GỌN CHUẨN XÁC)
// Chỉ giữ lại 45 hình ảnh thực tế được sử dụng trong toàn bộ hệ thống
// ==============================================================================

export const CHIBI_ASSETS = {
  logos: {
    team: '/assets/chibi/logos/logo-kanban-team.png',
    gearTick: '/assets/chibi/logos/logo-gear-tick.png',
    deadlineFighter: '/assets/chibi/logos/logo-deadline-fighter.png',
    stampOnTrack: '/assets/chibi/logos/logo-stamp-on-track.png'
  },
  avatarFrames: {
    gv: '/assets/chibi/avatar-frames/avatar-frame-gv.png',
    leader: '/assets/chibi/avatar-frames/avatar-frame-leader.png',
    member: '/assets/chibi/avatar-frames/avatar-frame-member.png'
  },
  badges: {
    leader: '/assets/chibi/badges/badge-level-leader.png',
    fresher: '/assets/chibi/badges/badge-level-fresher.png',
    onTime: '/assets/chibi/badges/badge-nop-dung-han.png',
    review10: '/assets/chibi/badges/badge-review-10.png'
  },
  characters: {
    coding: '/assets/chibi/characters/char-coding.png',
    coLen: '/assets/chibi/characters/char-co-len.png',
    ganhTa: '/assets/chibi/characters/char-leader-ganh-ta.png',
    deadline: '/assets/chibi/characters/char-deadline-chay.png',
    tieuChay: '/assets/chibi/characters/char-deadline-tieu-chay.png',
    success: '/assets/chibi/characters/char-success.png',
    triumph: '/assets/chibi/characters/char-success.png',
    empty: '/assets/chibi/characters/char-empty.png',
    emptyWait: '/assets/chibi/characters/char-empty-wait.png',
    notify: '/assets/chibi/characters/char-notify.png',
    gvReview: '/assets/chibi/characters/char-gv-review.png',
    milestoneFlag: '/assets/chibi/characters/char-milestone-flag.png',
    chiaTask: '/assets/chibi/characters/char-chia-task.png'
  },
  icons: {
    todo: '/assets/chibi/icons/icon-sticky-todo.png',
    progress: '/assets/chibi/icons/icon-sticky-progress.png',
    done: '/assets/chibi/icons/icon-sticky-done.png',
    flame: '/assets/chibi/icons/icon-flame-deadline.png',
    trophy: '/assets/chibi/icons/icon-trophy.png',
    checklist: '/assets/chibi/icons/icon-clipboard-checklist.png',
    kanban: '/assets/chibi/icons/icon-kanban-board.png',
    upload: '/assets/chibi/icons/icon-cloud-upload.png',
    boba: '/assets/chibi/icons/icon-boba.png',
    bell: '/assets/chibi/icons/icon-bell-badge.png',
    flag: '/assets/chibi/icons/icon-calendar-flag.png'
  },
  labels: {
    done: '/assets/chibi/labels/label-done.png',
    approved: '/assets/chibi/labels/label-approved.png',
    chayDeadline: '/assets/chibi/labels/label-chay-deadline.png'
  },
  loading: {
    orbit: '/assets/chibi/loading/loading-sticky-orbit.png'
  },
  journey: '/assets/chibi/journeys/journey-do-an-map.png',
  stickers: [
    { id: 'happy', src: '/assets/chibi/stickers/sticker-happy.png', name: 'Tuyệt vời', code: '[sticker:happy]' },
    { id: 'ok', src: '/assets/chibi/stickers/sticker-ok.png', name: 'Đã rõ', code: '[sticker:ok]' },
    { id: 'stress', src: '/assets/chibi/stickers/sticker-stress.png', name: 'Căng thẳng', code: '[sticker:stress]' },
    { id: 'confused', src: '/assets/chibi/stickers/sticker-confused.png', name: 'Thắc mắc', code: '[sticker:confused]' },
    { id: 'sleepy', src: '/assets/chibi/stickers/sticker-sleepy.png', name: 'Buồn ngủ', code: '[sticker:sleepy]' },
    { id: 'error', src: '/assets/chibi/stickers/sticker-error.png', name: 'Gặp bug', code: '[sticker:error]' }
  ]
};

// Helper parse sticker code trong chuỗi bình luận
export function renderCommentWithStickers(text) {
  if (!text) return text;
  const stickerMap = {};
  CHIBI_ASSETS.stickers.forEach(s => {
    stickerMap[s.code] = s;
  });

  const regex = /\[sticker:([a-z0-9_-]+)\]/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.substring(lastIndex, match.index) });
    }
    const sticker = stickerMap[match[0]];
    if (sticker) {
      parts.push({ type: 'sticker', sticker });
    } else {
      parts.push({ type: 'text', content: match[0] });
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.substring(lastIndex) });
  }

  return parts;
}
