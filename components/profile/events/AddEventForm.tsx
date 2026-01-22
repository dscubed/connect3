"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/TextArea";
import {
  EventCategory,
  HostedEvent,
  EventPricing,
  EventLocationType,
  EventCity,
} from "@/types/events/event";
import { useAuthStore } from "@/stores/authStore";
import CollaboratorForm from "./CollaboratorForm";

interface AddEventFormProps {
  onSubmit: (event: Omit<HostedEvent, "id" | "push">) => void;
  onCancel: () => void;
}

export default function AddEventForm({ onCancel }: AddEventFormProps) {
  const { user } = useAuthStore();
  const [name, setName] = useState<string>("");
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [type, setType] = useState<EventCategory[]>([]);
  const [collaborators, setCollaborators] = useState<
    { id: string; name: string }[]
  >([]);
  const [bookingLinks, setBookingLinks] = useState<string[]>([""]);
  const [pricing, setPricing] = useState<EventPricing>("free");
  const [cities, setCities] = useState<EventCity[]>([]);
  const [locationType, setLocationType] =
    useState<EventLocationType>("physical");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onCancel]);

  const categories: EventCategory[] = [
    "networking",
    "study",
    "fun",
    "workshop",
    "competition",
    "panel",
    "miscellaneous",
  ] as const;

  const eventCities: EventCity[] = [
    "melbourne",
    "sydney",
    "perth",
    "canberra",
    "adelaide",
    "gold-coast",
    "newcaste",
    "hobart",
    "brisbane",
    "darwin",
    "geelong",
  ] as const;

  const handleTypeChange = (category: EventCategory, checked: boolean) => {
    if (checked) {
      setType([...type, category]);
    } else {
      setType(type.filter((t) => t !== category));
    }
  };

  const handleCityChange = (city: EventCity, checked: boolean) => {
    if (checked) {
      setCities([...cities, city]);
    } else {
      setCities(cities.filter((c) => c !== city));
    }
  };

  const handleBookingLinkChange = (index: number, value: string) => {
    const newLinks = [...bookingLinks];
    newLinks[index] = value;
    setBookingLinks(newLinks);
  };

  const addBookingLinkField = () => {
    setBookingLinks([...bookingLinks, ""]);
  };

  const removeBookingLinkField = (index: number) => {
    if (bookingLinks.length > 1) {
      const newLinks = bookingLinks.filter((_, i) => i !== index);
      setBookingLinks(newLinks);
    }
  };

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        collaborators: collaborators.map((c) => c.id),
        booking_link: bookingLinks.filter((link) => link.trim() !== ""),
        pricing,
        city: cities,
        location_type: locationType,
      };
      console.log("Submitting event data:", eventData);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 border rounded bg-white/[0.03] border-white/[0.08]"
    >
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
      <div className="grid grid-cols-2 gap-2">
        <div>
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
        <div>
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
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
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
        <div>
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
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          onChange={(e) => setDescription(e.target.value)}
          required
          disabled={isSubmitting}
          value={description}
          placeholder="Enter event description"
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
                onCheckedChange={(checked) =>
                  handleTypeChange(category, checked as boolean)
                }
                disabled={isSubmitting}
              />
              <Label htmlFor={category} className="capitalize">
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Links Section */}
      <div className="grid gap-2">
        <Label>Booking Links</Label>
        {bookingLinks.map((link, index) => (
          <div key={index} className="flex gap-2 items-center">
            <Input
              type="url"
              placeholder="https://eventbrite.com.au/"
              value={link}
              onChange={(e) => handleBookingLinkChange(index, e.target.value)}
              disabled={isSubmitting}
            />
            {bookingLinks.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeBookingLinkField(index)}
                disabled={isSubmitting}
              >
                Remove
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addBookingLinkField}
          disabled={isSubmitting}
        >
          Add Another Booking Link
        </Button>
      </div>

      {/* Pricing Section */}
      <div className="grid gap-2">
        <Label>Pricing</Label>
        <RadioGroup
          value={pricing}
          onValueChange={(value: EventPricing) => setPricing(value)}
          className="flex space-x-4"
          disabled={isSubmitting}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="free" id="free" />
            <Label htmlFor="free">Free</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="paid" id="paid" />
            <Label htmlFor="paid">Paid</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Cities Section */}
      <div className="grid gap-2">
        <Label>Cities</Label>
        <div className="flex flex-wrap gap-2">
          {eventCities.map((city) => (
            <div key={city} className="flex items-center space-x-2">
              <Checkbox
                id={city}
                checked={cities.includes(city)}
                onCheckedChange={(checked) =>
                  handleCityChange(city, checked as boolean)
                }
                disabled={isSubmitting}
              />
              <Label htmlFor={city} className="capitalize">
                {city.replace("-", " ")}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Location Type Section */}
      <div className="grid gap-2">
        <Label>Location Type</Label>
        <RadioGroup
          value={locationType}
          onValueChange={(value: EventLocationType) => setLocationType(value)}
          className="flex space-x-4"
          disabled={isSubmitting}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="physical" id="physical" />
            <Label htmlFor="physical">Physical</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="virtual" id="virtual" />
            <Label htmlFor="virtual">Virtual</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Collaborators Form */}
      <CollaboratorForm
        collaborators={collaborators}
        setCollaborators={setCollaborators}
        disabled={isSubmitting}
      />

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add Event"}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
