import React from 'react';
import { motion } from 'framer-motion';

const AboutPage = () => {
  return (
    <div className="w-screen w-full bg-gray-50">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-400 w-full"
      >
        <div className="w-full mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Notre Vision du Sport à Marseille
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Faciliter l'accès au sport pour tous les Marseillais à travers une plateforme innovante et communautaire.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Objectives Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 w-full">
        <div className="w-full mx-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">Nos Objectifs</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-medium text-gray-900">Accessibilité</h3>
                    <p className="mt-2 text-gray-600">Faciliter l'accès aux équipements sportifs pour tous les Marseillais</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-medium text-gray-900">Maintenance Participative</h3>
                    <p className="mt-2 text-gray-600">Contribuez à l'entretien des équipements en signalant les problèmes</p>
                  </div>
                </div> 
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-medium text-gray-900">Communauté</h3>
                    <p className="mt-2 text-gray-600">Créer des liens entre sportifs et favoriser les rencontres</p>
                  </div>
                </div>
                
              </div>
            </div>
            <div className="relative h-96 rounded-lg overflow-hidden shadow-xl">
              <img 
                src="/about.png" 
                alt="Sport à Marseille" 
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white w-full">
        <div className="w-full mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">80+</div>
              <div className="text-gray-600">Sportifs Actifs</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">250+</div>
              <div className="text-gray-600">Clubs Sportifs</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">150</div>
              <div className="text-gray-600">Licenciés</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">1k+</div>
              <div className="text-gray-600">Équipements</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      {/* <section className="py-16 px-4 sm:px-6 lg:px-8 w-full">
        <div className="w-full mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Le projet</h2>
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid md:grid-cols-3 gap-8"
          >
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-48 mb-6 rounded-lg overflow-hidden">
                <img src="/screen_carte.png" alt="Carte interactive" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Cartographie Interactive</h3>
              <p className="text-gray-600">Localisez facilement tous les équipements sportifs de Marseille</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-48 mb-6 rounded-lg overflow-hidden">
                <img src="/terrain-de-basket.jpg" alt="Maintenance participative" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Maintenance Participative</h3>
              <p className="text-gray-600">Contribuez à l'entretien des équipements en signalant les problèmes</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-48 mb-6 rounded-lg overflow-hidden">
                <img src="/casier.png" alt="Communauté sportive" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Communauté Sportive</h3>
              <p className="text-gray-600">Rejoignez une communauté active et participez à des événements sportifs</p>
            </div>
          </motion.div>
        </div>
      </section> */}
    </div>
  );
};

export default AboutPage;
