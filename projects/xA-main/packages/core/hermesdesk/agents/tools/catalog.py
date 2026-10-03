from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from hermesdesk.db import repos


def _product_dict(p) -> dict:
    return {
        "sku": p.sku,
        "name_ar": p.name_ar,
        "name_en": p.name_en,
        "category": p.category,
        "viscosity": p.viscosity,
        "spec_api": p.spec_api,
        "spec_sae": p.spec_sae,
        "pack_sizes": p.pack_sizes,
    }


async def tool_search_products(session: AsyncSession, query: str) -> list[dict]:
    rows = await repos.search_products(session, query)
    return [_product_dict(p) for p in rows]


async def tool_get_product(session: AsyncSession, sku: str) -> dict | None:
    p = await repos.get_product(session, sku)
    return _product_dict(p) if p else None


async def tool_get_price_list(session: AsyncSession, sku: str) -> list[dict]:
    prices = await repos.get_prices(session, sku)
    return [
        {
            "sku": pr.sku,
            "currency": pr.currency,
            "unit": pr.unit,
            "list_price": float(pr.list_price),
        }
        for pr in prices
    ]
