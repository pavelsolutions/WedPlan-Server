# Database collections

The application uses the MongoDB Native Driver directly. `getCollections()` in
[`database.js`](../database.js) connects once, creates the collection indexes,
and returns reusable handles for `users`, `services`, `bookings`, and
`transactions`. Set `MONGODB_URI` and optionally `MONGODB_DB_NAME` in the
environment; the existing `DB_USER` and `DB_PASSWORD` Atlas connection remains
available as a fallback.

## Relationships

- `services.vendorId` references `users._id`.
- `bookings.serviceId` references `services._id`; `bookings.vendorId` and
  `bookings.customerId` reference `users._id`.
- `transactions.vendorId` references `users._id`.
- Store these references as BSON `ObjectId` values. User records are owned by
  Better Auth; configure its MongoDB model/collection mapping to use `users`
  and the same `_id` values used by application references.
- A service can have many bookings, and users can own many services, bookings,
  and transactions. The references stay in the dependent documents, so no
  separate vendor, customer, or subscription collections are needed.

## Indexes

Startup creates a unique index on `users.email`, service discovery/vendor
indexes, booking customer/vendor/service indexes, and transaction vendor and
Stripe lookup indexes. `stripeSessionId` is unique when it is a string.

## Example documents

The following examples show BSON types in shell-style notation. IDs are
illustrative; use matching values across the referenced documents.

### `users`

```javascript
{
  _id: ObjectId("665000000000000000000001"),
  name: "Avery Taylor",
  email: "avery@example.com",
  image: "https://example.com/avery.jpg",
  role: "vendor",
  isBlocked: false,
  businessName: "Avery Events",
  subscriptionPlan: "pro",
  subscriptionExpiresAt: ISODate("2027-01-01T00:00:00Z")
}
```

### `services`

```javascript
{
  _id: ObjectId("665000000000000000000002"),
  vendorId: ObjectId("665000000000000000000001"),
  serviceName: "Wedding photography",
  category: "Photography",
  description: "Full-day wedding photography package.",
  price: 1800,
  location: "Austin, TX",
  images: ["https://example.com/wedding.jpg"],
  status: "active",
  createdAt: ISODate("2026-06-01T12:00:00Z")
}
```

### `bookings`

```javascript
{
  _id: ObjectId("665000000000000000000003"),
  serviceId: ObjectId("665000000000000000000002"),
  vendorId: ObjectId("665000000000000000000001"),
  customerId: ObjectId("665000000000000000000004"),
  eventDate: ISODate("2027-05-15T00:00:00Z"),
  eventLocation: "Austin, TX",
  message: "Please share your availability.",
  status: "pending",
  createdAt: ISODate("2026-06-05T12:00:00Z")
}
```

### `transactions`

```javascript
{
  _id: ObjectId("665000000000000000000005"),
  vendorId: ObjectId("665000000000000000000001"),
  plan: "pro",
  amount: 2999,
  currency: "usd",
  stripeSessionId: "cs_example_123",
  stripeSubscriptionId: "sub_example_123",
  status: "paid",
  createdAt: ISODate("2026-06-01T12:00:00Z")
}
```
