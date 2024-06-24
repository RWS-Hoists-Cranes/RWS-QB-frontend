import React, { useState } from 'react';
import { FaCheck } from 'react-icons/fa';
import { cn } from '@/lib/utils'; // Ensure you have the cn utility function

const ClickableBox = ({ text }) => {
  const [isChecked, setIsChecked] = useState(false);

  const handleClick = () => {
    setIsChecked(!isChecked);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "flex items-center justify-between p-4 border rounded-md cursor-pointer",
        isChecked ? "bg-green-100 border-green-500" : "bg-white border-gray-300"
      )}
    >
      <span>{text}</span>
      {isChecked && <FaCheck className="text-green-500" />}
    </div>
  );
};

export default ClickableBox;