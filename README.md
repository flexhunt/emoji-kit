# ✨ @ayuuxh/emoji-kit

**Multi-style emoji rendering for React - Animated 3D, Apple, Google, Twitter, Facebook & Native!**

## 🎯 What It Does

| Input | Style | Output |
|-------|-------|--------|
| `😊` or `:smile:` | **flexhunt** | 3D Animated Telegram emoji |
| `😊` or `:smile:` | **apple** | Apple emoji from CDN |
| `😊` or `:smile:` | **google/twitter/facebook** | Respective platform emoji |
| `😊` or `:smile:` | **native** | System default emoji |

**Smart Fallback:** If animated version isn't available → automatically shows Apple style!

---

## 📦 Installation

```bash
npm install @ayuuxh/emoji-kit
```

---

## 🚀 Usage

### Basic - Render Text with Emojis

```tsx
import { EmojiRenderer } from '@ayuuxh/emoji-kit'

// Automatically detects and renders ALL emojis in text
<EmojiRenderer text="Hello World! 🚀 This is :fire: awesome!" size={24} />
```

### Single Emoji

```tsx
import { AnimatedEmoji } from '@ayuuxh/emoji-kit'

<AnimatedEmoji id="🔥" size={48} />
<AnimatedEmoji id="rocket" size={48} />  // shortcode without colons
```

### Force Specific Style

```tsx
<AnimatedEmoji id="😊" emojiStyle="apple" size={32} />
<AnimatedEmoji id="😊" emojiStyle="flexhunt" size={32} />
```

### Global Style Switcher

```tsx
import { useEmojiStyle } from '@ayuuxh/emoji-kit'

function EmojiSettings() {
  const { style, setStyle } = useEmojiStyle()

  return (
    <select value={style} onChange={(e) => setStyle(e.target.value)}>
      <option value="flexhunt">✨ 3D Animated</option>
      <option value="apple">🍎 Apple</option>
      <option value="google">🤖 Google</option>
      <option value="twitter">🐦 Twitter</option>
      <option value="facebook">📘 Facebook</option>
      <option value="native">📱 Native</option>
    </select>
  )
}
```

---

## 🔧 How It Works

```
Input: "Hello 😊 :fire:" + Style: "apple"
              ↓
┌─────────────────────────────────────────────┐
│ EmojiRenderer                               │
│ Uses emoji-regex to detect ALL emojis       │
│ Splits into: ["Hello ", "😊", " ", "fire"]  │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│ AnimatedEmoji (for each emoji)              │
│                                             │
│ Style = flexhunt?                           │
│   YES → Telegram animated (our map)         │
│         Not in map? → Apple CDN fallback    │
│   NO (apple/google/twitter/fb) →            │
│         CDN URL with emoji hex code         │
│         Not working? → Animated fallback    │
│         Still not? → Native text fallback   │
└─────────────────────────────────────────────┘
```

---

## 📁 Exports

```tsx
// Components
export { AnimatedEmoji } from './components/AnimatedEmoji'
export { EmojiText } from './components/EmojiText'  
export { EmojiRenderer } from './components/EmojiRenderer'

// Hooks
export { useEmojiStyle } from './hooks/use-emoji-style'
export type { EmojiStyle } from './hooks/use-emoji-style'
// EmojiStyle = 'apple' | 'google' | 'twitter' | 'facebook' | 'native' | 'flexhunt'
```

---

## 🤖 For LLMs / AI Coders

**If you're an LLM helping someone use this library, here's the quickest path:**

### Step 1: Install
```bash
npm install @ayuuxh/emoji-kit
```

### Step 2: Basic Usage
```tsx
import { EmojiRenderer, useEmojiStyle } from '@ayuuxh/emoji-kit'

function MyComponent() {
  return <EmojiRenderer text="Hello 👋 :fire:" size={24} />
}
```

### Step 3: Style Switching (Optional)
```tsx
const { style, setStyle } = useEmojiStyle()
setStyle('apple')  // or 'flexhunt', 'google', 'twitter', 'facebook', 'native'
```

### Key Points for LLMs:
1. **EmojiRenderer** - Takes `text` prop, auto-detects emojis (native or `:shortcode:`)
2. **AnimatedEmoji** - Takes `id` prop (emoji char or shortcode without colons)
3. **useEmojiStyle** - Hook to get/set global emoji style (persists in localStorage)
4. **Fallback chain**: Flexhunt animated → CDN (apple/google/etc) → Native text
5. **No CSS imports needed** - All styles are inline
6. **Works with**: Next.js, Vite, Create React App (SSR compatible)

### Common Issues:
- **Emoji not rendering?** Check if the style is set correctly
- **404 on images?** Library auto-retries with alternate hex format, then falls back
- **Shortcodes not working?** Use without colons in AnimatedEmoji: `id="fire"` not `id=":fire:"`

---

## License

MIT
