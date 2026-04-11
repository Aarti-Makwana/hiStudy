"use client";

import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import Image from "next/image";

const CounterWidget = ({
  counterStyle = "one",
  icon,
  title,
  subtitle,
  value,
  styleClass,
  iconClass,
  numberClass,
}) => {
  const [counterValue, setCounterValue] = useState(0);

  const { ref, inView } = useInView({
    threshold: 0,
  });

  useEffect(() => {
    if (inView) {
      let start = 0;
      const end = parseInt(value) || 0;
      const duration = 1000;
      const increment = end / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCounterValue(end);
          clearInterval(timer);
        } else {
          setCounterValue(Math.floor(start));
        }
      }, 16);
      
      return () => clearInterval(timer);
    }
  }, [inView, value]);

  return (
    <>
      {counterStyle === "one" && (
        <div className="rbt-counterup rbt-hover-03 border-bottom-gradient">
          <div className="top-circle-shape" />
          <div ref={ref} className="inner">
            {icon && (
              <div className="rbt-round-icon">
                <Image width={512} height={512} src={icon} alt="Icons Images" />
              </div>
            )}
            <div className="content">
              <h3 className="counter">
                <span className={numberClass}>{counterValue}</span>
              </h3>
              <span className="subtitle">{title}</span>
            </div>
          </div>
        </div>
      )}

      {counterStyle === "two" && (
        <div
          ref={ref}
          className={`rbt-counterup variation-01 rbt-hover-03 rbt-border-dashed ${styleClass}`}
        >
          <div className="inner">
            <div className={`rbt-round-icon ${iconClass}`}>
              <i className={icon} />
            </div>
            <div className="content">
              <h3 className={`counter without-icon ${numberClass}`}>
                {counterValue}
              </h3>
              <span className="rbt-title-style-2 d-block">{title}</span>
            </div>
          </div>
        </div>
      )}

      {counterStyle === "three" && (
        <div className="rbt-counterup rbt-hover-03 style-2 text-color-white">
          <div ref={ref} className="inner">
            <div className="content">
              <h3 className="counter color-white">
                {counterValue}
              </h3>
              <h5 className="title color-white">{title}</h5>
              <span className="subtitle color-white">{subtitle}</span>
            </div>
          </div>
        </div>
      )}

      {counterStyle === "four" && (
        <div ref={ref} className="rbt-counterup style-2">
          <div className="inner">
            <div className="content">
              <h3 className="counter">
                {counterValue}
              </h3>
              <span className="subtitle">{title}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CounterWidget;
