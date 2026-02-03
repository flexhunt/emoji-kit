import { useCallback, useRef } from 'react'
import emojiRegex from 'emoji-regex'
// @ts-ignore
import emojiMapRaw from '../data/emoji-map.json'
import { EmojiStyle, useEmojiStyle } from './use-emoji-style'

const emojiMap: Record<string, string> = emojiMapRaw

const EMOJI_REGEX = emojiRegex()

// Base URLs for emoji images
const ANIMATED_BASE_URL = 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main'
const APPLE_CDN_URL = 'https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.0/img/apple/64'

// Convert emoji to hex code for CDN URL
const toHex = (str: string): string => {
    const output: string[] = []
    for (let i = 0; i < str.length; i++) {
        const code = str.codePointAt(i)
        if (code) {
            if (code === 0xfe0f) continue // Skip variation selector
            output.push(code.toString(16).toLowerCase())
            if (code > 0xffff) i++
        }
    }
    return output.join('-')
}

interface UseEmojiInputOptions {
    emojiSize?: number
    /** Emoji style: 'apple' | 'google' | 'twitter' | 'facebook' | 'flexhunt' */
    emojiStyle?: EmojiStyle
}

export function useEmojiInput(options: UseEmojiInputOptions = {}) {
    const { emojiSize = 20, emojiStyle: propStyle } = options
    const { style: globalStyle } = useEmojiStyle()
    const activeStyle = propStyle || globalStyle || 'flexhunt'
    const lastHtmlRef = useRef<string>('')

    /**
     * Get all native emojis from text (shortcodes removed to prevent cursor issues)
     */
    const getAllEmojis = useCallback((text: string): string[] => {
        // Find native emojis only
        const nativeMatches = text.match(EMOJI_REGEX)
        if (nativeMatches) {
            return [...new Set(nativeMatches)]
        }
        return []
    }, [])

    /**
     * Create HTML for a native emoji element
     */
    const createEmojiHtml = useCallback((emoji: string): string => {
        const hex = toHex(emoji)
        if (!hex) return emoji // Return as-is if can't convert

        // Get image URL based on selected style
        let imgUrl = ''

        if (activeStyle === 'flexhunt') {
            // Use Flexhunt/Telegram animated emoji
            const animatedPath = emojiMap[emoji]
            if (animatedPath) {
                imgUrl = `${ANIMATED_BASE_URL}/${encodeURIComponent(animatedPath)}`
            } else {
                // Fallback to Apple for unmapped emojis
                imgUrl = `${APPLE_CDN_URL}/${hex}.png`
            }
        } else {
            // Use platform-specific CDN
            const cdnMap: Record<string, string> = {
                apple: `https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.0/img/apple/64/${hex}.png`,
                google: `https://cdn.jsdelivr.net/npm/emoji-datasource-google@15.0.0/img/google/64/${hex}.png`,
                twitter: `https://cdn.jsdelivr.net/npm/emoji-datasource-twitter@15.0.0/img/twitter/64/${hex}.png`,
                facebook: `https://cdn.jsdelivr.net/npm/emoji-datasource-facebook@15.0.0/img/facebook/64/${hex}.png`
            }
            imgUrl = cdnMap[activeStyle] || cdnMap.apple
        }

        return `<img 
            src="${imgUrl}" 
            alt="${emoji}"
            data-emoji="${emoji}" 
            draggable="false"
            style="
                display: inline-block;
                width: ${emojiSize}px;
                height: ${emojiSize}px;
                vertical-align: middle;
                margin: 0 1px;
                object-fit: contain;
            "
            onerror="this.style.display='none';this.insertAdjacentHTML('afterend','${emoji}')"
        />`
    }, [emojiSize, activeStyle])

    /**
     * Replace all text emojis with styled HTML elements
     */
    const replaceEmojisWithHtml = useCallback((text: string): string => {
        const emojis = getAllEmojis(text)
        let result = text

        emojis.forEach(emoji => {
            const escapedEmoji = emoji.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            result = result.replace(new RegExp(escapedEmoji, 'g'), createEmojiHtml(emoji))
        })

        return result
    }, [getAllEmojis, createEmojiHtml])

    /**
     * Extract clean text from HTML (converts emoji spans back to text)
     */
    const extractTextFromHtml = useCallback((html: string): string => {
        const container = document.createElement('div')
        container.innerHTML = html

        // Replace emoji spans with their data-emoji value
        const emojiSpans = container.querySelectorAll('[data-emoji]')
        emojiSpans.forEach(span => {
            const emoji = span.getAttribute('data-emoji') || ''
            span.replaceWith(emoji)
        })

        // Get text content and normalize whitespace
        return container.textContent || ''
    }, [])

    /**
     * Insert HTML at caret position
     */
    const insertHtmlAtCaret = useCallback((html: string) => {
        const selection = window.getSelection()
        if (!selection || selection.rangeCount === 0) return

        const range = selection.getRangeAt(0)
        range.deleteContents()

        const temp = document.createElement('div')
        temp.innerHTML = html

        const fragment = document.createDocumentFragment()
        let lastNode: Node | null = null

        while (temp.firstChild) {
            lastNode = fragment.appendChild(temp.firstChild)
        }

        range.insertNode(fragment)

        // Move cursor after inserted content
        if (lastNode) {
            const newRange = document.createRange()
            newRange.setStartAfter(lastNode)
            newRange.collapse(true)
            selection.removeAllRanges()
            selection.addRange(newRange)
        }
    }, [])

    /**
     * Handle paste event - clean HTML and convert emojis
     */
    const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
        e.preventDefault()

        const text = e.clipboardData.getData('text/plain')
        const html = replaceEmojisWithHtml(text)
        insertHtmlAtCaret(html)
    }, [replaceEmojisWithHtml, insertHtmlAtCaret])

    /**
     * Process input content - detect and render new emojis
     */
    const processContent = useCallback((element: HTMLDivElement): string => {
        const currentText = extractTextFromHtml(element.innerHTML)

        // Check if content has emojis that need rendering
        const emojis = getAllEmojis(currentText)

        if (emojis.length > 0) {
            // Save cursor position
            const selection = window.getSelection()
            const range = selection?.getRangeAt(0)
            const cursorOffset = range?.startOffset || 0

            // Replace emojis with styled versions
            const newHtml = replaceEmojisWithHtml(currentText)

            if (newHtml !== lastHtmlRef.current) {
                element.innerHTML = newHtml
                lastHtmlRef.current = newHtml

                // Restore cursor to end
                const newRange = document.createRange()
                newRange.selectNodeContents(element)
                newRange.collapse(false)
                selection?.removeAllRanges()
                selection?.addRange(newRange)
            }
        }

        return currentText
    }, [extractTextFromHtml, getAllEmojis, replaceEmojisWithHtml])

    return {
        replaceEmojisWithHtml,
        extractTextFromHtml,
        insertHtmlAtCaret,
        handlePaste,
        processContent,
        getAllEmojis
    }
}
