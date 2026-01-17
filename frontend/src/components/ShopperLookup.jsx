import { useState } from 'react';
import { getShopperDetails } from '../api/stickers';
import TransactionList from './TransactionList';

function ShopperLookup() {
  const [shopperId, setShopperId] = useState('');
  const [shopper, setShopper] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!shopperId.trim()) {
      setError('Please enter a shopper ID');
      return;
    }

    setLoading(true);
    setError(null);
    setShopper(null);
    setSearched(true);

    try {
      const data = await getShopperDetails(shopperId.trim());
      setShopper(data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError(`Shopper "${shopperId}" not found`);
      } else {
        setError('Failed to fetch shopper details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setShopperId('');
    setShopper(null);
    setError(null);
    setSearched(false);
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="flex-1">
          <label htmlFor="shopperId" className="sr-only">
            Shopper ID
          </label>
          <input
            type="text"
            id="shopperId"
            value={shopperId}
            onChange={(e) => setShopperId(e.target.value)}
            placeholder="Enter shopper ID (e.g., shopper-123)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
        {searched && (
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-all"
          >
            Clear
          </button>
        )}
      </form>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Loading shopper details...</span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Shopper Details */}
      {shopper && !loading && (
        <div className="space-y-6">
          {/* Balance Card */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-medium">Shopper ID</p>
                <p className="text-xl font-bold">{shopper.shopper_id}</p>
              </div>
              <div className="text-right">
                <p className="text-indigo-100 text-sm font-medium">Sticker Balance</p>
                <p className="text-4xl font-bold">{shopper.sticker_balance}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-indigo-400/30 flex justify-between text-sm">
              <span className="text-indigo-100">
                Member since: {new Date(shopper.created_at).toLocaleDateString()}
              </span>
              <span className="text-indigo-100">
                {shopper.transactions?.length || 0} transaction(s)
              </span>
            </div>
          </div>

          {/* Transaction History */}
          <TransactionList transactions={shopper.transactions || []} />
        </div>
      )}

      {/* Empty State (before search) */}
      {!searched && !loading && (
        <div className="text-center py-12 text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="mt-4 text-lg">Enter a shopper ID to view their sticker balance and transaction history</p>
        </div>
      )}
    </div>
  );
}

export default ShopperLookup;
