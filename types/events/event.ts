export type HostedEvent = {
    id: number;
    name: string; 
    start: Date;
    end: Date; 
    description: string; 
    type: EventCategory[];
    thumbnailUrl?: string;
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