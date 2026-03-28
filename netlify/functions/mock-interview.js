const OpenAI = require('openai');

exports.handler = async (event) => {
  console.log('\n==============================================');
  console.log('🚀 收到模拟面试请求（流式模式）');
  console.log('==============================================');
  console.log('HTTP Method:', event.httpMethod);
  
  if (event.httpMethod !== 'POST') {
    console.log('✗ 错误: 只支持 POST 请求');
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: '只支持 POST 请求' })
    };
  }
  
  try {
    console.log('Parsing request body...');
    const body = event.body || '{}';
    console.log('Request body length:', body.length);
    
    const { jdText, apiKey, knowledgeBase } = JSON.parse(body);

    console.log('📋 JD 文本长度:', jdText?.length);
    console.log('🔑 API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : '未提供');
    console.log('📚 知识库条目数:', knowledgeBase?.length || 0);

    if (!jdText || jdText.trim().length === 0) {
      console.log('✗ 错误: JD文本为空');
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: '请提供有效的JD文本' })
      };
    }

    if (!apiKey || apiKey.trim().length === 0) {
      console.log('✗ 错误: 未提供API Key');
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: '请先在设置中配置API Key' })
      };
    }

    console.log('\n正在初始化 OpenAI 客户端...');
    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://api.deepseek.com',
      timeout: 300000
    });

    const knowledgeBaseText = knowledgeBase && knowledgeBase.length > 0
      ? knowledgeBase.map((note, index) => 
          `【${index + 1}】\n标题：${note.title}\n分类：${note.category}\n内容：${note.content.substring(0, 500)}${note.content.length > 500 ? '...' : ''}`
        ).join('\n\n')
      : '候选人暂无提供个人知识库内容。';

    const systemPrompt = `你是一个资深面试官和职业规划顾问。基于候选人提供的个人知识库内容和目标职位的JD，你需要：

1. 生成一段定制化的自我介绍（200-300字），要将候选人的经历与JD要求的能力紧密结合
2. 提出2道极具针对性的面试题，并给出详细的回答建议

请以严格的JSON格式返回结果，格式如下：
{
  "introduction": "定制化自我介绍内容",
  "interviewQuestions": [
    {
      "question": "第一道面试题",
      "answer": "详细的回答建议，最好使用STAR法则",
      "warning": "答题避坑提醒（如果没有可以为空字符串）"
    },
    {
      "question": "第二道面试题",
      "answer": "详细的回答建议",
      "warning": "答题避坑提醒（如果没有可以为空字符串）"
    }
  ]
}

注意：
- 只返回JSON，不要有其他任何文字说明
- 自我介绍要自然，不要太生硬
- 面试题要针对JD中的关键要求
- 回答建议要具体，有可操作性`;

    const userPrompt = `目标职位JD：
${jdText}

候选人个人知识库：
${knowledgeBaseText}

请基于以上信息，生成定制化自我介绍和2道面试题。`;

    console.log('正在调用 DeepSeek API（流式）...');
    
    const encoder = new TextEncoder();
    
    const stream = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      stream: true
    });

    console.log('Stream created, starting to forward...');

    let fullContent = '';
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      fullContent += content;
      process.stdout.write(content);
    }

    console.log('\n✓ Stream completed, full content length:', fullContent.length);
    
    const jsonMatch = fullContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.log('AI 返回内容:', fullContent);
      throw new Error('AI返回格式不正确');
    }

    console.log('✓ JSON 解析成功');
    const result = JSON.parse(jsonMatch[0]);

    console.log('\n==============================================');
    console.log('✅ 所有步骤完成，正在返回结果');
    console.log('==============================================\n');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('\n==============================================');
    console.error('❌ 错误:', error.message);
    console.error('Stack:', error.stack);
    console.error('==============================================\n');

    let errorMessage = '生成面试内容失败，请稍后重试';
    
    if (error.message.includes('API key') || error.message.includes('authentication')) {
      errorMessage = 'API Key 无效，请检查您的设置';
    } else if (error.message.includes('timeout') || error.message.includes('超时')) {
      errorMessage = '请求超时，请稍后重试';
    } else if (error.message.includes('quota') || error.message.includes('insufficient')) {
      errorMessage = 'API 额度已用完，请检查您的账户';
    } else if (error.message.includes('rate limit')) {
      errorMessage = '请求过于频繁，请稍后重试';
    }

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: errorMessage })
    };
  }
};
