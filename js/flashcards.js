document.addEventListener('DOMContentLoaded', () => {
    const card = document.getElementById('flashcard');
    const cardCounter = document.getElementById('card-counter');
    const cardQuestion = document.getElementById('card-question');
    const cardAnswerTitle = document.getElementById('card-answer-title');
    const cardExplanation = document.getElementById('card-explanation');

    const prevBtn = document.getElementById('prev-card-btn');
    const flipBtn = document.getElementById('flip-card-btn');
    const nextBtn = document.getElementById('next-card-btn');    let allQuestions = [];
    let currentCardIndex = 0;    // Hàm format code trong text (phiên bản đơn giản cho CE103)
    function formatCodeInText(text) {
        let formattedText = text;
        
        // 1. Chỉ xử lý code trong backticks (`)
        formattedText = formattedText.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
        
        // 2. Highlight một số thuật ngữ kỹ thuật cơ bản
        formattedText = formattedText.replace(
            /\b(ROM|RAM|CPU|UART|PWM|ADC|DAC)\b/g,
            '<span class="tech-term">$&</span>'
        );
        
        // 3. Highlight các số hex cơ bản
        formattedText = formattedText.replace(
            /\b(0x[0-9A-Fa-f]+|[0-9A-Fa-f]+H)\b/g,
            '<span class="number-highlight">$&</span>'
        );
        
        return formattedText;
    }async function fetchQuestions() {
        try {
            const response = await fetch('api/flashcards.json');
            allQuestions = await response.json();
            displayCard();
        } catch (error) {
            cardQuestion.textContent = 'Lỗi tải thẻ học.';
        }
    }    function displayCard() {
        if (allQuestions.length === 0) return;
        
        const cardData = allQuestions[currentCardIndex];
        
        // Format term với code highlighting
        const formattedTerm = formatCodeInText(cardData.term);
        cardQuestion.innerHTML = formattedTerm;
        
        // Hiển thị topic và term
        cardAnswerTitle.innerHTML = `<strong>Chủ đề:</strong> ${cardData.topic}`;
        
        // Format definition với code highlighting
        const formattedDefinition = formatCodeInText(cardData.definition);
        cardExplanation.innerHTML = formattedDefinition;        cardCounter.textContent = `${currentCardIndex + 1} / ${allQuestions.length}`;
        card.classList.remove('is-flipped');
        
        // Render lại các công thức toán học với MathJax
        if (window.MathJax) {
            MathJax.typesetPromise([cardQuestion, cardExplanation]).catch(function (err) {
                console.log('MathJax error: ' + err.message);
            });
        }
    }

    function flipCard() {
        card.classList.toggle('is-flipped');
    }

    function nextCard() {
        currentCardIndex = (currentCardIndex + 1) % allQuestions.length;
        displayCard();
    }

    function prevCard() {
        currentCardIndex = (currentCardIndex - 1 + allQuestions.length) % allQuestions.length;
        displayCard();
    }

    card.addEventListener('click', flipCard);
    flipBtn.addEventListener('click', flipCard);
    nextBtn.addEventListener('click', nextCard);
    prevBtn.addEventListener('click', prevCard);

    fetchQuestions();
});