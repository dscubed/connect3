export const eventQueries = {
  queries: [
    {
      query: "Are there any networking events this week?",
      response: {
        result:
          "Yes! This week at UniMelb: Wednesday - Atlassian Tech Talk & Networking (5-7pm, Doug McDonell Building), hosted by WIRED student club, free pizza and career Q&A. Thursday - Commerce & Computing Career Night with panels from CommBank, NAB, and Seek (6-8pm, Student Union). Friday - Melbourne Tech Meetup at Electron Workshop (7-9pm) connecting students with startup founders. Saturday - CISSA Networking Breakfast with alumni from Google, Canva, and REA Group (9am, University House).",
        matches: [
          {
            files: [
              {
                file_id: "file-event-networking-1",
                description:
                  "Atlassian Tech Talk Wed May 15 - Engineers from Atlassian Sydney discussing cloud infrastructure, Jira development, career pathways. Open to all students, bring resume for networking session after talk.",
              },
              {
                file_id: "file-event-networking-2",
                description:
                  "CISSA Alumni Networking - Connect with 20+ alumni working at top tech companies in Melbourne and Sydney. Topics: internship tips, graduate programs 2025-2026, visa sponsorship for international students.",
              },
            ],
            user_id: "event-club-wired",
          },
        ],
        followUps:
          "Would you like to RSVP for any of these events or get location details?",
      },
    },
    {
      query: "Any upcoming math/AI competitions?",
      response: {
        result:
          "Several exciting competitions coming up! Melbourne Datathon (July 20-21) - team competition with $5k prize, sponsored by Quantium. Google HashCode (March) - global coding competition, practice sessions run by MUCIS. ICPC (International Collegiate Programming Contest) - qualifier in August, training sessions every Tuesday. MathWorks Math Modeling Challenge (February-March). Australian Mathematical Olympiad for university students. Many comps offer internship fast-tracks at sponsor companies.",
        matches: [
          {
            files: [
              {
                file_id: "file-comp-ai-1",
                description:
                  "Melbourne Datathon 2025 - Australia's largest student data science competition. Teams of 3-4 work on real datasets from Australian companies. Past sponsors: Quantium, Commonwealth Bank, Data61. Winners get internship interviews.",
              },
              {
                file_id: "file-comp-ai-2",
                description:
                  "ICPC Training @ UniMelb - Weekly competitive programming sessions preparing for International Collegiate Programming Contest. Covers algorithms, data structures, dynamic programming. Coach: Dr. Tim Baldwin (former Google researcher).",
              },
            ],
            user_id: "event-comp-math-ai",
          },
        ],
        followUps:
          "Want to join a competition team or attend training sessions?",
      },
    },
    {
      query: "Are there any events today that offers free coffee?",
      response: {
        result:
          "Today's free coffee/food events: 10am - Faculty of Science morning tea in Bio21 (coffee, pastries). 12pm - Commerce Student Society BBQ on South Lawn (free sausage sizzle, soft drinks). 2pm - Engineering Club afternoon tea in Melbourne Connect building. 4pm - Law Students' Society coffee cart at Law Building entrance. 5pm - Graduate Student Association wine & cheese in grad lounge. 6pm - Most club events at night include free pizza/drinks!",
        matches: [
          {
            files: [
              {
                file_id: "file-event-food-1",
                description:
                  "Commerce Student Society events - Free BBQ every Wednesday during semester, networking opportunity, meet students from different years and courses. Located South Lawn 12-2pm.",
              },
              {
                file_id: "file-event-food-2",
                description:
                  "Engineering Club 'Caffeine & Code' - Free coffee and cookies every Thursday 2pm, casual coding sessions, homework help, social time. Melbourne Connect Building Level 3.",
              },
            ],
            user_id: "event-student-life",
          },
        ],
        followUps:
          "Want the Facebook event links or a weekly free food calendar?",
      },
    },
    {
      query: "What events are happening today related to AI?",
      response: {
        result:
          "Today's AI events at UniMelb: 1pm - 'Intro to Large Language Models' workshop by DSCubed in Doug McDonell Room 231 (hands-on GPT-4 API tutorial). 3pm - AI Ethics Discussion Panel with Melbourne Law School and Computing faculty in Redmond Barry Building. 5pm - Computer Vision Research Showcase by PhD students in Ormond College. 7pm - AI Startup Pitch Night at Melbourne Connect - student founders presenting AI projects, judges from Blackbird VC and Airtree.",
        matches: [
          {
            files: [
              {
                file_id: "file-event-ai-1",
                description:
                  "DSCubed LLM Workshop - Learn to build chatbots with OpenAI API, RAG systems, prompt engineering. Bring laptop with Python installed. Beginner-friendly, no ML background needed. Free for members.",
              },
              {
                file_id: "file-event-ai-2",
                description:
                  "AI Startup Pitch Night - Watch student teams pitch AI/ML startups. Categories: healthtech, edtech, fintech. Network with VCs, accelerator mentors from Melbourne Accelerator Program (MAP). Free entry, registration required.",
              },
            ],
            user_id: "event-ai-community",
          },
        ],
        followUps:
          "Interested in registering for the LLM workshop or pitch night?",
      },
    },
    {
      query: "Which workshops are good for learning Python?",
      response: {
        result:
          "Great Python workshops at UniMelb! **Beginner:** DSSS 'Python Foundations' series (4 weeks, starts Feb/July), covers basics to pandas/numpy. **Intermediate:** WIRED 'Web Dev with Django/Flask' (March), builds full-stack apps. **Advanced:** Research Computing Services workshops on scientific Python (scipy, matplotlib) for data analysis. **Specific:** Finance Society 'Python for Trading' workshop, uses real ASX data. All free for students, materials provided, bring laptop.",
        matches: [
          {
            files: [
              {
                file_id: "file-workshop-python-1",
                description:
                  "DSSS Python Foundations - Week 1: variables, loops, functions. Week 2: data structures, file handling. Week 3: pandas for data analysis. Week 4: data visualization with matplotlib. Includes practice datasets and projects.",
              },
              {
                file_id: "file-workshop-python-2",
                description:
                  "Research Computing Python Bootcamp - Intensive 2-day workshop during semester break. Covers NumPy, SciPy, Pandas, machine learning basics with scikit-learn. Certificate of completion. Used by 500+ research students annually.",
              },
            ],
            user_id: "event-skills-workshops",
          },
        ],
        followUps:
          "What's your current Python level? I can recommend the best workshop for you.",
      },
    },
  ],
};
