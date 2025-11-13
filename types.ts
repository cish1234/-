
export type AppState = 'input' | 'generating' | 'quiz' | 'results';

export interface QuestionSetting {
  enabled: boolean;
  count: number;
  difficulty: string;
}

export interface QuizSettings {
  comprehension: QuestionSetting;
  literacyMC: QuestionSetting;
  shortAnswer: QuestionSetting;
}

export interface Question {
  question: string;
  options?: string[];
  answer: string;
  explanation?: string;
}

export interface GeneratedQuiz {
  title: string;
  comprehensionQuestions: Question[];
  literacyMCQuestions: Question[];
  shortAnswerQuestions: Question[];
}

export type UserAnswers = {
  [questionIndex: number]: string;
};
