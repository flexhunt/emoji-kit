# ✨ @ayuuxh/emoji-kit

**Multi-style emoji rendering for React — Animated 3D, Apple, Google, Twitter, Facebook & Native!**

[![npm](https://img.shields.io/npm/v/@ayuuxh/emoji-kit)](https://www.npmjs.com/package/@ayuuxh/emoji-kit)

---

## 📦 Installation

```bash
npm install @ayuuxh/emoji-kit
```

---

## 🎯 Components Overview

| Component | Purpose | Input | Output |
|-----------|---------|-------|--------|
| `AnimatedEmoji` | Single emoji | `😀` or `fire` | Styled emoji image |
| `EmojiRenderer` | Text with emojis | `"Hello 😀 :fire:"` | Text + styled emojis |
| `EmojiInput` | Editable input | User typing | Live styled emojis |
| `EmojiPicker` | Emoji selector | Click | Selected emoji |

---

## 🚀 Quick Start

### 1. AnimatedEmoji — Single Emoji

```tsx
import { AnimatedEmoji } from '@ayuuxh/emoji-kit'

// Native emoji
<AnimatedEmoji id="🔥" size={48} />

// Shortcode (without colons)
<AnimatedEmoji id="fire" size={48} />

// Force specific style
<AnimatedEmoji id="😊" size={32} emojiStyle="apple" />
<AnimatedEmoji id="😊" size={32} emojiStyle="flexhunt" />
```

**Available Styles:** `flexhunt` (animated), `apple`, `google`, `twitter`, `facebook`, `native`

---

### 2. EmojiRenderer — Display Text with Emojis

```tsx
import { EmojiRenderer } from '@ayuuxh/emoji-kit'

// Auto-detects and renders ALL emojis in text
<EmojiRenderer 
  text="Hello World! 🚀 This is :fire: awesome!" 
  size={24} 
/>
```

**Supports:**
- ✅ Native emojis: `😀 🔥 ❤️`
- ✅ Shortcodes: `:fire:` `:heart:` `:rocket:`

---

### 3. EmojiInput — Editable Input with Live Emojis

```tsx
import { EmojiInput } from '@ayuuxh/emoji-kit'

<EmojiInput
  placeholder="Type a message..."
  onSubmit={(text) => console.log(text)}
  onChange={(text) => console.log(text)}
  emojiSize={24}
  showPicker={true}
/>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `''` | Controlled value |
| `onChange` | `(text: string) => void` | — | Called on text change |
| `onSubmit` | `(text: string) => void` | — | Called on Enter press |
| `placeholder` | `string` | `'Type...'` | Placeholder text |
| `emojiSize` | `number` | `20` | Emoji size in px |
| `emojiStyle` | `EmojiStyle` | global | Emoji style to use |
| `showPicker` | `boolean` | `true` | Show emoji picker button |
| `disabled` | `boolean` | `false` | Disable input |
| `maxLength` | `number` | — | Max text length |

**Ref Methods:**
```tsx
const inputRef = useRef<EmojiInputRef>(null)

inputRef.current?.focus()      // Focus the input
inputRef.current?.clear()      // Clear the input
inputRef.current?.getText()    // Get current text
inputRef.current?.insertText('🔥')  // Insert text/emoji
```

---

### 4. EmojiPicker — Select Emojis

```tsx
import { EmojiPicker } from '@ayuuxh/emoji-kit'

<EmojiPicker 
  onSelect={(emoji) => console.log(emoji)} 
/>
```

---

## 🎨 Global Style Switching

Use `useEmojiStyle` hook to change emoji style globally (persists in localStorage):

```tsx
import { useEmojiStyle } from '@ayuuxh/emoji-kit'

function EmojiStyleSelector() {
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

**Note:** All components read from this global style automatically!

---

## 📁 All Exports

```tsx
// Components
import { 
  AnimatedEmoji,
  EmojiRenderer,
  EmojiInput,
  EmojiPicker,
  EmojiText 
} from '@ayuuxh/emoji-kit'

// Hooks
import { 
  useEmojiStyle,
  useEmojiInput 
} from '@ayuuxh/emoji-kit'

// Types
import type { 
  EmojiStyle,          // 'apple' | 'google' | 'twitter' | 'facebook' | 'native' | 'flexhunt'
  EmojiInputProps,
  EmojiInputRef 
} from '@ayuuxh/emoji-kit'
```

---

## 🔧 How Fallback Works

```
Input: "😊" + Style: "flexhunt"
       ↓
┌─────────────────────────────────────┐
│ 1. Check Telegram animated map      │
│    Found? → Use animated webp       │
│    Not found? ↓                     │
│ 2. Try Apple CDN (static png)       │
│    Failed? ↓                        │
│ 3. Show native text emoji           │
└─────────────────────────────────────┘

Input: "😊" + Style: "apple"
       ↓
┌─────────────────────────────────────┐
│ 1. Try Apple CDN with hex code      │
│    Failed? ↓                        │
│ 2. Try alternate hex format         │
│    Failed? ↓                        │
│ 3. Try animated fallback            │
│    Failed? ↓                        │
│ 4. Show native text emoji           │
└─────────────────────────────────────┘
```

---

## ⚠️ Important Notes

1. **Shortcodes in EmojiInput**: Only native emojis work in `EmojiInput`. Shortcodes (`:fire:`) are NOT converted to prevent cursor issues. Use `EmojiRenderer` for shortcode support.

2. **Shortcodes always animated**: In `EmojiRenderer`, shortcodes always show animated style because platform CDNs don't have images for shortcode names.

3. **SSR Compatible**: Works with Next.js App Router, Server Components, and SSR.

4. **No CSS imports needed**: All styles are inline.

---

## 🤖 For AI/LLMs

**Quickest integration:**

```tsx
// Display messages with styled emojis
import { EmojiRenderer } from '@ayuuxh/emoji-kit'
<EmojiRenderer text="Hello 👋 world!" size={24} />

// Chat input with live emoji rendering
import { EmojiInput } from '@ayuuxh/emoji-kit'
<EmojiInput onSubmit={(text) => sendMessage(text)} />

// Change global style
import { useEmojiStyle } from '@ayuuxh/emoji-kit'
const { setStyle } = useEmojiStyle()
setStyle('apple')
```

---

## 📄 License

MIT © [Ayush](https://github.com/flexhunt)
