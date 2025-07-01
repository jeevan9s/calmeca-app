// Flashcard Service File
import { db, Course, Flashcard, FlashcardDeck } from "../db";
import { v4 as uuid} from 'uuid'

// impl crud, retyrb functions 

export const addDeck = async (deck: Omit<FlashcardDeck, 'id' | 'createdOn' | 'updatedOn' | 'color'>): Promise<FlashcardDeck>  => {
    const course: Course | undefined = await db.courses.get(deck.courseId)
    if (!course) throw new Error('Course not found')

    const newDeck: FlashcardDeck = {
        ...deck,
        id: uuid(),
        createdOn: new Date(),
        color: course.color,
        completed: false,
        updatedOn: new Date()
    }
    await db.flashcardDecks.add(newDeck)
    return newDeck
    }

export const addCard = async (card: Omit<Flashcard, 'id' | 'createdOn'>): Promise<Flashcard> => {
    const newCard: Flashcard = {
        ...card,
        id: uuid(),
        createdOn: new Date()
    }
    await db.flashcards.add(newCard)
    return newCard
}

// delete a deck and all its flashcards 
export const deleteDeck = async (deckId:string): Promise<void> => {
    await db.flashcardDecks.delete(deckId)
    const cards = await db.flashcards.where('deckId').equals(deckId).toArray()
    for (const card of cards) {
        await db.flashcards.delete(card.id)
    }
}

export const deleteCard = async (id: string): Promise<void> => {
    await db.flashcards.delete(id)
}

export const updateDeck = async(id: string, updates: Partial<Omit<FlashcardDeck, 'id' | 'createdOn'>>): Promise<void> => {
    updates.updatedOn = new Date()
    await db.flashcardDecks.update(id, updates)
    // implement timestamp util here 
}

export const updateCard = async(id:string, updates: Partial<Omit<Flashcard, 'id' | 'createdOn'>>): Promise<void> => {
    await db.flashcards.update(id, updates)
}

export const getAllDecks = async(): Promise<FlashcardDeck[]> => {
    return db.flashcardDecks.toArray()
}

export const getDeckByCourse = async (courseId:string): Promise<FlashcardDeck[]> => {
    return db.flashcardDecks.where('courseId').equals(courseId).toArray()
}

export const getDecksById = async (id: string): Promise<FlashcardDeck | undefined> => {
    return db.flashcardDecks.get(id)
}

export const getCardsByDeck = async (deckId:string): Promise<Flashcard[]> => {
    return db.flashcards.where('deckId').equals(deckId).toArray()
}

export const getDeckByOrigin = async (origin: 'note' | 'pdf'): Promise<FlashcardDeck[]> => {
    return db.flashcardDecks.where('origin').equals(origin).toArray()
}