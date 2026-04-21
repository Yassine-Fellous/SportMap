import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

const NativeCheck = () => {
  const [platform, setPlatform] = useState('Chargement...');

  useEffect(() => {
    const checkPlatform = async () => {
      const currentPlatform = Capacitor.getPlatform();
      setPlatform(currentPlatform);
    };

    checkPlatform();
  }, []);

  return (
    <div>
      <h2>Vérification de la plateforme</h2>
      <p>Cette application tourne sur : <strong>{platform}</strong></p>
    </div>
  );
};

export default NativeCheck;
