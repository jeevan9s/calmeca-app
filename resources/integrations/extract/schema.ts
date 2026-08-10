import * as z from "zod";


export const ExtractedCourseSchema = z.object({
    title: z.string().nullable(),
    code: z.string().nullable(),
    professor: z.string().nullable(),
    courseEmail: z.string().nullable(), // course-coordinator
    profEamil: z.string().nullable(),
    description: z.string().nullable(), // ultra-concise summary of description
    credits: z.number().nullable(),

    events: z.array(
        z.object({
            title: z.string(),
            type: z.enum([
                "lecture",
                "tutorial",
                "lab",
                "assignment",
                "quiz",
                "midterm",
                "other"
            ]),

            date: z.string().nullable(),
            startTime: z.string().nullable(),
            endTime: z.string().nullable(),

            // recurring events
            dayOfWeek: z.string().nullable(),
            recurring: z.boolean(),

            location: z.string().nullable(),
            weight: z.number().nullable()
        }))
})

export type ExtractedCourse = z.infer<typeof ExtractedCourseSchema>;