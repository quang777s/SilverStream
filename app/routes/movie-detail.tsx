import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";

interface Movie {
  title: string;
  year: string;
  rating: string;
  genres: string[];
  url: string;
  image_url: string;
  video_source: string;
  description: string;
}

interface MoviesData {
  total_movies: number;
  movies: Movie[];
}

export function meta() {
  return [
    { title: "Movie Details - SilverStream" },
    { name: "description", content: "Movie details and information" },
  ];
}

export default function MovieDetail() {
  const { title } = useParams<{ title: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMovie = async () => {
      try {
        setLoading(true);
        const response = await fetch("/data/movies.json");
        if (!response.ok) {
          throw new Error("Failed to load movies");
        }
        const data: MoviesData = await response.json();

        // Decode the title from URL and find the movie
        const decodedTitle = decodeURIComponent(title || "");
        const foundMovie = data.movies.find(
          (m) => m.title.toLowerCase() === decodedTitle.toLowerCase()
        );

        if (foundMovie) {
          setMovie(foundMovie);
        } else {
          setError("Movie not found");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    if (title) {
      loadMovie();
    }
  }, [title]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading movie details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || "Movie not found"}
          </h1>
          <Link
            to="/"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

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
                Movie Details
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link
          to="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 transition-colors"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Movies
        </Link>
      </div>

      {/* Movie Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Movie Poster */}
            <div className="lg:col-span-1">
              <div className="aspect-[2/3] relative">
                <img
                  src={movie.image_url}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      "https://via.placeholder.com/400x600/374151/9CA3AF?text=No+Image";
                  }}
                />
                <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white text-sm px-3 py-2 rounded-lg">
                  {movie.rating}
                </div>
              </div>
            </div>

            {/* Movie Information */}
            <div className="lg:col-span-2 p-8">
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    {movie.title}
                  </h1>

                  {/* Basic Info */}
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <span className="text-lg text-gray-600 dark:text-gray-400">
                      {movie.year}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {movie.genres.map((genre) => (
                        <span
                          key={genre}
                          className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      Description
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                      {movie.description}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <a
                      href={movie.video_source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white text-center px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                      Watch Movie
                    </a>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        Title:
                      </span>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">
                        {movie.title}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        Year:
                      </span>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">
                        {movie.year}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        Rating:
                      </span>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">
                        {movie.rating}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        Genres:
                      </span>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">
                        {movie.genres.join(", ")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
