import { OpenAI } from "openai"
import { zodTextFormat } from "openai/helpers/zod";
import { prompt } from "./prompt";
import { ExtractedCourseSchema, ExtractedCourse } from "./schema";

const key =  import.meta.env.VITE_OPENAI_API_KEY || ""
const client = new OpenAI({apiKey:key, dangerouslyAllowBrowser:true});

export class ExtractionService {
    async extract(text: string): Promise<ExtractedCourse> {
        const prompt = this.buildPrompt(text);
        return await this.runExtraction(prompt);

    }

    private buildPrompt(text: string): string {
        return `${prompt}\n\nDocument:\n${text}`;
    }

    private async runExtraction(prompt: string): Promise<ExtractedCourse> {
        const response = await client.responses.create({
            model: "gpt-5-nano",
            input: prompt,
            text: {
                format: zodTextFormat(ExtractedCourseSchema, "extracted_course"),
            }
        })

        if (!response.output_text) throw new Error("failed to extract course data");
        return JSON.parse(response.output_text) as ExtractedCourse;
    }
}