import { Question } from "@/components/quiz/QuestionPage";

const formalQuestionsPart1: Question[] = [
  {
    title: "What is your major/degree?",
    type: "single-dropdown",
    choices: [
      // Bachelor of Arts
      "Anthropology",
      "Art History",
      "Asian Studies",
      "Chinese Studies",
      "Creative Writing",
      "Criminology",
      "Economics (Arts)",
      "English and Theatre Studies",
      "French Studies",
      "Gender Studies",
      "Geography (Arts)",
      "German Studies",
      "Greek Studies",
      "History",
      "History and Philosophy of Science",
      "Indigenous Studies",
      "Indonesian Studies",
      "International Studies",
      "Islamic Studies",
      "Italian Studies",
      "Japanese Studies",
      "Jewish Studies",
      "Korean Studies",
      "Linguistics and Applied Linguistics",
      "Mathematics and Statistics (Arts)",
      "Media and Communications",
      "Music (Arts)",
      "Philosophy",
      "Politics and International Relations",
      "Psychology (Arts)",
      "Russian Studies",
      "Screen and Cultural Studies",
      "Sociology",
      "Spanish and Latin American Studies",

      // Bachelor of Science
      "Agricultural Science",
      "Animal Health and Disease",
      "Animal Science and Management",
      "Biochemistry and Molecular Biology",
      "Biotechnology",
      "Cell and Developmental Biology",
      "Chemistry",
      "Civil Systems",
      "Climate and Weather",
      "Computational Biology",
      "Computing and Software Systems",
      "Data Science",
      "Ecology and Evolutionary Biology",
      "Ecosystem Science",
      "Electrical Systems",
      "Environmental Engineering Systems",
      "Environmental Science",
      "Food Science",
      "Genetics",
      "Geography (Science)",
      "Geology",
      "Marine Biology",
      "Mathematical Physics",
      "Mathematics and Statistics (Science)",
      "Mechanical Systems",
      "Microbiology and Immunology",
      "Neuroscience",
      "Optometry",
      "Pathology",
      "Pharmacology",
      "Physics",
      "Physiology",
      "Plant Science",
      "Psychology (Science)",
      "Zoology",

      // Bachelor of Commerce
      "Accounting",
      "Actuarial Studies",
      "Economics (Commerce)",
      "Finance",
      "Management",
      "Marketing",

      // Bachelor of Design
      "Architecture",
      "Computing and Software Systems (Design)",
      "Construction",
      "Digital Technologies",
      "Landscape Architecture",
      "Mechanical Systems (Design)",
      "Property",
      "Urban Planning",

      // Bachelor of Biomedicine
      "Biochemistry and Cell Biology",
      "Biomedical Engineering",
      "Genetics (Biomedicine)",
      "Human Structure and Function",
      "Immunology",
      "Microbiology and Immunology (Biomedicine)",
      "Neuroscience (Biomedicine)",
      "Pathology (Biomedicine)",
      "Pharmacology (Biomedicine)",
      "Physiology (Biomedicine)",

      // Bachelor of Fine Arts
      "Acting",
      "Animation",
      "Dance",
      "Film and Television",
      "Music Theatre",
      "Production",
      "Screenwriting",
      "Visual Art",

      // Bachelor of Music
      "Music Performance",
      "Musicology",
      "Composition",
      "Music (Interactive Composition)",

      // Other degrees
      "Bachelor of Agriculture",
      "Bachelor of Oral Health",

      // Catch-all
      "Other",
    ]
  },
  {
    title: "What are your hobbies?",
    type: "multiple",
    choices: [
      "🏋️ Gym",
      "🏃 Running",
      "🧘 Yoga",
      "🥾 Hiking",
      "🚴 Cycling",
      "⚽ Football",
      "🏀 Basketball",
      "🏸 Badminton",
      "🎾 Tennis",
      "🏊 Swimming",
      "🎮 Gaming",
      "♟️ Chess",
      "🎲 Tabletop",
      "🧩 Puzzles",
      "💻 Coding",
      "🤖 AI",
      "📊 Data",
      "🎨 Drawing",
      "🖌️ Painting",
      "📸 Photography",
      "🎥 Filmmaking",
      "🎧 Music",
      "🎸 Guitar",
      "🎤 Singing",
      "🕺 Dancing",
      "🎭 Acting",
      "✍️ Writing",
      "📚 Reading",
      "🎬 Movies",
      "📺 TV",
      "🎌 Anime",
      "☕ Cafes",
      "🍳 Cooking",
      "🥐 Baking",
      "🍜 Food",
      "🍻 Drinks",
      "✈️ Travel",
      "🗺️ Exploring",
      "📷 Social media",
      "🎨 Design",
      "🚀 Startups",
      "📈 Investing",
      "🧑‍💼 Career",
      "🗣️ Speaking",
      "🤝 Networking",
      "🧳 Cultures",
      "🗣️ Languages",
      "🛠️ DIY",
      "🌿 Gardening",
      "🐶 Pets",
      "🎮 Esports",
      "⚽ Watching sports"
    ],
  },
];

