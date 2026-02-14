"use client";

import Image from "next/image";

import CounterHead from "./Counter-Head";

import CounterData from "../../data/elements/counter.json";
import CounterWrap from "./CounterWrap";

const Counter = ({ isDesc, head, settings }) => {
  const dataToRender = settings?.items
    ? [{
      body: settings.items.map(item => ({
        num: parseInt(item.value.replace(/[^0-9]/g, '')) || 0,
        text: item.label,
        img: item.icon,
        value: item.value, // Keep original string if needed
        top: false // API doesn't seem to have 'top' property, default to false or alternate?
      }))
    }]
    : CounterData.counterOne;

  return (
    <>
      {dataToRender &&
        dataToRender.map((data, index) => (
          <div className="container" key={index}>
            {head === undefined && settings?.heading ? (
              <div className="section-title text-center mb--40">
                <h2 className="title">{settings.heading}</h2>
              </div>
            ) : head === undefined ? (
              <CounterHead
                bgClass="bg-primary-opacity"
                mb="mb--40"
                tag={data.tag}
                title={data.title}
                subTitle={data.subTitle}
                desc={isDesc ? data.desc : ""}
              />
            ) : (
              ""
            )}
            <div className="row g-5 hanger-line">
              {data.body.map((item, innerIndex) => (
                <div
                  className={`${item.top
                      ? "col-lg-3 col-md-6 col-sm-6 col-12 mt_md--60 mt_sm--60"
                      : "col-lg-3 col-md-6 col-sm-6 col-12 mt--60 mt_md--30 mt_sm--30 mt_mobile--60"
                    }`}
                  key={innerIndex}
                >
                  <div className="rbt-counterup rbt-hover-03 border-bottom-gradient">
                    <div className="top-circle-shape"></div>
                    <div className="inner">
                      <div className="rbt-round-icon">
                        <Image
                          src={item.img}
                          width={50}
                          height={50}
                          alt="Icons Images"
                        />
                      </div>
                      <div className="content">
                        <h3 className="counter">
                          <span className="odometer">
                            <CounterWrap value={item.num} format="(d)" />
                          </span>
                        </h3>
                        <span className="subtitle">{item.text}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
    </>
  );
};

export default Counter;
