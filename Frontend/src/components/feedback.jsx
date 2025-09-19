import React from 'react';
import { MessageSquare } from 'lucide-react';

const Feedback = () => {
  const handleClick = () => {
    window.open('https://forms.gle/8TLwvXP5XTBUmmxb8', '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg flex items-center gap-2 z-50"
      aria-label="Feedback"
    >
      <MessageSquare size={20} />
      <span>Feedback</span>
    </button>
  );
};

export default Feedback;