import React, {
    createContext,
    useState,
    useEffect,
    useContext,
    useMemo,
    useCallback,
  } from 'react';
  import {
    // Change: Import HashRouter and alias it as Router
    HashRouter as Router,
    Routes,
    Route,
    Navigate,
    useNavigate,
    useParams,
    Link,
    useLocation,
  } from 'react-router-dom';
  import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
  } from 'recharts';
  import { format, parseISO, differenceInDays, eachDayOfInterval, startOfDay } from 'date-fns';
  
  // Import global CSS
  import './global.css';
  
  // Import CSS Modules
  import layoutStyles from './Layout.module.css';
  import uiStyles from './UIComponents.module.css';
  import pageStyles from './Pages.module.css';
  import taskStyles from './TaskComponents.module.css';
  
  
  // --- Mock Data (Simulating JSON files) ---
  const mockUsers = [
  {
    id: 'dev1',
    username: 'developer',
    password: 'password', // WARNING: Never store plain text passwords in real apps! Hash them.
    name: 'Alice Developer',
    role: 'Developer',
    team: 'Alpha',
  },
  {
    id: 'dev2',
    username: 'dev2',
    password: 'password',
    name: 'Bob Coder',
    role: 'Developer',
    team: 'Beta',
  },
  {
    id: 'mgr1',
    username: 'manager',
    password: 'password',
    name: 'Charlie Manager',
    role: 'Manager',
  },
  ];
  
  const mockTasks = [
  {
    id: 'task-001',
    title: 'Implement Login Page UI',
    description:
      'Create the user interface for the login page based on the design mockups. Ensure it is responsive and includes input fields for username and password, along with a submit button.',
    priority: 'High', // High, Medium, Low
    status: 'In Progress', // Open, In Progress, Pending Approval, Closed, Reopened
    assigneeId: 'dev1',
    reporterId: 'mgr1',
    project: 'BugTracker App',
    type: 'Task', // Bug, Task, Feature
    createdAt: '2025-04-28T10:00:00Z',
    updatedAt: '2025-04-30T14:20:00Z',
    dueDate: '2025-05-05T17:00:00Z',
    closedAt: null, // Track when a task was actually closed
    timeLogs: [
      {
        logId: 'log-01',
        userId: 'dev1',
        timeSpent: 2.5, // in hours
        dateLogged: '2025-04-29T15:00:00Z',
        comment: 'Initial setup and layout.',
      },
      {
        logId: 'log-02',
        userId: 'dev1',
        timeSpent: 3.0,
        dateLogged: '2025-04-30T11:00:00Z',
        comment: 'Added form elements.',
      },
    ],
    history: [ // Track status changes
        { status: 'Open', changedAt: '2025-04-28T10:00:00Z', userId: 'mgr1' },
        { status: 'In Progress', changedAt: '2025-04-29T09:30:00Z', userId: 'dev1' },
    ],
  },
  {
    id: 'task-002',
    title: 'Fix Button Alignment on Mobile',
    description:
      'The main action button on the dashboard is misaligned on screens smaller than 480px. It needs to be centered.',
    priority: 'Medium',
    status: 'Open',
    assigneeId: 'dev2',
    reporterId: 'dev1',
    project: 'BugTracker App',
    type: 'Bug',
    createdAt: '2025-04-30T09:15:00Z',
    updatedAt: '2025-04-30T09:15:00Z',
    dueDate: null,
    closedAt: null,
    timeLogs: [],
     history: [
        { status: 'Open', changedAt: '2025-04-30T09:15:00Z', userId: 'dev1' },
    ],
  },
  {
    id: 'task-003',
    title: 'Setup Database Schema',
    description:
      'Define and implement the database schema for tasks, users, and projects using PostgreSQL.',
    priority: 'High',
    status: 'Pending Approval',
    assigneeId: 'dev1',
    reporterId: 'mgr1',
    project: 'Backend Services',
    type: 'Task',
    createdAt: '2025-04-25T11:00:00Z',
    updatedAt: '2025-04-30T16:05:00Z', // Last update time
    dueDate: '2025-05-02T17:00:00Z',
    closedAt: null,
    timeLogs: [
      {
        logId: 'log-03',
        userId: 'dev1',
        timeSpent: 8.0,
        dateLogged: '2025-04-28T17:00:00Z',
        comment: 'Completed schema design and implementation.',
      },
      {
        logId: 'log-04',
        userId: 'dev1',
        timeSpent: 1.5,
        dateLogged: '2025-04-30T16:00:00Z',
        comment: 'Final review and documentation.',
      },
    ],
     history: [
        { status: 'Open', changedAt: '2025-04-25T11:00:00Z', userId: 'mgr1' },
        { status: 'In Progress', changedAt: '2025-04-26T10:00:00Z', userId: 'dev1' },
        { status: 'Pending Approval', changedAt: '2025-04-30T16:05:00Z', userId: 'dev1' }, // When dev submitted for approval
    ],
  },
   {
    id: 'task-004',
    title: 'Deploy Frontend to Vercel',
    description:
      'Configure and deploy the React frontend application to Vercel.',
    priority: 'Medium',
    status: 'Closed',
    assigneeId: 'dev2',
    reporterId: 'mgr1',
    project: 'BugTracker App',
    type: 'Task',
    createdAt: '2025-04-27T14:00:00Z',
    updatedAt: '2025-04-29T11:30:00Z',
    dueDate: '2025-04-30T17:00:00Z',
    closedAt: '2025-04-29T11:30:00Z', // When manager approved closure
    timeLogs: [
        { logId: 'log-05', userId: 'dev2', timeSpent: 4.0, dateLogged: '2025-04-28T10:00:00Z', comment: 'Initial setup and deployment.' },
    ],
     history: [
        { status: 'Open', changedAt: '2025-04-27T14:00:00Z', userId: 'mgr1' },
        { status: 'In Progress', changedAt: '2025-04-28T09:00:00Z', userId: 'dev2' },
        { status: 'Pending Approval', changedAt: '2025-04-29T10:00:00Z', userId: 'dev2' },
        { status: 'Closed', changedAt: '2025-04-29T11:30:00Z', userId: 'mgr1' }, // Manager closed it
    ],
  },
  ];
  
  // --- Utility Functions ---
  // Simple unique ID generator
  const generateId = (prefix = 'id') => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  
  // Format date strings nicely
  const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return 'N/A';
  try {
    const date = parseISO(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    // Use a specific locale for consistency if needed, otherwise rely on browser default
    return date.toLocaleDateString(undefined, options);
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return 'Invalid Date';
  }
  };
  
  // Calculate total time spent from logs
  const calculateTotalTime = (timeLogs = []) => {
    return timeLogs.reduce((total, log) => total + (log.timeSpent || 0), 0);
  };
  
  
  // --- Services (Simulating API calls) ---
  const authService = {
  login: async (username, password) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    const user = mockUsers.find(u => u.username === username && u.password === password);
    if (user) {
      // IMPORTANT: Never send the password back in a real API response!
      const { password, ...userData } = user;
      return userData;
    } else {
      throw new Error('Invalid credentials');
    }
  },
  // logout is handled client-side in this mock setup
  };
  
  const taskService = {
  // Using closures to keep track of tasks in memory
  _tasks: [...mockTasks.map(t => ({...t, totalTimeSpent: calculateTotalTime(t.timeLogs)}))], // Start with a deep copy and calculated time
  
  getTasks: async () => {
    await new Promise(resolve => setTimeout(resolve, 400)); // Simulate delay
    // Return a deep copy to prevent direct mutation outside the service
    return JSON.parse(JSON.stringify(taskService._tasks));
  },
  
  getTaskById: async (taskId) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const task = taskService._tasks.find(t => t.id === taskId);
    // Return a deep copy
    return task ? JSON.parse(JSON.stringify(task)) : null;
  },
  
  createTask: async (taskData, userId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newTask = {
      ...taskData,
      id: generateId('task'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reporterId: userId,
      status: 'Open', // Default status
      timeLogs: [],
      totalTimeSpent: 0,
      closedAt: null,
      history: [{ status: 'Open', changedAt: new Date().toISOString(), userId: userId }],
    };
    taskService._tasks.push(newTask);
    return JSON.parse(JSON.stringify(newTask)); // Return deep copy
  },
  
  updateTask: async (taskId, updateData, userId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const taskIndex = taskService._tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) throw new Error('Task not found');
  
    const originalTask = taskService._tasks[taskIndex];
    const updatedTask = {
      ...originalTask,
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
  
    // Track status change in history if status is updated
    if (updateData.status && updateData.status !== originalTask.status) {
        updatedTask.history = [
            ...(originalTask.history || []),
            { status: updateData.status, changedAt: updatedTask.updatedAt, userId: userId }
        ];
        // Set closedAt timestamp if status is 'Closed'
        if (updateData.status === 'Closed') {
            updatedTask.closedAt = updatedTask.updatedAt;
        } else {
            // Ensure closedAt is null if reopened or moved to another status
            updatedTask.closedAt = null;
        }
    }
  
  
    taskService._tasks[taskIndex] = updatedTask;
    return JSON.parse(JSON.stringify(updatedTask)); // Return deep copy
  },
  
  deleteTask: async (taskId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const initialLength = taskService._tasks.length;
    taskService._tasks = taskService._tasks.filter(t => t.id !== taskId);
    if (taskService._tasks.length === initialLength) {
      throw new Error('Task not found for deletion');
    }
    return true; // Indicate success
  },
  
  logTime: async (taskId, timeLogData, userId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const taskIndex = taskService._tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) throw new Error('Task not found');
  
    const task = taskService._tasks[taskIndex];
    const newLog = {
        ...timeLogData,
        logId: generateId('log'),
        userId: userId,
        dateLogged: new Date().toISOString(),
    };
  
    task.timeLogs = [...(task.timeLogs || []), newLog];
    task.totalTimeSpent = calculateTotalTime(task.timeLogs); // Recalculate total time
    task.updatedAt = new Date().toISOString();
  
    taskService._tasks[taskIndex] = task; // Update the task in the main array
    return JSON.parse(JSON.stringify(task)); // Return updated task (deep copy)
  }
  };
  
  
  // --- Contexts ---
  // Authentication Context
  const AuthContext = createContext(null);
  
  export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Check initial auth status
  
  // Check local storage on initial load
  useEffect(() => {
    try {
        const storedUser = localStorage.getItem('authUser_bugTracker');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    } catch (error) {
        console.error("Failed to parse auth user from localStorage", error);
        localStorage.removeItem('authUser_bugTracker'); // Clear corrupted data
    } finally {
        setLoading(false);
    }
  }, []);
  
  const login = useCallback(async (username, password) => {
    setLoading(true);
    try {
      const userData = await authService.login(username, password);
      setUser(userData);
      localStorage.setItem('authUser_bugTracker', JSON.stringify(userData));
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      setUser(null); // Ensure user is null on failure
      localStorage.removeItem('authUser_bugTracker');
      setLoading(false);
      throw error; // Re-throw error to be caught in component
    }
  }, []);
  
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('authUser_bugTracker');
    // Navigation to /login is handled by ProtectedRoute or explicit navigation
  }, []);
  
  const value = useMemo(() => ({
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user
  }), [user, loading, login, logout]);
  
  // Render children only after initial loading is complete
  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : <LoadingSpinner fullPage={true} />}
    </AuthContext.Provider>
  );
  };
  
  // Custom hook for easy access to AuthContext
  export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
  };
  
  
  // Task Context
  const TaskContext = createContext(null);
  
  export const TaskProvider = ({ children }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useAuth(); // Get current user for actions
  
    const fetchTasks = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await taskService.getTasks();
            setTasks(data);
        } catch (err) {
            console.error("Failed to fetch tasks:", err);
            setError(err.message || 'Failed to load tasks.');
        } finally {
            setLoading(false);
        }
    }, []);
  
    // Fetch tasks initially when the provider mounts
    useEffect(() => {
        // Only fetch if user context is loaded and potentially authenticated
        // This prevents fetching before auth state is known
        if (user !== undefined) { // Check if auth context is resolved
             fetchTasks();
        }
    }, [fetchTasks, user]); // Depend on user state from auth context
  
    const getTaskById = useCallback(async (taskId) => {
        setLoading(true);
        setError(null);
        try {
            const task = await taskService.getTaskById(taskId);
            if (!task) throw new Error(`Task with ID ${taskId} not found.`);
            setLoading(false);
            return task;
        } catch (err) {
             console.error(`Failed to fetch task ${taskId}:`, err);
             setError(err.message || `Failed to load task ${taskId}.`);
             setLoading(false);
             throw err; // Re-throw to be caught in component
        }
    }, []);
  
  
    const addTask = useCallback(async (taskData) => {
        if (!user) throw new Error("User must be logged in to add tasks");
        setLoading(true);
        setError(null);
        try {
            const newTask = await taskService.createTask(taskData, user.id);
            setTasks(prevTasks => [...prevTasks, newTask]); // Add to local state
            return newTask; // Return the created task
        } catch (err) {
            console.error("Failed to add task:", err);
            setError(err.message || 'Failed to create task.');
            throw err; // Re-throw to handle in component
        } finally {
            setLoading(false);
        }
    }, [user]); // Depends on the logged-in user
  
    const updateTask = useCallback(async (taskId, updateData) => {
        if (!user) throw new Error("User must be logged in to update tasks");
        setLoading(true);
        setError(null);
        try {
            const updatedTask = await taskService.updateTask(taskId, updateData, user.id);
            setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? updatedTask : t));
             return updatedTask; // Return the updated task
        } catch (err) {
            console.error("Failed to update task:", err);
            setError(err.message || 'Failed to update task.');
            throw err; // Re-throw
        } finally {
            setLoading(false);
        }
    }, [user]);
  
    const deleteTask = useCallback(async (taskId) => {
        if (!user) throw new Error("User must be logged in to delete tasks");
        setLoading(true);
        setError(null);
        try {
            await taskService.deleteTask(taskId);
            setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
        } catch (err) {
            console.error("Failed to delete task:", err);
            setError(err.message || 'Failed to delete task.');
             throw err; // Re-throw
        } finally {
            setLoading(false);
        }
    }, [user]);
  
    const logTime = useCallback(async (taskId, timeLogData) => {
        if (!user) throw new Error("User must be logged in to log time");
        setLoading(true);
        setError(null);
        try {
            const updatedTask = await taskService.logTime(taskId, timeLogData, user.id);
            // Update the specific task in the state
            setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? updatedTask : t));
             return updatedTask; // Return the updated task
        } catch (err) {
            console.error("Failed to log time:", err);
            setError(err.message || 'Failed to log time.');
             throw err; // Re-throw
        } finally {
            setLoading(false);
        }
    }, [user]);
  
  
    const value = useMemo(() => ({
        tasks,
        loading,
        error,
        fetchTasks,
        getTaskById,
        addTask,
        updateTask,
        deleteTask,
        logTime,
    }), [tasks, loading, error, fetchTasks, getTaskById, addTask, updateTask, deleteTask, logTime]);
  
    return (
        <TaskContext.Provider value={value}>
            {children}
        </TaskContext.Provider>
    );
  };
  
  // Custom hook for easy access to TaskContext
  export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
  };
  
  
  // --- Common UI Components ---
  const LoadingSpinner = ({ fullPage = false }) => (
  // Replaced Tailwind classes with CSS Module classes
  <div className={`${uiStyles.loadingSpinnerContainer} ${fullPage ? uiStyles.loadingSpinnerFullPage : ''}`}>
    <div className={uiStyles.loadingSpinner}></div>
  </div>
  );
  
  const Button = ({ children, onClick, type = 'button', variant = 'primary', className = '', disabled = false, ...props }) => {
  // Replaced Tailwind classes with CSS Module classes and conditional logic for variants
  const buttonClasses = `${uiStyles.button} ${uiStyles[`button${variant.charAt(0).toUpperCase() + variant.slice(1)}`]} ${className}`;
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={buttonClasses}
      {...props}
    >
      {children}
    </button>
  );
  };
  
  const Input = ({ label, id, type = 'text', value, onChange, placeholder, error, required = false, className = '', ...props }) => (
    // Replaced Tailwind classes with CSS Module classes
    <div className={`${uiStyles.inputGroup} ${className}`}>
        {label && <label htmlFor={id} className={uiStyles.inputLabel}>{label}{required && <span className={uiStyles.requiredIndicator}>*</span>}</label>}
        <input
            type={type}
            id={id}
            name={id} // Ensure name attribute is present for forms
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className={`${uiStyles.inputField} ${error ? uiStyles.inputError : ''}`}
            {...props}
        />
        {error && <p className={uiStyles.errorMessage}>{error}</p>}
    </div>
  );
  
  const Select = ({ label, id, value, onChange, options = [], placeholder, error, required = false, className = '', ...props }) => (
    // Replaced Tailwind classes with CSS Module classes
    <div className={`${uiStyles.selectGroup} ${className}`}>
        {label && <label htmlFor={id} className={uiStyles.selectLabel}>{label}{required && <span className={uiStyles.requiredIndicator}>*</span>}</label>}
        <select
            id={id}
            name={id} // Ensure name attribute is present for forms
            value={value}
            onChange={onChange}
            required={required}
            className={`${uiStyles.selectField} ${error ? uiStyles.selectError : ''}`}
            {...props}
        >
            {placeholder && <option value="" disabled>{placeholder}</option>}
            {options.map(option => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
        {error && <p className={uiStyles.errorMessage}>{error}</p>}
    </div>
  );
  
  const Textarea = ({ label, id, value, onChange, placeholder, error, required = false, rows = 4, className = '', ...props }) => (
    // Replaced Tailwind classes with CSS Module classes
    <div className={`${uiStyles.textareaGroup} ${className}`}>
        {label && <label htmlFor={id} className={uiStyles.textareaLabel}>{label}{required && <span className={uiStyles.requiredIndicator}>*</span>}</label>}
        <textarea
            id={id}
            name={id} // Ensure name attribute is present for forms
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            rows={rows}
            className={`${uiStyles.textareaField} ${error ? uiStyles.textareaError : ''}`}
            {...props}
        />
        {error && <p className={uiStyles.errorMessage}>{error}</p>}
    </div>
  );
  
  // const Modal = ({ isOpen, onClose, title, children }) => { ... }; // Still commented out
  
  
  // --- Layout Components ---
  const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirect to login after logout (path is correct for HashRouter)
  };
  
  return (
    // Replaced Tailwind classes with CSS Module classes
    <header className={layoutStyles.header}>
      <nav className={layoutStyles.navbar}>
        <div className={layoutStyles.navbarContent}>
          <div className={layoutStyles.siteTitle}>
             {/* Path is correct for HashRouter */}
             <Link to={isAuthenticated ? "/dashboard" : "/login"} className={layoutStyles.siteTitleLink}>
               FealtyX Tracker
             </Link>
          </div>
          <div className={layoutStyles.authControls}>
            {isAuthenticated && user ? (
              <>
                <span className={layoutStyles.welcomeMessage}>Welcome, {user.name} ({user.role})</span>
                <Button onClick={handleLogout} variant="secondary" className={uiStyles.buttonSmall}>
                  Logout
                </Button>
              </>
            ) : (
              // Path is correct for HashRouter
              <Link to="/login">
                 <Button variant="primary" className={uiStyles.buttonSmall}>Login</Button>
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
  };
  
  // Protected Route Component
  const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return <LoadingSpinner fullPage={true} />; // Show loading indicator while checking auth
  }
  
  if (!isAuthenticated) {
    // Redirect to login, saving the current location to redirect back after login
    // Path is correct for HashRouter
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Check role if requiredRole is provided
  if (requiredRole && user?.role !== requiredRole) {
    // User is logged in but doesn't have the required role
    console.warn(`Unauthorized access attempt to ${location.pathname} by user ${user?.id} with role ${user?.role}. Required: ${requiredRole}`);
    // Redirect to a safe page, like dashboard
    // Path is correct for HashRouter
    return <Navigate to="/dashboard" replace />;
  }
  
  // User is authenticated and authorized (if role check passed)
  return children;
  };
  
  
  // --- Specific Components (Dashboard, Tasks, etc.) ---
  const TaskItem = ({ task, userRole }) => {
    const navigate = useNavigate();
    const { deleteTask } = useTasks(); // Use task context for actions
    const { user } = useAuth();
  
    // Define color classes based on priority and status
    const priorityColorClass = {
        High: taskStyles.priorityHigh,
        Medium: taskStyles.priorityMedium,
        Low: taskStyles.priorityLow,
    };
     const statusColorClass = {
        Open: taskStyles.statusOpen,
        'In Progress': taskStyles.statusInProgress,
        'Pending Approval': taskStyles.statusPendingApproval,
        Closed: taskStyles.statusClosed,
        Reopened: taskStyles.statusReopened,
    };
  
    const handleDelete = async (e) => {
        e.stopPropagation(); // Prevent navigation when clicking delete
        if (window.confirm(`Are you sure you want to delete task "${task.title}"?`)) {
            try {
                await deleteTask(task.id);
                // Optionally show a success message
            } catch (error) {
                alert(`Failed to delete task: ${error.message}`);
            }
        }
    };
  
    // Example delete condition (adjust as needed)
    const canDelete = userRole === 'Developer' && task.assigneeId === user.id && ['Open', 'Reopened'].includes(task.status);
  
    // Path is correct for HashRouter
    const handleNavigate = () => navigate(`/tasks/${task.id}`);
  
    return (
        // Replaced Tailwind classes with CSS Module classes
        <div
            className={taskStyles.taskItem}
            onClick={handleNavigate}
            role="link"
            tabIndex={0} // Make it focusable
            onKeyPress={(e) => e.key === 'Enter' && handleNavigate()} // Allow keyboard navigation
        >
            <div className={taskStyles.taskItemHeader}>
                <h3 className={taskStyles.taskItemTitle}>{task.title}</h3>
                 <span className={`${taskStyles.taskItemStatus} ${statusColorClass[task.status] || taskStyles.statusDefault}`}>
                    {task.status}
                </span>
            </div>
            <p className={taskStyles.taskItemDescription}>{task.description}</p> {/* Limits description lines */}
            <div className={taskStyles.taskItemDetails}>
                <span className={`${taskStyles.taskItemPriority} ${priorityColorClass[task.priority] || taskStyles.priorityDefault}`}>
                    Priority: {task.priority}
                </span>
                <span>Type: {task.type}</span>
                <span>Assignee: {mockUsers.find(u => u.id === task.assigneeId)?.name || 'Unassigned'}</span>
                <span>Created: {formatDate(task.createdAt)}</span>
                 {task.dueDate && <span>Due: {formatDate(task.dueDate)}</span>}
                 <span>Time Logged: {task.totalTimeSpent?.toFixed(1) || '0.0'} hrs</span>
                 {canDelete && (
                     <Button
                        onClick={handleDelete}
                        variant="danger"
                        // Use smaller button for inline actions
                        className={`${uiStyles.buttonSmall} ${taskStyles.taskItemDeleteButton}`} // Position delete button if needed
                     >
                         Delete
                     </Button>
                 )}
            </div>
        </div>
    );
  };
  
  const TaskFilterSort = ({ onFilterChange, onSortChange, initialFilters = {}, initialSort = { key: 'createdAt', direction: 'desc' } }) => {
    const [filters, setFilters] = useState(initialFilters);
    const [sort, setSort] = useState(initialSort);
    const { user } = useAuth(); // Needed for assignee options maybe
  
    const handleFilterInputChange = (e) => {
      console.log('hiii')
        const { name, value } = e.target;
        const newFilters = { ...filters, [name]: value };
        setFilters(newFilters);
        onFilterChange(newFilters); // Trigger filter update in parent
    };
  
    const handleSortChange = (e) => {
        const { value } = e.target;
        const [key, direction] = value.split('-');
        const newSort = { key, direction };
        setSort(newSort);
        onSortChange(newSort); // Trigger sort update in parent
    };
  
    // Define options for filters and sorting
    const statusOptions = [
        { value: '', label: 'All Statuses' },
        { value: 'Open', label: 'Open' },
        { value: 'In Progress', label: 'In Progress' },
        { value: 'Pending Approval', label: 'Pending Approval' },
        { value: 'Closed', label: 'Closed' },
        { value: 'Reopened', label: 'Reopened' },
    ];
  
    const priorityOptions = [
        { value: '', label: 'All Priorities' },
        { value: 'High', label: 'High' },
        { value: 'Medium', label: 'Medium' },
        { value: 'Low', label: 'Low' },
    ];
  
     const assigneeOptions = useMemo(() => [ // Use useMemo if mockUsers could change (though unlikely here)
        { value: '', label: 'All Assignees' },
        ...mockUsers.filter(u => u.role === 'Developer').map(dev => ({ value: dev.id, label: dev.name })),
    ], []); // Empty dependency array means it runs once
  
    const sortOptions = [
        { value: 'createdAt-desc', label: 'Created Date (Newest)' },
        { value: 'createdAt-asc', label: 'Created Date (Oldest)' },
        { value: 'updatedAt-desc', label: 'Last Updated (Newest)' },
        { value: 'updatedAt-asc', label: 'Last Updated (Oldest)' },
        { value: 'priority-desc', label: 'Priority (High-Low)' }, // Needs custom sort logic in parent
        { value: 'priority-asc', label: 'Priority (Low-High)' }, // Needs custom sort logic in parent
        { value: 'dueDate-asc', label: 'Due Date (Soonest)' },
        { value: 'dueDate-desc', label: 'Due Date (Latest)' },
    ];
  
    return (
        // Replaced Tailwind classes with CSS Module classes
        <div className={taskStyles.filterSortContainer}>
            <div className={taskStyles.filterSortGrid}>
                <Select
                    label="Status"
                    id="status"
                    name="status"
                    value={filters.status || ''}
                    onChange={handleFilterInputChange}
                    options={statusOptions}
                    className={uiStyles.inputGroupNoMargin} // Remove margin bottom for grid layout
                />
                <Select
                    label="Priority"
                    id="priority"
                    name="priority"
                    value={filters.priority || ''}
                    onChange={handleFilterInputChange}
                    options={priorityOptions}
                    className={uiStyles.inputGroupNoMargin}
                />
                 {/* Only show Assignee filter for Managers */}
                 {user?.role === 'Manager' && (
                    <Select
                        label="Assignee"
                        id="assigneeId"
                        name="assigneeId"
                        value={filters.assigneeId || ''}
                        onChange={handleFilterInputChange}
                        options={assigneeOptions}
                        className={uiStyles.inputGroupNoMargin}
                    />
                 )}
                 <Select
                    label="Sort By"
                    id="sort"
                    name="sort"
                    value={`${sort.key}-${sort.direction}`}
                    onChange={handleSortChange}
                    options={sortOptions}
                    className={uiStyles.inputGroupNoMargin}
                 />
            </div>
        </div>
    );
  };
  
  const TaskList = ({ tasks = [], userRole }) => {
  
    if (!tasks || tasks.length === 0) {
        // Replaced Tailwind classes with CSS Module classes
        return <p className={taskStyles.taskListEmptyMessage}>No tasks match the current filters.</p>;
    }
  
    return (
        // Replaced Tailwind classes with CSS Module classes
        <div className={taskStyles.taskList}> {/* Add space between items */}
            {tasks.map(task => (
                <TaskItem key={task.id} task={task} userRole={userRole} />
            ))}
        </div>
    );
  };
  
  const TrendChart = ({ tasks = [] }) => {
    const chartData = useMemo(() => {
        if (!tasks || tasks.length === 0) return [];
  
        // Find the earliest task creation date and latest relevant date (today or latest update/close)
        const allDates = tasks.flatMap(t => [
            t.createdAt ? parseISO(t.createdAt) : null,
            t.closedAt ? parseISO(t.closedAt) : null,
            t.updatedAt ? parseISO(t.updatedAt) : null // Consider updates too
        ]).filter(d => d && !isNaN(d.getTime())); // Remove nulls and invalid dates
  
        if (allDates.length === 0) return []; // No valid dates found
  
        allDates.push(new Date()); // Include today
  
        const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
        const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
  
        let startDate = startOfDay(minDate); // Ensure we start at the beginning of the day
        let endDate = startOfDay(maxDate);   // Ensure we end at the beginning of the day
  
        // If range is too small, create a default range (e.g., last 7 days)
        if (differenceInDays(endDate, startDate) < 1) {
           endDate = startOfDay(new Date()); // Today
           startDate = startOfDay(new Date(endDate.getTime() - 6 * 24 * 60 * 60 * 1000)); // 6 days before today
        } else if (differenceInDays(endDate, startDate) < 6) {
            // Extend range slightly if valid but short (ensure at least 7 days)
            const daysToAdd = 6 - differenceInDays(endDate, startDate);
            startDate = startOfDay(new Date(startDate.getTime() - Math.floor(daysToAdd / 2) * 24 * 60 * 60 * 1000));
            endDate = startOfDay(new Date(endDate.getTime() + Math.ceil(daysToAdd / 2) * 24 * 60 * 60 * 1000));
        }
  
        // Generate all days in the interval
        let dateInterval = [];
        try {
            dateInterval = eachDayOfInterval({ start: startDate, end: endDate });
        } catch (e) {
             console.error("Error generating date interval:", e, {start: startDate, end: endDate});
             return []; // Return empty if interval generation fails
        }
  
  
        // Calculate concurrent tasks for each day
        const dailyCounts = dateInterval.map(day => {
            const dayStart = startOfDay(day); // Start of the current day in the loop
            let concurrentTasks = 0;
  
            tasks.forEach(task => {
                try {
                    if (!task.createdAt) return; // Skip tasks without creation date
                    const createdAt = parseISO(task.createdAt);
                    if (isNaN(createdAt.getTime())) return; // Skip tasks with invalid creation date
  
                    // A task is considered active on 'day' if:
                    // 1. It was created on or before the start of 'day'
                    // 2. AND (it's not closed OR it was closed strictly *after* the start of 'day')
                    const isCreatedBeforeOrOn = createdAt <= dayStart;
                    let isActive = false;
  
                    if (isCreatedBeforeOrOn) {
                        if (task.status !== 'Closed') {
                             isActive = true; // Active if not closed
                        } else if (task.closedAt) {
                             const closedAt = parseISO(task.closedAt);
                             // Active only if closed *after* the start of the day we are checking
                             if (!isNaN(closedAt.getTime()) && closedAt > dayStart) {
                                 isActive = true;
                             }
                        }
                        // If status is 'Closed' but no valid closedAt date, assume inactive for that day.
                    }
  
                    if (isActive) {
                        concurrentTasks++;
                    }
                } catch (e) {
                    // Log errors for individual tasks/dates but continue processing others
                    // console.warn(`Error processing task ${task?.id} for date ${day}:`, e);
                }
            });
  
            return {
                date: format(day, 'yyyy-MM-dd'), // Format for X-axis label and key
                concurrentTasks: concurrentTasks,
            };
        });
  
        return dailyCounts;
  
    }, [tasks]); // Recalculate only when tasks array changes
  
     if (chartData.length === 0) {
        // Replaced Tailwind classes with CSS Module classes
        return <p className={taskStyles.trendChartEmptyMessage}>Not enough data to display trend.</p>;
    }
  
    return (
        // Replaced Tailwind classes with CSS Module classes
        <div className={taskStyles.trendChartContainer}>
            <h3 className={taskStyles.trendChartTitle}>Active Tasks Over Time</h3>
            {/* Ensure container has a defined height for ResponsiveContainer to work */}
            <div style={{ height: '350px' }}> {/* Keep inline style for height */}
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 0, bottom: 50 }} // Increased bottom margin for angled labels
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={(dateStr) => format(parseISO(dateStr), 'MMM d')} // Format ticks nicely
                            angle={-45} // Angle ticks for better readability
                            textAnchor="end" // Align angled text correctly
                            // Dynamically adjust interval to prevent overcrowding, show ~7 ticks max
                            interval={Math.max(0, Math.floor(chartData.length / 7))}
                            height={60} // Allocate space for angled labels
                            tick={{ fontSize: 10 }} // Smaller font size for ticks
                        />
                        <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                        <Tooltip
                            labelFormatter={(label) => format(parseISO(label), 'EEE, MMM d, yyyy')} // Full date in tooltip
                            contentStyle={{ fontSize: 12, padding: '4px 8px', borderRadius: '4px' }}
                         />
                        <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: 12, marginBottom: '10px' }} />
                        <Line
                            type="monotone"
                            dataKey="concurrentTasks"
                            name="Active Tasks"
                            stroke="#3b82f6" // Blue color
                            strokeWidth={2}
                            dot={{ r: 3 }} // Small dots on data points
                            activeDot={{ r: 6 }} // Larger dot on hover
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
  };
  
  const TaskForm = ({ initialTask = null, onSubmit, onCancel, availableUsers = [] }) => {
    const { user } = useAuth();
    const isEditing = !!initialTask;
  
    // Initialize form state
    const [formData, setFormData] = useState({
        title: initialTask?.title || '',
        description: initialTask?.description || '',
        priority: initialTask?.priority || 'Medium',
        // Status: Default depends on whether creating or editing, and user role
        status: initialTask?.status || (user?.role === 'Developer' ? 'Open' : 'Open'), // Dev default Open, Mgr default Open
        assigneeId: initialTask?.assigneeId || (user?.role === 'Developer' ? user.id : ''), // Dev defaults to self on create
        project: initialTask?.project || '',
        type: initialTask?.type || 'Task',
        // Format date for input type="date" which expects 'yyyy-MM-dd'
        dueDate: initialTask?.dueDate ? format(parseISO(initialTask.dueDate), 'yyyy-MM-dd') : '',
    });
    const [errors, setErrors] = useState({});
  
    // Memoize options to avoid recalculation on every render
    const assigneeOptions = useMemo(() => [
        { value: '', label: 'Select Assignee' },
        ...availableUsers
            .filter(u => u.role === 'Developer')
            .map(u => ({ value: u.id, label: u.name }))
    ], [availableUsers]);
  
    const priorityOptions = useMemo(() => [
        { value: 'Low', label: 'Low' },
        { value: 'Medium', label: 'Medium' },
        { value: 'High', label: 'High' },
    ], []);
  
    const typeOptions = useMemo(() => [
        { value: 'Task', label: 'Task' },
        { value: 'Bug', label: 'Bug' },
        { value: 'Feature', label: 'Feature' },
    ], []);
  
    // Status options depend on user role and current task status (simplified workflow)
    const statusOptions = useMemo(() => {
        const allStatuses = [
            { value: 'Open', label: 'Open' },
            { value: 'In Progress', label: 'In Progress' },
            { value: 'Pending Approval', label: 'Pending Approval' },
            { value: 'Closed', label: 'Closed' },
            { value: 'Reopened', label: 'Reopened' },
        ];
  
        if (user?.role === 'Manager') {
            return allStatuses; // Managers can set any status via form
        } else if (user?.role === 'Developer') {
            // Developers have limited status changes via form
            if (!isEditing) {
                // On create, Dev can only set Open or In Progress
                return allStatuses.filter(opt => ['Open', 'In Progress'].includes(opt.value));
            } else {
                // On edit, Dev sees current status but cannot change to Closed/Pending via form
                // They use buttons for those transitions. Can maybe switch between Open/In Progress.
                const allowedStatuses = ['Open', 'In Progress'];
                // Include the current status if it's not one of the normally allowed ones
                if (initialTask?.status && !allowedStatuses.includes(initialTask.status)) {
                    const currentStatusOption = allStatuses.find(opt => opt.value === initialTask.status);
                    if (currentStatusOption) {
                        // Ensure the current status option is added only once if it exists
                        const filteredAllowed = allStatuses.filter(opt => allowedStatuses.includes(opt.value));
                        // Avoid adding duplicate if current status is already in allowedStatuses
                        return allowedStatuses.includes(currentStatusOption.value) ? filteredAllowed : [...filteredAllowed, currentStatusOption];
                    }
                }
                return allStatuses.filter(opt => allowedStatuses.includes(opt.value));
            }
        }
        return []; // Default empty if no user/role
    }, [user?.role, isEditing, initialTask?.status]);
  
  
    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear validation error for the field on change
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };
  
    // Validate form data
    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = 'Title is required.';
        if (formData.title.trim().length > 100) newErrors.title = 'Title cannot exceed 100 characters.';
        if (!formData.description.trim()) newErrors.description = 'Description is required.';
        if (!formData.priority) newErrors.priority = 'Priority must be selected.';
        if (!formData.assigneeId && user?.role === 'Manager') newErrors.assigneeId = 'Assignee must be selected by Manager.';
        // Developer defaults to self, so no explicit check needed unless required otherwise
        if (!formData.type) newErrors.type = 'Type must be selected.';
        if (!formData.status) newErrors.status = 'Status must be selected.'; // Should always have a value
  
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Return true if no errors
    };
  
    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            // Prepare data for submission
            const submissionData = {
                ...formData,
                // Convert dueDate back to ISO string if present, otherwise null
                dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
                // Ensure assigneeId is set correctly (Developer defaults handled in initial state)
                assigneeId: formData.assigneeId || (user?.role === 'Developer' ? user.id : ''),
            };
  
            // Prevent Developer from setting certain statuses via form
             if (user?.role === 'Developer' && ['Closed', 'Pending Approval', 'Reopened'].includes(submissionData.status)) {
                 // If editing, revert to original status; if creating, default to 'Open'
                 submissionData.status = initialTask?.status || 'Open';
                 console.warn("Developer attempted to set restricted status via form. Reverted.");
             }
  
            onSubmit(submissionData); // Call the onSubmit prop passed from parent
        } else {
            console.log("Form validation failed:", errors);
        }
    };
  
    // Determine if status field should be disabled for Developer editing
    const isStatusDisabled = user?.role === 'Developer' && isEditing;
    // Determine if the status field is conceptually required (it always is in this form)
    const isStatusRequired = true; // Status is always required
  
    return (
        // Replaced Tailwind classes with CSS Module classes
        <form onSubmit={handleSubmit} className={taskStyles.taskForm}>
            <Input
                label="Title"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                error={errors.title}
                required
                maxLength={100}
                className={uiStyles.inputGroupMarginBottom} // Ensure consistent spacing
            />
            <Textarea
                label="Description"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                error={errors.description}
                required
                rows={5}
                className={uiStyles.inputGroupMarginBottom}
            />
             <div className={taskStyles.taskFormGrid}> {/* Grid layout */}
                <Select
                    label="Priority"
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    options={priorityOptions}
                    error={errors.priority}
                    required
                    className={uiStyles.inputGroupNoMargin} // Remove margin for grid layout
                />
                 <Select
                    label="Type"
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    options={typeOptions}
                    error={errors.type}
                    required
                    className={uiStyles.inputGroupNoMargin}
                 />
                <Select
                    label="Assignee"
                    id="assigneeId"
                    name="assigneeId"
                    value={formData.assigneeId}
                    onChange={handleChange}
                    options={assigneeOptions}
                    error={errors.assigneeId}
                    // Required for manager, dev defaults to self on create
                    required={user?.role === 'Manager'}
                    // Developer cannot change assignee via form (manager responsibility)
                    disabled={user?.role === 'Developer' && isEditing} // Allow dev to select on create if needed, disable on edit
                    className={uiStyles.inputGroupNoMargin}
                />
                 {/* Status field: Manager can edit, Dev sees read-only on edit, limited options on create */}
                 <div>
                     {/* Fix: Always show asterisk as the field is required, remove undefined 'required' variable reference */}
                     <label htmlFor="status" className={uiStyles.selectLabel}>Status{isStatusRequired && <span className={uiStyles.requiredIndicator}>*</span>}</label>
                     <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        required={isStatusRequired} // Pass the boolean directly
                        // Developer cannot change status via form when editing (use buttons)
                        disabled={isStatusDisabled}
                        className={`${uiStyles.selectField} ${errors.status ? uiStyles.selectError : ''} ${isStatusDisabled ? uiStyles.selectDisabled : ''}`}
                     >
                         {/* Dynamically generate options based on role/mode */}
                         {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                         ))}
                     </select>
                     {errors.status && <p className={uiStyles.errorMessage}>{errors.status}</p>}
                 </div>
  
                 <Input
                    label="Project"
                    id="project"
                    name="project"
                    value={formData.project}
                    onChange={handleChange}
                    maxLength={50}
                    className={uiStyles.inputGroupNoMargin}
                 />
                 <Input
                    label="Due Date"
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className={uiStyles.inputGroupNoMargin}
                 />
            </div>
  
            <div className={taskStyles.taskFormActions}>
                <Button type="button" variant="secondary" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" variant="primary">
                    {isEditing ? 'Save Changes' : 'Create Task'}
                </Button>
            </div>
        </form>
    );
  };
  
  const TimeLogForm = ({ taskId, onSubmitSuccess }) => {
    const [timeSpent, setTimeSpent] = useState('');
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Get logTime directly from context here
    const { logTime } = useTasks();
  
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const time = parseFloat(timeSpent);
  
        // Validation
        if (isNaN(time) || time <= 0) {
            setError('Please enter a valid positive number for time spent (e.g., 0.5, 1, 2.25).');
            return;
        }
         if (!comment.trim()) {
            setError('Please add a comment describing the work done.');
            return;
        }
        if (comment.trim().length > 200) { // Add length limit
             setError('Comment cannot exceed 200 characters.');
            return;
        }
  
  
        setIsSubmitting(true);
        try {
            // Use logTime obtained from context
            await logTime(taskId, { timeSpent: time, comment: comment.trim() });
            // Reset form and notify parent on success
            setTimeSpent('');
            setComment('');
            if (onSubmitSuccess) onSubmitSuccess(); // Callback to parent
        } catch (err) {
            setError(err.message || 'Failed to log time.');
        } finally {
            setIsSubmitting(false);
        }
    };
  
    return (
        // Replaced Tailwind classes with CSS Module classes
        <form onSubmit={handleSubmit} className={taskStyles.timeLogForm}>
            <h4 className={taskStyles.timeLogFormTitle}>Log Time Spent</h4>
             {error && <p className={uiStyles.errorMessageBox}>{error}</p>}
            <div className={taskStyles.timeLogFormGrid}> {/* Changed items-end to items-start */}
                <Input
                    label="Time (hours)"
                    id="timeSpent"
                    name="timeSpent"
                    type="number"
                    value={timeSpent}
                    onChange={(e) => setTimeSpent(e.target.value)}
                    step="0.1" // Allow decimal input
                    min="0.1" // Minimum time loggable
                    placeholder="e.g., 1.5"
                    required
                    className={uiStyles.inputGroupNoMargin} // Remove default margin bottom
                    error={null} // Don't show individual field error here, use form-level error
                />
                <Textarea
                    label="Comment"
                    id="comment"
                    name="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    rows={2} // Adjust rows as needed
                    placeholder="What did you work on?"
                    maxLength={200} // Match validation
                    className={`${taskStyles.timeLogFormComment} ${uiStyles.inputGroupNoMargin}`} // Span across two columns on larger screens
                    error={null} // Don't show individual field error here
                />
            </div>
            <div className={taskStyles.timeLogFormActions}>
                 <Button type="submit" variant="primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Logging...' : 'Log Time'}
                </Button>
            </div>
  
        </form>
    );
  };
  
  const TimeLogItem = ({ log }) => {
    const userName = mockUsers.find(u => u.id === log.userId)?.name || 'Unknown User';
    return (
        // Replaced Tailwind classes with CSS Module classes
        <div className={taskStyles.timeLogItem}>
            <div className={taskStyles.timeLogItemHeader}>
                <span className={taskStyles.timeLogItemUser}>{userName} logged {log.timeSpent.toFixed(1)} hrs</span>
                <span className={taskStyles.timeLogItemDate}>{formatDate(log.dateLogged, true)}</span>
            </div>
            {/* Use whitespace-pre-wrap to respect line breaks in comments */}
            <p className={taskStyles.timeLogItemComment}>"{log.comment}"</p>
        </div>
    );
  };
  
  
  // --- Pages ---
  const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  // Fix: Remove unused local loading state
  // const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, loading: authLoading } = useAuth(); // Use authLoading from context
  const navigate = useNavigate();
  const location = useLocation();
  
  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
        // Path is correct for HashRouter
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);
  
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
      // Navigation happens in the useEffect above after isAuthenticated becomes true
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };
  
  // Prevent interaction while auth state is initially loading or during login attempt
  const isBusy = authLoading; // Use context loading state
  
  return (
    // Replaced Tailwind classes with CSS Module classes
    <div className={pageStyles.loginPageContainer}>
      <div className={pageStyles.loginFormCard}>
        <div>
          <h2 className={pageStyles.loginTitle}>
            Sign in to FealtyX Tracker
          </h2>
        </div>
        <form className={pageStyles.loginForm} onSubmit={handleSubmit}>
          {error && (
            // Replaced Tailwind classes with CSS Module classes
            <div className={uiStyles.errorMessageBox} role="alert">
              <span className={uiStyles.errorMessageText}>{error}</span>
            </div>
          )}
          {/* Remove mb-4 from Input components as form has space-y-6 */}
          <Input
            label="Username"
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="developer / manager"
            required
            disabled={isBusy}
            className={uiStyles.inputGroupNoMargin}
          />
           <Input
            label="Password"
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password" // Hardcoded password hint for demo
            required
            disabled={isBusy}
            className={uiStyles.inputGroupNoMargin}
          />
  
          <div>
            <Button type="submit" variant="primary" className={uiStyles.buttonFullWidth} disabled={isBusy}>
              {isBusy ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>
           <p className={pageStyles.loginHint}>
             Demo: (developer / password) or (manager / password)
           </p>
        </form>
      </div>
    </div>
  );
  };
  
  const DashboardPage = () => {
    const { user } = useAuth();
    // Use alias for task context loading/error to avoid name clash
    const { tasks: allTasks, loading: tasksLoading, error: tasksError, fetchTasks } = useTasks();
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [filters, setFilters] = useState({}); // State for user-selected filters
    const [sort, setSort] = useState({ key: 'createdAt', direction: 'desc' }); // State for sorting
    const navigate = useNavigate();
  
    // Fetch tasks when component mounts or user changes (if user is available)
    useEffect(() => {
        if (user) { // Only fetch if user is loaded
            fetchTasks();
        }
    }, [fetchTasks, user]); // Rerun if fetchTasks function or user changes
  
    // Apply filtering and sorting whenever tasks, filters, or sort order change
    useEffect(() => {
        // Ensure user and allTasks are available before processing
        if (!user || !allTasks) {
             setFilteredTasks([]); // Set to empty if prerequisites not met
             return;
         }
  
        let processedTasks = [...allTasks];
  
        // 1. Role-based initial filtering (only show assigned tasks for Developer)
        if (user.role === 'Developer') {
            processedTasks = processedTasks.filter(task => task.assigneeId === user.id);
        }
        // Managers see all tasks initially, filters apply below
  
        // 2. Apply user-selected filters from TaskFilterSort component
        if (filters.status) {
            processedTasks = processedTasks.filter(task => task.status === filters.status);
        }
        if (filters.priority) {
            processedTasks = processedTasks.filter(task => task.priority === filters.priority);
        }
        // Apply assignee filter only if user is Manager and filter is set
        if (user.role === 'Manager' && filters.assigneeId) {
             processedTasks = processedTasks.filter(task => task.assigneeId === filters.assigneeId);
        }
        // Add more filters here (e.g., project, type) if needed based on TaskFilterSort
  
        // 3. Apply sorting based on 'sort' state
        const priorityOrder = { High: 3, Medium: 2, Low: 1 }; // Define priority order for sorting
        processedTasks.sort((a, b) => {
            let compareA, compareB;
            const key = sort.key;
  
            try { // Add try-catch for robustness, especially with dates
                switch (key) {
                    case 'priority':
                        compareA = priorityOrder[a.priority] || 0;
                        compareB = priorityOrder[b.priority] || 0;
                        break;
                    case 'dueDate':
                        // Handle null due dates consistently (e.g., sort them last)
                        const dateA = a.dueDate ? parseISO(a.dueDate).getTime() : null;
                        const dateB = b.dueDate ? parseISO(b.dueDate).getTime() : null;
  
                        if (dateA === null && dateB === null) { compareA = 0; compareB = 0; }
                        else if (dateA === null) { compareA = sort.direction === 'asc' ? Infinity : -Infinity; compareB = dateB; } // Nulls last in asc, first in desc
                        else if (dateB === null) { compareA = dateA; compareB = sort.direction === 'asc' ? Infinity : -Infinity; } // Nulls last in asc, first in desc
                        else { compareA = dateA; compareB = dateB; }
                        break;
                    case 'createdAt':
                    case 'updatedAt':
                         // Ensure dates are valid before parsing, default to 0 if invalid/missing
                         compareA = a[key] && !isNaN(parseISO(a[key]).getTime()) ? parseISO(a[key]).getTime() : 0;
                         compareB = b[key] && !isNaN(parseISO(b[key]).getTime()) ? parseISO(b[key]).getTime() : 0;
                         break;
                    default:
                        // Generic comparison for other fields (e.g., title - case-insensitive)
                        compareA = typeof a[key] === 'string' ? String(a[key] || '').toLowerCase() : a[key];
                        compareB = typeof b[key] === 'string' ? String(b[key] || '').toLowerCase() : b[key];
                        // Handle null/undefined for non-string/date fields if necessary
                        compareA = compareA ?? (sort.direction === 'asc' ? Infinity : -Infinity);
                        compareB = compareB ?? (sort.direction === 'asc' ? Infinity : -Infinity);
                }
  
                 // Final comparison logic based on direction
                 if (compareA < compareB) {
                    return sort.direction === 'asc' ? -1 : 1;
                }
                if (compareA > compareB) {
                    return sort.direction === 'asc' ? 1 : -1;
                }
                return 0; // If equal, maintain original relative order (stable sort not guaranteed by default JS sort)
            } catch (error) {
                 console.error("Error during sorting:", error, "Task A:", a, "Task B:", b);
                 return 0; // Prevent crashing if parsing fails
            }
        });
  
  
        setFilteredTasks(processedTasks);
  
    }, [allTasks, filters, sort, user]); // Re-run when these dependencies change
  
    // Callbacks for filter/sort changes, memoized for stability
    const handleFilterChange = useCallback((newFilters) => {
        setFilters(newFilters);
    }, []);
  
    const handleSortChange = useCallback((newSort) => {
        setSort(newSort);
    }, []);
  
  
    return (
        // Replaced Tailwind classes with CSS Module classes
        <div className={pageStyles.dashboardContainer}>
            <div className={pageStyles.dashboardHeader}>
                <h1 className={pageStyles.dashboardTitle}>
                    {user?.role === 'Manager' ? 'Task Dashboard' : 'My Tasks'}
                </h1>
                {/* Show Create Task button only for Developers */}
                {user?.role === 'Developer' && (
                    // Path is correct for HashRouter
                    <Link to="/tasks/new"> {/* Use Link for navigation */}
                        <Button variant="primary">
                            Create New Task
                        </Button>
                    </Link>
                )}
            </div>
  
            {/* Display error message if fetching tasks failed */}
            {tasksError && <p className={uiStyles.errorMessageBox}>Error loading tasks: {tasksError}</p>}
  
            {/* Trend Chart Section - Pass all tasks for calculation */}
            <div className={pageStyles.dashboardSection}>
                 {/* TrendChart handles its own loading/empty state based on data */}
                 <TrendChart tasks={allTasks} />
            </div>
  
  
            {/* Filters and Sorting Section */}
             <TaskFilterSort
                onFilterChange={handleFilterChange}
                onSortChange={handleSortChange}
                initialFilters={filters} // Pass current filters/sort state
                initialSort={sort}
            />
  
            {/* Task List Section */}
            <div className={pageStyles.dashboardSection}>
                <h2 className={pageStyles.dashboardSectionTitle}>
                    {/* Dynamic title based on filters/role */}
                    {Object.values(filters).some(f => f) // Check if any filter is active
                        ? 'Filtered Tasks'
                        : (user?.role === 'Manager' ? 'All Tasks' : 'My Assigned Tasks')
                    }
                </h2>
                 {/* Show loading spinner only if tasks are loading AND list is currently empty */}
                 {tasksLoading && filteredTasks.length === 0 ? (
                     <LoadingSpinner />
                 ) : (
                    <TaskList
                        tasks={filteredTasks} // Pass the processed (filtered and sorted) tasks
                        userRole={user?.role}
                    />
                 )}
            </div>
        </div>
    );
  };
  
  const TaskDetailPage = () => {
    const { taskId } = useParams();
    // Fix: Remove unused 'logTime' from destructuring
    const { getTaskById, updateTask, deleteTask, loading: contextLoading, error: contextError } = useTasks();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [task, setTask] = useState(null); // State for the fetched task
    const [loading, setLoading] = useState(true); // Local loading state for fetching this specific task
    const [error, setError] = useState(null); // Local error state
    const [isEditing, setIsEditing] = useState(false); // State to toggle edit mode
    const [showTimeLogForm, setShowTimeLogForm] = useState(false); // State to toggle time log form
  
    // Fetch task details when component mounts or taskId changes
    const fetchTaskDetails = useCallback(async () => {
        setLoading(true);
        setError(null); // Clear previous errors
        try {
            const taskData = await getTaskById(taskId); // Use context function
            setTask(taskData); // Set task state (getTaskById throws error if not found)
        } catch (err) {
             console.error("Error fetching task details:", err);
            setError(err.message || 'Failed to load task details.'); // Set local error state
        } finally {
            setLoading(false); // Finish local loading
        }
    }, [getTaskById, taskId]); // Dependencies for useCallback
  
    useEffect(() => {
        fetchTaskDetails();
    }, [fetchTaskDetails]); // Rerun effect if fetch function changes (due to dependencies)
  
    // Handle task updates (from forms or action buttons)
    const handleUpdate = async (updateData) => {
        setError(null); // Clear previous errors before attempting update
        try {
            // Use the updateTask function from context
            const updated = await updateTask(taskId, updateData);
            setTask(updated); // Update local state with the response
            setIsEditing(false); // Exit edit mode on successful update
            setShowTimeLogForm(false); // Close time log form if open
            // Optionally: Show a success message (e.g., using a toast library or simple state)
        } catch (err) {
             console.error("Error updating task:", err);
            setError(err.message || 'Failed to update task.'); // Display error to user
            // Decide whether to keep forms open on error (e.g., keep edit form open)
        }
    };
  
     // Handle task deletion
     const handleDelete = async () => {
        // Extra confirmation for deletion
        if (window.confirm(`Are you sure you want to permanently delete task "${task?.title || taskId}"? This action cannot be undone.`)) {
             setError(null);
            try {
                await deleteTask(taskId); // Use context function
                // Path is correct for HashRouter
                navigate('/dashboard'); // Redirect to dashboard after successful delete
            } catch (err) {
                 console.error("Error deleting task:", err);
                 setError(err.message || 'Failed to delete task.');
            }
        }
    };
  
    // --- Action Handlers (call handleUpdate with specific status) ---
    const handleStartProgress = () => handleUpdate({ status: 'In Progress' });
    const handleSubmitForApproval = () => handleUpdate({ status: 'Pending Approval' });
    const handleApproveClosure = () => handleUpdate({ status: 'Closed' });
    const handleReopenTask = () => handleUpdate({ status: 'Reopened' }); // Or 'In Progress'? Workflow decision.
  
    // --- Permissions (Memoized for performance) ---
    const permissions = useMemo(() => {
        if (!user || !task) return {}; // Return empty if data not loaded
  
        const isAssignee = user.role === 'Developer' && user.id === task.assigneeId;
        const isManager = user.role === 'Manager';
  
        return {
            // Manager can edit always, Developer can edit if assigned
            canEdit: isManager || isAssignee,
            // Developer can delete if assigned AND status is Open/Reopened
            canDelete: isAssignee && ['Open', 'Reopened'].includes(task.status),
            // Developer can log time if assigned AND task is not Closed
            canLogTime: isAssignee && task.status !== 'Closed',
            // Developer can start progress if assigned AND status is Open
            canStartProgress: isAssignee && task.status === 'Open',
            // Developer can submit for approval if assigned AND status is In Progress
            canSubmitForApproval: isAssignee && task.status === 'In Progress',
            // Manager can approve if status is Pending Approval
            canApprove: isManager && task.status === 'Pending Approval',
            // Manager can reopen if status is Pending Approval or Closed
            canReopen: isManager && ['Pending Approval', 'Closed'].includes(task.status),
        };
    }, [user, task]); // Recalculate when user or task data changes
  
  
    // --- Render Logic ---
    // Display loading spinner if either local fetch is loading or context is busy
    if (loading || contextLoading) return <LoadingSpinner fullPage={true} />;
    // Display error if local fetch failed or context has an error
    // Prioritize local error message if it exists
    if (error || contextError) {
        return (
            // Replaced Tailwind classes with CSS Module classes
            <div className={pageStyles.pageContainer}>
                 {/* Path is correct for HashRouter */}
                 <Button onClick={() => navigate('/dashboard')} variant="secondary" className={uiStyles.buttonSmall}>
                    &larr; Back to Dashboard
                 </Button>
                <p className={uiStyles.errorMessageBox}>Error: {error || contextError}</p>
            </div>
        );
    }
    // Display message if task is null after loading and no error (shouldn't usually happen if getTaskById throws)
    if (!task) {
         return (
            // Replaced Tailwind classes with CSS Module classes
            <div className={pageStyles.pageContainer}>
                 {/* Path is correct for HashRouter */}
                 <Button onClick={() => navigate('/dashboard')} variant="secondary" className={uiStyles.buttonSmall}>
                    &larr; Back to Dashboard
                 </Button>
                <p>Task data could not be loaded.</p>
            </div>
        );
    }
  
  
    // Find user names for display (handle cases where user might not be found)
    const assigneeName = mockUsers.find(u => u.id === task.assigneeId)?.name || 'Unknown Assignee';
    const reporterName = mockUsers.find(u => u.id === task.reporterId)?.name || 'Unknown Reporter';
  
    // Define color classes for status/priority badges
    const priorityColorClass = { High: taskStyles.priorityHighDetail, Medium: taskStyles.priorityMediumDetail, Low: taskStyles.priorityLowDetail };
    const statusColorClass = { Open: taskStyles.statusOpenDetail, 'In Progress': taskStyles.statusInProgressDetail, 'Pending Approval': taskStyles.statusPendingApprovalDetail, Closed: taskStyles.statusClosedDetail, Reopened: taskStyles.statusReopenedDetail };
  
  
    return (
        // Replaced Tailwind classes with CSS Module classes
        <div className={pageStyles.pageContainer}>
            {/* Back Button */}
             {/* Path is correct for HashRouter */}
             <Button onClick={() => navigate(-1)} variant="secondary" className={uiStyles.buttonSmall}> {/* navigate(-1) goes back */}
                &larr; Back
             </Button>
  
            {/* Conditionally render Edit Form or Details View */}
            {isEditing ? (
                 // Replaced Tailwind classes with CSS Module classes
                 <div className={taskStyles.taskDetailEditFormContainer}>
                     <h2 className={taskStyles.taskDetailEditTitle}>Edit Task: {task.title}</h2>
                     {/* Display update errors within the form area */}
                     {error && <p className={uiStyles.errorMessageBox}>{error}</p>}
                    <TaskForm
                        initialTask={task} // Pass current task data
                        onSubmit={handleUpdate} // Use the handleUpdate function for submission
                        onCancel={() => { setIsEditing(false); setError(null); }} // Close form and clear errors on cancel
                        availableUsers={mockUsers} // Pass users for assignee dropdown
                    />
                 </div>
            ) : (
                // --- Task Details View ---
                // Replaced Tailwind classes with CSS Module classes
                <div className={taskStyles.taskDetailContainer}>
                    {/* Header Row: Title, Status, Priority, Type */}
                    <div className={taskStyles.taskDetailHeader}>
                        {/* Make title break words to prevent overflow */}
                        <h1 className={taskStyles.taskDetailTitle}>{task.title}</h1>
                        {/* Badges container */}
                        <div className={taskStyles.taskDetailBadges}>
                             <span className={`${taskStyles.taskDetailBadge} ${statusColorClass[task.status] || taskStyles.statusDefaultDetail}`}>
                                {task.status}
                            </span>
                             <span className={`${taskStyles.taskDetailBadge} ${priorityColorClass[task.priority] || taskStyles.priorityDefaultDetail}`}>
                                {task.priority} Priority
                            </span>
                             <span className={taskStyles.taskDetailTypeText}>({task.type})</span>
                        </div>
                    </div>
  
                     {/* Display any errors from actions (like delete failed) */}
                     {error && <p className={uiStyles.errorMessageBox}>{error}</p>}
  
                     {/* Action Buttons Row */}
                     <div className={taskStyles.taskDetailActions}>
                        {permissions.canEdit && <Button variant="secondary" onClick={() => setIsEditing(true)}>Edit Task</Button>}
                        {permissions.canDelete && <Button variant="danger" onClick={handleDelete}>Delete Task</Button>}
                        {permissions.canStartProgress && <Button variant="primary" onClick={handleStartProgress}>Start Progress</Button>}
                        {/* Toggle Time Log Form visibility */}
                        {permissions.canLogTime && <Button variant="outline" onClick={() => setShowTimeLogForm(prev => !prev)}> {showTimeLogForm ? 'Cancel Log Time' : 'Log Time'} </Button>}
                        {permissions.canSubmitForApproval && <Button variant="success" onClick={handleSubmitForApproval}>Submit for Approval</Button>}
                        {permissions.canApprove && <Button variant="success" onClick={handleApproveClosure}>Approve & Close</Button>}
                        {permissions.canReopen && <Button variant="outline" onClick={handleReopenTask}>Re-open Task</Button>}
                    </div>
  
  
                    {/* Details Grid: Assignee, Reporter, Dates etc. */}
                    <div className={taskStyles.taskDetailGrid}>
                        <div><strong className={taskStyles.taskDetailLabel}>Assignee:</strong> {assigneeName}</div>
                        <div><strong className={taskStyles.taskDetailLabel}>Reporter:</strong> {reporterName}</div>
                        <div><strong className={taskStyles.taskDetailLabel}>Project:</strong> {task.project || <span className={taskStyles.taskDetailN_A}>N/A</span>}</div>
                        <div><strong className={taskStyles.taskDetailLabel}>Created:</strong> {formatDate(task.createdAt, true)}</div>
                        <div><strong className={taskStyles.taskDetailLabel}>Last Updated:</strong> {formatDate(task.updatedAt, true)}</div>
                        <div><strong className={taskStyles.taskDetailLabel}>Due Date:</strong> {formatDate(task.dueDate) || <span className={taskStyles.taskDetailN_A}>None</span>}</div>
                        {/* Show Closed date only if task is closed */}
                        {task.closedAt && <div><strong className={taskStyles.taskDetailLabel}>Closed:</strong> {formatDate(task.closedAt, true)}</div>}
                    </div>
  
                    {/* Description Section */}
                    <div className={taskStyles.taskDetailSection}>
                        <h3 className={taskStyles.taskDetailSectionTitle}>Description</h3>
                        {/* Use whitespace-pre-wrap to respect formatting */}
                        <div className={taskStyles.taskDetailDescription}>{task.description}</div>
                    </div>
  
                     {/* Time Log Form (Conditionally Rendered) */}
                     {showTimeLogForm && permissions.canLogTime && (
                        <TimeLogForm
                            taskId={task.id}
                            onSubmitSuccess={() => {
                                setShowTimeLogForm(false); // Hide form on success
                                fetchTaskDetails(); // Re-fetch task to update total time and log list
                            }}
                        />
                     )}
  
                    {/* Time Logs Section */}
                    <div className={taskStyles.taskDetailSection}>
                        <h3 className={taskStyles.taskDetailSectionTitle}>
                            Time Log ({task.totalTimeSpent?.toFixed(1) || '0.0'} hrs total)
                        </h3>
                        {/* Replaced Tailwind classes with CSS Module classes */}
                        <div className={taskStyles.timeLogsList}> {/* Changed bg, added divide */}
                            {task.timeLogs && task.timeLogs.length > 0 ? (
                                // Sort logs newest first (create a copy before sorting)
                                // Ensure dateLogged is a valid date string before sorting
                                [...task.timeLogs]
                                    .filter(log => log.dateLogged && !isNaN(parseISO(log.dateLogged).getTime())) // Filter out invalid dates
                                    .sort((a, b) => parseISO(b.dateLogged).getTime() - parseISO(a.dateLogged).getTime()) // Use getTime() for reliable comparison
                                    .map(log => <TimeLogItem key={log.logId} log={log} />)
                            ) : (
                                // Replaced Tailwind classes with CSS Module classes
                                <p className={taskStyles.timeLogsEmptyMessage}>No time logged yet.</p>
                            )}
                        </div>
                    </div>
  
                     {/* History Section */}
                    <div className={taskStyles.taskDetailSection}>
                        <h3 className={taskStyles.taskDetailSectionTitle}>History</h3>
                         {/* Replaced Tailwind classes with CSS Module classes */}
                         <div className={taskStyles.historyList}> {/* Changed bg, added divide */}
                             {task.history && task.history.length > 0 ? (
                                 // Sort history newest first (create a copy before sorting)
                                 // Ensure changedAt is a valid date string before sorting
                                 [...task.history]
                                     .filter(entry => entry.changedAt && !isNaN(parseISO(entry.changedAt).getTime())) // Filter out invalid dates
                                     .sort((a, b) => parseISO(b.changedAt).getTime() - parseISO(a.changedAt).getTime()) // Use getTime() for reliable comparison
                                     .map((entry, index) => (
                                         // Replaced Tailwind classes with CSS Module classes
                                         <div key={index} className={taskStyles.historyItem}>
                                             <span>
                                                {/* Use status color for badge-like appearance */}
                                                <span className={`${taskStyles.historyStatusBadge} ${statusColorClass[entry.status] || taskStyles.statusDefaultDetail}`}>{entry.status}</span>
                                                <span className={taskStyles.historyUser}> by {mockUsers.find(u => u.id === entry.userId)?.name || 'System'}</span>
                                             </span>
                                             <span className={taskStyles.historyDate}>{formatDate(entry.changedAt, true)}</span>
                                         </div>
                                     ))
                             ) : (
                                 // Replaced Tailwind classes with CSS Module classes
                                 <p className={taskStyles.historyEmptyMessage}>No history recorded.</p>
                             )}
                         </div>
                    </div>
  
                </div> // End Task Details View
            )}
        </div> // End Container
    );
  };
  
  const CreateTaskPage = () => {
    // Use context hooks
    const { addTask, loading: taskLoading, error: taskError } = useTasks();
    const { user } = useAuth();
    const navigate = useNavigate();
    // State for form-specific submission errors (distinct from context errors like fetching)
    const [formError, setFormError] = useState(null);
  
    // Handle form submission
    const handleSubmit = async (formData) => {
        setFormError(null); // Clear previous form error before attempting submission
        try {
            // Developer implicitly assigns to self if assignee isn't set (handled in TaskForm)
            const newTask = await addTask(formData); // Call context action
            // Path is correct for HashRouter
            navigate(`/tasks/${newTask.id}`); // Navigate to the new task's detail page on success
        } catch (err) {
             console.error("Error creating task:", err);
            // Set form-specific error state to display to the user
            setFormError(err.message || 'Failed to create task. Please check the details and try again.');
        }
    };
  
    // Although ProtectedRoute enforces this, double-check role for clarity/safety
    // Redirect immediately if a non-developer somehow reaches this page
    if (user?.role !== 'Developer') {
        console.warn("Non-developer accessed Create Task page. Redirecting.");
        // Path is correct for HashRouter
        return <Navigate to="/dashboard" replace />;
    }
  
  
    return (
        // Replaced Tailwind classes with CSS Module classes
        <div className={pageStyles.pageContainer}>
             {/* Back Button */}
             {/* Path is correct for HashRouter */}
             <Button onClick={() => navigate('/dashboard')} variant="secondary" className={uiStyles.buttonSmall}>
                &larr; Back to Dashboard
             </Button>
            {/* Replaced Tailwind classes with CSS Module classes */}
            <div className={taskStyles.createTaskFormContainer}>
                <h1 className={taskStyles.createTaskTitle}>Create New Task</h1>
                 {/* Display form submission error OR general task context error */}
                 {(formError || taskError) && (
                    // Replaced Tailwind classes with CSS Module classes
                    <p className={uiStyles.errorMessageBox}>
                        Error: {formError || taskError}
                    </p>
                 )}
                 {/* Show loading spinner if the addTask action is in progress */}
                 {taskLoading && <LoadingSpinner />}
                {/* Render the TaskForm for creating a new task */}
                <TaskForm
                    onSubmit={handleSubmit} // Pass the submission handler
                     // Path is correct for HashRouter
                    onCancel={() => navigate('/dashboard')} // Navigate back on cancel
                    availableUsers={mockUsers} // Pass users (though Dev defaults to self)
                    // initialTask is null, indicating create mode
                />
            </div>
        </div>
    );
  };
  
  const NotFoundPage = () => (
  // Replaced Tailwind classes with CSS Module classes
  <div className={pageStyles.notFoundContainer}> {/* Adjust min-height based on header/footer */}
    <h1 className={pageStyles.notFoundTitle}>404</h1>
    <h2 className={pageStyles.notFoundSubtitle}>Page Not Found</h2>
    <p className={pageStyles.notFoundText}>Sorry, the page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
    {/* Path is correct for HashRouter */}
    <Link to="/dashboard">
        <Button variant="primary">Go to Dashboard</Button>
    </Link>
  </div>
  );
  
  
  // --- Main App Component (Router Setup) ---
  function App() {
  return (
    // Wrap entire app in providers
    <AuthProvider>
      <TaskProvider> {/* TaskProvider needs AuthContext, so it's nested inside */}
        {/* Use HashRouter aliased as Router */}
        <Router>
          {/* Replaced Tailwind classes with CSS Module classes */}
          <div className={layoutStyles.appContainer}> {/* Changed bg-gray-50 to bg-gray-100 */}
            <Header />
            <main className={layoutStyles.mainContent}>
              <Routes>
                {/* Public Route - Path is correct */}
                <Route path="/login" element={<LoginPage />} />
  
                {/* Protected Routes - Paths are correct */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute> {/* Protects based on authentication */}
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tasks/new"
                  element={
                    <ProtectedRoute requiredRole="Developer"> {/* Protects based on auth AND role */}
                      <CreateTaskPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tasks/:taskId"
                  element={
                    <ProtectedRoute> {/* Protects based on authentication */}
                      <TaskDetailPage />
                    </ProtectedRoute>
                  }
                />
  
                 {/* Redirect root '/' to '/dashboard' if logged in */}
                 {/* Path is correct */}
                 <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                          {/* Navigate component uses correct path */}
                          <Navigate replace to="/dashboard" />
                      </ProtectedRoute>
                      // If not authenticated, ProtectedRoute component handles redirect to /login
                    }
                  />
  
  
                {/* Catch-all Not Found Route - Path is correct */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
             {/* Replaced Tailwind classes with CSS Module classes */}
             <footer className={layoutStyles.footer}>
                 FealtyX Bug Tracker Demo &copy; {new Date().getFullYear()}
             </footer>
          </div>
        </Router>
      </TaskProvider>
    </AuthProvider>
  );
  }
  
  export default App;
  
  // --- Dependency Reminder ---
  // Make sure you have installed the necessary dependencies:
  // npm install react-router-dom recharts date-fns
  // or
  // yarn add react-router-dom recharts date-fns
  
  // You will also need to create the following CSS files:
  // - global.css
  // - Layout.module.css
  // - UIComponents.module.css
  // - Pages.module.css
  // - TaskComponents.module.css
  