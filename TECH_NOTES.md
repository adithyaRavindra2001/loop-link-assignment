# Technical Notes

## Example API Requests

### Submit a Transaction





### Submit Another Transaction (to see accumulation)

I have extended the UI to create transactions where the users can create new transactions and earn the stickers. 
Here you can also test the idempotency by using the duplicated transaxtion id.


Expected: `stickers_earned: 5` (capped), with `breakdown.capped: true`

### Get Shopper Details

```bash
curl http://localhost:8000/api/shoppers/shopper-123/
```

### List All Shoppers

```bash
curl http://localhost:8000/api/shoppers/
```

### Test Validation (missing required field)

```bash
curl -X POST http://localhost:8000/api/transactions/ \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_id": "tx-bad",
    "store_id": "store-01",
    "timestamp": "2025-01-10T10:15:00Z",
    "items": []
  }'
```

Expected: 400 error with validation details

---

## AI Tools Usage

This project was built with assistance from Claude (Claude Code CLI).

## Design Decisions

### Backend

1. **Shopper balance as denormalized field**: The `sticker_balance` is stored directly on the `Shopper` model rather than computed from transactions. This provides faster lookups and is updated atomically with each transaction.

2. **Items stored as JSONField**: Transaction items are stored as a JSON array rather than a separate `Item` model. This simplifies the schema for this scope and avoids complex joins.

3. **Idempotency via transaction_id**: Duplicate transactions are detected by checking if `transaction_id` already exists. The API returns the existing result with `is_duplicate: true` flag.

4. **Atomic database transactions**: Shopper creation, transaction creation, and balance update are wrapped in a database transaction to ensure consistency.

### Frontend

1. **Component separation**: `ShopperLookup` handles the search form and state management, while `TransactionList` is a pure presentational component.

2. **Error and loading states**: The UI clearly shows loading spinners, error messages, and empty states to provide good UX feedback.

3. **Tailwind CSS**: Used for rapid styling with a clean, professional appearance without writing custom CSS.

---
