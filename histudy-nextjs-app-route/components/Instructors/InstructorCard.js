import React from "react";
import InstructorCardCore from "./InstructorCardCore";

const InstructorCard = React.forwardRef(({ instructor, onOpenModal }, ref) => {
    return (
        <div className="col-lg-4 col-md-6 col-12" ref={ref}>
            <InstructorCardCore
                instructor={instructor}
                onOpenModal={onOpenModal}
                showSocialIcons={false}
            />
        </div>
    );
});

export default InstructorCard;
