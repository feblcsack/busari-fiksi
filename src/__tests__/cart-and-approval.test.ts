/**
 * Unit + Property-based tests for:
 * 1. Admin Approval Flow (product status)
 * 2. Cart Add logic (addToCart validation)
 *
 * Uses Vitest + fast-check (property-based testing).
 *
 * Run: npx vitest --run
 */

import { describe, it, expect } from "vitest"
import * as fc from "fast-check"
import {
  computeAddToCart,
  filterApprovedProducts,
  getInitialProductStatus,
  type ProductSnapshot,
} from "@/lib/cart-logic"
import type { CartItem } from "@/types"

// ── Arbitraries (generators) ───────────────────────────────────────────────

const statusArb = fc.constantFrom("queued", "pending", "approved", "rejected", null) as fc.Arbitrary<string | null>

const approvedStatusArb = fc.constant("approved") as fc.Arbitrary<string>

const nonApprovedStatusArb = fc.constantFrom("queued", "pending", "rejected", null) as fc.Arbitrary<string | null>

const productArb = (status: fc.Arbitrary<string | null> = statusArb): fc.Arbitrary<ProductSnapshot> =>
  fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 60 }),
    price: fc.integer({ min: 1000, max: 100_000_000 }),
    image_url: fc.option(fc.webUrl(), { nil: null }),
    status,
    stock: fc.option(fc.integer({ min: 0, max: 100 }), { nil: null }),
  })

const cartItemArb: fc.Arbitrary<CartItem> = fc.record({
  product_id: fc.uuid(),
  quantity: fc.integer({ min: 1, max: 99 }),
  price_at_addition: fc.integer({ min: 1000, max: 100_000_000 }),
  name: fc.string({ minLength: 1, maxLength: 60 }),
  image_url: fc.option(fc.webUrl(), { nil: null }),
})

const cartItemsArb = fc.array(cartItemArb, { maxLength: 20 })

// ── Section 1: Product Approval Status ────────────────────────────────────

describe("Product Approval Flow", () => {
  // Property 1: Every new product submitted by a seller MUST start as 'queued'
  it("Property 1 — getInitialProductStatus always returns 'queued'", () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const status = getInitialProductStatus()
        expect(status).toBe("queued")
      })
    )
  })

  // Sanity check for the above
  it("initial product status is queued", () => {
    expect(getInitialProductStatus()).toBe("queued")
  })

  // Property 2: filterApprovedProducts never returns non-approved products
  it("Property 2 — filterApprovedProducts only returns products with status='approved'", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            status: statusArb,
          }),
          { maxLength: 50 }
        ),
        (products) => {
          const result = filterApprovedProducts(products)
          for (const p of result) {
            expect(p.status).toBe("approved")
          }
        }
      )
    )
  })

  // Property 2b: filterApprovedProducts includes ALL approved products
  it("Property 2b — filterApprovedProducts does not drop any approved products", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            status: statusArb,
          }),
          { maxLength: 50 }
        ),
        (products) => {
          const approved = products.filter((p) => p.status === "approved")
          const result = filterApprovedProducts(products)
          expect(result.length).toBe(approved.length)
        }
      )
    )
  })

  it("non-approved products are excluded from shop results", () => {
    const products = [
      { id: "1", status: "approved" },
      { id: "2", status: "queued" },
      { id: "3", status: "pending" },
      { id: "4", status: "rejected" },
      { id: "5", status: null },
    ]
    const result = filterApprovedProducts(products)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe("1")
  })
})

// ── Section 2: Cart Logic ─────────────────────────────────────────────────

