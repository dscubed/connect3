import Image from "next/image";

export function UmsuIcon({ className }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden ${className ?? ""}`}
      style={{ width: "1em", height: "1em" }}
    >
      <Image
        src="/umsu-logo.png"
        alt="UMSU"
        width={80}
        height={80}
        className="absolute"
        style={{
          objectFit: "none",
          objectPosition: "-2px -2px",
          transform: "scale(0.38)",
          transformOrigin: "top left",
        }}
      />
    </div>
  );
}
