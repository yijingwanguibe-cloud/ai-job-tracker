import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2, ArrowLeft, FileText, Copy, AlertCircle, RefreshCw, Save } from 'lucide-react';
import { JobRecord, InterviewResult as InterviewResultType } from '../types';
import { useNoteStore } from '../noteStore';
import { useSettingsStore } from '../settingsStore';
import { useJobStore } from '../store';

const steps = [
  { id: 1, text: '深度破译岗位需求中...' },
  { id: 2, text: '检索个人知识库匹配中...' },
  { id: 3, text: '生成专属面试策略中...' }
];

export default function InterviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const job = location.state?.job as JobRecord | undefined;
  const { notes } = useNoteStore();
  const { deepseekApiKey } = useSettingsStore();
  const { updateJob } = useJobStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [interviewResult, setInterviewResult] = useState<InterviewResultType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSaved, setHasSaved] = useState(false);
  const [regenerateMode, setRegenerateMode] = useState(false);
  const [manualJD, setManualJD] = useState('');
  const [showJDInput, setShowJDInput] = useState(!job);
  const [workflowExpanded, setWorkflowExpanded] = useState(false);

  const currentJD = job ? job.originalJD : manualJD;

  const startGeneration = () => {
    if (!currentJD || currentJD.trim().length === 0) {
      alert('请输入 JD 文本！');
      return;
    }

    if (!deepseekApiKey || deepseekApiKey.trim().length === 0) {
      alert('请先在看板页面设置 API Key！');
      return;
    }

    setCurrentStep(0);
    setShowResults(false);
    setInterviewResult(null);
    setIsLoading(false);
    setError(null);
    setHasSaved(false);
    setWorkflowExpanded(true);
    fetchInterviewData();
  };

  useEffect(() => {
    if (job && job.interviewResult && !regenerateMode) {
      setInterviewResult(job.interviewResult);
      setCurrentStep(3);
      setShowResults(true);
      setHasSaved(true);
      setWorkflowExpanded(false);
      return;
    }

    if (job && !job.interviewResult && deepseekApiKey) {
      setWorkflowExpanded(true);
      fetchInterviewData();
    }
  }, [job, regenerateMode, deepseekApiKey]);

  const fetchInterviewData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      setCurrentStep(1);

      const response = await fetch('/.netlify/functions/mock-interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jdText: currentJD || '',
          apiKey: deepseekApiKey,
          knowledgeBase: notes
        })
      });

      setCurrentStep(2);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '请求失败');
      }

      const resultWithTimestamp: InterviewResultType = {
        ...data,
        createdAt: new Date().toISOString()
      };

      setInterviewResult(resultWithTimestamp);
      setCurrentStep(3);
      
      setTimeout(() => {
        setShowResults(true);
        setWorkflowExpanded(false);
      }, 500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取面试数据失败，请稍后重试';
      setError(errorMessage);
      console.error('获取面试数据失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('已复制到剪贴板！');
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const handleRetry = () => {
    setError(null);
    setCurrentStep(0);
    setShowResults(false);
    setInterviewResult(null);
    setIsLoading(false);
    setWorkflowExpanded(true);
    fetchInterviewData();
  };

  const handleSave = () => {
    if (job && interviewResult) {
      const resultToSave: InterviewResultType = {
        ...interviewResult,
        createdAt: new Date().toISOString()
      };
      updateJob(job.id, { interviewResult: resultToSave });
      setHasSaved(true);
      alert('保存成功！');
    }
  };

  const handleRegenerate = () => {
    if (job) {
      setRegenerateMode(true);
      setTimeout(() => {
        setRegenerateMode(false);
      }, 0);
    } else {
      setShowJDInput(true);
      setShowResults(false);
      setInterviewResult(null);
      setCurrentStep(0);
      setHasSaved(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>返回看板</span>
      </button>

      {job ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              🎯 {job.company} - {job.position}
            </h2>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>状态: <span className="font-medium text-gray-800">{job.status}</span></span>
              <span>投递时间: <span className="font-medium text-gray-800">{job.applicationDate}</span></span>
            </div>
          </div>

          <div className="flex border-b border-gray-200">
            <button className="px-6 py-3 border-b-2 border-blue-500 text-blue-600 font-medium">
              🌟 模拟面试策略
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              🎙️ 模拟面试准备
            </h2>
            <p className="text-sm text-gray-600">
              直接输入 JD 文本，生成专属面试策略
            </p>
          </div>
        </div>
      )}

      {showJDInput && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={20} className="text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-800">输入 JD 文本</h3>
          </div>
          <textarea
            value={manualJD}
            onChange={(e) => setManualJD(e.target.value)}
            placeholder="请粘贴职位描述（JD）文本..."
            className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <div className="mt-4 flex justify-end">
            <button
              onClick={startGeneration}
              disabled={!manualJD.trim() || isLoading}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
              <span>生成面试策略</span>
            </button>
          </div>
        </div>
      )}

      {!showJDInput && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText size={20} className="text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-800">JD 原始信息</h3>
            </div>
            {job && (
              <button
                onClick={() => setShowJDInput(true)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                切换为手动输入
              </button>
            )}
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
              {currentJD || '暂无原始 JD 信息'}
            </pre>
          </div>
        </div>
      )}

      {(currentStep > 0 || workflowExpanded) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => setWorkflowExpanded(!workflowExpanded)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-800">⚙️ 工作流执行状态</h3>
              {currentStep === 3 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  已完成
                </span>
              )}
            </div>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${workflowExpanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {workflowExpanded && (
            <div className="px-6 pb-6 pt-2">
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-300 ${
                      currentStep > index + 1 ? 'bg-green-50 border border-green-200' : 
                      currentStep === index + 1 ? 'bg-blue-50 border border-blue-200' : 
                      'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {currentStep > index + 1 ? (
                        <CheckCircle2 size={24} className="text-green-500" />
                      ) : currentStep === index + 1 ? (
                        <Loader2 size={24} className="text-blue-500 animate-spin" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium ${
                        currentStep > index + 1 ? 'text-green-800' :
                        currentStep === index + 1 ? 'text-blue-800' :
                        'text-gray-500'
                      }`}>
                        Step {step.id}: {step.text}
                      </div>
                      {currentStep > index + 1 && (
                        <div className="text-sm text-green-600 mt-1">[完成]</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start gap-4">
            <AlertCircle size={24} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-800 mb-2">生成失败</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
              >
                <RefreshCw size={18} />
                <span>重新生成</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showResults && interviewResult && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="text-sm text-gray-500">
              {job && hasSaved && (
                <span className="text-green-600">✓ 已保存到岗位</span>
              )}
              {interviewResult.createdAt && (
                <span className="ml-4">
                  生成时间: {new Date(interviewResult.createdAt).toLocaleDateString('zh-CN')} {new Date(interviewResult.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRegenerate}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <RefreshCw size={18} />
                <span>重新生成</span>
              </button>
              {job && !hasSaved && (
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save size={18} />
                  <span>保存到岗位</span>
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">📝 定制化自我介绍 (结合您的经历)</h3>
              <button 
                onClick={() => handleCopy(interviewResult.introduction)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Copy size={16} />
                <span>复制口稿</span>
              </button>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-gray-800 leading-relaxed">
                "{interviewResult.introduction}"
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">❓ 预测面试题与建议答法 (Top 2)</h3>
            
            <div className="space-y-6">
              {interviewResult.interviewQuestions.map((q, index) => (
                <div key={index} className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Q{index + 1}: "{q.question}"
                  </h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-sm font-medium text-green-800 mb-1">💡 [推荐答法 {index === 0 ? '(STAR法则)' : ''}]</div>
                      <p className="text-sm text-green-700">
                        {q.answer}
                      </p>
                    </div>
                    {q.warning && (
                      <div className="p-3 bg-yellow-50 rounded-lg">
                        <div className="text-sm font-medium text-yellow-800 mb-1">⚠️ [避坑提醒]</div>
                        <p className="text-sm text-yellow-700">
                          {q.warning}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
