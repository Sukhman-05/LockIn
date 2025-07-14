import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import api from '../utils/api';

const TaskPlanner = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks'); // tasks, timeline, analytics

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    dueDate: '',
    estimatedDuration: ''
  });

  // Load tasks on component mount
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.post('/tasks', formData);
      setTasks([...tasks, response.data]);
      setFormData({
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        dueDate: '',
        estimatedDuration: ''
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanTask = async (taskId) => {
    try {
      setLoading(true);
      const response = await api.post(`/tasks/${taskId}/plan`);
      setTasks(tasks.map(task => 
        task._id === taskId ? response.data : task
      ));
      setSelectedTask(response.data);
    } catch (error) {
      console.error('Failed to plan task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateChunk = async (taskId, chunkId, updates) => {
    try {
      const response = await api.patch(`/tasks/${taskId}/chunks/${chunkId}`, updates);
      setTasks(tasks.map(task => 
        task._id === taskId ? response.data : task
      ));
      if (selectedTask?._id === taskId) {
        setSelectedTask(response.data);
      }
    } catch (error) {
      console.error('Failed to update chunk:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'paused': return 'bg-yellow-500';
      case 'pending': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-pixel text-pixelYellow mb-2">Task Planner</h1>
        <p className="text-pixelGray">AI-powered task organization and timeline planning</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-2 rounded border-2 font-pixel transition-all ${
            activeTab === 'tasks' 
              ? 'bg-pixelYellow text-pixelGray border-pixelYellow' 
              : 'border-pixelYellow text-pixelYellow hover:bg-pixelYellow hover:text-pixelGray'
          }`}
        >
          Tasks
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2 rounded border-2 font-pixel transition-all ${
            activeTab === 'timeline' 
              ? 'bg-pixelYellow text-pixelGray border-pixelYellow' 
              : 'border-pixelYellow text-pixelYellow hover:bg-pixelYellow hover:text-pixelGray'
          }`}
        >
          Timeline
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded border-2 font-pixel transition-all ${
            activeTab === 'analytics' 
              ? 'bg-pixelYellow text-pixelGray border-pixelYellow' 
              : 'border-pixelYellow text-pixelYellow hover:bg-pixelYellow hover:text-pixelGray'
          }`}
        >
          Analytics
        </button>
      </div>

      {/* Create Task Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-6 py-3 bg-pixelGreen text-white border-2 border-pixelYellow rounded font-pixel text-lg shadow-pixel hover:bg-pixelBlue transition-all"
        >
          + Create New Task
        </button>
      </div>

      {/* Create Task Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-pixelGray p-6 rounded-lg border-2 border-pixelYellow max-w-md w-full mx-4">
            <h2 className="text-2xl font-pixel text-pixelYellow mb-4">Create New Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-pixelYellow font-pixel mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full p-2 border-2 border-pixelYellow rounded bg-pixelGray text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-pixelYellow font-pixel mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-2 border-2 border-pixelYellow rounded bg-pixelGray text-white"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-pixelYellow font-pixel mb-2">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full p-2 border-2 border-pixelYellow rounded bg-pixelGray text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-pixelYellow font-pixel mb-2">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  className="w-full p-2 border-2 border-pixelYellow rounded bg-pixelGray text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-pixelYellow font-pixel mb-2">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  className="w-full p-2 border-2 border-pixelYellow rounded bg-pixelGray text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-pixelYellow font-pixel mb-2">Estimated Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.estimatedDuration}
                  onChange={(e) => setFormData({...formData, estimatedDuration: e.target.value})}
                  className="w-full p-2 border-2 border-pixelYellow rounded bg-pixelGray text-white"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-pixelGreen text-white border-2 border-pixelYellow rounded font-pixel hover:bg-pixelBlue transition-all disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Task'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-2 bg-pixelRed text-white border-2 border-pixelYellow rounded font-pixel hover:bg-pixelOrange transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tasks List */}
      {activeTab === 'tasks' && (
        <div className="grid gap-4">
          {tasks.map(task => (
            <div key={task._id} className="bg-pixelGray p-4 rounded-lg border-2 border-pixelYellow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-xl font-pixel text-pixelYellow">{task.title}</h3>
                  <p className="text-pixelGray text-sm">{task.description}</p>
                  <div className="flex gap-2 mt-2">
                    <span className={`px-2 py-1 rounded text-xs font-pixel ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className="px-2 py-1 rounded text-xs font-pixel bg-pixelBlue">
                      {task.category}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-pixelGray text-sm">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                  <p className="text-pixelGray text-sm">
                    {task.totalEstimatedDuration} min
                  </p>
                </div>
              </div>
              
              {task.chunks && task.chunks.length > 0 ? (
                <div className="mt-4">
                  <h4 className="text-pixelYellow font-pixel mb-2">Task Chunks:</h4>
                  <div className="space-y-2">
                    {task.chunks.map((chunk, index) => (
                      <div key={chunk._id || index} className="flex items-center justify-between p-2 bg-pixelDark rounded">
                        <div className="flex-1">
                          <p className="text-pixelYellow font-pixel">{chunk.title}</p>
                          <p className="text-pixelGray text-sm">{chunk.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-pixel ${getStatusColor(chunk.status)}`}>
                            {chunk.status}
                          </span>
                          <button
                            onClick={() => handleUpdateChunk(task._id, chunk._id, { 
                              status: chunk.status === 'completed' ? 'pending' : 'completed' 
                            })}
                            className="px-2 py-1 bg-pixelGreen text-white rounded text-xs font-pixel hover:bg-pixelBlue transition-all"
                          >
                            {chunk.status === 'completed' ? 'Undo' : 'Complete'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => handlePlanTask(task._id)}
                  disabled={loading}
                  className="px-4 py-2 bg-pixelBlue text-white border-2 border-pixelYellow rounded font-pixel hover:bg-pixelGreen transition-all disabled:opacity-50"
                >
                  {loading ? 'Planning...' : '🤖 AI Plan Task'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Timeline View */}
      {activeTab === 'timeline' && (
        <div className="bg-pixelGray p-4 rounded-lg border-2 border-pixelYellow">
          <h3 className="text-xl font-pixel text-pixelYellow mb-4">Timeline View</h3>
          <p className="text-pixelGray">Timeline visualization coming soon...</p>
        </div>
      )}

      {/* Analytics View */}
      {activeTab === 'analytics' && (
        <div className="bg-pixelGray p-4 rounded-lg border-2 border-pixelYellow">
          <h3 className="text-xl font-pixel text-pixelYellow mb-4">Analytics</h3>
          <p className="text-pixelGray">Analytics dashboard coming soon...</p>
        </div>
      )}
    </div>
  );
};

export default TaskPlanner; 