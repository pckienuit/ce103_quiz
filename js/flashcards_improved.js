document.addEventListener('DOMContentLoaded', () => {
    const card = document.getElementById('flashcard');
    const cardCounter = document.getElementById('card-counter');
    const cardQuestion = document.getElementById('card-question');
    const cardAnswerTitle = document.getElementById('card-answer-title');
    const cardExplanation = document.getElementById('card-explanation');

    const prevBtn = document.getElementById('prev-card-btn');
    const flipBtn = document.getElementById('flip-card-btn');
    const nextBtn = document.getElementById('next-card-btn');

    let allQuestions = [];
    let currentCardIndex = 0;

    // Fetch flashcards với enhanced highlighting
    async function fetchQuestions() {
        try {
            updateAIStatus('🔄 Loading enhanced flashcards...', 'active');
            
            // Try to load enhanced data first
            if (window.enhancedHighlighter) {
                try {
                    await window.enhancedHighlighter.loadEnhancedData();
                    allQuestions = window.enhancedHighlighter.getAllEnhancedFlashcards();
                    updateAIStatus('✅ Enhanced AI data loaded', 'active');
                    console.log('✅ Using enhanced AI-processed flashcards');
                    await displayCard();
                    return;
                } catch (enhancedError) {
                    console.warn('Enhanced flashcards not available, falling back to original:', enhancedError);
                    updateAIStatus('⚠️ Enhanced data unavailable', 'fallback');
                }
            }

            // Fallback to original data with regex highlighting
            const response = await fetch('api/flashcards.json');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const originalFlashcards = await response.json();
            
            // Apply fallback highlighting
            allQuestions = originalFlashcards.map(card => ({
                ...card,
                term: window.enhancedHighlighter ? 
                    window.enhancedHighlighter.fallbackHighlight(card.term) : 
                    card.term,
                definition: window.enhancedHighlighter ? 
                    window.enhancedHighlighter.fallbackHighlight(card.definition) : 
                    card.definition
            }));
            
            updateAIStatus('📚 Original flashcards with basic highlighting', 'fallback');
            await displayCard();
            
        } catch (error) {
            console.error('Không thể tải flashcards:', error);
            updateAIStatus('❌ Loading failed', 'error');
            cardQuestion.textContent = 'Lỗi tải thẻ học. Vui lòng thử lại sau.';
        }
    }

    // Hiển thị flashcard hiện tại với enhanced highlighting
    async function displayCard() {
        if (allQuestions.length === 0) return;
        
        const cardData = allQuestions[currentCardIndex];
        
        // Display card directly (already processed)
        cardQuestion.innerHTML = cardData.term;
        
        // Hiển thị topic
        cardAnswerTitle.innerHTML = `<strong>Chủ đề:</strong> ${cardData.topic}`;
        
        // Display definition (already processed)
        cardExplanation.innerHTML = cardData.definition;

        // Update counter
        cardCounter.textContent = `${currentCardIndex + 1} / ${allQuestions.length}`;

        // Update AI status if metadata available
        if (cardData.metadata && cardData.metadata.hasAI) {
            updateAIStatus('🤖 AI-enhanced flashcard', 'active');
        }

        // Reset card state
        card.classList.remove('is-flipped');

        // Render code highlighting với Prism.js
        if (window.Prism) {
            Prism.highlightAllUnder(card);
        }

        // Render lại các công thức toán học với MathJax
        if (window.MathJax) {
            MathJax.typesetPromise([card]).catch(function (err) {
                console.log('MathJax error: ' + err.message);
            });
        }
    }

    // Hàm cập nhật trạng thái AI
    function updateAIStatus(message, type = 'active') {
        const statusEl = document.getElementById('ai-status');
        if (statusEl) {
            statusEl.textContent = message;
            statusEl.className = `ai-status ${type}`;
        }
    }

    // Lật thẻ
    function flipCard() {
        card.classList.toggle('is-flipped');
    }

    // Chuyển tới thẻ tiếp theo
    async function nextCard() {
        currentCardIndex = (currentCardIndex + 1) % allQuestions.length;
        await displayCard();
    }

    // Quay về thẻ trước
    async function prevCard() {
        currentCardIndex = (currentCardIndex - 1 + allQuestions.length) % allQuestions.length;
        await displayCard();
    }

    // Gán sự kiện
    card.addEventListener('click', flipCard);
    flipBtn.addEventListener('click', flipCard);
    nextBtn.addEventListener('click', nextCard);
    prevBtn.addEventListener('click', prevCard);

    // Khởi tạo
    fetchQuestions();
});
