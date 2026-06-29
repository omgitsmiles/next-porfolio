import bbImg      from '../public/budgetbuddy.png'
import beImg      from '../public/BookEnds.jpeg'
import llImg      from '../public/LearnLink.png'
import ullrImg    from '../public/Ullr.png'
import creedBlog  from '../public/CreedThoughts.jpg'
import moneyMagnet from '../public/MoneyMagnet.png'
import cookSys    from '../public/CookSys.png'

export const projectsData = [
  {
    title: "CookSys Project Manager",
    description: "Onboarding tool to track recent hires with their companies and their respective projects on those companies.",
    tags: ["Angular", "Typescript", "Tailwind", "Java", "Spring Boot", "PostgreSQL"],
    imageUrl: cookSys,
    repo: "https://cooksys.onrender.com",
  },
  {
    title: "Money Magnet",
    description: "A financial management app empowering both single users and households to better manage their finances, integrating Plaid for account linking and Google's Gemini AI offering financial advice.",
    tags: ["React", "Python", "Material UI", "Plaid API", "Google Gemini AI"],
    imageUrl: moneyMagnet,
    repo: "https://github.com/omgitsmiles/ctrl-your-finances",
  },
  {
    title: "LearnLink",
    description: "Built at a hackathon with designers and engineers. Leverages Google's PaLM AI to make education and coursework more accessible.",
    tags: ["React", "Chakra UI", "Python", "Flask", "Google PaLM AI", "Zustand"],
    imageUrl: llImg,
    repo: "https://github.com/JWehder/Learn-Link",
  },
  {
    title: "Budget Buddy",
    description: "A user-friendly application designed to help individuals manage their personal finances effectively.",
    tags: ["React", "Python", "Flask", "Chakra UI", "Framer", "Lottie Animations"],
    imageUrl: bbImg,
    repo: "https://budgetbuddy-u5el.onrender.com/",
  },
  {
    title: "BookEnds",
    description: "A place for users to share their books and thoughts in one place through BookEnds.",
    tags: ["React", "Ruby on Rails", "PostgreSQL", "Material UI"],
    imageUrl: beImg,
    repo: "https://github.com/omgitsmiles/BookEnds",
  },
  {
    title: "Ullr",
    description: "A fitness tracker app with added social media functionality to share physical activities with friends.",
    tags: ["React", "Ruby on Rails", "PostgreSQL", "Material UI"],
    imageUrl: ullrImg,
    repo: "https://github.com/omgitsmiles/Ullr",
  },
  {
    title: "Creed Thoughts",
    description: "From the popular show The Office, a recreation of Creed Bratton's blog for the user.",
    tags: ["React", "Ruby", "Sinatra"],
    imageUrl: creedBlog,
    repo: "https://github.com/omgitsmiles/creed-thoughts-front-end",
  },
] as const;
