'use client'

import React, { useRef } from 'react'
import SectionHeading from './section-heading'
import { motion } from 'framer-motion'
import { useSectionInView } from '../../lib/hooks'
import { sendEmail } from '../../actions/sendEmail'
import toast from 'react-hot-toast'
import SubmitBtn from './submit-btn'

export default function Contact() {
    const { ref } = useSectionInView('Contact')
    const formRef = useRef<HTMLFormElement>(null)

  return (
    <motion.section
    id='contact' 
    ref={ref} 
    className='scroll-mt-28 mb-20 sm:mb-28 w-[min(100%,38rem)] text-center'
    initial={{
        opacity: 0,
    }}
    whileInView={{
        opacity: 1,
    }}
    transition={{
        duration: 1,
    }}
    viewport={{
        once: true
    }}>
        <SectionHeading>Contact Me</SectionHeading>
        <p className='text-gray-700 -mt-6 dark:text-white/80'>Please contact me directly at {' '} 
            <a className='underline' href='mailto:paolo.alberca@gmail.com'>
            paolo.alberca@gmail.com
            </a>{' '}
            or through this form. 
        </p>
        <form ref={formRef} className='mt-10 flex flex-col dark:text-black/80' action={async (formData) => {
            const { data, error } = await sendEmail(formData)
 
            if (error) {
                toast.error(error)
                return
            }

            toast.success('Email Sent!')
            formRef.current?.reset()
        }}>
            <input type='email' className='h-14 px-4 rounded-lg borderBlack dark:bg-white dark:bg-opacity-80 dark:focus:bg-opacity-100 transition-all dark:outline-none'
            placeholder='Your email'
            name='senderEmail'
            required
            maxLength={500}/>
            <textarea className='h-52 my-3 rounded-lg borderBlack p-4 dark:bg-white dark:bg-opacity-80 dark:focus:bg-opacity-100 transition-all dark:outline-none'
            placeholder='Your message'
            name='message'
            required
            maxLength={5000}/>
           <SubmitBtn />
        </form>
    </motion.section>
  )
}

