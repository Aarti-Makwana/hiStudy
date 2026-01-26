import React, { useEffect, useState, useRef, useCallback } from "react";
import { InstructorServices } from "../../services/User";
import InstructorCard from "./InstructorCard";
import InstructorModal from "./InstructorModal";
import Skeleton from "../Common/Skeleton";

const InstructorsList = () => {
    const [instructors, setInstructors] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [selectedInstructor, setSelectedInstructor] = useState(null);
    const observer = useRef();

    const lastInstructorElementRef = useCallback(
        (node) => {
            if (loading) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    setPage((prevPage) => prevPage + 1);
                }
            });
            if (node) observer.current.observe(node);
        },
        [loading, hasMore]
    );

    const fetchInstructors = async (pageNum) => {
        setLoading(true);
        try {
            const res = await InstructorServices.getAllInstructors({ page: pageNum, limit: 9 });
            if (res && res.success) {
                if (res.data.length === 0) {
                    setHasMore(false);
                } else {
                    setInstructors((prev) => {
                        const newInstructors = res.data.filter(
                            (newIns) => !prev.some((oldIns) => oldIns.id === newIns.id)
                        );
                        return [...prev, ...newInstructors];
                    });
                    // For demo/assignment purposes, if the API doesn't support pagination properly yet,
                    // we might want to stop after one fetch or handle it accordingly.
                    // Assuming real API handles pagination:
                    if (res.data.length < 9) setHasMore(false);
                }
            }
        } catch (error) {
            console.error("Error fetching instructors:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInstructors(page);
    }, [page]);

    const handleOpenModal = (instructor) => {
        setSelectedInstructor(instructor);
        document.body.classList.add("modal-open");
    };

    const handleCloseModal = () => {
        setSelectedInstructor(null);
        document.body.classList.remove("modal-open");
    };

    return (
        <div className="rbt-team-area bg-color-white rbt-section-gap">
            <div className="container">
                <div className="row g-5">
                    {instructors.map((instructor, index) => {
                        if (instructors.length === index + 1) {
                            return (
                                <InstructorCard
                                    ref={lastInstructorElementRef}
                                    key={instructor.id}
                                    instructor={instructor}
                                    onOpenModal={handleOpenModal}
                                />
                            );
                        } else {
                            return (
                                <InstructorCard
                                    key={instructor.id}
                                    instructor={instructor}
                                    onOpenModal={handleOpenModal}
                                />
                            );
                        }
                    })}

                    {loading && instructors.length === 0 &&
                        [...Array(6)].map((_, i) => (
                            <div className="col-lg-4 col-md-6 col-12" key={`skeleton-${i}`}>
                                <div className="skeleton-loader"></div>
                            </div>
                        ))}
                </div>

                {loading && instructors.length > 0 && (
                    <div className="row mt--50">
                        <div className="col-12 text-center">
                            <div className="rbt-loader-ring"></div>
                        </div>
                    </div>
                )}
            </div>

            {selectedInstructor && (
                <InstructorModal
                    instructor={selectedInstructor}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

export default InstructorsList;
