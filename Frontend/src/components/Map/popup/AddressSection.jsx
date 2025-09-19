import React from 'react';
import { Route } from 'lucide-react';

const AddressSection = ({ address, city }) => {
  // Construct the Google Maps URL
  const fullAddress = `${address} ${city}`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

  return (
    <div>
      <p className="text-sm mb-2 mt-2 font-bold text-black">Adresse :</p>
      <div className="mt-2 p-2 bg-white-100 shadow rounded-lg flex items-center justify-between">
        <p className="text-sm text-black">
          {address} {city}
        </p>
        <a
          href={mapsUrl}
          target="_blank" // Opens the link in a new tab
          rel="noopener noreferrer" // Recommended for security
          className="ml-4 p-2 bg-white-100 rounded-lg shadow cursor-pointer transition-all duration-300 hover:bg-gray-200"
        >
          <Route color="blue" size={20} />
        </a>
      </div>
    </div>
  );
};

export default AddressSection;