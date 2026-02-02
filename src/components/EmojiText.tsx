import React, { useState, useEffect } from 'react'
import { AnimatedEmoji } from './AnimatedEmoji'
import { useEmojiStyle, type EmojiStyle } from '../hooks/use-emoji-style'
import emojiRegex from 'emoji-regex'

interface EmojiTextProps {
    text: string
    className?: string
    emojiSet?: EmojiStyle
    size?: number | string
}

const CDN_BASE = 'https://cdn.jsdelivr.net/npm/emoji-datasource-'

const toHex = (str: string): string => {
    const output: string[] = []
    for (let i = 0; i < str.length; i++) {
        const code = str.codePointAt(i)
        if (code) {
            output.push(code.toString(16))
            if (code > 0xffff) i++
        }
    }
    return output.join('-')
}

export const EmojiText: React.FC<EmojiTextProps> = ({
    text,
    className,
    size = '1.2em',
    emojiSet
}) => {
    const { style: currentStyle, isClient } = useEmojiStyle('apple')
    const activeSet = emojiSet || currentStyle

    if (!text) return null
    if (!isClient) return <span className={className}>{text}</span>
    if (activeSet === 'native') return <span className={className}>{text}</span>

    const regex = emojiRegex()
    let match
    let lastIndex = 0
    const parts: React.ReactNode[] = []

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push(text.substring(lastIndex, match.index))
        }

        const emojiChar = match[0]
        const hex = toHex(emojiChar)

        if (activeSet === 'flexhunt') {
            parts.push(
                <span key={match.index} style={{ display: 'inline-flex', alignItems: 'center', margin: '0 0.05em' }}>
                    <AnimatedEmoji
                        id={emojiChar}
                        size={typeof size === 'number' ? size : `calc(${size} + 4px)`}
                    />
                </span>
            )
        } else {
            const cdnSet = activeSet
            parts.push(
                <img
                    key={match.index}
                    src={`${CDN_BASE}${cdnSet}@15.0.0/img/${cdnSet}/64/${hex}.png`}
                    alt={emojiChar}
                    style={{
                        display: 'inline-block',
                        verticalAlign: 'text-bottom',
                        height: typeof size === 'number' ? `${size}px` : size,
                        width: 'auto',
                        margin: '0 0.05em 0.1em 0.05em',
                        userSelect: 'none',
                        pointerEvents: 'none'
                    }}
                    loading="lazy"
                    onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        const span = document.createElement('span')
                        span.textContent = emojiChar
                        e.currentTarget.parentNode?.insertBefore(span, e.currentTarget)
                    }}
                />
            )
        }

        lastIndex = regex.lastIndex
    }

    if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex))
    }

    return (
        <span className={className} style={{ display: 'inline-block' }}>
            {parts.length > 0 ? parts : text}
        </span>
    )
}
