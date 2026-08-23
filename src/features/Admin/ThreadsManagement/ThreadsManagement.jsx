import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  getAdminThreads,
  adminDeleteThread,
  adminDeleteComment
} from './threadsAdminApi';
import socket, { connectSocket } from '../../Community/socket';
import styles from './ThreadsManagement.module.css';

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleString();
}

export default function ThreadsManagement() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingThreadId, setDeletingThreadId] = useState(null);
  const [deletingCommentId, setDeletingCommentId] = useState(null);

  const loadThreads = async () => {
    setLoading(true);
    try {
      const data = await getAdminThreads();
      setThreads(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to load threads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadThreads();
  }, []);

  /*
   * Live updates: the social service broadcasts thread events
   * to every connected client, so keep the admin list in sync
   * without a manual refresh button.
   */
  useEffect(() => {
    connectSocket();

    function threadCreated(thread) {
      setThreads((prev) => {
        if (prev.some((t) => t.id === thread.id)) return prev;
        return [thread, ...prev];
      });
    }

    function threadUpdated(updatedThread) {
      setThreads((prev) =>
        prev.map((t) => (t.id === updatedThread.id ? updatedThread : t))
      );
    }

    function threadDeleted(data) {
      setThreads((prev) => prev.filter((t) => t.id !== data.id));
    }

    socket.on('thread:created', threadCreated);
    socket.on('thread:updated', threadUpdated);
    socket.on('thread:deleted', threadDeleted);

    return () => {
      socket.off('thread:created', threadCreated);
      socket.off('thread:updated', threadUpdated);
      socket.off('thread:deleted', threadDeleted);
    };
  }, []);

  const handleDeleteThread = async (thread) => {
    if (!window.confirm(`Delete "${thread.title}" and all of its comments? This can't be undone.`)) return;

    setDeletingThreadId(thread.id);
    try {
      await adminDeleteThread(thread.id);
      toast.success('Thread deleted');
      setThreads((prev) => prev.filter((t) => t.id !== thread.id));
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to delete thread');
    } finally {
      setDeletingThreadId(null);
    }
  };

  const handleDeleteComment = async (threadId, comment) => {
    if (!window.confirm('Delete this comment? This can\'t be undone.')) return;

    setDeletingCommentId(comment.id);
    try {
      await adminDeleteComment(threadId, comment.id);
      toast.success('Comment deleted');
      setThreads((prev) =>
        prev.map((t) =>
          t.id === threadId
            ? { ...t, comments: (t.comments || []).filter((c) => c.id !== comment.id) }
            : t
        )
      );
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to delete comment');
    } finally {
      setDeletingCommentId(null);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <div>
            <div className={styles.eyebrow}>Community Moderation</div>
            <h1 className={styles.pageTitle}>Threads</h1>
            <p className={styles.pageSub}>Review every thread and its discussions. Delete whole threads or individual comments. Updates live.</p>
          </div>
        </div>

        <div className={styles.listSection}>
          {loading ? (
            <div className={styles.emptyState}>Loading threads...</div>
          ) : threads.length === 0 ? (
            <div className={styles.emptyState}>No threads in the system yet.</div>
          ) : (
            <div className={styles.threadList}>
              {threads.map((thread) => (
                <div key={thread.id} className={styles.threadCard}>
                  <div className={styles.threadHeader}>
                    <div>
                      <h3 className={styles.threadTitle}>{thread.title}</h3>
                      <div className={styles.threadMeta}>
                        <span className={styles.authorName}>
                          {thread.full_name || 'Unknown member'}
                        </span>
                        {thread.role && (
                          <span className={`${styles.roleBadge} ${styles[`role${thread.role}`] || ''}`}>
                            {thread.role}
                          </span>
                        )}
                        <span className={styles.threadDate}>{formatDate(thread.created_at)}</span>
                        <span className={styles.commentCount}>
                          {thread.comments?.length || 0} comment{(thread.comments?.length || 0) === 1 ? '' : 's'}
                        </span>
                      </div>
                    </div>
                    <button
                      className={styles.cancelBtn}
                      onClick={() => handleDeleteThread(thread)}
                      disabled={deletingThreadId === thread.id}
                    >
                      {deletingThreadId === thread.id ? 'Deleting...' : 'Delete Thread'}
                    </button>
                  </div>

                  <p className={styles.threadContent}>{thread.content}</p>

                  <div className={styles.commentsSection}>
                    <div className={styles.commentsTitle}>Discussions</div>

                    {(thread.comments || []).length === 0 ? (
                      <p className={styles.noComments}>No comments on this thread yet.</p>
                    ) : (
                      (thread.comments || []).map((comment) => (
                        <div key={comment.id} className={styles.commentItem}>
                          <div className={styles.commentBody}>
                            <div className={styles.commentMeta}>
                              <span className={styles.authorName}>
                                {comment.full_name || 'Unknown member'}
                              </span>
                              {comment.role && (
                                <span className={`${styles.roleBadge} ${styles[`role${comment.role}`] || ''}`}>
                                  {comment.role}
                                </span>
                              )}
                              <span className={styles.threadDate}>{formatDate(comment.created_at)}</span>
                            </div>
                            <p className={styles.commentContent}>{comment.content}</p>
                          </div>
                          <button
                            className={styles.commentDeleteBtn}
                            onClick={() => handleDeleteComment(thread.id, comment)}
                            disabled={deletingCommentId === comment.id}
                          >
                            {deletingCommentId === comment.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}