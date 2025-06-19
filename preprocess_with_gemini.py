#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gemini AI Preprocessor for CE103 Quiz
Pre-processes JSON files với Gemini AI và tạo enhanced data với highlighting instructions
"""

import json
import os
import time
import requests
from typing import Dict, List, Any
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class GeminiPreprocessor:
    def __init__(self):
        self.api_key = "AIzaSyA-95-BmJUOjgh1yRmxsSkz9MxDu-MTx8U"
        self.model = "gemini-2.5-flash-preview-05-20"
        self.api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent"
        self.cache = {}
        self.processed_count = 0
        
    def analyze_text_with_gemini(self, text: str) -> Dict[str, Any]:
        """
        Phân tích text với Gemini AI và trả về highlighting instructions
        """
        # Check cache first
        cache_key = hash(text)
        if cache_key in self.cache:
            logger.info(f"Cache hit for text: {text[:50]}...")
            return self.cache[cache_key]
        
        prompt = f"""
Analyze this Vietnamese text for computer engineering content. Return a JSON object with highlighting instructions:

Text: "{text}"

Return format:
{{
    "original_text": "original text",
    "highlighted_spans": [
        {{
            "text": "span text",
            "type": "assembly|technical|number|formula",
            "start": start_index,
            "end": end_index,
            "confidence": 0.0-1.0
        }}
    ],
    "has_math": true/false,
    "has_code": true/false,
    "language_mix": "vietnamese_technical|pure_vietnamese|pure_technical"
}}

