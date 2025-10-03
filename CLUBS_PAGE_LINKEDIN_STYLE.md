# Clubs Page - LinkedIn-Style UI Implementation

## Overview
The clubs page has been redesigned with a LinkedIn Jobs-style interface where the sidebar remains visible, club cards are listed on the left, and detailed information appears on the right when a club is selected.

## Layout Structure

### 1. **Sidebar** (Left - Persistent)
- The main navigation sidebar remains visible at all times
- Contains navigation to Home, Discover, Clubs, and other sections
- The Clubs navigation link routes to `/clubs-page`

### 2. **Club List Panel** (Middle - 450px width)
- Displays all available clubs as compact cards
- Each card shows:
  - Club logo (colored square with Building2 icon)
  - Club name
  - Tagline
  - First 2 focus areas (with "+X more" badge)
- Cards are clickable and highlight when selected
- Scrollable list with smooth animations

### 3. **Club Details Panel** (Right - Full remaining width)
- Shows comprehensive information about the selected club
- Smooth slide-in animation when switching clubs
- Scrollable content area

## Club Data Structure

Each club includes:
- **Basic Info**: name, tagline, description, fullDescription
- **Focus Areas**: Array of key topics/interests
- **Activities**: List of events and programs
- **Goals**: Club objectives and mission
- **Leadership**: President, Secretary, Treasurer (optional)
- **Contact**: Email and physical address
- **Links**: Official website and UMSU club page
- **Branding**: Color theme and gradient for visual identity
- **Established**: Founding year

## Featured Clubs

### 1. **HackMelbourne**
- **Color**: Black (`bg-black`)
- **Gradient**: Gray to black
- **Focus**: Hackathons, Software Development, Innovation
- **Website**: https://hack.melbourne/
- **UMSU**: https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/hackmelbourne/
- **Est**: 2015

### 2. **Melbourne Information Security Club (MISC)**
- **Color**: Blue (`bg-blue-600`)
- **Gradient**: Blue shades
- **Focus**: Cybersecurity, CTF Competitions, Ethical Hacking
- **UMSU**: https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/7902/
- **Est**: 2017

### 3. **RAID**
- **Color**: Purple (`bg-purple-600`)
- **Gradient**: Purple to indigo
- **Focus**: AI Ethics, Responsible AI Development, Machine Learning
- **Website**: https://www.raidmelb.au/
- **UMSU**: https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/6573/
- **Est**: 2023

### 4. **DSCubed**
- **Color**: Cyan (`bg-cyan-600`)
- **Gradient**: Cyan to blue
- **Focus**: Data Science, Machine Learning, Social Impact
- **Website**: https://www.dscubed.org.au/
- **UMSU**: https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/dscubed/
- **Est**: 2018

## UI Features

### Responsive Design
- Desktop: Three-column layout (Sidebar | Club List | Details)
- Mobile: Stacked layout with full-width panels

### Animations
- Framer Motion for smooth transitions
- Slide-in animation for detail panel
- Fade-in for club cards
- Hover effects on clickable elements

### Visual Design
- Dark theme with glassmorphism effects
- Color-coded clubs for easy identification
- Consistent border radius and spacing
- Icon-based section headers
- Smooth scrolling with hidden scrollbars

### Information Architecture
1. **Header** - Club logo, name, tagline, established date
2. **About** - Full description
3. **Focus Areas** - Badges showing key topics
4. **What We Do** - Activities list
5. **Our Goals** - Mission and objectives
6. **Leadership Team** - Executive members (if available)
7. **Get In Touch** - Contact information
8. **Links** - External resources (website, UMSU page)

## User Experience

### Selection Flow
1. User clicks on "Clubs" in the sidebar
2. Page loads with 4 clubs listed on the left
3. First club (HackMelbourne) is selected by default
4. User clicks any club card to view its details
5. Right panel animates to show selected club info
6. User can scroll through detailed information
7. External links open in new tabs

### Interaction States
- **Default**: Light background, subtle border
- **Hover**: Brighter background, stronger border
- **Selected**: White glow effect, bold border

## Technical Implementation

### Components
- `ClubsPage` - Main page component with layout
- `ClubListCard` - Compact club card for left panel
- `ClubDetailPanel` - Comprehensive club information panel

### State Management
- `selectedClub` state tracks currently viewed club
- Clicking a card updates the selected club
- AnimatePresence handles smooth transitions

### Styling
- Tailwind CSS utility classes
- Custom gradients for each club
- Responsive breakpoints (md, lg)
- Custom scrollbar hiding

## Adding New Clubs

To add a new club, append to the `clubsData` array with this structure:

```typescript
{
  id: "unique-club-id",
  name: "Club Name",
  tagline: "Short catchy phrase",
  description: "Brief one-liner",
  fullDescription: "Comprehensive paragraph about the club",
  focus: ["Topic 1", "Topic 2", "Topic 3"],
  activities: ["Activity 1", "Activity 2"],
  goals: ["Goal 1", "Goal 2"],
  leadership: { // Optional
    president: "Name",
    secretary: "Name",
    treasurer: "Name"
  },
  contact: {
    address: "Physical location",
    email: "email@example.com"
  },
  links: {
    website: "https://website.com",
    umsu: "https://umsu.unimelb.edu.au/..."
  },
  color: "bg-color-600", // Tailwind class
  bgGradient: "from-color-600 via-color-700 to-color-800",
  established: "2024"
}
```

## File Location
`app/clubs-page/page.tsx`

## Dependencies
- React
- Framer Motion (animations)
- Lucide React (icons)
- Next.js Link component
- Sidebar component

## Future Enhancements
- Search and filter functionality
- Category filtering by focus areas
- Join/Follow club buttons
- Integration with authentication
- Member count display
- Upcoming events section
- Photo galleries for each club
- Real-time availability status
