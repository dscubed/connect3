export const eventQueries = {
  queries: [
    {
      query: "Are there any networking events this week?",
      response: {
        result:
          "Yes! I found several networking events happening this week that match your interests.",
        matches: [
          {
            user_id: "demo23",
            files: [
              {
                file_id: "23",
                description:
                  "Thursday 6PM - Tech industry networking with alumni and recruiters",
              },
            ],
          },
          {
            user_id: "demo24",
            files: [
              {
                file_id: "24",
                description:
                  "Friday 7PM - Entrepreneurship networking event with investor panel",
              },
            ],
          },
        ],
        followUps:
          "Would you like me to help you RSVP to any of these events or find more networking opportunities?",
      },
    },
    {
      query: "Any upcoming math/AI competitions?",
      response: {
        result:
          "Great timing! There are several exciting competitions coming up that you can participate in.",
        matches: [
          {
            user_id: "demo25",
            files: [
              {
                file_id: "25",
                description:
                  "National AI hackathon - registration closes next week",
              },
            ],
          },
          {
            user_id: "demo26",
            files: [
              {
                file_id: "26",
                description:
                  "Team-based math competition with real-world problem solving",
              },
            ],
          },
        ],
        followUps:
          "Want help forming a team for these competitions or getting more details about registration?",
      },
    },
    {
      query: "Are there any events today that offers free coffee?",
      response: {
        result:
          "Coffee lover detected! ☕ Here are today's events with free refreshments.",
        matches: [
          {
            user_id: "demo27",
            files: [
              {
                file_id: "27",
                description:
                  "2PM - Career services info session with free coffee and pastries",
              },
            ],
          },
          {
            user_id: "demo28",
            files: [
              {
                file_id: "28",
                description:
                  "4PM - Student lounge hangout with free coffee and snacks",
              },
            ],
          },
        ],
        followUps:
          "Should I help you find the exact locations of these events or set reminders?",
      },
    },
    {
      query: "What events are happening today related to AI?",
      response: {
        result:
          "Perfect timing! There are several AI-focused events happening today.",
        matches: [
          {
            user_id: "demo29",
            files: [
              {
                file_id: "29",
                description:
                  "3PM - Professor's talk on latest developments in machine learning",
              },
            ],
          },
          {
            user_id: "demo30",
            files: [
              {
                file_id: "30",
                description:
                  "5PM - Interactive discussion on responsible AI development",
              },
            ],
          },
        ],
        followUps:
          "Want to register for these events or find out about recurring AI meetups?",
      },
    },
    {
      query: "Which workshops are good for learning Python?",
      response: {
        result:
          "Excellent choice! I found beginner-friendly Python workshops that are highly recommended.",
        matches: [
          {
            user_id: "demo31",
            files: [
              {
                file_id: "31",
                description:
                  "Weekly 2-hour workshops covering Python fundamentals to advanced topics",
              },
            ],
          },
          {
            user_id: "demo32",
            files: [
              {
                file_id: "32",
                description:
                  "Peer-led Python practice sessions with hands-on projects",
              },
            ],
          },
        ],
        followUps:
          "Should I help you register for the next workshop or connect you with Python study groups?",
      },
    },
  ],
};
