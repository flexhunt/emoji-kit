import React from 'react';

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
    style?: React.CSSProperties;
    /**
     * Override the global style for this specific emoji
     */
    emojiStyle?: EmojiStyle;
}
declare const AnimatedEmoji: React.FC<AnimatedEmojiProps>;

interface EmojiTextProps {
    text: string;
    className?: string;
    emojiSet?: EmojiStyle;
    size?: number | string;
}
declare const EmojiText: React.FC<EmojiTextProps>;

interface EmojiRendererProps {
    text: string;
    size?: number | string;
    className?: string;
}
declare const EmojiRenderer: React.FC<EmojiRendererProps>;

export { AnimatedEmoji, EVENT_NAME, EmojiRenderer, type EmojiStyle, EmojiText, STORAGE_KEY, useEmojiStyle };
