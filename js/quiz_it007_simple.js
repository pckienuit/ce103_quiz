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

    let allQuestions = [];
    let currentQuizQuestions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let timerInterval;
    let topicStats = {};
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
        shuffleArray(allQuestions);
        currentQuizQuestions = allQuestions.slice(0, NUM_QUESTIONS);

        // Khởi tạo thống kê chủ đề
        currentQuizQuestions.forEach(q => {
            if (!topicStats[q.topic]) {
                topicStats[q.topic] = { total: 0, correct: 0 };
            }
            topicStats[q.topic].total++;
        });

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

        const selectedAnswer = selectedBtn.dataset.answer;
        const correctAnswer = currentQuizQuestions[currentQuestionIndex].answer;
        const currentTopic = currentQuizQuestions[currentQuestionIndex].topic;

        if (selectedAnswer === correctAnswer) {
            score++;
            topicStats[currentTopic].correct++;
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

    // Tải câu hỏi khi trang được load
    fetchQuestions();
});
