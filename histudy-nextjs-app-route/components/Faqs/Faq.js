import React, { useEffect, useState } from "react";

import { DashboardServices } from "../../services/User/Dashboard/index.services";

const Faq = () => {
  const [faqs, setFaqs] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const response = await DashboardServices.getFAQs();
        if (response.success) {
          // Group FAQs by category name
          const grouped = response.data.reduce((acc, item) => {
            const categoryName = item.category?.name || "General";
            if (!acc[categoryName]) {
              acc[categoryName] = [];
            }
            acc[categoryName].push(item);
            return acc;
          }, {});
          setFaqs(grouped);
        }
      } catch (error) {
        console.error("Error fetching FAQs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const categories = Object.keys(faqs);

  return (
    <>
      <div className="container">
        <div className="row g-5">
          {categories.length > 0 ? (
            categories.map((category, index) => (
              <div className="col-lg-6" key={index}>
                <div className="rbt-accordion-style accordion">

                  {category && (
                    <div className="section-title text-start mb--60">
                      <h4 className="title">{category}</h4>
                    </div>
                  )}
                  <div className="rbt-accordion-style rbt-accordion-04 accordion">
                    <div className="accordion" id={`accordion-${index}`}>
                      {faqs[category].map((item, innerIndex) => (
                        <div className="accordion-item card" key={item.id}>
                          <h2
                            className="accordion-header card-header"
                            id={`heading-${item.id}`}
                          >
                            <button
                              className={`accordion-button ${innerIndex !== 0 ? "collapsed" : ""
                                }`}
                              type="button"
                              data-bs-toggle="collapse"
                              data-bs-target={`#collapse-${item.id}`}
                              aria-expanded={innerIndex === 0}
                              aria-controls={`collapse-${item.id}`}
                            >
                              {item.question}
                            </button>
                          </h2>
                          <div
                            id={`collapse-${item.id}`}
                            className={`accordion-collapse collapse ${innerIndex === 0 ? "show" : ""
                              }`}
                            aria-labelledby={`heading-${item.id}`}
                            data-bs-parent={`#accordion-${index}`}
                          >
                            <div className="accordion-body card-body">
                              {item.answer}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12">
              <p>No FAQs found.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Faq;
