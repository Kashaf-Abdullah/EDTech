import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchEntryTests,
  unlockEntryTest,
  startEntryTestAttempt,
  submitEntryTestAttempt,
  fetchMyEntryTestAttempts,
  clearEntryTestError,
  clearEntryTestNotice,
} from '../redux/slices/entryTestSlice';

export default function EntryTests() {
  const dispatch = useDispatch();
  const { tests, loading, submitting, currentAttempt, attempts, error, notice } = useSelector(s => s.entryTest);
  const [selectedTest, setSelectedTest] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  const [unlockTest, setUnlockTest] = useState(null);
  const [bankName, setBankName] = useState('jazzcash');
  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState(null);

  useEffect(() => {
    dispatch(fetchEntryTests());
    dispatch(fetchMyEntryTestAttempts());
  }, [dispatch]);

  const openUnlockModal = (test) => {
    dispatch(clearEntryTestError());
    dispatch(clearEntryTestNotice());
    setBankName('jazzcash');
    setTransactionId('');
    setScreenshot(null);
    setUnlockTest(test);
  };

  const submitUnlockPayment = async (e) => {
    e.preventDefault();
    if (!unlockTest || !screenshot) return;
    const fd = new FormData();
    fd.append('bankName', bankName);
    fd.append('transactionId', transactionId);
    fd.append('screenshot', screenshot);
    const res = await dispatch(unlockEntryTest({ id: unlockTest._id, formData: fd }));
    if (!res.error) {
      setUnlockTest(null);
      setScreenshot(null);
      setTransactionId('');
      dispatch(fetchEntryTests());
    }
  };

  const handleStart = async (test) => {
    setSubmitted(false);
    setResult(null);
    const res = await dispatch(startEntryTestAttempt(test._id));
    if (!res.error && res.payload?.test) {
      const activeTest = res.payload.test;
      setSelectedTest(activeTest);
      const savedAnswers = res.payload.attempt?.answers;
      setAnswers(
        savedAnswers && savedAnswers.length === activeTest.questions.length
          ? savedAnswers
          : new Array(activeTest.questions.length).fill('')
      );
    }
  };

  const handleAnswer = (index, value) => {
    const next = [...answers];
    next[index] = value;
    setAnswers(next);
  };

  const handleSubmit = async () => {
    if (!currentAttempt?._id) return;
    const res = await dispatch(submitEntryTestAttempt({ attemptId: currentAttempt._id, answers }));
    if (!res.error) {
      setSubmitted(true);
      setResult(res.payload.attempt);
      if (res.payload.test) setSelectedTest(res.payload.test);
      dispatch(fetchMyEntryTestAttempts());
    }
  };

  const groupedTests = useMemo(() => {
    const byExam = {};
    tests.forEach(test => {
      if (!byExam[test.examType]) byExam[test.examType] = [];
      byExam[test.examType].push(test);
    });
    return byExam;
  }, [tests]);

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="mb-1">Entry Test Prep</h3>
          <p className="text-muted mb-0">ECAT, MCAT and subject-wise practice MCQs with explanations and progress tracking.</p>
        </div>
      </div>

      {loading ? <div className="text-center py-5">Loading tests...</div> : null}
      {notice ? (
        <div className="alert alert-success d-flex justify-content-between align-items-center">
          <span>{notice}</span>
          <button type="button" className="btn-close" onClick={() => dispatch(clearEntryTestNotice())} />
        </div>
      ) : null}
      {error ? (
        <div className="alert alert-danger d-flex justify-content-between align-items-center">
          <span>{error}</span>
          <button type="button" className="btn-close" onClick={() => dispatch(clearEntryTestError())} />
        </div>
      ) : null}

      {Object.entries(groupedTests).map(([examType, items]) => (
        <div key={examType} className="mb-4">
          <h5 className="mb-3">{examType}</h5>
          <div className="row g-3">
            {items.map(test => {
              const totalCount = test.totalQuestions ?? test.questions?.length ?? 0;
              const freeCount = test.freeCount ?? (test.isUnlocked ? totalCount : (test.questions?.length ?? 0));
              return (
                <div className="col-md-6 col-lg-4" key={test._id}>
                  <div className="card h-100 shadow-sm">
                    <div className="card-body d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="mb-0">{test.title}</h6>
                        <span className="badge bg-primary">{test.subject}</span>
                      </div>
                      <p className="small text-muted mb-2">{test.description || 'Practice questions with explanations.'}</p>
                      <div className="small text-muted mb-3">
                        Free sample: {freeCount} Qs • Total: {totalCount} Qs • Price: {test.price > 0 ? `PKR ${test.price}` : 'Free'}
                      </div>
                      <div className="mt-auto d-grid gap-2">
                        {test.isUnlocked ? (
                          <button className="btn btn-success w-100" onClick={() => handleStart(test)}>Start Full Test</button>
                        ) : (
                          <>
                            {freeCount > 0 && (
                              <button className="btn btn-outline-success w-100" onClick={() => handleStart(test)}>
                                Try Free Sample ({freeCount} Qs)
                              </button>
                            )}
                            {test.isPendingUnlock ? (
                              <button className="btn btn-warning w-100" disabled>⏳ Pending Admin Approval</button>
                            ) : (
                              <button className="btn btn-primary w-100" onClick={() => openUnlockModal(test)}>
                                Unlock Full Test — PKR {test.price}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {selectedTest && (
        <div className="card shadow-sm mt-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h5>{selectedTest.title}</h5>
                <p className="text-muted mb-2">{selectedTest.description}</p>
              </div>
              {!selectedTest.isUnlocked && selectedTest.price > 0 && (
                <span className="badge bg-info text-dark">Free Sample Preview</span>
              )}
            </div>
            {submitted && result ? (
              <div className="alert alert-success">
                <strong>Score:</strong> {result.score}/{result.totalQuestions} ({result.percentage}%)
              </div>
            ) : null}
            <div className="mt-3">
              {selectedTest.questions?.map((q, index) => (
                <div key={q._id || index} className="border rounded p-3 mb-3">
                  <div className="fw-bold mb-2">{index + 1}. {q.text}</div>
                  {q.options?.map((opt, i) => (
                    <label key={i} className="d-block mb-2">
                      <input
                        type="radio"
                        name={`q-${index}`}
                        value={opt}
                        disabled={submitted}
                        checked={answers[index] === opt}
                        onChange={() => handleAnswer(index, opt)}
                      />{' '}{opt}
                    </label>
                  ))}
                  {submitted && q.correctAnswer ? (
                    <div className={`small mt-2 ${answers[index] === q.correctAnswer ? 'text-success' : 'text-danger'}`}>
                      Correct Answer: <strong>{q.correctAnswer}</strong>
                    </div>
                  ) : null}
                  {q.explanation && submitted ? <div className="small text-muted mt-1">Explanation: {q.explanation}</div> : null}
                </div>
              ))}
            </div>
            {!submitted ? (
              <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Test'}
              </button>
            ) : null}
          </div>
        </div>
      )}

      <div className="card shadow-sm mt-4">
        <div className="card-body">
          <h5 className="mb-3">My Test History</h5>
          {attempts.length === 0 ? <p className="text-muted">No attempts yet.</p> : (
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr><th>Test</th><th>Subject</th><th>Score</th><th>Status</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {attempts.map(attempt => (
                    <tr key={attempt._id}>
                      <td>{attempt.test?.title}</td>
                      <td>{attempt.test?.subject}</td>
                      <td>{attempt.score}/{attempt.totalQuestions} ({attempt.percentage || 0}%)</td>
                      <td>{attempt.status}{attempt.isFreeOnly ? ' (Sample)' : ''}</td>
                      <td>{new Date(attempt.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {unlockTest && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.55)' }} onClick={() => setUnlockTest(null)}>
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Unlock Entry Test: {unlockTest.title}</h5>
                <button type="button" className="btn-close" onClick={() => setUnlockTest(null)} />
              </div>
              <form onSubmit={submitUnlockPayment}>
                <div className="modal-body">
                  <div className="alert alert-info small">
                    <h6 className="mb-1">Bank Account Details:</h6>
                    <p className="mb-1">🏦 <strong>JazzCash:</strong> 0300-1234567</p>
                    <p className="mb-1">📱 <strong>EasyPaisa:</strong> 0301-7654321</p>
                    <p className="mb-0">🏛️ <strong>Bank (HBL):</strong> IBAN: PK36HABB0000123456789</p>
                  </div>
                  <p className="small text-muted">
                    Transfer <strong>PKR {unlockTest.price?.toLocaleString()}</strong> and upload your payment screenshot below for admin approval.
                  </p>
                  <div className="mb-3">
                    <label className="form-label">Transfer Method</label>
                    <select className="form-select" value={bankName} onChange={e => setBankName(e.target.value)}>
                      <option value="jazzcash">JazzCash</option>
                      <option value="easypaisa">EasyPaisa</option>
                      <option value="bank">Bank Transfer (HBL)</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Transaction ID (optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. TXN123456"
                      value={transactionId}
                      onChange={e => setTransactionId(e.target.value)}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Upload Payment Screenshot *</label>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={e => setScreenshot(e.target.files[0])}
                      required
                    />
                    <small className="text-muted">JPG/PNG only, max 5MB</small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setUnlockTest(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting || !screenshot}>
                    {submitting ? 'Submitting...' : 'Submit Payment for Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
