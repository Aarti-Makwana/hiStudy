"use client";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { UserCoursesServices } from "@/services/User/Courses/index.service";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

const QuizPlayer = ({ quizzes = [], enrollmentId, contentId, latestAttempt, remainingAttempt }) => {
    const [current, setCurrent] = useState(0);
    const [selected, setSelected] = useState({});   // { quizId: optionId }
    const [submitted, setSubmitted] = useState(false);
    const [showAnswer, setShowAnswer] = useState({});  // { quizId: true }
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [starting, setStarting] = useState(false);
    const [started, setStarted] = useState(false);
    const [attemptId, setAttemptId] = useState(null);
    const [quizResult, setQuizResult] = useState(null); // Server response

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

    const handleStartQuiz = async () => {
        setStarting(true);
        try {
            const payload = {
                enrollment_id: enrollmentId,
                content_id: contentId
            };
            const res = await UserCoursesServices.startQuiz(payload);
            if (res && res.status === "success") {
                setAttemptId(res.data.attempt_id || res.data.id);
                setStarted(true);
                toast.success("Quiz started!");
            } else {
                toast.error(res?.message || "Failed to start quiz.");
            }
        } catch (error) {
            console.error("Error starting quiz:", error);
            toast.error("An error occurred while starting the quiz.");
        } finally {
            setStarting(false);
        }
    };

    const submitQuizAttempt = async () => {
        setSubmitting(true);
        try {
            const payload = {
                attempt_id: attemptId,
                answers: quizzes.map(q => ({
                    question_id: q.id,
                    option_id: selected[q.id] || null
                }))
            };

            const res = await UserCoursesServices.submitQuiz(payload);
            if (res && res.status === "success") {
                setQuizResult(res.data);
                setSubmitted(true);
                toast.success("Quiz submitted successfully!");
            } else {
                toast.error(res?.message || "Failed to submit quiz.");
            }
        } catch (error) {
            console.error("Error submitting quiz:", error);
            toast.error("An error occurred during submission.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmit = () => {
        if (answered < total) {
            setShowConfirmModal(true);
            return;
        }
        submitQuizAttempt();
    };

    const confirmSubmit = () => {
        setShowConfirmModal(false);
        submitQuizAttempt();
    };

    const handleReset = () => {
        setSelected({});
        setSubmitted(false);
        setStarted(false);
        setAttemptId(null);
        setShowAnswer({});
        setCurrent(0);
        setShowConfirmModal(false);
        setQuizResult(null);
    };

    const getOptionClass = (optId) => {
        if (!submitted) return isSelected(optId) ? "qp-option selected" : "qp-option";
        if (isCorrect(optId)) return "qp-option correct";
        if (isWrong(optId)) return "qp-option wrong";
        return "qp-option";
    };

    /* ── Result screen ── */
    if (submitted) {
        const pct = quizResult?.percentage !== undefined ? quizResult.percentage : Math.round((score / total) * 100);
        const passed = quizResult ? quizResult.result === "Pass" : pct >= 60;
        const finalScore = quizResult?.correct_answers !== undefined ? quizResult.correct_answers : score;
        const finalTotal = quizResult?.total_questions !== undefined ? quizResult.total_questions : total;
        
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
                        <p>You scored <strong>{finalScore}</strong> out of <strong>{finalTotal}</strong> questions correctly.</p>
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

    /* ── Start screen ── */
    if (!started && !submitted) {
        return (
            <div className="qp-wrapper">
                <div className="qp-start-screen" style={{
                    padding: "60px 40px",
                    textAlign: "center",
                    backgroundColor: "rgba(255,255,255,0.03)",
                    borderRadius: "16px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    margin: "20px 0"
                }}>
                    <div className="qp-start-icon" style={{
                       fontSize: "48px",
                       color: "var(--color-primary)",
                       marginBottom: "20px"
                    }}>
                        <i className="feather-help-circle"></i>
                    </div>
                    <h3 style={{ color: "white", marginBottom: "15px" }}>Ready for the Quiz?</h3>
                    <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: "30px", fontSize: "16px" }}>
                        Check your understanding with <strong>{total}</strong> practice questions.
                    </p>
                    
                    <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginBottom: "40px" }}>
                         <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "rgba(255,255,255,0.8)" }}>
                             <i className="feather-award"></i>
                             <span>Grade: Pass/Fail</span>
                         </div>
                         <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "rgba(255,255,255,0.8)" }}>
                             <i className="feather-clock"></i>
                             <span>No Time Limit</span>
                         </div>
                    </div>

                    <button 
                        className="rbt-btn btn-gradient"
                        style={{ height: "55px", padding: "0 40px", fontSize: "18px", opacity: remainingAttempt <= 0 ? 0.6 : 1, cursor: remainingAttempt <= 0 ? "not-allowed" : "pointer" }}
                        onClick={handleStartQuiz}
                        disabled={starting || remainingAttempt <= 0}
                    >
                        {starting ? (
                            <><i className="feather-loader icon-spin mr--10"></i> Starting...</>
                        ) : remainingAttempt <= 0 ? (
                            <><i className="feather-lock mr--10"></i> Limit Reached</>
                        ) : (
                            <><i className="feather-play mr--10"></i> Start Knowledge Check</>
                        )}
                    </button>
                    
                    {latestAttempt && (
                        <div style={{ 
                            marginTop: "40px", 
                            padding: "30px", 
                            borderTop: "1px solid rgba(255,255,255,0.1)",
                            textAlign: "left"
                        }}>
                            <h5 style={{ color: "white", marginBottom: "20px", fontSize: "16px", fontWeight: "600", display: "flex", alignItems: "center", gap: "10px" }}>
                                <i className="feather-clock" style={{ color: "var(--color-primary)" }}></i>
                                Previous Attempt Summary
                            </h5>
                            
                            <div style={{ 
                                display: "grid", 
                                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", 
                                gap: "15px"
                            }}>
                                <div style={{ backgroundColor: "rgba(255,255,255,0.05)", padding: "15px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                                    <span style={{ display: "block", fontSize: "12px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "5px" }}>Total Attempt</span>
                                    <span style={{ fontSize: "18px", color: "white", fontWeight: "700" }}>{latestAttempt.attempt_number}</span>
                                </div>
                                
                                <div style={{ backgroundColor: "rgba(255,255,255,0.05)", padding: "15px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                                    <span style={{ display: "block", fontSize: "12px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "5px" }}>Remaining</span>
                                    <span style={{ fontSize: "18px", color: remainingAttempt > 0 ? "#22c55e" : "#ef4444", fontWeight: "700" }}>{remainingAttempt !== undefined ? remainingAttempt : "-"}</span>
                                </div>
                                
                                <div style={{ backgroundColor: "rgba(255,255,255,0.05)", padding: "15px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                                    <span style={{ display: "block", fontSize: "12px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "5px" }}>Questions</span>
                                    <span style={{ fontSize: "18px", color: "white", fontWeight: "700" }}>{latestAttempt.total_questions}</span>
                                </div>
                                
                                <div style={{ backgroundColor: "rgba(255,255,255,0.05)", padding: "15px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                                    <span style={{ display: "block", fontSize: "12px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "5px" }}>Correct</span>
                                    <span style={{ fontSize: "18px", color: "#22c55e", fontWeight: "700" }}>{latestAttempt.correct_answers}</span>
                                </div>

                                <div style={{ backgroundColor: "rgba(255,255,255,0.05)", padding: "15px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                                    <span style={{ display: "block", fontSize: "12px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "5px" }}>Score</span>
                                    <span style={{ fontSize: "18px", color: "var(--color-primary)", fontWeight: "700" }}>{latestAttempt.percentage}%</span>
                                </div>

                                <div style={{ 
                                    backgroundColor: latestAttempt.result === "Pass" ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)", 
                                    padding: "15px", 
                                    borderRadius: "12px", 
                                    border: `1px solid ${latestAttempt.result === "Pass" ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)"}`,
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center"
                                }}>
                                    <span style={{ display: "block", fontSize: "12px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "5px" }}>Result</span>
                                    <span style={{ fontSize: "18px", color: latestAttempt.result === "Pass" ? "#22c55e" : "#ef4444", fontWeight: "700", display: "flex", alignItems: "center", gap: "5px" }}>
                                        {latestAttempt.result === "Pass" ? (
                                            <><i className="feather-check-circle"></i> Pass</>
                                        ) : (
                                            <><i className="feather-x-circle"></i> Fail</>
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    /* ── Active quiz ── */
    return (
        <>
            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="qp-confirm-modal-backdrop" onClick={() => setShowConfirmModal(false)}>
                    <div className="qp-confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="qp-confirm-icon">
                            <i className="feather-alert-triangle"></i>
                        </div>
                        <h4 className="qp-confirm-title">Incomplete Quiz</h4>
                        <p className="qp-confirm-desc">
                            You have answered <strong>{answered}</strong> out of <strong>{total}</strong> questions.
                            Are you sure you want to submit? Unanswered questions will be marked incorrect.
                        </p>
                        <div className="qp-confirm-actions">
                            <button className="qp-btn-cancel" onClick={() => setShowConfirmModal(false)}>
                                Cancel
                            </button>
                            <button className="qp-btn-submit" onClick={confirmSubmit}>
                                <i className="feather-send mr--5"></i> Submit Anyway
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                    <div className="qp-header-right" style={{ textAlign: "right" }}>
                        {latestAttempt ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                <span className="qp-attempts" style={{ color: "white", fontWeight: "500", fontSize: "14px" }}>
                                    Attempts Made: {latestAttempt.attempt_number} {remainingAttempt !== undefined && `| Remaining: ${remainingAttempt}`}
                                </span>
                                {latestAttempt.percentage !== null && (
                                    <span className="qp-attempts" style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px", border: "none", padding: "0", background: "transparent" }}>
                                        Last Score: {latestAttempt.percentage}% {latestAttempt.result ? `(${latestAttempt.result})` : ""}
                                    </span>
                                )}
                            </div>
                        ) : (
                            <span className="qp-attempts">Attempts Allowed: 1</span>
                        )}
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
                        <button className="qp-nav-btn submit" onClick={handleSubmit} disabled={submitting || remainingAttempt <= 0}>
                            {submitting ? (
                                <i className="feather-loader icon-spin"></i>
                            ) : (
                                <i className="feather-send"></i>
                            )}
                            {submitting ? " Submitting..." : remainingAttempt <= 0 ? " Limit Reached" : " Submit Quiz"}
                        </button>
                    )}
                </div>
            </div>
        </>
    );
};

export default QuizPlayer;
