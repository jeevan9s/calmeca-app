export const prompt = 
`You are extracting structured academic information from a course document. Extract all information that is explicitly stated in the document. 

Course information: 
- Course title 
- Course code 
- Professor/instructor 
- Course email 
- Professor email 
- Course description 
- Credits 

Academic events: Extract all relevant academic events, including: 
- Lectures 
- Tutorials 
- Labs 
- Assignments 
- Quizzes 
- Midterms 
- Other assessments or scheduled academic events 

For each event, extract: 
- Title 
- Type 
- Date, if it is a one-time event 
- Start time 
- End time 
- Day of week, if applicable 
- Whether the event is recurring 
- Location 
- Weight, if it is an assessment 

Important rules: 
- Only extract information explicitly supported by the document. 
- Do not guess or infer missing information. 
- Use null when information is not provided. 
- If an event occurs weekly, represent it as a recurring event rather than generating individual occurrences. 
- Preserve the distinction between recurring events and one-time events. 
- If multiple events of the same type exist, extract all of them. 
- Normalize dates to ISO 8601 format when possible. 
- Normalize times to 24-hour format when possible. 
- Do not omit events simply because some of their fields are missing. 
`
;
