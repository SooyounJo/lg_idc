import { OpenAI } from 'openai'
import { DEFAULT_AI, CONVERSATION_CONFIG } from '@/utils/prompts'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY
    
    console.log('=== Chat API Called ===')
    console.log('API Key exists:', !!apiKey)
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'API key not configured',
        details: 'OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.'
      })
    }
    
    const openai = new OpenAI({
      apiKey: apiKey,
    })

    const { message, conversationHistory = [] } = req.body

    if (!message) {
      return res.status(400).json({ error: 'Message is required' })
    }
    
    console.log('User message:', message)

    // 퓨론 프롬프트를 사용한 메시지 구성
    const messages = [
      {
        role: 'system',
        content: DEFAULT_AI.getSystemPrompt(),
      },
      ...conversationHistory,
      {
        role: 'user',
        content: message,
      },
    ]

    console.log('🔄 Calling OpenAI API...')
    console.log('Model:', CONVERSATION_CONFIG.model)
    
    // API 호출
    const completion = await openai.chat.completions.create({
      model: CONVERSATION_CONFIG.model,
      messages: messages,
      temperature: CONVERSATION_CONFIG.temperature,
      max_tokens: CONVERSATION_CONFIG.max_tokens,
    })

    const aiResponse = completion?.choices?.[0]?.message?.content
    
    if (!aiResponse) {
      throw new Error('AI response is empty')
    }
    
    console.log('✅ AI Response:', aiResponse)

    return res.status(200).json({
      response: aiResponse,
      usage: completion.usage,
    })
  } catch (error) {
    console.error('❌ Chat error:', error)
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      type: error.type,
      code: error.code,
    })
    
    // OpenAI API 에러 처리
    if (error.status === 401) {
      return res.status(401).json({
        error: 'Invalid API key',
        details: 'OpenAI API 키가 유효하지 않습니다.',
      })
    }
    
    if (error.status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        details: 'API 사용 한도를 초과했습니다.',
      })
    }
    
    return res.status(500).json({
      error: 'Failed to get AI response',
      details: error.message,
      errorType: error.type || 'unknown',
    })
  }
}
