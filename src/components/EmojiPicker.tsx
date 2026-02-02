import React, { useState, useMemo, useCallback } from 'react'
import { AnimatedEmoji } from './AnimatedEmoji'
import { useEmojiStyle } from '../hooks/use-emoji-style'
import emojiMapRaw from '../data/emoji-map.json'

const emojiMap = emojiMapRaw as Record<string, string>

// Skin tone modifiers
const SKIN_TONES = [
    { id: 'none', color: '#ffb930', label: 'Default' }, // Default yellow
    { id: 'light', color: '#fadcbc', code: '1f3fb', label: 'Light' },
    { id: 'medium-light', color: '#e0bb95', code: '1f3fc', label: 'Medium-Light' },
    { id: 'medium', color: '#bf8f68', code: '1f3fd', label: 'Medium' },
    { id: 'medium-dark', color: '#9b643d', code: '1f3fe', label: 'Medium-Dark' },
    { id: 'dark', color: '#594539', code: '1f3ff', label: 'Dark' },
]

// Inject picker styles once
const pickerStyleId = 'emoji-kit-picker-style'
if (typeof document !== 'undefined' && !document.getElementById(pickerStyleId)) {
    const style = document.createElement('style')
    style.id = pickerStyleId
    style.textContent = `
        .emoji-picker-container {
            display: flex;
            flex-direction: column;
            background: var(--emoji-picker-bg, #1a1a1a);
            border-radius: var(--emoji-picker-radius, 12px);
            box-shadow: 0 8px 32px rgba(0,0,0,0.4);
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .emoji-picker-container.dynamic-width {
            min-width: 280px;
            resize: horizontal;
            overflow: auto;
        }
        .emoji-picker-header {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            border-bottom: 1px solid var(--emoji-picker-border, #333);
        }
        .emoji-picker-preview {
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            background: var(--emoji-picker-preview-bg, #2a2a2a);
            border-radius: 10px;
            flex-shrink: 0;
        }
        .emoji-picker-search {
            flex: 1;
        }
        .emoji-picker-search input {
            width: 100%;
            padding: 10px 14px;
            border: none;
            border-radius: 8px;
            background: var(--emoji-picker-input-bg, #2a2a2a);
            color: var(--emoji-picker-text, #fff);
            font-size: 14px;
            outline: none;
        }
        .emoji-picker-search input::placeholder {
            color: #888;
        }
        .emoji-picker-search input:focus {
            background: var(--emoji-picker-input-focus, #333);
        }
        .emoji-picker-categories {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 12px;
            border-bottom: 1px solid var(--emoji-picker-border, #333);
        }
        .emoji-picker-cat-list {
            display: flex;
            gap: 2px;
            overflow-x: auto;
        }
        .emoji-picker-cat-list::-webkit-scrollbar {
            height: 0px;
            display: none;
        }
        .emoji-picker-category-btn {
            padding: 6px;
            border: none;
            border-radius: 6px;
            background: transparent;
            color: #888;
            font-size: 18px;
            cursor: pointer;
            transition: all 0.15s;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
        }
        .emoji-picker-category-btn:hover {
            background: var(--emoji-picker-hover, #333);
            color: var(--emoji-picker-text, #fff);
        }
        .emoji-picker-category-btn.active {
            background: var(--emoji-picker-active, #3b82f6);
            color: #fff;
        }
        .emoji-picker-skin-tones {
            display: flex;
            gap: 4px;
            padding-left: 8px;
            border-left: 1px solid var(--emoji-picker-border, #333);
        }
        .skin-tone-btn {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            border: none;
            cursor: pointer;
            transition: transform 0.1s;
        }
        .skin-tone-btn:hover {
            transform: scale(1.2);
        }
        .skin-tone-btn.active {
            transform: scale(1.3);
            box-shadow: 0 0 0 2px var(--emoji-picker-active, #3b82f6);
        }
        .emoji-picker-grid {
            display: grid;
            grid-template-columns: repeat(8, 1fr);
            gap: 2px;
            padding: 8px;
            max-height: var(--emoji-picker-grid-height, 280px);
            overflow-y: auto;
            content-visibility: auto; 
        }
        .emoji-picker-grid::-webkit-scrollbar {
            width: 6px;
        }
        .emoji-picker-grid::-webkit-scrollbar-thumb {
            background: #444;
            border-radius: 3px;
        }
        .emoji-picker-item {
            display: flex;
            align-items: center;
            justify-content: center;
            aspect-ratio: 1;
            font-size: var(--emoji-picker-emoji-size, 24px);
            border-radius: 6px;
            cursor: pointer;
            transition: background 0.1s;
            user-select: none;
        }
        .emoji-picker-item:hover {
            background: var(--emoji-picker-hover, #333);
        }
        .emoji-picker-item:active {
            transform: scale(0.95);
        }
        .emoji-picker-empty {
            grid-column: 1 / -1;
            padding: 40px;
            text-align: center;
            color: #666;
        }
        .emoji-picker-footer {
            padding: 8px 12px;
            border-top: 1px solid var(--emoji-picker-border, #333);
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 11px;
            color: #666;
        }
    `
    document.head.appendChild(style)
}

