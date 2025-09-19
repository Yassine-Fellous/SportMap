import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="w-screen">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-center p-8 md:p-16">
        <div className="max-w-2xl text-center md:text-left md:mr-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Marseille Sport</h1>
          <p className="text-lg text-gray-700 mb-8">
            Trouvez votre terrain idéal en quelques clics !
          </p>
          <Link
            to="/map"
            className="text-white font-bold p-4 pl-6 pr-6 rounded-xl shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            style={{
              backgroundSize: '200% 200%',
              backgroundImage: 'linear-gradient(45deg, #3b82f6, #60a5fa, #3b82f6)',
              animation: 'gradientAnimation 5s ease infinite',
            }}
          >
            Carte des équipements
          </Link>
        </div>
        <div className="mt-8 md:mt-0">
          <img src="/img.png" alt="Application mobile" className="w-full max-w-md rounded-lg" />
        </div>
      </section>

      {/* Service Cards Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 md:p-16">
        {/* Card 1 */}
        <div
          className="relative h-96 rounded-lg shadow-2xl overflow-hidden"
          style={{ backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("/screen_carte.png")' }}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-white">
            <h2 className="text-3xl font-bold mb-4">Les sports</h2>
            <p className="text-lg mb-6">Découvrez tous les sports disponibles à Marseille</p>
            <Link
              to="/sports"
              className="px-6 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition duration-300"
            >
              Sports
            </Link>
          </div>
        </div>

        {/* Card 2 */}
        <div
          className="relative h-96 rounded-lg shadow-2xl overflow-hidden"
          style={{ backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("/terrain-de-basket.jpg")' }}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-white">
            <h2 className="text-3xl font-bold mb-4">Le projet</h2>
            <p className="text-lg mb-6 text-center leading-relaxed tracking-wide">Géolocalisation, maintenance préventive collaborative, communauté.</p>
            <Link
              to="/about"
              className="px-6 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition duration-300"
            >
              A propos
            </Link>
          </div>
        </div>
      </section>

      {/* Blog Section (Commented Out) */}
      {/* <section className="p-8 md:p-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Les derniers articles</h2>
          <Link
            to="/blog"
            className="text-blue-600 font-semibold hover:underline"
          >
            Voir tous les articles →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {latestPosts.map(post => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </section> */}
    </div>
  );
};

export default HomePage;