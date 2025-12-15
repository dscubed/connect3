import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";
import AddEventForm from "./AddEventForm";
import { useAuthStore } from "@/stores/authStore";
import { HostedEvent } from "@/types/events/event";

export default function EventFormHeader() {
  const { makeAuthenticatedRequest } = useAuthStore();
  const [addingEvent, setAddingEvent] = useState<boolean>(false);

  const handleAddButtonClick = () => {
    setAddingEvent(true);
  }

  const handleFormCancel = () => {
    setAddingEvent(false);
  }

  const handleFormSubmit = async (eventData: Omit<HostedEvent, 'id' | "push">) => {
    const eventId = crypto.randomUUID();
    const response = await makeAuthenticatedRequest(`/api/events/${eventId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    if (response.ok) {
      console.log("Event created successfully!");
      handleFormCancel();
    } else {
      console.error("Failed to create event:", response.status);
    }
  }

  return (
    <motion.div
      className={`w-full py-2 ${
        !addingEvent ? "hover:bg-white/5" : ""
      } transition-all rounded-lg group`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0 }}
    >
      {addingEvent ? 
        <div className="flex flex-col gap-2 w-full">
          {/* event form */}
          <AddEventForm onSubmit={handleFormSubmit} onCancel={handleFormCancel} />
        </div>
       :
        // header
        <button className="w-full flex items-center justify-between group" onClick={handleAddButtonClick}>
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-semibold text-white/90">
              Add Event
            </h3>
            <span className="text-sm text-white/50 bg-white/10 px-3 py-1 rounded-full">
              <Plus className="h-5 w-5 text-white/50 group-hover:text-white/70 transition-colors" />
            </span>
          </div>
        </button>
      }
    </motion.div>
  )
}
