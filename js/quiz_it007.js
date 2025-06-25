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
    const topicResults = document.getElementById('topic-results');

    let allQuestions = [];
    let currentQuizQuestions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let topicScores = {};
    let timerInterval;
    const QUIZ_DURATION = 40 * 60; // 40 phút tính bằng giây
    const NUM_QUESTIONS = 24;

    // Hàm cập nhật trạng thái AI
    function updateAIStatus(message, status = 'active') {
        const aiStatus = document.getElementById('ai-status');
        if (aiStatus) {
            aiStatus.textContent = message;
            aiStatus.className = `ai-status ${status}`;
        }
    }

    // Hàm fetch câu hỏi IT007 với enhanced highlighting
    async function fetchQuestions() {
        try {
            updateAIStatus('🔄 Loading IT007 data...', 'active');
            
            // Try to load enhanced data first
            if (window.enhancedHighlighter) {
                try {
                    await window.enhancedHighlighter.loadEnhancedData('it007');
                    allQuestions = window.enhancedHighlighter.getAllEnhancedQuestions();
                    updateAIStatus('✅ Enhanced AI data loaded', 'active');
                    console.log('✅ Using enhanced AI-processed IT007 data');
                    updateTopicStats();
                    return;
                } catch (enhancedError) {
                    console.warn('Enhanced IT007 data not available, falling back to original:', enhancedError);
                    updateAIStatus('⚠️ Enhanced data unavailable', 'fallback');
                }
            }

            // Fallback to original data with regex highlighting
            const response = await fetch('api/get_it007_questions.php');
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
            
            updateAIStatus('📝 Original IT007 data with basic highlighting', 'fallback');
            updateTopicStats();
            
        } catch (error) {
            console.error('Không thể tải câu hỏi IT007:', error);
            updateAIStatus('❌ Loading failed', 'error');
            questionText.textContent = 'Lỗi tải câu hỏi IT007. Vui lòng thử lại sau.';
        }
    }

    // Hàm cập nhật thống kê chủ đề
    function updateTopicStats() {
        const topicCounts = {};
        allQuestions.forEach(q => {
            topicCounts[q.topic] = (topicCounts[q.topic] || 0) + 1;
        });

        const chapter5Count = document.getElementById('chapter5-count');
        const chapter6Count = document.getElementById('chapter6-count');
        
        if (chapter5Count && chapter6Count) {
            chapter5Count.textContent = `${topicCounts['Đồng bộ hoá tiến trình (Chương 5)'] || 0} câu`;
            chapter6Count.textContent = `${topicCounts['Tắc nghẽn (Deadlock) (Chương 6)'] || 0} câu`;
        }
    }

    // Hàm xáo trộn mảng (Fisher-Yates shuffle)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // Hàm chọn câu hỏi cân bằng theo chủ đề
    function selectBalancedQuestions(questions, totalQuestions) {
        // Nhóm câu hỏi theo chủ đề
        const questionsByTopic = {};
        questions.forEach(question => {
            if (!questionsByTopic[question.topic]) {
                questionsByTopic[question.topic] = [];
            }
            questionsByTopic[question.topic].push(question);
        });

        const topics = Object.keys(questionsByTopic);
        const questionsPerTopic = Math.floor(totalQuestions / topics.length);
        const remainingQuestions = totalQuestions % topics.length;
        
        let selectedQuestions = [];
        
        // Chọn câu hỏi cân bằng từ mỗi chủ đề
        topics.forEach((topic, index) => {
            const topicQuestions = [...questionsByTopic[topic]];
            shuffleArray(topicQuestions);
            
            // Số câu hỏi cho chủ đề này
            let questionsToTake = questionsPerTopic;
            if (index < remainingQuestions) {
                questionsToTake++; // Phân phối câu hỏi dư
            }
            
            // Đảm bảo không vượt quá số câu hỏi có sẵn
            questionsToTake = Math.min(questionsToTake, topicQuestions.length);
            
            selectedQuestions.push(...topicQuestions.slice(0, questionsToTake));
        });

        // Nếu chưa đủ câu hỏi, bổ sung từ các chủ đề có nhiều câu hỏi
        while (selectedQuestions.length < totalQuestions) {
            const availableQuestions = questions.filter(q => 
                !selectedQuestions.some(sq => sq.id === q.id)
            );
            
            if (availableQuestions.length === 0) break;
            
            shuffleArray(availableQuestions);
            selectedQuestions.push(availableQuestions[0]);
        }

        // Xáo trộn thứ tự câu hỏi cuối cùng
        shuffleArray(selectedQuestions);
        
        return selectedQuestions.slice(0, totalQuestions);
    }

    // Hàm bắt đầu quiz
    function startQuiz() {
        startScreen.classList.add('hidden');
        resultScreen.classList.add('hidden');
        quizScreen.classList.remove('hidden');

        currentQuestionIndex = 0;
        score = 0;
        topicScores = {};
        
        // Chọn câu hỏi cân bằng theo chủ đề
        currentQuizQuestions = selectBalancedQuestions(allQuestions, NUM_QUESTIONS);
        
        // Khởi tạo điểm theo chủ đề
        currentQuizQuestions.forEach(q => {
            if (!topicScores[q.topic]) {
                topicScores[q.topic] = { correct: 0, total: 0 };
            }
            topicScores[q.topic].total++;
        });

        displayQuestion();
        startTimer();
    }

    // Hàm hiển thị câu hỏi
    function displayQuestion() {
        const question = currentQuizQuestions[currentQuestionIndex];
        
        questionCounter.textContent = `Câu ${currentQuestionIndex + 1} / ${NUM_QUESTIONS}`;
        questionText.innerHTML = question.question;
        topicIndicator.textContent = `📚 ${question.topic}`;
        
        optionsContainer.innerHTML = '';
        Object.entries(question.options).forEach(([key, value]) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option';
            optionDiv.innerHTML = `<strong>${key}:</strong> ${value}`;
            optionDiv.addEventListener('click', () => selectOption(optionDiv, key));
            optionsContainer.appendChild(optionDiv);
        });

        explanationArea.classList.add('hidden');
        nextBtn.classList.add('hidden');

        // Re-render MathJax if present
        if (window.MathJax) {
            MathJax.typesetPromise([questionText, optionsContainer]).catch(console.error);
        }

        // Re-highlight code if Prism is present
        if (window.Prism) {
            Prism.highlightAllUnder(questionText);
            Prism.highlightAllUnder(optionsContainer);
        }
    }

    // Hàm chọn đáp án
    function selectOption(selectedDiv, selectedAnswer) {
        const question = currentQuizQuestions[currentQuestionIndex];
        const correctAnswer = question.answer;
        
        // Loại bỏ selection cũ
        document.querySelectorAll('.option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        selectedDiv.classList.add('selected');
        
        // Hiển thị kết quả
        setTimeout(() => {
            document.querySelectorAll('.option').forEach(opt => {
                const optionKey = opt.innerHTML.match(/<strong>([A-D]):<\/strong>/)[1];
                if (optionKey === correctAnswer) {
                    opt.classList.add('correct');
                } else if (optionKey === selectedAnswer && selectedAnswer !== correctAnswer) {
                    opt.classList.add('incorrect');
                }
                opt.style.pointerEvents = 'none';
            });

            // Cập nhật điểm
            if (selectedAnswer === correctAnswer) {
                score++;
                topicScores[question.topic].correct++;
            }

            // Hiển thị giải thích
            explanationText.innerHTML = question.explanation;
            explanationArea.classList.remove('hidden');
            
            // Re-render MathJax in explanation
            if (window.MathJax) {
                MathJax.typesetPromise([explanationText]).catch(console.error);
            }
            
            // Re-highlight code in explanation
            if (window.Prism) {
                Prism.highlightAllUnder(explanationText);
            }

            nextBtn.classList.remove('hidden');
        }, 500);
    }

    // Hàm câu hỏi tiếp theo
    function nextQuestion() {
        currentQuestionIndex++;
        if (currentQuestionIndex < currentQuizQuestions.length) {
            displayQuestion();
        } else {
            showResults();
        }
    }

    // Hàm hiển thị kết quả
    function showResults() {
        clearInterval(timerInterval);
        quizScreen.classList.add('hidden');
        resultScreen.classList.remove('hidden');

        const percentage = Math.round((score / NUM_QUESTIONS) * 100);
        
        scoreDisplay.textContent = score;
        percentageDisplay.textContent = percentage;
        
        // Thông điệp kết quả
        let message = '';
        if (percentage >= 90) {
            message = '🏆 Xuất sắc! Bạn đã nắm vững kiến thức Hệ Điều Hành!';
        } else if (percentage >= 80) {
            message = '🎉 Rất tốt! Kiến thức của bạn về OS rất vững vàng!';
        } else if (percentage >= 70) {
            message = '👍 Khá tốt! Hãy ôn tập thêm một số chủ đề.';
        } else if (percentage >= 60) {
            message = '📚 Cần cải thiện. Hãy tập trung ôn tập thêm.';
        } else {
            message = '💪 Đừng nản lòng! Hãy ôn tập kỹ và thử lại.';
        }
        resultMessage.textContent = message;

        // Hiển thị kết quả theo chủ đề
        displayTopicBreakdown();
    }

    // Hàm hiển thị kết quả theo chủ đề
    function displayTopicBreakdown() {
        topicResults.innerHTML = '';
        
        Object.entries(topicScores).forEach(([topic, scores]) => {
            const percentage = Math.round((scores.correct / scores.total) * 100);
            
            const topicDiv = document.createElement('div');
            topicDiv.className = 'topic-result';
            topicDiv.innerHTML = `
                <div class="topic-name">${topic}</div>
                <div class="topic-score">${scores.correct}/${scores.total} (${percentage}%)</div>
                <div class="topic-bar">
                    <div class="topic-progress" style="width: ${percentage}%"></div>
                </div>
            `;
            
            topicResults.appendChild(topicDiv);
        });
    }

    // Hàm timer
    function startTimer() {
        let timeLeft = QUIZ_DURATION;
        
        timerInterval = setInterval(() => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerDisplay.textContent = `Thời gian: ${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            if (timeLeft <= 0) {
                showResults();
                return;
            }
            
            timeLeft--;
        }, 1000);
    }

    // Hàm thoát quiz
    function exitQuiz() {
        if (confirm('Bạn có chắc chắn muốn thoát? Kết quả sẽ không được lưu.')) {
            clearInterval(timerInterval);
            window.location.href = 'index.html';
        }
    }

    // Hàm khởi tạo lại quiz
    function restartQuiz() {
        clearInterval(timerInterval);
        startQuiz();
    }

    // Event listeners
    startBtn.addEventListener('click', startQuiz);
    nextBtn.addEventListener('click', nextQuestion);
    restartBtn.addEventListener('click', restartQuiz);
    exitBtn.addEventListener('click', exitQuiz);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !quizScreen.classList.contains('hidden')) {
            exitQuiz();
        }
        if (e.key === 'Enter' && !nextBtn.classList.contains('hidden')) {
            nextQuestion();
        }
        if (e.key >= '1' && e.key <= '4' && !quizScreen.classList.contains('hidden')) {
            const options = document.querySelectorAll('.option');
            const optionIndex = parseInt(e.key) - 1;
            if (options[optionIndex] && options[optionIndex].style.pointerEvents !== 'none') {
                const optionKey = String.fromCharCode(65 + optionIndex); // A, B, C, D
                selectOption(options[optionIndex], optionKey);
            }
        }
    });

    // Tải câu hỏi khi trang được load
    fetchQuestions();
});
