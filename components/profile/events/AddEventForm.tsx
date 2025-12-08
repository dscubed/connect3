"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { EventCategory, HostedEvent } from "@/types/events/event";
import { useAuthStore } from "@/stores/authStore";

interface AddEventFormProps {
  onSubmit: (event: Omit<HostedEvent, 'id' | "push">) => void;
  onCancel: () => void;
}

export default function AddEventForm({  onSubmit, onCancel }: AddEventFormProps) {
  const { user } = useAuthStore();

  // maybe redirect elsewhere
  if (!user) return;

  const [name, setName] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<EventCategory[]>([]);
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  const categories: EventCategory[] = [
    "networking",
    "study",
    "fun",
    "workshop",
    "competition",
    "panel",
    "miscellaneous"
  ] as const;

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
  }, []);

  const handleTypeChange = (category: EventCategory, checked: boolean) => {
    if (checked) {
      setType([...type, category]);
    } else {
      setType(type.filter(t => t !== category));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({
        creator_profile_id: user.id,
        name,
        start: new Date(start),
        end: new Date(end),
        description,
        type,
        thumbnailUrl: thumbnailUrl || undefined,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Event Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="Enter event name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="start">Start Date & Time</Label>
        <Input
          id="start"
          type="datetime-local"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="end">End Date & Time</Label>
        <Input
          id="end"
          type="datetime-local"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          required
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
              />
              <Label htmlFor={category} className="capitalize">
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit">Add Event</Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}