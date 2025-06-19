import json
import sys
from collections import defaultdict

def check_duplicates():
    print("Starting duplicate check...")
    
    try:
        with open('api/questions.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print("File not found: api/questions.json")
        return
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")
        return
    except Exception as e:
        print(f"Error reading file: {e}")
        return

    # Check for duplicate IDs
    ids = []
    duplicate_ids = []
    
    # Check for duplicate questions
    questions = defaultdict(list)
    
    # Check for duplicate answers
    question_answers = defaultdict(list)
    
    for i, item in enumerate(data):
        if 'id' in item:
            if item['id'] in ids:
                duplicate_ids.append((item['id'], i+1))
            ids.append(item['id'])
        
        if 'question' in item:
            questions[item['question']].append((item.get('id', 'Unknown'), i+1))
        
        if 'question' in item and 'answer' in item:
            key = f"{item['question']}|||{item['answer']}"
            question_answers[key].append((item.get('id', 'Unknown'), i+1))
    
    print("=== KIỂM TRA FILE QUESTIONS.JSON ===")
    print(f"Tổng số câu hỏi: {len(data)}")
    print()
    
    # Report duplicate IDs
    if duplicate_ids:
        print("❌ PHÁT HIỆN ID TRÙNG LẶP:")
        for id_val, line_num in duplicate_ids:
            print(f"  - ID {id_val} tại dòng {line_num}")
        print()
    else:
        print("✅ Không có ID trùng lặp")
        print()
    
    # Report duplicate questions
    duplicate_questions = {q: ids for q, ids in questions.items() if len(ids) > 1}
    if duplicate_questions:
        print("❌ PHÁT HIỆN CÂU HỎI TRÙNG LẶP:")
        for question, ids in duplicate_questions.items():
            print(f"  Câu hỏi: '{question[:80]}...'")
            for id_val, line_num in ids:
                print(f"    - ID {id_val} tại dòng {line_num}")
            print()
    else:
        print("✅ Không có câu hỏi trùng lặp")
        print()
    
    # Report duplicate question-answer pairs
    duplicate_qa = {qa: ids for qa, ids in question_answers.items() if len(ids) > 1}
    if duplicate_qa:
        print("❌ PHÁT HIỆN CẶP CÂU HỎI-ĐÁP ÁN TRÙNG LẶP:")
        for qa, ids in duplicate_qa.items():
            question, answer = qa.split('|||')
            print(f"  Câu hỏi: '{question[:60]}...' - Đáp án: {answer}")
            for id_val, line_num in ids:
                print(f"    - ID {id_val} tại dòng {line_num}")
            print()
    else:
        print("✅ Không có cặp câu hỏi-đáp án trùng lặp")
        print()
    
    # Check for missing fields
    missing_fields = []
    for i, item in enumerate(data):
        required_fields = ['id', 'topic', 'question', 'options', 'answer', 'explanation']
        missing = [field for field in required_fields if field not in item]
        if missing:
            missing_fields.append((item.get('id', f'Unknown at line {i+1}'), missing))
    
    if missing_fields:
        print("❌ PHÁT HIỆN THIẾU TRƯỜNG DỮ LIỆU:")
        for id_val, missing in missing_fields:
            print(f"  - ID {id_val}: thiếu {', '.join(missing)}")
        print()
    else:
        print("✅ Tất cả câu hỏi đều có đầy đủ trường dữ liệu")
        print()
    
    # Statistics by topic
    topics = defaultdict(int)
    for item in data:
        if 'topic' in item:
            topics[item['topic']] += 1
    
    print("📊 THỐNG KÊ THEO CHỦ ĐỀ:")
    for topic, count in sorted(topics.items()):
        print(f"  - {topic}: {count} câu")

if __name__ == "__main__":
    check_duplicates()
