import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createEntryTest, deleteEntryTest, fetchAdminEntryTests, fetchEntryTestById, fetchEntryTestUnlockRequests, reviewEntryTestUnlock, toggleEntryTestPublish, updateEntryTest } from '../../redux/slices/entryTestSlice';

const emptyForm = {
  title: '',
  examType: 'ECAT',
  subject: '',
  description: '',
  freeQuestionCount: 20,
  price: 0,
  questions: [
    { text: '', options: ['', '', '', ''], correctAnswer: '', explanation: '', isFree: true },
  ],
};

export default function AdminEntryTests() {
  const dispatch = useDispatch();
  const { adminTests, unlockRequests, selectedTest, error, notice } = useSelector(s => s.entryTest);
  const [form, setForm] = useState(emptyForm);
  const [reviewNotes, setReviewNotes] = useState({});
  const [editingTestId, setEditingTestId] = useState(null);

  useEffect(() => {
    dispatch(fetchAdminEntryTests());
    dispatch(fetchEntryTestUnlockRequests());
  }, [dispatch]);

  const addQuestion = () => {
    setForm({ ...form, questions: [...form.questions, { text: '', options: ['', '', '', ''], correctAnswer: '', explanation: '', isFree: false }] });
  };

  const updateQuestion = (index, field, value) => {
    const next = [...form.questions];
    next[index][field] = value;
    setForm({ ...form, questions: next });
  };

  const updateOption = (qIndex, optIndex, value) => {
    const next = [...form.questions];
    next[qIndex].options[optIndex] = value;
    setForm({ ...form, questions: next });
  };

  const addOption = (qIndex) => {
    const next = [...form.questions];
    next[qIndex].options = [...next[qIndex].options, ''];
    setForm({ ...form, questions: next });
  };

  const removeOption = (qIndex, optIndex) => {
    const next = [...form.questions];
    next[qIndex].options = next[qIndex].options.filter((_, index) => index !== optIndex);
    setForm({ ...form, questions: next });
  };

  const removeQuestion = (qIndex) => {
    const next = form.questions.filter((_, index) => index !== qIndex);
    setForm({ ...form, questions: next });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingTestId(null);
  };

  const loadTestForEdit = async (id) => {
    const result = await dispatch(fetchEntryTestById(id));
    if (!result.error && result.payload?.test) {
      const test = result.payload.test;
      setEditingTestId(test._id);
      setForm({
        ...emptyForm,
        title: test.title || '',
        examType: test.examType || 'ECAT',
        subject: test.subject || '',
        description: test.description || '',
        freeQuestionCount: test.freeQuestionCount || 20,
        price: test.price || 0,
        questions: (test.questions || []).map(q => ({
          text: q.text || '',
          options: (q.options || []).map(opt => opt || ''),
          correctAnswer: q.correctAnswer || '',
          explanation: q.explanation || '',
          isFree: Boolean(q.isFree),
        })),
      });
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    const payload = { ...form, questions: form.questions.filter(q => q.text) };
    const result = editingTestId
      ? await dispatch(updateEntryTest({ id: editingTestId, payload }))
      : await dispatch(createEntryTest(payload));

    if (!result.error) {
      resetForm();
      dispatch(fetchAdminEntryTests());
    }
  };

  const handleDeleteTest = async (id) => {
    const result = await dispatch(deleteEntryTest(id));
    if (!result.error) {
      dispatch(fetchAdminEntryTests());
      if (editingTestId === id) resetForm();
    }
  };

  const handleReview = async (id, action) => {
    const note = reviewNotes[id] || '';
    const result = await dispatch(reviewEntryTestUnlock({ id, action, note }));
    if (!result.error) {
      setReviewNotes(prev => ({ ...prev, [id]: '' }));
      dispatch(fetchEntryTestUnlockRequests());
    }
  };

  return (
    <div className="container py-4">
      <h3 className="mb-3">Entry Test Management</h3>
      {notice ? <div className="alert alert-success">{notice}</div> : null}
      {error ? <div className="alert alert-danger">{error}</div> : null}
      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="mb-3">{editingTestId ? 'Edit Test' : 'Create New Test'}</h5>
              {selectedTest ? <div className="alert alert-info py-2">Editing: {selectedTest.title}</div> : null}
              <form onSubmit={submit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Title</label>
                    <input className="form-control" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Exam Type</label>
                    <select className="form-select" value={form.examType} onChange={e => setForm({ ...form, examType: e.target.value })}>
                      <option value="ECAT">ECAT</option>
                      <option value="MCAT">MCAT</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Subject</label>
                    <input className="form-control" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Price (PKR)</label>
                    <input type="number" className="form-control" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Description</label>
                    <textarea className="form-control" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows="3" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Free Questions Count</label>
                    <input type="number" className="form-control" value={form.freeQuestionCount} onChange={e => setForm({ ...form, freeQuestionCount: Number(e.target.value) })} />
                  </div>
                </div>

                <div className="mt-4">
                  <h6>Questions</h6>
                  {form.questions.map((q, index) => (
                    <div key={index} className="border rounded p-3 mb-3">
                      <div className="mb-2">
                        <label className="form-label">Question {index + 1}</label>
                        <input className="form-control" value={q.text} onChange={e => updateQuestion(index, 'text', e.target.value)} />
                      </div>
                      {q.options.map((opt, optIndex) => (
                        <div className="mb-2" key={optIndex}>
                          <label className="form-label">Option {optIndex + 1}</label>
                          <div className="d-flex gap-2">
                            <input className="form-control" value={opt} onChange={e => updateOption(index, optIndex, e.target.value)} />
                            <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => removeOption(index, optIndex)}>Delete</button>
                          </div>
                        </div>
                      ))}
                      <button type="button" className="btn btn-outline-secondary btn-sm mb-3" onClick={() => addOption(index)}>+ Add Option</button>
                      <div className="mb-2">
                        <label className="form-label">Correct Answer</label>
                        <input className="form-control" value={q.correctAnswer} onChange={e => updateQuestion(index, 'correctAnswer', e.target.value)} />
                      </div>
                      <div className="mb-2">
                        <label className="form-label">Explanation</label>
                        <textarea className="form-control" value={q.explanation} onChange={e => updateQuestion(index, 'explanation', e.target.value)} rows="2" />
                      </div>
                      <div className="form-check mb-3">
                        <input className="form-check-input" type="checkbox" checked={q.isFree} onChange={e => updateQuestion(index, 'isFree', e.target.checked)} />
                        <label className="form-check-label">Free question</label>
                      </div>
                      <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => removeQuestion(index)}>Delete MCQ</button>
                    </div>
                  ))}
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={addQuestion}>+ Add Question</button>
                </div>

                <div className="d-flex gap-2 mt-4">
                  <button className="btn btn-primary" type="submit">{editingTestId ? 'Save Changes' : 'Save Test'}</button>
                  {editingTestId ? <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>Cancel Edit</button> : null}
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card shadow-sm mb-3">
            <div className="card-body">
              <h5 className="mb-3">Pending Unlock Requests</h5>
              {unlockRequests.length === 0 ? <p className="text-muted">No pending requests.</p> : (
                <div className="d-flex flex-column gap-2">
                  {unlockRequests.map(req => (
                    <div key={req._id} className="border rounded p-3">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <strong>{req.entryTest?.title}</strong>
                          <div className="small text-muted">{req.student?.name} • {req.entryTest?.subject}</div>
                        </div>
                        <span className="badge bg-warning text-dark">Pending</span>
                      </div>
                      <div className="small text-muted mt-2">
                        Amount: PKR {req.amount?.toLocaleString()}
                        {req.bankName ? <> • 🏦 {req.bankName}</> : null}
                        {req.transactionId ? <> • TXN: {req.transactionId}</> : null}
                      </div>
                      {req.screenshotUrl ? (
                        <div className="mt-2">
                          <a href={req.screenshotUrl} target="_blank" rel="noopener noreferrer">
                            <img src={req.screenshotUrl} alt="Payment Screenshot" className="img-thumbnail" style={{ maxHeight: 150 }} />
                          </a>
                        </div>
                      ) : null}
                      <textarea
                        className="form-control mt-2"
                        rows="2"
                        value={reviewNotes[req._id] || ''}
                        onChange={e => setReviewNotes(prev => ({ ...prev, [req._id]: e.target.value }))}
                        placeholder="Optional note"
                      />
                      <div className="d-flex gap-2 mt-2">
                        <button className="btn btn-sm btn-success" onClick={() => handleReview(req._id, 'approve')}>Approve</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleReview(req._id, 'reject')}>Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="mb-3">All Tests</h5>
              {adminTests.length === 0 ? <p className="text-muted">No tests yet.</p> : (
                <div className="d-flex flex-column gap-2">
                  {adminTests.map(test => (
                    <div key={test._id} className="border rounded p-3">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <strong>{test.title}</strong>
                          <div className="small text-muted">{test.examType} • {test.subject}</div>
                        </div>
                        <div className="d-flex gap-2">
                          <button className="btn btn-sm btn-outline-primary" onClick={() => loadTestForEdit(test._id)}>Edit</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteTest(test._id)}>Delete</button>
                          <button className="btn btn-sm btn-outline-secondary" onClick={() => dispatch(toggleEntryTestPublish(test._id))}>{test.isPublished ? 'Hide' : 'Publish'}</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
