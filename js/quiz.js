document.addEventListener('DOMContentLoaded', () => {
    // Các biến tham chiếu đến các phần tử HTML
    const startScreen = document.getElementById('start-screen');
    const quizScreen = document.getElementById('quiz-screen');
    const resultScreen = document.getElementById('result-screen');
    const startBtn = document.getElementById('start-quiz-btn');
    const nextBtn = document.getElementById('next-question-btn');
    const restartBtn = document.getElementById('restart-quiz-btn');
    const exitBtn = document.getElementById('exit-quiz-btn');
    
    // Navigation elements
    const toggleNavBtn = document.getElementById('toggle-navigation-btn');
    const navigationPanel = document.getElementById('navigation-panel');
    const closeNavBtn = document.getElementById('close-navigation-btn');
    const questionGrid = document.getElementById('question-grid');
    const prevQuestionBtn = document.getElementById('prev-question-btn');
    const nextQuestionNavBtn = document.getElementById('next-question-nav-btn');
    const prevQuestionMainBtn = document.getElementById('prev-question-main-btn');
    const finishQuizBtn = document.getElementById('finish-quiz-btn');
    
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
    let questionAnswers = {}; // Track user answers for each question
    let navigationOverlay = null;
    const QUIZ_DURATION = 70 * 60; // 70 phút tính bằng giây
    const NUM_QUESTIONS = 40;

    // Hàm fetch câu hỏi từ backend
    async function fetchQuestions() {
        try {
            const response = await fetch('api/get_questions.php');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            allQuestions = await response.json();
        } catch (error) {
            console.error('Không thể tải câu hỏi:', error);
            questionText.textContent = 'Lỗi tải câu hỏi. Vui lòng thử lại sau.';
        }
    }

    // Hàm xáo trộn mảng (Fisher-Yates shuffle)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }    // Hàm bắt đầu quiz
    function startQuiz() {
        startScreen.classList.add('hidden');
        resultScreen.classList.add('hidden');
        quizScreen.classList.remove('hidden');

        currentQuestionIndex = 0;
        score = 0;
        questionAnswers = {}; // Reset answers
        shuffleArray(allQuestions);
        currentQuizQuestions = allQuestions.slice(0, NUM_QUESTIONS);

        displayQuestion();
        startTimer();
    }// Hàm format code trong text (phiên bản đơn giản cho CE103)
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
    }    // Hàm hiển thị câu hỏi
    function displayQuestion() {
        resetState();
        const question = currentQuizQuestions[currentQuestionIndex];
        questionCounter.textContent = `Câu ${currentQuestionIndex + 1} / ${NUM_QUESTIONS}`;
        
        // Format câu hỏi với code highlighting
        const formattedQuestion = formatCodeInText(question.question);
        questionText.innerHTML = formattedQuestion;

        for (const key in question.options) {
            const button = document.createElement('button');
            const formattedOption = formatCodeInText(question.options[key]);
            button.innerHTML = `<strong>${key}.</strong> ${formattedOption}`;
            button.classList.add('option-btn');
            button.dataset.answer = key;
            button.addEventListener('click', selectAnswer);
            optionsContainer.appendChild(button);
        }

        // Restore previous answer if exists
        if (questionAnswers[currentQuestionIndex]) {
            const previousAnswer = questionAnswers[currentQuestionIndex];
            const selectedBtn = Array.from(optionsContainer.children).find(
                btn => btn.dataset.answer === previousAnswer.selected
            );
            if (selectedBtn) {
                selectedBtn.classList.add('selected-review');
                selectedBtn.style.backgroundColor = '#e3f2fd';
                selectedBtn.style.borderColor = '#2196f3';
            }
        }

        // Render lại các công thức toán học với MathJax
        if (window.MathJax) {
            MathJax.typesetPromise([questionText, optionsContainer]).catch(function (err) {
                console.log('MathJax error: ' + err.message);
            });
        }
        
        updateNavigationButtons();
    }

    // Hàm reset trạng thái trước khi hiển thị câu hỏi mới
    function resetState() {
        optionsContainer.innerHTML = '';
        explanationArea.classList.add('hidden');
        nextBtn.classList.add('hidden');
    }    // Hàm xử lý khi chọn câu trả lời
    function selectAnswer(e) {
        const selectedBtn = e.target.closest('.option-btn');
        if (!selectedBtn) return;

        const selectedAnswer = selectedBtn.dataset.answer;
        const correctAnswer = currentQuizQuestions[currentQuestionIndex].answer;

        // Store the answer
        questionAnswers[currentQuestionIndex] = {
            selected: selectedAnswer,
            correct: correctAnswer,
            isCorrect: selectedAnswer === correctAnswer
        };

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
        });

        explanationText.innerHTML = formatCodeInText(currentQuizQuestions[currentQuestionIndex].explanation);
        explanationArea.classList.remove('hidden');
        
        // Render lại các công thức toán học với MathJax
        if (window.MathJax) {
            MathJax.typesetPromise([explanationText]).catch(function (err) {
                console.log('MathJax error: ' + err.message);
            });
        }
        
        nextBtn.classList.remove('hidden');
        updateNavigationButtons();
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
    }    // Hàm thoát quiz và quay về trang chủ
    function exitQuiz() {
        const confirmExit = confirm('Bạn có chắc chắn muốn thoát? Tiến trình làm bài sẽ bị mất.');
        if (confirmExit) {
            clearInterval(timerInterval);
            window.location.href = 'index.html';
        }
    }

    // Navigation functions
    function createNavigationOverlay() {
        if (!navigationOverlay) {
            navigationOverlay = document.createElement('div');
            navigationOverlay.className = 'navigation-overlay hidden';
            navigationOverlay.addEventListener('click', closeNavigation);
            document.body.appendChild(navigationOverlay);
        }
    }

    function updateNavigationGrid() {
        questionGrid.innerHTML = '';
        for (let i = 0; i < NUM_QUESTIONS; i++) {
            const gridItem = document.createElement('div');
            gridItem.className = 'question-grid-item';
            gridItem.textContent = i + 1;
            gridItem.dataset.questionIndex = i;
            
            // Set status classes
            if (i === currentQuestionIndex) {
                gridItem.classList.add('current');
            } else if (questionAnswers[i] !== undefined) {
                gridItem.classList.add('answered');
            } else {
                gridItem.classList.add('unanswered');
            }
            
            gridItem.addEventListener('click', () => goToQuestion(i));
            questionGrid.appendChild(gridItem);
        }
    }

    function showNavigation() {
        createNavigationOverlay();
        updateNavigationGrid();
        navigationOverlay.classList.remove('hidden');
        navigationPanel.classList.remove('hidden');
        updateNavigationButtons();
    }

    function closeNavigation() {
        navigationPanel.classList.add('hidden');
        if (navigationOverlay) {
            navigationOverlay.classList.add('hidden');
        }
    }

    function updateNavigationButtons() {
        prevQuestionBtn.disabled = currentQuestionIndex === 0;
        nextQuestionNavBtn.disabled = currentQuestionIndex === NUM_QUESTIONS - 1;
        prevQuestionMainBtn.disabled = currentQuestionIndex === 0;
        
        // Show finish button on last question or if all questions answered
        const allAnswered = Object.keys(questionAnswers).length === NUM_QUESTIONS;
        const isLastQuestion = currentQuestionIndex === NUM_QUESTIONS - 1;
        
        if (isLastQuestion || allAnswered) {
            finishQuizBtn.classList.remove('hidden');
        } else {
            finishQuizBtn.classList.add('hidden');
        }
    }

    function goToQuestion(questionIndex) {
        if (questionIndex >= 0 && questionIndex < NUM_QUESTIONS) {
            currentQuestionIndex = questionIndex;
            displayQuestion();
            closeNavigation();
            updateNavigationButtons();
        }
    }

    function goToPrevQuestion() {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            displayQuestion();
            updateNavigationButtons();
        }
    }

    function goToNextQuestion() {
        if (currentQuestionIndex < NUM_QUESTIONS - 1) {
            currentQuestionIndex++;
            displayQuestion();
            updateNavigationButtons();
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
    });    restartBtn.addEventListener('click', startQuiz);

    // Navigation event listeners
    toggleNavBtn.addEventListener('click', showNavigation);
    closeNavBtn.addEventListener('click', closeNavigation);
    prevQuestionBtn.addEventListener('click', goToPrevQuestion);
    nextQuestionNavBtn.addEventListener('click', goToNextQuestion);
    prevQuestionMainBtn.addEventListener('click', goToPrevQuestion);
    finishQuizBtn.addEventListener('click', showResults);

    // Tải câu hỏi ngay khi trang được mở
    fetchQuestions();
});