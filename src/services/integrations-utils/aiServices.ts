// AI Servicing File 
// integrate openai for tools n evaluation
import OpenAI from "openai";
import type {ChatCompletionMessageParam } from "openai/resources/chat";
import type { evaluatedResult, userAnswerInput } from "../db";

const openai = new OpenAI ({
    apiKey: process.env.OPENAI_API_KEY
})

async function callChatCompletion(messages:ChatCompletionMessageParam[], maxTokens = 300): Promise<string> {
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        max_tokens: maxTokens,
        temperature: 0.5
    })
    return response.choices[0].message.content?.trim() ?? ""
}

export async function generateSummary(text: string): Promise<string>{
    const messages: ChatCompletionMessageParam[] = [
        {
            role: 'system',
            content: "You are a helpful assistant that summarizes academic text like notes and lecture transcripts concisely. You start off each summary with a highlights/key takeaways section, and then a proper detailed summary of the topics."
        },
        {
            role: 'user',
            content: `Summarize the following:\n\n${text}`
        }
    ]
    const result = await callChatCompletion(messages, 500)
    try {
        return result
    }catch{
        return ""
    }
}

export async function generateFlashcards(text: string): Promise<{term: string; definition: string}[]> {
    const messages: ChatCompletionMessageParam[] = [
        {
            role: 'system',
            content: `You are a flashcard generator. You must return ONLY a valid JSON array of objects with "term" and "definition" properties. 

example format:
[
    {"term": "Key Concept", "definition": "Clear explanation of the concept"},
    {"term": "Important Term", "definition": "Definition with context"}
]`
        },
        {
            role: 'user',
            content: `Create flashcards from the following content:\n\n${text}`
        }
    ]
    
    try {
        const result = await callChatCompletion(messages, 1000)
        let cleanedResult = result.trim()
        
        if (cleanedResult.startsWith('```json')) {
            cleanedResult = cleanedResult.replace(/```json\n?/, '').replace(/\n?```$/, '')
        } else if (cleanedResult.startsWith('```')) {
            cleanedResult = cleanedResult.replace(/```\n?/, '').replace(/\n?```$/, '')
        }
        
        const jsonStart = cleanedResult.indexOf('[')
        const jsonEnd = cleanedResult.lastIndexOf(']')
        
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
            cleanedResult = cleanedResult.substring(jsonStart, jsonEnd + 1)
        }
        
        const parsed = JSON.parse(cleanedResult)
        
        if (!Array.isArray(parsed)) {
            return []
        }
        
        const validFlashcards = parsed.filter(card => {
            return card && 
                   typeof card === 'object' && 
                   typeof card.term === 'string' && 
                   typeof card.definition === 'string' &&
                   card.term.trim() !== '' &&
                   card.definition.trim() !== ''
        })
        
        return validFlashcards
        
    } catch (error) {
        return []
    }
}

export async function generateQuiz(
  text: string,
  quizType: "multiple-choice" | "true-false" | "short-answer" | "mixed",
  length?: number
): Promise<
  {
    type: "multiple-choice" | "true-false" | "short-answer";
    question: string;
    options?: string[];
    correctAnswer: string;
  }[]
> {
  let instruction = "";

  switch (quizType) {
    case "multiple-choice":
      instruction = length ? `Generate exactly ${length} multiple-choice questions`
        : "Generate 5-8 multiple-choice questions based on the content.";
      break;
    case "true-false":
      instruction = length ? `Generate exactly ${length} true-false questions`
        :"Generate 5-8 true/false questions based on the content.";
      break;
    case "short-answer":
      instruction = length ? `Generate exactly ${length} short-answer questions`
        :"Generate 3-5 short-answer questions based on the content.";
      break;
    case "mixed":
        if (length) {
            const perType = Math.floor(length / 3)
            instruction = `Generate a mixed quiz with:
        - ${perType} multiple-choice
        - ${perType} true/false
        - ${length - 2 * perType} short-answer questions based on the content.`;
        } else {
      instruction =
        "Generate a mixed quiz with 3 multiple-choice, 3 true/false, and 2 short-answer questions.";
        }
        break;
  }

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `You generate academic quiz questions. You must respond with ONLY a valid JSON array, no other text.

Each question object must have:
- "type": "multiple-choice" OR "true-false" OR "short-answer"
- "question": the question text
- "correctAnswer": the correct answer
- "options": array of 4 choices (only for multiple-choice)

Example format:
[
  {
    "type": "multiple-choice",
    "question": "What is the capital of France?",
    "options": ["London", "Berlin", "Paris", "Madrid"],
    "correctAnswer": "Paris"
  },
  {
    "type": "true-false",
    "question": "The Earth is flat.",
    "correctAnswer": "false"
  }
]

Return ONLY the JSON array, no other text.`
    },
    {
      role: "user",
      content: `${instruction}\n\nGenerate quiz questions based on the following content:\n\n${text}`,
    },
  ];

  console.log('Sending to OpenAI:', {
    instruction,
    contentLength: text.length,
    contentPreview: text.substring(0, 100) + '...'
  });

  const result = await callChatCompletion(messages, 2000); // Increased token limit
  
  console.log('OpenAI raw response:', result);
  console.log('Response length:', result.length);
  
  try {
    const parsed = JSON.parse(result);
    console.log('Parsed successfully:', parsed);
    return parsed;
  } catch (error) {
    console.error('JSON parse error:', error);
    console.error('Raw response that failed to parse:', result);
    
    // Try to extract JSON from the response if it's wrapped in other text
    const jsonMatch = result.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        console.log('Trying to parse extracted JSON:', jsonMatch[0]);
        const extracted = JSON.parse(jsonMatch[0]);
        console.log('Extracted JSON parsed successfully:', extracted);
        return extracted;
      } catch (extractError) {
        console.error('Failed to parse extracted JSON:', extractError);
      }
    }
    
    return [];
  }
}

export async function evaluateAnswer(
    question: {
        questionId: string,
        question: string,
        type: "multiple-choice" | "true-false" | "short-answer";
        options?: string[]
    },
    userInput: userAnswerInput
): Promise<evaluatedResult> {
    const { questionId, question: questionText, type, options} = question
    const userAnswer = userInput.answer

    const messages: ChatCompletionMessageParam[] = [
        {
        role: 'system',
          content: `
You are an academic evaluator. You must decide if a student's answer to a quiz question is correct.

Always reply in one of these two formats (no exceptions):

1. If correct:
Correct

2. If incorrect:
Incorrect. [A short explanation of why, followed by the correct answer]

Do NOT include anything else outside of this format.
  `.trim()
        },
        {role: 'user',
        content: `Question: ${questionText}
        Type: ${type} 
        Options: ${options?.join(",") ?? "N/A"}
        User's Answer: ${userAnswer}`
        },
    ]

  const result = await callChatCompletion(messages, 300);
  const trimmed = result.trim();

  const isCorrect = /^Correct\b/i.test(trimmed);
  const explanation = isCorrect
    ? undefined
    : trimmed.replace(/^Incorrect[:,.\s]*/i, "").trim();

    return {
        questionId,
        isCorrect,
        explanation,
        correctAnswer: ""
    }
    }
    


