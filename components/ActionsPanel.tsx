
import React, { useState } from 'react';
import { AppState, GeneratedQuiz, UserAnswers } from '../types';

interface ActionsPanelProps {
  appState: AppState;
  onSubmit: () => void;
  onReset: () => void;
  onClearAll: () => void;
  quiz: GeneratedQuiz;
  userAnswers: UserAnswers;
}

const ActionsPanel: React.FC<ActionsPanelProps> = ({ appState, onSubmit, onReset, onClearAll, quiz, userAnswers }) => {
  const [copyButtonText, setCopyButtonText] = useState('複製所有內容');

  const handleCopy = () => {
    let contentToCopy = `【${quiz.title}】\n\n`;

    const formatQuestions = (title: string, questions: any[], startIndex: number) => {
      if (questions.length === 0) return '';
      let text = `${title}\n\n`;
      questions.forEach((q, i) => {
        const qNum = startIndex + i + 1;
        text += `${qNum}. ${q.question}\n`;
        if (q.options) {
          q.options.forEach((opt: string, optIndex: number) => {
            text += `(${String.fromCharCode(65 + optIndex)}) ${opt}\n`;
          });
        }
        text += '\n';
      });
      return text;
    };
    
    const formatAnswers = (title: string, questions: any[], startIndex: number) => {
        if (questions.length === 0) return '';
        let text = `【${title} 解答與解析】\n\n`;
        questions.forEach((q, i) => {
            const qNum = startIndex + i + 1;
            text += `${qNum}. ${q.answer}\n`;
            if (q.explanation) {
                text += `   解析：${q.explanation}\n`;
            }
            text += '\n';
        });
        return text;
    }

    contentToCopy += formatQuestions('一、選擇題', quiz.comprehensionQuestions, 0);
    contentToCopy += formatQuestions('二、素養選擇題', quiz.literacyMCQuestions, quiz.comprehensionQuestions.length);
    contentToCopy += formatQuestions('三、素養問答題', quiz.shortAnswerQuestions, quiz.comprehensionQuestions.length + quiz.literacyMCQuestions.length);
    
    contentToCopy += "\n---\n\n";

    contentToCopy += formatAnswers('選擇題', quiz.comprehensionQuestions, 0);
    contentToCopy += formatAnswers('素養選擇題', quiz.literacyMCQuestions, quiz.comprehensionQuestions.length);
    contentToCopy += formatAnswers('素養問答題', quiz.shortAnswerQuestions, quiz.comprehensionQuestions.length + quiz.literacyMCQuestions.length);


    navigator.clipboard.writeText(contentToCopy).then(() => {
      setCopyButtonText('已複製！');
      setTimeout(() => setCopyButtonText('複製所有內容'), 2000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
      alert('複製失敗');
    });
  };

  const handleDownloadDoc = () => {
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"></head>
      <body>
        <div style="margin: 0 auto; max-width: 800px;">
        <h1 style="text-align: center;">${quiz.title}</h1>
        <p style="text-align: right; font-size: 16px;">姓名：__________________</p>
    `;

    const appendQuestions = (title: string, questions: any[], startIndex: number) => {
      if (!questions || questions.length === 0) return '';
      let text = `<h2>${title}</h2>`;
      questions.forEach((q, i) => {
        const qNum = startIndex + i + 1;
        text += `<p><strong>${qNum}. ${q.question}</strong></p>`;
        if (q.options) {
          q.options.forEach((opt: string, optIndex: number) => {
            text += `<p style="margin-left: 20px;">(${String.fromCharCode(65 + optIndex)}) ${opt}</p>`;
          });
        }
        text += `<br/>`;
      });
      return text;
    };

    const appendAnswers = (title: string, questions: any[], startIndex: number) => {
      if (!questions || questions.length === 0) return '';
      let text = `<h2>${title} 解答與解析</h2>`;
      questions.forEach((q, i) => {
        const qNum = startIndex + i + 1;
        text += `<p><strong>${qNum}. ${q.answer}</strong></p>`;
        if (q.explanation) {
            text += `<p style="margin-left: 20px; color: #555;"><em>解析：${q.explanation}</em></p>`;
        }
      });
      return text;
    };

    htmlContent += appendQuestions('一、選擇題', quiz.comprehensionQuestions, 0);
    htmlContent += appendQuestions('二、素養選擇題', quiz.literacyMCQuestions, quiz.comprehensionQuestions.length);
    htmlContent += appendQuestions('三、素養問答題', quiz.shortAnswerQuestions, quiz.comprehensionQuestions.length + quiz.literacyMCQuestions.length);

    htmlContent += `<br clear="all" style="page-break-before:always" />`;

    htmlContent += appendAnswers('選擇題', quiz.comprehensionQuestions, 0);
    htmlContent += appendAnswers('素養選擇題', quiz.literacyMCQuestions, quiz.comprehensionQuestions.length);
    htmlContent += appendAnswers('素養問答題', quiz.shortAnswerQuestions, quiz.comprehensionQuestions.length + quiz.literacyMCQuestions.length);

    htmlContent += `</div></body></html>`;
    const converted = (window as any).htmlDocx.asBlob(htmlContent);
    (window as any).saveAs(converted, `${quiz.title}.docx`);
  };


  return (
    <div className="text-center mt-8 flex flex-col sm:flex-row sm:flex-wrap justify-center gap-4">
      {appState === 'quiz' && (
        <button onClick={onSubmit} className="btn btn-primary">
          批改答案
        </button>
      )}
      {appState === 'results' && (
        <>
          <button onClick={handleDownloadDoc} className="btn btn-secondary">
            下載 DOC 檔案
           </button>
          <button onClick={handleCopy} className="btn btn-secondary">
            {copyButtonText}
          </button>
          <button onClick={onReset} className="btn btn-secondary">
            重新測驗
          </button>
        </>
      )}
       <button onClick={onClearAll} className="btn btn-secondary">
        產生新試卷
      </button>
    </div>
  );
};

export default ActionsPanel;
