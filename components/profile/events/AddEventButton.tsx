import { Plus } from "lucide-react";

export default function AddEventButton() {
  return (
    <button className="w-full flex items-center justify-between group" onClick={() => {}}>
      <div className="flex items-center gap-4">
        <h3 className="text-xl font-semibold text-white/90">
          Add Event
        </h3>
        <span className="text-sm text-white/50 bg-white/10 px-3 py-1 rounded-full">
          <Plus className="h-5 w-5 text-white/50 group-hover:text-white/70 transition-colors" />
        </span>
      </div>
    </button>
  )
  
}
