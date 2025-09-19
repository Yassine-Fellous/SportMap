import React from 'react';

const PopupHeader = ({ name, onClose }) => (
  <div className='bg-white pt-2 rounded-t-lg relative'>
    <h2 className="text-lg font-semibold text-black mb-2 pr-8">
      {name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()}
    </h2>
  </div>
);

export default PopupHeader;