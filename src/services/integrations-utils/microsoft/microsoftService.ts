// Microsoft Service File
import { Client } from "@microsoft/microsoft-graph-client";
import { getMicrosoftGraphClient } from "./microsoftAuth";
import { MicrosoftFile } from "../../db";

export async function listOneDriveFiles(folderId?: string): Promise<MicrosoftFile[]> {
    const client: Client = await getMicrosoftGraphClient();

    const endpoint = folderId
        ? `/me/drive/items/${folderId}/children`
        : "/me/drive/root/children";

    const res = await client.api(endpoint).get();

    // Map to storage-friendly format
    return res.value.map((item: any) => ({
        id: item.id,
        name: item.name,
        mimeType: item.file?.mimeType || item.folder ? "folder" : "unknown",
        size: item.size,
        createdOn: new Date(item.createdDateTime),
        lastModified: new Date(item.lastModifiedDateTime),
    }));
}

export async function getUpcomingCalendarEvents(): Promise<any[]> {
    const client: Client = await getMicrosoftGraphClient();

    const now = new Date().toISOString();
    const res = await client
        .api("/me/calendarview")
        .query({ startDateTime: now, endDateTime: new Date(Date.now() + 7*24*60*60*1000).toISOString() })
        .top(50)
        .orderby("start/dateTime")
        .get();

    return res.value.map((event: any) => ({
        id: event.id,
        subject: event.subject,
        start: event.start,
        end: event.end,
        location: event.location?.displayName,
        organizer: event.organizer?.emailAddress?.name,
    }));
}

export async function getTodayCalendarEvents(): Promise<any[]> {
    const client: Client = await getMicrosoftGraphClient();

    const start = new Date();
    start.setHours(0,0,0,0);
    const end = new Date();
    end.setHours(23,59,59,999);

    const res = await client
        .api("/me/calendarview")
        .query({ startDateTime: start.toISOString(), endDateTime: end.toISOString() })
        .top(50)
        .orderby("start/dateTime")
        .get();

    return res.value.map((event: any) => ({
        id: event.id,
        subject: event.subject,
        start: event.start,
        end: event.end,
        location: event.location?.displayName,
        organizer: event.organizer?.emailAddress?.name,
    }));
}
