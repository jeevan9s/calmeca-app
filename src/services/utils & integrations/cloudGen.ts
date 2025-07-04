// Contains servicing to function to generate based on cloud import 
import { importDriveFile } from "./googleService";
import {generateQuiz, generateSummary, generateFlashcards} from "./aiServices"
import { generationOptions, generationType } from "../db";

// GOOGLE CLOUD
export async function generateFromDrive(type: generationType, content:string, options?: generationOptions): Promise<any> {
    switch(type) {
        case 'summary':
            const summary = await generateSummary(content)  
            console.log('summary generated')
            return summary
        case 'flashcards':
            const flashcards = await generateFlashcards(content)
            console.log('flashcards generated')
            return flashcards
        case 'quiz':
            const quiz = await generateQuiz(content, options?.quizType || 'mixed', options?.length)
            console.log('quiz generated')
            return quiz
        default: 
            throw new Error('Unsupported generation type')
    }
    
}