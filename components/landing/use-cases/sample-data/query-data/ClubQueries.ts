export const clubQueries = {
  queries: [
    {
      query: "What clubs should I join if I want to become a data scientist?",
      response: {
        result:
          "UniMelb has excellent data science clubs! The Data Science Student Society (DSSS) runs technical workshops, Kaggle competitions, and industry panels with companies like Quantium and REA Group. DSCubed focuses on AI/ML projects and hackathons. The Melbourne University Statistical Society offers talks on statistical modeling. All clubs provide networking with PhD students, industry professionals from Australian tech companies, and hands-on project experience.",
        matches: [
          {
            files: [
              {
                file_id: "file-club-dsss-1",
                description:
                  "Data Science Student Society - Runs weekly Python workshops, hosts industry nights with Commonwealth Bank and NAB data science teams, organizes group projects using real Australian datasets (ABS, transport data).",
              },
              {
                file_id: "file-club-dsss-2",
                description:
                  "DSSS Student Testimonial - 'Joined DSSS in first year, learned pandas and scikit-learn through their workshops, built portfolio projects, landed data analyst internship at Woolworths Group' - Amy Chen, Commerce/Data Science 2024.",
              },
            ],
            user_id: "club-dsss-official",
          },
          {
            files: [
              {
                file_id: "file-club-dscubed-1",
                description:
                  "DSCubed - Focuses on AI/ML applications, runs Melbourne Datathon prep sessions, connects students with research groups at CSIRO and Data61, hosts guest lectures from Canva and Atlassian ML engineers.",
              },
            ],
            user_id: "club-dscubed-official",
          },
        ],
        followUps:
          "Would you like to attend the next DSSS welcome event or join their Slack for workshop announcements?",
      },
    },
    {
      query: "Which clubs focus on sustainability?",
      response: {
        result:
          "UniMelb has an active sustainability community! Environment Collective runs climate action campaigns and beach cleanups at St Kilda. Engineers Without Borders works on sustainable development projects in rural Australia and Pacific Islands. Students for Sustainability organizes zero-waste events and partners with Melbourne City Council. TechForGood connects tech students with sustainability startups. Green Team focuses on campus sustainability initiatives and tree planting in Parkville.",
        matches: [
          {
            files: [
              {
                file_id: "file-club-sustain-1",
                description:
                  "Environment Collective - Organized 15+ beach cleanups in 2024-2025, led campaign that reduced single-use plastics on campus by 40%, collaborates with Port Phillip EcoCentre.",
              },
              {
                file_id: "file-club-sustain-2",
                description:
                  "Engineers Without Borders Melbourne - Working on renewable energy project in Tasmania, water filtration systems for remote communities, won UNESCO Youth Award 2024.",
              },
            ],
            user_id: "club-sustainability-hub",
          },
          {
            files: [
              {
                file_id: "file-club-sustain-3",
                description:
                  "TechForGood UniMelb - Connects CS students with Australian cleantech startups (solar, carbon tracking, sustainable agriculture), ran hackathon with $10k prize sponsored by Future Super.",
              },
            ],
            user_id: "club-techforgood",
          },
        ],
        followUps:
          "Interested in joining the next beach cleanup or attending the Sustainability Careers Fair?",
      },
    },
    {
      query: "How do I join Data Science Student Society",
      response: {
        result:
          "Joining DSSS is easy! Sign up at O-Week or join online through their website (dsss.org.au). Free membership for all UniMelb students. They host weekly events: Technical Tuesdays (coding workshops), Industry Thursdays (company visits to Seek, Telstra, Optus), and monthly social events. Follow their Facebook and Discord for event updates. First workshop usually covers Python basics, then progresses to pandas, SQL, machine learning, and cloud platforms (AWS, Azure).",
        matches: [
          {
            files: [
              {
                file_id: "file-club-join-1",
                description:
                  "DSSS Membership Info - Free membership, 500+ active members, all skill levels welcome. Spring semester focuses on competitions (Kaggle, Data Crunch), workshops cover real-world skills needed for internships.",
              },
            ],
            user_id: "club-dsss-official",
          },
          {
            files: [
              {
                file_id: "file-club-join-2",
                description:
                  "DSSS 2025 Schedule - Feb: Intro to Python, Mar: Data Wrangling with pandas, Apr: Machine Learning Basics, May: Industry Night with Quantium, Jun: Portfolio Building Workshop, Jul: Melbourne Datathon.",
              },
            ],
            user_id: "club-dsss-exec",
          },
        ],
        followUps:
          "Would you like the Discord link or want to RSVP for the next beginner-friendly workshop?",
      },
    },
    {
      query: "Are there any cultural clubs for international students?",
      response: {
        result:
          "UniMelb has 200+ cultural clubs! Popular ones include: Chinese Students and Scholars Association (CSSA) - biggest international student club, hosts Spring Festival and Mid-Autumn celebrations. Malaysian Students' Council runs food festivals and career nights. Indian Cultural Society celebrates Diwali and Holi. Vietnamese Students' Association has weekly language exchange. International Student House offers buddy programs. United Nations Society Melbourne for global affairs discussions.",
        matches: [
          {
            files: [
              {
                file_id: "file-club-cultural-1",
                description:
                  "CSSA UniMelb - 5000+ members, organizes Spring Festival Gala (biggest student event, 2000+ attendees), job fairs connecting to Asian companies in Australia, Lunar New Year dinner at Crown Casino.",
              },
              {
                file_id: "file-club-cultural-2",
                description:
                  "Malaysian Students' Council - Hosts Malaysian Night (cultural performances, satay stall), career panel with Malaysian graduates at PwC/Deloitte/EY Australia, helps with student visa/accommodation questions.",
              },
            ],
            user_id: "club-cultural-societies",
          },
          {
            files: [
              {
                file_id: "file-club-cultural-3",
                description:
                  "International Student House - Pairs new international students with local mentors, organizes Melbourne city tours (Queen Vic Market, National Gallery), weekly coffee chats in Student Union.",
              },
            ],
            user_id: "club-international-support",
          },
        ],
        followUps:
          "Which culture or region are you interested in? I can provide specific club contact details.",
      },
    },
  ],
};
