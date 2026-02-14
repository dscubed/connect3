export function ContactIllustration() {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-12">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="max-w-[350px] max-h-[350px]"
      >
        {/* Envelope */}
        <rect
          x="50"
          y="120"
          width="300"
          height="200"
          rx="12"
          fill="#f0e5ff"
          stroke="#c2b7ff"
          strokeWidth="3"
        />
        <path
          d="M50 140 L200 240 L350 140"
          stroke="#c2b7ff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <line
          x1="50"
          y1="140"
          x2="200"
          y2="240"
          stroke="#c2b7ff"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="350"
          y1="140"
          x2="200"
          y2="240"
          stroke="#c2b7ff"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Paper flying out */}
        <g transform="translate(280, 80) rotate(-15)">
          <rect
            x="0"
            y="0"
            width="80"
            height="100"
            rx="4"
            fill="white"
            stroke="#ffbfd4"
            strokeWidth="2"
          />
          <line
            x1="12"
            y1="20"
            x2="68"
            y2="20"
            stroke="#c2b7ff"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="12"
            y1="35"
            x2="68"
            y2="35"
            stroke="#c2b7ff"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="12"
            y1="50"
            x2="50"
            y2="50"
            stroke="#c2b7ff"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>

        {/* Decorative circles */}
        <circle cx="80" cy="80" r="8" fill="#ffbfd4" opacity="0.6" />
        <circle cx="120" cy="340" r="12" fill="#c2b7ff" opacity="0.4" />
        <circle cx="320" cy="300" r="10" fill="#f0e5ff" />

        {/* Checkmark */}
        <circle cx="150" cy="260" r="25" fill="#4ade80" opacity="0.9" />
        <path
          d="M140 260 L148 268 L162 250"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>
  );
}
