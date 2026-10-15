/** Phần tử gần nhất khớp `selector`; dò theo hình dạng vì phần tử trong iframe thuộc realm khác, `instanceof` luôn sai. */
export function closestIn(
  target: EventTarget | null,
  selector: string,
): HTMLElement | null {
  const node = target as HTMLElement | null;
  if (!node || typeof node.closest !== "function") return null;
  return node.closest<HTMLElement>(selector);
}

/** Đánh lại chỉ số `data-field` cho các dòng của một danh sách sau khi thêm hay xoá dòng. */
export function renumberLines(list: Element, prefix: string): void {
  const lines = list.querySelectorAll(":scope > li");
  lines.forEach((line, index) => {
    line.setAttribute("data-field", `${prefix}.${index}`);
  });
}

/** Phần trước dấu chấm cuối: `experiences.0.bullets.2` → `experiences.0.bullets`. */
export const parentPath = (path: string): string =>
  path.slice(0, path.lastIndexOf("."));

export function placeCaretAtEnd(element: HTMLElement): void {
  element.focus();
  const doc = element.ownerDocument;
  const range = doc.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  const selection = doc.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}
