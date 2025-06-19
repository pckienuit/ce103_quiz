# CE103 Quiz - Bright Theme Code Highlighting

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Language](https://img.shields.io/badge/language-JavaScript-yellow.svg)
![Framework](https://img.shields.io/badge/framework-Vanilla%20JS-green.svg)
![License](https://img.shields.io/badge/license-MIT-lightgrey.svg)

## 🌟 Overview

Interactive quiz and flashcards application for CE103 (Computer Engineering) course with intelligent assembly code highlighting, mathematical formula support, and bright theme design.

## ✨ Features

### 🎨 **Bright Theme Design**
- **Gradient backgrounds** với modern UI
- **Box shadows và animations** cho better UX
- **Responsive design** tối ưu cho mobile
- **Professional color scheme** phù hợp academic environment

### 🤖 **Enhanced AI System**
- **Pre-processing approach** với Gemini 2.5 Flash Preview
- **Instant highlighting** - no real-time API calls during quiz
- **Enhanced JSON data** với pre-analyzed content
- **Intelligent highlighting** thay thế string-based detection  
- **Context-aware processing** - hiểu ngữ cảnh Vietnamese + Technical
- **Fallback system** - automatic fallback to regex highlighting
- **Better performance** - no waiting for AI analysis
- **Offline capability** - works without internet connection

### 🧠 **Smart Code Highlighting**
- **Assembly syntax highlighting** với Prism.js
- **False positive prevention** - không highlight sai từ tiếng Việt
- **Context-aware detection** - chỉ highlight khi chắc chắn
- **Protected content system** - bảo vệ backticks và formulas

### 📐 **Mathematical Formula Support**
- **MathJax 3.x integration** cho LaTeX rendering
- **Inline math** với `$...$` syntax
- **Display math** với `$$...$$` syntax
- **Formula variable highlighting** riêng biệt

### 📚 **Educational Content**
- **230 quiz questions** với random selection
- **60 specialized flashcards** với dedicated data
- **40 questions per quiz** với 70-minute timer
- **Comprehensive explanations** cho mọi câu hỏi

## 🚀 Quick Start

### Prerequisites
- **XAMPP** hoặc local web server
- **Modern browser** (Chrome 91+, Firefox 88+, Safari 14+, Edge 91+)

### Installation

1. **Clone hoặc download** project vào XAMPP htdocs:
```bash
cd c:\xampp\htdocs
git clone <repository-url> ce103_quiz
```

2. **Start XAMPP** Apache service:
```bash
cd ce103_quiz
build.bat serve
```

3. **Open in browser**:
```bash
# Quiz application
build.bat quiz

# Flashcards
build.bat cards

# Run tests
build.bat test
```

## 📁 Project Structure

```
ce103_quiz/
├── 📄 index.html                    # Landing page
├── 📄 quiz.html                     # Main quiz application
├── 📄 flashcards.html               # Flashcards study tool
├── 📄 config.json                   # Project configuration
├── 📄 build.bat                     # Build and test script
├── 📄 BRIGHT_THEME_DOCUMENTATION.md # Technical documentation
│
├── 📂 api/
│   ├── 📄 get_questions.php         # Quiz questions API
│   ├── 📄 gemini_analyzer.php       # Gemini AI analysis API
│   ├── 📄 questions.json            # 230 quiz questions
│   └── 📄 flashcards.json           # 60 flashcards data
│
├── 📂 css/
│   ├── 📄 quiz_bright.css           # Bright theme for quiz
│   ├── 📄 flashcards.css            # Flashcards styling
│   ├── 📄 quiz.css                  # Original quiz styles
│   └── 📄 style.css                 # Base styles
│
├── 📂 js/
│   ├── 📄 quiz_improved.js          # Enhanced quiz logic with AI
│   ├── 📄 flashcards_improved.js    # Enhanced flashcards logic with AI
│   ├── 📄 gemini_highlighter.js     # Gemini AI integration module
│   ├── 📄 quiz.js                   # Original quiz script
│   └── 📄 flashcards.js             # Original flashcards script
│
└── 📂 test/
    ├── 📄 test_improved_highlighting.html    # General highlighting tests
    ├── 📄 test_false_positive.html          # False positive tests
    ├── 📄 test_complete.html                # Complete feature demo
    ├── 📄 test_enhanced.html                # Enhanced features test
    ├── 📄 test_code.html                    # Code highlighting test
    └── 📄 test_math.html                    # Math formula test
```

## 🎯 Usage

### Quiz Application

1. **Start Quiz**: Click "Bắt đầu thi" trên homepage
2. **Answer Questions**: 40 random questions từ pool 230 questions
3. **Time Management**: 70-minute countdown timer
4. **Exit Option**: ESC key hoặc exit button với confirmation
5. **Results**: Automatic scoring với pass/fail status

### Flashcards

1. **Navigate Cards**: Click thẻ hoặc use navigation buttons
2. **Flip Cards**: Click để xem definition/explanation
3. **Study Mode**: 60 specialized cards theo topics
4. **Progress Tracking**: Card counter hiển thị progress

## 🔧 Configuration

Edit `config.json` để customize:

```json
{
  "quiz": {
    "questionsPerQuiz": 40,
    "timeLimit": 70,
    "passingScore": 50
  },
  "highlighting": {
    "assemblyInstructions": ["MOV", "JMP", "ADD", ...],
    "technicalTerms": ["ROM", "RAM", "CPU", ...]
  },
  "styling": {
    "codeBlockTheme": "bright",
    "gradientBackgrounds": true
  }
}
```

## 🧪 Testing

### Automated Tests

```bash
# Run all tests
build.bat test

# Individual tests
start http://localhost/ce103_quiz/test_improved_highlighting.html
start http://localhost/ce103_quiz/test_false_positive.html
```

### Test Cases

#### ✅ **Assembly Code Highlighting**
```
✓ MOV A, R0    - Should highlight
✓ ADD A, #10H  - Should highlight  
✗ "chỉ" word   - Should NOT highlight "CH"
✗ "machine"    - Should NOT highlight "MAC"
```

#### ✅ **Mathematical Formulas**
```
✓ $$T_{machine} = \frac{12}{f_{osc}}$$  - LaTeX display
✓ $f_{osc} = 12MHz$                     - Inline math
✗ Variables in equations                 - Protected from highlighting
```

#### ✅ **Technical Terms**
```
✓ ROM, RAM, CPU  - Should highlight when standalone
✗ Vietnamese words containing terms     - Should NOT highlight
```

## 🎨 Styling Guide

### Color Scheme

```css
/* Assembly Code */
.inline-code-bright {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    color: #92400e;
}

/* Technical Terms */
.tech-term {
    background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
    color: #047857;
}

/* Numbers */
.number-highlight {
    background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%);
    color: #b91c1c;
}

/* Formula Variables */
.formula-var {
    background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
    color: #5b21b6;
}
```

### Code Blocks

```css
.code-block {
    background: linear-gradient(135deg, #fefbff 0%, #f8f9fa 100%);
    border-radius: 12px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.08);
}

.code-block::before {
    background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ef4444);
    height: 3px;
}
```

## 🚀 Performance

### Optimizations

- **Protected Content System**: Tránh multiple processing
- **Efficient Regex Patterns**: Word boundary detection
- **Lazy Loading**: Prism.js components load on demand
- **MathJax Configuration**: Optimized cho performance

### Metrics

- **Initial Load**: < 2s
- **Question Rendering**: < 100ms  
- **Code Highlighting**: < 50ms per block
- **MathJax Processing**: < 500ms

## 🌐 Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome  | 91+     | ✅ Full |
| Firefox | 88+     | ✅ Full |
| Safari  | 14+     | ✅ Full |
| Edge    | 91+     | ✅ Full |
| Mobile  | Modern  | ✅ Responsive |

## 🤝 Contributing

1. **Fork** the repository
2. **Create** feature branch: `git checkout -b feature/new-feature`
3. **Commit** changes: `git commit -am 'Add new feature'`
4. **Push** to branch: `git push origin feature/new-feature`
5. **Submit** pull request

### Development Guidelines

- **Follow** existing code style
- **Add tests** cho new features
- **Update** documentation
- **Test** trên multiple browsers

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **CE103 Development Team**
- **Contributors**: [List contributors here]

## 🙏 Acknowledgments

- **MathJax** for mathematical formula rendering
- **Prism.js** for syntax highlighting
- **XAMPP** for local development environment
- **CE103 Course Team** for educational content

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Email**: support@ce103quiz.edu
- **Documentation**: [BRIGHT_THEME_DOCUMENTATION.md](BRIGHT_THEME_DOCUMENTATION.md)

---

**Made with ❤️ for CE103 Students**

## 🤖 Gemini AI Integration

### Features
- **Intelligent Text Analysis**: AI-powered content analysis thay thế regex-based highlighting
- **Context Understanding**: Hiểu được sự khác biệt giữa technical terms và Vietnamese words
- **Fallback System**: Automatic fallback về highlighting cũ nếu API không available
- **Performance Optimization**: Caching system để giảm API calls
- **Real-time Status**: Visual indicators cho AI processing status

### Configuration

1. **API Key Setup**: Gemini API key đã được configure trong `api/gemini_analyzer.php`
2. **Model Selection**: Sử dụng `gemini-2.5-flash-preview-05-20` cho optimal performance
3. **Caching**: 100-item cache với FIFO replacement policy
4. **Error Handling**: Graceful degradation khi AI service unavailable

### Testing

Sử dụng test page để verify AI integration:
```bash
# Open Gemini AI test page
http://localhost/ce103_quiz/test_gemini_ai.html
```

### API Status Indicators

- 🤖 **AI Ready**: Enhanced AI system hoạt động bình thường
- 📝 **Basic highlighting**: Fallback regex mode đang active
- ⚠️ **Enhanced data unavailable**: Enhanced JSON files chưa được generate
- ✅ **Enhanced content**: AI-processed content đang được sử dụng

## 🔄 Pre-processing System

### Generate Enhanced Data

```bash
# Run Gemini AI preprocessing
cd c:\xampp\htdocs\ce103_quiz
python preprocess_with_gemini.py
```

### Enhanced Files Generated
- `api/questions_enhanced.json` - 230 questions with AI analysis
- `api/flashcards_enhanced.json` - 60 flashcards with AI analysis

### Migration Guide
See [PREPROCESSING_MIGRATION.md](PREPROCESSING_MIGRATION.md) for detailed migration information.

### Testing Enhanced System
```bash
# Test enhanced system status
http://localhost/ce103_quiz/test_preprocessing_system.html

# Test with sample enhanced data
http://localhost/ce103_quiz/test_sample_enhanced.html
```
