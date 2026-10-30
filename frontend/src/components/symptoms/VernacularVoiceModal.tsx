import React, { useState, useEffect } from 'react'
import { Mic, MicOff, X, Check, Globe, AlertCircle, CheckCircle2 } from 'lucide-react'
import { api } from '../../services/api'
import { ParsedConcept } from '../../types'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export const VernacularVoiceModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [language, setLanguage] = useState<'hi' | 'ta' | 'en'>('hi')
  const [inputText, setInputText] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [parsedConcepts, setParsedConcepts] = useState<ParsedConcept[]>([])
  const [selectedConcepts, setSelectedConcepts] = useState<Record<string, boolean>>({})
  const [confirmedSeverities, setConfirmedSeverities] = useState<Record<string, number>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const samplePhrases = {
    hi: [
      'मुझे बहुत मुँहासे हो रहे हैं और पीरियड्स दो महीने से नहीं आए',
      'पेट में बहुत तेज दर्द और ऐंठन हो रही है',
      'चेहरे और ठोड़ी पर अनचाहे बाल आ रहे हैं'
    ],
    ta: [
      'மாதவிடாய் தாமதமாகிறது, முகப்பரு அதிகம் இருக்கு',
      'வயிற்று வலி மற்றும் அதிக சோர்வு இருக்கு'
    ],
    en: [
      'Having severe acne and skipped my period for 2 months',
      'Experiencing intense sugar cravings and pelvic cramps'
    ]
  }

  const startListening = () => {
    setErrorMsg(null)
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setErrorMsg('Speech recognition is not supported in this browser. You can type or paste vernacular phrases below.')
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.lang = language === 'hi' ? 'hi-IN' : (language === 'ta' ? 'ta-IN' : 'en-US')
      recognition.continuous = false
      recognition.interimResults = false

      recognition.onstart = () => setIsListening(true)
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInputText(transcript)
        handleParse(transcript)
      }
      recognition.onerror = (e: any) => {
        console.warn('Speech error:', e)
        setIsListening(false)
        setErrorMsg('Microphone recognition error. Please type or try again.')
      }
      recognition.onend = () => setIsListening(false)

      recognition.start()
    } catch (err: any) {
      setErrorMsg('Microphone access blocked or unavailable. Type your phrase below.')
    }
  }

  const handleParse = async (textToParse = inputText) => {
    if (!textToParse.trim()) return
    setIsProcessing(true)
    setErrorMsg(null)
    try {
      const res = await api.parseVernacularSpeech(textToParse, language)
      setParsedConcepts(res.concepts)

      // Initialize selection and severity
      const selMap: Record<string, boolean> = {}
      const sevMap: Record<string, number> = {}
      res.concepts.forEach((c: ParsedConcept) => {
        if (!c.is_negated) {
          selMap[c.symptom_code] = true
          sevMap[c.symptom_code] = c.detected_severity || 3
        }
      })
      setSelectedConcepts(selMap)
      setConfirmedSeverities(sevMap)

      if (res.concepts.length === 0) {
        setErrorMsg('No recognized clinical symptom terms found. Try phrasing your observation differently.')
      }
    } catch (err: any) {
      setErrorMsg(`NLP parsing failed: ${err.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSaveConfirmed = async () => {
    const today = new Date().toISOString().split('T')[0]
    setIsSaving(true)
    try {
      for (const concept of parsedConcepts) {
        if (selectedConcepts[concept.symptom_code]) {
          await api.createSymptom({
            symptom_code: concept.symptom_code,
            symptom_name: concept.symptom_name,
            category: concept.category,
            severity: confirmedSeverities[concept.symptom_code] || 3,
            date: today,
            voice_logged: true,
            vernacular_raw_text: inputText,
            notes: `Logged via vernacular voice/text NLP (${concept.matched_phrase})`
          })
        }
      }
      onSuccess()
      onClose()
    } catch (err: any) {
      alert(`Could not save symptoms: ${err.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl relative border border-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 bg-plum-100 rounded-xl text-plum-700">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-plum-900">Vernacular Voice-to-Symptom NLP</h3>
            <p className="text-xs text-slate-500">Regional speech input with clinical concept extraction & user confirmation</p>
          </div>
        </div>

        {/* Language selector */}
        <div className="flex items-center gap-2 mb-4 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 pl-2">Language:</span>
          {(['hi', 'ta', 'en'] as const).map(lang => (
            <button
              key={lang}
              type="button"
              onClick={() => setLanguage(lang)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition ${
                language === lang
                  ? 'bg-plum-800 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              {lang === 'hi' ? 'Hindi (हिन्दी)' : (lang === 'ta' ? 'Tamil (தமிழ்)' : 'English')}
            </button>
          ))}
        </div>

        {/* Input box & mic */}
        <div className="relative mb-3">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              language === 'hi'
                ? 'अपनी बात बोलें या लिखें (उदा. मुझे बहुत मुँहासे हो रहे हैं)...'
                : (language === 'ta' ? 'பேசவும் அல்லது தட்டச்சு செய்யவும்...' : 'Speak or type your symptoms...')
            }
            className="w-full p-3 pr-12 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-plum-500 focus:border-transparent resize-none h-24"
          />
          <button
            type="button"
            onClick={startListening}
            className={`absolute right-3 bottom-3 p-2.5 rounded-xl shadow-md transition ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-plum-800 text-white hover:bg-plum-900'
            }`}
            title="Start Voice Recording"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick sample pills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className="text-[11px] text-slate-400 self-center">Try sample:</span>
          {samplePhrases[language].map((phrase, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setInputText(phrase)
                handleParse(phrase)
              }}
              className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full transition"
            >
              "{phrase.slice(0, 32)}..."
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => handleParse()}
          disabled={isProcessing || !inputText.trim()}
          className="w-full py-2 bg-plum-800 hover:bg-plum-900 text-white text-xs font-semibold rounded-xl shadow-sm transition disabled:opacity-50 mb-4"
        >
          {isProcessing ? 'Analyzing Vernacular Concepts...' : 'Extract Clinical Concepts'}
        </button>

        {errorMsg && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Parsed concepts with mandatory user confirmation */}
        {parsedConcepts.length > 0 && (
          <div className="bg-lavender-50 border border-lavender-200 rounded-xl p-4 mb-4 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-plum-900 uppercase tracking-wider">
                Step 2: Confirm Detected Symptoms
              </h4>
              <span className="text-[11px] text-rose-600 font-medium">Mandatory Review</span>
            </div>

            <p className="text-xs text-slate-600 mb-3">
              Uncheck any symptoms that do not match your experience or adjust their severity before saving.
            </p>

            <div className="space-y-2.5">
              {parsedConcepts.map((concept) => (
                <div
                  key={concept.symptom_code}
                  className={`p-3 rounded-lg border transition ${
                    concept.is_negated
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : (selectedConcepts[concept.symptom_code]
                          ? 'bg-white border-plum-300 shadow-sm'
                          : 'bg-white/60 border-slate-200')
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!selectedConcepts[concept.symptom_code]}
                        disabled={concept.is_negated}
                        onChange={(e) =>
                          setSelectedConcepts({
                            ...selectedConcepts,
                            [concept.symptom_code]: e.target.checked
                          })
                        }
                        className="mt-1 rounded text-plum-600 focus:ring-plum-500"
                      />
                      <div>
                        <span className="text-xs font-bold text-plum-900 block">
                          {concept.symptom_name}
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          Matched idiom: "{concept.matched_phrase}" ({concept.category})
                        </span>
                        {concept.is_negated && (
                          <span className="inline-block mt-1 px-2 py-0.5 text-[10px] bg-slate-200 text-slate-700 font-semibold rounded">
                            Negated in text ("नहीं" / "no")
                          </span>
                        )}
                      </div>
                    </label>

                    {!concept.is_negated && selectedConcepts[concept.symptom_code] && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[11px] text-slate-500">Severity:</span>
                        <select
                          value={confirmedSeverities[concept.symptom_code] || 3}
                          onChange={(e) =>
                            setConfirmedSeverities({
                              ...confirmedSeverities,
                              [concept.symptom_code]: Number(e.target.value)
                            })
                          }
                          className="text-xs border border-slate-300 rounded-lg p-1 bg-white font-medium"
                        >
                          <option value={1}>1 - Mild</option>
                          <option value={2}>2 - Moderate</option>
                          <option value={3}>3 - Noticeable</option>
                          <option value={4}>4 - High</option>
                          <option value={5}>5 - Severe</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-medium rounded-xl hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          {parsedConcepts.length > 0 && (
            <button
              type="button"
              onClick={handleSaveConfirmed}
              disabled={isSaving || !Object.values(selectedConcepts).some(Boolean)}
              className="px-5 py-2 bg-plum-800 hover:bg-plum-900 text-white text-xs font-semibold rounded-xl shadow-md transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSaving ? 'Logging...' : 'Confirm & Log to Journal'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
