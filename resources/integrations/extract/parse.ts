import { PDFParse } from 'pdf-parse';
import { ParsedPDF } from '../../app/services/db';

PDFParse.setWorker('https://cdn.jsdelivr.net/npm/pdf-parse@2.4.5/dist/pdf-parse/web/pdf.worker.mjs');

export class PDFService {
    async parse(input: File | ArrayBuffer | Uint8Array): Promise<ParsedPDF> {
        const buf = await this.toBuffer(input);
        const parser = new PDFParse({ data: buf });

        try {
            const data = await parser.getText();

            return {
                text: this.clean(data.text),
                pageCount: data.total,
            };
        } finally {
            await parser.destroy();
        }
    }

    private clean(raw: string): string {
        return raw.replace(/\r\n/g, "\n")
               .replace(/[ \t]+/g, " ")
               .replace(/\n{3,}/g, "\n\n")
               .trim()
    }

    private async toBuffer(input: File | ArrayBuffer | Uint8Array): Promise<Uint8Array> {
        if (input instanceof Uint8Array) return input;
        if (input instanceof ArrayBuffer) return new Uint8Array(input);
        const bytes = await input.arrayBuffer();
        return new Uint8Array(bytes);
    }
}