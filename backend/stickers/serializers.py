from rest_framework import serializers
from .models import Shopper, Transaction


class ItemSerializer(serializers.Serializer):
    """Serializer for transaction items."""

    sku = serializers.CharField(max_length=100)
    name = serializers.CharField(max_length=255)
    quantity = serializers.IntegerField(min_value=1)
    unit_price = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0)
    category = serializers.CharField(max_length=100)


class TransactionInputSerializer(serializers.Serializer):
    """Serializer for incoming transaction requests."""

    transaction_id = serializers.CharField(max_length=100)
    shopper_id = serializers.CharField(max_length=100)
    store_id = serializers.CharField(max_length=100)
    timestamp = serializers.DateTimeField()
    items = ItemSerializer(many=True, allow_empty=False)

    def validate_items(self, value):
        """Ensure at least one item and validate item data."""
        if not value:
            raise serializers.ValidationError("Transaction must have at least one item.")
        return value


class TransactionOutputSerializer(serializers.ModelSerializer):
    """Serializer for transaction responses."""

    class Meta:
        model = Transaction
        fields = [
            'transaction_id',
            'store_id',
            'timestamp',
            'items',
            'total_amount',
            'stickers_earned',
            'created_at',
        ]


class ShopperSerializer(serializers.ModelSerializer):
    """Serializer for shopper data."""

    transactions = TransactionOutputSerializer(many=True, read_only=True)

    class Meta:
        model = Shopper
        fields = [
            'shopper_id',
            'sticker_balance',
            'transactions',
            'created_at',
            'updated_at',
        ]


