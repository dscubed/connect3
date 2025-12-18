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