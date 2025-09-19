import { useState, useEffect } from 'react';

export const useSports = () => {
  const [sports, setSports] = useState(null);
  const [errorSports, setError] = useState(null);
  const [loadingSports, setLoading] = useState(true);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;
    fetch(`${apiUrl}/sports/`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then(data => {
        console.log('Sports:', data); 
        setSports(data.sports);
        setLoading(false);
      })
      .catch(error => {
        setError(error);
        setLoading(false);
      });
  }, []);

  return { sports, errorSports, loadingSports };
};