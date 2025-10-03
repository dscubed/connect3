export const clubQueries = {
  queries: [
    {
      query: "What clubs should I join if I want to become a data scientist?",
      response: {
        result:
          "Joining clubs focused on data science can significantly enhance your skills and networking opportunities. Notable organizations include DSCubed, which offers workshops and social events, and the Data Science Student Society (DSC), known for technical upskilling and networking events.",
        matches: [
          {
            files: [
              {
                file_id: "file-Wz29K8AkBmmSAi745jdXBD",
                description:
                  "DSCubed connects students passionate about Data Science and AI through events and workshops, fostering community and industry connections.",
              },
              {
                file_id: "file-2RFF7d8nNPMcdDss1jFD4A",
                description:
                  "DSCubed offers industry opportunities including networking events and skill-building workshops for aspiring data scientists.",
              },
              {
                file_id: "file-WkmgJycXsF4ReWWA2nbiVa",
                description:
                  "DSCubed conducts hands-on technical workshops in Python and data analysis, helping members gain practical skills.",
              },
            ],
            user_id: "81cba4a3-a014-40a1-9417-f236ce967112",
          },
          {
            files: [
              {
                file_id: "file-V6h8tzsmsTPyi1tyq5PfCx",
                description:
                  "The DSC is a university club aimed at job readiness through technical upskilling and professional networking.",
              },
            ],
            user_id: "f2d127bb-17de-4179-84af-0c008fddcdde",
          },
        ],
        followUps:
          "Do you want to know about specific activities or benefits of these clubs?",
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
