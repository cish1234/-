
import { GoogleGenAI, Type } from '@google/genai';
import { QuizSettings, GeneratedQuiz, Question } from '../types';

// Fix: Initialize GoogleGenAI with API_KEY from environment variables as per guidelines, removing the warning and fallback key.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
};

export const ocrImage = async (file: File): Promise<string> => {
    const imagePart = await fileToGenerativePart(file);
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            {
                parts: [
                    { text: "請辨識並回傳圖片中的所有文字，並盡可能保留原始換行格式。" },
                    imagePart,
                ]
            }
        ],
    });
    return response.text;
};

const buildPrompt = (content: string, settings: QuizSettings): string => {
    const { comprehension, literacyMC, shortAnswer } = settings;
    let prompt = `你是一位經驗豐富的教育專家，專為繁體中文使用者設計測驗。請根據以下課文內容，生成一份結構化的測驗卷。

課文內容：
"""
${content}
"""

請根據以下要求生成 JSON 格式的試題：
`;

    if (comprehension.enabled && comprehension.count > 0) {
        prompt += `
- "comprehensionQuestions": 生成 ${comprehension.count} 題「選擇題」。
  - 難度需適合「${comprehension.difficulty}」程度的學生。
  - 題目和選項用字遣詞需符合該年級程度。
  - 每題包含 'question', 'options' (四個選項的陣列), 'answer' (正確選項文字), 和 'explanation'。
`;
    }

    if (literacyMC.enabled && literacyMC.count > 0) {
        prompt += `
- "literacyMCQuestions": 生成 ${literacyMC.count} 題「素養選擇題」。
  - 難度需適合「${literacyMC.difficulty}」程度的學生。
  - 題目應超越文意理解，考察批判性思考、整合資訊或應用能力。
  - 每題包含 'question', 'options' (四個選項的陣列), 'answer' (正確選項文字), 和 'explanation'。
`;
    }

    if (shortAnswer.enabled && shortAnswer.count > 0) {
        prompt += `
- "shortAnswerQuestions": 生成 ${shortAnswer.count} 題「素養問答題」。
  - 難度需適合「${shortAnswer.difficulty}」程度的學生。
  - 題目應引導學生進行深層思考、提出個人見解或連結生活經驗。
  - 每題包含 'question' 和 'answer' (參考答案)。
`;
    }

    prompt += `
- "title": 為這份試卷生成一個簡潔的標題，長度約10個字。
`;

    return prompt;
};

const questionSchema = {
    type: Type.OBJECT,
    properties: {
        question: { type: Type.STRING },
        options: { type: Type.ARRAY, items: { type: Type.STRING } },
        answer: { type: Type.STRING },
        explanation: { type: Type.STRING },
    },
    required: ["question", "options", "answer", "explanation"],
};

const shortAnswerQuestionSchema = {
    type: Type.OBJECT,
    properties: {
        question: { type: Type.STRING },
        answer: { type: Type.STRING },
    },
    required: ["question", "answer"],
};

// Fix: Removed `nullable: true` from schema properties as it is not a supported property.
const quizSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        comprehensionQuestions: { type: Type.ARRAY, items: questionSchema },
        literacyMCQuestions: { type: Type.ARRAY, items: questionSchema },
        shortAnswerQuestions: { type: Type.ARRAY, items: shortAnswerQuestionSchema },
    },
    required: ["title"],
};

export const generateQuiz = async (content: string, settings: QuizSettings): Promise<GeneratedQuiz | null> => {
    const prompt = buildPrompt(content, settings);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: quizSchema,
        },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
        console.error("API returned empty text response");
        return null;
    }
    
    try {
        const parsedJson = JSON.parse(jsonText);
        // Ensure arrays exist even if null from API
        return {
            title: parsedJson.title || 'AI 生成練習卷',
            comprehensionQuestions: parsedJson.comprehensionQuestions || [],
            literacyMCQuestions: parsedJson.literacyMCQuestions || [],
            shortAnswerQuestions: parsedJson.shortAnswerQuestions || [],
        };
    } catch (e) {
        console.error("Failed to parse JSON response:", e);
        console.error("Invalid JSON received:", jsonText);
        throw new Error("API回傳的資料格式有誤，無法解析。");
    }
};
