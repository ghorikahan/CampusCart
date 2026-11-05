import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";
import { type IGeoJSONPoint } from "./User";

export type ListingCategory = "BOOKS" | "ELECTRONICS" | "FURNITURE" | "STATIONERY" | "OTHER";
export type ListingCondition = "NEW" | "LIKE_NEW" | "GOOD" | "FAIR" | "POOR";
export type ListingType = "FOR_SALE" | "FREE" | "EXCHANGE";
export type ListingStatus = "AVAILABLE" | "RESERVED" | "SOLD";

export interface IListingImage {
  url: string;
  publicId?: string;
  width?: number;
  height?: number;
}

export interface IListing {
  _id: Types.ObjectId;
  seller: Types.ObjectId;
  title: string;
  description: string;
  price: number | null; // null for FREE or EXCHANGE listings
  category: ListingCategory;
  condition: ListingCondition;
  listingType: ListingType;
  exchangeFor?: string;
  status: ListingStatus;
  isActive: boolean;
  locationText?: string;
  location?: IGeoJSONPoint;
  images: IListingImage[];
  viewCount: number;
  soldAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ListingDocument = Document<Types.ObjectId, object, IListing> & IListing;

const GeoJSONPointSchema = new Schema<IGeoJSONPoint>(
  {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
      required: true,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  { _id: false }
);

const ListingImageSchema = new Schema<IListingImage>(
  {
    url: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },
    publicId: {
      type: String,
      required: false,
      trim: true,
    },
    width: {
      type: Number,
      required: false,
    },
    height: {
      type: Number,
      required: false,
    },
  },
  { _id: false }
);

const ListingSchema = new Schema<IListing>(
  {
    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Seller is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [3000, "Description cannot exceed 3000 characters"],
    },
    price: {
      type: Number,
      default: null,
      min: [0, "Price cannot be negative"],
    },
    category: {
      type: String,
      enum: ["BOOKS", "ELECTRONICS", "FURNITURE", "STATIONERY", "OTHER"],
      required: [true, "Category is required"],
    },
    condition: {
      type: String,
      enum: ["NEW", "LIKE_NEW", "GOOD", "FAIR", "POOR"],
      required: [true, "Condition is required"],
    },
    listingType: {
      type: String,
      enum: ["FOR_SALE", "FREE", "EXCHANGE"],
      required: [true, "Listing type is required"],
      default: "FOR_SALE",
    },
    exchangeFor: {
      type: String,
      trim: true,
      maxlength: [200, "Exchange description cannot exceed 200 characters"],
    },
    status: {
      type: String,
      enum: ["AVAILABLE", "RESERVED", "SOLD"],
      default: "AVAILABLE",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
      index: true,
    },
    locationText: {
      type: String,
      trim: true,
      maxlength: [150, "Location text cannot exceed 150 characters"],
    },
    location: {
      type: GeoJSONPointSchema,
      required: false,
    },
    images: {
      type: [ListingImageSchema],
      default: [],
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    soldAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
// 1. Full-text search with weights: title (weight 10), description (weight 3)
ListingSchema.index(
  { title: "text", description: "text" },
  {
    weights: { title: 10, description: 3 },
    name: "title_description_text",
  }
);

// 2. Compound discovery index: category filtering and newest first
ListingSchema.index(
  { isActive: 1, status: 1, category: 1, createdAt: -1 },
  { name: "active_status_category_created" }
);

// 3. Compound discovery index: price range filtering
ListingSchema.index(
  { isActive: 1, status: 1, price: 1 },
  { name: "active_status_price" }
);

// 4. Compound seller management index
ListingSchema.index(
  { seller: 1, status: 1 },
  { name: "seller_status" }
);

// 5. Geospatial 2dsphere index for radius / proximity searches
ListingSchema.index(
  { location: "2dsphere" },
  { name: "location_2dsphere", sparse: true }
);

export const Listing: Model<IListing> =
  mongoose.models.Listing || mongoose.model<IListing>("Listing", ListingSchema);

export default Listing;

