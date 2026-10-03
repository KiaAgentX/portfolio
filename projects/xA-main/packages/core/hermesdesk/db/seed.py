from __future__ import annotations

from datetime import date
from pathlib import Path

from sqlalchemy.ext.asyncio import AsyncSession

from hermesdesk.db.models import Price, Product

CSV_DIR = Path(__file__).resolve().parents[4] / "data" / "catalog"

DEFAULT_PRODUCTS = [
    {
        "sku": "TURB-32",
        "name_ar": "زيت توربين ISO VG 32",
        "name_en": "Turbine Oil ISO VG 32",
        "category": "lubricant",
        "viscosity": "ISO VG 32",
        "spec_api": None,
        "spec_sae": None,
        "pack_sizes": ["20L", "208L"],
        "prices": [("USD", "L", 3.40), ("AED", "L", 12.50)],
    },
    {
        "sku": "TURB-46",
        "name_ar": "زيت توربين ISO VG 46",
        "name_en": "Turbine Oil ISO VG 46",
        "category": "lubricant",
        "viscosity": "ISO VG 46",
        "spec_api": None,
        "spec_sae": None,
        "pack_sizes": ["20L", "208L"],
        "prices": [("USD", "L", 3.55), ("AED", "L", 13.00)],
    },
    {
        "sku": "DIESEL-15W40",
        "name_ar": "زيت محرك ديزل ثقيل 15W-40",
        "name_en": "Heavy Duty Diesel Engine Oil 15W-40",
        "category": "lubricant",
        "viscosity": "15W-40",
        "spec_api": "CI-4",
        "spec_sae": "15W-40",
        "pack_sizes": ["5L", "20L", "208L"],
        "prices": [("USD", "L", 4.10), ("SAR", "L", 15.40)],
    },
    {
        "sku": "HYD-68",
        "name_ar": "زيت هيدروليك HVI 68",
        "name_en": "HVI Hydraulic Oil 68",
        "category": "lubricant",
        "viscosity": "ISO VG 68",
        "spec_api": None,
        "spec_sae": None,
        "pack_sizes": ["20L", "208L"],
        "prices": [("USD", "L", 2.85), ("AED", "L", 10.40)],
    },
    {
        "sku": "GEAR-220",
        "name_ar": "زيت تروس صناعي ISO VG 220",
        "name_en": "Industrial Gear Oil ISO VG 220",
        "category": "lubricant",
        "viscosity": "ISO VG 220",
        "spec_api": None,
        "spec_sae": None,
        "pack_sizes": ["20L", "208L"],
        "prices": [("USD", "L", 3.90), ("USD", "drum", 780.00)],
    },
    {
        "sku": "COMP-100",
        "name_ar": "زيت ضاغط هوائي ISO VG 100",
        "name_en": "Air Compressor Oil ISO VG 100",
        "category": "lubricant",
        "viscosity": "ISO VG 100",
        "spec_api": None,
        "spec_sae": None,
        "pack_sizes": ["20L"],
        "prices": [("USD", "L", 4.60)],
    },
    {
        "sku": "FUEL-ULSD",
        "name_ar": "ديزل منخفض الكبريت Ultra Low Sulfur",
        "name_en": "Ultra Low Sulfur Diesel",
        "category": "fuel",
        "viscosity": None,
        "spec_api": None,
        "spec_sae": None,
        "pack_sizes": ["mt"],
        "prices": [("USD", "mt", 780.00)],
    },
]


async def seed_catalog(session: AsyncSession) -> int:
    n = 0
    for row in DEFAULT_PRODUCTS:
        session.add(
            Product(
                sku=row["sku"],
                name_ar=row["name_ar"],
                name_en=row["name_en"],
                category=row["category"],
                viscosity=row["viscosity"],
                spec_api=row["spec_api"],
                spec_sae=row["spec_sae"],
                pack_sizes=row["pack_sizes"],
            )
        )
        for currency, unit, price in row["prices"]:
            session.add(
                Price(
                    sku=row["sku"],
                    currency=currency,
                    unit=unit,
                    list_price=price,
                    valid_from=date(2026, 1, 1),
                )
            )
        n += 1
    return n
