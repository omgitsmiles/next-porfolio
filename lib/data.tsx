import React from "react";
import { CgWorkAlt } from "react-icons/cg";
import { FaReact } from "react-icons/fa";
import { LuGraduationCap } from "react-icons/lu";
import { FaLandmarkFlag } from "react-icons/fa6";
import bbImg from '../public/budgetbuddy.png'
import beImg from '../public/BookEnds.jpeg'
import llImg from '../public/LearnLink.png'
import ullrImg from '../public/Ullr.png'
import creedBlog from '../public/CreedThoughts.jpg'
import moneyMagnet from '../public/MoneyMagnet.png'


export const links = [
  {
    name: "Home",
    hash: "#home",
  },
  {
    name: "About",
    hash: "#about",
  },
  {
    name: "Projects",
    hash: "#projects",
  },
  {
    name: "Skills",
    hash: "#skills",
  },
  {
    name: "Experience",
    hash: "#experience",
  },
  {
    name: "Contact",
    hash: "#contact",
  },
] as const;

export const experiencesData = [    
  {
    title: "Software Engineer @ WeVote",
    location: "Remote",
    description:
      "I'm currently working as a software engineer at WeVote, a non-profit organization that better informs voters. Utilizing React, Python, and Django to help build out the platform.",
    icon: React.createElement(FaLandmarkFlag),
    date: "2024 - present",
  },
  {
    title: "Full-Stack Developer",
    location: "New York, NY",
    description:
      "I'm now a full-stack developer working as a freelancer helping small businesses and working on personal projects. My stack includes React, Next.js, TypeScript, Tailwind, MongoDB, Python, and Flask. I'm open to full-time opportunities.",
    icon: React.createElement(FaReact),
    date: "2023 - present",
  },  
  {
    title: "Flatiron School",
    location: "New York, NY",
    description:
      "5-month intensive program where I learned an array of full stack of languages including React, Redux, Ruby, Sinatra, Rails, Javascript, SQL, ActiveRecord, Git, HTML, and CSS.",
    icon: React.createElement(LuGraduationCap),
    date: "2022",
  },
  {
    title: "Account Executive",
    location: "New York, NY",
    description:
      " I have been managing and growing a portfolio of over 50 accounts in the orthotic and prosthetic industry for over 12 years. I have developed strong skills in business negotiation, industrial sales, contract management, and customer service, resulting in increased revenue, retention, and satisfaction for my clients and company.",
    icon: React.createElement(CgWorkAlt),
    date: "2011 - present",
  },
] as const;

// use React.createElement for .ts files. .tsx allows for jsx, .ts doesn't.

export const projectsData = [
  {
    title: "Money Magnet",
    description:
      "A financial management app that empowering both single users and households to better manage their finances, integrating Plaid for account linking and Google’s Gemini AI offering financial advice.",
    tags: ["React", "Python", "Material UI", "Plaid API", "Google Gemini AI"],
    imageUrl: moneyMagnet,
    repo: "https://github.com/omgitsmiles/ctrl-your-finances"
  },
  {
    title: "LearnLink",
    description:
      "Porject built at a hackathon with designers and engineers. Built leveraging Google's PaLM AI to make education and course work more accessible.",
    tags: ["React", "Chakra UI", "Python", "Flask", "Google PaLM AI", "Zustand"],
    imageUrl: llImg,
    repo: "https://github.com/JWehder/Learn-Link"
  },
  {
    title: "Budget Buddy",
    description:
      "Budget Buddy is a user-friendly application designed to help individuals manage their personal finances effectively.",
    tags: ["React", "Python", "Flask", "Chakra UI", "Framer", "Lottie Animations"],
    imageUrl: bbImg,
    repo: "https://budgetbuddy-u5el.onrender.com/"

  },
  {
    title: "BookEnds",
    description:
    "Taking a simple idea of creating a place for users to share their books and thoughts in one place through BookEnds.",
    tags: ["React", "Ruby on Rails", "PostgreSQL", "Material UI"],
    imageUrl: beImg,
    repo: "https://github.com/omgitsmiles/BookEnds"
  },
  {
    title: "Ullr",
    description:
    "A Fitness tracker app with added social media functionality. Along with added your physical acitivites for you and your friends to see.",
    tags: ["React", "Ruby on Rails", "PostgreSQL", "Material UI"],
    imageUrl: ullrImg,
    repo: "https://github.com/omgitsmiles/Ullr"
  },
  {
    title: "Creed Thoughts",
    description:
    "From the popular show The Office, we take the character Creed Bratton and replicate his Blog for the user.",
    imageUrl: creedBlog,
    tags: ["React", "Ruby", "Sinatra"],
    repo: "https://github.com/omgitsmiles/creed-thoughts-front-end"
  }
] as const;

export const skillsData = [
  "Java",
  "Spring Boot",
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Git",
  "Tailwind",
  "Node.js",
  "Express",
  "MongoDB",
  "Redux",
  "Storybook",
  "Zustand",
  "PostgreSQL",
  "Python",
  "Django",
  "Flask",
  "Framer Motion",
] as const;