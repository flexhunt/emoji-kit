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


// Shimmer animation keyframes injected once
const shimmerStyleId = 'emoji-kit-shimmer-style'
if (typeof document !== 'undefined' && !document.getElementById(shimmerStyleId)) {
    const style = document.createElement('style')
    style.id = shimmerStyleId
    style.textContent = `
        @keyframes emoji-shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }
    `
    document.head.appendChild(style)
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
    const [isLoaded, setIsLoaded] = useState(false)
    const [urlIndex, setUrlIndex] = useState(0)
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

    // Helper: Check if id is a shortcode vs native emoji
    const isShortcode = /^[a-zA-Z0-9_+-]+$/.test(id)
    const mappedPath = emojiMap[id]
    const isFlexhunt = activeStyle === 'flexhunt' || !activeStyle

    // Get display emoji for skeleton (use native emoji or shortcode text)
    const displayEmoji = isShortcode ? (emojiMap[id] ? id : `:${id}:`) : id

    // Build list of URLs to try in order
    const urls: string[] = []

    if (isFlexhunt) {
        if (mappedPath) {
            urls.push(`${BASE_ANIMATED_URL}/${mappedPath}`)
        }
        if (!isShortcode) {
            const urlWithoutFe0f = getCdnUrl(toHex(id, true), 'apple')
            const urlWithFe0f = getCdnUrl(toHex(id, false), 'apple')
            if (urlWithoutFe0f) urls.push(urlWithoutFe0f)
            if (urlWithFe0f && urlWithFe0f !== urlWithoutFe0f) urls.push(urlWithFe0f)
        }
    } else {
        if (isShortcode) {
            if (mappedPath) {
                urls.push(`${BASE_ANIMATED_URL}/${mappedPath}`)
            }
        } else {
            const urlWithoutFe0f = getCdnUrl(toHex(id, true), activeStyle)
            const urlWithFe0f = getCdnUrl(toHex(id, false), activeStyle)
            if (urlWithoutFe0f) urls.push(urlWithoutFe0f)
            if (urlWithFe0f && urlWithFe0f !== urlWithoutFe0f) urls.push(urlWithFe0f)
            if (mappedPath) {
                urls.push(`${BASE_ANIMATED_URL}/${mappedPath}`)
            }
        }
    }

    const currentUrl = urls[urlIndex]

    const handleError = () => {
        if (urlIndex < urls.length - 1) {
            setUrlIndex(urlIndex + 1)
            setIsLoaded(false)
        } else {
            setHasError(true)
        }
    }

    const handleLoad = () => {
        setIsLoaded(true)
    }

    // Fallback to native text
    if (activeStyle === 'native' || hasError || urls.length === 0) {
        return (
            <span
                className={className}
                role="img"
                aria-label={`emoji ${id}`}
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

    // Skeleton loader styles
    const skeletonStyles: React.CSSProperties = {
        fontSize: typeof size === 'number' ? `${size * 0.8}px` : size,
        lineHeight: '1',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: sizeValue,
        height: sizeValue,
        filter: 'grayscale(100%)',
        opacity: 0.3,
        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
        backgroundSize: '200% 100%',
        animation: 'emoji-shimmer 1.5s infinite',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    }

    return (
        <span
            ref={containerRef}
            className={className}
            role="img"
            aria-label={`emoji ${id}`}
            style={{
                width: sizeValue,
                height: sizeValue,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                verticalAlign: 'middle',
                lineHeight: 0,
                position: 'relative',
                ...customStyle
            }}
        >
            {/* Skeleton: greyed native emoji with shimmer */}
            {(!isVisible || !isLoaded) && (
                <span style={skeletonStyles}>
                    {displayEmoji}
                </span>
            )}

            {/* Actual image */}
            {isVisible && (
                <img
                    src={currentUrl}
                    alt={id}
                    width="100%"
                    height="100%"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        position: isLoaded ? 'relative' : 'absolute',
                        opacity: isLoaded ? 1 : 0,
                        transition: 'opacity 0.2s ease-in-out',
                    }}
                    loading="lazy"
                    onLoad={handleLoad}
                    onError={handleError}
                />
            )}
        </span>
    )
}

