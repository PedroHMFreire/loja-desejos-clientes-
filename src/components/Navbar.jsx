import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="bg-gray-900 p-4 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="sm:hidden">
          <button onClick={toggleMenu} className="text-white">
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
        <div className={`sm:flex ${isOpen ? 'block' : 'hidden'} sm:block`}>
          <ul className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <li>
              <Link
                to="/"
                className="text-white hover:text-orange-500 transition-colors px-3 py-2 rounded"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/desejos"
                className="text-white hover:text-orange-500 transition-colors px-3 py-2 rounded"
                onClick={() => setIsOpen(false)}
              >
                Desejos
              </Link>
            </li>
            <li>
              <Link
                to="/ranking"
                className="text-white hover:text-orange-500 transition-colors px-3 py-2 rounded"
                onClick={() => setIsOpen(false)}
              >
                Ranking
              </Link>
            </li>
            <li>
              <Link
                to="/cadastros"
                className="text-white hover:text-orange-500 transition-colors px-3 py-2 rounded"
                onClick={() => setIsOpen(false)}
              >
                Cadastros
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
