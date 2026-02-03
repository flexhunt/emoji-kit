// Components
export { AnimatedEmoji } from './components/AnimatedEmoji'
export { EmojiText } from './components/EmojiText'
export { EmojiRenderer } from './components/EmojiRenderer'
export { EmojiPicker } from './components/EmojiPicker'
export { EmojiInput } from './components/EmojiInput'
export type { EmojiInputProps, EmojiInputRef } from './components/EmojiInput'

// Hooks
export { useEmojiStyle, STORAGE_KEY, EVENT_NAME } from './hooks/use-emoji-style'
export type { EmojiStyle } from './hooks/use-emoji-style'
export { useEmojiInput } from './hooks/use-emoji-input'

// Utilities
export {
    preloadPopularEmojis,
    preloadEmojis,
    getAvailableEmojis,
    getAvailableShortcodes,
    POPULAR_EMOJIS
} from './utils/preload'
