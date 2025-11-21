import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  STUDENT: "student",
  SOCIETY_HEAD: "society_head",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.STUDENT),
  v.literal(ROLES.SOCIETY_HEAD),
);
export type Role = Infer<typeof roleValidator>;

export const TIERS = {
  FREEMIUM: "freemium",
  PREMIUM: "premium",
  ELITE: "elite",
} as const;

export const tierValidator = v.union(
  v.literal(TIERS.FREEMIUM),
  v.literal(TIERS.PREMIUM),
  v.literal(TIERS.ELITE),
);

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
      tier: v.optional(tierValidator),
      points: v.optional(v.number()),
    }).index("email", ["email"]), // index for the email. do not remove or modify

    resources: defineTable({
      title: v.string(),
      description: v.optional(v.string()),
      type: v.string(), // pdf, note, etc
      subject: v.string(),
      semester: v.number(),
      fileId: v.id("_storage"),
      uploaderId: v.id("users"),
      downloads: v.number(),
    }).index("by_semester", ["semester"]).index("by_uploader", ["uploaderId"]),

    groups: defineTable({
      name: v.string(),
      description: v.optional(v.string()),
      type: v.union(v.literal("study"), v.literal("social")),
      isPrivate: v.boolean(),
      creatorId: v.id("users"),
    }),

    group_members: defineTable({
      groupId: v.id("groups"),
      userId: v.id("users"),
      role: v.union(v.literal("admin"), v.literal("member")),
    }).index("by_group", ["groupId"]).index("by_user", ["userId"]),

    messages: defineTable({
      groupId: v.id("groups"),
      userId: v.id("users"),
      content: v.string(),
      type: v.string(), // text, image
    }).index("by_group", ["groupId"]),

    events: defineTable({
      title: v.string(),
      description: v.string(),
      date: v.number(),
      location: v.string(),
      organizerId: v.id("users"),
      type: v.string(),
    }).index("by_date", ["date"]),

    feedback: defineTable({
      content: v.string(),
      userId: v.id("users"),
      isAnonymous: v.boolean(),
      status: v.string(), // pending, reviewed
    }).index("by_user", ["userId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;