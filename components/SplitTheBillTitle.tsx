/**
 * "split the bill" as hand-drawn marker strokes, matching the favicon: each
 * letter is a wobbly polyline, like it was drawn with a mouse in Paint.
 * Drawn as SVG paths rather than a font so the wobble is exactly ours. Each
 * letter is also nudged and tilted a little so the baseline bounces.
 */
export function SplitTheBillTitle({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 246 54"
      role="img"
      aria-label="split the bill"
      className={className}
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* s */}
        <g transform="translate(3 1) rotate(-4 8 26)">
          <path d="M14 19 9 14.5 3 18.5 2 23 8 24.5 13 28.5 15 32 10 36.5 4 35 0 31.5" />
        </g>
        {/* p */}
        <g transform="translate(24 0) rotate(3 8 26)">
          <path d="M3 16.5 4.5 29 2 48.5" />
          <path d="M3.5 22 9 14.5 14.5 19 16 25 11 33 5 35 2 29.5" />
        </g>
        {/* l */}
        <g transform="translate(47 -1) rotate(-5 4 20)">
          <path d="M4.5 3 3.5 19 5 37" />
        </g>
        {/* i */}
        <g transform="translate(60 1.5) rotate(4 4 26)">
          <path d="M4 16 2.8 26 5 37" />
          <path d="M3.5 8 5 9.8" />
        </g>
        {/* t */}
        <g transform="translate(73 0.5) rotate(-3 6 26)">
          <path d="M5.5 5 4 22 6 33 9.5 37" />
          <path d="M-1 17 5 14.5 12 17.5" />
        </g>
        {/* t */}
        <g transform="translate(103 -1) rotate(5 6 26)">
          <path d="M5.5 5 4 22 6 33 9.5 37" />
          <path d="M-1 17 5 14.5 12 17.5" />
        </g>
        {/* h */}
        <g transform="translate(121 1) rotate(-3 8 26)">
          <path d="M3.5 3 2.5 20 3.8 37" />
          <path d="M2.8 25 7.5 17 13 16 16.5 22 14 29 16 37" />
        </g>
        {/* e */}
        <g transform="translate(144 0) rotate(4 8 26)">
          <path d="M1.5 27 16 24 14.5 18 9 15 3 18.5 1.5 25 4 32 8 36 14 34.5 16.5 31" />
        </g>
        {/* b */}
        <g transform="translate(176 1.5) rotate(-4 8 26)">
          <path d="M3 3 4 20 2.8 37" />
          <path d="M3.4 23 9 16.5 14.5 19 16 25 13.5 33 7.5 37 2.6 31.5" />
        </g>
        {/* i */}
        <g transform="translate(199 -0.5) rotate(5 4 26)">
          <path d="M4 16 2.8 26 5 37" />
          <path d="M3.5 8 5 9.8" />
        </g>
        {/* l */}
        <g transform="translate(212 1) rotate(-4 4 20)">
          <path d="M4.5 3 3.5 19 5 37" />
        </g>
        {/* l */}
        <g transform="translate(225 -1) rotate(5 4 20)">
          <path d="M3.5 3 5 19 3.6 37" />
        </g>
      </g>
    </svg>
  );
}
