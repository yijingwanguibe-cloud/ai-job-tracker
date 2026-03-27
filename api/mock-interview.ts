import { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';
import Fuse from 'fuse.js';

const extractKeywords = async (jdText: string, apiKey: string) => {
  try {
    console.log('  → 正在调用 DeepSeek API 提取关键词...');
    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://api.deepseek.com',
      timeout: 30000
    });

    const response = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的岗位需求分析专家。请从给定的职位描述中提取 5-10 个关键关键词，这些关键词应该包含：职位核心技能、要求的能力、行业领域、技术栈等。请用逗号分隔，不要有其他内容。'
        },
        {
          role: 'user',
          content: `请从以下职位描述中提取关键词：\n\n${jdText}`
        }
      ],
      temperature: 0.3,
      max_tokens: 200
    });

    const keywordsText = response.choices[0]?.message?.content || '';
    const keywords = keywordsText.split(/[,，\s]+/).filter(k => k.trim().length > 0);
    console.log('  ✓ 关键词提取成功:', keywords);
    return keywords;
  } catch (error: any) {
    console.warn('  ✗ 关键词提取失败，使用默认关键词:', error.message);
    return ['产品', '增长', '数据分析', '运营', '项目'];
  }
};

const filterKnowledgeBase = (knowledgeBase: any[], keywords: string[], maxResults = 3) => {
  console.log('  → 正在匹配知识库...');
  if (!knowledgeBase || knowledgeBase.length === 0) {
    console.log('  - 知识库为空');
    return [];
  }

  const searchText = keywords.join(' ');
  console.log('  - 搜索关键词:', searchText);

  const fuseOptions = {
    includeScore: true,
    threshold: 0.6,
    keys: [
      { name: 'title', weight: 0.4 },
      { name: 'content', weight: 0.4 },
      { name: 'category', weight: 0.2 }
    ]
  };

  const fuse = new Fuse(knowledgeBase, fuseOptions);
  const results = fuse.search(searchText);

  const filteredResults = results
    .slice(0, maxResults)
    .map(result => result.item);

  console.log('  ✓ 匹配到', filteredResults.length, '条知识库记录:', filteredResults.map((n: any) => n.title));
  return filteredResults;
};

const generateInterviewContent = async (jdText: string, filteredKnowledgeBase: any[], apiKey: string) => {
  console.log('  → 正在生成面试内容...');
  const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: 'https://api.deepseek.com',
    timeout: 60000
  });

  const knowledgeBaseText = filteredKnowledgeBase.length > 0
    ? filteredKnowledgeBase.map((note: any, index: number) => 
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

  console.log('  → 正在调用 DeepSeek API...');
  const response = await openai.chat.completions.create({
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
    max_tokens: 2000
  });

  const content = response.choices[0]?.message?.content || '';
  console.log('  ✓ AI 响应已收到，长度:', content.length);
  
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.log('  AI 返回内容:', content);
    throw new Error('AI返回格式不正确');
  }

  console.log('  ✓ JSON 解析成功');
  return JSON.parse(jsonMatch[0]);
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('\n==============================================');
  console.log('🚀 收到模拟面试请求');
  console.log('==============================================');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只支持 POST 请求' });
  }
  
  try {
    const { jdText, apiKey, knowledgeBase } = req.body;

    console.log('📋 JD 文本长度:', jdText?.length);
    console.log('🔑 API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : '未提供');
    console.log('📚 知识库条目数:', knowledgeBase?.length || 0);

    if (!jdText || jdText.trim().length === 0) {
      console.log('✗ 错误: JD文本为空');
      return res.status(400).json({ error: '请提供有效的JD文本' });
    }

    const useApiKey = apiKey;
    
    if (!useApiKey) {
      console.log('✗ 错误: 未提供API Key');
      return res.status(400).json({ error: '请先在设置中配置API Key' });
    }

    console.log('\nStep 1/3: 提取关键词...');
    const keywords = await extractKeywords(jdText, useApiKey);

    console.log('\nStep 2/3: 匹配知识库...');
    const filteredKnowledgeBase = filterKnowledgeBase(knowledgeBase, keywords);

    console.log('\nStep 3/3: 生成面试内容...');
    const result = await generateInterviewContent(jdText, filteredKnowledgeBase, useApiKey);

    console.log('\n==============================================');
    console.log('✅ 所有步骤完成，正在返回结果');
    console.log('==============================================\n');

    res.json(result);
  } catch (error: any) {
    console.error('\n==============================================');
    console.error('❌ 错误:', error.message);
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

    res.status(500).json({ error: errorMessage });
  }
}
