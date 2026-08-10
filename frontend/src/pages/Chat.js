import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
  fetchConversations, fetchMessages, startConversation, checkChatAccess,
  setActiveConversation, addIncomingMessage, setPresence, setTyping, clearAccessCheck,
} from '../redux/slices/chatSlice';
import { connectSocket, getSocket, disconnectSocket } from '../utils/socket';
import API from '../utils/api';
import './Chat.css';

export default function Chat() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { user, token } = useSelector(s => s.auth);
  const { conversations, activeConversation, messages, onlineUsers, typingUsers, accessCheck } = useSelector(s => s.chat);
  const [text, setText] = useState('');
  const bottomRef = useRef(null);
  const startWithUserId = searchParams.get('with');

  useEffect(() => {
    if (!token) return;
    const socket = connectSocket(token);
    socket.on('message:new', (msg) => dispatch(addIncomingMessage(msg)));
    socket.on('presence:update', (p) => dispatch(setPresence(p)));
    socket.on('typing:update', (t) => dispatch(setTyping(t)));
    socket.on('error:message', (m) => alert(m));
    return () => { disconnectSocket(); };
  }, [token, dispatch]);

  useEffect(() => { dispatch(fetchConversations()); }, [dispatch]);

  useEffect(() => {
    if (startWithUserId) {
      dispatch(checkChatAccess(startWithUserId)).then((res) => {
        if (res.payload?.allowed) dispatch(startConversation(startWithUserId));
      });
    }
    return () => { dispatch(clearAccessCheck()); };
  }, [startWithUserId, dispatch]);

  useEffect(() => {
    if (!activeConversation) return;
    const socket = getSocket();
    socket?.emit('conversation:join', activeConversation._id);
    dispatch(fetchMessages(activeConversation._id));
    return () => { socket?.emit('conversation:leave', activeConversation._id); };
  }, [activeConversation, dispatch]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const otherParticipant = (c) => c.participants.find(p => p._id !== user._id);

  const contactSupport = async () => {
    const res = await API.get('/chat/support');
    if (res.data?.admin) dispatch(startConversation(res.data.admin._id));
  };

  const send = () => {
    if (!text.trim() || !activeConversation) return;
    getSocket()?.emit('message:send', { conversationId: activeConversation._id, text: text.trim() });
    setText('');
  };

  const onTyping = (val) => {
    setText(val);
    const socket = getSocket();
    if (!activeConversation) return;
    socket?.emit('typing:start', { conversationId: activeConversation._id });
    clearTimeout(window.__typingTimeout);
    window.__typingTimeout = setTimeout(() => socket?.emit('typing:stop', { conversationId: activeConversation._id }), 1500);
  };

  const otherIsTyping = activeConversation && typingUsers[otherParticipant(activeConversation)?._id];

  return (
    <div className="chat-shell">
      <div className={`chat-list-pane ${activeConversation ? 'has-active' : ''}`}>
        <div className="chat-list-header">
          <h3>💬 Messages</h3>
          {(user?.role === 'student' || user?.role === 'tutor') && (
            <button className="chat-support-btn" onClick={contactSupport}>🛡️ Support</button>
          )}
        </div>

        {startWithUserId && accessCheck && !accessCheck.allowed && (
          <div className="m-3 small" style={{ color: 'var(--color-warning)' }}>{accessCheck.reason}</div>
        )}

        <div className="chat-list">
          {conversations.length === 0 ? (
            <div className="chat-empty-list">
              No conversations yet.<br />
              {user?.role === 'student' && 'Enroll in a course to chat with your tutor, or message support anytime.'}
              {user?.role === 'tutor' && 'Chat unlocks once a student enrolls in your course.'}
              {user?.role === 'admin' && 'Students and tutors can message you anytime.'}
            </div>
          ) : conversations.map(c => {
            const other = otherParticipant(c);
            const isActive = activeConversation?._id === c._id;
            return (
              <div key={c._id} className={`chat-list-item ${isActive ? 'active' : ''}`} onClick={() => dispatch(setActiveConversation(c))}>
                <div className="chat-avatar-wrap">
                  <img src={other?.profilePic || 'https://placehold.co/44'} className="chat-avatar" alt="" />
                  {onlineUsers[other?._id] && <span className="chat-online-dot" />}
                </div>
                <div className="chat-list-text">
                  <div className="chat-list-top-row">
                    <span className="chat-list-name">{other?.name}</span>
                    {c.unreadCount > 0 && <span className="chat-unread-badge">{c.unreadCount}</span>}
                  </div>
                  <span className="chat-list-tag">{c.type === 'support' ? '🛡️ Support' : `📚 ${c.course?.title || 'Course chat'}`}</span>
                  <span className="chat-list-preview">{c.lastMessage || 'No messages yet'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="chat-window">
        {!activeConversation ? (
          <div className="chat-window-empty">
            <div className="text-center">
              <div style={{ fontSize: 40, marginBottom: 8 }}>💬</div>
              <p>Select a conversation to start chatting</p>
            </div>
          </div>
        ) : (
          <>
            <div className="chat-window-header">
              <img src={otherParticipant(activeConversation)?.profilePic || 'https://placehold.co/40'} alt="" />
              <div>
                <span className="chat-window-name">{otherParticipant(activeConversation)?.name}</span>
                <span className="chat-window-status">
                  {onlineUsers[otherParticipant(activeConversation)?._id] ? '🟢 Online' : 'Offline'}
                  {activeConversation.type === 'student_tutor' && activeConversation.course && ` · re: ${activeConversation.course.title}`}
                  {activeConversation.type === 'support' && ' · Support'}
                </span>
              </div>
            </div>

            <div className="chat-messages">
              {messages.map(m => (
                <div key={m._id} className={`chat-bubble-row ${m.sender._id === user._id ? 'mine' : ''}`}>
                  <div className={`chat-bubble ${m.sender._id === user._id ? 'mine' : 'theirs'}`}>
                    <div>{m.text}</div>
                    <div className="chat-bubble-time">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
              ))}
              {otherIsTyping && <div className="chat-typing">Typing...</div>}
              <div ref={bottomRef} />
            </div>

            <div className="chat-input-row">
              <input placeholder="Type a message..." value={text} onChange={e => onTyping(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} />
              <button className="chat-send-btn" onClick={send}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
