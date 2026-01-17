"""
Sticker calculation service.

Business Rules:
1. Base earn rate: 1 sticker per $10 of total basket spend (floor division)
2. Promo bonus: +1 sticker per unit of any item with category="promo"
3. Per-transaction cap: Maximum 5 stickers per transaction
"""

from decimal import Decimal
from typing import TypedDict


# Campaign configuration (hardcoded as per requirements)
DOLLARS_PER_STICKER = 10
PROMO_CATEGORY = "promo"
MAX_STICKERS_PER_TRANSACTION = 5


class Item(TypedDict):
    sku: str
    name: str
    quantity: int
    unit_price: float
    category: str


def calculate_total_amount(items: list[Item]) -> Decimal:
    """Calculate the total basket amount from items."""
    total = Decimal("0")
    for item in items:
        quantity = item.get("quantity", 0)
        unit_price = Decimal(str(item.get("unit_price", 0)))
        total += quantity * unit_price
    return total


def calculate_promo_bonus(items: list[Item]) -> int:
    """Calculate bonus stickers from promo items (+1 per unit)."""
    bonus = 0
    for item in items:
        if item.get("category", "").lower() == PROMO_CATEGORY:
            bonus += item.get("quantity", 0)
    return bonus


def calculate_stickers(items: list[Item], total_amount: Decimal | None = None) -> dict:
    """
    Calculate the number of stickers earned for a transaction.

    Args:
        items: List of items in the transaction
        total_amount: Optional pre-calculated total (if not provided, calculated from items)

    Returns:
        dict with:
            - stickers_earned: Final sticker count (capped)
            - total_amount: The basket total
            - breakdown: Details of calculation
    """
    # Calculate total if not provided
    if total_amount is None:
        total_amount = calculate_total_amount(items)

    # Rule 1: Base stickers (1 per $10)
    base_stickers = int(total_amount // DOLLARS_PER_STICKER)

    # Rule 2: Promo bonus
    promo_bonus = calculate_promo_bonus(items)

    # Total before cap
    raw_total = base_stickers + promo_bonus

    # Rule 3: Apply cap
    stickers_earned = min(raw_total, MAX_STICKERS_PER_TRANSACTION)

    return {
        "stickers_earned": stickers_earned,
        "total_amount": total_amount,
        "breakdown": {
            "base_stickers": base_stickers,
            "promo_bonus": promo_bonus,
            "raw_total": raw_total,
            "capped": raw_total > MAX_STICKERS_PER_TRANSACTION,
        }
    }