Rules:
- Only highlight actual technical terms, assembly instructions, hex/binary numbers
- Do NOT highlight Vietnamese words that contain technical substrings
- Be very precise with start/end indices
- Assembly: MOV, JMP, ADD, SUB, etc.
- Technical: ROM, RAM, CPU, UART, etc.
- Numbers: 0xFF, 4000H, binary numbers
- Formula: mathematical variables and expressions
"""

        headers = {
            'Content-Type': 'application/json',
        }
        
        data = {
            'contents': [{
                'parts': [{'text': prompt}]
            }],
            'generationConfig': {
                'temperature': 0.1,
                'topK': 1,
                'topP': 0.8,
                'maxOutputTokens': 2048
            }
        }
        
        try:
            response = requests.post(
                f"{self.api_url}?key={self.api_key}",
                headers=headers,
                json=data,
                timeout=30
            )
            
            if response.status_code != 200:
                logger.error(f"API Error {response.status_code}: {response.text}")
                return self._create_fallback_analysis(text)
            
            result = response.json()
            
            if 'candidates' not in result or not result['candidates']:
                logger.error("No candidates in API response")
                return self._create_fallback_analysis(text)
            
            ai_response = result['candidates'][0]['content']['parts'][0]['text']
            
            # Parse JSON response from AI
            try:
                # Clean up AI response (remove markdown if present)
                if ai_response.startswith('```json'):
                    ai_response = ai_response.split('```json')[1].split('```')[0]
                elif ai_response.startswith('```'):
                    ai_response = ai_response.split('```')[1].split('```')[0]
                
                analysis = json.loads(ai_response.strip())
                
                # Cache the result
                self.cache[cache_key] = analysis
                self.processed_count += 1
                
                logger.info(f"✅ Successfully analyzed: {text[:50]}...")
                return analysis
                
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse AI JSON response: {e}")
                logger.error(f"Raw response: {ai_response}")
                return self._create_fallback_analysis(text)
                
        except requests.RequestException as e:
            logger.error(f"Request failed: {e}")
            return self._create_fallback_analysis(text)
        
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            return self._create_fallback_analysis(text)
    
    def _create_fallback_analysis(self, text: str) -> Dict[str, Any]:
        """
        Tạo fallback analysis khi AI fails
        """
        return {
            "original_text": text,
            "highlighted_spans": [],
            "has_math": False,
            "has_code": False,
            "language_mix": "pure_vietnamese",
            "fallback": True
        }
    
    def process_quiz_questions(self, input_file: str, output_file: str):
        """
        Process quiz questions file
        """
        logger.info(f"🚀 Processing quiz questions: {input_file}")
        
        with open(input_file, 'r', encoding='utf-8') as f:
            questions = json.load(f)
        
        enhanced_questions = []
        total = len(questions)
        
        for i, question in enumerate(questions):
            logger.info(f"📝 Processing question {i+1}/{total}")
            
            # Analyze question text
            question_analysis = self.analyze_text_with_gemini(question['question'])
            
            # Analyze options
            options_analysis = {}
            for key, option_text in question['options'].items():
                options_analysis[key] = self.analyze_text_with_gemini(option_text)
                time.sleep(0.1)  # Rate limiting
            
            # Analyze explanation
            explanation_analysis = self.analyze_text_with_gemini(question['explanation'])
            
            # Create enhanced question
            enhanced_question = {
                **question,  # Original data
                'ai_analysis': {
                    'question': question_analysis,
                    'options': options_analysis,
                    'explanation': explanation_analysis,
                    'processed_at': time.time(),
                    'model_used': self.model
                }
            }
            
            enhanced_questions.append(enhanced_question)
            
            # Rate limiting
            time.sleep(0.2)
        
        # Save enhanced data
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(enhanced_questions, f, ensure_ascii=False, indent=2)
        
        logger.info(f"✅ Quiz questions processed: {output_file}")
        logger.info(f"📊 Total processed: {self.processed_count} texts")
    
    def process_flashcards(self, input_file: str, output_file: str):
        """
        Process flashcards file
        """
        logger.info(f"🚀 Processing flashcards: {input_file}")
        
        with open(input_file, 'r', encoding='utf-8') as f:
            flashcards = json.load(f)
        
        enhanced_flashcards = []
        total = len(flashcards)
        
        for i, card in enumerate(flashcards):
            logger.info(f"📚 Processing flashcard {i+1}/{total}")
            
            # Analyze term
            term_analysis = self.analyze_text_with_gemini(card['term'])
            
            # Analyze definition
            definition_analysis = self.analyze_text_with_gemini(card['definition'])
            
            # Create enhanced flashcard
            enhanced_card = {
                **card,  # Original data
                'ai_analysis': {
                    'term': term_analysis,
                    'definition': definition_analysis,
                    'processed_at': time.time(),
                    'model_used': self.model
                }
            }
            
            enhanced_flashcards.append(enhanced_card)
            
            # Rate limiting
            time.sleep(0.2)
        
        # Save enhanced data
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(enhanced_flashcards, f, ensure_ascii=False, indent=2)
        
        logger.info(f"✅ Flashcards processed: {output_file}")
        logger.info(f"📊 Total processed: {self.processed_count} texts")

def main():
    """
    Main preprocessing function
    """
    print("🤖 CE103 Quiz - Gemini AI Preprocessor")
    print("=" * 50)
    
    preprocessor = GeminiPreprocessor()
    
    # Input files
    questions_input = "api/questions.json"
    flashcards_input = "api/flashcards.json"
    
    # Output files
    questions_output = "api/questions_enhanced.json"
    flashcards_output = "api/flashcards_enhanced.json"
    
    # Check if input files exist
    if not os.path.exists(questions_input):
        logger.error(f"❌ File not found: {questions_input}")
        return
    
    if not os.path.exists(flashcards_input):
        logger.error(f"❌ File not found: {flashcards_input}")
        return
    
    try:
        # Process quiz questions
        print("\n📝 Processing Quiz Questions...")
        preprocessor.process_quiz_questions(questions_input, questions_output)
        
        print("\n📚 Processing Flashcards...")
        preprocessor.process_flashcards(flashcards_input, flashcards_output)
        
        print(f"\n🎉 Preprocessing completed!")
        print(f"📊 Statistics:")
        print(f"   - Total texts processed: {preprocessor.processed_count}")
        print(f"   - Cache hits: {len(preprocessor.cache)}")
        print(f"   - Enhanced questions: {questions_output}")
        print(f"   - Enhanced flashcards: {flashcards_output}")
        
    except KeyboardInterrupt:
        print("\n⏹️ Processing interrupted by user")
    except Exception as e:
        logger.error(f"❌ Processing failed: {e}")

if __name__ == "__main__":
    main()
