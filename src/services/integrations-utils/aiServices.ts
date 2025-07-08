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
            content: "You generate concise flashcards. Return a JSON array of {term, definition} pairs, based on the notes and lecture transcripts inputted."
        },
        {
            role: 'user',
            content: `Create 12 flashcards from the following content:\n\n${text}`
        }
    ]
    const result = await callChatCompletion(messages, 500)
    try {
        return JSON.parse(result)
    } catch {
        return [] as {term: string; definition:string}[]
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
        : "Generate an appropriate  number of multiple-choice questions based on the length of the content. Minimum of 5, maximum of 20.";
      break;
    case "true-false":
      instruction = length ? `Generate exactly ${length} true-false questions`
        :"Generate an appropriate  number of true/false questions based on the length of the content. Minimum of 5, maximum of 20.";
      break;
    case "short-answer":
      instruction = length ? `Generate exactly ${length} short-answer questions`
        :"Generate an appropriate  number of short-answer questions based on the length of the content. Minimum of 3, maximum of 15.";
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
        "Generate a mixed quiz with a balanced number of multiple-choice, true/false, and short-answer questions. Choose question count based on the content length. Multiple-choice and true/false: 5–20 each. Short-answer: 3–15.";
        }
        break;
  }

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content:
        "You generate academic quiz questions with the following types: multiple-choice, true/false, short-answer. Output a JSON array where each question object includes: 'type', 'question', 'correctAnswer', and optionally 'options' for multiple-choice and true/false.",
    },
    {
      role: "user",
      content: `${instruction}\n\nGenerate quiz questions based on the following content:\n\n${text}`,
    },
  ];

  const result = await callChatCompletion(messages, 1000);
  try {
    return JSON.parse(result);
  } catch {
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
    


