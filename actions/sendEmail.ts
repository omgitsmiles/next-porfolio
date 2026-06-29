'use server'
import React from 'react'
import { Resend } from 'resend'
import { validateString, getErrorMessage } from '../lib/utils'
import ContactFormEmail from '../email/contact-form-email'

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendEmail = async (formData: FormData) => {
    const senderEmail = formData.get('senderEmail')
    const subject     = formData.get('subject')
    const message     = formData.get('message')

    if (!validateString(senderEmail, 500)) return { error: "Invalid sender email" }
    if (!validateString(subject, 200))     return { error: "Subject is required" }
    if (!validateString(message, 5000))    return { error: "Message is required" }

    try {
        const data = await resend.emails.send({
            from: 'Portfolio <onboarding@resend.dev>',
            to: 'paolo.alberca@gmail.com',
            subject: subject as string,
            reply_to: senderEmail as string,
            react: React.createElement(ContactFormEmail, {
                message:     message as string,
                senderEmail: senderEmail as string,
                subject:     subject as string,
            }),
        })
        return { data }
    } catch (error: unknown) {
        return { error: getErrorMessage(error) }
    }
}
