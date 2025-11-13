
import React, { useState, useCallback, useEffect } from 'react';
import { AppState, QuizSettings, GeneratedQuiz, Question, UserAnswers } from './types';
import { generateQuiz, ocrImage } from './services/geminiService';

import Header from './components/Header';
import ContentInput from './components/ContentInput';
import SettingsPanel from './components/SettingsPanel';
import Loader from './components/Loader';
import QuizDisplay from './components/QuizDisplay';
import ActionsPanel from './components/ActionsPanel';
import EditModal from './components/EditModal';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('input');
  const [content, setContent] = useState<string>('');
  const [image, setImage] = useState<{ file: File; preview: string } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const [settings, setSettings] = useState<QuizSettings>({
    comprehension: { enabled: true, count: 5, difficulty: '國一' },
    literacyMC: { enabled: false, count: 3, difficulty: '國一' },
    shortAnswer: { enabled: true, count: 3, difficulty: '國一' },
  });

  const [generatedQuiz, setGeneratedQuiz] = useState<GeneratedQuiz | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [editingQuestion, setEditingQuestion] = useState<{ index: number; data: Question } | null>(null);

  const isGenerateDisabled = content.trim() === '';

  const handleOcr = async () => {
    if (!image) return;
    setIsLoading(true);
    setLoadingMessage('正在辨識圖片文字...');
    setError(null);
    try {
      const ocrText = await ocrImage(image.file);
      setContent(prev => prev ? `${prev}\n\n${ocrText}` : ocrText);
      setImage(null);
    } catch (err) {
      setError('圖片辨識失敗，請稍後再試。');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = useCallback(async () => {
    if (isGenerateDisabled) return;

    setAppState('generating');
    setIsLoading(true);
    setLoadingMessage('AI 正在為您出題...');
    setError(null);
    setGeneratedQuiz(null);
    setUserAnswers({});

    try {
      const result = await generateQuiz(content, settings);
      if (result) {
        setGeneratedQuiz(result);
        setAppState('quiz');
      } else {
        throw new Error('API未能回傳有效的題目結構。');
      }
    } catch (err) {
      const error = err as Error;
      console.error('Quiz generation failed:', error);
      setError(`題目生成失敗：${error.message}`);
      setAppState('input');
    } finally {
      setIsLoading(false);
    }
  }, [content, settings, isGenerateDisabled]);

  const handleSubmitQuiz = () => {
    setAppState('results');
  };

  const handleReset = () => {
    setAppState('input');
    setGeneratedQuiz(null);
    setUserAnswers({});
  };

  const handleClearAll = () => {
    setContent('');
    setImage(null);
    setSettings({
      comprehension: { enabled: true, count: 5, difficulty: '國一' },
      literacyMC: { enabled: false, count: 3, difficulty: '國一' },
      shortAnswer: { enabled: true, count: 3, difficulty: '國一' },
    });
    handleReset();
  };

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setUserAnswers(prev => ({ ...prev, [questionIndex]: answer }));
  };
  
  const handleEditRequest = (questionIndex: number) => {
    if (!generatedQuiz) return;
    
    let questionData: Question | undefined;
    const { comprehensionQuestions, literacyMCQuestions, shortAnswerQuestions } = generatedQuiz;

    if (questionIndex < comprehensionQuestions.length) {
        questionData = comprehensionQuestions[questionIndex];
    } else if (questionIndex < comprehensionQuestions.length + literacyMCQuestions.length) {
        questionData = literacyMCQuestions[questionIndex - comprehensionQuestions.length];
    } else {
        questionData = shortAnswerQuestions[questionIndex - comprehensionQuestions.length - literacyMCQuestions.length];
    }

    if (questionData) {
        setEditingQuestion({ index: questionIndex, data: questionData });
    }
  };

  const handleSaveEdit = (updatedQuestion: Question) => {
    if (editingQuestion === null || !generatedQuiz) return;
    
    const newQuiz = JSON.parse(JSON.stringify(generatedQuiz));
    const { index } = editingQuestion;
    
    const { comprehensionQuestions, literacyMCQuestions } = newQuiz;

    if (index < comprehensionQuestions.length) newQuiz.comprehensionQuestions[index] = updatedQuestion;
    else if (index < comprehensionQuestions.length + literacyMCQuestions.length) newQuiz.literacyMCQuestions[index - comprehensionQuestions.length] = updatedQuestion;
    else newQuiz.shortAnswerQuestions[index - comprehensionQuestions.length - literacyMCQuestions.length] = updatedQuestion;

    setGeneratedQuiz(newQuiz);
    setEditingQuestion(null);
  };

  return (
    <div className="min-h-screen bg-amber-50 text-stone-800">
      <Header />
      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" role="alert">
              <p className="font-bold">發生錯誤</p>
              <p>{error}</p>
            </div>
          )}
          
          {isLoading && <Loader message={loadingMessage} />}

          {!isLoading && (
            <>
              {appState === 'input' && (
                <>
                  <ContentInput
                    content={content}
                    setContent={setContent}
                    image={image}
                    setImage={setImage}
                    onOcr={handleOcr}
                  />
                  <SettingsPanel settings={settings} setSettings={setSettings} />
                  <div className="flex flex-col sm:flex-row items-stretch justify-center gap-4 mt-8">
                    <button
                      onClick={handleGenerate}
                      disabled={isGenerateDisabled}
                      className="btn btn-primary text-lg"
                    >
                      開始出題
                    </button>
                    <button onClick={handleClearAll} className="btn btn-secondary">
                      一鍵清空
                    </button>
                  </div>
                </>
              )}

              {(appState === 'quiz' || appState === 'results') && generatedQuiz && (
                <>
                  <QuizDisplay
                    quiz={generatedQuiz}
                    userAnswers={userAnswers}
                    onAnswerChange={handleAnswerChange}
                    onEditRequest={handleEditRequest}
                    isSubmitted={appState === 'results'}
                  />
                  <ActionsPanel
                    appState={appState}
                    onSubmit={handleSubmitQuiz}
                    onReset={handleReset}
                    onClearAll={handleClearAll}
                    quiz={generatedQuiz}
                    userAnswers={userAnswers}
                  />
                </>
              )}
            </>
          )}
        </div>
        <EditModal 
          question={editingQuestion?.data ?? null}
          onSave={handleSaveEdit}
          onClose={() => setEditingQuestion(null)}
        />
      </main>
      <footer className="text-center py-4 text-xs text-gray-500">
        © 2024 AI Quiz Generator
      </footer>
    </div>
  );
};

// Helper components for styling
const Button: React.FC<{ onClick: () => void; disabled?: boolean; className?: string; children: React.ReactNode }> = ({ onClick, disabled, className, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`transition-all duration-300 ease-in-out rounded-lg px-6 py-3 font-bold cursor-pointer shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
  >
    {children}
  </button>
);

(Button as any).defaultProps = {
  disabled: false,
  className: '',
};

const PrimaryButton: React.FC<{ onClick: () => void; disabled?: boolean; children: React.ReactNode }> = (props) => (
  <Button {...props} className="bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-500 disabled:bg-gray-300" />
);

const SecondaryButton: React.FC<{ onClick: () => void; disabled?: boolean; children: React.ReactNode }> = (props) => (
  <Button {...props} className="bg-amber-100 text-amber-800 hover:bg-amber-200 focus:ring-amber-500 disabled:bg-gray-200" />
);

export default App;
