"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, User as UserIcon, Shield, Phone, School, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateProfileSchema, type UpdateProfileInput } from "../schemas";
import { updateProfile } from "../actions";
import { type CurrentUser } from "@/server/auth";

interface ProfileFormProps {
  user: CurrentUser;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user.name || "",
      bio: user.bio || "",
      university: user.university || "",
      course: user.course || "",
      city: user.city || "",
      image: user.image || "",
      phone: user.phone || "",
      showPhone: Boolean(user.showPhone),
      contactPreference: user.contactPreference || "IN_APP",
    },
  });

  const watchedImageUrl = useWatch({ control, name: "image" });
  const watchedName = useWatch({ control, name: "name" });

  const onSubmit = async (values: UpdateProfileInput) => {
    setIsSubmitting(true);
    try {
      const res = await updateProfile(values);
      if (res.success) {
        toast.success(res.message || "Profile updated successfully!");
      } else {
        toast.error(res.error || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Profile submit error:", error);
      toast.error("An unexpected error occurred while saving profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 1. Basic Info & Avatar Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-primary" />
            <CardTitle>Personal Information</CardTitle>
          </div>
          <CardDescription>
            Update your public student name, avatar, and background story.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar
              src={watchedImageUrl || user.image}
              fallback={watchedName || user.name}
              size="xl"
              className="border-2 border-primary/20 shadow-sm"
            />
            <div className="space-y-1.5 flex-1 w-full">
              <Label htmlFor="image">Profile Picture URL</Label>
              <Input
                id="image"
                type="url"
                placeholder="https://example.com/avatar.jpg"
                disabled={isSubmitting}
                {...register("image")}
                className={errors.image ? "border-destructive" : ""}
              />
              <p className="text-xs text-muted-foreground">
                Enter a link to your photo (Cloudinary, Google, or Unsplash).
              </p>
              {errors.image && (
                <p className="text-xs text-destructive">{errors.image.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                disabled={isSubmitting}
                {...register("name")}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                value={user.email}
                disabled
                className="bg-muted/50 cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">
                Email address cannot be modified once registered.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bio">About You / Student Bio</Label>
            <textarea
              id="bio"
              rows={3}
              placeholder="e.g. Senior CS Major living in North Campus. Love tech, books, and coffee."
              disabled={isSubmitting}
              {...register("bio")}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
            {errors.bio && (
              <p className="text-xs text-destructive">{errors.bio.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 2. University & Campus Details Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <School className="h-5 w-5 text-primary" />
            <CardTitle>Academic & Campus Details</CardTitle>
          </div>
          <CardDescription>
            Helps students recognize fellow batchmates and coordinate on-campus handoffs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="university">University / College</Label>
              <Input
                id="university"
                placeholder="e.g. Delhi University / IIT Delhi"
                disabled={isSubmitting}
                {...register("university")}
                className={errors.university ? "border-destructive" : ""}
              />
              {errors.university && (
                <p className="text-xs text-destructive">{errors.university.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="course">Course / Degree Program</Label>
              <Input
                id="course"
                placeholder="e.g. B.Tech Computer Science"
                disabled={isSubmitting}
                {...register("course")}
                className={errors.course ? "border-destructive" : ""}
              />
              {errors.course && (
                <p className="text-xs text-destructive">{errors.course.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="city">City / Campus Location</Label>
            </div>
            <Input
              id="city"
              placeholder="e.g. New Delhi / Cambridge"
              disabled={isSubmitting}
              {...register("city")}
              className={errors.city ? "border-destructive" : ""}
            />
            {errors.city && (
              <p className="text-xs text-destructive">{errors.city.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 3. Communication & Privacy Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            <CardTitle>Contact Preferences & Privacy</CardTitle>
          </div>
          <CardDescription>
            Choose how buyers and sellers can connect with you regarding your listings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="contactPreference">Preferred Contact Method</Label>
              <select
                id="contactPreference"
                disabled={isSubmitting}
                {...register("contactPreference")}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="IN_APP">In-App Messages & Enquiries (Recommended)</option>
                <option value="EMAIL">Email Notifications</option>
                <option value="PHONE">Phone Call</option>
                <option value="WHATSAPP">WhatsApp Message</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone / WhatsApp Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 98765 43210"
                disabled={isSubmitting}
                {...register("phone")}
                className={errors.phone ? "border-destructive" : ""}
              />
              {errors.phone && (
                <p className="text-xs text-destructive">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-border p-4 bg-muted/20">
            <input
              type="checkbox"
              id="showPhone"
              disabled={isSubmitting}
              {...register("showPhone")}
              className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <div className="space-y-0.5">
              <Label htmlFor="showPhone" className="cursor-pointer font-medium text-foreground">
                Display phone number on my public listings
              </Label>
              <p className="text-xs text-muted-foreground">
                When unchecked, only logged-in students with accepted enquiries can request your contact info.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-3 text-xs text-primary">
            <Shield className="h-4 w-4 shrink-0" />
            <span>
              Your safety is paramount. All campus listings undergo automated spam screening.
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving Profile...
            </>
          ) : (
            "Save Profile Changes"
          )}
        </Button>
      </div>
    </form>
  );
}
