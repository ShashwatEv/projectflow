// --- src/data/mockData.ts ---

export interface Project {
  id: string;
  name: string;
  status: 'In Progress' | 'Completed' | 'Delayed' | 'On Track';
  progress: number;
  dueDate: string;
  path: string;
}

export interface ProjectDetails {
  name: string;
  dueDate: string;
  status: 'In Progress' | 'Completed' | 'Delayed';
  progress: number;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: string;
  avatar: string;
  
  // DYNAMIC FIELDS
  bannerUrl?: string;
  location?: string;
  phone?: string;
  joinedDate?: string;
  status?: 'online' | 'offline' | 'busy';
  
  stats: {
    workingHours: string;
    productivity: number;
    tasksCompleted: number;
    teamVelocity: string;
    currentProject: ProjectDetails;
  };
}

// --- INITIAL DATA ---

const INITIAL_PROJECTS: Project[] = [
  { id: '1', name: 'Website Redesign', status: 'In Progress', progress: 75, dueDate: '2026-02-15', path: '/projects' },
  { id: '2', name: 'Mobile App V2', status: 'Delayed', progress: 45, dueDate: '2026-03-01', path: '/projects' },
  { id: '3', name: 'API Integration', status: 'On Track', progress: 20, dueDate: '2026-01-30', path: '/projects' },
];

const INITIAL_USERS: UserData[] = [
  {
    id: '1',
    name: 'Alex Morgan',
    email: 'alex@demo.com',
    password: '123',
    role: 'Product Designer',
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1000&q=80",
    location: "New York, USA",
    phone: "+1 (555) 123-4567",
    joinedDate: "March 2024",
    status: 'busy',
    stats: {
      workingHours: '42h',
      productivity: 94,
      tasksCompleted: 128,
      teamVelocity: '12pts',
      currentProject: { name: 'Website Redesign', dueDate: 'Jan 25, 2026', status: 'In Progress', progress: 75 }
    }
  },
  {
    id: '2', 
    name: 'Sarah Chen',
    email: 'sarah@demo.com',
    password: '123',
    role: 'Senior Developer',
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1000&q=80",
    location: "San Francisco, CA",
    phone: "+1 (555) 987-6543",
    joinedDate: "Jan 2023",
    status: 'online',
    stats: {
      workingHours: '38h',
      productivity: 98,
      tasksCompleted: 342,
      teamVelocity: '28pts',
      currentProject: { name: 'API Integration', dueDate: 'Feb 10, 2026', status: 'Delayed', progress: 40 }
    }
  }
];

// --- HELPERS ---

const getStoredUsers = (): UserData[] => {
  const stored = localStorage.getItem('pf_users');
  return stored ? JSON.parse(stored) : INITIAL_USERS;
};

// --- EXPORTS ---

export const getProjects = (): Project[] => INITIAL_PROJECTS;
export const getUsers = (): UserData[] => getStoredUsers();

export const registerUser = (user: UserData) => {
  const users = getStoredUsers();
  
  // Check if user exists
  if (users.find(u => u.email === user.email)) {
    throw new Error('User already exists');
  }
  
  // Add user and SAVE to localStorage
  const updatedUsers = [...users, user];
  localStorage.setItem('pf_users', JSON.stringify(updatedUsers));
};

export const loginUser = (email: string, password: string): UserData => {
  const users = getStoredUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) throw new Error('Invalid email or password');
  return user;
};

export const updateUser = (updatedData: Partial<UserData> & { id: string }) => {
  const users = getStoredUsers();
  const index = users.findIndex(u => u.id === updatedData.id);
  
  if (index === -1) throw new Error('User not found');

  const updatedUser = { ...users[index], ...updatedData };
  users[index] = updatedUser;
  
  localStorage.setItem('pf_users', JSON.stringify(users));
  
  // Update session if needed
  const session = localStorage.getItem('pf_session');
  if (session) {
    const currentSession = JSON.parse(session);
    if (currentSession.id === updatedUser.id) {
        localStorage.setItem('pf_session', JSON.stringify(updatedUser));
    }
  }
  
  return updatedUser;
};