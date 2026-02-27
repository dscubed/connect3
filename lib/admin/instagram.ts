export interface StatusConfig {
  label: string;
  bg: string;
  text: string;
}

export const STATUS_CONFIG: Record<string, StatusConfig> = {
  queued: { label: "Queued", bg: "bg-gray-100", text: "text-gray-600" },
  in_progress: {
    label: "In Progress",
    bg: "bg-purple-100",
    text: "text-purple-700",
  },
  completed: { label: "Completed", bg: "bg-green-100", text: "text-green-700" },
  failed: { label: "Failed", bg: "bg-red-100", text: "text-red-700" },
  paused: { label: "Paused", bg: "bg-yellow-100", text: "text-yellow-700" },
};
