"""Money helpers — all amounts stored as integer minor units + ISO 4217 code.

Rule: never use floats for money. Never convert currency silently.
"""

from __future__ import annotations

from decimal import ROUND_HALF_UP, Decimal


class CurrencyMismatchError(ValueError):
    """Raised when two amounts with different currencies are compared."""


# Minor-unit multipliers for common currencies
# fmt: off
_MINOR_UNITS: dict[str, int] = {
    "USD": 100, "EUR": 100, "GBP": 100, "CAD": 100, "AUD": 100,
    "INR": 100, "JPY": 1,   "KRW": 1,   "HUF": 1,   "TWD": 1,
    "BHD": 1000,"KWD": 1000,"OMR": 1000,"JOD": 1000,
}
# fmt: on
_DEFAULT_MINOR = 100


def _multiplier(currency: str) -> int:
    return _MINOR_UNITS.get(currency.upper(), _DEFAULT_MINOR)


def to_minor(value: str | Decimal, currency: str) -> int:
    """Convert a decimal string / Decimal to integer minor units.

    Example: to_minor("9.99", "USD") -> 999
    """
    m = _multiplier(currency)
    dec = Decimal(str(value))
    return int((dec * m).to_integral_value(ROUND_HALF_UP))


def from_minor(amount_int: int, currency: str) -> Decimal:
    """Convert integer minor units back to Decimal.

    Example: from_minor(999, "USD") -> Decimal("9.99")
    """
    m = _multiplier(currency)
    return Decimal(amount_int) / Decimal(m)


def format_display(amount_int: int, currency: str) -> str:
    """Human-readable amount with currency symbol prefix.

    Example: format_display(999, "USD") -> "USD 9.99"
    """
    value = from_minor(amount_int, currency)
    if _multiplier(currency) == 1:
        return f"{currency} {int(value):,}"
    return f"{currency} {value:,.2f}"


def assert_same_currency(currency_a: str, currency_b: str) -> None:
    """Raise CurrencyMismatchError if currencies differ."""
    if currency_a.upper() != currency_b.upper():
        raise CurrencyMismatchError(
            f"Cannot operate on {currency_a} and {currency_b}"
        )
