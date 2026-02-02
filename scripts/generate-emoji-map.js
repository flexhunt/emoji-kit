/**
 * Script to generate emoji-map.json
 * Only maps emojis that have a corresponding animated .webp file.
 * Run: node scripts/generate-emoji-map.js
 */

const fs = require('fs');
const path = require('path');

// Paths
const ANIMATED_EMOJIS_PATH = path.join(__dirname, '../../Telegram-Animated-Emojis-main/Telegram-Animated-Emojis-main');
const EMOJI_MAP_OUTPUT = path.join(__dirname, '../src/data/emoji-map.json');
const EMOJI_MART_DATA_URL = 'https://raw.githubusercontent.com/missive/emoji-mart/main/packages/emoji-mart-data/sets/15/native.json';

async function fetchEmojiMartData() {
    const response = await fetch(EMOJI_MART_DATA_URL);
    return response.json();
}

function scanAnimatedEmojis() {
    const animatedMap = new Map();
    const folders = ['Smileys', 'People', 'Animals and Nature', 'Food and Drink', 'Activity', 'Travel and Places', 'Objects', 'Symbols', 'Flags'];

    for (const folder of folders) {
        const folderPath = path.join(ANIMATED_EMOJIS_PATH, folder);
        if (fs.existsSync(folderPath)) {
            const files = fs.readdirSync(folderPath);
            for (const file of files) {
                if (file.endsWith('.webp')) {
                    const originalName = file.replace('.webp', '');
                    const normalizedName = normalizeForMatching(originalName);
                    // Map normalized name to relative path
                    animatedMap.set(normalizedName, `${folder}/${file}`);
                }
            }
        }
    }
    return animatedMap;
}

function normalizeForMatching(str) {
    return str
        .toLowerCase()
        .replace(/[-_]/g, ' ')
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

async function main() {
    console.log('Fetching emoji-mart data...');
    const emojiMartData = await fetchEmojiMartData();

    console.log('Scanning local animated emojis...');
    const animatedEmojis = scanAnimatedEmojis();
    console.log(`Found ${animatedEmojis.size} animated emojis files`);

    const emojiMap = {};
    let matched = 0;

    for (const [id, emoji] of Object.entries(emojiMartData.emojis)) {
        const name = emoji.name;
        const native = emoji.skins?.[0]?.native;

        if (!native || !name) continue;

        const normalizedName = normalizeForMatching(name);

        // Try strict match
        let animatedFile = animatedEmojis.get(normalizedName);

        // Try variations
        if (!animatedFile) {
            const variations = [
                normalizedName.replace(' face', ''),
                normalizedName + ' face',
                normalizedName.replace('face with ', ''),
                normalizedName.replace('smiling ', ''),
                normalizedName.replace(' emoji', ''),
            ];

            for (const variation of variations) {
                animatedFile = animatedEmojis.get(variation);
                if (animatedFile) break;
            }
        }

        if (animatedFile) {
            // Map ONLY if we have an animated version
            emojiMap[id] = animatedFile;      // Shortcode -> Path
            emojiMap[native] = animatedFile;  // Native -> Path
            matched++;
        }
    }

    console.log(`Matched ${matched} emojis to animated versions`);

    // Sort keys
    const sortedMap = {};
    Object.keys(emojiMap).sort().forEach(key => {
        sortedMap[key] = emojiMap[key];
    });

    fs.writeFileSync(EMOJI_MAP_OUTPUT, JSON.stringify(sortedMap, null, 2));
    console.log(`Saved to ${EMOJI_MAP_OUTPUT}`);
}

main().catch(console.error);
