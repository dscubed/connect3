export const networkingQueries = {
  queries: [
    {
      query: "I want to join a hackathon team, any teammates available?",
      response: {
        result:
          "Yes! Several students at UniMelb are actively participating in hackathons. You can connect with teams competing in events like UNIHACK (Australia's largest student hackathon), Melbourne Datathon, and Google HashCode. Many computing students from Bachelor of Science (Computing and Software Systems) and Master of IT programs are looking for teammates with skills in Python, React, and machine learning.",
        matches: [
          {
            files: [
              {
                file_id: "file-student-1",
                description:
                  "Sarah Chen - 3rd year Computer Science student at UniMelb | Won Best AI Solution at UNIHACK 2024 | Full-stack developer (React, Node.js, Python) | Building team for Melbourne AI Hackathon June 2025 | Connect on LinkedIn: /in/sarah-chen-unimelb",
              },
              {
                file_id: "file-student-2",
                description:
                  "James Park - Master of IT (Distributed Computing) at UniMelb | Google HashCode 2024 Finalist | Competed in Student Hackathon Melbourne, won Best UX Design | Skills: UI/UX, Python, TensorFlow | LinkedIn: /in/jamespark-melbourne",
              },
            ],
            user_id: "student-hackathon-1",
          },
          {
            files: [
              {
                file_id: "file-student-3",
                description:
                  "Emily Wong - Computing & Software Systems major | MUCIS (Melbourne Uni Computing Society) Events Director | Organizing hackathon team formation event March 15 | Experienced in React Native, Firebase | LinkedIn: /in/emily-wong-cs",
              },
            ],
            user_id: "student-hackathon-2",
          },
        ],
        followUps:
          "Would you like to join the MUCIS Discord server or RSVP for the hackathon team formation event?",
      },
    },
    {
      query: "Who is working on cool AI projects?",
      response: {
        result:
          "Many UniMelb students are working on exciting AI projects! Current popular areas include: Large Language Model applications for education, Computer Vision for medical imaging (collaborating with Melbourne hospitals), AI-powered sustainability solutions, and machine learning for financial analysis. Students often collaborate with research groups like the Melbourne School of Engineering AI Lab and industry partners like Canva, Atlassian, and Commonwealth Bank.",
        matches: [
          {
            files: [
              {
                file_id: "file-ai-student-1",
                description:
                  "Alex Thompson - Final year Data Science at UniMelb | Building AI study assistant using GPT-4 API and RAG | Presented at Student Research Conference 2025 | 2024 Summer Intern at Canva (ML Team) | LinkedIn: /in/alex-thompson-datascience",
              },
              {
                file_id: "file-ai-student-2",
                description:
                  "Dr. Priya Patel - PhD Candidate in Machine Learning, Computing & Information Systems | Computer vision research with Royal Melbourne Hospital for early cancer detection | Published 2 papers in CVPR | LinkedIn: /in/priya-patel-phd-unimelb",
              },
            ],
            user_id: "ai-researcher-1",
          },
          {
            files: [
              {
                file_id: "file-ai-student-3",
                description:
                  "David Nguyen - Master of Data Science | Created AI model predicting Melbourne public transport delays (92% accuracy) | Former intern at REA Group (recommendation systems) | Active in UniMelb AI/ML Society | LinkedIn: /in/david-nguyen-ml",
              },
            ],
            user_id: "ai-researcher-2",
          },
        ],
        followUps:
          "Would you like to join the UniMelb AI/ML student group or attend their weekly project showcases?",
      },
    },
    {
      query: "Looking for collaborators for a startup idea",
      response: {
        result:
          "UniMelb has a thriving startup ecosystem! The Melbourne Accelerator Program (MAP) at UniMelb supports student startups with mentorship, funding, and workspace. Wade Institute of Entrepreneurship runs workshops and pitch competitions. Recent successful student startups include healthtech, edtech, and fintech companies. Many students also participate in Startmate, Blackbird's Giant Leap, and Stone & Chalk programs.",
        matches: [
          {
            files: [
              {
                file_id: "file-startup-1",
                description:
                  "Marcus Liu - Bachelor of Commerce/Computer Science | Co-founder of StudyMate (edtech startup in MAP Cohort 2025) | Raised $50k seed funding from Blackbird | Looking for technical co-founder with mobile dev experience | LinkedIn: /in/marcus-liu-founder",
              },
              {
                file_id: "file-startup-2",
                description:
                  "Sophie Anderson - Master of Entrepreneurship at UniMelb | Former Product Manager at Afterpay | Expertise in go-to-market strategy and growth | Keen to join early-stage startups as co-founder or advisor | LinkedIn: /in/sophie-anderson-product",
              },
            ],
            user_id: "startup-founder-1",
          },
          {
            files: [
              {
                file_id: "file-startup-3",
                description:
                  "Ryan Zhang - Mechatronics Engineering student | Built 3 side projects with 10k+ users total | Full-stack developer (AWS, Docker, Kubernetes) | Blackbird Giant Leap program 2024 | Open to CTO roles | LinkedIn: /in/ryan-zhang-eng",
              },
            ],
            user_id: "startup-founder-2",
          },
        ],
        followUps:
          "Would you like an intro to MAP mentors or join the next Startup Weekend at Wade Institute?",
      },
    },
    {
      query: "Which seniors can give advice on internships?",
      response: {
        result:
          "Many successful seniors at UniMelb can offer internship advice! Recent graduates and current students have secured positions at top Australian companies (Atlassian, Canva, Commonwealth Bank, NAB, REA Group, Telstra) and international tech companies (Google Sydney, Microsoft, Amazon AWS Sydney). The Career Advice Program connects you with mentors who've gone through the process for tech, consulting, and finance internships.",
        matches: [
          {
            files: [
              {
                file_id: "file-intern-mentor-1",
                description:
                  "Jessica Lee - 4th year Commerce/Computing at UniMelb | Summer 2024 Software Engineering Intern at Canva Sydney | Winter 2023 Consulting Intern at PwC Melbourne | Can advise on technical interviews, behavioral questions, and choosing between offers | LinkedIn: /in/jessica-lee-unimelb",
              },
              {
                file_id: "file-intern-mentor-2",
                description:
                  "Tom Harrison - Master of IT graduate (Dec 2024) | Graduate Software Engineer at Atlassian Sydney (starting Feb 2025) | Completed 2024 internship at Atlassian | Expert in coding interviews (LeetCode), system design prep | WICS mentor | LinkedIn: /in/tom-harrison-atlassian",
              },
            ],
            user_id: "intern-mentor-1",
          },
          {
            files: [
              {
                file_id: "file-intern-mentor-3",
                description:
                  "Michelle Tan - Recent BSc (Computing) graduate | Completed internships at Google Sydney (2023) and Amazon AWS (2024) | Now Software Engineer at Canva | Women in Computer Science (WICS) mentor | Helps with interview prep and resume reviews | LinkedIn: /in/michelle-tan-swe",
              },
            ],
            user_id: "intern-mentor-2",
          },
        ],
        followUps:
          "Would you like to book a 1-on-1 mentoring session through the Career Centre or join the next Internship Prep workshop?",
      },
    },
    {
      query: "Are there study groups for Data Science?",
      response: {
        result:
          "Yes! Several active study groups for Data Science at UniMelb. The Data Science Student Society (DSSS) runs weekly study sessions for subjects like COMP20008 (Elements of Data Processing), MAST30034 (Applied Data Science), and COMP90089 (Machine Learning Applications). Students also form study groups for Kaggle competitions and work on real datasets from Australian companies and government departments.",
        matches: [
          {
            files: [
              {
                file_id: "file-datasci-1",
                description:
                  "Kevin Wu - Data Science major at UniMelb | Top 5% in COMP20008, MAST30034 | Runs weekly study sessions at Baillieu Library (Thursdays 2-4pm) | Expert in Python pandas, scikit-learn, statistical analysis | LinkedIn: /in/kevin-wu-datascience",
              },
              {
                file_id: "file-datasci-2",
                description:
                  "Olivia Brown - Master of Data Science | Won 2nd place in Melbourne Datathon 2024 (team of 4) | Organizes Kaggle study group every Thursday | Focuses on real-world datasets and portfolio building | LinkedIn: /in/olivia-brown-datasci",
              },
            ],
            user_id: "datasci-student-1",
          },
          {
            files: [
              {
                file_id: "file-datasci-3",
                description:
                  "Data Science Student Society (DSSS) - 500+ members | Weekly workshops on Python, R, SQL, machine learning | Study sessions before major assessments | Industry talks from Quantium, REA Group, Commonwealth Bank | Join Discord: dsss.org.au",
              },
            ],
            user_id: "datasci-society",
          },
        ],
        followUps:
          "Would you like to join the DSSS Discord server or get added to Kevin's study group calendar?",
      },
    },
  ],
};
