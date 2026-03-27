import { JobRecord } from './types';
import { useSettingsStore } from './settingsStore';

function extractCompany(text: string): string {
  const companyKeywords = [
    { name: 'TikTok', regex: /tiktok/i },
    { name: '快手', regex: /快手/i },
    { name: '字节跳动', regex: /字节跳动|字节|抖音/i },
    { name: '腾讯', regex: /腾讯|微信|qq/i },
    { name: '阿里巴巴', regex: /阿里巴巴|阿里|淘宝|天猫|支付宝/i },
    { name: '美团', regex: /美团|美团点评/i },
    { name: '百度', regex: /百度/i },
    { name: '京东', regex: /京东/i },
    { name: '拼多多', regex: /拼多多/i }
  ];
  
  for (const company of companyKeywords) {
    if (company.regex.test(text)) {
      return company.name;
    }
  }
  return '未提供';
}

function extractPosition(text: string): string {
  const positionMatch = text.match(/岗位名称[：:]\s*([^\n]+)/) || 
                        text.match(/职位名称[：:]\s*([^\n]+)/) ||
                        text.match(/招聘岗位[：:]\s*([^\n]+)/);
  if (positionMatch) {
    return positionMatch[1].trim();
  }
  
  const lines = text.split(/\n/).filter(line => line.trim().length > 0);
  for (let line of lines) {
    line = line.trim();
    if (line.includes('实习生') || line.includes('产品') || line.includes('工程师')) {
      const separatorIndex = line.search(/[-—]/);
      if (separatorIndex !== -1) {
        const beforeSeparator = line.substring(0, separatorIndex).trim();
        const afterSeparator = line.substring(separatorIndex + 1).trim();
        if (beforeSeparator.includes('实习生') || beforeSeparator.includes('产品') || beforeSeparator.includes('工程师')) {
          return beforeSeparator;
        }
        return afterSeparator;
      }
      return line;
    }
  }
  
  const productManagerKeywords = /产品经理|产品实习生|PM/i;
  const engineerKeywords = /工程师|开发|前端|后端|全栈|算法/i;
  const internKeywords = /实习生|实习/i;
  
  if (productManagerKeywords.test(text)) {
    return internKeywords.test(text) ? '产品实习生' : '产品经理';
  }
  if (engineerKeywords.test(text)) {
    return internKeywords.test(text) ? '开发实习生' : '工程师';
  }
  return '未提供';
}

function extractResponsibilities(text: string): string[] {
  const responsibilities: string[] = [];
  const descMatch = text.match(/职位描述[\s\S]*?(?=任职要求|任职资格|岗位要求|职位要求|$)/i) ||
                   text.match(/岗位职责[\s\S]*?(?=任职要求|任职资格|岗位要求|职位要求|$)/i) ||
                   text.match(/工作内容[\s\S]*?(?=任职要求|任职资格|岗位要求|职位要求|$)/i);
  if (descMatch) {
    const descText = descMatch[0];
    const lines = descText.split(/\n/).filter(line => line.trim().length > 0);
    for (let line of lines) {
      line = line.trim();
      if (/^[1-9]、/.test(line) || /^[1-9]\./.test(line) || /^•/.test(line)) {
        const cleaned = line.replace(/^[1-9]、|^[1-9]\.|^•\s*/, '').trim();
        if (cleaned.length > 0) {
          responsibilities.push(cleaned);
        }
      }
    }
  }
  
  if (responsibilities.length === 0) {
    responsibilities.push('负责相关产品的规划与设计');
    responsibilities.push('数据分析与业务优化');
    responsibilities.push('与相关团队协作推进项目');
  }
  
  return responsibilities.slice(0, 5);
}

function extractRequirements(text: string): string[] {
  const requirements: string[] = [];
  const reqMatch = text.match(/任职要求[\s\S]*?(?=$)/i) || 
                   text.match(/任职资格[\s\S]*?(?=$)/i) ||
                   text.match(/岗位要求[\s\S]*?(?=$)/i) ||
                   text.match(/职位要求[\s\S]*?(?=$)/i);
  if (reqMatch) {
    const reqText = reqMatch[0];
    const lines = reqText.split(/\n/).filter(line => line.trim().length > 0);
    for (let line of lines) {
      line = line.trim();
      if (/^[1-9]、/.test(line) || /^[1-9]\./.test(line) || /^•/.test(line)) {
        const cleaned = line.replace(/^[1-9]、|^[1-9]\.|^•\s*/, '').trim();
        if (cleaned.length > 0) {
          requirements.push(cleaned);
        }
      }
    }
  }
  
  if (requirements.length === 0) {
    requirements.push('本科及以上学历');
    requirements.push('有相关工作经验优先');
    requirements.push('良好的沟通能力');
  }
  
  return requirements.slice(0, 5);
}

