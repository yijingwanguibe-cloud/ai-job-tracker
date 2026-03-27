import { useState, useMemo } from 'react';
import { JobRecord, JobStatus } from '../types';
import { useJobStore } from '../store';
import { Eye, Trash2, Filter } from 'lucide-react';

interface JobTableProps {
  onViewDetail: (job: JobRecord) => void;
  onStartInterview: (job: JobRecord) => void;
}

const statusColors: Record<JobStatus, string> = {
  '待投递': 'bg-gray-100 text-gray-800',
  '已投递/初筛': 'bg-blue-100 text-blue-800',
  '笔试/测评': 'bg-yellow-100 text-yellow-800',
  '一面': 'bg-purple-100 text-purple-800',
  '二面': 'bg-pink-100 text-pink-800',
  '三面': 'bg-indigo-100 text-indigo-800',
  'HR面': 'bg-teal-100 text-teal-800',
  'Offer': 'bg-green-100 text-green-800',
  '已结束': 'bg-red-100 text-red-800'
};

const allStatuses: JobStatus[] = ['待投递', '已投递/初筛', '笔试/测评', '一面', '二面', '三面', 'HR面', 'Offer', '已结束'];

export default function JobTable({ onViewDetail, onStartInterview }: JobTableProps) {
  const { jobs, updateJob, deleteJob } = useJobStore();
  
  const [filters, setFilters] = useState({
    company: '',
    position: '',
    location: '',
    status: ''
  });

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const companyMatch = filters.company ? 
        job.company.toLowerCase().includes(filters.company.toLowerCase()) : true;
      const positionMatch = filters.position ? 
        job.position.toLowerCase().includes(filters.position.toLowerCase()) : true;
      const locationMatch = filters.location ? 
        job.location.toLowerCase().includes(filters.location.toLowerCase()) : true;
      const statusMatch = filters.status ? 
        job.status === filters.status : true;
      
      return companyMatch && positionMatch && locationMatch && statusMatch;
    });
  }, [jobs, filters]);

  const uniqueValues = useMemo(() => {
    return {
      companies: [...new Set(jobs.map(job => job.company))].sort(),
      locations: [...new Set(jobs.map(job => job.location))].filter(loc => loc !== '未提供').sort(),
      deliveryMethods: [...new Set(jobs.map(job => job.deliveryMethod || '未提供'))].sort()
    };
  }, [jobs]);

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      company: '',
      position: '',
      location: '',
      status: ''
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">📪 投递追踪</h2>
        <div className="flex items-center gap-3">
          <span className="text-gray-500 text-sm">总计: {filteredJobs.length} 条</span>
          {Object.values(filters).some(value => value) && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:underline"
            >
              清空筛选
            </button>
          )}
        </div>
      </div>
      
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-4 mb-3">
          <Filter size={18} className="text-gray-500" />
          <h3 className="font-medium text-gray-700">筛选条件</h3>
        </div>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">公司</label>
            <input
              type="text"
              value={filters.company}
              onChange={(e) => handleFilterChange('company', e.target.value)}
              placeholder="输入公司名称"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">岗位</label>
            <input
              type="text"
              value={filters.position}
              onChange={(e) => handleFilterChange('position', e.target.value)}
              placeholder="输入岗位名称"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">城市</label>
            <select
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全部城市</option>
              {uniqueValues.locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">投递进度</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全部进度</option>
              {allStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">公司</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">岗位</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">城市</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">投递方式</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">当前进度</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">投递时间</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500">
                  暂无符合条件的投递记录
                </td>
              </tr>
            ) : (
              filteredJobs.map((job) => (
                <tr key={job.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 text-sm text-gray-800">{job.company}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-800">{job.position}</span>
                      <div className="flex items-center gap-1">
                        {job.notes && job.notes.trim().length > 0 && (
                          <span className="text-yellow-600" title="有备注">
                            📝
                          </span>
                        )}
                        {job.interviewResult && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800" title="已有面试策略">
                            🧠
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500">{job.location}</td>
                  <td className="py-4 px-4">
                    {job.deliveryMethod && job.deliveryMethod !== '未提供' ? (
                      job.deliveryMethod.includes('@') ? (
                        <a 
                          href={`mailto:${job.deliveryMethod}`}
                          className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                          title="点击发送邮件"
                        >
                          {job.deliveryMethod}
                        </a>
                      ) : job.deliveryMethod.startsWith('http') ? (
                        <a 
                          href={job.deliveryMethod}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                          title="点击打开链接"
                        >
                          {job.deliveryMethod.length > 30 ? `${job.deliveryMethod.substring(0, 30)}...` : job.deliveryMethod}
                        </a>
                      ) : (
                        <span className="text-sm text-gray-500">{job.deliveryMethod}</span>
                      )
                    ) : (
                      <span className="text-sm text-gray-400">未提供</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <select
                      value={job.status}
                      onChange={(e) => updateJob(job.id, { status: e.target.value as JobStatus })}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border-none cursor-pointer ${statusColors[job.status]}`}
                    >
                      {allStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500">{job.applicationDate}</td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onViewDetail(job)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="查看详情"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => onStartInterview(job)}
                        className="p-1.5 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                        title="模拟面试"
                      >
                        🧠
                      </button>
                      <button
                        onClick={() => deleteJob(job.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="删除"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