const formalQuestionsPart2: Question[] = [
  {
    title: "What is your student email?",
    type: "studentemail",
  },
];

const casualQuestions: Question[] = [
  {
    title: "What role do you play during group projects?",
    type: "single",
    choices: [
      "Group leader",
      "Will do the task if given to them",
      "Personality hire",
      "AFK ghost",
    ],
  },
  {
    title: "How would you rate your school/class attendance?",
    type: "single",
    choices: [
      "100% - always there",
      "75% - had some valid sick days",
      "50% - depends on the mood that day",
      "25% and less - missing in action",
    ],
  },
  {
    title: "What's your go-to study drink?",
    type: "single",
    choices: [
      "Black coffee, no sugar",
      "Some form of a latte",
      "The most sugary and definitely cancerous energy drinks",
      "Water",
    ],
  },
  {
    title: "How do you feel about uni lectures?",
    type: "single",
    choices: [
        "I will go to every single one in person!",
        "Watching them all online is no different",
        "I can watch them all online a week before the final",
        "All you need are the slides…",
    ],
  },
  {
    title: "Thoughts on LinkedIn?",
    type: "single",
    choices: [
      "Now I've started uni, I should probably make one",
      "I've had one since high school",
      "Yeah one day maybe later…",
      "What's that?",
    ],
  },
  {
    title: "The restaurant gave you cheese in your burger, you hate cheese. What do you do?",
    type: "single",
    choices: [
      "Suck it up and eat the cheeseburger",
      "Complain to the waiter",
      "Tell the waiter but apologise 100 times while doing it",
      "Cry",
    ],
  },
  {
    title: "You had a long study day and finally pick up your phone again to 100 notifications",
    type: "single",
    choices: [
      "You reward yourself by happily responding to everyone",
      "You close all notifications and start doom scrolling",
      "Throw your phone away and cry",
      "What I would never be off my phone for that long.",
    ],
  },
  {
    title: "You need to ask one of your high school teachers for a recommendation letter, who do you ask?",
    type: "single",
    choices: [
      "Math teacher",
      "English teacher",
      "History Teacher",
      "Science teacher",
      "All my teachers hate me",
    ],
  },
  {
    title: "You're at a bar with friends when someone takes out their laptop and starts studying, what do you do?",
    type: "single",
    choices: [
      "Laugh at them and tell them to go home",
      "Give them your respect and adoration for the grind",
      "Start studying with them",
      "I would never be at a bar?",
    ],
  },
  {
    title: "It's finally Saturday after a long week. I would:",
    type: "single",
    choices: [
      "Watch a movie with friends",
      "Get comfy in a beanbag and doom scroll all day",
    ],
  },
  {
    title: "Who are you in your friend group?",
    type: "single",
    choices: [
      "The quiet philosopher",
      "The social glue",
      "The trend setter",
    ],
  },
  {
    title: "Favourite marvel movie",
    type: "single",
    choices: [
      "Justice League",
      "Batman",
      "Wonder Woman",
      "Aquaman",
    ],
  },
  {
    title: "You're watching movies with your friends, you are most likely to:",
    type: "single",
    choices: [
      "Ask questions every 5 minutes",
      "Doze off in the background",
      "Fully locked in on the movie",
      "Chat through the entire movie",
    ],
  },
];

export function getQuestions(nCasual: number = 3): Question[] {
  // Shuffle casual questions
  const shuffledCasual = [...casualQuestions].sort(() => 0.5 - Math.random());
  
  // Pick nCasual
  const selectedCasual = shuffledCasual.slice(0, nCasual);
  
  return [...formalQuestionsPart1, ...selectedCasual, ...formalQuestionsPart2];
}
