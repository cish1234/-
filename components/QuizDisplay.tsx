import React from 'react';
import { GeneratedQuiz, Question, UserAnswers } from '../types';

interface QuizDisplayProps {
  quiz: GeneratedQuiz;
  userAnswers: UserAnswers;
  onAnswerChange: (questionIndex: number, answer: string) => void;
  isSubmitted: boolean;
  onEditRequest: (questionIndex: number) => void;
}

const getOptionChar = (index: number) => `(${String.fromCharCode(65 + index)})`;

const calculateScore = (quiz: GeneratedQuiz, userAnswers: UserAnswers) => {
    let correctCount = 0;
    let totalMcQuestions = 0;
    
    quiz.comprehensionQuestions.forEach((q, i) => {
        totalMcQuestions++;
        const questionIndex = i;
        if (userAnswers[questionIndex] === q.answer) {
            correctCount++;
        }
    });

    quiz.literacyMCQuestions.forEach((q, i) => {
        totalMcQuestions++;
        const questionIndex = quiz.comprehensionQuestions.length + i;
        if (userAnswers[questionIndex] === q.answer) {
            correctCount++;
        }
    });

    if (totalMcQuestions === 0) return null;
    return Math.round((correctCount / totalMcQuestions) * 100);
}

const QuestionBlock: React.FC<{
  question: Question;
  questionNumber: number;
  questionIndex: number;
  userAnswer: string;
  onAnswerChange: (answer: string) => void;
  onEditRequest: (questionIndex: number) => void;
  isSubmitted: boolean;
}> = ({ question, questionNumber, questionIndex, userAnswer, onAnswerChange, onEditRequest, isSubmitted }) => {
  const isMC = !!question.options;
  let blockClassName = "mb-6 p-4 border rounded-lg shadow-sm";
  let feedbackIcon = null;

  if (isSubmitted) {
    if (isMC) {
      if (userAnswer === question.answer) {
        blockClassName += " border-green-500 bg-green-50";
        feedbackIcon = <span className="text-green-600 font-bold mr-2">✔</span>;
      } else {
        blockClassName += " border-red-500 bg-red-50";
        feedbackIcon = <span className="text-red-600 font-bold mr-2">✘</span>;
      }
    } else {
      blockClassName += " border-orange-500 bg-orange-50";
      feedbackIcon = <span className="text-orange-600 font-bold mr-2">●</span>;
    }
  }

  return (
    <div className={blockClassName}>
      <div className="flex justify-between items-start">
        <p className="font-semibold text-stone-800 flex-grow">
          {feedbackIcon}{questionNumber}. {question.question}
        </p>
        {!isSubmitted && (
           <button onClick={() => onEditRequest(questionIndex)} className="ml-4 text-sm text-amber-700 hover:text-amber-900 font-semibold flex-shrink-0">
              編輯
           </button>
        )}
      </div>
      {isMC && question.options && (
        <div className="space-y-2 mt-3">
          {question.options.map((option, i) => {
            const isCorrect = option === question.answer;
            const isSelected = userAnswer === option;
            let labelClass = "flex items-start p-2 rounded-md transition-colors cursor-pointer";
            if (!isSubmitted) {
                labelClass += " hover:bg-amber-100";
            }
            if (isSubmitted) {
                if (isCorrect) {
                    labelClass += " bg-green-100 font-bold text-green-800";
                } else if(isSelected) {
                    labelClass += " bg-red-100 line-through";
                }
            }
            return (
              <label key={i} className={labelClass}>
                <input
                  type="radio"
                  className="shrink-0 mt-1 mr-3 h-5 w-5 text-amber-600 focus:ring-amber-500"
                  name={`q-${questionIndex}`}
                  value={option}
                  checked={isSelected}
                  onChange={(e) => onAnswerChange(e.target.value)}
                  disabled={isSubmitted}
                />
                <span>{getOptionChar(i)} {option}</span>
              </label>
            )
          })}
        </div>
      )}
      {!isMC && (
        <textarea
          className="mt-2 w-full p-2 border border-orange-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500"
          rows={3}
          placeholder="請在此輸入你的答案..."
          value={userAnswer || ''}
          onChange={(e) => onAnswerChange(e.target.value)}
          disabled={isSubmitted}
        />
      )}
      {isSubmitted && question.explanation && (
        <div className="mt-3 p-3 bg-gray-100 rounded-md text-sm text-gray-700">
          <p><strong className="font-bold">解析：</strong>{question.explanation}</p>
        </div>
      )}
       {isSubmitted && !isMC && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
          <p><strong className="font-bold">參考答案：</strong>{question.answer}</p>
        </div>
      )}
    </div>
  );
};


const QuizDisplay: React.FC<QuizDisplayProps> = ({ quiz, userAnswers, onAnswerChange, isSubmitted, onEditRequest }) => {
    let questionCounter = 0;
    const score = isSubmitted ? calculateScore(quiz, userAnswers) : null;

    const renderQuestions = (questions: Question[], sectionTitle: string, startIndex: number) => {
        if (!questions || questions.length === 0) return null;
        return (
            <div className="mt-8">
                <h3 className="text-xl font-bold text-stone-700 mt-6 mb-4">{sectionTitle}</h3>
                {questions.map((q, i) => {
                    questionCounter++;
                    const questionIndex = startIndex + i;
                    return (
                        <QuestionBlock
                            key={questionIndex}
                            question={q}
                            questionNumber={questionCounter}
                            questionIndex={questionIndex}
                            userAnswer={userAnswers[questionIndex]}
                            onAnswerChange={(answer) => onAnswerChange(questionIndex, answer)}
                            onEditRequest={onEditRequest}
                            isSubmitted={isSubmitted}
                        />
                    )
                })}
            </div>
        )
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-stone-700 mb-2 border-b-2 border-orange-200 pb-2">{quiz.title}</h2>
            {isSubmitted && score !== null && (
                 <div className="text-lg font-bold p-4 bg-amber-100 border border-amber-300 rounded-lg text-center my-6">
                    測驗完成！你的得分（僅計算選擇題）： {score} / 100
                </div>
            )}
            {renderQuestions(quiz.comprehensionQuestions, '一、選擇題', 0)}
            {renderQuestions(quiz.literacyMCQuestions, '二、素養選擇題', quiz.comprehensionQuestions.length)}
            {renderQuestions(quiz.shortAnswerQuestions, '三、素養問答題', quiz.comprehensionQuestions.length + quiz.literacyMCQuestions.length)}
        </div>
    );
};

export default QuizDisplay;