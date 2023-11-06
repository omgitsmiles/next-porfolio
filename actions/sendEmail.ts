'use server'

export const sendEmail = async (formData: FormData) => {
    'use server'

    console.log('server')
    console.log(formData.get('senderEmail'))
    console.log(formData.get('message'))
}