// Default categories with emoji icons
const DEFAULT_CATEGORIES = [
    { id: 'all', icon: '🎯', label: 'All' },
    { id: 'Smileys', icon: '😊', label: 'Smileys' },
    { id: 'People', icon: '👋', label: 'People' },
    { id: 'Animals', icon: '🐱', label: 'Animals' },
    { id: 'Food', icon: '🍕', label: 'Food' },
    { id: 'Activity', icon: '⚽', label: 'Activity' },
    { id: 'Travel', icon: '✈️', label: 'Travel' },
    { id: 'Objects', icon: '💡', label: 'Objects' },
    { id: 'Symbols', icon: '❤️', label: 'Symbols' },
]

export interface CategoryConfig {
    id: string
    icon?: string
    label?: string
}

export interface EmojiPickerProps {
    onSelect: (emoji: string) => void
    width?: number | string
    columns?: number
    showPreview?: boolean
    dynamicWidth?: boolean
    categories?: CategoryConfig[]
    searchPlaceholder?: string
    maxHeight?: number
    theme?: 'dark' | 'light' | 'auto'
    showFooter?: boolean
    emojiSize?: number
}

// Convert string to hex for CDN
const toHex = (str: string): string => {
    const output: string[] = []
    for (let i = 0; i < str.length; i++) {
        const code = str.codePointAt(i)
        if (code) {
            // if (code === 0xfe0f) continue // keep selector for some
            output.push(code.toString(16).toLowerCase())
            if (code > 0xffff) i++
        }
    }
    return output.join('-')
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
    onSelect,
    width = 320,
    columns = 8,
    showPreview = true,
    dynamicWidth = false,
    categories,
    searchPlaceholder = 'Search emojis...',
    maxHeight = 280,
    theme = 'dark',
    showFooter = false,
    emojiSize = 24
}) => {
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState('all')
    const [hoveredEmoji, setHoveredEmoji] = useState<string | null>(null)
    const [skinTone, setSkinTone] = useState('none')

    // Get global style from context to render selected style in grid
    const { style: globalStyle } = useEmojiStyle()
    const activeStyle = globalStyle || 'apple'

    // Check if simple native rendering (if user wants "sexy", we use images unless style is 'native')
    const useNativeRender = activeStyle === 'native'

    const activeCategories = categories || DEFAULT_CATEGORIES

    // Get all native emojis (not shortcodes) - memoized
    const allEmojis = useMemo(() => {
        return Object.entries(emojiMap)
            .filter(([key]) => !/^[a-zA-Z0-9_+-]+$/.test(key))
            .map(([emoji, path]) => ({ emoji, path }))
    }, [])

    const filteredEmojis = useMemo(() => {
        return allEmojis.filter(({ emoji, path }) => {
            if (search) {
                const searchLower = search.toLowerCase()
                const pathLower = path.toLowerCase()
                if (!emoji.includes(search) && !pathLower.includes(searchLower)) {
                    return false
                }
            }
            if (category !== 'all') {
                if (!path.startsWith(category)) {
                    return false
                }
            }
            return true
        })
    }, [allEmojis, search, category])

    const handleSelect = useCallback((emoji: string) => {
        onSelect(emoji) // Pass base emoji (TODO: Apply skin tone if supported)
    }, [onSelect])

    // Theme styles
    const themeStyles = theme === 'light' ? {
        '--emoji-picker-bg': '#ffffff',
        '--emoji-picker-border': '#e5e5e5',
        '--emoji-picker-preview-bg': '#f5f5f5',
        '--emoji-picker-input-bg': '#f5f5f5',
        '--emoji-picker-input-focus': '#ebebeb',
        '--emoji-picker-text': '#1a1a1a',
        '--emoji-picker-hover': '#f0f0f0',
        '--emoji-picker-active': '#3b82f6',
    } as React.CSSProperties : {} as React.CSSProperties

    // Generate URL for optimized rendering (bypass AnimatedEmoji overhead)
    const getOptimizedUrl = (emoji: string) => {
        const path = emojiMap[emoji]
        if (activeStyle === 'flexhunt' && path) {
            return `https://raw.githubusercontent.com/AyuXh/telegram-emoji/main/animated/main/${path}`
        }
        // Simplified CDN fallback logic for grid speed
        return `https://cdn.jsdelivr.net/npm/emoji-datasource-${activeStyle}/img/${activeStyle}/64/${toHex(emoji)}.png`
    }

    return (
        <div
            className={`emoji-picker-container ${dynamicWidth ? 'dynamic-width' : ''}`}
            style={{
                width: dynamicWidth ? undefined : width,
                ['--emoji-picker-grid-height' as string]: `${maxHeight}px`,
                ['--emoji-picker-emoji-size' as string]: `${emojiSize}px`,
                ...themeStyles
            }}
        >
            {/* Header */}
            <div className="emoji-picker-header">
                {showPreview && (
                    <div className="emoji-picker-preview">
                        {hoveredEmoji ? (
                            <AnimatedEmoji id={hoveredEmoji} size={32} />
                        ) : (
                            <span style={{ fontSize: 28, opacity: 0.3 }}>😊</span>
                        )}
                    </div>
                )}
                <div className="emoji-picker-search">
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Categories & Skin Tones */}
            <div className="emoji-picker-categories">
                <div className="emoji-picker-cat-list">
                    {activeCategories.map((cat) => (
                        <button
                            key={cat.id}
                            className={`emoji-picker-category-btn ${category === cat.id ? 'active' : ''}`}
                            onClick={() => setCategory(cat.id)}
                            title={cat.label || cat.id}
                        >
                            {cat.icon || cat.id.charAt(0)}
                        </button>
                    ))}
                </div>

                {/* Skin Tone Selector - Right Aligned */}
                <div className="emoji-picker-skin-tones">
                    {SKIN_TONES.map(tone => (
                        <button
                            key={tone.id}
                            className={`skin-tone-btn ${skinTone === tone.id ? 'active' : ''}`}
                            style={{ backgroundColor: tone.color }}
                            onClick={() => setSkinTone(tone.id)}
                            title={tone.label}
                        />
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div
                className="emoji-picker-grid"
                style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
            >
                {filteredEmojis.length > 0 ? (
                    filteredEmojis.map(({ emoji }) => (
                        <div
                            key={emoji}
                            className="emoji-picker-item"
                            onClick={() => handleSelect(emoji)}
                            onMouseEnter={() => setHoveredEmoji(emoji)}
                            onMouseLeave={() => setHoveredEmoji(null)}
                        >
                            {useNativeRender ? (
                                emoji
                            ) : (
                                <img
                                    src={getOptimizedUrl(emoji)}
                                    alt={emoji}
                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                    loading="lazy"
                                    decoding="async"
                                />
                            )}
                        </div>
                    ))
                ) : (
                    <div className="emoji-picker-empty">
                        No emojis found
                    </div>
                )}
            </div>

            {/* Footer */}
            {showFooter && (
                <div className="emoji-picker-footer">
                    <span>{filteredEmojis.length} emojis</span>
                    <span>emoji-kit</span>
                </div>
            )}
        </div>
    )
}
