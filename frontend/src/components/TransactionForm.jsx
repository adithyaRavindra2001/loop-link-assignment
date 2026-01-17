import { useState } from 'react';
import { submitTransaction } from '../api/stickers';

function TransactionForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    transaction_id: '',
    shopper_id: '',
    store_id: 'store-01',
    items: [{ sku: '', name: '', quantity: 1, unit_price: '', category: 'grocery' }],
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { sku: '', name: '', quantity: 1, unit_price: '', category: 'grocery' }],
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData((prev) => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload = {
        ...formData,
        timestamp: new Date().toISOString(),
        items: formData.items.map((item) => ({
          ...item,
          quantity: parseInt(item.quantity, 10),
          unit_price: parseFloat(item.unit_price),
        })),
      };

      const data = await submitTransaction(payload);
      setResult(data);
      if (onSuccess) onSuccess(data);
    } catch (err) {
      setError(err.response?.data?.details || err.response?.data?.error || 'Failed to submit transaction');
    } finally {
      setLoading(false);
    }
  };

  const generateTransactionId = () => {
    setFormData((prev) => ({
      ...prev,
      transaction_id: `tx-${Date.now()}`,
    }));
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Transaction & Shopper Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transaction ID
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="transaction_id"
                value={formData.transaction_id}
                onChange={handleInputChange}
                placeholder="tx-1001"
                required
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
              <button
                type="button"
                onClick={generateTransactionId}
                className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-sm"
                title="Generate ID"
              >
                Gen
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shopper ID
            </label>
            <input
              type="text"
              name="shopper_id"
              value={formData.shopper_id}
              onChange={handleInputChange}
              placeholder="shopper-123"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Store ID
            </label>
            <input
              type="text"
              name="store_id"
              value={formData.store_id}
              onChange={handleInputChange}
              placeholder="store-01"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>

        {/* Items */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">Items</label>
            <button
              type="button"
              onClick={addItem}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              + Add Item
            </button>
          </div>
          <div className="space-y-3">
            {formData.items.map((item, index) => (
              <div key={index} className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-2">
                  <input
                    type="text"
                    value={item.sku}
                    onChange={(e) => handleItemChange(index, 'sku', e.target.value)}
                    placeholder="SKU"
                    required
                    className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                    placeholder="Name"
                    required
                    className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    placeholder="Qty"
                    min="1"
                    required
                    className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="number"
                    value={item.unit_price}
                    onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                    placeholder="Price"
                    min="0"
                    step="0.01"
                    required
                    className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                  />
                  <select
                    value={item.category}
                    onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                    className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                  >
                    <option value="grocery">Grocery</option>
                    <option value="promo">Promo (+1 sticker)</option>
                    <option value="electronics">Electronics</option>
                    <option value="clothing">Clothing</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                {formData.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? 'Processing...' : 'Submit Transaction'}
        </button>
      </form>

      {/* Result */}
      {result && (
        <div className={`p-4 rounded-lg ${result.is_duplicate ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
          <div className="flex items-start gap-3">
            <div className={`p-1 rounded-full ${result.is_duplicate ? 'bg-yellow-100' : 'bg-green-100'}`}>
              {result.is_duplicate ? (
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <h4 className={`font-medium ${result.is_duplicate ? 'text-yellow-800' : 'text-green-800'}`}>
                {result.is_duplicate ? 'Duplicate Transaction' : 'Transaction Processed!'}
              </h4>
              <div className="mt-2 text-sm space-y-1">
                <p><span className="text-gray-600">Shopper:</span> {result.shopper_id}</p>
                <p><span className="text-gray-600">Stickers Earned:</span> <strong>+{result.stickers_earned}</strong></p>
                <p><span className="text-gray-600">New Balance:</span> <strong>{result.new_balance}</strong></p>
                {result.breakdown?.capped && (
                  <p className="text-amber-600">* Capped at 5 stickers (raw total: {result.breakdown.raw_total})</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{typeof error === 'string' ? error : JSON.stringify(error)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default TransactionForm;
