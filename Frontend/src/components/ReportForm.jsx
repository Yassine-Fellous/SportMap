import React, { useState } from 'react';
import { X, Camera, MapPin, AlertTriangle, Clock, User } from 'lucide-react';

const ReportForm = ({ equipment, onClose }) => {
  const [formData, setFormData] = useState({
    problemType: '',
    description: '',
    urgency: 'moyenne',
    photos: [],
    email: '',
    anonymous: false
  });

  const problemTypes = [
    { id: 'maintenance', label: 'Problème de maintenance', icon: '🔧' },
    { id: 'securite', label: 'Problème de sécurité', icon: '⚠️' },
    { id: 'proprete', label: 'Problème de propreté', icon: '🧹' },
    { id: 'acces', label: 'Problème d\'accès', icon: '🚪' },
    { id: 'equipement', label: 'Équipement défaillant', icon: '🏃‍♂️' },
    { id: 'autre', label: 'Autre problème', icon: '❓' }
  ];

  const urgencyLevels = [
    { id: 'faible', label: 'Faible', color: 'bg-green-500' },
    { id: 'moyenne', label: 'Moyenne', color: 'bg-yellow-500' },
    { id: 'elevee', label: 'Élevée', color: 'bg-red-500' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Signalement soumis:', { ...formData, equipment });
    // Ici vous ajouteriez l'appel à l'API
    onClose();
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...files]
    }));
  };

  const removePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
      <div className="bg-white w-full max-h-[90vh] overflow-y-auto rounded-t-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-black">Signaler un problème</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X size={20} className="text-black" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          {/* Equipment Info */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center text-sm text-black mb-1">
              <MapPin size={16} className="mr-1" />
              <span>Équipement signalé</span>
            </div>
            <p className="font-medium text-black">{equipment?.name}</p>
            {equipment?.address && (
              <p className="text-sm text-black">{equipment.address}</p>
            )}
          </div>

          {/* Problem Type */}
          <div>
            <label className="block text-sm font-medium text-black mb-3">
              Type de problème *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {problemTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, problemType: type.id }))}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    formData.problemType === type.id
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 bg-white text-black hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{type.icon}</span>
                    <span className="text-sm font-medium">{type.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-sm font-medium text-black mb-3">
              Niveau d'urgence
            </label>
            <div className="flex space-x-2">
              {urgencyLevels.map((level) => (
                <button
                  key={level.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, urgency: level.id }))}
                  className={`flex-1 p-3 rounded-lg border text-center transition-all ${
                    formData.urgency === level.id
                      ? 'border-gray-400 bg-gray-100'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className={`w-3 h-3 ${level.color} rounded-full mx-auto mb-1`}></div>
                  <span className="text-sm font-medium text-black">{level.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Description du problème *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Décrivez le problème rencontré..."
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-500 bg-white"
              required
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Photos (optionnel)
            </label>
            <div className="space-y-3">
              <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                <div className="text-center">
                  <Camera size={24} className="mx-auto text-gray-400 mb-2" />
                  <span className="text-sm text-black">Ajouter des photos</span>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
              
              {formData.photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Email de contact (optionnel)
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="votre@email.com"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-500 bg-white"
            />
            <div className="mt-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.anonymous}
                  onChange={(e) => setFormData(prev => ({ ...prev, anonymous: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-black">Signalement anonyme</span>
              </label>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-black font-medium hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!formData.problemType || !formData.description}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Envoyer le signalement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportForm;