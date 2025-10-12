import { OpenAI } from 'openai'
import { OPENAI_API_KEY } from '@/config/apiKey'

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

    const { message } = req.body

    if (!message) {
      return res.status(400).json({ error: 'Message is required' })
    }
    
    console.log('User message:', message)

    // 아주 기본적인 메시지 구성
    const messages = [
      {
        role: 'system',
        content: '당신은 친절한 AI 어시스턴트입니다. 한국어로 짧게 대답해주세요.',
      },
      {
        role: 'user',
        content: message,
      },
    ]

    console.log('🔄 Calling OpenAI API...')
    
    // 가장 기본적인 API 호출
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 100,
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
