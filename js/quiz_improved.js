document.addEventListener('DOMContentLoaded', () => {
    // Các biến tham chiếu đến các phần tử HTML
    const startScreen = document.getElementById('start-screen');
    const quizScreen = document.getElementById('quiz-screen');
    const resultScreen = document.getElementById('result-screen');
    const startBtn = document.getElementById('start-quiz-btn');
    const nextBtn = document.getElementById('next-question-btn');
    const restartBtn = document.getElementById('restart-quiz-btn');
    const exitBtn = document.getElementById('exit-quiz-btn');
    
    const questionCounter = document.getElementById('question-counter');
    const timerDisplay = document.getElementById('timer');
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const explanationArea = document.getElementById('explanation-area');
    const explanationText = document.getElementById('explanation-text');

    const scoreDisplay = document.getElementById('score');
    const percentageDisplay = document.getElementById('percentage');
    const resultMessage = document.getElementById('result-message');

    let allQuestions = [];
    let currentQuizQuestions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let timerInterval;
    const QUIZ_DURATION = 70 * 60; // 70 phút tính bằng giây
    const NUM_QUESTIONS = 40;    // Hàm fetch câu hỏi với enhanced highlighting
    async function fetchQuestions() {
        try {
            updateAIStatus('🔄 Loading enhanced data...', 'active');
            
            // Try to load enhanced data first
            if (window.enhancedHighlighter) {
                try {
                    await window.enhancedHighlighter.loadEnhancedData();
                    allQuestions = window.enhancedHighlighter.getAllEnhancedQuestions();
                    updateAIStatus('✅ Enhanced AI data loaded', 'active');
                    console.log('✅ Using enhanced AI-processed data');
                    return;
                } catch (enhancedError) {
                    console.warn('Enhanced data not available, falling back to original:', enhancedError);
                    updateAIStatus('⚠️ Enhanced data unavailable', 'fallback');
                }
            }

            // Fallback to original data with regex highlighting
            const response = await fetch('api/get_questions.php');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const originalQuestions = await response.json();
            
            // Apply fallback highlighting
            allQuestions = originalQuestions.map(question => ({
                ...question,
                question: window.enhancedHighlighter ? 
                    window.enhancedHighlighter.fallbackHighlight(question.question) : 
                    question.question,
                options: Object.fromEntries(
                    Object.entries(question.options).map(([key, value]) => [
                        key, 
                        window.enhancedHighlighter ? 
                            window.enhancedHighlighter.fallbackHighlight(value) : 
                            value
                    ])
                ),
                explanation: window.enhancedHighlighter ? 
                    window.enhancedHighlighter.fallbackHighlight(question.explanation) : 
                    question.explanation
            }));
            
            updateAIStatus('📝 Original data with basic highlighting', 'fallback');
            
        } catch (error) {
            console.error('Không thể tải câu hỏi:', error);
            updateAIStatus('❌ Loading failed', 'error');
            questionText.textContent = 'Lỗi tải câu hỏi. Vui lòng thử lại sau.';
        }
    }

    // Hàm xáo trộn mảng (Fisher-Yates shuffle)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // Hàm bắt đầu quiz
    function startQuiz() {
        startScreen.classList.add('hidden');
        resultScreen.classList.add('hidden');
        quizScreen.classList.remove('hidden');

        currentQuestionIndex = 0;
        score = 0;
        shuffleArray(allQuestions);
        currentQuizQuestions = allQuestions.slice(0, NUM_QUESTIONS);

        displayQuestion();
        startTimer();
    }    // ...existing code...    // Hàm hiển thị câu hỏi với enhanced highlighting
    async function displayQuestion() {
        resetState();
        const question = currentQuizQuestions[currentQuestionIndex];
        questionCounter.textContent = `Câu ${currentQuestionIndex + 1} / ${NUM_QUESTIONS}`;
        
        // Display question directly (already processed)
        questionText.innerHTML = question.question;

        // Display options (already processed)
        for (const key in question.options) {
            const button = document.createElement('button');
            button.innerHTML = `<strong>${key}.</strong> ${question.options[key]}`;
            button.classList.add('option-btn');
            button.dataset.answer = key;
            button.addEventListener('click', selectAnswer);
            optionsContainer.appendChild(button);
        }

        // Update AI status if metadata available
        if (question.metadata && question.metadata.hasAI) {
            updateAIStatus('✅ AI-enhanced content', 'active');
        }

        // Render code highlighting với Prism.js
        if (window.Prism) {
            Prism.highlightAllUnder(questionText);
            Prism.highlightAllUnder(optionsContainer);
        }

        // Render lại các công thức toán học với MathJax
        if (window.MathJax) {
            MathJax.typesetPromise([questionText, optionsContainer]).catch(function (err) {
                console.log('MathJax error: ' + err.message);
            });
        }
    }

    // Hàm reset trạng thái trước khi hiển thị câu hỏi mới
    function resetState() {
        optionsContainer.innerHTML = '';
        explanationArea.classList.add('hidden');
        nextBtn.classList.add('hidden');
    }    // Hàm xử lý khi chọn câu trả lời
    async function selectAnswer(e) {
        const selectedBtn = e.target.closest('.option-btn');
        if (!selectedBtn) return;

        const selectedAnswer = selectedBtn.dataset.answer;
        const correctAnswer = currentQuizQuestions[currentQuestionIndex].answer;

        if (selectedAnswer === correctAnswer) {
            score++;
            selectedBtn.classList.add('correct');
        } else {
            selectedBtn.classList.add('incorrect');
        }

        // Hiển thị đáp án đúng và giải thích
        Array.from(optionsContainer.children).forEach(button => {
            if (button.dataset.answer === correctAnswer) {
                button.classList.add('correct');
            }
            button.disabled = true; // Vô hiệu hóa các lựa chọn
        });        // Hiển thị explanation (already processed)
        explanationText.innerHTML = currentQuizQuestions[currentQuestionIndex].explanation;
        
        explanationArea.classList.remove('hidden');
        
        // Render code highlighting với Prism.js cho explanation
        if (window.Prism) {
            Prism.highlightAllUnder(explanationText);
        }
        
        // Render lại các công thức toán học với MathJax
        if (window.MathJax) {
            MathJax.typesetPromise([explanationText]).catch(function (err) {
                console.log('MathJax error: ' + err.message);
            });
        }
        
        nextBtn.classList.remove('hidden');
    }

    // Hàm bắt đầu đếm giờ
    function startTimer() {
        let timeLeft = QUIZ_DURATION;
        timerInterval = setInterval(() => {
            timeLeft--;
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerDisplay.textContent = `Thời gian: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                showResults();
            }
        }, 1000);
    }
    
    // Hàm hiển thị kết quả
    function showResults() {
        clearInterval(timerInterval);
        quizScreen.classList.add('hidden');
        resultScreen.classList.remove('hidden');

        const percentage = ((score / NUM_QUESTIONS) * 100).toFixed(2);
        scoreDisplay.textContent = score;
        percentageDisplay.textContent = percentage;

        if (percentage >= 50) {
            resultMessage.textContent = 'Chúc mừng! Bạn đã qua môn.';
            resultMessage.style.color = 'green';
        } else {
            resultMessage.textContent = 'Rất tiếc, bạn cần cố gắng hơn.';
            resultMessage.style.color = 'red';
        }
    }

    // Hàm thoát quiz và quay về trang chủ
    function exitQuiz() {
        const confirmExit = confirm('Bạn có chắc chắn muốn thoát? Tiến trình làm bài sẽ bị mất.');
        if (confirmExit) {
            clearInterval(timerInterval);
            window.location.href = 'index.html';
        }
    }

    // Xử lý phím tắt (ESC để thoát)
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && !quizScreen.classList.contains('hidden')) {
            exitQuiz();
        }
    });

    // Gán sự kiện cho các nút
    startBtn.addEventListener('click', startQuiz);
    exitBtn.addEventListener('click', exitQuiz);
    
    nextBtn.addEventListener('click', () => {
        currentQuestionIndex++;
        if (currentQuestionIndex < NUM_QUESTIONS) {
            displayQuestion();
        } else {
            showResults();
        }
    });

    restartBtn.addEventListener('click', startQuiz);

    // Tải câu hỏi ngay khi trang được mở
    fetchQuestions();

    // Hàm cập nhật trạng thái Gemini AI
    function updateAIStatus(message, type = 'active') {
        const statusEl = document.getElementById('ai-status');
        if (statusEl) {
            statusEl.textContent = message;
            statusEl.className = `ai-status ${type}`;
        }
    }
});
