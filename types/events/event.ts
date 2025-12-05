export type HostedEvent = {
    push(arg0: { weight: number; id: number; name: string; start: Date; end: Date; description: string; type: EventCategory[]; thumbnailUrl?: string; }): unknown;
    id: number;
    name: string; 
    start: Date;
    end: Date; 
    description: string; 
    type: EventCategory[];
    thumbnailUrl?: string;
    creator_profile_id: string;
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