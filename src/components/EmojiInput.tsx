import React, { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import { useEmojiInput } from '../hooks/use-emoji-input'
import { EmojiPicker } from './EmojiPicker'

export interface EmojiInputProps {
    /** Current value (plain text with emojis) */
    value?: string
    /** Called when text changes */
    onChange?: (text: string) => void
    /** Called when Enter is pressed (without Shift) */
    onSubmit?: (text: string) => void
    /** Placeholder text */
    placeholder?: string
    /** Additional class names */
    className?: string
    /** Size of emojis in pixels */
    emojiSize?: number
    /** Show emoji picker button */
    showPicker?: boolean
    /** Custom styles for the container */
    style?: React.CSSProperties
    /** Custom styles for the input area */
    inputStyle?: React.CSSProperties
    /** Disable the input */
    disabled?: boolean
    /** Max length of text */
    maxLength?: number
    /** Called on focus */
    onFocus?: () => void
    /** Called on blur */
    onBlur?: () => void
}

export interface EmojiInputRef {
    /** Focus the input */
    focus: () => void
    /** Clear the input */
    clear: () => void
    /** Get current text value */
    getText: () => string
    /** Insert text at cursor */
    insertText: (text: string) => void
}

const EmojiInputComponent = forwardRef<EmojiInputRef, EmojiInputProps>((props, ref) => {
    const {
        value = '',
        onChange,
        onSubmit,
        placeholder = 'Type a message...',
        className = '',
        emojiSize = 20,
        showPicker = true,
        style,
        inputStyle,
        disabled = false,
        maxLength,
        onFocus,
        onBlur
    } = props

    const inputRef = useRef<HTMLDivElement>(null)
    const [showPlaceholder, setShowPlaceholder] = useState(!value)
    const [pickerOpen, setPickerOpen] = useState(false)

    const {
        replaceEmojisWithHtml,
        extractTextFromHtml,
        handlePaste,
        processContent
    } = useEmojiInput({ emojiSize })

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
        focus: () => inputRef.current?.focus(),
        clear: () => {
            if (inputRef.current) {
                inputRef.current.innerHTML = ''
                setShowPlaceholder(true)
                onChange?.('')
            }
        },
        getText: () => {
            if (!inputRef.current) return ''
            return extractTextFromHtml(inputRef.current.innerHTML)
        },
        insertText: (text: string) => {
            if (!inputRef.current) return
            inputRef.current.focus()
            const html = replaceEmojisWithHtml(text)
            document.execCommand('insertHTML', false, html)
        }
    }))

    // Sync external value changes
    useEffect(() => {
        if (inputRef.current && value !== undefined) {
            const currentText = extractTextFromHtml(inputRef.current.innerHTML)
            if (currentText !== value) {
                inputRef.current.innerHTML = replaceEmojisWithHtml(value)
                setShowPlaceholder(!value)
            }
        }
    }, [value, extractTextFromHtml, replaceEmojisWithHtml])

    const handleInput = useCallback(() => {
        if (!inputRef.current) return

        const text = processContent(inputRef.current)

        // Check max length
        if (maxLength && text.length > maxLength) {
            inputRef.current.innerHTML = replaceEmojisWithHtml(text.slice(0, maxLength))
            return
        }

        setShowPlaceholder(!text)
        onChange?.(text)
    }, [processContent, maxLength, replaceEmojisWithHtml, onChange])

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            if (inputRef.current) {
                const text = extractTextFromHtml(inputRef.current.innerHTML)
                if (text.trim()) {
                    onSubmit?.(text)
                }
            }
        }
    }, [extractTextFromHtml, onSubmit])

    const handleEmojiSelect = useCallback((emoji: string) => {
        if (!inputRef.current) return

        inputRef.current.focus()
        const html = replaceEmojisWithHtml(emoji)
        document.execCommand('insertHTML', false, html)

        // Trigger input event
        handleInput()
        setPickerOpen(false)
    }, [replaceEmojisWithHtml, handleInput])

    const handleFocus = useCallback(() => {
        setShowPlaceholder(false)
        onFocus?.()
    }, [onFocus])

    const handleBlur = useCallback(() => {
        if (inputRef.current) {
            const text = extractTextFromHtml(inputRef.current.innerHTML)
            setShowPlaceholder(!text)
        }
        onBlur?.()
    }, [extractTextFromHtml, onBlur])

    return (
        <div
            className={`emoji-input-container ${className}`}
            style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                ...style
            }}
        >
            <div
                style={{
                    position: 'relative',
                    flex: 1,
                    minHeight: '40px'
                }}
            >
                {/* Placeholder */}
                {showPlaceholder && (
                    <div
                        className="emoji-input-placeholder"
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '12px',
                            transform: 'translateY(-50%)',
                            color: '#9ca3af',
                            pointerEvents: 'none',
                            userSelect: 'none'
                        }}
                    >
                        {placeholder}
                    </div>
                )}

                {/* ContentEditable Input */}
                <div
                    ref={inputRef}
                    contentEditable={!disabled}
                    className="emoji-input-field"
                    onInput={handleInput}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    style={{
                        minHeight: '40px',
                        padding: '8px 12px',
                        outline: 'none',
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap',
                        overflowWrap: 'break-word',
                        lineHeight: '1.5',
                        ...inputStyle
                    }}
                    suppressContentEditableWarning
                />
            </div>

            {/* Emoji Picker Toggle */}
            {showPicker && (
                <div style={{ position: 'relative' }}>
                    <button
                        type="button"
                        onClick={() => setPickerOpen(!pickerOpen)}
                        className="emoji-input-picker-btn"
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '8px',
                            fontSize: '20px',
                            opacity: 0.7,
                            transition: 'opacity 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                    >
                        😊
                    </button>

                    {pickerOpen && (
                        <div
                            style={{
                                position: 'absolute',
                                bottom: '100%',
                                right: 0,
                                marginBottom: '8px',
                                zIndex: 1000
                            }}
                        >
                            <EmojiPicker onSelect={handleEmojiSelect} />
                        </div>
                    )}
                </div>
            )}
        </div>
    )
})

EmojiInputComponent.displayName = 'EmojiInput'

export const EmojiInput = EmojiInputComponent
