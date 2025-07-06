// Flashcard Service File
import { db,  Flashcard, FlashcardDeck } from "../db";
import { generateId, updateCourseFromChild, updateTimestamp } from "../integrations-utils/utilityServicies";
import { getCourseColor } from "../integrations-utils/utilityServicies";
import { generateFlashcards } from "../integrations-utils/aiServices";

// impl crud, retyrb functions 

export const addDeck = async (deck: Omit<FlashcardDeck, 'id' | 'createdOn' | 'updatedOn' | 'color'>): Promise<FlashcardDeck>  => {

    const newDeck: FlashcardDeck = {
        ...deck,
        id: generateId(),
        createdOn: new Date(),
        color: await getCourseColor(deck.courseId),
        completed: false,
        updatedOn: new Date()
    }
    await db.flashcardDecks.add(newDeck)
    await updateCourseFromChild(deck.courseId, 'flashcard')
    return newDeck
    }

export const addCard = async (card: Omit<Flashcard, 'id' | 'createdOn'>): Promise<Flashcard> => {
    const newCard: Flashcard = {
        ...card,
        id: generateId(),
        createdOn: new Date()
    }
    await db.flashcards.add(newCard)
    const updatedCard = await db.flashcards.get(newCard.id)
    if (updatedCard?.deckId) {
        await updateTimestamp('flashcardDecks', updatedCard.deckId)

        const deck = await db.flashcardDecks.get(updatedCard.deckId)
        if (deck?.courseId) {
            await updateCourseFromChild(deck.courseId, 'flashcard')
        }
    }
    return newCard
}

export const generateAndSaveFlashcards = async (
    text:string, deckMeta: Omit<FlashcardDeck, 'id' | 'createdOn' | 'updatedOn' | 'color' | 'completed'>): Promise<FlashcardDeck> => {
        const deck = await addDeck(deckMeta)

        const flashcards = await generateFlashcards(text)

        for (const card of flashcards) {
            await addCard({
                deckId: deck.id, front: card.term, back: card.definition
            })
        }
        if (deck.courseId) {
            await updateCourseFromChild(deck.courseId, 'flashcard')
        }
        return deck
    }



// delete a deck and all its flashcards 
export const deleteDeck = async (deckId:string): Promise<void> => {
    const deck = await db.flashcardDecks.get(deckId)
    await db.flashcardDecks.delete(deckId)
    const cards = await db.flashcards.where('deckId').equals(deckId).toArray()
    for (const card of cards) {
        await db.flashcards.delete(card.id)
    }
    if (deck?.courseId) {
        await updateCourseFromChild(deck.courseId, 'flashcard')
    }
}

export const deleteCard = async (id: string): Promise<void> => {
    const cardToDelete = await db.flashcards.get(id)
    await db.flashcards.delete(id)
    if (cardToDelete?.deckId) {
        await updateTimestamp('flashcardDecks', cardToDelete.deckId)
        const deck = await db.flashcardDecks.get(cardToDelete.deckId)
        if (deck?.courseId) {
            await updateCourseFromChild(deck.courseId, 'flashcard')
        }
    }
}

export const updateDeck = async(id: string, updates: Partial<Omit<FlashcardDeck, 'id' | 'createdOn'>>): Promise<void> => {
    updates.updatedOn = new Date()
    await db.flashcardDecks.update(id, updates)
    await updateTimestamp('flashcardDecks', id)

    const deck = await db.flashcardDecks.get(id)
    if (deck?.courseId) {
        await updateCourseFromChild(deck.courseId, 'flashcard')
    }
}

export const updateCard = async(id:string, updates: Partial<Omit<Flashcard, 'id' | 'createdOn'>>): Promise<void> => {
    await db.flashcards.update(id, updates)
    const updatedCard = await db.flashcards.get(id)
    if (updatedCard?.deckId) {
        await updateTimestamp('flashcardDecks', updatedCard.deckId)
        const deck = await db.flashcardDecks.get(id)
        if (deck?.courseId) {
            await updateCourseFromChild(deck.courseId, 'flashcard')
    }
    }
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