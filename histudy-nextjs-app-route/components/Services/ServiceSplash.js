
import Image from "next/image";

import icons01 from "../../public/images/icons/icons-01.png";
import icons02 from "../../public/images/icons/icons-02.png";
import icons03 from "../../public/images/icons/icons-03.png";
import icons04 from "../../public/images/icons/icons-04.png";

const ServiceValues = [
    {
        image: icons01,
        title: "Fast Performance",
        desc: "Optimized for a smaller build size, faster dev compilation and dozens of other improvements.",
    },
    {
        image: icons02,
        title: "Perfect Responsive",
        desc: "Our template is full perfect for all device. You can visit our template all device easily.",
    },
    {
        image: icons03,
        title: "Fast & Friendly Support",
        desc: "We are provide 24 hours support for all clients.You can purchase without hesitation.",
    },
    {
        image: icons04,
        title: "Easy to Use",
        desc: "Create your own custom template or section by copying, pasting, and assembling.",
    },
];

const ServiceSplash = ({ settings }) => {
    const title = settings?.heading || "Why Learners Choose AddOnn";
    const services = settings?.items || ServiceValues.map(item => ({
        icon: item.image,
        title: item.title,
        description: item.desc
    }));

    return (
        <>
            <div className="col-lg-12">
                <div className="section-title text-center">
                    {settings?.subTitle && (
                        <span className="subtitle bg-primary-opacity">
                            {settings.subTitle}
                        </span>
                    )}
                    {settings?.heading && <h2 className="title">{settings.heading}</h2>}
                </div>
                <div className="row">
                    <div className="splash-service-main position-relative">
                        <div className="service-wrapper service-white">
                            <div className="row g-0">
                                {services.map((data, index) => (
                                    <div
                                        className="col-lg-6 col-xl-3 col-md-6 col-sm-6 col-12 service__style--column"
                                        key={index}
                                    >
                                        <div className="service service__style--1">
                                            <div className="icon">
                                                <Image
                                                    src={data.icon || data.image}
                                                    width={60}
                                                    height={60}
                                                    alt="Icon Images"
                                                />
                                            </div>
                                            <div className="content">
                                                <h4 className="title">{data.title}</h4>
                                                <p>{data.description || data.desc}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ServiceSplash;
