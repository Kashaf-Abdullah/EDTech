import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCommunityMessages, addCommunityMessage, updateReactions, setNotice, clearNotice,
} from '../redux/slices/communitySlice';
import { connectSocket, getSocket } from '../utils/socket';
import './Community.css';

const REACTION_EMOJIS = ['👍', '❤️', '😂', '🎉', '👏', '🤔'];
const ROLE_BADGE = {
  admin:   { label: 'Admin',   color: 'var(--color-danger)' },
  tutor:   { label: 'Tutor',   color: 'var(--color-primary)' },
  student: { label: 'Student', color: 'var(--color-accent)' },
};

export default function Community() {
  const dispatch = useDispatch();
  const { user, token } = useSelector(s => s.auth);
  const { messages, notice } = useSelector(s => s.community);
  const [text, setText] = useState('');
  const [openPickerFor, setOpenPickerFor] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => { dispatch(fetchCommunityMessages()); }, [dispatch]);

  useEffect(() => {
    if (!token) return;
    const socket = connectSocket(token);
    socket.emit('community:join');
    const onNew = (msg) => dispatch(addCommunityMessage(msg));
    const onReaction = (data) => dispatch(updateReactions(data));
    const onNotice = (msg) => dispatch(setNotice(msg));
    socket.on('community:new', onNew);
    socket.on('community:reaction', onReaction);
    socket.on('community:notice', onNotice);
    return () => {
      socket.emit('community:leave');
      socket.off('community:new', onNew);
      socket.off('community:reaction', onReaction);
      socket.off('community:notice', onNotice);
    };
  }, [token, dispatch]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => {
    if (notice) { const t = setTimeout(() => dispatch(clearNotice()), 6000); return () => clearTimeout(t); }
  }, [notice, dispatch]);

  const send = () => {
    if (!text.trim()) return;
    getSocket()?.emit('community:send', { text: text.trim() });
    setText('');
  };
  const react = (messageId, emoji) => { getSocket()?.emit('community:react', { messageId, emoji }); setOpenPickerFor(null); };
  const myReactionFor = (msg, emoji) => msg.reactions?.some(r => r.user?._id === user._id && r.emoji === emoji);
  const countFor = (msg, emoji) => msg.reactions?.filter(r => r.emoji === emoji).length || 0;
  const groupedEmojis = (msg) => [...new Set((msg.reactions || []).map(r => r.emoji))];

  return (
    <div className="community-shell">
      <div className="community-header">
        <div className="community-header-icon">🌐</div>
        <div>
          <h3>Community</h3>
          <span>Everyone on EduPak — students &amp; tutors, one room</span>
        </div>
      </div>

      <div className="community-notice-bar">🔒 Phone numbers and email addresses are automatically hidden here for your safety.</div>
      {notice && <div className="community-notice-bar community-notice-info">ℹ️ {notice}</div>}

      <div className="community-feed">
        {messages.length === 0 ? (
          <div className="community-empty">No messages yet. Say hello! 👋</div>
        ) : messages.map(m => {
          const isMe = m.sender?._id === user._id;
          const badge = ROLE_BADGE[m.sender?.role] || ROLE_BADGE.student;
          return (
            <div key={m._id} className={`community-msg-row ${isMe ? 'mine' : ''}`}>
              <div className="community-msg-block">
                <div className="community-msg-with-avatar">
                  {!isMe && <img src={m.sender?.profilePic || 'https://placehold.co/34'} className="community-msg-avatar" alt="" />}
                  <div style={{ flex: 1 }}>
                    {!isMe && (
                      <div className="community-msg-meta" style={{ marginLeft: 0 }}>
                        <span className="community-msg-name">{m.sender?.name}</span>
                        <span className="community-role-badge" style={{ background: badge.color }}>{badge.label}</span>
                      </div>
                    )}
                    <div className={`community-msg-bubble ${isMe ? 'mine' : 'theirs'}`}>
                      <div>{m.text}</div>
                      {m.wasMasked && <div className="community-msg-masked-note">⚠️ part of this message was hidden (contact info not allowed)</div>}
                      <div className="community-msg-time">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                </div>

                <div className="community-reactions" style={{ marginLeft: isMe ? 0 : 44, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                  {groupedEmojis(m).map(emoji => (
                    <button key={emoji} className={`community-reaction-chip ${myReactionFor(m, emoji) ? 'mine' : ''}`} onClick={() => react(m._id, emoji)}>
                      {emoji} {countFor(m, emoji)}
                    </button>
                  ))}
                  <div className="community-add-reaction-wrap">
                    <button className="community-add-reaction-btn" onClick={() => setOpenPickerFor(openPickerFor === m._id ? null : m._id)}>+ React</button>
                    {openPickerFor === m._id && (
                      <div className="community-emoji-picker">
                        {REACTION_EMOJIS.map(emoji => <button key={emoji} onClick={() => react(m._id, emoji)}>{emoji}</button>)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="community-input-row">
        <input placeholder="Share something with the community..." value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} maxLength={1000} />
        <button className="community-send-btn" onClick={send}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
        </button>
      </div>
    </div>
  );
}
