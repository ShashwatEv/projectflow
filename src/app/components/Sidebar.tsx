import { LayoutDashboard, Users, Calendar, Settings } from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: Users, label: 'Team', active: false },
  { icon: Calendar, label: 'Calendar', active: false },
  { icon: Settings, label: 'Settings', active: false },
];

const projects = [
  { name: 'Website Redesign', color: 'bg-blue-500' },
  { name: 'Mobile App', color: 'bg-green-500' },
  { name: 'Marketing Campaign', color: 'bg-purple-500' },
];

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-gray-200 bg-white">
      <div className="flex h-full flex-col">
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                item.active
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}

          <div className="pt-6">
            <div className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Projects
            </div>
            <div className="space-y-1">
              {projects.map((project) => (
                <button
                  key={project.name}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <div className={`h-3 w-3 rounded-full ${project.color}`}></div>
                  <span>{project.name}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
}
