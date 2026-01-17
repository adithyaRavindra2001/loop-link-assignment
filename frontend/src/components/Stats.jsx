import { useState, useEffect } from 'react';
import axios from 'axios';

function Stats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/stats/');
      setStats(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600">Loading stats...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-4 text-white">
          <p className="text-indigo-100 text-sm">Total Stickers</p>
          <p className="text-3xl font-bold">{stats.total_stickers_awarded}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
          <p className="text-green-100 text-sm">Transactions</p>
          <p className="text-3xl font-bold">{stats.total_transactions}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <p className="text-purple-100 text-sm">Shoppers</p>
          <p className="text-3xl font-bold">{stats.total_shoppers}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-4 text-white">
          <p className="text-amber-100 text-sm">Avg per Txn</p>
          <p className="text-3xl font-bold">{stats.avg_stickers_per_transaction}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stickers by Store */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Stickers by Store</h3>
          {stats.stickers_by_store.length === 0 ? (
            <p className="text-gray-500 text-sm">No data yet</p>
          ) : (
            <div className="space-y-3">
              {stats.stickers_by_store.map((store) => (
                <div key={store.store_id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{store.store_id}</p>
                    <p className="text-xs text-gray-500">{store.transaction_count} transactions</p>
                  </div>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full font-semibold">
                    {store.total_stickers}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Shoppers */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Top Shoppers</h3>
          {stats.top_shoppers.length === 0 ? (
            <p className="text-gray-500 text-sm">No data yet</p>
          ) : (
            <div className="space-y-3">
              {stats.top_shoppers.map((shopper, index) => (
                <div key={shopper.shopper_id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-100 text-gray-600' :
                      index === 2 ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-50 text-gray-500'
                    }`}>
                      {index + 1}
                    </span>
                    <p className="font-medium text-gray-900">{shopper.shopper_id}</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                    {shopper.sticker_balance}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Refresh Button */}
      <div className="text-center">
        <button
          onClick={fetchStats}
          className="text-sm text-indigo-600 hover:text-indigo-800"
        >
          Refresh Stats
        </button>
      </div>
    </div>
  );
}

export default Stats;
