@echo off
REM CE103 Quiz - Build and Test Script
REM Usage: build.bat [command]

if "%1"=="" (
    echo Usage: build.bat [command]
    echo.
    echo Available commands:
    echo   test      - Run all tests
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
    echo Tests opened in browser tabs
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

if "%1"=="help" (
    echo CE103 Quiz - Bright Theme Code Highlighting
    echo ==========================================
    echo.
    echo This project includes:
    echo - 230 quiz questions with smart highlighting
    echo - 60 specialized flashcards
    echo - Mathematical formula support with MathJax
    echo - Assembly code syntax highlighting
    echo - False positive prevention for Vietnamese text
    echo.
    echo Files:
    echo - quiz.html           : Main quiz application
    echo - flashcards.html     : Flashcards study tool
    echo - css/quiz_bright.css : Bright theme stylesheet
    echo - js/quiz_improved.js : Enhanced quiz logic
    echo.
    echo Test files:
    echo - test_improved_highlighting.html : General highlighting tests
    echo - test_false_positive.html       : False positive prevention tests
    echo.
    goto :eof
)

echo Unknown command: %1
echo Use "build.bat help" for available commands
