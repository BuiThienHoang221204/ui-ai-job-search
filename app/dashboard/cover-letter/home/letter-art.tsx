/** Minh hoạ phong bì và tờ thư ở góc phải thẻ đầu trang, cùng kiểu với trang Tối ưu CV. */
export function LetterArt() {
  return (
    <svg
      viewBox="0 0 230 150"
      aria-hidden="true"
      className="pointer-events-none absolute top-5 right-8 hidden w-48 xl:block"
    >
      <rect
        x="70"
        y="30"
        width="140"
        height="96"
        rx="10"
        fill="#fff"
        stroke="#c7ccff"
        strokeWidth="2"
      />
      <path
        d="M72 34l68 50 68-50"
        fill="none"
        stroke="#c7ccff"
        strokeWidth="2"
      />
      <g transform="rotate(-8 65 102)">
        <rect
          x="30"
          y="62"
          width="70"
          height="80"
          rx="8"
          fill="#eef0ff"
          stroke="#c7ccff"
          strokeWidth="2"
        />
        <rect x="42" y="78" width="36" height="6" rx="3" fill="#4952ff" />
        <rect x="42" y="92" width="46" height="4" rx="2" fill="#c7ccff" />
        <rect x="42" y="102" width="40" height="4" rx="2" fill="#c7ccff" />
      </g>
      <circle cx="206" cy="30" r="14" fill="#ffd166" />
      <path
        d="M206 21l2.4 6.6L215 30l-6.6 2.4L206 39l-2.4-6.6L197 30l6.6-2.4z"
        fill="#fff"
      />
    </svg>
  );
}
