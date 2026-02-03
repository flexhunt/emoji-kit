import React$1 from 'react';

type EmojiStyle = 'apple' | 'google' | 'twitter' | 'facebook' | 'native' | 'flexhunt';
declare const STORAGE_KEY = "emoji-style";
declare const EVENT_NAME = "emoji-style-change";
declare function useEmojiStyle(defaultStyle?: EmojiStyle): {
    style: EmojiStyle;
    setStyle: (newStyle: EmojiStyle) => void;
    isClient: boolean;
};

interface AnimatedEmojiProps {
    id: string;
    size?: number | string;
    className?: string;
    style?: React$1.CSSProperties;
    /**
     * Override the global style for this specific emoji
     */
    emojiStyle?: EmojiStyle;
}
declare const AnimatedEmoji: React$1.FC<AnimatedEmojiProps>;

interface EmojiTextProps {
    text: string;
    className?: string;
    emojiSet?: EmojiStyle;
    size?: number | string;
}
declare const EmojiText: React$1.FC<EmojiTextProps>;

interface EmojiRendererProps {
    text: string;
    size?: number | string;
    className?: string;
}
declare const EmojiRenderer: React$1.FC<EmojiRendererProps>;

interface CategoryConfig {
    id: string;
    icon?: string;
    label?: string;
}
interface EmojiPickerProps {
    onSelect: (emoji: string) => void;
    width?: number | string;
    columns?: number;
    showPreview?: boolean;
    dynamicWidth?: boolean;
    categories?: CategoryConfig[];
    searchPlaceholder?: string;
    maxHeight?: number;
    theme?: 'dark' | 'light' | 'auto';
    showFooter?: boolean;
    emojiSize?: number;
}
declare const EmojiPicker: React$1.FC<EmojiPickerProps>;

interface EmojiInputProps {
    /** Current value (plain text with emojis) */
    value?: string;
    /** Called when text changes */
    onChange?: (text: string) => void;
    /** Called when Enter is pressed (without Shift) */
    onSubmit?: (text: string) => void;
    /** Placeholder text */
    placeholder?: string;
    /** Additional class names */
    className?: string;
    /** Size of emojis in pixels */
    emojiSize?: number;
    /** Emoji style: 'apple' | 'google' | 'twitter' | 'facebook' | 'flexhunt' */
    emojiStyle?: EmojiStyle;
    /** Show emoji picker button */
    showPicker?: boolean;
    /** Custom styles for the container */
    style?: React$1.CSSProperties;
    /** Custom styles for the input area */
    inputStyle?: React$1.CSSProperties;
    /** Disable the input */
    disabled?: boolean;
    /** Max length of text */
    maxLength?: number;
    /** Called on focus */
    onFocus?: () => void;
    /** Called on blur */
    onBlur?: () => void;
}
interface EmojiInputRef {
    /** Focus the input */
    focus: () => void;
    /** Clear the input */
    clear: () => void;
    /** Get current text value */
    getText: () => string;
    /** Insert text at cursor */
    insertText: (text: string) => void;
}
declare const EmojiInput: React$1.ForwardRefExoticComponent<EmojiInputProps & React$1.RefAttributes<EmojiInputRef>>;

interface UseEmojiInputOptions {
    emojiSize?: number;
    /** Emoji style: 'apple' | 'google' | 'twitter' | 'facebook' | 'flexhunt' */
    emojiStyle?: EmojiStyle;
}
declare function useEmojiInput(options?: UseEmojiInputOptions): {
    replaceEmojisWithHtml: (text: string) => string;
    extractTextFromHtml: (html: string) => string;
    insertHtmlAtCaret: (html: string) => void;
    handlePaste: (e: React.ClipboardEvent<HTMLDivElement>) => void;
    processContent: (element: HTMLDivElement) => string;
    getAllEmojis: (text: string) => string[];
};

declare const POPULAR_EMOJIS: string[];
/**
 * Preload popular emoji images for faster rendering
 * Call this early in your app (e.g., in useEffect or on app load)
 */
declare const preloadPopularEmojis: () => void;
/**
 * Preload specific emojis by their IDs (native or shortcode)
 * @param emojis - Array of emoji IDs to preload
 */
declare const preloadEmojis: (emojis: string[]) => void;
/**
 * Get list of all available animated emojis
 */
declare const getAvailableEmojis: () => string[];
/**
 * Get list of all available shortcodes
 */
declare const getAvailableShortcodes: () => string[];

export { AnimatedEmoji, EVENT_NAME, EmojiInput, type EmojiInputProps, type EmojiInputRef, EmojiPicker, EmojiRenderer, type EmojiStyle, EmojiText, POPULAR_EMOJIS, STORAGE_KEY, getAvailableEmojis, getAvailableShortcodes, preloadEmojis, preloadPopularEmojis, useEmojiInput, useEmojiStyle };
