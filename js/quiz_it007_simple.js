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
    const topicIndicator = document.getElementById('topic-indicator');

    const scoreDisplay = document.getElementById('score');
    const percentageDisplay = document.getElementById('percentage');
    const resultMessage = document.getElementById('result-message');
    const topicBreakdown = document.getElementById('topic-breakdown');

    // Navigation elements
    const navToggleBtn = document.getElementById('toggle-navigation-btn');
    const navigationPanel = document.getElementById('navigation-panel');
    const navCloseBtn = document.getElementById('close-navigation-btn');
    const prevQuestionBtn = document.getElementById('prev-question-btn');
    const nextQuestionNavBtn = document.getElementById('next-question-nav-btn');
    const finishQuizBtn = document.getElementById('finish-quiz-btn');
    const questionsGrid = document.getElementById('question-grid');
    const prevQuestionMainBtn = document.getElementById('prev-question-main-btn');

    let allQuestions = [];
    let currentQuizQuestions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let timerInterval;
    let topicStats = {};
    let questionAnswers = {}; // Track answers for each question
    const QUIZ_DURATION = 75 * 60; // 75 phút tính bằng giây
    const NUM_QUESTIONS = 40;

    // Hàm fetch câu hỏi IT007 từ backend
    async function fetchQuestions() {
        try {
            const response = await fetch('api/get_it007_questions.php');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            allQuestions = await response.json();
            console.log(`Đã tải ${allQuestions.length} câu hỏi IT007`);
        } catch (error) {
            console.error('Không thể tải câu hỏi IT007:', error);
            questionText.textContent = 'Lỗi tải câu hỏi IT007. Vui lòng thử lại sau.';
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
        topicStats = {};
        questionAnswers = {}; // Reset answers tracking
        shuffleArray(allQuestions);
        currentQuizQuestions = allQuestions.slice(0, NUM_QUESTIONS);

        // Khởi tạo thống kê chủ đề
        currentQuizQuestions.forEach(q => {
            if (!topicStats[q.topic]) {
                topicStats[q.topic] = { total: 0, correct: 0 };
            }
            topicStats[q.topic].total++;
        });

        createNavigationOverlay();
        displayQuestion();
        startTimer();
    }

    // Hàm format code trong text (phiên bản đơn giản cho IT007)
    function formatCodeInText(text) {
        let formattedText = text;
        
        // 1. Chỉ xử lý code trong backticks (`)
        formattedText = formattedText.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
        
        // 2. Highlight một số thuật ngữ OS cơ bản
        formattedText = formattedText.replace(
            /\b(OS|CPU|RAM|Process|Thread|Deadlock|Semaphore|Mutex|FIFO|LIFO|LRU|FCFS|SJF|RR)\b/g,
            '<span class="tech-term">$&</span>'
        );
        
        // 3. Highlight các số và thời gian
        formattedText = formattedText.replace(
            /\b(\d+ms|\d+s|\d+%|\d+KB|\d+MB|\d+GB)\b/g,
            '<span class="number-highlight">$&</span>'
        );
        
        return formattedText;
    }

    // Navigation functions
    function createNavigationOverlay() {
        if (!questionsGrid) {
            console.log('❌ questionsGrid not found!');
            return;
        }
        
        questionsGrid.innerHTML = '';
        for (let i = 0; i < NUM_QUESTIONS; i++) {
            const questionBox = document.createElement('div');
            questionBox.className = 'question-box';
            questionBox.textContent = i + 1;
            questionBox.dataset.questionIndex = i;
            questionBox.addEventListener('click', () => goToQuestion(i));
            questionsGrid.appendChild(questionBox);
        }
        updateNavigationGrid();
    }

    function updateNavigationGrid() {
        if (!questionsGrid) return;
        
        const questionBoxes = questionsGrid.querySelectorAll('.question-box');
        questionBoxes.forEach((box, index) => {
            box.className = 'question-box';
            if (index === currentQuestionIndex) {
                box.classList.add('current');
            } else if (questionAnswers[index] !== undefined && questionAnswers[index].hasBeenAnswered) {
                box.classList.add('answered');
            }
        });
    }

    function showNavigation() {
        if (navigationPanel) {
            navigationPanel.classList.remove('hidden');
            updateNavigationGrid();
            console.log('✅ Navigation panel shown');
        } else {
            console.log('❌ navigationPanel not found');
        }
    }

    function closeNavigation() {
        if (navigationPanel) {
            navigationPanel.classList.add('hidden');
            console.log('✅ Navigation panel closed');
        }
    }

    function goToQuestion(questionIndex) {
        if (questionIndex >= 0 && questionIndex < NUM_QUESTIONS) {
            currentQuestionIndex = questionIndex;
            displayQuestion();
            closeNavigation();
            console.log(`✅ Jumped to question ${questionIndex + 1}`);
        }
    }

    function goToPrevQuestion() {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            displayQuestion();
            console.log(`✅ Went to previous question ${currentQuestionIndex + 1}`);
        } else {
            console.log('❌ Already at first question');
        }
    }

    function goToNextQuestion() {
        if (currentQuestionIndex < NUM_QUESTIONS - 1) {
            currentQuestionIndex++;
            displayQuestion();
            console.log(`✅ Went to next question ${currentQuestionIndex + 1}`);
        } else {
            console.log('❌ Already at last question');
        }
    }

    function updateNavigationButtons() {
        if (prevQuestionBtn) {
            prevQuestionBtn.disabled = currentQuestionIndex === 0;
        }
        if (nextQuestionNavBtn) {
            nextQuestionNavBtn.disabled = currentQuestionIndex === NUM_QUESTIONS - 1;
        }
        if (prevQuestionMainBtn) {
            if (currentQuestionIndex === 0) {
                prevQuestionMainBtn.classList.add('hidden');
            } else {
                prevQuestionMainBtn.classList.remove('hidden');
            }
        }
        if (finishQuizBtn) {
            if (currentQuestionIndex === NUM_QUESTIONS - 1) {
                finishQuizBtn.classList.remove('hidden');
            } else {
                finishQuizBtn.classList.add('hidden');
            }
        }
    }

    // Hàm hiển thị câu hỏi
    function displayQuestion() {
        resetState();
        const question = currentQuizQuestions[currentQuestionIndex];
        questionCounter.textContent = `Câu ${currentQuestionIndex + 1} / ${NUM_QUESTIONS}`;
        
        // Hiển thị chủ đề
        topicIndicator.textContent = question.topic;
        
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
        const previousAnswer = questionAnswers[currentQuestionIndex];
        if (previousAnswer !== undefined && previousAnswer.hasBeenAnswered) {
            const selectedBtn = optionsContainer.querySelector(`[data-answer="${previousAnswer.selectedAnswer}"]`);
            const correctAnswer = question.answer;
            
            if (selectedBtn) {
                if (previousAnswer.selectedAnswer === correctAnswer) {
                    selectedBtn.classList.add('correct');
                } else {
                    selectedBtn.classList.add('incorrect');
                }
            }

            // Show correct answer
            Array.from(optionsContainer.children).forEach(button => {
                if (button.dataset.answer === correctAnswer) {
                    button.classList.add('correct');
                }
                button.disabled = true;
            });

            explanationText.innerHTML = formatCodeInText(question.explanation);
            explanationArea.classList.remove('hidden');
            nextBtn.classList.remove('hidden');
        }

        // Update navigation
        updateNavigationGrid();
        updateNavigationButtons();

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
    }

    // Hàm xử lý khi chọn câu trả lời
    function selectAnswer(e) {
        const selectedBtn = e.target.closest('.option-btn');
        if (!selectedBtn) return;

        // Prevent multiple selections
        if (selectedBtn.disabled) return;

        const selectedAnswer = selectedBtn.dataset.answer;
        const correctAnswer = currentQuizQuestions[currentQuestionIndex].answer;
        const currentTopic = currentQuizQuestions[currentQuestionIndex].topic;

        // Store the answer (only count score if this is the first time answering)
        if (questionAnswers[currentQuestionIndex] === undefined) {
            if (selectedAnswer === correctAnswer) {
                score++;
                topicStats[currentTopic].correct++;
            }
        }
        
        // Store the answer for navigation tracking
        questionAnswers[currentQuestionIndex] = {
            selectedAnswer: selectedAnswer,
            isCorrect: selectedAnswer === correctAnswer,
            hasBeenAnswered: true
        };

        if (selectedAnswer === correctAnswer) {
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
        
        // Update navigation grid to show this question as answered
        updateNavigationGrid();
        
        console.log(`✅ Answer stored for question ${currentQuestionIndex + 1}: ${selectedAnswer}`);
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

        // Đánh giá kết quả
        let message = '';
        if (percentage >= 80) {
            message = '🎉 Xuất sắc! Bạn đã nắm vững kiến thức IT007.';
        } else if (percentage >= 70) {
            message = '👍 Tốt! Bạn có hiểu biết tốt về Hệ điều hành.';
        } else if (percentage >= 50) {
            message = '📚 Khá! Hãy ôn tập thêm để nâng cao kiến thức.';
        } else {
            message = '💪 Cần cố gắng hơn! Hãy học kỹ lại các khái niệm cơ bản.';
        }
        resultMessage.textContent = message;

        // Hiển thị thống kê theo chủ đề
        displayTopicBreakdown();
    }

    // Hàm hiển thị thống kê theo chủ đề
    function displayTopicBreakdown() {
        let html = '<h3>📊 Kết quả theo chủ đề:</h3>';
        html += '<div style="display: grid; gap: 10px;">';
        
        for (const [topic, stats] of Object.entries(topicStats)) {
            const topicPercentage = ((stats.correct / stats.total) * 100).toFixed(1);
            const color = topicPercentage >= 70 ? '#28a745' : topicPercentage >= 50 ? '#ffc107' : '#dc3545';
            
            html += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: rgba(240, 147, 251, 0.1); border-radius: 5px;">
                    <span style="font-weight: 500;">${topic}</span>
                    <span style="color: ${color}; font-weight: bold;">${stats.correct}/${stats.total} (${topicPercentage}%)</span>
                </div>
            `;
        }
        
        html += '</div>';
        topicBreakdown.innerHTML = html;
    }

    // Hàm thoát quiz và quay về trang chủ
    function exitQuiz() {
        if (confirm('Bạn có chắc chắn muốn thoát? Kết quả sẽ không được lưu.')) {
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
    
    restartBtn.addEventListener('click', () => {
        startQuiz();
    });

    // Navigation event listeners - with debugging
    console.log('🔧 Checking navigation elements...');
    console.log('navToggleBtn:', navToggleBtn);
    console.log('navigationPanel:', navigationPanel);
    console.log('navCloseBtn:', navCloseBtn);
    console.log('prevQuestionBtn:', prevQuestionBtn);
    console.log('nextQuestionNavBtn:', nextQuestionNavBtn);
    console.log('finishQuizBtn:', finishQuizBtn);
    console.log('questionsGrid:', questionsGrid);
    console.log('prevQuestionMainBtn:', prevQuestionMainBtn);
    
    if (navToggleBtn) {
        navToggleBtn.addEventListener('click', showNavigation);
        console.log('✅ Navigation toggle button found');
    } else {
        console.log('❌ Navigation toggle button not found!');
    }
    
    if (navCloseBtn) {
        navCloseBtn.addEventListener('click', closeNavigation);
        console.log('✅ Navigation close button found');
    } else {
        console.log('❌ Navigation close button not found!');
    }
    
    if (prevQuestionBtn) {
        prevQuestionBtn.addEventListener('click', goToPrevQuestion);
        console.log('✅ Previous question button (nav) found');
    } else {
        console.log('❌ Previous question button (nav) not found!');
    }
    
    if (nextQuestionNavBtn) {
        nextQuestionNavBtn.addEventListener('click', goToNextQuestion);
        console.log('✅ Next question button (nav) found');
    } else {
        console.log('❌ Next question button (nav) not found!');
    }
    
    if (finishQuizBtn) {
        finishQuizBtn.addEventListener('click', showResults);
        console.log('✅ Finish quiz button found');
    } else {
        console.log('❌ Finish quiz button not found!');
    }

    if (prevQuestionMainBtn) {
        prevQuestionMainBtn.addEventListener('click', goToPrevQuestion);
        console.log('✅ Previous question main button found');
    } else {
        console.log('❌ Previous question main button not found!');
    }

    // Close navigation when clicking outside
    if (navigationPanel) {
        navigationPanel.addEventListener('click', (e) => {
            // Don't close if clicking inside the panel content
            if (e.target === navigationPanel) {
                closeNavigation();
            }
        });
    }

    // Tải câu hỏi khi trang được load
    fetchQuestions();
});
