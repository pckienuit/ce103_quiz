# 🚀 Quick Start Guide - CE103 Quiz với Gemini AI

## 🎯 Hướng dẫn sử dụng nhanh

### 📋 **Yêu cầu hệ thống**
- ✅ **XAMPP** hoặc web server khác
- ✅ **Browser hiện đại** (Chrome 91+, Firefox 88+, Safari 14+)
- ✅ **Kết nối internet** cho Gemini AI (có fallback nếu offline)

---

## 🏃‍♂️ **Khởi chạy nhanh**

### **1. Cài đặt**
```bash
# Copy project vào XAMPP htdocs
copy ce103_quiz c:\xampp\htdocs\

# Khởi động XAMPP Apache
# Hoặc sử dụng build script
cd c:\xampp\htdocs\ce103_quiz
build.bat serve
```

### **2. Truy cập ứng dụng**
```bash
# Trang chủ
http://localhost/ce103_quiz/

# Quiz trực tiếp
http://localhost/ce103_quiz/quiz.html

# Flashcards
http://localhost/ce103_quiz/flashcards.html
```

### **3. Test hệ thống**
```bash
# Test tất cả tính năng
build.bat test

# Test riêng Gemini AI
build.bat ai

# Mở quiz
build.bat quiz

# Mở flashcards  
build.bat cards
```

---

## 🤖 **Gemini AI Features**

### **Tự động hoạt động**
- 🔄 **AI analysis**: Tự động phân tích nội dung thông minh
- 📝 **Fallback**: Chuyển về highlighting cũ nếu AI lỗi
- ⚡ **Caching**: Tối ưu performance với cache thông minh
- 📊 **Status**: Hiển thị trạng thái AI real-time

### **Trạng thái AI**
- 🤖 **AI Ready**: Gemini hoạt động bình thường
- 📝 **Basic highlighting**: Đang dùng fallback mode
- ⚠️ **AI Error**: Có lỗi AI, đã chuyển fallback
- ✅ **Analysis Complete**: AI hoàn thành phân tích

---

## 📚 **Sử dụng Quiz**

### **Bắt đầu thi**
1. Click **"Bắt đầu thi"** trên trang chủ
2. Làm **40 câu hỏi** trong **70 phút**
3. Click đáp án → Xem giải thích chi tiết
4. **ESC** hoặc nút **"Thoát"** để kết thúc

### **Tính năng đặc biệt**
- 🤖 **AI highlighting**: Code và thuật ngữ được highlight thông minh
- 📐 **Math formulas**: Hiển thị công thức LaTeX đẹp
- 🇻🇳 **Vietnamese safe**: Không highlight nhầm từ tiếng Việt
- 📱 **Mobile friendly**: Responsive trên mọi thiết bị

---

## 📚 **Sử dụng Flashcards**

### **Học với thẻ**
1. **Click thẻ** để lật xem định nghĩa
2. **Navigation buttons**: Trước/Sau để di chuyển
3. **60 thẻ chuyên sâu** theo chủ đề
4. **AI analysis**: Thuật ngữ và định nghĩa được highlight thông minh

### **Chủ đề học**
- 🏗️ **8051 Architecture**
- 🔧 **Assembly Instructions**
- 💾 **Memory Organization**
- ⏰ **Timers and Counters**
- 🔔 **Interrupts**
- 💻 **Programming Concepts**

---

## 🧪 **Testing & Validation**

### **Test pages có sẵn**
- 🎯 **test_complete_system.html**: Test toàn bộ hệ thống
- 🤖 **test_gemini_ai.html**: Test riêng Gemini AI
- 🎨 **test_improved_highlighting.html**: Test highlighting
- 🇻🇳 **test_false_positive.html**: Test Vietnamese safety

### **Chạy tests**
```bash
# Test tất cả
build.bat test

# Test AI riêng
build.bat ai

# Validate data
build.bat validate
```

---

## 🎨 **Bright Theme Features**

### **Thiết kế hiện đại**
- 🌈 **Gradient backgrounds**: Đẹp mắt và professional
- 💫 **Hover effects**: Animation mượt mà
- 📱 **Responsive**: Hoạt động tốt trên mobile
- 🎯 **Accessibility**: Màu sắc dễ nhìn, contrast tốt

### **Code highlighting**
- 💛 **Assembly code**: Nền vàng, chữ nâu đậm
- 💚 **Technical terms**: Nền xanh lá, chữ xanh đậm  
- ❤️ **Numbers**: Nền đỏ nhạt, chữ đỏ đậm
- 💜 **Formula vars**: Nền tím nhạt, chữ tím đậm

---

## 🔧 **Troubleshooting**

### **Nếu AI không hoạt động**
✅ **Tự động fallback**: Hệ thống sẽ chuyển về highlighting cũ  
✅ **Vẫn functional**: Tất cả tính năng khác vẫn hoạt động  
✅ **Status indicator**: Hiển thị trạng thái để user biết  

### **Nếu có lỗi**
1. **Refresh trang**: F5 để tải lại
2. **Check console**: F12 để xem log errors
3. **Test connectivity**: Kiểm tra kết nối internet
4. **Fallback mode**: AI lỗi thì vẫn có highlighting cơ bản

### **Performance tips**
- 🔄 **Cache working**: Lần 2 truy cập sẽ nhanh hơn
- 📱 **Mobile**: Có thể chậm hơn desktop một chút
- 🌐 **Network**: AI cần internet, fallback không cần

---

## 📞 **Support & Documentation**

### **Tài liệu chi tiết**
- 📖 **README.md**: Hướng dẫn đầy đủ
- 🔧 **BRIGHT_THEME_DOCUMENTATION.md**: Chi tiết kỹ thuật
- 📊 **PROJECT_SUMMARY.md**: Tổng quan tính năng
- 🎯 **COMPLETION_SUMMARY.md**: Báo cáo hoàn thành

### **Configuration**
- ⚙️ **config.json**: Cấu hình hệ thống
- 🔧 **build.bat**: Script automation
- 🧪 **Test files**: Kiểm tra tính năng

---

## 🎉 **Kết luận**

**CE103 Quiz với Gemini AI là hệ thống học tập hiện đại, kết hợp AI thông minh với thiết kế đẹp mắt, mang lại trải nghiệm học tập tuyệt vời cho sinh viên.**

### **Highlights**
- 🤖 **AI-powered**: Phân tích thông minh với Gemini 2.5 Flash
- 🎨 **Beautiful design**: Bright theme professional
- 📚 **Rich content**: 230 câu hỏi + 60 flashcards
- ⚡ **Fast performance**: Tối ưu với caching
- 🇻🇳 **Vietnamese ready**: Hoàn hảo cho tiếng Việt

**Ready to use! Chúc bạn học tốt! 🚀📚**
