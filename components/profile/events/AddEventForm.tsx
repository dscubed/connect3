"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { EventCategory, HostedEvent } from "@/types/events/event";
import { useAuthStore } from "@/stores/authStore";
import CollaboratorForm from "./CollaboratorForm";

interface AddEventFormProps {
  onSubmit: (event: Omit<HostedEvent, 'id' | "push">) => void;
  onCancel: () => void;
}

export default function AddEventForm({ onSubmit, onCancel }: AddEventFormProps) {
    const { user } = useAuthStore();
    const [name, setName] = useState<string>("");
    const [start, setStart] = useState<string>("");
    const [end, setEnd] = useState<string>("");
    const [startTime, setStartTime] = useState<string>("");
    const [endTime, setEndTime] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [type, setType] = useState<EventCategory[]>([]);
    const [collaborators, setCollaborators] = useState<{id: string, name: string}[]>([]);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    // add file upload later

    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        switch (event.key) {
          case "Escape":
            event.preventDefault();
            onCancel();
            break;
          default:
            break;
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }, [onCancel]);

   const categories: EventCategory[] = [
     "networking",
     "study",
     "fun",
     "workshop",
     "competition",
     "panel",
     "miscellaneous"
   ] as const;

   const handleTypeChange = (category: EventCategory, checked: boolean) => {
     if (checked) {
       setType([...type, category]);
     } else {
       setType(type.filter(t => t !== category));
     }
   };

   if (!user) return null;

   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setIsSubmitting(true);
     
     try {
      const eventData = {
        creator_profile_id: user.id,
        name,
        start: new Date(`${start}T${startTime}`),
        end: new Date(`${end}T${endTime}`),
        description,
        type,
        collaborators: collaborators.map(c => c.id),
      };
      await onSubmit(eventData);
     } catch (error) {
       console.error("Error submitting form:", error);
     } finally {
       setIsSubmitting(false);
     }
   };

 return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded bg-white/[0.03] border-white/[0.08]">
      <div className="grid gap-2">
        <Label htmlFor="name">Event Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="Enter event name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isSubmitting}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="start">Start Date</Label>
        <Input
          id="start"
          type="date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          required
          disabled={isSubmitting}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="end">End Date</Label>
        <Input
          id="end"
          type="date"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          required
          disabled={isSubmitting}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="startTime">Start Time</Label>
        <Input
          id="startTime"
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
          disabled={isSubmitting}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="endTime">End Time</Label>
        <Input
          id="endTime"
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          required
          disabled={isSubmitting}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          type="text"
          placeholder="Enter event description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          disabled={isSubmitting}
        />
      </div>
      <div className="grid gap-2">
        <Label>Categories</Label>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={category}
                checked={type.includes(category)}
                onCheckedChange={(checked) => handleTypeChange(category, checked as boolean)}
                disabled={isSubmitting}
              />
              <Label htmlFor={category} className="capitalize">
                {category}
              </Label>
            </div>
          ))}
        </div>
       </div>

       {/* add collaborators form */}
      <CollaboratorForm collaborators={collaborators} setCollaborators={setCollaborators} disabled={isSubmitting} />
       <div className="flex gap-2">
         <Button type="submit" disabled={isSubmitting}>
           {isSubmitting ? 'Adding...' : 'Add Event'}
         </Button>
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
       </div>
     </form>
   );
 }
