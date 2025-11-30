export type Event = {
    eventId: number;
    name: string; 
    start: Date;
    end: Date; 
    description: string; 
    links: string[];
    category: EventCategory[];
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