function extractLocation(text: string): string {
  const locationKeywords = [
    { name: '北京', regex: /北京/i },
    { name: '上海', regex: /上海/i },
    { name: '深圳', regex: /深圳/i },
    { name: '杭州', regex: /杭州/i },
    { name: '广州', regex: /广州/i },
    { name: '成都', regex: /成都/i },
    { name: '武汉', regex: /武汉/i },
    { name: '南京', regex: /南京/i },
    { name: '苏州', regex: /苏州/i },
    { name: '西安', regex: /西安/i }
  ];
  
  for (const loc of locationKeywords) {
    if (loc.regex.test(text)) {
      return loc.name;
    }
  }
  return '未提供';
}

function extractDeliveryMethod(text: string): string {
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
  const urlRegex = /https?:\/\/[^\s]+/g;
  
  const emails = text.match(emailRegex) || [];
  const urls = text.match(urlRegex) || [];
  
  if (emails.length > 0) {
    return emails[0];
  }
  
  if (urls.length > 0) {
    return urls[0];
  }
  
  const deliveryKeywords = [
    { name: '官网', regex: /官网|官方网站/i },
    { name: '招聘公众号', regex: /公众号|微信公众号/i },
    { name: 'BOSS直聘', regex: /boss|直聘/i },
    { name: '猎聘', regex: /猎聘/i },
    { name: '前程无忧', regex: /前程无忧|51job/i },
    { name: '智联招聘', regex: /智联|zhaopin/i },
    { name: '内推', regex: /内推|推荐|referral/i },
    { name: '实习僧', regex: /实习僧/i },
    { name: 'LinkedIn', regex: /linkedin|领英/i },
    { name: '脉脉', regex: /脉脉/i }
  ];
  
  for (const method of deliveryKeywords) {
    if (method.regex.test(text)) {
      return method.name;
    }
  }
  
  return '未提供';
}

async function callDeepSeekAPI(text: string, apiKey: string): Promise<Omit<JobRecord, 'id' | 'updatedAt'>> {
  const systemPrompt = `你是一个专业的职位信息提取助手。请从给定的职位描述（JD）中提取以下信息，并以JSON格式返回。

要求：
1. company：公司名称
2. position：职位名称
3. responsibilities：空数组 []
4. requirements：空数组 []
5. location：工作地点
6. applicationDate：投递日期，格式为YYYY-MM-DD，使用今天
7. status：固定为"待投递"
8. deliveryMethod：投递方式，**优先提取邮箱地址或官网链接**，如果没有则提取如内推、官网、BOSS直聘等，如果都没有则返回"未提供"

请严格按照JSON格式返回，不要包含任何其他说明文字。`;

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ],
      temperature: 0.3
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API请求失败: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        ...parsed,
        applicationDate: new Date().toISOString().split('T')[0],
        status: '待投递'
      };
    }
    throw new Error('无法解析API返回的JSON');
  } catch (e) {
    throw new Error('解析API返回内容失败');
  }
}

export async function mockAIParse(text: string): Promise<Omit<JobRecord, 'id' | 'updatedAt'>> {
  const apiKey = useSettingsStore.getState().deepseekApiKey;

  if (apiKey && apiKey.trim()) {
    try {
      return await callDeepSeekAPI(text, apiKey);
    } catch (error) {
      console.warn('DeepSeek API调用失败，回退到本地解析:', error);
    }
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      const mockData: Omit<JobRecord, 'id' | 'updatedAt'> = {
        company: extractCompany(text),
        position: extractPosition(text),
        responsibilities: [],
        requirements: [],
        location: extractLocation(text),
        applicationDate: new Date().toISOString().split('T')[0],
        status: '待投递',
        deliveryMethod: extractDeliveryMethod(text)
      };
      resolve(mockData);
    }, 1000);
  });
}
