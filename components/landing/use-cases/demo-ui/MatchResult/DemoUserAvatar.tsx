export default function DemoUserAvatar({
  avatarUrl,
  fullName,
  size = "sm",
}: {
  avatarUrl?: string;
  fullName: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  console.log("Avatar URL:", avatarUrl);
  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold ${textSizeClasses[size]}`}
    >
      {fullName?.[0] || "U"}
    </div>
  );
}
