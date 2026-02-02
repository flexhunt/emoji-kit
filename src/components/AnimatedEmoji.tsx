import React, { useEffect, useState, useRef } from 'react'
// @ts-ignore
import emojiMapRaw from '../data/emoji-map.json'
import { useEmojiStyle, EmojiStyle } from '../hooks/use-emoji-style'

const emojiMap: Record<string, string> = emojiMapRaw

interface AnimatedEmojiProps {
    id: string
    size?: number | string
    className?: string
    style?: React.CSSProperties
    /**
     * Override the global style for this specific emoji
     */
    emojiStyle?: EmojiStyle
}

const BASE_ANIMATED_URL = 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main'

const getCdnUrl = (hex: string, style: EmojiStyle) => {
    switch (style) {
        case 'apple':
            return `https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.0/img/apple/64/${hex}.png`
        case 'google':
            return `https://cdn.jsdelivr.net/npm/emoji-datasource-google@15.0.0/img/google/64/${hex}.png`
        case 'twitter':
            return `https://cdn.jsdelivr.net/npm/emoji-datasource-twitter@15.0.0/img/twitter/64/${hex}.png`
        case 'facebook':
            return `https://cdn.jsdelivr.net/npm/emoji-datasource-facebook@15.0.0/img/facebook/64/${hex}.png`
        default:
            return null
    }
}

const toHex = (str: string, skipFe0f: boolean = true): string => {
    const output: string[] = []
    for (let i = 0; i < str.length; i++) {
        const code = str.codePointAt(i)
        if (code) {
            // Optionally skip variation selector (fe0f) as CDN filenames are inconsistent
            if (skipFe0f && code === 0xfe0f) continue
            output.push(code.toString(16).toLowerCase())
            if (code > 0xffff) i++
        }
    }
    return output.join('-')
}


export const AnimatedEmoji: React.FC<AnimatedEmojiProps> = ({
    id,
    size = 24,
    className,
    style: customStyle,
    emojiStyle: propStyle
}) => {
    const { style: globalStyle } = useEmojiStyle()
    const activeStyle = propStyle || globalStyle || 'apple'

    const [isVisible, setIsVisible] = useState(false)
    const [urlIndex, setUrlIndex] = useState(0) // Track which URL we're trying
    const [hasError, setHasError] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!containerRef.current) return

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setIsVisible(true)
                    observer.disconnect()
                }
            },
            { threshold: 0.1 }
        )

        observer.observe(containerRef.current)
        return () => observer.disconnect()
    }, [])

    const sizeValue = typeof size === 'number' ? size : size

    // Helper: Check if id is a shortcode (alphanumeric/underscore/dash) vs native emoji
    const isShortcode = /^[a-zA-Z0-9_+-]+$/.test(id)
    const mappedPath = emojiMap[id]
    const isFlexhunt = activeStyle === 'flexhunt' || !activeStyle



    // Build list of URLs to try in order
    const urls: string[] = []

    if (isFlexhunt) {
        // Flexhunt: animated first, then apple CDN fallback
        if (mappedPath) {
            urls.push(`${BASE_ANIMATED_URL}/${mappedPath}`)
        }
        if (!isShortcode) {
            // Try CDN with fe0f stripped, then with fe0f
            const urlWithoutFe0f = getCdnUrl(toHex(id, true), 'apple')
            const urlWithFe0f = getCdnUrl(toHex(id, false), 'apple')
            if (urlWithoutFe0f) urls.push(urlWithoutFe0f)
            if (urlWithFe0f && urlWithFe0f !== urlWithoutFe0f) urls.push(urlWithFe0f)
        }
    } else {
        // Static styles: CDN first, then animated fallback for shortcodes
        if (isShortcode) {
            // Shortcodes can't be converted to hex, use animated
            if (mappedPath) {
                urls.push(`${BASE_ANIMATED_URL}/${mappedPath}`)
            }
        } else {
            // Native emoji: try CDN with different hex formats
            const urlWithoutFe0f = getCdnUrl(toHex(id, true), activeStyle)
            const urlWithFe0f = getCdnUrl(toHex(id, false), activeStyle)
            if (urlWithoutFe0f) urls.push(urlWithoutFe0f)
            if (urlWithFe0f && urlWithFe0f !== urlWithoutFe0f) urls.push(urlWithFe0f)
            // Also try animated as last resort
            if (mappedPath) {
                urls.push(`${BASE_ANIMATED_URL}/${mappedPath}`)
            }
        }
    }

    const currentUrl = urls[urlIndex]



    // Handle image error - try next URL
    const handleError = () => {
        if (urlIndex < urls.length - 1) {
            setUrlIndex(urlIndex + 1)
        } else {
            setHasError(true)
        }
    }

    // Fallback to native text
    if (activeStyle === 'native' || hasError || urls.length === 0) {
        return (
            <span
                className={className}
                style={{
                    fontSize: typeof size === 'number' ? `${size}px` : size,
                    lineHeight: '1',
                    display: 'inline-block',
                    verticalAlign: 'middle',
                    fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
                    ...customStyle
                }}
            >
                {id}
            </span>
        )
    }

    return (
        <span
            ref={containerRef}
            className={className}
            style={{
                width: sizeValue,
                height: sizeValue,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                verticalAlign: 'middle',
                lineHeight: 0,
                ...customStyle
            }}
        >
            {isVisible ? (
                <img
                    src={currentUrl}
                    alt={id}
                    width="100%"
                    height="100%"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    loading="lazy"
                    onError={handleError}
                />
            ) : (
                <span style={{ width: sizeValue, height: sizeValue, display: 'inline-block' }} />
            )}
        </span>
    )
}

