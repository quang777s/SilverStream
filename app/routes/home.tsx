import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router";

interface Movie {
  title: string;
  year: string;
  rating: string;
  genres: string[];
  url: string;
  image_url: string;
  video_source: string;
}

interface MoviesData {
  total_movies: number;
  movies: Movie[];
}

export function meta() {
  return [
    { title: "SilverStream - Home" },
    { name: "description", content: "Browse our collection of English movies" },
  ];
}

const MOVIES_PER_PAGE = 20;

export default function Home() {
  const [moviesData, setMoviesData] = useState<MoviesData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize filter states from URL parameters
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedGenre, setSelectedGenre] = useState(searchParams.get("genre") || "");
  const [selectedYear, setSelectedYear] = useState(searchParams.get("year") || "");
  const [selectedRating, setSelectedRating] = useState(searchParams.get("rating") || "");

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (selectedGenre) params.set("genre", selectedGenre);
    if (selectedYear) params.set("year", selectedYear);
    if (selectedRating) params.set("rating", selectedRating);
    
    setSearchParams(params, { replace: true });
  }, [searchTerm, selectedGenre, selectedYear, selectedRating, setSearchParams]);

  // Update filters from URL when it changes (e.g., browser back/forward)
  useEffect(() => {
    setSearchTerm(searchParams.get("search") || "");
    setSelectedGenre(searchParams.get("genre") || "");
    setSelectedYear(searchParams.get("year") || "");
    setSelectedRating(searchParams.get("rating") || "");
  }, [searchParams]);

  useEffect(() => {
    const loadMovies = async () => {
      try {
        setLoading(true);
        const response = await fetch("/data/movies.json");
        if (!response.ok) {
          throw new Error("Failed to load movies");
        }
        const data: MoviesData = await response.json();
        setMoviesData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedGenre, selectedYear, selectedRating]);

  // Get unique values for filters
  const filterOptions = useMemo(() => {
    if (!moviesData) return { genres: [], years: [], ratings: [] };

    const allGenres = new Set<string>();
    const allYears = new Set<string>();
    const allRatings = new Set<string>();

    moviesData.movies.forEach(movie => {
      movie.genres.forEach(genre => allGenres.add(genre));
      allYears.add(movie.year);
      allRatings.add(movie.rating);
    });

    return {
      genres: Array.from(allGenres).sort(),
      years: Array.from(allYears).sort((a, b) => parseInt(b) - parseInt(a)),
      ratings: Array.from(allRatings).sort()
    };
  }, [moviesData]);

  // Filter movies based on search and filter criteria
  const filteredMovies = useMemo(() => {
    if (!moviesData) return [];

    return moviesData.movies.filter(movie => {
      const matchesSearch = searchTerm === "" || 
        movie.title.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesGenre = selectedGenre === "" || 
        movie.genres.includes(selectedGenre);
      
      const matchesYear = selectedYear === "" || 
        movie.year === selectedYear;
      
      const matchesRating = selectedRating === "" || 
        movie.rating === selectedRating;

      return matchesSearch && matchesGenre && matchesYear && matchesRating;
    });
  }, [moviesData, searchTerm, selectedGenre, selectedYear, selectedRating]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedGenre("");
    setSelectedYear("");
    setSelectedRating("");
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading movies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!moviesData) {
    return null;
  }

  const totalPages = Math.ceil(filteredMovies.length / MOVIES_PER_PAGE);
  const startIndex = (currentPage - 1) * MOVIES_PER_PAGE;
  const endIndex = startIndex + MOVIES_PER_PAGE;
  const currentMovies = filteredMovies.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hasActiveFilters = searchTerm || selectedGenre || selectedYear || selectedRating;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <img 
              src="/silver1.png" 
              alt="SilverStream Logo" 
              className="h-16 w-auto"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                SilverStream
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Discover amazing movies from our collection of {moviesData.total_movies.toLocaleString()} titles
                {hasActiveFilters && ` • ${filteredMovies.length} matching results`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Search & Filter</h2>
          
          {/* Search Bar */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Movies
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by movie title..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Genre
              </label>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Genres</option>
                {filterOptions.genres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Years</option>
                {filterOptions.years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rating
              </label>
              <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Ratings</option>
                {filterOptions.ratings.map(rating => (
                  <option key={rating} value={rating}>{rating}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-md transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </div>
      </div>

      {/* Movies Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredMovies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No movies found matching your criteria.
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {currentMovies.map((movie, index) => (
                <div
                  key={`${movie.title}-${startIndex + index}`}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="aspect-[2/3] relative">
                    <img
                      src={movie.image_url}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://via.placeholder.com/300x450/374151/9CA3AF?text=No+Image";
                      }}
                    />
                    <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      {movie.rating}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2 line-clamp-2">
                      {movie.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
                      <span>{movie.year}</span>
                      <div className="flex flex-wrap gap-1 flex-row">
                        {movie.genres.slice(0, 2).map((genre) => (
                          <span
                            key={genre}
                            className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={movie.video_source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-2 rounded text-center transition-colors"
                      >
                        Watch
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex flex-col items-center">
                <div className="flex items-center space-x-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    Previous
                  </button>

                  {/* Page Numbers */}
                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-2 text-sm font-medium rounded-md cursor-pointer ${
                            currentPage === pageNum
                              ? "bg-blue-600 text-white"
                              : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    Next
                  </button>
                </div>

                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage} of {totalPages} • Showing {startIndex + 1}-{Math.min(endIndex, filteredMovies.length)} of {filteredMovies.length} movies
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
