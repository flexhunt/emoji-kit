import { useState, useEffect } from 'react'

export type EmojiStyle = 'apple' | 'google' | 'twitter' | 'facebook' | 'native' | 'flexhunt'

const STORAGE_KEY = 'emoji-style'
const EVENT_NAME = 'emoji-style-change'

export function useEmojiStyle(defaultStyle: EmojiStyle = 'apple') {
    const [style, setStyleState] = useState<EmojiStyle>(defaultStyle)
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(STORAGE_KEY) as EmojiStyle | null
            if (saved) {
                setStyleState(saved)
            }
        }
    }, [])

    useEffect(() => {
        const handleChange = () => {
            const saved = localStorage.getItem(STORAGE_KEY) as EmojiStyle | null
            if (saved) {
                setStyleState(saved)
            }
        }
        window.addEventListener(EVENT_NAME, handleChange)
        return () => window.removeEventListener(EVENT_NAME, handleChange)
    }, [])

    const setStyle = (newStyle: EmojiStyle) => {
        setStyleState(newStyle)
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, newStyle)
            window.dispatchEvent(new Event(EVENT_NAME))
        }
    }

    return { style, setStyle, isClient }
}

export { STORAGE_KEY, EVENT_NAME }
