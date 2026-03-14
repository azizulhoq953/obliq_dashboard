export function WavyBackground() {
  return (
    <svg
      className="wavy-bg"
      viewBox="0 0 700 900"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Base gradient fill */}
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFBD8A" />
          <stop offset="40%" stopColor="#F07340" />
          <stop offset="100%" stopColor="#B82A0A" />
        </linearGradient>
      </defs>
      <rect width="700" height="900" fill="url(#bgGrad)" />

      {/* Wave layer 1 — lightest, top */}
      <path
        d="M-50 180 Q100 80 250 160 Q400 240 550 140 Q680 60 780 120 L780 0 L-50 0 Z"
        fill="#FFD4A0"
        fillOpacity="0.55"
      />

      {/* Wave layer 2 */}
      <path
        d="M-50 320 Q80 220 220 300 Q380 390 530 280 Q650 190 780 250 L780 0 L-50 0 Z"
        fill="#FFB870"
        fillOpacity="0.4"
      />

      {/* Wave layer 3 — mid orange */}
      <path
        d="M-50 500 Q120 390 280 470 Q440 550 600 420 Q700 350 780 400 L780 900 L-50 900 Z"
        fill="#C94010"
        fillOpacity="0.45"
      />

      {/* Wave layer 4 — deep red, bottom */}
      <path
        d="M-50 680 Q150 580 320 660 Q490 740 650 620 Q720 570 780 600 L780 900 L-50 900 Z"
        fill="#9A2208"
        fillOpacity="0.55"
      />

      {/* Wave layer 5 — darkest bottom edge */}
      <path
        d="M-50 820 Q200 740 380 800 Q540 855 700 780 L780 900 L-50 900 Z"
        fill="#6B1504"
        fillOpacity="0.6"
      />
    </svg>
  );
}
