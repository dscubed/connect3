export function PurplePath({
  className,
  id = "purple-gradient",
}: {
  className?: string;
  id?: string;
}) {
  return (
    <svg
      viewBox="0 0 563 407"
      fill="none"
      overflow="visible"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M35.1597 392.926C162.813 54.6109 586.459 -97.5646 517.751 186.305"
        stroke={`url(#${id})`}
        strokeOpacity="0.8"
        strokeWidth="75.1586"
      />
      <defs>
        <linearGradient
          id={id}
          x1="360.633"
          y1="100.233"
          x2="114.347"
          y2="447.815"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F9ECFF" />
          <stop offset="0.317308" stopColor="#DDCDFF" />
          <stop offset="1" stopColor="#9C7DFF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function BluePath({
  className,
  id = "blue-gradient",
}: {
  className?: string;
  id?: string;
}) {
  return (
    <svg
      viewBox="0 0 375 295"
      fill="none"
      overflow="visible"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M44.9006 7.09961C19.3765 159.379 258.401 281.176 360.269 244.736"
        stroke={`url(#${id})`}
        strokeOpacity="0.8"
        strokeWidth="85.8955"
      />
      <defs>
        <linearGradient
          id={id}
          x1="304.132"
          y1="213.664"
          x2="89.3288"
          y2="-31.4512"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F9ECFF" />
          <stop offset="0.365385" stopColor="#C3ECFF" />
          <stop offset="1" stopColor="#51E1FF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function RedPath({
  className,
  id = "red-gradient",
}: {
  className?: string;
  id?: string;
}) {
  return (
    <svg
      viewBox="0 0 280 186"
      fill="none"
      overflow="visible"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M233.847 5.61658C261.505 215.292 42.3966 308.315 42.9489 362.485"
        stroke={`url(#${id})`}
        strokeOpacity="0.8"
        strokeWidth="85.8956"
      />
      <defs>
        <linearGradient
          id={id}
          x1="142.717"
          y1="244.824"
          x2="257.459"
          y2="101.537"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F9ECFF" />
          <stop offset="0.634615" stopColor="#FCACD0" />
          <stop offset="1" stopColor="#FF70A4" />
        </linearGradient>
      </defs>
    </svg>
  );
}
