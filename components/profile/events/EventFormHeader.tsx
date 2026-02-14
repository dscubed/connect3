import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";
import EventFormSheet from "./EventFormSheet";
import { useAuthStore } from "@/stores/authStore";
import type { CreateEventBody } from "@/lib/schemas/api/events";
import { toast } from "sonner";

export default function EventFormHeader({
  variant = "default",
}: {
  variant?: "default" | "compact";
}) {
  const { makeAuthenticatedRequest } = useAuthStore();
  const [addingEvent, setAddingEvent] = useState<boolean>(false);

  const handleAddButtonClick = () => {
    setAddingEvent(true);
  };

  const handleFormCancel = () => {
    setAddingEvent(false);
  };

  const handleFormSubmit = async (
    eventData: Omit<CreateEventBody, "id">,
  ) => {
    const eventId = crypto.randomUUID();

    // create event in database
    const dbResponse = await makeAuthenticatedRequest(
      `/api/events/${eventId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      },
    );

    if (dbResponse.ok) {
      toast.success("Successfully added event");
      // optimistically update ui by closing form while vector store is being populated
      handleFormCancel();
    } else {
      toast.error("Failed to create event");
      return;
    }

    const vectorStoreResponse = await makeAuthenticatedRequest(
      `/api/vector-store/events/${eventId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      },
    );

    if (vectorStoreResponse.ok) {
      console.log("Added event to vector store");
    } else {
      toast.error("Failed to add event to vector store");
    }
  };

  return (
    <>
      {variant === "compact" ? (
        <button
          type="button"
          onClick={handleAddButtonClick}
          className="inline-flex items-center gap-2 rounded-full border border-muted/40 px-3 py-1 text-sm font-medium text-muted transition-colors hover:text-card-foreground"
        >
          Add Event
          <Plus className="h-4 w-4" />
        </button>
      ) : (
        <motion.div
          className="w-full py-2 transition-all rounded-lg group hover:bg-white/5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0 }}
        >
          <button
            className="w-full flex items-center justify-between group"
            onClick={handleAddButtonClick}
          >
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-semibold">Add Event</h3>
              <span className="text-sm px-3 py-1 rounded-full">
                <Plus className="h-5 w-5 text-muted/70 group-hover:text-muted transition-colors" />
              </span>
            </div>
          </button>
        </motion.div>
      )}

      <EventFormSheet
        open={addingEvent}
        onOpenChange={setAddingEvent}
        onSubmit={handleFormSubmit}
        submitLabel="Add Event"
        modeLabel="Create Event"
        formKey="create-event"
      />
    </>
  );
}
