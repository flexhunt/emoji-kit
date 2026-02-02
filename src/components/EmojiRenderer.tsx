import React from 'react'
import { AnimatedEmoji } from './AnimatedEmoji'
import emojiRegex from 'emoji-regex'

// Regex to match:
// 1. Shortcodes like :smile:
// 2. Any native unicode emoji (using emoji-regex package)
const SHORTCODE_REGEX = /:[a-zA-Z0-9_+-]+:/g
const EMOJI_REGEX = emojiRegex()

// Combined pattern that matches either shortcodes or native emojis
const createCombinedRegex = () => {
    // Get the emoji regex source and combine with shortcode pattern
    const emojiPattern = EMOJI_REGEX.source
    return new RegExp(`(:[a-zA-Z0-9_+-]+:|${emojiPattern})`, 'g')
}

const COMBINED_REGEX = createCombinedRegex()

interface EmojiRendererProps {
    text: string
    size?: number | string
    className?: string
}

export const EmojiRenderer: React.FC<EmojiRendererProps> = ({ text, size = 24, className }) => {
    if (!text) return null

    const parts = text.split(COMBINED_REGEX).filter(part => part !== undefined && part !== '')

    return (
        <>
            {parts.map((part, index) => {
                // Check if it's a shortcode
                if (part.startsWith(':') && part.endsWith(':')) {
                    const shortcode = part.slice(1, -1)
                    return (
                        <AnimatedEmoji
                            key={`${shortcode}-${index}`}
                            id={shortcode}
                            size={size}
                            className={className}
                        />
                    )
                }

                // Check if it's an emoji (matches emoji regex)
                if (EMOJI_REGEX.test(part)) {
                    // Reset regex lastIndex since we're reusing it
                    EMOJI_REGEX.lastIndex = 0
                    return (
                        <AnimatedEmoji
                            key={`${part}-${index}`}
                            id={part}
                            size={size}
                            className={className}
                        />
                    )
                }

                // Plain text
                return <span key={index}>{part}</span>
            })}
        </>
    )
}