describe("Cart — addToCart", () => {
  // Property 3: addToCart must not exceed available stock
  it("Property 3 — addToCart never exceeds stock", () => {
    fc.assert(
      fc.property(
        productArb(approvedStatusArb),
        cartItemsArb,
        fc.integer({ min: 1, max: 50 }),
        (product, currentItems, extraQty) => {
          // Filter out items for the same product to control current qty
          const otherItems = currentItems.filter((i) => i.product_id !== product.id)

          if (product.stock === null) {
            // No stock limit — should always succeed
            const result = computeAddToCart(otherItems, product, extraQty)
            expect(result.success).toBe(true)
          } else {
            // With stock limit, if extraQty > stock, it should fail
            const existingQty = otherItems
              .filter((i) => i.product_id === product.id)
              .reduce((s, i) => s + i.quantity, 0)
            const willExceed = existingQty + extraQty > product.stock!

            const result = computeAddToCart(otherItems, product, extraQty)
            if (willExceed) {
              expect(result.success).toBe(false)
              // Verify items array is unchanged on failure
              expect(result.items).toEqual(otherItems)
            }
          }
        }
      )
    )
  })

  // Property: non-approved products can never be added to cart
  it("Property — non-approved products cannot be added to cart", () => {
    fc.assert(
      fc.property(
        productArb(nonApprovedStatusArb),
        cartItemsArb,
        fc.integer({ min: 1, max: 10 }),
        (product, currentItems, qty) => {
          const result = computeAddToCart(currentItems, product, qty)
          expect(result.success).toBe(false)
          // Cart items must be unchanged
          expect(result.items).toEqual(currentItems)
        }
      )
    )
  })

  // Property: approved product with null stock can always be added
  it("Property — approved product with no stock tracking can always be added", () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.uuid(),
          name: fc.string({ minLength: 1 }),
          price: fc.integer({ min: 1000 }),
          image_url: fc.constant(null),
          status: fc.constant("approved"),
          stock: fc.constant(null),
        }) as fc.Arbitrary<ProductSnapshot>,
        fc.integer({ min: 1, max: 50 }),
        (product, qty) => {
          const result = computeAddToCart([], product, qty)
          expect(result.success).toBe(true)
        }
      )
    )
  })

  // Example-based tests
  describe("Example-based", () => {
    const approvedProduct: ProductSnapshot = {
      id: "prod-1",
      name: "Batik Tulis",
      price: 250_000,
      image_url: null,
      status: "approved",
      stock: 5,
    }

    it("adds a new approved product to empty cart", () => {
      const result = computeAddToCart([], approvedProduct, 1)
      expect(result.success).toBe(true)
      expect(result.items).toHaveLength(1)
      expect(result.items[0].product_id).toBe("prod-1")
      expect(result.items[0].quantity).toBe(1)
      expect(result.items[0].price_at_addition).toBe(250_000)
    })

    it("increases quantity when same product is added again", () => {
      const existingCart: CartItem[] = [{
        product_id: "prod-1",
        quantity: 2,
        price_at_addition: 250_000,
        name: "Batik Tulis",
        image_url: null,
      }]
      const result = computeAddToCart(existingCart, approvedProduct, 1)
      expect(result.success).toBe(true)
      expect(result.items[0].quantity).toBe(3)
    })

    it("rejects adding when quantity would exceed stock", () => {
      const existingCart: CartItem[] = [{
        product_id: "prod-1",
        quantity: 4,
        price_at_addition: 250_000,
        name: "Batik Tulis",
        image_url: null,
      }]
      // 4 already in cart + 2 more = 6, but stock = 5
      const result = computeAddToCart(existingCart, approvedProduct, 2)
      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
      // Cart unchanged
      expect(result.items).toEqual(existingCart)
    })

    it("rejects adding a queued/pending product", () => {
      const pendingProduct: ProductSnapshot = { ...approvedProduct, status: "pending" }
      const result = computeAddToCart([], pendingProduct, 1)
      expect(result.success).toBe(false)
      expect(result.items).toHaveLength(0)
    })

    it("rejects adding a rejected product", () => {
      const rejectedProduct: ProductSnapshot = { ...approvedProduct, status: "rejected" }
      const result = computeAddToCart([], rejectedProduct, 1)
      expect(result.success).toBe(false)
    })

    it("allows adding exactly up to stock limit", () => {
      const result = computeAddToCart([], approvedProduct, 5) // stock = 5
      expect(result.success).toBe(true)
      expect(result.items[0].quantity).toBe(5)
    })

    it("rejects adding one more than stock", () => {
      const result = computeAddToCart([], approvedProduct, 6) // stock = 5
      expect(result.success).toBe(false)
    })

    it("does not mutate the original items array", () => {
      const original: CartItem[] = []
      computeAddToCart(original, approvedProduct, 1)
      expect(original).toHaveLength(0)
    })
  })
})
