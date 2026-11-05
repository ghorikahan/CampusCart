import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export interface IFavorite {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  listing: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type FavoriteDocument = Document<Types.ObjectId, object, IFavorite> & IFavorite;

const FavoriteSchema = new Schema<IFavorite>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    listing: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: [true, "Listing reference is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index: a user can only favorite a listing once
FavoriteSchema.index(
  { user: 1, listing: 1 },
  { unique: true, name: "user_listing_unique" }
);

// Fast lookups for listing favorite counts
FavoriteSchema.index({ listing: 1 }, { name: "listing_lookup" });

export const Favorite: Model<IFavorite> =
  mongoose.models.Favorite || mongoose.model<IFavorite>("Favorite", FavoriteSchema);

export default Favorite;

