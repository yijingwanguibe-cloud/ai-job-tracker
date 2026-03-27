export type JobStatus = '待投递' | '已投递/初筛' | '笔试/测评' | '一面' | '二面' | '三面' | 'HR面' | 'Offer' | '已结束';

export interface InterviewQuestion {
  question: string;
  answer: string;
  warning: string;
}

export interface InterviewResult {
  introduction: string;
  interviewQuestions: InterviewQuestion[];
  createdAt: string;
}

export interface JobRecord {
  id: string;
  company: string;
  position: string;
  responsibilities: string[];
  requirements: string[];
  location: string;
  applicationDate: string;
  status: JobStatus;
  deliveryMethod: string;
  originalJD: string;
  updatedAt: string;
  interviewResult?: InterviewResult;
  notes?: string;
}

export type NoteCategory = '过往经历' | '常见面经' | '复盘反思';

export interface NoteRecord {
  id: string;
  title: string;
  category: NoteCategory;
  content: string;
  createdAt: string;
}
