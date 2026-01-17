from django.db import models
from django.core.validators import MinValueValidator


class Shopper(models.Model):
    """Represents a shopper in the loyalty program."""

    shopper_id = models.CharField(max_length=100, unique=True, db_index=True)
    sticker_balance = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.shopper_id} (Balance: {self.sticker_balance})"

    class Meta:
        ordering = ['-created_at']


class Transaction(models.Model):
    """Represents a purchase transaction that awards stickers."""

    transaction_id = models.CharField(max_length=100, unique=True, db_index=True)
    shopper = models.ForeignKey(
        Shopper,
        on_delete=models.CASCADE,
        related_name='transactions'
    )
    store_id = models.CharField(max_length=100)
    timestamp = models.DateTimeField()
    items = models.JSONField(default=list)  # List of {sku, name, quantity, unit_price, category}
    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    stickers_earned = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.transaction_id} - {self.stickers_earned} stickers"

    class Meta:
        ordering = ['-timestamp']
