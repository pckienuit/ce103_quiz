@echo off
echo 🤖 CE103 Quiz - Preprocessing Monitor
echo =====================================
echo.

:loop
echo [%time%] Checking preprocessing status...

REM Check if enhanced files exist
if exist "api\questions_enhanced.json" (
    if exist "api\flashcards_enhanced.json" (
        echo.
        echo ✅ PREPROCESSING COMPLETED!
        echo ✅ questions_enhanced.json found
        echo ✅ flashcards_enhanced.json found
        echo.
        echo 📊 File sizes:
        dir "api\questions_enhanced.json" | find " bytes"
        dir "api\flashcards_enhanced.json" | find " bytes"
        echo.
        echo 🚀 Enhanced system is ready!
        echo 🧪 Test at: http://localhost/ce103_quiz/test_preprocessing_system.html
        echo 📝 Quiz at: http://localhost/ce103_quiz/quiz.html  
        echo 📚 Flashcards at: http://localhost/ce103_quiz/flashcards.html
        echo.
        pause
        goto :eof
    )
)

echo ⏳ Still processing... (Ctrl+C to stop monitoring)
timeout /t 30 /nobreak >nul 2>&1
goto loop
