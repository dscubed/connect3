# Connect3

Connect3 is a university social discovery platform built by DSCubed (Data Science Student Society). It's based in Australia and lets students search for people, clubs, and events across campuses using natural language.

## Who uses it

- Students looking for study groups, project partners, clubs, or just other people with similar interests.
- Clubs and societies that want to be found by new members.
- Event organisers getting the word out about hackathons, workshops, career fairs, and socials.

## Supported universities

| Key       | Full name                       | City      |
|-----------|---------------------------------|-----------|
| unimelb   | University of Melbourne         | Melbourne |
| monash    | Monash University               | Melbourne |
| rmit      | RMIT University                 | Melbourne |
| uwa       | University of Western Australia | Perth     |

There's also an "Other University" option for students whose institution isn't listed yet.

## Features

### AI search
Users type questions like "Find AI clubs at Melbourne" and the agent searches three vector stores:
- Users/Students, matched by skills, interests, name, background.
- Clubs/Organisations, matched by name, description, activities.
- Events, matched by type, topic, date, location.

When a university filter is active, results only come from those universities.

### Profiles
Students fill out profiles across 10 categories: Education, Experience, Languages, Skills, Projects, Certifications, Courses, Honors, Hobbies, and Volunteering.

Organisations have 5: Events, Recruitment, What We Do, Projects, and Perks.

Users can also upload a resume (PDF/DOCX/TXT) and it gets auto-parsed into profile sections. Profile data is indexed in the vector store so other users can find it through search.

### Clubs directory
A browsable list of student organisations with university filters and infinite scroll. On desktop there's a side-by-side detail view.

### Events feed
Campus events (workshops, hackathons, career fairs, socials, competitions) with dates and locations.

### Chatrooms
Each search creates a chatroom, a conversation thread where users can refine queries and ask follow-ups.

### Personality quiz
A 7-question quiz that helps match students by personality and interests.

## How search works

1. User submits a query through the search bar, optionally with a university filter.
2. A chatroom is created and the query is saved as a chat message.
3. The backend runs the Connect3 agent (OpenAI Agents SDK, GPT-5-mini).
4. The agent picks which tools to call: search_users, search_clubs, search_events, web_search, get_my_profile, or get_current_date.
5. Search tools hit OpenAI Vector Stores, filtered by university when applicable.
6. The agent writes a markdown response with entity markers.
7. Results stream to the user through Supabase Realtime.

## How the agent behaves

- It searches and connects. It does not give study tips, career advice, or pep talks.
- 1 good match is better than 3 weak ones. Max 3 results per response.
- Responses are short. Clarifying questions are shorter.
- It respects university filters and tells users when their filter excludes what they're asking about.
