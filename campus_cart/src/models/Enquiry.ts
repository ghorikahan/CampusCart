import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export type EnquiryStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN" | "EXPIRED";

export interface IEnquiryStatusHistory {
  status: EnquiryStatus;
  at: Date;
  note?: string;
}

export interface IEnquiry {
  _id: Types.ObjectId;
  listing: Types.ObjectId;
  buyer: Types.ObjectId;
  seller: Types.ObjectId; // Denormalized for rapid dashboard queries without lookup
  message: string;
  offerPrice?: number | null;
  status: EnquiryStatus;
  responseMessage?: string;
  respondedAt?: Date | null;
  statusHistory: IEnquiryStatusHistory[];
  createdAt: Date;
  updatedAt: Date;
}

export type EnquiryDocument = Document<Types.ObjectId, object, IEnquiry> & IEnquiry;

const EnquiryStatusHistorySchema = new Schema<IEnquiryStatusHistory>(
  {
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED", "WITHDRAWN", "EXPIRED"],
      required: true,
    },
    at: {
      type: Date,
      default: () => new Date(),
      required: true,
    },
    note: {
      type: String,
      trim: true,
      maxlength: [500, "Note cannot exceed 500 characters"],
    },
  },
  { _id: false }
);

const EnquirySchema = new Schema<IEnquiry>(
  {
    listing: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: [true, "Listing reference is required"],
      index: true,
    },
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Buyer reference is required"],
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Seller reference is required"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },
    offerPrice: {
      type: Number,
      default: null,
      min: [0, "Offer price cannot be negative"],
    },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED", "WITHDRAWN", "EXPIRED"],
      default: "PENDING",
      required: true,
    },
    responseMessage: {
      type: String,
      trim: true,
      maxlength: [1000, "Response message cannot exceed 1000 characters"],
    },
    respondedAt: {
      type: Date,
      default: null,
    },
    statusHistory: {
      type: [EnquiryStatusHistorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
// 1. Fast seller dashboard queries (filtered by status and ordered by newest)
EnquirySchema.index(
  { seller: 1, status: 1, createdAt: -1 },
  { name: "seller_status_created" }
);

// 2. Buyer enquiry list (ordered by newest)
EnquirySchema.index(
  { buyer: 1, createdAt: -1 },
  { name: "buyer_created" }
);

// 3. Partial unique index: ensures only one PENDING enquiry per buyer per listing at a time
EnquirySchema.index(
  { listing: 1, buyer: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "PENDING" },
    name: "unique_pending_enquiry_per_buyer_listing",
  }
);

export const Enquiry: Model<IEnquiry> =
  mongoose.models.Enquiry || mongoose.model<IEnquiry>("Enquiry", EnquirySchema);

export default Enquiry;

