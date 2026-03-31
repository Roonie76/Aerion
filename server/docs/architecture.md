# Aerion E-Commerce Backend Architecture

## 1. System Overview

Aerion uses a production-oriented **modular monolith**. The application is deployed as a single Node.js service, but the codebase is split into business modules with strict boundaries so the system can scale operationally and evolve into services later if needed.

```text
Client / Admin Panel
        |
     Express API
        |
  -------------------------
  | Auth | Catalog | Cart |
  | Order | Payment | Admin
  -------------------------
        |
    PostgreSQL
        |
  Outbox Events Table
        |
  Background Workers
        |
Email / CRM / Payment Gateway / Cache
```

### Components

- **API layer**: Express routes, request parsing, authentication, RBAC, validation, error handling.
- **Service layer**: Business workflows such as registration, cart mutation, order creation, payment reconciliation, and status transitions.
- **Repository layer**: PostgreSQL access, query encapsulation, transaction-safe reads/writes.
- **External integrations**:
  - Razorpay for payment order creation and webhook reconciliation
  - SMTP/Nodemailer for transactional email
  - Optional CRM webhook
  - Optional Redis cache for catalog reads
- **Event layer**: Outbox table plus worker polling for reliable async processing.

### Interaction Model

- User-facing actions remain synchronous until the state needed for the response is safely committed.
- Side effects such as email and CRM updates are emitted into the outbox inside the same DB transaction and processed asynchronously.
- Inventory is handled transactionally with row locks and reservation rows to prevent overselling.

## 2. Architectural Style

### Why Modular Monolith

- **Transactional safety**: order, payment, coupon, and inventory writes need strong consistency.
- **Operational simplicity**: one deployment unit, one API boundary, simpler debugging and local setup.
- **Scalability path**: hot modules such as payments, notifications, or catalog search can be extracted later without rewriting the domain model.

### Separation of Concerns

- **Controllers**: translate HTTP requests into service calls and shape responses.
- **Services**: enforce use cases, business rules, and transaction orchestration.
- **Repositories**: perform SQL queries and row mapping.
- **Middleware**: cross-cutting concerns such as auth, RBAC, validation, rate limiting, and error shaping.
- **Event handlers**: run async side effects from outbox events.

## 3. Folder Structure

```text
server/
  docs/
  sql/
  src/
    app/
    modules/
      auth/
      users/
      products/
      cart/
      orders/
      payments/
      inventory/
      admin/
    shared/
      cache/
      config/
      db/
      events/
      integrations/
      middleware/
      utils/
    scripts/
```

### Responsibilities

- `app/`: bootstrap, route registration, worker startup.
- `modules/*`: domain modules with controllers, services, repositories, routes, and validators.
- `shared/config`: env parsing, logger, DB, cache, payment client config.
- `shared/db`: PostgreSQL pool, transactions, migration helpers.
- `shared/events`: outbox repository, event publisher, worker.
- `shared/integrations`: email, CRM, and payment gateway wrappers.
- `shared/middleware`: auth, RBAC, validation, request logging, and centralized error handling.
- `shared/utils`: shared helpers for crypto, pagination, AppError, JWT, and state transitions.
- `sql/`: schema and seed SQL.

## 4. Data Flow

### User Register/Login

1. Request hits `auth` route.
2. Validator checks email, password, and name structure.
3. Service hashes password, inserts user, provisions cart, and stores refresh token session.
4. JWT access and refresh tokens are issued and returned via JSON plus secure cookies.
5. Response contains sanitized user profile and token metadata.

### Add To Cart

1. Auth middleware resolves the user from access token.
2. Validator checks product id and quantity.
3. Service loads product and inventory, enforces `is_active`, and updates `cart_items`.
4. Repository returns the refreshed cart with product snapshots for display.
5. Response returns cart totals and item list.

### Create Order

1. Authenticated user submits shipping data and optional coupon.
2. Service opens a PostgreSQL transaction.
3. Cart items and inventory rows are loaded with `FOR UPDATE`.
4. Coupon is validated.
5. Order and order items are written using immutable product snapshots.
6. Inventory is reserved, cart items are cleared, and `OrderCreated` is inserted into the outbox.
7. Transaction commits and response returns a `pending` order ready for payment.

### Payment Flow

1. Client requests a payment intent for a pending order.
2. Service validates ownership and order state, creates a Razorpay order, and stores a `payment_attempt`.
3. Razorpay completes checkout and later calls the webhook.
4. Webhook signature is verified against the raw body.
5. Service deduplicates the event, updates payment attempt state, marks the order as paid, consumes reservations, writes order history, and inserts `PaymentSuccess` into the outbox.
6. Response from webhook is minimal and fast after durable commit.

### Order Status Updates

1. Admin route receives a status transition request.
2. Validator enforces a valid target state.
3. Service checks the state machine and updates `orders` plus `order_status_history`.
4. If cancelled, inventory is restocked safely in the same transaction.
5. Event is emitted for async notifications.

## 5. Database Design

### PostgreSQL Over MongoDB

- Orders, inventory, coupons, and payments need ACID semantics.
- Row locking and transactional updates are first-class in PostgreSQL.
- Foreign keys, constraints, and indexing reduce invalid state.
- Analytical queries for admin dashboards are easier and cheaper in SQL.

### Key Relationships

- `users -> orders`
- `orders -> order_items`
- `products -> inventory`
- `orders -> payment_attempts`
- `orders -> inventory_reservations`

### Why Order Snapshot Is Required

Products, prices, descriptions, and tax logic change over time. `order_items` stores name, SKU, unit price, tax, and metadata at purchase time so invoices, refunds, audits, and customer history remain correct even if the catalog changes later.

## 6. Payment Architecture

- Provider: Razorpay
- `payment_attempts` tracks every initiation and reconciliation attempt.
- Webhook idempotency is enforced with a unique provider event id.
- Client request idempotency is enforced with an idempotency key stored alongside attempts.
- Missing Razorpay credentials trigger mock mode so local development can still run end to end.

## 7. Inventory And Concurrency

- Inventory rows are locked using `SELECT ... FOR UPDATE` during order creation.
- Reservations move units from `available_quantity` to `reserved_quantity`.
- Expired unpaid reservations are released by a background sweeper.
- Successful payment consumes reservations; cancellation releases or restocks inventory as appropriate.

## 8. Event-Driven Design

Outbox pattern:

1. Business transaction writes domain state and outbox rows together.
2. Worker claims pending outbox rows with `FOR UPDATE SKIP LOCKED`.
3. Handler processes side effects such as email or CRM sync.
4. Event row is marked processed or failed with retry metadata.

Primary events:

- `OrderCreated`
- `PaymentSuccess`
- `OrderCancelled`
- `OrderStatusUpdated`

## 9. Security

- Access token + refresh token JWT flow
- Refresh token rotation and hashing in DB
- Role claims for `user` and `admin`
- Validation at controller boundary
- Centralized error handler with sanitized responses
- Rate limiting and secure headers via middleware

## 10. Scalability

- Stateless API instances support horizontal scaling.
- PostgreSQL indexing supports high-cardinality lookups.
- Optional Redis is used for product caching.
- CDN should serve images and static media.
- Async workers offload slow integrations from the request path.
