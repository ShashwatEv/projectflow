import { useState } from 'react';
import { Mail, Smartphone, Bell } from 'lucide-react';

export default function NotificationsSettings() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-1">Email Notifications</h3>
        <p className="text-sm text-gray-500 mb-6">Choose what we send to your inbox.</p>
        
        <div className="space-y-4">
          <ToggleItem 
            title="Weekly Newsletter" 
            desc="Get a summary of your team's performance every Monday." 
            defaultChecked 
          />
          <ToggleItem 
            title="New Comments" 
            desc="Receive an email when someone comments on your task." 
            defaultChecked 
          />
          <ToggleItem 
            title="Project Invites" 
            desc="Get notified when you are added to a new project." 
            defaultChecked={false} 
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-1">Push Notifications</h3>
        <p className="text-sm text-gray-500 mb-6">Real-time alerts on your desktop/mobile.</p>
        
        <div className="space-y-4">
           <ToggleItem 
            title="Mentions" 
            desc="Notify when @mentioned in a comment." 
            defaultChecked 
          />
           <ToggleItem 
            title="Task Reminders" 
            desc="Get a reminder 1 hour before a task is due." 
            defaultChecked={false} 
          />
        </div>
      </div>
    </div>
  );
}

function ToggleItem({ title, desc, defaultChecked }: { title: string, desc: string, defaultChecked: boolean }) {
  const [enabled, setEnabled] = useState(defaultChecked);

  return (
    <div className="flex items-start justify-between">
      <div>
        <h4 className="text-sm font-medium text-gray-900">{title}</h4>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
      <button 
        onClick={() => setEnabled(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-indigo-600' : 'bg-gray-200'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}