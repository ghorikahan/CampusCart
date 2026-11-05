import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export type ContactPreference = "IN_APP" | "EMAIL" | "PHONE" | "WHATSAPP";
export type AuthProvider = "CREDENTIALS" | "GOOGLE";

export interface IGeoJSONPoint {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash?: string;
  image?: string;
  bio?: string;
  university?: string;
  course?: string;
  city?: string;
  location?: IGeoJSONPoint;
  contactPreference: ContactPreference;
  phone?: string;
  showPhone: boolean;
  authProvider: AuthProvider;
  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = Document<Types.ObjectId, object, IUser> & IUser;

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

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: false,
    },
    image: {
      type: String,
      required: false,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },
    university: {
      type: String,
      trim: true,
      maxlength: [150, "University cannot exceed 150 characters"],
    },
    course: {
      type: String,
      trim: true,
      maxlength: [150, "Course cannot exceed 150 characters"],
    },
    city: {
      type: String,
      trim: true,
      maxlength: [100, "City cannot exceed 100 characters"],
    },
    location: {
      type: GeoJSONPointSchema,
      required: false,
    },
    contactPreference: {
      type: String,
      enum: ["IN_APP", "EMAIL", "PHONE", "WHATSAPP"],
      default: "IN_APP",
      required: true,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, "Phone number cannot exceed 20 characters"],
    },
    showPhone: {
      type: Boolean,
      default: false,
      required: true,
    },
    authProvider: {
      type: String,
      enum: ["CREDENTIALS", "GOOGLE"],
      default: "CREDENTIALS",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// GeoJSON 2dsphere index for optional geospatial queries
UserSchema.index({ location: "2dsphere" }, { sparse: true });

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;

