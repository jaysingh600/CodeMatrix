import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, Code, CheckCircle, Plus, Users, ArrowLeft, LogIn, MessageSquare, Reply, FileCode2, Edit2, Trash2 } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import Editor from "@monaco-editor/react";
import { useAuth } from '../../context/AuthContext';
import { useGamification } from '../../context/GamificationContext';
import { chatApi } from '../../api/chatApi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Button } from '../ui/button';

const ChatRoomDrawer = ({ isOpen, onClose, problem, initialTab = 'global', code = '', language = 'javascript' }) => {
  const { user } = useAuth();
  const { socket } = useGamification() || {};
  
  const [activeTab, setActiveTab] = useState(initialTab); // 'global' or 'private'
  const [privateMode, setPrivateMode] = useState('list'); // 'list', 'create', 'join', 'chat'
  
  const [globalRoom, setGlobalRoom] = useState(null);
  const [privateRooms, setPrivateRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null); // The currently active room (global or private)
  
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);

  // Advanced Input Mode
  const [isCodeMode, setIsCodeMode] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState(language);
  
  // Create / Join Room state
  const [newRoomName, setNewRoomName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  
  // Message Actions
  const [replyTo, setReplyTo] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  
  // UI States
  const [showMembers, setShowMembers] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
    if (initialTab === 'private') {
      setPrivateMode('list');
      fetchPrivateRooms();
      setActiveRoom(null);
    }
  }, [initialTab, isOpen]);

  useEffect(() => {
    if (activeTab === 'global' && problem && isOpen) {
      initGlobalRoom();
    }
  }, [activeTab, problem, isOpen]);

  const initGlobalRoom = async () => {
    try {
      const roomData = await chatApi.getProblemRoom(problem._id);
      setGlobalRoom(roomData);
      joinRoom(roomData._id, roomData);
    } catch (error) {
      console.error("Failed to init global room", error);
    }
  };

  const fetchPrivateRooms = async () => {
    try {
      const rooms = await chatApi.getUserRooms();
      setPrivateRooms(rooms);
    } catch (error) {
      console.error("Failed to fetch private rooms", error);
    }
  };

  const joinRoom = async (roomId, roomData) => {
    setActiveRoom(roomData);
    setPrivateMode('chat');
    
    try {
      const history = await chatApi.getRoomMessages(roomId);
      setMessages(history);

      if (socket) {
        socket.emit('join-room', roomId);
      }
    } catch (error) {
      console.error("Failed to load room messages", error);
    }
  };

  useEffect(() => {
    if (socket && isOpen) {
      const handleReceiveMsg = (msg) => {
        setMessages((prev) => {
          // Check if it's an edited message (same ID)
          const exists = prev.findIndex(m => m._id === msg._id);
          if (exists >= 0) {
            const updated = [...prev];
            updated[exists] = msg;
            return updated;
          }
          return [...prev, msg];
        });
        scrollToBottom();
      };

      const handleMessageDeleted = (messageId) => {
        setMessages(prev => prev.filter(m => m._id !== messageId));
      };

      socket.on('receive-message', handleReceiveMsg);
      socket.on('message-deleted', handleMessageDeleted);
      socket.on('online-users-update', setOnlineUsers);
      socket.on('system-message', (text) => {
        setMessages((prev) => [...prev, { _id: Date.now().toString(), senderType: 'system', message: text, createdAt: new Date() }]);
        scrollToBottom();
      });

      socket.on('typing-indicator', ({ userId, username, isTyping }) => {
        setTypingUsers(prev => {
          if (isTyping) {
            if (!prev.find(u => u.userId === userId)) return [...prev, { userId, username }];
            return prev;
          } else {
            return prev.filter(u => u.userId !== userId);
          }
        });
      });

      socket.on('message-reaction-update', ({ messageId, reactions }) => {
        setMessages(prev => prev.map(m => m._id === messageId ? { ...m, reactions } : m));
      });

      return () => {
        socket.off('receive-message', handleReceiveMsg);
        socket.off('message-deleted', handleMessageDeleted);
        socket.off('online-users-update');
        socket.off('system-message');
        socket.off('typing-indicator');
        socket.off('message-reaction-update');
      };
    }
  }, [socket, isOpen]);

  // Leave room when drawer closes or active room changes
  useEffect(() => {
    return () => {
      if (socket && activeRoom) {
        socket.emit('leave-room', activeRoom._id);
      }
    };
  }, [activeRoom, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, privateMode]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSend = async () => {
    if (!inputValue.trim() || !activeRoom) return;

    if (editingMessageId) {
      try {
        await chatApi.editMessage(editingMessageId, inputValue);
        if (socket) {
          socket.emit('edit-message', { roomId: activeRoom._id, messageId: editingMessageId, newContent: inputValue });
        }
        setEditingMessageId(null);
      } catch (error) {
        toast.error('Failed to edit message');
      }
    } else {
      socket.emit('send-message', {
        roomId: activeRoom._id,
        problemId: problem?._id, // Attach problemId if discussing a specific problem
        message: inputValue,
        messageType: isCodeMode ? 'code' : 'text',
        language: isCodeMode ? codeLanguage : undefined,
        replyTo: replyTo?._id
      });
    }

    setInputValue('');
    setReplyTo(null);
    if (socket) socket.emit('typing', { roomId: activeRoom._id, isTyping: false });
  };

  const handleDeleteMessage = async (msgId) => {
    try {
      await chatApi.deleteMessage(msgId);
      if (socket) {
        socket.emit('delete-message', { roomId: activeRoom._id, messageId: msgId });
      }
    } catch (e) {
      toast.error('Failed to delete message');
    }
  };

  const handleCreateRoom = async () => {
    try {
      const res = await chatApi.createPrivateRoom({ name: newRoomName });
      toast.success(`Room created! Code: ${res.roomCode}`);
      setNewRoomName('');
      fetchPrivateRooms();
      joinRoom(res._id, res);
    } catch (e) {
      toast.error('Failed to create room');
    }
  };

  const handleJoinRoom = async () => {
    try {
      const res = await chatApi.joinPrivateRoom(joinCode);
      toast.success(`Joined room: ${res.name}`);
      setJoinCode('');
      fetchPrivateRooms();
      joinRoom(res._id, res);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to join room');
    }
  };

  const handleGenerateOTP = async () => {
    if (!activeRoom) return;
    try {
      const res = await chatApi.generateOTP(activeRoom._id);
      setActiveRoom(res);
      toast.success(`Generated new OTP: ${res.roomCode}`);
    } catch (e) {
      toast.error('Failed to generate OTP');
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (socket) {
      socket.emit('typing', { roomId: activeRoom?._id, isTyping: e.target.value.trim().length > 0 });
    }
  };

  const handleReaction = (messageId, emoji) => {
    if (socket) socket.emit('react-message', { messageId, roomId: activeRoom._id, emoji });
  };

  const shareCurrentCode = () => {
    setInputValue(code);
    setIsCodeMode(true);
    setCodeLanguage(language);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed top-0 right-0 h-full w-[450px] bg-[#0f111a] border-l border-border shadow-2xl z-50 flex flex-col"
        >
          {/* Header */}
          <div className="flex flex-col border-b border-border bg-card">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/50 text-primary">
                  {activeTab === 'global' ? <Users className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground line-clamp-1">
                    {activeTab === 'global' ? 'Global Discussion' : activeRoom ? activeRoom.name : 'Private Rooms'}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {activeTab === 'global' && problem ? problem.title : activeRoom && `${onlineUsers.length} online`}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Tabs */}
            {(!activeRoom || activeTab === 'private') && (
              <div className="flex border-t border-border mt-auto">
                <button 
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${activeTab === 'global' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:bg-muted/50'}`}
                  onClick={() => {
                    setActiveTab('global');
                    if (activeRoom && activeRoom.type === 'private' && socket) {
                      socket.emit('leave-room', activeRoom._id);
                    }
                  }}
                >
                  Global Room
                </button>
                <button 
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${activeTab === 'private' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:bg-muted/50'}`}
                  onClick={() => {
                    setActiveTab('private');
                    setPrivateMode(activeRoom ? 'chat' : 'list');
                  }}
                >
                  Private Rooms
                </button>
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-hidden flex flex-col bg-background relative">
            
            {/* Private Room List Mode */}
            {activeTab === 'private' && privateMode === 'list' && (
              <div className="p-4 overflow-y-auto h-full flex flex-col space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-14 flex flex-col gap-1" onClick={() => setPrivateMode('create')}>
                    <Plus className="w-4 h-4" /> Create Room
                  </Button>
                  <Button variant="outline" className="h-14 flex flex-col gap-1" onClick={() => setPrivateMode('join')}>
                    <LogIn className="w-4 h-4" /> Enter OTP
                  </Button>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-3">Your Rooms</h4>
                  <div className="space-y-2">
                    {privateRooms.length === 0 ? (
                      <p className="text-sm text-center text-muted-foreground py-8">No active rooms.</p>
                    ) : (
                      privateRooms.map(room => (
                        <div 
                          key={room._id} 
                          onClick={() => joinRoom(room._id, room)}
                          className="bg-card border border-border rounded-lg p-3 cursor-pointer hover:border-primary/50 transition-colors flex justify-between items-center"
                        >
                          <div>
                            <p className="font-medium text-foreground">{room.name}</p>
                            <p className="text-xs text-muted-foreground">{room.participants.length} members</p>
                          </div>
                          <code className="text-xs font-mono bg-muted px-2 py-1 rounded text-primary">{room.roomCode}</code>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Private Room Create Mode */}
            {activeTab === 'private' && privateMode === 'create' && (
              <div className="p-6 h-full flex flex-col">
                <button onClick={() => setPrivateMode('list')} className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </button>
                <h3 className="text-xl font-bold mb-4">Create Room</h3>
                <div className="space-y-4">
                  <input 
                    className="w-full bg-muted border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:border-primary"
                    placeholder="Room Name"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                  />
                  <Button className="w-full" onClick={handleCreateRoom} disabled={!newRoomName.trim()}>Create</Button>
                </div>
              </div>
            )}

            {/* Private Room Join Mode */}
            {activeTab === 'private' && privateMode === 'join' && (
              <div className="p-6 h-full flex flex-col">
                <button onClick={() => setPrivateMode('list')} className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </button>
                <h3 className="text-xl font-bold mb-4">Enter OTP to Join</h3>
                <div className="space-y-4">
                  <input 
                    className="w-full bg-muted border border-border rounded-md px-3 py-2 text-center text-2xl tracking-widest font-mono text-foreground focus:outline-none focus:border-primary"
                    placeholder="000000"
                    maxLength={6}
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                  />
                  <Button className="w-full" onClick={handleJoinRoom} disabled={joinCode.length !== 6}>Join</Button>
                </div>
              </div>
            )}

            {/* Chat Mode (Global or inside a Private Room) */}
            {((activeTab === 'global' && globalRoom) || (activeTab === 'private' && privateMode === 'chat' && activeRoom)) && (
              <>
                {/* Back button for private rooms */}
                {activeTab === 'private' && (
                  <div className="px-4 py-2 bg-card border-b border-border flex items-center justify-between shadow-sm z-10 shrink-0">
                    <button onClick={() => {
                      if (socket) socket.emit('leave-room', activeRoom._id);
                      setActiveRoom(null);
                      setPrivateMode('list');
                      setShowMembers(false);
                    }} className="flex items-center text-sm text-muted-foreground hover:text-foreground">
                      <ArrowLeft className="w-4 h-4 mr-1" /> Back to Rooms
                    </button>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setShowMembers(!showMembers)}>
                        <Users className="w-3.5 h-3.5 mr-1" /> Members
                      </Button>
                      <div className="flex items-center bg-muted px-2 py-1 rounded">
                        <code className="text-xs mr-2">{activeRoom.roomCode}</code>
                        <button onClick={handleGenerateOTP} className="text-[10px] bg-primary/20 text-primary hover:bg-primary/30 px-1.5 py-0.5 rounded transition-colors uppercase font-bold">
                          Generate OTP
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {showMembers ? (
                  <div className="flex-1 overflow-y-auto p-4 bg-background">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-4 border-b border-border pb-2">Room Members ({activeRoom?.participants?.length || 0})</h4>
                    <div className="space-y-3">
                      {activeRoom?.participants?.map(p => {
                        const isOnline = onlineUsers.includes(p._id);
                        return (
                          <div key={p._id} className="flex items-center gap-3 bg-card p-2 rounded-lg border border-border">
                            <div className="relative">
                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center border border-border">
                                <span className="text-xs font-medium text-foreground">
                                  {p.username?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-card ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{p.username} {p._id === user?._id && '(You)'}</span>
                              <span className="text-[10px] text-muted-foreground">{isOnline ? 'Online' : 'Offline'}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col" data-color-mode="dark">
                  {messages.map((msg, idx) => {
                    if (msg.senderType === 'system') {
                      return (
                        <div key={idx} className="flex justify-center my-4">
                          <span className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border border-border">
                            {msg.message}
                          </span>
                        </div>
                      );
                    }

                    const isMe = msg.sender?._id === user?._id;
                    const isAi = msg.senderType === 'ai';

                    return (
                      <div key={msg._id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex max-w-[90%] ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                          
                          {/* Avatar */}
                          <div className="flex-shrink-0">
                            {isAi ? (
                              <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/50">
                                <Bot className="h-4 w-4 text-indigo-400" />
                              </div>
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center border border-border">
                                <span className="text-xs font-medium text-foreground">
                                  {msg.sender?.username?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Bubble Container */}
                          <div className={`group flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            <div className="flex items-center gap-2 mb-1 px-1">
                              <span className="text-xs text-muted-foreground font-medium">
                                {isAi ? 'CodeMatrix Mentor' : msg.sender?.username}
                              </span>
                              <span className="text-[10px] text-muted-foreground/70">
                                {msg.createdAt ? format(new Date(msg.createdAt), 'h:mm a') : ''}
                                {msg.isEdited && ' (edited)'}
                              </span>
                            </div>
                            
                            {/* Reply context */}
                            {msg.replyTo && (
                              <div className={`text-xs p-2 rounded-md mb-1 opacity-80 ${isMe ? 'bg-primary/20 text-primary-foreground border border-primary/30' : 'bg-muted border border-border'}`}>
                                <div className="font-bold opacity-70 flex items-center gap-1">
                                  <Reply className="w-3 h-3" /> {msg.replyTo.sender?.username}
                                </div>
                                <div className="line-clamp-1">{msg.replyTo.message}</div>
                              </div>
                            )}

                            <div className={`relative px-4 py-3 rounded-2xl w-full ${
                              isAi ? 'bg-indigo-900/40 border border-indigo-500/30 text-indigo-100 rounded-bl-none' 
                              : msg.messageType === 'code' ? 'bg-black/50 border border-border rounded-lg p-0 overflow-hidden w-[350px]'
                              : isMe ? 'bg-primary text-primary-foreground rounded-br-none' 
                              : 'bg-card border border-border text-foreground rounded-bl-none'
                            }`}>
                              
                              {msg.isSolution && (
                                <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold mb-2 pb-2 border-b border-emerald-400/20 px-4 pt-3">
                                  <CheckCircle className="h-3 w-3" /> Accepted Explanation
                                </div>
                              )}

                              {msg.messageType === 'code' ? (
                                <div>
                                  <div className="bg-muted px-3 py-1 text-[10px] font-mono text-muted-foreground flex justify-between items-center border-b border-border">
                                    <span>{msg.language || 'javascript'}</span>
                                  </div>
                                  <div className="p-3">
                                    <Editor
                                      height={Math.min(msg.message.split('\n').length * 20 + 20, 250)}
                                      language={msg.language}
                                      theme="vs-dark"
                                      value={msg.message}
                                      options={{ readOnly: true, minimap: { enabled: false }, scrollBeyondLastLine: false, fontSize: 12, padding: { top: 8 } }}
                                    />
                                  </div>
                                </div>
                              ) : (
                                <div className="prose prose-invert prose-sm max-w-none">
                                  <MDEditor.Markdown source={msg.message} style={{ background: 'transparent', color: 'inherit' }} />
                                </div>
                              )}

                              {/* Reactions */}
                              {msg.reactions && msg.reactions.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {Array.from(new Set(msg.reactions.map(r => r.emoji))).map(emoji => {
                                    const count = msg.reactions.filter(r => r.emoji === emoji).length;
                                    const hasReacted = msg.reactions.some(r => r.emoji === emoji && r.userId._id === user._id);
                                    return (
                                      <button 
                                        key={emoji}
                                        onClick={() => handleReaction(msg._id, emoji)}
                                        className={`text-[11px] px-1.5 py-0.5 rounded-full flex items-center gap-1 border ${
                                          hasReacted ? 'bg-primary/20 border-primary/50 text-primary-foreground' : 'bg-muted border-border'
                                        }`}
                                      >
                                        {emoji} {count > 1 && count}
                                      </button>
                                    )
                                  })}
                                </div>
                              )}
                            </div>

                            {/* Message Actions */}
                            <div className={`opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 mt-1 ${isMe ? 'mr-2' : 'ml-2'}`}>
                              <button onClick={() => setReplyTo(msg)} className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors" title="Reply"><Reply className="w-3.5 h-3.5" /></button>
                              <button onClick={() => handleReaction(msg._id, '👍')} className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors">👍</button>
                              {isMe && msg.messageType !== 'code' && (
                                <button onClick={() => { setEditingMessageId(msg._id); setInputValue(msg.message); setIsCodeMode(false); }} className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors" title="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                              )}
                              {isMe && (
                                <button onClick={() => handleDeleteMessage(msg._id)} className="p-1 hover:bg-destructive/20 rounded text-destructive transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {typingUsers.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground italic pl-10">
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce delay-100"></div>
                        <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce delay-200"></div>
                      </div>
                      {typingUsers.map(u => u.username).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
                )}

                {/* Input Area */}
                {!showMembers && (
                <div className="p-3 border-t border-border bg-card shrink-0">
                  {replyTo && (
                    <div className="flex justify-between items-center bg-muted p-2 rounded-md mb-2 text-xs">
                      <div className="flex items-center gap-2 text-muted-foreground line-clamp-1">
                        <Reply className="w-3 h-3" /> Replying to <span className="font-bold text-foreground">{replyTo.sender?.username}</span>
                      </div>
                      <button onClick={() => setReplyTo(null)} className="text-muted-foreground hover:text-foreground"><X className="w-3 h-3" /></button>
                    </div>
                  )}
                  
                  {editingMessageId && (
                    <div className="flex justify-between items-center bg-primary/10 p-2 rounded-md mb-2 text-xs border border-primary/20">
                      <div className="flex items-center gap-2 text-primary font-medium">
                        <Edit2 className="w-3 h-3" /> Editing message
                      </div>
                      <button onClick={() => { setEditingMessageId(null); setInputValue(''); }} className="text-muted-foreground hover:text-foreground"><X className="w-3 h-3" /></button>
                    </div>
                  )}

                  <div className="relative flex flex-col bg-background rounded-xl border border-border focus-within:border-primary transition-all">
                    
                    {!editingMessageId && (
                      <div className="flex items-center px-2 py-1 bg-muted/30 border-b border-border w-full rounded-t-xl shrink-0">
                        <div className="flex items-center gap-1 bg-muted p-0.5 rounded-md">
                          <button 
                            onClick={() => setIsCodeMode(false)}
                            className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${!isCodeMode ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                          >
                            Text
                          </button>
                          <button 
                            onClick={() => setIsCodeMode(true)}
                            className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors flex items-center gap-1 ${isCodeMode ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                          >
                            <Code className="h-3 w-3" /> Code
                          </button>
                        </div>
                        {isCodeMode && (
                          <select 
                            className="bg-transparent text-xs ml-2 focus:outline-none text-muted-foreground"
                            value={codeLanguage}
                            onChange={(e) => setCodeLanguage(e.target.value)}
                          >
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                            <option value="java">Java</option>
                            <option value="cpp">C++</option>
                          </select>
                        )}
                        {/* Quick share button for code in Problem view */}
                        {!isCodeMode && code && (
                           <button 
                             onClick={shareCurrentCode}
                             className="p-1.5 ml-1 rounded-md text-emerald-500 hover:bg-emerald-500/10 transition-colors flex items-center gap-1 text-xs font-medium"
                             title="Share current editor code"
                           >
                             <FileCode2 className="h-4 w-4" /> Share Code
                           </button>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-end w-full">
                      {isCodeMode ? (
                        <div className="flex-1 p-2 h-32">
                          <Editor
                            height="100%"
                            language={codeLanguage === 'c++' ? 'cpp' : codeLanguage}
                            theme="vs-dark"
                            value={inputValue}
                            onChange={(val) => setInputValue(val || '')}
                            options={{ minimap: { enabled: false }, lineNumbers: 'off', scrollBeyondLastLine: false, fontSize: 12 }}
                          />
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={inputValue}
                          onChange={handleInputChange}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSend();
                            }
                          }}
                          placeholder={editingMessageId ? "Edit message..." : "Message room or @mentor..."}
                          className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none px-3 py-3 h-12 text-sm"
                        />
                      )}
                      
                      <button 
                        onClick={handleSend}
                        disabled={!inputValue.trim()}
                        className="p-3 text-primary hover:text-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatRoomDrawer;
