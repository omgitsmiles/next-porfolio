'use server'
import React from 'react'
import { z } from 'zod'
import { Resend } from 'resend'
import { validateString, getErrorMessage } from '../lib/utils'
import ContactFormEmail from '../email/contact-form-email'
import emailjs from 'emailjs-com'

const ContactSchema = z.object({
    email: z.string(),
    message: z.string(),
})

export type State = {
    errors?: {
        email: string[],
        message: string[],
    },
    message?: string | null
}

const parsedData = ContactSchema.safeParse(FormData)

const resend = new Resend(process.env.RESEND_API_KEY)



export const sendEmail = async (formData: FormData) => {
    const message = formData.get('message')
    const senderEmail = formData.get('senderEmail')

    if (!validateString(senderEmail, 500)) {
        return {
            error: "Invalid sender email"
        }
    }

    if(!validateString(message, 5000)) {
        return {
            error: "Invlaid message"
        }
    }

    let data;
    
    try {
        data = await resend.emails.send({
            from: 'Resend <onboarding@resend.dev>',
            to: 'paolo.alberca@gmail.com',
            subject: "Message",
            reply_to: senderEmail as string,
            text: message as string,
            react: React.createElement(ContactFormEmail, {
                message: message as string,
                senderEmail: senderEmail as string 
            })

        })
    } catch (error: unknown) {
        return {
            error: getErrorMessage(error)
        }
    }
    return {
        data,
    }
}

// emailjs.send(
//     process.env.EMAIL_JS_SERVICE,
//     process.env.EMAIL_JS_TEMPLATE,
//     State,
//     process.env.EMAIL_JS_USER,
// ).then({ status }) => {
//     setForm
// }