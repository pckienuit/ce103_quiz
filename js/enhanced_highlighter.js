/**
 * Enhanced Highlighting System
 * Sử dụng pre-processed Gemini AI data để highlight text
 */

class EnhancedHighlighter {    constructor() {
        this.enhancedQuestions = null;
        this.enhancedFlashcards = null;
        this.loaded = false;
        this.currentSubject = null;
        this.cache = new Map();
    }/**
     * Load enhanced data files
     */
    async loadEnhancedData(subject = 'ce103') {
        if (this.loaded && this.currentSubject === subject) return;

        try {
            this.currentSubject = subject;
            
            if (subject === 'it007') {
                // Load IT007 enhanced questions if available
                try {
                    const it007Response = await fetch('api/it007_questions_enhanced.json');
                    if (it007Response.ok) {
                        this.enhancedQuestions = await it007Response.json();
                        console.log('✅ Enhanced IT007 questions loaded');
                    } else {
                        throw new Error('Enhanced IT007 questions not found');
                    }
                } catch (error) {
                    console.warn('Enhanced IT007 data not available, using fallback');
                    // Fallback to original IT007 questions
                    const originalResponse = await fetch('api/get_it007_questions.php');
                    if (originalResponse.ok) {
                        this.enhancedQuestions = await originalResponse.json();
                        console.log('✅ Original IT007 questions loaded as fallback');
                    } else {
                        throw new Error('IT007 questions not found');
                    }
                }
                
                // IT007 doesn't have flashcards yet
                this.enhancedFlashcards = [];
                
            } else {
                // Load CE103 enhanced questions
                const questionsResponse = await fetch('api/questions_enhanced.json');
                if (questionsResponse.ok) {
                    this.enhancedQuestions = await questionsResponse.json();
                    console.log('✅ Enhanced CE103 questions loaded');
                } else {
                    throw new Error('Enhanced CE103 questions not found');
                }

                // Load enhanced flashcards
                const flashcardsResponse = await fetch('api/flashcards_enhanced.json');
                if (flashcardsResponse.ok) {
                    this.enhancedFlashcards = await flashcardsResponse.json();
                    console.log('✅ Enhanced flashcards loaded');
                } else {
                    throw new Error('Enhanced flashcards not found');
                }
            }

            this.loaded = true;
            console.log(`🤖 Enhanced highlighting system ready for ${subject.toUpperCase()}`);

        } catch (error) {
            console.error('❌ Failed to load enhanced data:', error);
            throw new Error(`Enhanced data not available for ${subject}. Please run preprocessing first.`);
        }
    }

    /**
     * Apply highlighting to text based on AI analysis
     */
    applyHighlighting(text, analysis) {
        if (!analysis || !analysis.highlighted_spans) {
            return text;
        }

        // Sort spans by start position (reverse order for proper replacement)
        const spans = [...analysis.highlighted_spans].sort((a, b) => b.start - a.start);
        
        let highlightedText = text;

        for (const span of spans) {
            const before = highlightedText.substring(0, span.start);
            const spanText = highlightedText.substring(span.start, span.end);
            const after = highlightedText.substring(span.end);

            let cssClass = '';
            switch (span.type) {
                case 'assembly':
                    cssClass = 'inline-code-bright';
                    break;
                case 'technical':
                    cssClass = 'tech-term';
                    break;
                case 'number':
                    cssClass = 'number-highlight';
                    break;
                case 'formula':
                    cssClass = 'formula-var';
                    break;
                default:
                    cssClass = 'inline-code-bright';
            }

            const highlightedSpan = `<span class="${cssClass}">${spanText}</span>`;
            highlightedText = before + highlightedSpan + after;
        }

        return highlightedText;
    }

    /**
     * Get enhanced question by index
     */
    getEnhancedQuestion(index) {
        if (!this.loaded || !this.enhancedQuestions) {
            throw new Error('Enhanced data not loaded');
        }

        if (index < 0 || index >= this.enhancedQuestions.length) {
            throw new Error('Question index out of range');
        }

        const question = this.enhancedQuestions[index];
        
        // Apply highlighting to question text
        const highlightedQuestion = this.applyHighlighting(
            question.question, 
            question.ai_analysis.question
        );

        // Apply highlighting to options
        const highlightedOptions = {};
        for (const [key, optionText] of Object.entries(question.options)) {
            highlightedOptions[key] = this.applyHighlighting(
                optionText,
                question.ai_analysis.options[key]
            );
        }

        // Apply highlighting to explanation
        const highlightedExplanation = this.applyHighlighting(
            question.explanation,
            question.ai_analysis.explanation
        );

        return {
            ...question,
            question: highlightedQuestion,
            options: highlightedOptions,
            explanation: highlightedExplanation,
            metadata: {
                hasAI: true,
                hasMath: question.ai_analysis.question.has_math,
                hasCode: question.ai_analysis.question.has_code,
                languageMix: question.ai_analysis.question.language_mix,
                processedAt: question.ai_analysis.processed_at,
                modelUsed: question.ai_analysis.model_used
            }
        };
    }

