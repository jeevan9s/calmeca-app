// Google Service File
// implementing import/export functionality 
import { google } from "googleapis";
import { getAuthClient } from "./googleAuth";
import {Readable} from 'stream'
import { Buffer } from "buffer";
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const pdfParse = require('pdf-parse')
import mammoth from 'mammoth'
import { PDFDocument, StandardFonts } from "pdf-lib";
import { Document, Packer, Paragraph, TextRun } from "docx";
import stream from "stream"
import { importedFile , exportType, Flashcard, quizQuestion} from "../../db";
import path from "path";


const SUPPORTED_MIME_TYPES: Record<string, string> = {
  'text/plain': 'txt',
  'text/markdown': 'md',
  'application/json': 'json',
  'text/csv': 'csv',
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/msword': 'doc',
};


// helper for stream conversion
function streamToBuffer(stream: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: Uint8Array[] = [] //accumulate each chunk of binary data 

        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject)
    })
}
// import any file 
export async function importDriveFile(fileId:string): Promise<importedFile> {
    const auth = await getAuthClient()
    const drive = google.drive({version: 'v3', auth})

    const {data: fileMeta} = await drive.files.get({
        fileId,
        fields: 'id, name, mimeType'
    })

    const mimeType = fileMeta.mimeType || ''
    const name = fileMeta.name || 'Unnamed file'
    if (!(mimeType in SUPPORTED_MIME_TYPES)) {
  throw new Error(`Unsupported file type: ${mimeType}`);
}
    // downloads files as stream
    const response = await drive.files.get( 
        { fileId, alt: 'media' }, { responseType: 'stream'})
    
      const fileBuffer = await streamToBuffer(response.data as Readable)
      let content = ''

      switch (mimeType) {
        case 'application/pdf':
            content = (await pdfParse(fileBuffer)).text
            break
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            content = (await mammoth.extractRawText({ buffer: fileBuffer })).value
            break
        case 'application/msword':
            throw new Error('Legacy .doc format is not supported. Please use .docx format.')
        default:
            content = fileBuffer.toString('utf8') // readable as UTF-8 text -> csv, json, md, txt
      }

      return { id: fileMeta.id!, name, mimeType, usedFor: 'other',  createdOn: new Date(), content}
}

// EXPORTER SERVICE FUNCTIONS 

// used for notes & summaries 
export async function exportTextFeatureGDrive(content:string, filename: string, exportType: exportType): Promise<{ fileId: string; name: string; driveUrl:string; }> {
    const auth = await getAuthClient()
    const drive = google.drive({version: 'v3', auth})

    let buffer: Buffer
    let mimeType: string
    filename = path.basename(filename, path.extname(filename))


    switch(exportType) {
        case 'md':
        case 'txt':
            buffer = Buffer.from(content, 'utf-8')
            mimeType = exportType === 'md' ? 'text/markdown' : 'text/plain'
            filename += `.${exportType}`
            break
        
        case 'json':
            buffer = Buffer.from(JSON.stringify({ content }, null, 2), 'utf-8')
            mimeType = 'application/json'
            filename += `.json`
            break
case 'pdf': {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 12;
  const lineHeight = fontSize + 5;
  const margin = 30;
  const textLines = content.split('\n');

  let page = pdfDoc.addPage();
  const { width: _, height } = page.getSize();
  let y = height - margin;

  for (const line of textLines) {
    if (y < margin + lineHeight) {
      page = pdfDoc.addPage();
      y = height - margin;
    }

    page.drawText(line, {
      x: margin,
      y,
      size: fontSize,
      font,
    });

    y -= lineHeight;
  }

  const pdfBytes = await pdfDoc.save();
  buffer = Buffer.from(pdfBytes);
  mimeType = 'application/pdf';
  filename += '.pdf';
}
break;

        case 'docx':
            {
                const doc = new Document({
                    sections : [{
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun(content)
                                ]
                            })
                        ]
                    }]
                })
                const docBuffer = await Packer.toBuffer(doc)
                buffer = Buffer.from(docBuffer)
                mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                filename += '.docx'
            } 
            break
        default:
            throw new Error(`Unsupported export type: ${exportType}`)
            }
        
    // adding to drive
    const fileMetadata = {
        name: filename, mimeType,
        parents: ['root'],
    }
    const media = {
        mimeType, body: stream.Readable.from(buffer)
    }
    const res = await drive.files.create({
        requestBody: fileMetadata, media, fields: 'id, name'
    })

    if (!res.data.id) {
        throw new Error('Failed to upload file to Google Drive')
    }
    await drive.permissions.create({
  fileId: res.data.id,
  requestBody: { role: 'reader', type: 'anyone' }
})
    const driveUrl = `https://drive.google.com/file/d/${res.data.id}/view`;
    return { fileId: res.data.id, name: res.data.name ?? filename, driveUrl}
    
}


// used for quizzes/flashcards 
export async function exportStructFeatureGDrive(content:Flashcard[] | quizQuestion[], filename: string, exportType: "json" | "csv"): Promise<{fileId: string; name: string; driveUrl: string}> {
    const auth = await getAuthClient()
    const drive = google.drive({version: "v3", auth})

    let buffer: Buffer
    let mimeType: string

    if (exportType === "json") {
        // convert to json
        buffer = Buffer.from(JSON.stringify(content, null, 2), "utf-8")
        mimeType = "application/json"
        filename += '.json'
    } else if (exportType === "csv"){
        let csv = ""
        if ( content.length > 0 && "front" in content[0]) {
            // flashcards
            csv = "Front, Back\n" + (content as Flashcard[])
            .map(card => `"${card.front.replace(/"/g, '""')}","${card.back.replace(/"/g, '""')}"`)
            .join("\n");
        } else if (content.length > 0 && "questionText" in content[0]) {
            // quiz
             csv = "Question,Type,Correct Answer,Options,Explanation\n" + (content as quizQuestion[])
        .map(q => {
          const options = q.options?.join(", ") ?? "";
          const explanation = q.explanation ?? "";
          return `"${q.questionText.replace(/"/g, '""')}","${q.type}","${q.correctAnswer}","${options.replace(/"/g, '""')}","${explanation.replace(/"/g, '""')}"`; 
        }).join("\n")
        } else {
            throw new Error("Unsupported content format for CSV export")
        }

        buffer = Buffer.from(csv, "utf-8")
        mimeType = "text/csv"
    } else {
        throw new Error("Unsupported export type")
    }
        const fileMetadata = {
        name: filename, mimeType
    }
    const media = {
        mimeType, body: stream.Readable.from(buffer)
    }
    const res = await drive.files.create({
        requestBody: fileMetadata, media, fields: 'id, name'
    })

    if (!res.data.id) {
        throw new Error('Failed to upload file to Google Drive')
    }
await drive.permissions.create({
  fileId: res.data.id,
  requestBody: { role: "reader", type: "anyone" }
});

const driveUrl = `https://drive.google.com/file/d/${res.data.id}/view`;

return {
  fileId: res.data.id,
  name: res.data.name ?? filename,
  driveUrl,
};
}


    

