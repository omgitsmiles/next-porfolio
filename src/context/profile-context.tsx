'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchGithubApi } from "../../actions/fetchGithub";

type ProfileContextType = {
    profile:  {
        avatar_url: string;
        bio: string;
    } | null;
};

const ProfileContext = createContext<ProfileContextType | null>(null);

export const ProfileContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [profile, setProfile] = useState<ProfileContextType['profile']>(null);

    useEffect(() => {
        const getProfileData = async () => {
            try {
                const data = await fetchGithubApi();
                setProfile({
                    avatar_url: data.avatar_url,
                    bio: data.bio,
                });
            } catch (error) {
                console.log(error);
            }
        }
        getProfileData();
    }, [])

    return (
        <ProfileContext.Provider value={{ profile }}>
            {children}
        </ProfileContext.Provider>
    )
}

export const useProfileContext = () => {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error('useProfileContext must be used in ProfileContextProvider')
    }
    return context;
};