    /**
     * Get enhanced flashcard by index
     */
    getEnhancedFlashcard(index) {
        if (!this.loaded || !this.enhancedFlashcards) {
            throw new Error('Enhanced data not loaded');
        }

        if (index < 0 || index >= this.enhancedFlashcards.length) {
            throw new Error('Flashcard index out of range');
        }

        const card = this.enhancedFlashcards[index];

        // Apply highlighting to term
        const highlightedTerm = this.applyHighlighting(
            card.term,
            card.ai_analysis.term
        );

        // Apply highlighting to definition
        const highlightedDefinition = this.applyHighlighting(
            card.definition,
            card.ai_analysis.definition
        );

        return {
            ...card,
            term: highlightedTerm,
            definition: highlightedDefinition,
            metadata: {
                hasAI: true,
                termHasMath: card.ai_analysis.term.has_math,
                termHasCode: card.ai_analysis.term.has_code,
                definitionHasMath: card.ai_analysis.definition.has_math,
                definitionHasCode: card.ai_analysis.definition.has_code,
                processedAt: card.ai_analysis.processed_at,
                modelUsed: card.ai_analysis.model_used
            }
        };
    }

    /**
     * Get all enhanced questions
     */
    getAllEnhancedQuestions() {
        if (!this.loaded || !this.enhancedQuestions) {
            throw new Error('Enhanced data not loaded');
        }

        return this.enhancedQuestions.map((_, index) => this.getEnhancedQuestion(index));
    }

    /**
     * Get all enhanced flashcards
     */
    getAllEnhancedFlashcards() {
        if (!this.loaded || !this.enhancedFlashcards) {
            throw new Error('Enhanced data not loaded');
        }

        return this.enhancedFlashcards.map((_, index) => this.getEnhancedFlashcard(index));
    }

    /**
     * Get statistics about enhanced data
     */
    getStats() {
        if (!this.loaded) {
            return { loaded: false };
        }

        const questionStats = this.enhancedQuestions ? {
            total: this.enhancedQuestions.length,
            withMath: this.enhancedQuestions.filter(q => q.ai_analysis.question.has_math).length,
            withCode: this.enhancedQuestions.filter(q => q.ai_analysis.question.has_code).length,
            fallbacks: this.enhancedQuestions.filter(q => q.ai_analysis.question.fallback).length
        } : null;

        const flashcardStats = this.enhancedFlashcards ? {
            total: this.enhancedFlashcards.length,
            withMath: this.enhancedFlashcards.filter(c => 
                c.ai_analysis.term.has_math || c.ai_analysis.definition.has_math
            ).length,
            withCode: this.enhancedFlashcards.filter(c => 
                c.ai_analysis.term.has_code || c.ai_analysis.definition.has_code
            ).length,
            fallbacks: this.enhancedFlashcards.filter(c => 
                c.ai_analysis.term.fallback || c.ai_analysis.definition.fallback
            ).length
        } : null;

        return {
            loaded: true,
            questions: questionStats,
            flashcards: flashcardStats,
            cacheSize: this.cache.size
        };
    }

    /**
     * Check if enhanced data is available
     */
    isEnhancedDataAvailable() {
        return this.loaded && this.enhancedQuestions && this.enhancedFlashcards;
    }

    /**
     * Fallback highlighting for non-enhanced content
     */
    fallbackHighlight(text) {
        // Simple regex-based highlighting for backup
        let highlighted = text;

        // Assembly instructions
        const assemblyPattern = /\b(MOV|JMP|ADD|SUB|MUL|DIV|SETB|CLR|MOVC|PUSH|POP|CALL|RET|DJNZ|CJNE|JZ|JNZ|JC|JNC)\s+[^,\s]+(?:,\s*[^,\s]+)*/gi;
        highlighted = highlighted.replace(assemblyPattern, '<span class="inline-code-bright">$&</span>');

        // Technical terms
        const techPattern = /\b(ROM|RAM|CPU|UART|ADC|DAC|PWM|SPI|I2C|GPIO|EEPROM|FLASH|SRAM|DRAM|ALU|PC|SP|PSW|ACC|DPTR|TCON|TMOD|IE|IP|PCON|SBUF|TH0|TL0|TH1|TL1)\b/gi;
        highlighted = highlighted.replace(techPattern, '<span class="tech-term">$&</span>');

        // Numbers (hex, binary)
        const numberPattern = /\b(0x[0-9A-Fa-f]+|[0-9A-Fa-f]+H|[01]+B|\d+)\b/g;
        highlighted = highlighted.replace(numberPattern, '<span class="number-highlight">$&</span>');        return highlighted;
    }

    /**
     * Get all enhanced questions (for quiz compatibility)
     */
    getAllEnhancedQuestions() {
        if (!this.enhancedQuestions) {
            throw new Error('Enhanced questions not loaded');
        }
        
        return this.enhancedQuestions.map((question, index) => {
            return this.getEnhancedQuestion(index);
        });
    }

    /**
     * Get all enhanced flashcards (for flashcards compatibility)
     */
    getAllEnhancedFlashcards() {
        if (!this.enhancedFlashcards) {
            throw new Error('Enhanced flashcards not loaded');
        }
        
        return this.enhancedFlashcards.map((card, index) => {
            return this.getEnhancedFlashcard(index);
        });
    }
}

// Global instance
window.enhancedHighlighter = new EnhancedHighlighter();

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        EnhancedHighlighter,
        enhancedHighlighter
    };
}
