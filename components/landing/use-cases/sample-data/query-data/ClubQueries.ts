export const clubQueries = {
  queries: [
    {
      query: "What clubs should I join if I want to become a data scientist?",
      response: {
        result:
          "Perfect question! Here are the most relevant clubs for aspiring data scientists at UniMelb.",
        matches: [
          {
            user_id: "demo13",
            files: [
              {
                file_id: "13",
                description:
                  "President of Data Science Student Society - runs workshops and industry talks",
              },
            ],
          },
          {
            user_id: "demo14",
            files: [
              {
                file_id: "14",
                description:
                  "VP of Analytics Club - organizes Kaggle competitions and networking events",
              },
            ],
          },
        ],
        followUps:
          "Would you like me to connect you with club leaders or find information about joining requirements?",
      },
    },
    {
      query: "Which clubs focus on sustainability?",
      response: {},
    },
    {
      query: "How do I join Data Science Student Society",
      response: {
        result: "Easy! Here's everything you need to know about joining DSSS.",
        matches: [
          {
            user_id: "demo17",
            files: [
              {
                file_id: "17",
                description:
                  "Data Science Student Society - membership info and upcoming events",
              },
            ],
          },
          {
            user_id: "demo18",
            files: [
              {
                file_id: "18",
                description:
                  "DSSS Membership Coordinator - can help with registration process",
              },
            ],
          },
        ],
        followUps:
          "Should I help you register for membership or connect you with current members to learn more?",
      },
    },
    {
      query: "Are there any cultural clubs for international students?",
      response: {
        result:
          "Absolutely! UniMelb has vibrant cultural communities for international students.",
        matches: [
          {
            user_id: "demo19",
            files: [
              {
                file_id: "19",
                description:
                  "Main hub for international students - cultural events and support",
              },
            ],
          },
          {
            user_id: "demo20",
            files: [
              {
                file_id: "20",
                description:
                  "Celebrates Asian cultures with festivals, food events, and cultural exchange",
              },
            ],
          },
        ],
        followUps:
          "Want to explore specific cultural clubs or get connected with students from your region?",
      },
    },
    {
      query: "Which students are good at competitive programming?",
      response: {
        result:
          "Found some amazing competitive programmers who excel in contests and can help with practice!",
        matches: [
          {
            user_id: "demo21",
            files: [
              {
                file_id: "21",
                description:
                  "ACM ICPC team member, expert in algorithms and data structures",
              },
            ],
          },
          {
            user_id: "demo22",
            files: [
              {
                file_id: "22",
                description:
                  "Codeforces expert, runs competitive programming study sessions",
              },
            ],
          },
        ],
        followUps:
          "Want to join practice sessions or get mentorship for specific competitive programming topics?",
      },
    },
  ],
};
