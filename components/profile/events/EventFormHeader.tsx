import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";
import AddEventForm from "./AddEventForm";
import { useAuthStore } from "@/stores/authStore";
import { HostedEvent } from "@/types/events/event";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function EventFormHeader() {
  const { makeAuthenticatedRequest } = useAuthStore();
  const [addingEvent, setAddingEvent] = useState<boolean>(false);

  const handleFormCancel = () => {
    setAddingEvent(false);
  };

  const handleFormSubmit = async (
    eventData: Omit<HostedEvent, "id" | "push">
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
      }
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
      }
    );

    if (vectorStoreResponse.ok) {
      console.log("Added event to vector store");
    } else {
      toast.error("Failed to add event to vector store");
    }
  };

  return (
    <motion.div
      className={`w-full py-2 ${
        !addingEvent ? "hover:bg-white/5" : ""
      } transition-all rounded-lg group`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0 }}
    >
      <Sheet onOpenChange={setAddingEvent} open={addingEvent}>
        <SheetTrigger asChild>
          <button className="w-full flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-semibold">Add Event</h3>
              <span className="text-sm px-3 py-1 rounded-full">
                <Plus className="h-5 w-5 text-muted/70 group-hover:text-muted transition-colors" />
              </span>
            </div>
          </button>
        </SheetTrigger>
        <SheetContent
          hideCloseButton
          side="bottom"
          className="flex flex-col items-center pt-12"
        >
          <div className="flex justify-center max-w-3xl w-full pt-12 px-12 max-h-[60vh] overflow-y-auto scrollbar-hide">
            <AddEventForm
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
            />
          </div>
        </SheetContent>
      </Sheet>
    </motion.div>
  );
}
