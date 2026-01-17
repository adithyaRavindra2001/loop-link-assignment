# Mini Sticker Engine

A loyalty sticker campaign system where shoppers earn stickers on purchases and internal support agents can look up shopper balances and transaction history.

## Tech Stack

- **Backend**: Python 3.11+, Django 6.0, Django REST Framework
- **Database**: PostgreSQL 16
- **Frontend**: React 18, Vite, Tailwind CSS
- **API Communication**: Axios

## Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 16 (installed via Homebrew on macOS)

## Setup Instructions

### 1. Database Setup

Ensure PostgreSQL is running:

```bash
brew services start postgresql@16
```

Create the database (if not already created):

```bash
/opt/homebrew/opt/postgresql@16/bin/createdb looplink_stickers
```

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start the server
python manage.py runserver
```

The backend API will be available at `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Usage

### Web UI (Support Portal)

1. Open `http://localhost:5173` in your browser
2. Enter a shopper ID (e.g., `shopper-123`) in the search field
3. View the shopper's sticker balance and transaction history

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/transactions/` | Submit a transaction and award stickers |
| GET | `/api/shoppers/<shopper_id>/` | Get shopper details with transaction history |
| GET | `/api/shoppers/` | List all shoppers |

## Campaign Rules

1. **Base earn rate**: 1 sticker per $10 of total basket spend (floor division)
2. **Promo bonus**: +1 sticker per unit of any item with `category: "promo"`
3. **Per-transaction cap**: Maximum 5 stickers per transaction

## Project Structure

```
looplink_asgnmt/
├── backend/
│   ├── config/              # Django project settings
│   ├── stickers/            # Main app
│   │   ├── models.py        # Shopper, Transaction models
│   │   ├── serializers.py   # DRF serializers
│   │   ├── services.py      # Sticker calculation logic
│   │   ├── views.py         # API views
│   │   └── urls.py          # URL routing
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/             # API client
│   │   ├── components/      # React components
│   │   └── App.jsx          # Main app component
│   └── package.json
├── README.md
└── TECH_NOTES.md
```
