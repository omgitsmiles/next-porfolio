'use client'

import React from 'react'
import SectionHeading from './section-heading'
import { motion } from 'framer-motion'
import { useSectionInView } from '../../lib/hooks'

export default function About() {
  const { ref } = useSectionInView('About')

  return (
    <motion.section className='mb-28 max-w-[45rem] text-center leading-8 sm:mb-40 scroll-mt-28'
    ref={ref}
    initial={{ opacity: 0, y: 100 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.175 }}
    id='about'>
        <SectionHeading>About Me</SectionHeading>
        <p className='mb-3'>
            After 12 years in Account Management in the {" "}
            <span className="font-medium">health care industry</span>, I decided to pursue my passion for programming.
            At Flatiron School, I learned both front and back end technologies to become a{" "}
            <span className="font-medium">full-stack developer</span>.{" "} 
            <span className="italic">Since graduating, I've immesered myself in web dev and continue to learn everyday!</span> The thrill of debugging, the sweet satisfaction of finding those off-the-beaten-path solutions, and teaming up with fellow code enthusiasts to whip up some <span className="underline">seriously cool</span> passion projects. Web development isn't just a job; it's my playground for creative collaboration. My core stack
            is{" "}
            <span className="font-medium">
            React, Next.js, Node.js, Python, Flask, Ruby on Rails, and Typescript
            </span>
            . I am also familiar with React Native and Java. I am always looking to
            learn new technologies. I am currently looking for a{" "}
            <span className="font-medium">full-time position</span> as a software
            developer.
        </p>
        <p>
            <span className="italic">When I'm not coding</span>, I enjoy playing
            spending time with my new born son and family, getting together with friends for runs around NYC, video games, watching movies, and lounging with my dog. I look forward to{" "}
            <span className="font-medium">learning new things</span>. I am currently
            learning about{" "}
            <span className="font-medium">Next.js 14 and their partial rendering and deepening my knowledge of React.</span>
        </p>
    </motion.section>
  )
}
