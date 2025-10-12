'use client'

import { useState, useEffect } from 'react'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { DEFAULT_AI } from '@/utils/prompts'
import axios from 'axios'

const VoiceChat = () => {
  const [conversationHistory, setConversationHistory] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)
  const { isListening, transcript, isSupported, startListening, stopListening } = useSpeechRecognition()

  useEffect(() => {
    if (transcript && !isListening && !isProcessing) {
      handleSpeechResult(transcript)
    }
  }, [transcript, isListening])

  const handleSpeechResult = async (text) => {
    if (!text || isProcessing) return
    
    setIsProcessing(true)
    setError(null)
    
    try {
      console.log('User said:', text)

      // 퓨론 AI에게 질문하고 답변 받기
      const chatResponse = await axios.post('/api/chat', {
        message: text,
        conversationHistory: conversationHistory,
      }, {
        timeout: 30000, // 30초 타임아웃
      })

      if (!chatResponse.data || !chatResponse.data.response) {
        throw new Error('AI 응답이 비어있습니다.')
      }

      const aiResponse = chatResponse.data.response

      // 대화 히스토리에 추가
      setConversationHistory((prev) => [
        ...prev,
        { role: 'user', content: text },
        { role: 'assistant', content: aiResponse },
      ])
    } catch (error) {
      console.error('Error processing speech:', error)
      
      let errorMessage = 'AI 응답 생성 중 오류가 발생했습니다.'
      
      if (error.response) {
        // 서버 응답이 있는 경우
        if (error.response.status === 401) {
          errorMessage = 'API 키가 유효하지 않습니다. 설정을 확인해주세요.'
        } else if (error.response.status === 429) {
          errorMessage = 'API 사용 한도를 초과했습니다. 잠시 후 다시 시도해주세요.'
        } else if (error.response.status === 500) {
          errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
        }
      } else if (error.request) {
        // 요청은 보냈지만 응답이 없는 경우
        errorMessage = '서버에 연결할 수 없습니다. 네트워크를 확인해주세요.'
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = '요청 시간이 초과되었습니다. 다시 시도해주세요.'
      }
      
      setError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRecordToggle = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const clearHistory = () => {
    setConversationHistory([])
    setError(null)
  }

  return (
    <div style={styles.container}>
      <div style={styles.chatBox}>
        <div style={styles.header}>
          <h2 style={styles.title}>{DEFAULT_AI.name}</h2>
          <button onClick={clearHistory} style={styles.clearButton}>
            대화 초기화
          </button>
        </div>

        <div style={styles.aiDescription}>
          <p style={styles.descriptionText}>{DEFAULT_AI.description}</p>
          <div style={styles.devicesContainer}>
            {DEFAULT_AI.smartHomeDevices.map((device, index) => (
              <span key={index} style={styles.deviceBadge}>
                {device}
              </span>
            ))}
          </div>
        </div>

        <div style={styles.messagesContainer}>
          {!isSupported && (
            <div style={styles.warningMessage}>
              ⚠️ 이 브라우저는 음성 인식을 지원하지 않습니다. Chrome, Edge, Safari를 사용해주세요.
            </div>
          )}
          {error && (
            <div style={styles.errorMessage}>
              ❌ {error}
            </div>
          )}
          {conversationHistory.length === 0 ? (
            <div style={styles.emptyState}>
              {DEFAULT_AI.greeting}
            </div>
          ) : (
            conversationHistory.map((msg, index) => (
              <div
                key={index}
                style={{
                  ...styles.message,
                  ...(msg.role === 'user' ? styles.userMessage : styles.aiMessage),
                }}
              >
                <div style={styles.messageLabel}>
                  {msg.role === 'user' ? '👤 나' : '🏠 퓨론'}
                </div>
                <div style={styles.messageContent}>{msg.content}</div>
              </div>
            ))
          )}
          {isProcessing && (
            <div style={styles.processingMessage}>
              <div style={styles.loader}></div>
              <span>처리 중...</span>
            </div>
          )}
        </div>

        <div style={styles.controls}>
          {transcript && isListening && (
            <div style={styles.transcribed}>
              <strong>듣는 중...</strong>
            </div>
          )}
          {transcript && !isListening && !isProcessing && (
            <div style={styles.transcribed}>
              <strong>인식됨:</strong> {transcript}
            </div>
          )}
          <button
            onClick={handleRecordToggle}
            disabled={isProcessing || !isSupported}
            style={{
              ...styles.recordButton,
              ...(isListening ? styles.recordingButton : {}),
              ...(isProcessing || !isSupported ? styles.disabledButton : {}),
            }}
          >
            {isListening ? '🔴 인식 중지' : '🎤 음성 인식 시작'}
          </button>
          {isListening && (
            <div style={styles.recordingIndicator}>
              <span style={styles.pulse}></span>
              듣는 중...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 1000,
    width: '500px',
    maxHeight: '85vh',
  },
  chatBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    padding: '20px',
    borderBottom: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
  },
  clearButton: {
    padding: '6px 12px',
    fontSize: '12px',
    backgroundColor: '#f0f0f0',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  aiDescription: {
    padding: '16px 20px',
    borderBottom: '1px solid #eee',
    backgroundColor: '#f9f9f9',
  },
  descriptionText: {
    margin: '0 0 12px 0',
    fontSize: '13px',
    color: '#666',
    lineHeight: '1.5',
  },
  devicesContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  deviceBadge: {
    padding: '4px 10px',
    fontSize: '11px',
    backgroundColor: '#A50034',
    color: 'white',
    borderRadius: '12px',
    fontWeight: '500',
  },
  messagesContainer: {
    padding: '20px',
    maxHeight: '500px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  emptyState: {
    textAlign: 'center',
    color: '#999',
    padding: '40px 20px',
    fontSize: '14px',
  },
  warningMessage: {
    padding: '12px',
    backgroundColor: '#FFF3CD',
    color: '#856404',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '12px',
    textAlign: 'center',
  },
  errorMessage: {
    padding: '12px',
    backgroundColor: '#F8D7DA',
    color: '#721C24',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '12px',
    textAlign: 'center',
  },
  message: {
    padding: '12px 16px',
    borderRadius: '12px',
    maxWidth: '85%',
    wordWrap: 'break-word',
  },
  userMessage: {
    backgroundColor: '#007AFF',
    color: 'white',
    alignSelf: 'flex-end',
    marginLeft: 'auto',
  },
  aiMessage: {
    backgroundColor: '#A50034',
    color: 'white',
    alignSelf: 'flex-start',
  },
  messageLabel: {
    fontSize: '11px',
    marginBottom: '4px',
    opacity: 0.8,
  },
  messageContent: {
    fontSize: '15px',
    lineHeight: '1.5',
  },
  processingMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#666',
    fontSize: '14px',
    padding: '12px',
  },
  loader: {
    width: '16px',
    height: '16px',
    border: '2px solid #f3f3f3',
    borderTop: '2px solid #007AFF',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  controls: {
    padding: '20px',
    borderTop: '1px solid #eee',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  transcribed: {
    fontSize: '12px',
    color: '#666',
    padding: '8px',
    backgroundColor: '#f9f9f9',
    borderRadius: '6px',
  },
  recordButton: {
    padding: '14px 24px',
    fontSize: '16px',
    fontWeight: 'bold',
    backgroundColor: '#A50034',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  recordingButton: {
    backgroundColor: '#FF3B30',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
  },
  recordingIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#FF3B30',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  pulse: {
    width: '8px',
    height: '8px',
    backgroundColor: '#FF3B30',
    borderRadius: '50%',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
}

export default VoiceChat
