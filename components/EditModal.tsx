
import React, { useState, useEffect } from 'react';
import { Question } from '../types';

interface EditModalProps {
  question: Question | null;
  onSave: (updatedQuestion: Question) => void;
  onClose: () => void;
}

const EditModal: React.FC<EditModalProps> = ({ question, onSave, onClose }) => {
  const [editedQuestion, setEditedQuestion] = useState<Question | null>(null);

  useEffect(() => {
    // Deep copy to avoid mutating original state
    if (question) {
      setEditedQuestion(JSON.parse(JSON.stringify(question)));
    } else {
      setEditedQuestion(null);
    }
  }, [question]);

  if (!editedQuestion) {
    return null;
  }

  const handleQuestionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedQuestion(prev => prev ? { ...prev, question: e.target.value } : null);
  };

  const handleOptionChange = (index: number, value: string) => {
    setEditedQuestion(prev => {
      if (!prev || !prev.options) return prev;
      const newOptions = [...prev.options];
      newOptions[index] = value;
      // Also update the answer if the original correct answer was just edited
      if (prev.answer === prev.options[index]) {
          return { ...prev, options: newOptions, answer: value };
      }
      return { ...prev, options: newOptions };
    });
  };
  
  const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setEditedQuestion(prev => prev ? { ...prev, answer: e.target.value } : null);
  };


  const handleSave = () => {
    if (editedQuestion) {
      // Basic validation for MCQs: ensure the answer is one of the options
      if (editedQuestion.options && !editedQuestion.options.includes(editedQuestion.answer)) {
        alert('錯誤：正確答案必須是四個選項其中之一。請從上方選項複製貼上正確答案。');
        return;
      }
      onSave(editedQuestion);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-11/12 max-w-2xl max-h-full overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">編輯題目</h3>
        <div className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">題目內容</label>
            <textarea
              value={editedQuestion.question}
              onChange={handleQuestionChange}
              rows={3}
              className="w-full p-2 border rounded border-gray-300 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          {editedQuestion.options ? (
            <>
              <div>
                <label className="block font-semibold mb-1">選項</label>
                {editedQuestion.options.map((option, index) => (
                  <input
                    key={index}
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="w-full p-2 border rounded mb-2 border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                  />
                ))}
              </div>
              <div>
                <label className="block font-semibold mb-1">正確答案 (請完整複製貼上其中一個選項)</label>
                <input
                  type="text"
                  value={editedQuestion.answer}
                  onChange={handleAnswerChange}
                  className="w-full p-2 border rounded border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block font-semibold mb-1">參考答案</label>
              <textarea
                value={editedQuestion.answer}
                onChange={handleAnswerChange}
                rows={3}
                className="w-full p-2 border rounded border-gray-300 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          )}
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button onClick={onClose} className="btn btn-secondary">取消</button>
          <button onClick={handleSave} className="btn btn-primary">儲存</button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
