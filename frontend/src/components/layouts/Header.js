import { ArrowRightOnRectangleIcon as LogoutIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";
import Logout from "../accounts/Logout";
import ThemeToggler from "./ThemeToggler";

export default function Header() {
  const [modal, setModal] = useState(false);
  const { currentUser } = useAuth();

  return (
    <>
      <nav className="sticky w-full z-50 top-0 left-0 border-b border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl shadow-sm transition-colors duration-300">
        <div className="container mx-auto px-4 py-3 flex flex-wrap items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="self-center text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              ChatApp
            </span>
          </Link>
          <div className="flex items-center space-x-3 md:order-2">
            <ThemeToggler />

            {currentUser && (
              <>
                <Link
                  to="/profile"
                  className="relative transition-transform hover:scale-105 focus:outline-none"
                >
                  <div className="absolute inset-0 bg-indigo-500 blur opacity-40 rounded-full"></div>
                  <img
                    className="relative h-9 w-9 rounded-full border-2 border-white dark:border-gray-800 object-cover"
                    src={currentUser.photoURL}
                    alt="Profile"
                  />
                </Link>
                <button
                  className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 focus:outline-none rounded-lg text-sm p-2 transition-colors"
                  onClick={() => setModal(true)}
                  title="Logout"
                >
                  <LogoutIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
      
      {modal && <Logout modal={modal} setModal={setModal} />}
    </>
  );
}
