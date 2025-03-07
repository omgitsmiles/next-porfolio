'use client'

import Image from 'next/image'
import React from 'react'
import ProfilePic from '../../public/ProfessionProfilePicture 2.jpeg'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { HiDownload } from 'react-icons/hi'
import { BsArrowRight } from 'react-icons/bs'
import { BsLinkedin } from 'react-icons/bs'
import { FaGithubSquare } from 'react-icons/fa'
import { FaMedium } from 'react-icons/fa6'
import { useSectionInView } from '../../lib/hooks'
import { useActiveSectionContext } from '@/context/active-section-context'
import { ProfileContextProvider, useProfileContext } from '@/context/profile-context'

export default function Intro() {
    const { profile } = useProfileContext();
    const { ref } = useSectionInView('Home', 0.5)
    const { setActiveSection, setTimeOfLastClick } = useActiveSectionContext()

    // FastTrack Github API Fetch Req;
    console.log(profile);

  return (
    <section ref={ref} className='mb-28 max-w[45rem] text-center sm:mb-0 scroll-mt-[100rem]'
        id='home'>
        <div className='flex items-center justify-center'>
            <div className='relative'>
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ 
                        type: 'tween',
                        duration: 0.2,
                    }}
                    >
                    <Image 
                    src={ProfilePic || profile?.avatar_url}
                    alt='Paolos Profile Pic'
                    width='192'
                    height='192'
                    quality='95'
                    priority={true}
                    className='h-36 w-36 rounded-full object-cover border-[0.35rem] border-white shadow-xl'
                    />
                </motion.div>
                <motion.span className='absolute bottom-0 right-0 text-3xl'
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                        type: 'spring',
                        stiffness: 125,
                        delay: 0.1,
                        duration: 0.7
                    }}>
                  🖥️
                </motion.span>
            </div>
        </div>
        <motion.h1 className='mb-10 mt-4 px-4 text-2xl font-medium !leading-[1.5] sm:text-4xl'
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        >
          <span className='font-bold'>My name's Paolo, welcome to my portfolio!</span>{" "}
           I'm a <span className='font-bold'> fullstack developer </span>
           proficient in <span className='italic'> React.js, Angular, Typescript, Java, Spring Boot, Ruby on Rails, Python, Django, Flask & PostgreSQL.</span> I love working on projects of any kind and open to freelance work! 
          Check out my work and feel free to contact me.

        </motion.h1>
        {/* Github bio description for FastTrack req */}
        {/* {profile?.bio && (
            <motion.p className='text-lg mt-4'
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                {profile.bio}
            </motion.p>
            )} */}
        <motion.div className='flex flex-col sm:flex-row items-center justify-center gap-2 px-4 text-lg font-medium'
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                delay: 0.1,
            }}>
            <Link href='#contact' className='group bg-gray-900 text-white px-7 py-3 flex items-center gap-2 rounded-full outline-none focus:scale-110 hover:scale-110 hover:bg-gray-950 active:scale-105 transition'
            onClick={() => {
                setActiveSection('Contact')
                setTimeOfLastClick(Date.now())
            }}>
                Contact me here <BsArrowRight className='opacity-70 group-hover:translate-x-1 transition'/>
            </Link>
            <a className='group bg-white px-7 py-3 flex items-center gap-2 rounded-full outline-none focus:scale-110 hover:scale-110 active:scale-105 transition cursor-pointer borderBlack dark:bg-white/10' href='https://drive.google.com/file/d/124UvB8_y9UGdQD6Evo_XQpVLoFG0G7m5/view?usp=sharing' target='_blank'>
                Download CV <HiDownload className='opacity-60 group-hover:translate-y-1 transition'
                />
            </a>
            <a className='group bg-white p-4 text-gray-700 flex items-center gap-2 rounded-full focus:scale-110 hover:scale-110 active:scale-[1.15] hover:text-gray-950 transition cursor-pointer borderBlack dark:bg-white/10 dark:text-white/60'
                href='https://linkedin.com/in/paolo-alberca' target='_blank'>
                <BsLinkedin />
                <span className="absolute top-10 scale-0 transition-all rounded bg-gray-800 p-2 text-xs text-white group-hover:scale-100">🤝 LinkedIn</span>
            </a>
            <a className='group bg-white p-4 text-gray-700 flex items-center gap-2 text-[1.35rem] rounded-full focus:scale-[1.15] hover:scale-[1.15] hover:text-gray-950 active:scale-105 transition cursor-pointer borderBlack dark:bg-white/10 dark:text-white/60'
            href='https://github.com/omgitsmiles' target='_blank'>
                <FaGithubSquare />
                <span className="absolute top-10 scale-0 transition-all rounded bg-gray-800 p-2 text-xs text-white group-hover:scale-100">📂 Github</span>
            </a>
            <a className='group bg-white p-4 text-gray-700 flex items-center gap-2 text-[1.35rem] rounded-full focus:scale-[1.15] hover:scale-[1.15] hover:text-gray-950 active:scale-105 transition cursor-pointer borderBlack dark:bg-white/10 dark:text-white/60'
            href='https://medium.com/@paolo.alberca' target='_blank'>
                <FaMedium />
                <span className="absolute top-10 scale-0 transition-all rounded bg-gray-800 p-2 text-xs text-white group-hover:scale-100">✍🏼 Blog</span>
            </a>
        </motion.div>
    </section>
  )
}
