import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEntryTests, unlockEntryTest, startEntryTestAttempt, submitEntryTestAttempt, fetchMyEntryTestAttempts } from '../redux/slices/entryTestSlice';

export default function EntryTests() {
  const dispatch = useDispatch();
  const { tests, loading, currentAttempt, attempts, error } = useSelector(s => s.entryTest);
  const { user } = useSelector(s => s.auth);
  const [selectedTest, setSelectedTest] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    dispatch(fetchEntryTests());
    dispatch(fetchMyEntryTestAttempts());
  }, [dispatch]);

  const handleUnlock = async (id) => {
    const res = await dispatch(unlockEntryTest(id));
    if (!res.error) {
      dispatch(fetchEntryTests());
    }
  };

  const handleStart = async (test) => {
    setSelectedTest(test);
    setAnswers([]);
    setSubmitted(false);
    setResult(null);
    const res = await dispatch(startEntryTestAttempt(test._id));
    if (!res.error) {
      setAnswers(new Array(test.questions.length).fill(''));
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
      {error ? <div className="alert alert-warning">{error}</div> : null}

      {Object.entries(groupedTests).map(([examType, items]) => (
        <div key={examType} className="mb-4">
          <h5 className="mb-3">{examType}</h5>
          <div className="row g-3">
            {items.map(test => (
              <div className="col-md-6 col-lg-4" key={test._id}>
                <div className="card h-100 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="mb-0">{test.title}</h6>
                      <span className="badge bg-primary">{test.subject}</span>
                    </div>
                    <p className="small text-muted mb-2">{test.description || 'Practice questions with explanations.'}</p>
                    <div className="small text-muted mb-3">Free: {test.freeQuestionCount || 20} questions • Pro: {test.questions?.length || 0} questions • Price: {test.price > 0 ? `PKR ${test.price}` : 'Free'}</div>
                    {test.isUnlocked ? (
                      <button className="btn btn-success w-100" onClick={() => handleStart(test)}>Start Test</button>
                    ) : (
                      <div className="d-grid gap-2">
                        <button className="btn btn-outline-primary w-100" onClick={() => handleUnlock(test._id)}>Unlock for PKR {test.price}</button>
                        <small className="text-muted text-center">You’ll get full access after admin approval.</small>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {selectedTest && (
        <div className="card shadow-sm mt-4">
          <div className="card-body">
            <h5>{selectedTest.title}</h5>
            <p className="text-muted">{selectedTest.description}</p>
            {submitted && result ? (
              <div className="alert alert-success">
                <strong>Score:</strong> {result.score}/{result.totalQuestions} ({result.percentage}%)
              </div>
            ) : null}
            <div className="mt-3">
              {selectedTest.questions?.map((q, index) => (
                <div key={index} className="border rounded p-3 mb-3">
                  <div className="fw-bold mb-2">{index + 1}. {q.text}</div>
                  {q.options?.map((opt, i) => (
                    <label key={i} className="d-block mb-2">
                      <input
                        type="radio"
                        name={`q-${index}`}
                        value={opt}
                        checked={answers[index] === opt}
                        onChange={() => handleAnswer(index, opt)}
                      />{' '}{opt}
                    </label>
                  ))}
                  {q.explanation && submitted ? <div className="small text-success mt-2">Explanation: {q.explanation}</div> : null}
                </div>
              ))}
            </div>
            {!submitted ? <button className="btn btn-primary" onClick={handleSubmit}>Submit Test</button> : null}
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
                      <td>{attempt.score}/{attempt.totalQuestions}</td>
                      <td>{attempt.status}</td>
                      <td>{new Date(attempt.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
