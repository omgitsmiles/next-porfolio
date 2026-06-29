import React from 'react'
import {
  Html, Body, Head, Heading, Hr,
  Container, Preview, Section, Text,
} from '@react-email/components'
import { Tailwind } from '@react-email/components'

type ContactFormEmailProps = {
  message: string
  senderEmail: string
  subject: string
}

export default function ContactFormEmail({ message, senderEmail, subject }: ContactFormEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>
      <Tailwind>
        <Body className="bg-gray-100 text-black">
          <Container>
            <Section className="bg-white my-10 px-10 py-4 rounded-md">
              <Heading className="leading-tight">{subject}</Heading>
              <Text>{message}</Text>
              <Hr />
              <Text>From: {senderEmail}</Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
