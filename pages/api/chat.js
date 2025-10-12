import { OpenAI } from 'openai'
import { OPENAI_API_KEY } from '@/config/apiKey'
import { DEFAULT_AI, CONVERSATION_CONFIG } from '@/utils/prompts'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('=== Chat API Called ===')
    console.log('API Key exists:', !!OPENAI_API_KEY)
    console.log('API Key length:', OPENAI_API_KEY.length)
    
    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
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
    console.error('❌ Chat error:', error.message)
    
    return res.status(500).json({
      error: 'Failed to get AI response',
      details: error.message,
    })
  }
}
