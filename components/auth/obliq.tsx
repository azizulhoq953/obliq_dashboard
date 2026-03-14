export function ObliqLogo() {
  return (
    <div className="obliq-logo">
      <div className="logo-icon">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <rect width="28" height="28" rx="8" fill="url(#logoGrad)" />
          <path
            d="M14 7C10.134 7 7 10.134 7 14C7 17.866 10.134 21 14 21C17.866 21 21 17.866 21 14"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="19" cy="9" r="2.5" fill="white" />
          <defs>
            <linearGradient id="logoGrad" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FF8C5A" />
              <stop offset="1" stopColor="#E8431A" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <span className="logo-text">Obliq</span>
    </div>
  );
}