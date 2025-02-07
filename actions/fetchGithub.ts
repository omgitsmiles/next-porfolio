'use server'

export const fetchGithubApi = async () => {
    const response = await fetch('https://api.github.com/users/omgitsmiles');
    if (!response.ok) {
        throw new Error('Failed to fetch profile data');
    }
    return response.json();
}