from decimal import Decimal

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db import transaction as db_transaction

from .models import Shopper, Transaction
from .serializers import (
    TransactionInputSerializer,
    ShopperSerializer,
)
from .services import calculate_stickers


def serialize_items_for_storage(items):
    """Convert items to JSON-serializable format (Decimal -> float)."""
    return [
        {
            **item,
            'unit_price': float(item['unit_price']) if isinstance(item['unit_price'], Decimal) else item['unit_price']
        }
        for item in items
    ]


@api_view(['POST'])
def process_transaction(request):
    """
    Process a transaction and award stickers.

    Handles idempotency: if transaction_id already exists, returns the existing
    result without double-awarding stickers.
    """
    serializer = TransactionInputSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(
            {"error": "Invalid input", "details": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )

    data = serializer.validated_data
    transaction_id = data.get('transaction_id')
    shopper_id = data.get('shopper_id')

    # Check for duplicate transaction (idempotency)
    existing_txn = Transaction.objects.filter(transaction_id=transaction_id).first()
    if existing_txn:
        return Response({
            'transaction_id': existing_txn.transaction_id,
            'shopper_id': existing_txn.shopper.shopper_id,
            'stickers_earned': existing_txn.stickers_earned,
            'new_balance': existing_txn.shopper.sticker_balance,
            'breakdown': {},
            'is_duplicate': True,
        }, status=status.HTTP_200_OK)

    # Calculate stickers
    items = data.get('items', [])
    calc_result = calculate_stickers(items)
    stickers_earned = calc_result.get('total_stickers', 0)
    total_amount = calc_result.get('total_amount', 0)

    # Use atomic transaction to ensure consistency
    with db_transaction.atomic():
        # Get or create shopper
        shopper, _ = Shopper.objects.get_or_create(shopper_id=shopper_id)

        # Create transaction record
        txn = Transaction.objects.create(
            transaction_id=transaction_id,
            shopper=shopper,
            store_id=data['store_id'],
            timestamp=data['timestamp'],
            items=serialize_items_for_storage(items),
            total_amount=total_amount,
            stickers_earned=stickers_earned,
        )

        # Update shopper balance
        shopper.sticker_balance += stickers_earned
        shopper.save()

    result = Response({
        'transaction_id': txn.transaction_id,
        'shopper_id': shopper.shopper_id,
        'stickers_earned': stickers_earned,
        'new_balance': shopper.sticker_balance,
        'breakdown': calc_result['breakdown'],
        'is_duplicate': False,
    }, status=status.HTTP_201_CREATED)

    return result


@api_view(['GET'])
def get_shopper(request, shopper_id):
    """
    Get shopper details including sticker balance and transaction history.
    """
    try:
        shopper = Shopper.objects.prefetch_related('transactions').get(shopper_id=shopper_id)
    except Shopper.DoesNotExist:
        return Response(
            {"error": "Shopper not found", "shopper_id": shopper_id},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = ShopperSerializer(shopper)
    return Response(serializer.data)


@api_view(['GET'])
def list_shoppers(request):
    """
    List all shoppers (for the UI dropdown/search).
    """
    shoppers = Shopper.objects.all().values('shopper_id', 'sticker_balance')
    return Response(list(shoppers))


@api_view(['GET'])
def get_stats(request):
    """
    Get campaign statistics.
    """
    from django.db.models import Sum, Count, Avg

    total_stickers = Transaction.objects.aggregate(total=Sum('stickers_earned'))['total'] or 0

    total_transactions = Transaction.objects.count()

    avg_stickers = Transaction.objects.aggregate(avg=Avg('stickers_earned'))['avg'] or 0

    stickers_by_store = list(
        Transaction.objects.values('store_id')
        .annotate(
            total_stickers=Sum('stickers_earned'),
            transaction_count=Count('id')
        )
        .order_by('-total_stickers')
    )

    stickers_by_shopper = list(
        Shopper.objects.values('shopper_id', 'sticker_balance')
        .order_by('-sticker_balance')[:10]
    )

    total_shoppers = Shopper.objects.count()

    return Response({
        'total_stickers_awarded': total_stickers,
        'total_transactions': total_transactions,
        'total_shoppers': total_shoppers,
        'avg_stickers_per_transaction': round(avg_stickers, 2),
        'stickers_by_store': stickers_by_store,
        'top_shoppers': stickers_by_shopper,
    })
