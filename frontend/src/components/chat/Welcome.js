import { WelcomeSVG } from "../../utils/WelcomeSVG";

export default function Welcome() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-transparent p-8">
      <div className="max-w-md w-full text-center space-y-6 animate-fade-in-up">
        <div className="flex justify-center mb-8 drop-shadow-xl hover:scale-105 transition-transform duration-500">
          <WelcomeSVG />
        </div>
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
          Welcome to ChatApp!
        </h2>
        <p className="text-lg text-gray-500 dark:text-gray-400">
          Select a conversation from the sidebar or start a new chat to begin messaging.
        </p>
      </div>
    </div>
  );
}
