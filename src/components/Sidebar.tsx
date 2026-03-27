import { NavLink } from 'react-router-dom';
import { Rocket } from 'lucide-react';

const navItems = [
  { path: '/', label: '📊 我的看板' },
  { path: '/knowledge', label: '🗂️ 个人知识库' },
  { path: '/interview', label: '🎙️ 模拟面试' }
];

export default function Sidebar() {
  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Rocket className="text-blue-600" size={28} />
          <h1 className="text-xl font-bold text-gray-800">AI Job Tracker</h1>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
