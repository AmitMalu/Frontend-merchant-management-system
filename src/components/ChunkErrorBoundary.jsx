import { Component } from 'react';

/**
 * Catches "Failed to fetch dynamically imported module" errors that happen
 * when the browser has cached an old index.html but a new build has been
 * deployed and the old chunk files no longer exist on the server.
 *
 * Strategy:
 * - On first chunk error → set a sessionStorage flag and do a hard reload.
 *   The hard reload fetches the new index.html and the correct new chunks.
 * - If the error persists after the reload (flag already set) → show a
 *   friendly "Please refresh" message instead of crashing the app.
 */
class ChunkErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, reloadAttempted: false };
  }

  static getDerivedStateFromError(error) {
    const isChunkError =
      error?.message?.includes('Failed to fetch dynamically imported module') ||
      error?.message?.includes('Importing a module script failed') ||
      error?.name === 'ChunkLoadError';

    if (isChunkError) {
      const alreadyReloaded = sessionStorage.getItem('chunk_reload') === '1';

      if (!alreadyReloaded) {
        sessionStorage.setItem('chunk_reload', '1');
        window.location.reload();
        // Return null — reload is in progress, don't render error UI yet
        return null;
      }

      return { hasError: true, reloadAttempted: true };
    }

    // Not a chunk error — let it propagate normally
    return { hasError: true, reloadAttempted: false };
  }

  componentDidCatch(error, info) {
    console.error('ChunkErrorBoundary caught:', error, info);
  }

  componentDidMount() {
    // Clear the reload flag once the app loads successfully
    sessionStorage.removeItem('chunk_reload');
  }

  handleManualReload = () => {
    sessionStorage.removeItem('chunk_reload');
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8 text-center">
            <div className="text-5xl mb-4">🔄</div>
            <h1 className="text-xl font-bold text-gray-800 mb-2">
              New version available
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              The application has been updated. Please refresh the page to
              load the latest version.
            </p>
            <button
              onClick={this.handleManualReload}
              className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Refresh Now
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ChunkErrorBoundary;
