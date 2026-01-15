"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { SectionCard, SectionCardHeader } from "../SectionCard";
import { CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bookmark, Globe, MapPin, Plus, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AddEventFormProps {
  onSubmit: (event: Omit<HostedEvent, "id" | "push">) => void;
  onCancel: () => void;
}

export default function AddEventForm({
  onSubmit,
  onCancel,
}: AddEventFormProps) {
  const { user } = useAuthStore();
  const [name, setName] = useState<string>("");
  const [start, setStart] = useState<Date>();
  const [end, setEnd] = useState<Date>();
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
      await onSubmit(eventData);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 p-4 border rounded bg-transparent border-none w-full"
    >
      {/* Event Name */}
      <div className="grid gap-2">
        <Input
          id="name"
          type="text"
          placeholder="Event Name"
          className="!text-4xl border-none focus-visible:ring-0 shadow-none font-medium"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isSubmitting}
        />
      </div>

      {/* Event Description */}
      <SectionCard variant="events">
        <SectionCardHeader title="Description" />
        <CardContent className="w-full">
          <Textarea
            id="description"
            onChange={(e) => setDescription(e.target.value)}
            required
            disabled={isSubmitting}
            value={description}
            className="w-full resize-none focus-visible:ring-0 !border-none shadow-none !p-0 min-h-0"
            placeholder="Enter event description"
          />
        </CardContent>
      </SectionCard>

      {/* Event Dates */}
      <SectionCard variant="events">
        <SectionCardHeader title="Duration" />
        <CardContent className="w-full flex">
          {/* Inputs */}
          <div className="space-y-2">
            {/* Start Date and Time */}
            <div className="px-4 flex items-center gap-4">
              <Label className="flex w-24 text-base">Start</Label>
              {/* Date Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    data-empty={!start}
                    className="data-[empty=true]:text-muted-foreground w-28 min-w-28 max-w-28 justify-center text-center font-normal bg-background border-foreground rounded-xl text-black hover:text-black"
                  >
                    {start
                      ? new Date(start).toLocaleDateString("en-AU", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })
                      : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={start}
                    onSelect={setStart}
                  />
                </PopoverContent>
              </Popover>

              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                disabled={isSubmitting}
                className="bg-background rounded-xl border-foreground appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none !w-28 flex justify-center"
              />
            </div>
            {/* End Date and Time */}
            <div className="px-4 flex items-center gap-4">
              <Label className="flex w-24 text-base">End</Label>
              {/* Date Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    data-empty={!end}
                    className="data-[empty=true]:text-muted-foreground w-28 min-w-28 max-w-28 justify-center text-center font-normal bg-background border-foreground rounded-xl text-black hover:text-black"
                  >
                    {end
                      ? new Date(end).toLocaleDateString("en-AU", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })
                      : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={end} onSelect={setEnd} />
                </PopoverContent>
              </Popover>

              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                disabled={isSubmitting}
                className="bg-background rounded-xl border-foreground appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none !w-28 flex justify-center"
              />
            </div>
          </div>
        </CardContent>
      </SectionCard>

      {/* Cities + Location Section */}
      <SectionCard variant="events">
        <SectionCardHeader title="Location" />
        <CardContent className="w-full space-y-8 pt-2">
          {/* Location Type */}
          <div className="flex flex-row gap-8 w-fit">
            <Label className="text-base">Location Type</Label>
            <RadioGroup
              value={locationType}
              onValueChange={(value: EventLocationType) =>
                setLocationType(value)
              }
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

          {/* Cities Section */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex flex-row gap-2 w-fit">
                <MapPin />
                <p className={cities.length == 0 ? "text-muted" : ""}>
                  {cities.length == 0
                    ? "Select cities"
                    : cities
                        .map((city) => {
                          return city.replace(/^./, (char) =>
                            char.toUpperCase()
                          );
                        })
                        .join(", ")}
                </p>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="scrollbar-hide" align="end">
              <DropdownMenuLabel>Cities</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {eventCities.map((city) => (
                <DropdownMenuCheckboxItem
                  key={city}
                  checked={cities.includes(city)}
                  onCheckedChange={(checked) =>
                    handleCityChange(city, checked as boolean)
                  }
                  onSelect={(e) => e.preventDefault()}
                  className="capitalize"
                >
                  {city}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </SectionCard>

      {/* Booking Links Section */}
      <SectionCard variant="events">
        <SectionCardHeader title="Links" />
        <CardContent className="w-full">
          <div className="grid gap-4">
            {bookingLinks.map((link, index) => (
              <div
                key={index}
                className="flex gap-2 items-center bg-muted/10 !px-4 !py-2 rounded-xl"
              >
                <Globe />
                <Input
                  type="url"
                  placeholder="https://eventbrite.com.au/"
                  className="border-none shadow-none focus-visible:ring-0"
                  value={link}
                  onChange={(e) =>
                    handleBookingLinkChange(index, e.target.value)
                  }
                  disabled={isSubmitting}
                />
                {bookingLinks.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-muted hover:text-black !bg-transparent"
                    onClick={() => removeBookingLinkField(index)}
                    disabled={isSubmitting}
                  >
                    <Trash />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              className="border border-muted/50 text-muted hover:text-black !bg-transparent"
              size="sm"
              onClick={addBookingLinkField}
              disabled={isSubmitting}
            >
              <Plus />
            </Button>
          </div>
        </CardContent>
      </SectionCard>

      {/* Categories Section */}
      <SectionCard variant="events">
        <SectionCardHeader title="Categories" />
        <CardContent>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex flex-row gap-2 w-fit">
                <Bookmark />
                <div
                  className={cn(
                    "flex flex-row gap-2",
                    type.length == 0 && "text-muted"
                  )}
                >
                  {type.length == 0
                    ? "Select Categories"
                    : type.map((type) => {
                        return (
                          <Badge
                            key={type}
                            variant={"secondary"}
                            className="capitalize rounded-xl !bg-background px-3"
                          >
                            {type}
                          </Badge>
                        );
                      })}
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="scrollbar-hide" align="end">
              <DropdownMenuLabel>Categories</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {categories.map((category) => (
                <DropdownMenuCheckboxItem
                  key={category}
                  checked={type.includes(category)}
                  onCheckedChange={(checked) =>
                    handleTypeChange(category, checked as boolean)
                  }
                  onSelect={(e) => e.preventDefault()}
                  className="capitalize"
                >
                  {category}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </SectionCard>

      {/* Pricing Section */}
      <SectionCard variant="events">
        <SectionCardHeader title="Tags" />
        <CardContent>
          <div className="grid gap-3 grid-cols-3">
            <Label className="text-base">Pricing</Label>
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
        </CardContent>
      </SectionCard>

      {/* Collaborators Form */}
      <SectionCard variant="events">
        <SectionCardHeader title="Collaborators" />
        <CardContent className="w-full">
          <CollaboratorForm
            collaborators={collaborators}
            setCollaborators={setCollaborators}
            disabled={isSubmitting}
          />
        </CardContent>
      </SectionCard>

      <div className="flex gap-2 pb-12">
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
