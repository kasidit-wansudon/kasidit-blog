---
title: "Database Schema Design for IMEI Tracking That Follows Every Device"
date: "2026-06-24"
excerpt: "How to design a database schema for IMEI tracking that links purchase orders, sales orders, and stock movements, with SQL, index, and uniqueness examples."
tags: ["database", "sql", "schema-design", "inventory", "laravel"]
---

A phone sales system differs from a general inventory system in one way: we do not just count "quantity", we need to know "which device" is where. So the database schema for IMEI tracking is the kind of work where a wrong start becomes technical debt you can never fully pay off. I am currently leading the migration of the Sell-in/WMS system from Zend 1.12 to Laravel, which includes sales orders, purchase orders, and IMEI tracking, so I want to summarize the thinking I use to design this part of the schema.

The examples in this post use a generic schema, not the company's internal code, but the principles are the same.

## The questions IMEI tracking must answer

Before writing `CREATE TABLE`, I always write down the questions the system must be able to answer.

- Which purchase order did this IMEI come in on, and on what date?
- Which warehouse is it in now, or which sales order was it sold on?
- How many times has this device been returned, moved between warehouses, or changed status?
- How many devices of model X in warehouse A are ready to sell?

The first three questions are about "history", while the last is about "current state". If we try to answer both from a single table, queries become slow and complicated, so I split it into two clear layers.

## Core structure: current state plus movement history

The idea is a `devices` table holding the latest state of each device (one row per IMEI) and a `device_movements` table as an append-only log that records every change.

```sql
CREATE TABLE devices (
    id              BIGSERIAL PRIMARY KEY,
    imei            VARCHAR(15) NOT NULL,
    product_id      BIGINT NOT NULL REFERENCES products(id),
    warehouse_id    BIGINT REFERENCES warehouses(id),
    status          VARCHAR(20) NOT NULL DEFAULT 'in_stock',
    purchase_order_line_id BIGINT REFERENCES purchase_order_lines(id),
    sales_order_line_id    BIGINT REFERENCES sales_order_lines(id),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT devices_imei_unique UNIQUE (imei),
    CONSTRAINT devices_status_check CHECK (
        status IN ('in_stock', 'reserved', 'sold', 'returned', 'in_transit', 'scrapped')
    )
);

CREATE TABLE device_movements (
    id              BIGSERIAL PRIMARY KEY,
    device_id       BIGINT NOT NULL REFERENCES devices(id),
    movement_type   VARCHAR(20) NOT NULL,
    from_warehouse_id BIGINT REFERENCES warehouses(id),
    to_warehouse_id   BIGINT REFERENCES warehouses(id),
    reference_type  VARCHAR(30) NOT NULL,
    reference_id    BIGINT NOT NULL,
    created_by      BIGINT REFERENCES users(id),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_devices_wh_product_status
    ON devices (warehouse_id, product_id, status);

CREATE INDEX idx_movements_device_time
    ON device_movements (device_id, created_at);

CREATE INDEX idx_movements_reference
    ON device_movements (reference_type, reference_id);
```

`devices` answers "where is it now" immediately with a single index, while `device_movements` answers "where has it been" without touching the table that is read most often.

## Uniqueness: what people often overlook

An IMEI should be globally unique, but in the real world the data entering the system is not always clean. There are typos, duplicate scans, and uploaded files with repeated rows. So I set these rules.

1. **Always put `UNIQUE` at the database level.** Do not rely on validation in code alone, because two simultaneous requests can both pass validation.
2. **Normalize before insert.** Strip spaces and dashes, and check that it is a 15-digit number. If you want to be stricter, check the Luhn checksum too.
3. **A device that is returned and resold does not get a new row.** Change its `status` and record a movement instead. If you create a new row, the constraint breaks and the history is cut off.

For dual-SIM devices with two IMEIs, I recommend a separate `device_identifiers` table with the unique constraint on that table, and `devices` keeps just one primary IMEI. This is easier to query than putting two columns in and having to check uniqueness across columns.

## Linking to purchase orders and sales orders

The decision point is whether to tie the IMEI to the "order" or the "order line". I chose the order line, because one order has many models and we need to check whether the number of scanned IMEIs matches the quantity on that line.

```sql
-- Find sales order lines where the IMEI scan is not yet complete
SELECT sol.id, sol.quantity, COUNT(d.id) AS scanned
FROM sales_order_lines sol
LEFT JOIN devices d ON d.sales_order_line_id = sol.id
WHERE sol.sales_order_id = :order_id
GROUP BY sol.id, sol.quantity
HAVING COUNT(d.id) <> sol.quantity;
```

A query like this is the last gate before confirming shipment, and it is very good at catching over-shipping or under-shipping.

## Write state and history in one transaction

The most important rule of a two-layer schema is that every time you change `devices`, you must write `device_movements` in the same transaction. If they are separate, one day the two tables will definitely disagree.

In Laravel I put this logic in a single service class, such as `DeviceMovementService::move()`, and forbid other code from updating `devices.status` directly. This way every status change goes through one point, which is easy to audit, and I can put `SELECT ... FOR UPDATE` in that one place to prevent race conditions when two people scan the same device at the same time.

## Indexes that get used

Do not put an index on every column. Look at the queries that actually run often. In this kind of system there are usually just three kinds.

- **Search by IMEI** comes free from the unique constraint
- **Count stock by warehouse, model, and status** uses the composite index `(warehouse_id, product_id, status)`, ordered by selectivity and the order used in `WHERE`
- **View a device's history** uses `(device_id, created_at)`

If the movements table grows very large, consider partitioning by month, but you do not need to do it from day one.

## Checklist before production

- `UNIQUE` on IMEI at the database level
- A `CHECK` constraint or enum for status
- Every kind of status change goes through one service and inside a transaction
- A query that checks IMEI completeness per order line
- Test the return-and-resell case
- Test scanning from two sessions at the same time

If you are migrating an old system gradually, I wrote about the approach in [Zend 1 to Laravel with the strangler pattern](/en/blog/zend-1-to-laravel-strangler-migration), which fits well with splitting the schema this way.

## Summary

A good schema for IMEI tracking separates "current state" from "history", puts uniqueness at the database level, ties the IMEI to the order line, and forces every change through a single transaction. Get these four right from the start and the system will answer "where is this device" quickly and reliably for a long time.
