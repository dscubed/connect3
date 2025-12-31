/**
 * Represent a 
 */
export type HostedEvent = {
    // needed for reduce method
    push(arg0: { weight: number; id: number; name: string; start: Date; end: Date; description: string; type: EventCategory[]; thumbnailUrl?: string; }): unknown;
    id: string;
    name: string;
    start: Date;
    end: Date;
    description: string;
    type: EventCategory[];
    thumbnailUrl?: string;
    creator_profile_id: string;
    collaborators?: string[];
    booking_link: string[];
    pricing: EventPricing;
    city: EventCity[];
    location_type: EventLocationType;
    university?: string[];
}

// could change to a way that users can add their own categories but 
// that seems like a bad idea
export type EventCategory = "networking" | 
                            "study" | 
                            "fun" | 
                            "workshop" | 
                            "competition" | 
                            "panel" |
                            "miscellaneous"
                        
export type EventPricing  = "free" | "paid"
export type EventLocationType = "virtual" | "physical"
export type EventCity = "melbourne" |
                        "sydney" |
                        "perth" |
                        "canberra" |
                        "adelaide" |
                        "gold-coast" |
                        "newcaste" |
                        "hobart" |
                        "brisbane" |
                        "darwin" |
                        "geelong"

export type EventFilePricing = {
  type: "free";
} | {
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
};