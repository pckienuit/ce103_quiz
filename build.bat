@echo off
REM CE103 Quiz - Build and Test Script
REM Usage: build.bat [command]

if "%1"=="" (
    echo Usage: build.bat [command]
    echo.    echo Available commands:
    echo   test      - Run all tests
    echo   ai        - Test Gemini AI integration
    echo   quiz      - Open quiz in browser
    echo   cards     - Open flashcards in browser
    echo   validate  - Validate data files
    echo   serve     - Start local server
    echo   help      - Show this help
    goto :eof
)

if "%1"=="test" (
    echo Starting comprehensive tests...
    start http://localhost/ce103_quiz/test_improved_highlighting.html
    timeout /t 2 >nul
    start http://localhost/ce103_quiz/test_false_positive.html
    timeout /t 2 >nul
    start http://localhost/ce103_quiz/test_preprocessing_system.html
    timeout /t 2 >nul
    start http://localhost/ce103_quiz/test_complete_system.html
    echo All tests opened in browser tabs
    goto :eof
)

if "%1"=="ai" (
    echo Testing enhanced AI system...
    start http://localhost/ce103_quiz/test_preprocessing_system.html
    timeout /t 2 >nul
    start http://localhost/ce103_quiz/test_sample_enhanced.html
    timeout /t 2 >nul
    start http://localhost/ce103_quiz/test_complete_system.html
    echo Enhanced AI tests opened in browser
    goto :eof
)

if "%1"=="quiz" (
    echo Opening quiz application...
    start http://localhost/ce103_quiz/quiz.html
    goto :eof
)

if "%1"=="cards" (
    echo Opening flashcards application...
    start http://localhost/ce103_quiz/flashcards.html
    goto :eof
)

if "%1"=="validate" (
    echo Validating data files...
    if exist check_duplicates.py (
        python check_duplicates.py
    ) else (
        echo Python validation script not found
    )
    goto :eof
)

if "%1"=="serve" (
    echo Starting XAMPP services...
    net start apache2.4
    echo Apache started. Access at http://localhost/ce103_quiz/
    goto :eof
)

if "%1"=="preprocess" (
    echo Running Gemini AI preprocessing...
    python preprocess_with_gemini.py
    goto :eof
)

if "%1"=="monitor" (
    echo Starting preprocessing monitor...
    monitor_preprocessing.bat
    goto :eof
)

if "%1"=="help" (
    echo CE103 Quiz - Enhanced AI System
    echo ==============================
    echo.
    echo This project includes:
    echo - 230 quiz questions with AI-enhanced highlighting
    echo - 60 specialized flashcards
    echo - Pre-processing approach with Gemini AI
    echo - Mathematical formula support with MathJax
    echo - Assembly code syntax highlighting
    echo - Instant highlighting with offline capability
    echo.
    echo Files:
    echo - quiz.html                    : Main quiz application
    echo - flashcards.html             : Flashcards study tool
    echo - css/quiz_bright.css         : Bright theme stylesheet
    echo - js/enhanced_highlighter.js  : Enhanced highlighting system
    echo - preprocess_with_gemini.py   : AI preprocessing script
    echo.
    echo Commands:
    echo - test       : Run all tests
    echo - ai         : Test enhanced AI system
    echo - quiz       : Open quiz application
    echo - cards      : Open flashcards application
    echo - preprocess : Run Gemini AI preprocessing
    echo - monitor    : Monitor preprocessing status
    echo - validate   : Validate data files
    echo - serve      : Start local server
    echo.
    goto :eof
)

echo Unknown command: %1
echo Use "build.bat help" for available commands
