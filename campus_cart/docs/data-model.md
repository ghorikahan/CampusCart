# CampusCart Data Model Architecture

This document describes the data architecture for CampusCart, detailing the trade-offs between embedded subdocuments and referenced relationships in MongoDB, denormalization strategies, and indexing design.

---

## 1. Domain Model Overview

CampusCart consists of five primary collections:
1. **`users`**: Profiles, authentication credentials, location, and communication preferences.
2. **`listings`**: Marketplace items for sale, exchange, or donation with categorization and media.
3. **`enquiries`**: Structured purchase enquiries and offer negotiations between buyers and sellers.
4. **`favorites`**: Saved listings (wishlist) per student.
5. **`notifications`**: User alerts for enquiries, listing updates, price drops, and system messages.

---

## 2. Embedded Fields vs. Referenced Fields

MongoDB's document model allows flexible structuring. In CampusCart, we strictly apply the following design pattern:

### A. Embedded Fields (Sub-documents)

| Field | Parent Model | Structure | Rationale |
| :--- | :--- | :--- | :--- |
| **`images`** | `Listing` | Array of `{ url, publicId, width, height }` | **Bounded 1:N & Co-retrieval**: A listing has at most 5–8 images. Images are *always* displayed together with the listing and never queried independently. Embedding prevents unnecessary joins or secondary queries. |
| **`location`** | `Listing` & `User` | GeoJSON `{ type: "Point", coordinates: [lng, lat] }` | **Geospatial Standard**: Follows official GeoJSON format required for MongoDB `2dsphere` spatial indexing and `$near` / `$geoWithin` proximity search. |
| **`statusHistory`** | `Enquiry` | Array of `{ status, at, note }` | **Bounded Audit Trail**: Status changes (Pending $\to$ Accepted/Rejected/Withdrawn) occur only a handful of times per enquiry. Kept within the document for atomic updates and instant lifecycle review. |

### B. Referenced Fields (Normalized Relationships)

| Field | Parent Model | Refers To | Rationale |
| :--- | :--- | :--- | :--- |
| **`seller`** | `Listing` | `User` | **Independent Lifecycle**: Users have their own auth lifecycle, profile updates, and listing histories. Embedding user data inside listings would result in stale data when users update their profile. |
| **`listing` & `buyer`** | `Enquiry` | `Listing`, `User` | **Multi-Entity Workflow**: Enquiries connect distinct actors. Listings and users exist independently of any individual enquiry. |
| **`user` & `listing`** | `Favorite` | `User`, `Listing` | **Decoupled Many-to-Many**: Favorites change frequently. Embedding favorites inside `User` would bloat user documents and risk concurrency conflicts; embedding inside `Listing` would complicate querying "my saved items". |
| **`user`** | `Notification` | `User` | **Unbounded Growth**: Notifications accumulate over time. Storing them in a separate collection prevents the MongoDB 16MB document size limit and enables efficient pagination and indexing. |

---

## 3. Deliberate Denormalization: `Enquiry.seller`

In `Enquiry`, both `buyer` and `seller` are stored as references:
```typescript
{
  listing: ObjectId, // ref: Listing
  buyer: ObjectId,   // ref: User
  seller: ObjectId,  // ref: User (Denormalized)
}
```

### Why store `seller` on `Enquiry` when `listing.seller` already exists?
- **Dashboard Query Performance**: The seller dashboard query (`"Show all enquiries received for my items"`) executes millions of times.
- Without denormalization, fetching seller enquiries requires an expensive `$lookup` join to the `listings` collection to filter by `listing.seller == currentUser`.
- With denormalization, the query is resolved directly in the `enquiries` collection using a single fast index:
  `{ seller: 1, status: 1, createdAt: -1 }`.

---

## 4. Indexing Strategy

### 1. Weighted Full-Text Search Index (`Listing`)
```typescript
{ title: "text", description: "text" }, { weights: { title: 10, description: 3 } }
```
- Gives 3.3x higher relevance score to title matches over description matches.

### 2. Compound Equality-Sort-Range Indexes (`Listing`)
- `{ isActive: 1, status: 1, category: 1, createdAt: -1 }`: Optimizes the primary marketplace browse page (active available items in a category sorted by newest).
- `{ isActive: 1, status: 1, price: 1 }`: Optimizes price filter and price sort queries.
- `{ seller: 1, status: 1 }`: Optimizes "My Listings" management screen.

### 3. Partial Unique Index (`Enquiry`)
```typescript
{ listing: 1, buyer: 1 }, { unique: true, partialFilterExpression: { status: "PENDING" } }
```
- **Business Rule Enforcement at the Database Layer**: Prevents a buyer from spamming multiple active pending enquiries on the same item. Once an enquiry is accepted, rejected, or withdrawn, the buyer is free to submit a new one if necessary.

### 4. Compound Unique Index (`Favorite`)
```typescript
{ user: 1, listing: 1 }, { unique: true }
```
- Guarantees idempotent saves: a user cannot save the same listing more than once.

### 5. Geospatial Index (`Listing` & `User`)
```typescript
{ location: "2dsphere" }
```
- Enables student proximity queries (e.g., finding books or furniture within 2 km of campus).

---

## 5. Cascading Deletion & Enquiry Lifecycle on Listing Removal

When a seller deletes a listing via `deleteListing(id)`:

1. **Cloudinary Asset Purge**:
   - All embedded image `publicId`s belonging to the listing are unlinked and destroyed from Cloudinary (`cloudinary.uploader.destroy`).
2. **Favorites Purge**:
   - Related bookmarks in the `favorites` collection are permanently hard-deleted (`Favorite.deleteMany({ listing: id })`).
3. **Enquiries (Soft Expiration)**:
   - Enquiries are **not** hard-deleted from the database.
   - Any active `PENDING` enquiries on the listing are transitioned to status `EXPIRED`, and an entry is appended to `statusHistory`:
     `{ status: "EXPIRED", at: new Date(), note: "Listing was deleted by the seller." }`.
   - **Architecture Rationale**: Hard-deleting enquiries would erase negotiation and communication history for prospective buyers. Preserving expired records with an explanatory audit trail gives buyers transparency in their "My Enquiries" dashboard without keeping active pending locks on deleted inventory.


