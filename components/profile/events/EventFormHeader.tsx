import { AnimatePresence, motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import AddEventForm from "./AddEventForm";
import { useAuthStore } from "@/stores/authStore";
import type { CreateEventBody } from "@/lib/schemas/api/events";
import { toast } from "sonner";

export default function EventFormHeader() {
  const { makeAuthenticatedRequest } = useAuthStore();
  const [addingEvent, setAddingEvent] = useState<boolean>(false);
  const [sheetHeight, setSheetHeight] = useState<number | null>(null);
  const boundsRef = useRef<{ min: number; max: number }>({ min: 0, max: 0 });
  const dragStartRef = useRef<{ y: number; height: number }>({
    y: 0,
    height: 0,
  });

  useEffect(() => {
    if (!addingEvent) {
      return;
    }
    const { style } = document.body;
    const prevOverflow = style.overflow;
    const prevPaddingRight = style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      style.overflow = prevOverflow;
      style.paddingRight = prevPaddingRight;
    };
  }, [addingEvent]);

  useEffect(() => {
    if (!addingEvent) {
      return;
    }

    const updateBounds = () => {
      const viewportHeight = window.innerHeight;
      const min = Math.round(viewportHeight * 0.35);
      const max = Math.round(viewportHeight * 0.9);
      boundsRef.current = { min, max };
      setSheetHeight((prev) => {
        const fallback = Math.round(viewportHeight * 0.7);
        const next = prev ?? fallback;
        return Math.min(Math.max(next, min), max);
      });
    };

    updateBounds();
    window.addEventListener("resize", updateBounds);
    return () => window.removeEventListener("resize", updateBounds);
  }, [addingEvent]);

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

      <AnimatePresence>
        {addingEvent && (
          <>
            <motion.button
              type="button"
              aria-label="Close add event panel"
              className="fixed inset-0 z-40 bg-transparent"
              onClick={handleFormCancel}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="fixed inset-x-0 bottom-0 z-50"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
            >
              <div
                className="flex w-full flex-col rounded-t-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl"
                style={
                  sheetHeight
                    ? { height: `${sheetHeight}px` }
                    : { height: "70vh" }
                }
              >
                <motion.div
                  className="flex items-center justify-center pt-3 cursor-grab active:cursor-grabbing"
                  drag="y"
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={0}
                  dragMomentum={false}
                  onDragStart={(_, info) => {
                    dragStartRef.current = {
                      y: info.point.y,
                      height: sheetHeight ?? boundsRef.current.min,
                    };
                  }}
                  onDrag={(_, info) => {
                    const delta = dragStartRef.current.y - info.point.y;
                    const { min, max } = boundsRef.current;
                    const nextHeight = dragStartRef.current.height + delta;
                    setSheetHeight(
                      Math.min(Math.max(nextHeight, min), max),
                    );
                  }}
                >
                  <div className="h-1.5 w-12 rounded-full bg-slate-200" />
                </motion.div>
                <div className="flex items-center justify-between px-4 pt-3">
                  <div className="flex flex-col">
                    <span className="text-sm text-slate-500">
                      Create Event
                    </span>
                    <span className="text-lg font-semibold">Event Details</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleFormCancel}
                    className="rounded-full p-2 text-slate-500 hover:text-slate-900 transition-colors"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 pt-2">
                  <AddEventForm
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
