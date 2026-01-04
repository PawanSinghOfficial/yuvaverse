/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activities from "../activities.js";
import type * as ai_notebook from "../ai_notebook.js";
import type * as ai_notebook_actions from "../ai_notebook_actions.js";
import type * as auth from "../auth.js";
import type * as auth_emailOtp from "../auth/emailOtp.js";
import type * as events from "../events.js";
import type * as feedback from "../feedback.js";
import type * as flashcards from "../flashcards.js";
import type * as friends from "../friends.js";
import type * as groups from "../groups.js";
import type * as http from "../http.js";
import type * as presence from "../presence.js";
import type * as quests from "../quests.js";
import type * as resources from "../resources.js";
import type * as seed_syllabus from "../seed_syllabus.js";
import type * as syllabus from "../syllabus.js";
import type * as test_ai from "../test_ai.js";
import type * as todos from "../todos.js";
import type * as users from "../users.js";
import type * as vayuu from "../vayuu.js";
import type * as vayuu_actions from "../vayuu_actions.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activities: typeof activities;
  ai_notebook: typeof ai_notebook;
  ai_notebook_actions: typeof ai_notebook_actions;
  auth: typeof auth;
  "auth/emailOtp": typeof auth_emailOtp;
  events: typeof events;
  feedback: typeof feedback;
  flashcards: typeof flashcards;
  friends: typeof friends;
  groups: typeof groups;
  http: typeof http;
  presence: typeof presence;
  quests: typeof quests;
  resources: typeof resources;
  seed_syllabus: typeof seed_syllabus;
  syllabus: typeof syllabus;
  test_ai: typeof test_ai;
  todos: typeof todos;
  users: typeof users;
  vayuu: typeof vayuu;
  vayuu_actions: typeof vayuu_actions;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
