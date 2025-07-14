import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import api from '../utils/api';

const StudyNotebook = () => {
  const { user } = useAuth();
  const [notebooks, setNotebooks] = useState([]);
  const [selectedNotebook, setSelectedNotebook] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('notebooks'); // notebooks, content, chat, insights
  const [showCreateNotebook, setShowCreateNotebook] = useState(false);
  const [showUploadContent, setShowUploadContent] = useState(false);

  // Form states
  const [notebookForm, setNotebookForm] = useState({
    title: '',
    description: '',
    subject: '',
    course: '',
    color: '#3B82F6'
  });

  const [contentForm, setContentForm] = useState({
    title: '',
    type: 'text',
    content: '',
    tags: '',
    importance: 'medium'
  });

  // Load notebooks on component mount
  useEffect(() => {
    loadNotebooks();
  }, []);

  const loadNotebooks = async () => {
    try {
      setLoading(true);
      console.log('Attempting to load notebooks...');
      const response = await api.get('/notebooks');
      console.log('Notebooks response:', response.data);
      setNotebooks(response.data);
    } catch (error) {
      console.error('Failed to load notebooks:', error);
      console.error('Error details:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotebook = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.post('/notebooks', notebookForm);
      setNotebooks([...notebooks, response.data]);
      setNotebookForm({
        title: '',
        description: '',
        subject: '',
        course: '',
        color: '#3B82F6'
      });
      setShowCreateNotebook(false);
    } catch (error) {
      console.error('Failed to create notebook:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectNotebook = async (notebook) => {
    try {
      setLoading(true);
      const response = await api.get(`/notebooks/${notebook._id}`);
      setSelectedNotebook(response.data);
      setActiveTab('content');
    } catch (error) {
      console.error('Failed to load notebook:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadContent = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title', contentForm.title);
      formData.append('type', contentForm.type);
      formData.append('content', contentForm.content);
      formData.append('tags', contentForm.tags);
      formData.append('importance', contentForm.importance);

      const fileInput = document.getElementById('file-upload');
      if (fileInput.files[0]) {
        formData.append('file', fileInput.files[0]);
      }

      const response = await api.post(`/notebooks/${selectedNotebook._id}/content`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Refresh notebook data
      const notebookResponse = await api.get(`/notebooks/${selectedNotebook._id}`);
      setSelectedNotebook(notebookResponse.data);
      
      setContentForm({
        title: '',
        type: 'text',
        content: '',
        tags: '',
        importance: 'medium'
      });
      setShowUploadContent(false);
    } catch (error) {
      console.error('Failed to upload content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeContent = async (contentId) => {
    try {
      setLoading(true);
      const response = await api.post(`/notebooks/${selectedNotebook._id}/content/${contentId}/analyze`);
      // Refresh notebook data to get updated insights
      const notebookResponse = await api.get(`/notebooks/${selectedNotebook._id}`);
      setSelectedNotebook(notebookResponse.data);
    } catch (error) {
      console.error('Failed to analyze content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConversation = async () => {
    try {
      setLoading(true);
      const response = await api.post(`/notebooks/${selectedNotebook._id}/conversations`, {
        title: 'New Conversation'
      });
      
      // Refresh notebook data
      const notebookResponse = await api.get(`/notebooks/${selectedNotebook._id}`);
      setSelectedNotebook(notebookResponse.data);
      setSelectedConversation(response.data);
      setMessages([]); // Clear messages for new conversation
      setActiveTab('chat');
    } catch (error) {
      console.error('Failed to create conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = async (conversation) => {
    try {
      setLoading(true);
      const response = await api.get(`/notebooks/${selectedNotebook._id}/conversations/${conversation._id}/messages`);
      setMessages(response.data);
      setSelectedConversation(conversation);
      setActiveTab('chat');
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setLoading(true);
      await api.post(`/notebooks/${selectedNotebook._id}/conversations/${selectedConversation._id}/messages`, {
        message: newMessage
      });
      // Reload messages after sending
      const response = await api.get(`/notebooks/${selectedNotebook._id}/conversations/${selectedConversation._id}/messages`);
      setMessages(response.data);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImportanceColor = (importance) => {
    switch (importance) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-pixel text-pixelYellow mb-2">Study Notebooks</h1>
        <p className="text-pixelGray">NotebookLM-style study assistant with AI-powered insights</p>
      </div>

      {/* Main Navigation */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('notebooks')}
          className={`px-4 py-2 rounded border-2 font-pixel transition-all ${
            activeTab === 'notebooks' 
              ? 'bg-pixelYellow text-pixelGray border-pixelYellow' 
              : 'border-pixelYellow text-pixelYellow hover:bg-pixelYellow hover:text-pixelGray'
          }`}
        >
          Notebooks
        </button>
        {selectedNotebook && (
          <>
            <button
              onClick={() => setActiveTab('content')}
              className={`px-4 py-2 rounded border-2 font-pixel transition-all ${
                activeTab === 'content' 
                  ? 'bg-pixelYellow text-pixelGray border-pixelYellow' 
                  : 'border-pixelYellow text-pixelYellow hover:bg-pixelYellow hover:text-pixelGray'
              }`}
            >
              Content
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2 rounded border-2 font-pixel transition-all ${
                activeTab === 'chat' 
                  ? 'bg-pixelYellow text-pixelGray border-pixelYellow' 
                  : 'border-pixelYellow text-pixelYellow hover:bg-pixelYellow hover:text-pixelGray'
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`px-4 py-2 rounded border-2 font-pixel transition-all ${
                activeTab === 'insights' 
                  ? 'bg-pixelYellow text-pixelGray border-pixelYellow' 
                  : 'border-pixelYellow text-pixelYellow hover:bg-pixelYellow hover:text-pixelGray'
              }`}
            >
              Insights
            </button>
          </>
        )}
      </div>

      {/* Create Notebook Button */}
      {activeTab === 'notebooks' && (
        <div className="mb-6">
          <button
            onClick={() => setShowCreateNotebook(true)}
            className="px-6 py-3 bg-pixelGreen text-white border-2 border-pixelYellow rounded font-pixel text-lg shadow-pixel hover:bg-pixelBlue transition-all"
          >
            + Create New Notebook
          </button>
        </div>
      )}

      {/* Create Notebook Modal */}
      {showCreateNotebook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-pixelGray p-6 rounded-lg border-2 border-pixelYellow max-w-md w-full mx-4">
            <h2 className="text-2xl font-pixel text-pixelYellow mb-4">Create New Notebook</h2>
            <form onSubmit={handleCreateNotebook} className="space-y-4">
              <div>
                <label className="block text-pixelYellow font-pixel mb-2">Title</label>
                <input
                  type="text"
                  value={notebookForm.title}
                  onChange={(e) => setNotebookForm({...notebookForm, title: e.target.value})}
                  className="w-full p-2 border-2 border-pixelYellow rounded bg-pixelGray text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-pixelYellow font-pixel mb-2">Description</label>
                <textarea
                  value={notebookForm.description}
                  onChange={(e) => setNotebookForm({...notebookForm, description: e.target.value})}
                  className="w-full p-2 border-2 border-pixelYellow rounded bg-pixelGray text-white"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-pixelYellow font-pixel mb-2">Subject</label>
                <input
                  type="text"
                  value={notebookForm.subject}
                  onChange={(e) => setNotebookForm({...notebookForm, subject: e.target.value})}
                  className="w-full p-2 border-2 border-pixelYellow rounded bg-pixelGray text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-pixelYellow font-pixel mb-2">Course (optional)</label>
                <input
                  type="text"
                  value={notebookForm.course}
                  onChange={(e) => setNotebookForm({...notebookForm, course: e.target.value})}
                  className="w-full p-2 border-2 border-pixelYellow rounded bg-pixelGray text-white"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-pixelGreen text-white border-2 border-pixelYellow rounded font-pixel hover:bg-pixelBlue transition-all disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Notebook'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateNotebook(false)}
                  className="flex-1 px-4 py-2 bg-pixelRed text-white border-2 border-pixelYellow rounded font-pixel hover:bg-pixelOrange transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notebooks List */}
      {activeTab === 'notebooks' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {notebooks.map(notebook => (
            <div 
              key={notebook._id} 
              className="bg-pixelGray p-4 rounded-lg border-2 border-pixelYellow cursor-pointer hover:border-pixelGreen transition-all"
              onClick={() => handleSelectNotebook(notebook)}
            >
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: notebook.color }}
                ></div>
                <h3 className="text-lg font-pixel text-pixelYellow">{notebook.title}</h3>
              </div>
              <p className="text-pixelGray text-sm mb-2">{notebook.description}</p>
              <div className="flex gap-2 mb-2">
                <span className="px-2 py-1 rounded text-xs font-pixel bg-pixelBlue">
                  {notebook.subject}
                </span>
                {notebook.course && (
                  <span className="px-2 py-1 rounded text-xs font-pixel bg-pixelGreen">
                    {notebook.course}
                  </span>
                )}
              </div>
              <div className="text-xs text-pixelGray">
                {notebook.stats?.contentItems || 0} items • {notebook.stats?.conversations || 0} conversations
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content Management */}
      {activeTab === 'content' && selectedNotebook && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-pixel text-pixelYellow">
              {selectedNotebook.title} - Content
            </h2>
            <button
              onClick={() => setShowUploadContent(true)}
              className="px-4 py-2 bg-pixelBlue text-white border-2 border-pixelYellow rounded font-pixel hover:bg-pixelGreen transition-all"
            >
              + Add Content
            </button>
          </div>

          {/* Upload Content Modal */}
          {showUploadContent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-pixelGray p-6 rounded-lg border-2 border-pixelYellow max-w-md w-full mx-4">
                <h2 className="text-2xl font-pixel text-pixelYellow mb-4">Add Content</h2>
                <form onSubmit={handleUploadContent} className="space-y-4">
                  <div>
                    <label className="block text-pixelYellow font-pixel mb-2">Title</label>
                    <input
                      type="text"
                      value={contentForm.title}
                      onChange={(e) => setContentForm({...contentForm, title: e.target.value})}
                      className="w-full p-2 border-2 border-pixelYellow rounded bg-pixelGray text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-pixelYellow font-pixel mb-2">Type</label>
                    <select
                      value={contentForm.type}
                      onChange={(e) => setContentForm({...contentForm, type: e.target.value})}
                      className="w-full p-2 border-2 border-pixelYellow rounded bg-pixelGray text-white"
                    >
                      <option value="text">Text</option>
                      <option value="pdf">PDF</option>
                      <option value="image">Image</option>
                      <option value="link">Link</option>
                      <option value="note">Note</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-pixelYellow font-pixel mb-2">Content</label>
                    <textarea
                      value={contentForm.content}
                      onChange={(e) => setContentForm({...contentForm, content: e.target.value})}
                      className="w-full p-2 border-2 border-pixelYellow rounded bg-pixelGray text-white"
                      rows="4"
                    />
                  </div>
                  <div>
                    <label className="block text-pixelYellow font-pixel mb-2">File Upload</label>
                    <input
                      id="file-upload"
                      type="file"
                      className="w-full p-2 border-2 border-pixelYellow rounded bg-pixelGray text-white"
                      accept=".pdf,.jpg,.jpeg,.png,.txt,.doc,.docx"
                    />
                  </div>
                  <div>
                    <label className="block text-pixelYellow font-pixel mb-2">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={contentForm.tags}
                      onChange={(e) => setContentForm({...contentForm, tags: e.target.value})}
                      className="w-full p-2 border-2 border-pixelYellow rounded bg-pixelGray text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-pixelYellow font-pixel mb-2">Importance</label>
                    <select
                      value={contentForm.importance}
                      onChange={(e) => setContentForm({...contentForm, importance: e.target.value})}
                      className="w-full p-2 border-2 border-pixelYellow rounded bg-pixelGray text-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-pixelGreen text-white border-2 border-pixelYellow rounded font-pixel hover:bg-pixelBlue transition-all disabled:opacity-50"
                    >
                      {loading ? 'Uploading...' : 'Upload Content'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowUploadContent(false)}
                      className="flex-1 px-4 py-2 bg-pixelRed text-white border-2 border-pixelYellow rounded font-pixel hover:bg-pixelOrange transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Content List */}
          <div className="grid gap-4">
            {selectedNotebook.content?.map((item, index) => (
              <div key={item._id || index} className="bg-pixelDark p-4 rounded-lg border-2 border-pixelYellow">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-pixel text-pixelYellow">{item.title}</h3>
                    <p className="text-pixelGray text-sm">{item.content}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-pixel ${getImportanceColor(item.importance)}`}>
                      {item.importance}
                    </span>
                    <span className="px-2 py-1 rounded text-xs font-pixel bg-pixelBlue">
                      {item.type}
                    </span>
                  </div>
                </div>
                {item.tags?.length > 0 && (
                  <div className="flex gap-1 mb-2">
                    {item.tags.map((tag, tagIndex) => (
                      <span key={tagIndex} className="px-2 py-1 rounded text-xs font-pixel bg-pixelGreen">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAnalyzeContent(item._id)}
                    disabled={loading}
                    className="px-3 py-1 bg-pixelBlue text-white rounded text-xs font-pixel hover:bg-pixelGreen transition-all disabled:opacity-50"
                  >
                    {loading ? 'Analyzing...' : '🤖 AI Analyze'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat Interface */}
      {activeTab === 'chat' && selectedNotebook && (
        <div className="h-[600px] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-pixel text-pixelYellow">
              {selectedNotebook.title} - Chat
            </h2>
            <button
              onClick={handleCreateConversation}
              disabled={loading}
              className="px-4 py-2 bg-pixelGreen text-white border-2 border-pixelYellow rounded font-pixel hover:bg-pixelBlue transition-all disabled:opacity-50"
            >
              + New Conversation
            </button>
          </div>

          <div className="flex gap-4 h-full">
            {/* Conversations Sidebar */}
            <div className="w-1/3 bg-pixelDark p-4 rounded-lg border-2 border-pixelYellow">
              <h3 className="text-lg font-pixel text-pixelYellow mb-3">Conversations</h3>
              <div className="space-y-2">
                {selectedNotebook.conversations?.map((conversation, index) => (
                  <div
                    key={conversation._id || index}
                    className={`p-2 rounded cursor-pointer transition-all ${
                      selectedConversation?._id === conversation._id
                        ? 'bg-pixelYellow text-pixelGray'
                        : 'bg-pixelGray text-pixelYellow hover:bg-pixelBlue'
                    }`}
                    onClick={() => handleSelectConversation(conversation)}
                  >
                    <p className="font-pixel text-sm">{conversation.title}</p>
                    <p className="text-xs text-pixelGray">
                      {conversation.messages?.length || 0} messages
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 bg-pixelDark p-4 rounded-lg border-2 border-pixelYellow flex flex-col">
              {selectedConversation ? (
                <>
                  <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-pixelBlue text-white'
                              : 'bg-pixelGray text-pixelYellow'
                          }`}
                        >
                          <p className="font-pixel text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {loading && newMessage.trim() && (
                      <div className="flex justify-start">
                        <div className="bg-pixelGray/80 border-2 border-pixelYellow rounded-lg px-3 py-2 flex items-center gap-2">
                          <div className="w-2 h-2 bg-pixelYellow rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-pixelYellow rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-pixelYellow rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <span className="text-pixelYellow font-pixel text-xs ml-2">AI is typing...</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Ask about your study materials..."
                      className="flex-1 p-2 border-2 border-pixelYellow rounded bg-pixelGray text-white font-pixel"
                      disabled={loading}
                    />
                    <button
                      type="submit"
                      disabled={loading || !newMessage.trim()}
                      className="px-4 py-2 bg-pixelGreen text-white border-2 border-pixelYellow rounded font-pixel hover:bg-pixelBlue transition-all disabled:opacity-50"
                    >
                      {loading ? 'Sending...' : 'Send'}
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-pixelGray font-pixel">Select a conversation to start chatting</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Insights */}
      {activeTab === 'insights' && selectedNotebook && (
        <div className="space-y-4">
          <h2 className="text-2xl font-pixel text-pixelYellow">
            {selectedNotebook.title} - Insights
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-pixelDark p-4 rounded-lg border-2 border-pixelYellow">
              <h3 className="text-lg font-pixel text-pixelYellow mb-3">Statistics</h3>
              <div className="space-y-2">
                <p className="text-pixelGray">Total study time: {selectedNotebook.stats?.totalStudyTime || 0} minutes</p>
                <p className="text-pixelGray">Content items: {selectedNotebook.stats?.contentItems || 0}</p>
                <p className="text-pixelGray">Conversations: {selectedNotebook.stats?.conversations || 0}</p>
              </div>
            </div>
            <div className="bg-pixelDark p-4 rounded-lg border-2 border-pixelYellow">
              <h3 className="text-lg font-pixel text-pixelYellow mb-3">Recent Insights</h3>
              <div className="space-y-2">
                {selectedNotebook.insights?.slice(-3).map((insight, index) => (
                  <div key={index} className="p-2 bg-pixelGray rounded">
                    <p className="text-pixelYellow font-pixel text-sm">{insight.type}</p>
                    <p className="text-pixelGray text-xs">{insight.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyNotebook; 