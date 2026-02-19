import { Event, Location } from "@/lib/schemas/events/event";

// Export the HostedEvent type based on the schema
export type HostedEvent = Omit<Event, 'location'> & {
  location: Location;
};

// Export other types as needed
export type EventPricing = "free" | "paid";
export type EventLocationType = "virtual" | "physical";
export type EventCity = string;

export type EventFilePricing =
  | {
      type: "free";
    }
  | {
      type: "paid";
      min?: number;
      max?: number;
      currency?: string;
    };

export type EventFileAttributes = {
  university: string[];
  start_time: number;
  end_time: number;
  pricing: EventFilePricing;
  city: EventCity[];
};

export type EventFile = {
  id: string;
  event_name: string;
  organisers: {
    creator: string;
    collaborators: string[];
  };
  time: {
    start: number;
    end: number;
  };
  location: {
    city: EventCity[];
    venue?: string;
    location_type: EventLocationType;
  };
  pricing: EventFilePricing;
  description: string;
  type?: EventCategory[];
  thumbnail_url?: string;
  booking_links?: string[];
  attributes: EventFileAttributes;
  universities: string[];
};

// Define the EventCategory type as a union of strings
export type EventCategory = "networking" | "study" | "fun" | "workshop" | "competition" | "panel" | "miscellaneous";
