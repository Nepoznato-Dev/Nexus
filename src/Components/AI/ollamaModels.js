/**
 * transformerModels.js - Transformer.js Processing Tier Profiles
 * Fast, Balanced, and Quality processing configurations
 * 
 * Browser-based AI with intelligent routing
 */

export const TRANSFORMER_TIERS = {
    fast: {
        id: 'fast',
        name: '⚡ Fast',
        emoji: '⚡',
        description: 'Quick, direct answers with no explanation. Best for simple questions.',
        processing: 'Direct computation',
        speed: 'Instant (<100ms)',
        use_cases: ['Basic math (1+9)', 'Simple definitions', 'Yes/No questions', 'Quick facts'],
        color: '#FF6B6B',
        accent: '#ff6b6b',
        examples: [
            { question: '5 + 5', answer: '10' },
            { question: 'What is 20 * 3', answer: '60' },
            { question: 'Hi', answer: 'Hello!' },
        ],
    },

    balanced: {
        id: 'balanced',
        name: '⚙️ Balanced',
        emoji: '⚙️',
        description: 'Smart routing: simple questions → fast, complex → explained. Recommended.',
        processing: 'Dynamic routing with complexity analysis',
        speed: 'Fast to Medium (100ms-2s)',
        use_cases: ['General questions', 'Mixed complexity', 'Adaptive learning', 'Most scenarios'],
        color: '#4ECDC4',
        accent: '#4ecdc4',
        intelligence: 'Analyzes question complexity and routes appropriately',
        examples: [
            { question: '10 + 5', answer: '15', routed: 'Fast' },
            { question: 'Explain photosynthesis', answer: 'Step-by-step explanation', routed: 'Quality' },
        ],
    },

    quality: {
        id: 'quality',
        name: '✨ Quality',
        emoji: '✨',
        description: 'Full step-by-step explanations like Google Gemini AI Overview. For learning.',
        processing: 'Comprehensive analysis with detailed breakdown',
        speed: 'Slower (2-5s)',
        use_cases: ['Learning new concepts', 'Math problems', 'Complex analysis', 'Study mode'],
        color: '#A29BFE',
        accent: '#a29bfe',
        features: [
            '📊 Step-by-step breakdown',
            '💡 Conceptual understanding',
            '🔗 Related topics',
            '📝 Complete explanations',
        ],
        examples: [
            { 
                question: 'Rectangle: length = 3×width, perimeter = 48. Find area.',
                answer: '96 square units',
                includes: 'Full 5-step solution with algebra'
            },
        ],
    },
};

/**
 * Get tier configuration
 */
export function getTierConfig(tier = 'balanced') {
    return TRANSFORMER_TIERS[tier] || TRANSFORMER_TIERS.balanced;
}

/**
 * Get all tier IDs
 */
export function getAllTiers() {
    return Object.keys(TRANSFORMER_TIERS);
}

/**
 * Compare tiers
 */
export function compareTiers() {
    return `
# Transformer.js Processing Tiers

## ⚡ Fast Tier
- **Speed**: Instant (<100ms)
- **Use**: Simple questions, basic calculations
- **Output**: Direct answer, no explanation
- **Example**: "5+5" → "10"

## ⚙️ Balanced Tier (Recommended)
- **Speed**: Adaptive (100ms-2s)
- **Use**: General questions, mixed complexity
- **Output**: Smart routing (simple→fast, complex→explained)
- **Example**: "10+5" → "15" (fast), "Explain gravity" → Full explanation (quality)

## ✨ Quality Tier
- **Speed**: Comprehensive (2-5s)
- **Use**: Learning, complex problems
- **Output**: Step-by-step breakdown like Gemini AI Overview
- **Example**: Rectangle problem → 5-step solution with explanations

## How Balanced Tier Works:
1. Analyzes question complexity
2. Simple questions (basic math) → Route to Fast processing
3. Complex questions (explanations needed) → Route to Quality processing
4. Moderate questions → Brief explanation
`;
}

export default TRANSFORMER_TIERS;
