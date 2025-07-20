'use client'

import { useState, useEffect } from 'react'
import Layout from '@/renderer/components/Layout'
import { exportType, exportResponse } from '@/services/db'

export default function GoogleTest() {
  console.log('Google test page loaded')

  const [user, setUser] = useState<null | { name: string; email: string; picture: string }>(null)
  const [error, setError] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [importedFile, setImportedFile] = useState<{ name: string; content: string } | null>(null)
  const [exportType, setExportType] = useState<exportType>('pdf')
  const [filename, setFilename] = useState('untitled')
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [contentType, setContentType] = useState<'summary' | 'flashcards' | 'quiz'>('summary')
  const [quizType, setQuizType] = useState<'multiple-choice' | 'true-false' | 'short-answer' | 'mixed'>('mixed')
  const [AIcontent, setAIContent] = useState<string | null>(null)
  const [parsedContent, setParsedContent] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [flashcards, setFlashcards] = useState<{term: string; definition: string}[]>([])
  const [quiz, setQuiz] = useState<
    {
      type: string;
      question: string;
      options?: string[];
      correctAnswer: string;
    }[]
  >([])

const parseAIContent = (content: any, type: string) => {
  if (typeof content !== "string") {
    console.error("AI content is not a string:", content)
    setParsedContent(null)
    return
  }

  if (!content.trim()) {
    console.error("Empty AI content — nothing to parse.")
    setParsedContent(null)
    return
  }

  try {
    if (type === 'summary') {
      setParsedContent(content)
    } else if (type === 'flashcards' || type === 'quiz') {
      const parsed = JSON.parse(content)
      setParsedContent(parsed)

      if (type === 'flashcards') setFlashcards(parsed)
      else if (type === 'quiz') setQuiz(parsed)
    }
  } catch (err) {
    console.error('Error parsing AI content:', err, content)
    setParsedContent(null)
  }
}



  useEffect(() => {
    const loginSuccessHandler = async (_event: any, data: any) => {
      console.log('Login success event received', data)
      setError(null)

      try {
        const res = await window.electronAPI.googleLogin()
        if (res.success) {
          setUser(res.user ?? null)
        }
      } catch (err) {
        console.error('Error handling login success:', err)
        setError('Failed to complete login')
      }
    }

    window.electronAPI.onLoginSuccess(loginSuccessHandler)

    return () => {
      window.electronAPI.removeLoginSuccessListener(loginSuccessHandler)
    }
  }, [])

const handleLogin = async () => {
  console.log('Attempting login')
  setIsLoading(true)
  setError(null)

  try {
    const res = await window.electronAPI.googleLogin()

    if (res.success && res.user) {
      setUser(res.user)
      console.log("Logged in successfully!", res.user)
    } else {
      
      if (res.error === 'No valid login session, please authenticate.') {
        console.log('Starting redirect login...')
        await window.electronAPI.startLoginRedirect()
        return 
      }

      console.error("Login failed:", res.error)
      setError(res.error ?? 'Login failed')
    }
  } catch (err) {
    console.error('Login error:', err)
    setError('Login failed unexpectedly')
  } finally {
    setIsLoading(false)
  }
}

  const handleLogout = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const res = await window.electronAPI.googleLogout()
      if (res.success) {
        setUser(null)
      } else {
        setError(res.error ?? 'Logout failed')
      }
    } catch (err) {
      console.error('Logout error:', err)
      setError('Logout failed unexpectedly')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async () => {
    if (!text.trim()) {
      alert("Enter some content to export.")
      return
    }
    if (!filename.trim()) {
      alert("Enter a filename.")
      return
    }

    setIsExporting(true)
    setError(null)
    
    try {
      const res: exportResponse = await window.electronAPI.gTextExport(text, filename, exportType)
      if (res.success) {
        alert(`File uploaded successfully!\n${res.driveUrl}`)
      } else {
        alert(`Failed to export file: ${res.error || 'Unknown error'}`)
        setError(res.error || 'Export failed')
      }
    } catch (err) {
      console.error('Export error:', err)
      alert('Export failed unexpectedly')
      setError('Export failed unexpectedly')
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async () => {
    setIsImporting(true)
    setError(null)
    
    try {
      const fileId = await window.electronAPI.openGooglePicker()
      console.log('Picker result:', fileId)
      
      if (fileId) {
        const res = await window.electronAPI.gImportFile(fileId)
        console.log('Import response:', res)
        
        if (res.success && res.name && res.content) {
          setImportedFile({ name: res.name, content: res.content })
          alert(`Imported file: ${res.name}`)
        } else {
          alert(`Import failed: ${res.error || 'Unknown error'}`)
          setError(res.error || 'Import failed')
        }
      }
    } catch (err) {
      console.error("Picker or import failed", err)
      alert('Import failed unexpectedly')
      setError('Import failed unexpectedly')
    } finally {
      setIsImporting(false)
    }
  }

const handleGenerate = async () => {
  if (!importedFile?.content) {
    alert('Import a file first')
    return
  }

  setIsGenerating(true)
  setAIContent(null)
  setParsedContent(null)

  try {
    const requestData = {
      type: contentType,
      content: importedFile.content,
      options: contentType === 'quiz' ? { quizType } : undefined,
    }
    
    console.log('Sending to AI service:', requestData) 
    console.log('Content length:', importedFile.content.length) 
    console.log('Content preview:', importedFile.content.substring(0, 200) + '...') 

    const res = await window.electronAPI.generateAIContent(requestData)

    console.log('AI Generation response:', res) 

    if (res.success && res.result !== undefined) {
      console.log('Result type:', typeof res.result) 
      console.log('Result content:', res.result) 
      
      
      setAIContent(JSON.stringify(res.result, null, 2))
      
      if (contentType === 'summary') {
        
        if (typeof res.result === 'string') {
          setParsedContent(res.result)
        } else {
          console.error('Expected string for summary, got:', typeof res.result)
          setParsedContent(null)
        }
      } else if (contentType === 'flashcards' || contentType === 'quiz') {
        
        if (Array.isArray(res.result)) {
          setParsedContent(res.result)
          if (contentType === 'flashcards') setFlashcards(res.result)
          else if (contentType === 'quiz') setQuiz(res.result)
        } else {
          console.error(`Expected array for ${contentType}, got:`, typeof res.result)
          setParsedContent(null)
        }
      }
    } else {
      console.error('Generation failed:', res.error)
      alert(`Generation failed: ${res.error || 'Unknown error'}`)
    }
  } catch (err) {
    console.error("AI Generation error: ", err)
    alert("AI failed unexpectedly")
  } finally {
    setIsGenerating(false)
  }
}


const renderAIContent = () => {
  if (!parsedContent) return null
  
  if (contentType === 'summary') {
    return (
      <div className="whitespace-pre-wrap text-xs text-white/80 font-raleway">
        {parsedContent}
      </div>
    )
  }
  
  if (contentType === 'flashcards') {
    return (
      <div className="space-y-2 text-xs">
        {parsedContent.map((card: any, index: number) => (
          <div key={index} className="border border-neutral-600 rounded p-2 bg-neutral-700">
            <div className="font-semibold text-white">{card.term}</div>
            <div className="text-white/70 text-xs mt-1">{card.definition}</div>
          </div>
        ))}
      </div>
    )
  }
  
  if (contentType === 'quiz') {
    return (
      <div className="space-y-3 text-xs">
        {parsedContent.map((question: any, index: number) => (
          <div key={index} className="border border-neutral-600 rounded p-2 bg-neutral-700">
            <div className="font-semibold text-white text-xs mb-1">
              {index + 1}. {question.question}
            </div>
            {question.options && (
              <div className="ml-2 space-y-1">
                {question.options.map((option: string, optIndex: number) => (
                  <div key={optIndex} className="text-white/70 text-xs">
                    {String.fromCharCode(65 + optIndex)}. {option}
                  </div>
                ))}
              </div>
            )}
            <div className="text-green-400 text-xs mt-1">
              Answer: {question.correctAnswer}
            </div>
          </div>
        ))}
      </div>
    )
  }
}

return (
  <div className="overflow-y-auto min-h-screen bg-black/30">
    <Layout />
    <div className="max-w-md mx-5 mt-10 text-left">
      <h1 className="text-4xl text-white font-raleway">
        G-Drive Testing
      </h1>
    </div>

    
{importedFile && (
  <>
    <div className="fixed top-15 left-96 ml-40 w-80 flex flex-col gap-4 z-50">
      <div className="p-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white">
        <h2 className="font-semibold font-raleway text-sm mb-2">
          AI Tools
        </h2>

        <div>
          <label className="block text-xs text-white/60 font-raleway">select content</label>
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value as typeof contentType)}
            className="p-2 w-full bg-neutral-800 text-white text-sm rounded border border-gray-700 font-raleway"
          >
            <option value="summary">summary</option>
            <option value="flashcards">flashcards</option>
            <option value="quiz">quiz</option>
          </select>

          {contentType === 'quiz' && (
            <div>
              <label className="block text-xs text-white/60 font-raleway mt-2">quiz type:</label>
              <select
                value={quizType}
                onChange={(e) => setQuizType(e.target.value as typeof quizType)}
                className="p-2 w-full bg-neutral-800 text-white text-sm rounded border border-gray-700 font-raleway"
              >
                <option value="multiple-choice">multiple-choice</option>
                <option value="true-false">true or false</option>
                <option value="short-answer">short answer</option>
                <option value="mixed">full quiz</option>
              </select>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`inline-block p-2 mt-2 text-xs cursor-pointer font-semibold font-raleway text-white rounded-lg shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-neutral-600 ${
              isGenerating
                ? 'bg-neutral-600 cursor-not-allowed'
                : 'bg-neutral-800 hover:bg-neutral-700'
            }`}
          >
            {isGenerating ? 'generating...' : 'generate AI content'}
          </button>
        </div>
      </div>

      {AIcontent && (
        <div className="p-3 bg-2-900 border border-neutral-700 rounded-lg text-white max-h-48 max-w-96 overflow-auto bg-neutral-800 border-neutral-600 rounded p-2">
          <h3 className="font-semibold font-raleway text-sm mb-2">Generated Content</h3>
          <div className='w-64'>{renderAIContent()}</div>
        </div>
      )}
    </div>

    <div className="max-w-md mx-5 mt-2 text-left">
      <h3 className="font-raleway text-md font-thin text-white/60">
        prototyping Google integrations: (auth, import, export).
      </h3>
    </div>
  </>
)}


    
    {user && (
      <div className="max-w-md mx-5 mt-4 p-3 bg-green-900/50 border border-green-700 rounded-lg text-green-200 text-sm">
        <p className="font-semibold">logged in as: {user.name}</p>
        <p className="text-xs text-green-300">{user.email}</p>
      </div>
    )}

    <div className="flex flex-col mx-5 mt-4">
      
      <label className="block mb-1 text-sm text-white/60 font-raleway">Auth Testing</label>
      <div className="flex gap-4 items-center mb-4">
        <button
          className={`inline-block py-3 px-6 text-sm cursor-pointer font-semibold font-raleway text-white rounded-lg shadow-md transition-all ${
            isLoading 
              ? 'bg-neutral-600 cursor-not-allowed' 
              : 'bg-neutral-800 hover:bg-neutral-700'
          }`}
          onClick={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? 'loading...' : 'login with Google'}
        </button>
        <button
          className={`inline-block py-3 px-6 text-sm font-semibold font-raleway text-white rounded-lg shadow-md transition-all ${
            isLoading 
              ? 'bg-neutral-600 cursor-not-allowed' 
              : 'bg-neutral-800 hover:bg-red-900'
          }`}
          onClick={handleLogout}
          disabled={isLoading}
        >
          {isLoading ? 'loading...' : 'logout'}
        </button>
      </div>

      
      <div className="max-w-md text-left">
        <label className="block mb-1 text-sm text-white/60 font-raleway">File Export</label>
        
        
        <div className="flex gap-3 items-center mb-2">
          <input
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder="enter filename"
            className="p-2 bg-neutral-800 text-white text-sm rounded border border-gray-700 font-raleway flex-1"
          />
          <select 
            value={exportType} 
            onChange={(e) => setExportType(e.target.value as exportType)} 
            className="p-2 bg-neutral-800 text-white text-sm rounded border border-gray-700 font-raleway"
          >
            <option value="txt">.txt</option>
            <option value="pdf">.pdf</option>
            <option value="md">.md</option>
            <option value="docx">.docx</option>
            <option value="json">.json</option>
          </select>
        </div>

        <textarea 
          id="message" 
          rows={4} 
          value={text} 
          onChange={(e) => setText(e.target.value)} 
          placeholder="enter content to export..."
          className="block p-3 w-full text-sm text-white bg-neutral-800 rounded-lg border border-gray-300 resize-vertical"
        />
        <button
          onClick={handleExport}
          disabled={isExporting || !user}
          className={`inline-block p-2.5 mt-2 text-xs cursor-pointer font-semibold font-raleway text-white rounded-lg shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-neutral-600 ${
            isExporting || !user
              ? 'bg-neutral-600 cursor-not-allowed'
              : 'bg-neutral-800 hover:bg-neutral-700'
          }`}
        >
          {isExporting ? 'exporting...' : 'export'}
        </button>
        {!user && (
          <p className="text-xs text-red-400 mt-1">please login to export files</p>
        )}
      </div>

      
      <div className="max-w-md text-left mt-6">
        <label className="block mb-1 text-sm text-white/60 font-raleway">File Import</label>
        <button
          onClick={handleImport}
          disabled={isImporting || !user}
          className={`inline-block p-2.5 text-xs cursor-pointer font-semibold font-raleway text-white rounded-lg shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-neutral-600 ${
            isImporting || !user
              ? 'bg-neutral-600 cursor-not-allowed'
              : 'bg-neutral-800 hover:bg-neutral-700'
          }`}
        >
          {isImporting ? 'Importing...' : 'import from Google drive'}
        </button>
        {!user && (
          <p className="text-xs text-red-400 mt-1">please login to import files</p>
        )}
      </div>

      
      {importedFile && (
        <div className="flex gap-6 mt-6">
          <div className="flex-1 p-4 bg-neutral-900 border border-neutral-700 rounded-lg text-white">
            <h2 className="font-semibold font-raleway text-md mb-2 flex items-center gap-2">
               Imported: {importedFile.name}
              <button
                onClick={() => setImportedFile(null)}
                className="ml-auto text-red-400 hover:text-red-300 text-xs"
              >
                ✕ Clear
              </button>
            </h2>
            <div className="max-h-40 overflow-auto">
              <pre className="whitespace-pre-wrap text-sm text-white/80 break-words">
                {importedFile.content}
              </pre>
            </div>
          </div>

        </div>
      )}
    </div>
  </div>
)
}