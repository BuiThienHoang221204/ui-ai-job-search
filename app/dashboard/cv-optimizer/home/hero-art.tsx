/** Minh hoạ hai tờ CV ở góc phải thẻ đầu trang, cùng kiểu với hình ở trang Tổng quan. */
export function HeroArt() {
  return (
    <svg
      viewBox="0 0 230 150"
      aria-hidden="true"
      className="pointer-events-none absolute top-6 right-7 hidden w-56 xl:block"
    >
      <rect
        x="40"
        y="40"
        width="70"
        height="88"
        rx="8"
        fill="#eef0ff"
        stroke="#c7ccff"
        strokeWidth="2"
        transform="rotate(-8 75 84)"
      />
      <rect
        x="96"
        y="14"
        width="96"
        height="124"
        rx="8"
        fill="#fff"
        stroke="#c7ccff"
        strokeWidth="2"
      />
      <rect x="110" y="30" width="44" height="7" rx="3.5" fill="#4952ff" />
      <rect x="110" y="44" width="66" height="4" rx="2" fill="#e0e3ff" />
      <rect x="110" y="54" width="58" height="4" rx="2" fill="#e0e3ff" />
      <rect x="110" y="70" width="30" height="5" rx="2.5" fill="#a5abff" />
      <rect x="110" y="82" width="66" height="4" rx="2" fill="#e0e3ff" />
      <rect x="110" y="92" width="50" height="4" rx="2" fill="#e0e3ff" />
      <rect x="110" y="102" width="62" height="4" rx="2" fill="#e0e3ff" />
      <circle cx="196" cy="24" r="14" fill="#ffd166" />
      <path
        d="M196 15l2.4 6.6L205 24l-6.6 2.4L196 33l-2.4-6.6L187 24l6.6-2.4z"
        fill="#fff"
      />
      <path
        d="M30 128c30-6 40-30 66-36"
        fill="none"
        stroke="#4952ff"
        strokeWidth="2"
        strokeDasharray="4 5"
      />
      <circle cx="30" cy="128" r="4.5" fill="#4952ff" />
    </svg>
  );
}
