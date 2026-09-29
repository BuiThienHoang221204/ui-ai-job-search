const URL_LIMIT = 7000;

export interface MailDraft {
  subject: string | null;
  body: string;
}

/** URL soạn thư Gmail, hoặc `null` khi nội dung quá dài để mở bằng URL. */
export function gmailComposeUrl(draft: MailDraft): string | null {
  if (!draft.body.trim()) return null;

  const url =
    'https://mail.google.com/mail/?view=cm&fs=1' +
    `&su=${encodeURIComponent(draft.subject ?? '')}` +
    `&body=${encodeURIComponent(draft.body)}`;

  return url.length <= URL_LIMIT ? url : null;
}
