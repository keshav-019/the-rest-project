'use client'
import { useState, useEffect } from 'react'
import { UserData } from '@/types/User'
import { getUserDetails } from '@/lib/firebase/auth'

export const useUserData = () => {
    const [userData, setUserData] = useState<UserData | null>(null)
    const [loading, setLoading] = useState(true)
    const [teamId, setTeamId] = useState<string | null>(null)

    const refreshUserData = async () => {
        setLoading(true)
        try {
            const { userData } = await getUserDetails()
            setUserData(userData)

            // Set the first team as default if available
            if (userData?.teams) {
                const firstTeamId = Object.keys(userData.teams)[0]
                setTeamId(firstTeamId || null)
            }
        } catch (error) {
            console.error('Error fetching user data:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        refreshUserData()
    }, [])

    const updateUserData = async (newData: UserData) => {
        setUserData(newData)
        // Here you would typically also update Firebase
    }

    return {
        userData,
        loading,
        refreshUserData,
        updateUserData,
        teamId,
        setTeamId
    }
}