import React from 'react';
import { FaGithub } from 'react-icons/fa';

const Navbar = () => {
  return (
    <nav className="bg-slate-800 text-white">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center py-4 px-4 sm:px-8">
        {/* Logo */}
        <div className="text-xl font-bold mb-2 sm:mb-0">
          <span className="text-green-500">&lt;</span>
          Pass
          <span className="text-green-500">OP/&gt;</span>
        </div>

        {/* GitHub Button */}
        <a
          href="https://github.com/your-username" // Replace with your actual GitHub link
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-slate-700 border border-slate-500 px-4 py-1.5 rounded-full text-sm hover:bg-green-500 hover:text-white transition-all duration-300"
        >
          <FaGithub className="text-xl" />
          GitHub
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
