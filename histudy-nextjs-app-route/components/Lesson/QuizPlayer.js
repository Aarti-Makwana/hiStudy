"use client";
import React, { useState } from "react";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

const QuizPlayer = ({ quizzes = [] }) => {
    const [current, setCurrent] = useState(0);
    const [selected, setSelected] = useState({});   // { quizId: optionId }
    const [submitted, setSubmitted] = useState(false);
    const [showAnswer, setShowAnswer] = useState({});  // { quizId: true }

    if (!quizzes.length)
        return <div className="qp-empty"><i className="feather-help-circle"></i><p>No questions available.</p></div>;

    const quiz = quizzes[current];
    const total = quizzes.length;
    const answered = Object.keys(selected).length;
    const isSelected = (optId) => selected[quiz.id] === optId;
    const isCorrect = (optId) => submitted && optId === quiz.correct_course_quiz_option_id;
    const isWrong = (optId) => submitted && selected[quiz.id] === optId && optId !== quiz.correct_course_quiz_option_id;

    const score = submitted
        ? quizzes.filter(q => selected[q.id] === q.correct_course_quiz_option_id).length
        : 0;

    const handleSelect = (optId) => {
        if (submitted) return;
        setSelected(prev => ({ ...prev, [quiz.id]: optId }));
    };

    const handleSubmit = () => {
        if (answered < total) {
            if (!confirm(`You have answered ${answered}/${total} questions. Submit anyway?`)) return;
        }
        setSubmitted(true);
    };

    const handleReset = () => {
        setSelected({});
        setSubmitted(false);
        setShowAnswer({});
        setCurrent(0);
    };

    const getOptionClass = (optId) => {
        if (!submitted) return isSelected(optId) ? "qp-option selected" : "qp-option";
        if (isCorrect(optId)) return "qp-option correct";
        if (isWrong(optId)) return "qp-option wrong";
        return "qp-option";
    };

    /* ── Result screen ── */
    if (submitted) {
        const pct = Math.round((score / total) * 100);
        const passed = pct >= 60;
        return (
            <div className="qp-wrapper">
                {/* Score card */}
                <div className="qp-result-card">
                    <div className={`qp-score-ring ${passed ? "pass" : "fail"}`}>
                        <svg viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
                            <circle cx="50" cy="50" r="40" fill="none"
                                stroke={passed ? "#22c55e" : "#ef4444"}
                                strokeWidth="8" strokeLinecap="round"
                                strokeDasharray="251.2"
                                strokeDashoffset={251.2 * (1 - pct / 100)}
                                transform="rotate(-90 50 50)"
                            />
                            <text x="50" y="46" textAnchor="middle" dominantBaseline="middle" className="qp-ring-pct">{pct}%</text>
                            <text x="50" y="62" textAnchor="middle" dominantBaseline="middle" className="qp-ring-label">Score</text>
                        </svg>
                    </div>
                    <div className="qp-result-info">
                        <h2 className={passed ? "qp-result-pass" : "qp-result-fail"}>
                            {passed ? "🎉 Passed!" : "😔 Try Again"}
                        </h2>
                        <p>You scored <strong>{score}</strong> out of <strong>{total}</strong> questions correctly.</p>
                        <button className="qp-btn-retry" onClick={handleReset}>
                            <i className="feather-refresh-cw"></i> Retake Quiz
                        </button>
                    </div>
                </div>

                {/* Review all questions */}
                <div className="qp-review-list">
                    <h5 className="qp-review-heading">Review Answers</h5>
                    {quizzes.map((q, qi) => {
                        const userOpt = selected[q.id];
                        const isRight = userOpt === q.correct_course_quiz_option_id;
                        const expanded = showAnswer[q.id];
                        return (
                            <div key={q.id} className={`qp-review-card ${isRight ? "right" : "wrong"}`}>
                                <div className="qp-review-header" onClick={() => setShowAnswer(p => ({ ...p, [q.id]: !p[q.id] }))}>
                                    <span className={`qp-review-badge ${isRight ? "right" : "wrong"}`}>
                                        {isRight ? "✓" : "✗"}
                                    </span>
                                    <span className="qp-review-num">Q{qi + 1}</span>
                                    <div className="qp-review-q" dangerouslySetInnerHTML={{ __html: q.question }} />
                                    <i className={`feather-chevron-${expanded ? "up" : "down"} qp-review-chevron`}></i>
                                </div>
                                {expanded && (
                                    <div className="qp-review-body">
                                        <div className="qp-review-options">
                                            {q.options?.map((opt, oi) => {
                                                const correct = opt.id === q.correct_course_quiz_option_id;
                                                const picked = opt.id === userOpt;
                                                return (
                                                    <div key={opt.id} className={`qp-review-option ${correct ? "correct" : ""} ${picked && !correct ? "wrong" : ""}`}>
                                                        <span className="qp-review-letter">{LETTERS[oi]}</span>
                                                        {opt.option_text}
                                                        {correct && <span className="qp-review-tag correct">Correct</span>}
                                                        {picked && !correct && <span className="qp-review-tag wrong">Your answer</span>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {q.answer && (
                                            <div className="qp-explanation" dangerouslySetInnerHTML={{ __html: q.answer }} />
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    /* ── Active quiz ── */
    return (
        <div className="qp-wrapper">
            {/* Header */}
            <div className="qp-header">
                <div className="qp-header-left">
                    <i className="feather-help-circle qp-header-icon"></i>
                    <div>
                        <h5 className="qp-header-title">Knowledge Check</h5>
                        <span className="qp-header-sub">{answered}/{total} answered</span>
                    </div>
                </div>
                <div className="qp-header-right">
                    <span className="qp-attempts">Attempts Allowed: 1</span>
                </div>
            </div>

            {/* Progress */}
            <div className="qp-progress-bar">
                <div className="qp-progress-fill" style={{ width: `${((current + 1) / total) * 100}%` }} />
            </div>

            {/* Question card */}
            <div className="qp-question-card">
                {/* Question counter */}
                <div className="qp-q-meta">
                    <span className="qp-q-pill">Question {current + 1} of {total}</span>
                    {selected[quiz.id] && <span className="qp-answered-pill">✓ Answered</span>}
                </div>

                {/* Question text */}
                <div className="qp-question-text" dangerouslySetInnerHTML={{ __html: quiz.question }} />

                {/* Options grid */}
                <div className="qp-options-grid">
                    {quiz.options?.map((opt, oi) => (
                        <button
                            key={opt.id}
                            className={getOptionClass(opt.id)}
                            onClick={() => handleSelect(opt.id)}
                        >
                            <span className="qp-option-letter">{LETTERS[oi]}</span>
                            <span className="qp-option-text">{opt.option_text}</span>
                            {isCorrect(opt.id) && <i className="feather-check-circle qp-option-icon correct"></i>}
                            {isWrong(opt.id) && <i className="feather-x-circle qp-option-icon wrong"></i>}
                        </button>
                    ))}
                </div>
            </div>

            {/* Navigation */}
            <div className="qp-nav">
                <button
                    className="qp-nav-btn secondary"
                    disabled={current === 0}
                    onClick={() => setCurrent(c => c - 1)}
                >
                    <i className="feather-arrow-left"></i> Previous
                </button>

                {/* Dot indicators */}
                <div className="qp-dots">
                    {quizzes.map((q, i) => (
                        <button
                            key={i}
                            className={`qp-dot ${i === current ? "active" : ""} ${selected[q.id] ? "done" : ""}`}
                            onClick={() => setCurrent(i)}
                        />
                    ))}
                </div>

                {current < total - 1 ? (
                    <button className="qp-nav-btn primary" onClick={() => setCurrent(c => c + 1)}>
                        Next <i className="feather-arrow-right"></i>
                    </button>
                ) : (
                    <button className="qp-nav-btn submit" onClick={handleSubmit}>
                        <i className="feather-send"></i> Submit Quiz
                    </button>
                )}
            </div>
        </div>
    );
};

export default QuizPlayer;
