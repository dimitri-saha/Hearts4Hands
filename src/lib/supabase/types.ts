/**
 * Hand-maintained mirror of `supabase/migrations/0001_init.sql`.
 *
 * If you change the schema, regenerate with:
 *   npx supabase gen types typescript --project-id <id> > src/lib/supabase/database.types.ts
 * and re-point these aliases at the generated types.
 */

export type SubmissionStatus = "pending" | "approved" | "rejected";
export type PostStatus = "draft" | "published";

export type VolunteerSignup = {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  age_group: string | null;
  country: string;
  state: string | null;
  city: string | null;
  school: string | null;
  activities: string[];
  hours: number;
  cards_made: number;
  activity_date: string | null;
  notes: string | null;
  proof_path: string | null;
  status: SubmissionStatus;
  reviewer_note: string | null;
  reviewed_at: string | null;
}

export type BlogSubmission = {
  id: string;
  created_at: string;
  title: string;
  category: string;
  author_name: string;
  author_email: string;
  author_location: string | null;
  body: string;
  status: SubmissionStatus;
  reviewer_note: string | null;
  reviewed_at: string | null;
  published_post_id: string | null;
}

export type Post = {
  id: string;
  created_at: string;
  updated_at: string;
  slug: string;
  title: string;
  category: string;
  author_name: string;
  author_location: string | null;
  excerpt: string | null;
  body: string;
  status: PostStatus;
  featured: boolean;
  published_at: string | null;
  submission_id: string | null;
}

export type ContactMessage = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  topic: string;
  subject: string | null;
  message: string;
  handled: boolean;
  /** Set by a database trigger when `handled` flips. Drives the 7-day purge. */
  handled_at: string | null;
}

export type SiteStats = {
  id: number;
  total_raised_cents: number;
  materials_cents: number;
  research_cents: number;
  goal_cents: number;
  cards_made: number;
  volunteers: number;
  hours_logged: number;
  hospitals_served: number;
  note: string | null;
  updated_at: string;
}

export type Admin = {
  user_id: string;
  email: string | null;
  created_at: string;
}

/** Matches the shape `supabase gen types typescript` emits. */
export type Database = {
  public: {
    Tables: {
      volunteer_signups: {
        Row: VolunteerSignup;
        Insert: Omit<
          VolunteerSignup,
          "id" | "created_at" | "status" | "reviewer_note" | "reviewed_at"
        > &
          Partial<Pick<VolunteerSignup, "id" | "status" | "reviewer_note" | "reviewed_at">>;
        Update: Partial<VolunteerSignup>;
        Relationships: [];
      };
      blog_submissions: {
        Row: BlogSubmission;
        Insert: Omit<
          BlogSubmission,
          | "id"
          | "created_at"
          | "status"
          | "reviewer_note"
          | "reviewed_at"
          | "published_post_id"
        > &
          Partial<
            Pick<
              BlogSubmission,
              "id" | "status" | "reviewer_note" | "reviewed_at" | "published_post_id"
            >
          >;
        Update: Partial<BlogSubmission>;
        Relationships: [];
      };
      posts: {
        Row: Post;
        Insert: Omit<Post, "id" | "created_at" | "updated_at"> &
          Partial<Pick<Post, "id" | "created_at" | "updated_at">>;
        Update: Partial<Post>;
        Relationships: [];
      };
      contact_messages: {
        Row: ContactMessage;
        // `handled_at` is maintained by a database trigger, never written here.
        Insert: Omit<ContactMessage, "id" | "created_at" | "handled" | "handled_at"> &
          Partial<Pick<ContactMessage, "id" | "created_at" | "handled" | "handled_at">>;
        Update: Partial<ContactMessage>;
        Relationships: [];
      };
      site_stats: {
        Row: SiteStats;
        Insert: Partial<SiteStats> & { id: number };
        Update: Partial<SiteStats>;
        Relationships: [];
      };
      admins: {
        Row: Admin;
        Insert: Admin;
        Update: Partial<Admin>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: {
      submission_status: SubmissionStatus;
      post_status: PostStatus;
    };
    CompositeTypes: { [_ in never]: never };
  };
};

/** Storage bucket that holds volunteer proof-of-cards uploads (private). */
export const PROOF_BUCKET = "volunteer-proof";
