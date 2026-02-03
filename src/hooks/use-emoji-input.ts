import { useCallback, useRef } from 'react'
import emojiRegex from 'emoji-regex'

const EMOJI_REGEX = emojiRegex()
const SHORTCODE_REGEX = /:[a-zA-Z0-9_+-]+:/g

// Transparent 1x1 gif for emoji placeholder
const TRANSPARENT_GIF = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

interface UseEmojiInputOptions {
    emojiSize?: number
}

export function useEmojiInput(options: UseEmojiInputOptions = {}) {
    const { emojiSize = 20 } = options
    const lastHtmlRef = useRef<string>('')

    /**
     * Get all emojis from text (both native and shortcodes)
     */
    const getAllEmojis = useCallback((text: string): string[] => {
        const emojis: string[] = []

        // Find native emojis
        const nativeMatches = text.match(EMOJI_REGEX)
        if (nativeMatches) {
            emojis.push(...nativeMatches)
        }

        // Find shortcodes
        const shortcodeMatches = text.match(SHORTCODE_REGEX)
        if (shortcodeMatches) {
            emojis.push(...shortcodeMatches)
        }

        return [...new Set(emojis)] // Remove duplicates
    }, [])

    /**
     * Create HTML for an emoji element
     */
    const createEmojiHtml = useCallback((emoji: string): string => {
        const isShortcode = emoji.startsWith(':') && emoji.endsWith(':')
        const emojiId = isShortcode ? emoji.slice(1, -1) : emoji

        // We use a span with data attributes that will be styled/replaced by CSS or JS
        return `<span 
            class="emoji-input-emoji" 
            data-emoji="${emoji}" 
            data-emoji-id="${emojiId}"
            contenteditable="false"
            style="
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: ${emojiSize}px;
                height: ${emojiSize}px;
                vertical-align: middle;
                user-select: all;
            "
        >${emoji}</span>`
    }, [emojiSize])

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
