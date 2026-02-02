import emojiMapRaw from '../data/emoji-map.json'

const emojiMap = emojiMapRaw as Record<string, string>

const BASE_ANIMATED_URL = 'https://raw.githubusercontent.com/AyuXh/telegram-emoji/main/animated/main'

// Popular emojis to preload for faster rendering
const POPULAR_EMOJIS = [
    '😊', '😂', '❤️', '🔥', '👍', '🎉', '🚀', '✨',
    '💪', '🙏', '😭', '🥺', '💀', '✅', '⭐', '💯',
    '👏', '🤝', '💔', '🎯', '💡', '🌟', '💥', '🏆'
]

/**
 * Preload popular emoji images for faster rendering
 * Call this early in your app (e.g., in useEffect or on app load)
 */
export const preloadPopularEmojis = (): void => {
    if (typeof window === 'undefined') return

    POPULAR_EMOJIS.forEach(emoji => {
        const path = emojiMap[emoji]
        if (path) {
            const img = new Image()
            img.src = `${BASE_ANIMATED_URL}/${path}`
        }
    })
}

/**
 * Preload specific emojis by their IDs (native or shortcode)
 * @param emojis - Array of emoji IDs to preload
 */
export const preloadEmojis = (emojis: string[]): void => {
    if (typeof window === 'undefined') return

    emojis.forEach(emoji => {
        const path = emojiMap[emoji]
        if (path) {
            const img = new Image()
            img.src = `${BASE_ANIMATED_URL}/${path}`
        }
    })
}

/**
 * Get list of all available animated emojis
 */
export const getAvailableEmojis = (): string[] => {
    return Object.keys(emojiMap).filter(key => !/^[a-zA-Z0-9_+-]+$/.test(key))
}

/**
 * Get list of all available shortcodes
 */
export const getAvailableShortcodes = (): string[] => {
    return Object.keys(emojiMap).filter(key => /^[a-zA-Z0-9_+-]+$/.test(key))
}

export { POPULAR_EMOJIS }
