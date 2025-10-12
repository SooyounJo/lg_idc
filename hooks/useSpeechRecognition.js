import { useState, useEffect, useRef } from 'react'

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef(null)

  useEffect(() => {
    // 브라우저가 Web Speech API를 지원하는지 확인
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      
      if (SpeechRecognition) {
        setIsSupported(true)
        
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'ko-KR' // 한국어 설정

        recognition.onstart = () => {
          console.log('Speech recognition started')
          setIsListening(true)
        }

        recognition.onresult = (event) => {
          const speechResult = event.results[0][0].transcript
          console.log('Speech result:', speechResult)
          setTranscript(speechResult)
        }

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
        }

        recognition.onend = () => {
          console.log('Speech recognition ended')
          setIsListening(false)
        }

        recognitionRef.current = recognition
      } else {
        console.warn('Speech Recognition API is not supported in this browser')
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('')
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }

  return {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
  }
}
