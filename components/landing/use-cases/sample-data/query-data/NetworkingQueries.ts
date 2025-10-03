export const networkingQueries = {
  queries: [
    {
      query: "I want to join a hackathon team, any teammates available?",
      response: {
        result:
          "Great! I found several students actively looking for hackathon teammates with complementary skills.",
        matches: [
          {
            user_id: "demo1",
            files: [
              {
                file_id: "1",
                description:
                  "Frontend developer seeking backend partner for AI hackathon",
              },
            ],
          },
          {
            user_id: "demo2",
            files: [
              {
                file_id: "2",
                description:
                  "ML engineer looking for team - has experience with computer vision",
              },
            ],
          },
        ],
        followUps:
          "Would you like me to connect you with these teammates or help you find more specific skill sets for your project?",
      },
    },
    {
      query: "Who is working on cool AI projects?",
      response: {
        result:
          "I found students working on some fascinating AI projects right now!",
        matches: [
          {
            user_id: "demo3",
            files: [
              {
                file_id: "3",
                description: "Building an AI-powered mental health chatbot",
              },
            ],
          },
          {
            user_id: "demo4",
            files: [
              {
                file_id: "4",
                description:
                  "Working on autonomous drone navigation using reinforcement learning",
              },
            ],
          },
        ],
        followUps:
          "Want to learn more about their projects or connect with them for potential collaboration?",
      },
    },
    {
      query: "Looking for collaborators for a startup idea",
      response: {
        result:
          "Exciting! I found entrepreneurial students who might be perfect co-founders for your startup.",
        matches: [
          {
            user_id: "demo5",
            files: [
              {
                file_id: "5",
                description:
                  "Business student with startup experience, looking for technical co-founder",
              },
            ],
          },
          {
            user_id: "demo6",
            files: [
              {
                file_id: "6",
                description: "Product manager with 2 previous startup launches",
              },
            ],
          },
        ],
        followUps:
          "Should I help you schedule meetings with potential co-founders or find more people in specific domains?",
      },
    },
    {
      query: "Which seniors can give advice on internships?",
      response: {
        result:
          "I found senior students who recently landed great internships and are happy to mentor!",
        matches: [
          {
            user_id: "demo7",
            files: [
              {
                file_id: "7",
                description:
                  "Just completed Google SWE internship, offers resume reviews",
              },
            ],
          },
          {
            user_id: "demo8",
            files: [
              {
                file_id: "8",
                description:
                  "Microsoft PM intern, specializes in interview prep coaching",
              },
            ],
          },
        ],
        followUps:
          "Want me to connect you with these mentors or find advisors in specific companies/roles?",
      },
    },
    {
      query: "Are there study groups for Data Science?",
      response: {
        result:
          "Yes! I found active study groups and students organizing regular Data Science sessions.",
        matches: [
          {
            user_id: "demo9",
            files: [
              {
                file_id: "9",
                description:
                  "Runs weekly ML study group covering Kaggle competitions",
              },
            ],
          },
          {
            user_id: "demo10",
            files: [
              {
                file_id: "10",
                description:
                  "Organizes Data Science study sessions for COMP30027",
              },
            ],
          },
        ],
        followUps:
          "Should I help you join these study groups or find more specialized groups for specific DS topics?",
      },
    },
    {
      query: "Who else is interested in AI?",
      response: {
        result:
          "Lots of AI enthusiasts here! I found students with various AI interests and expertise levels.",
        matches: [
          {
            user_id: "demo11",
            files: [
              {
                file_id: "11",
                description:
                  "AI researcher working on natural language processing",
              },
            ],
          },
          {
            user_id: "demo12",
            files: [
              {
                file_id: "12",
                description:
                  "Beginner in AI, looking for study partners and project ideas",
              },
            ],
          },
        ],
        followUps:
          "Want to join AI discussion groups or connect with people working on specific AI domains?",
      },
    },
  ],
};
