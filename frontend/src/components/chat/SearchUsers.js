import { MagnifyingGlassIcon as SearchIcon } from "@heroicons/react/24/solid";

export default function SearchUsers({ handleSearch }) {
  return (
    <div className="mx-4 my-4">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon
            className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors"
            aria-hidden="true"
          />
        </div>
        <input
          id="search"
          name="search"
          className="glass-input block py-2.5 pl-10 pr-3 w-full rounded-xl text-sm placeholder-gray-500 dark:placeholder-gray-400 dark:text-white"
          placeholder="Search contacts..."
          type="search"
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>
    </div>
  );
}
