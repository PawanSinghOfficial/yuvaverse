import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Helper to generate a random 4-digit code
function generateCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export const ensureFriendCode = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    if (user.friendCode) return user.friendCode;

    // Generate a unique code
    let code = generateCode();
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      const existing = await ctx.db
        .query("users")
        .withIndex("by_friend_code", (q) => q.eq("friendCode", code))
        .first();
      
      if (!existing) {
        isUnique = true;
      } else {
        code = generateCode();
        attempts++;
      }
    }

    if (!isUnique) {
      throw new Error("Failed to generate a unique friend code. Please try again.");
    }

    await ctx.db.patch(userId, { friendCode: code });
    return code;
  },
});

export const sendFriendRequest = mutation({
  args: { friendCode: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    // Find target user
    const targetUser = await ctx.db
      .query("users")
      .withIndex("by_friend_code", (q) => q.eq("friendCode", args.friendCode))
      .first();

    if (!targetUser) {
      throw new Error("User not found with this code");
    }

    if (targetUser._id === userId) {
      throw new Error("You cannot add yourself as a friend");
    }

    // Check if already friends
    const existingFriendship = await ctx.db
      .query("friends")
      .withIndex("by_user_friend", (q) => q.eq("userId", userId).eq("friendId", targetUser._id))
      .first();

    if (existingFriendship) {
      throw new Error("You are already friends with this user");
    }

    // Check if request already exists
    const existingRequest = await ctx.db
      .query("friend_requests")
      .withIndex("by_sender_receiver", (q) => q.eq("senderId", userId).eq("receiverId", targetUser._id))
      .first();

    if (existingRequest) {
      if (existingRequest.status === "pending") {
        throw new Error("Friend request already sent");
      } else if (existingRequest.status === "accepted") {
        throw new Error("You are already friends");
      }
      // If rejected, we might allow resending, but for now let's just say request sent
    }

    // Check if they sent us a request
    const reverseRequest = await ctx.db
      .query("friend_requests")
      .withIndex("by_sender_receiver", (q) => q.eq("senderId", targetUser._id).eq("receiverId", userId))
      .first();

    if (reverseRequest && reverseRequest.status === "pending") {
      // Auto-accept if they already requested
      await ctx.db.patch(reverseRequest._id, { status: "accepted" });
      await ctx.db.insert("friends", { userId: userId, friendId: targetUser._id });
      await ctx.db.insert("friends", { userId: targetUser._id, friendId: userId });
      return { status: "connected", message: "You are now friends!" };
    }

    await ctx.db.insert("friend_requests", {
      senderId: userId,
      receiverId: targetUser._id,
      status: "pending",
    });

    return { status: "sent", message: "Friend request sent!" };
  },
});

export const respondToRequest = mutation({
  args: { requestId: v.id("friend_requests"), accept: v.boolean() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Request not found");

    if (request.receiverId !== userId) {
      throw new Error("Unauthorized to respond to this request");
    }

    if (request.status !== "pending") {
      throw new Error("Request already handled");
    }

    if (args.accept) {
      await ctx.db.patch(request._id, { status: "accepted" });
      // Create bidirectional friendship
      await ctx.db.insert("friends", { userId: userId, friendId: request.senderId });
      await ctx.db.insert("friends", { userId: request.senderId, friendId: userId });
    } else {
      await ctx.db.patch(request._id, { status: "rejected" });
    }
  },
});

export const removeFriend = mutation({
  args: { friendId: v.id("users") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    // Find friendship records (bidirectional)
    const friendship1 = await ctx.db
      .query("friends")
      .withIndex("by_user_friend", (q) => q.eq("userId", userId).eq("friendId", args.friendId))
      .first();

    const friendship2 = await ctx.db
      .query("friends")
      .withIndex("by_user_friend", (q) => q.eq("userId", args.friendId).eq("friendId", userId))
      .first();

    if (friendship1) await ctx.db.delete(friendship1._id);
    if (friendship2) await ctx.db.delete(friendship2._id);

    // Clean up any existing requests between these two users to allow re-adding
    const request1 = await ctx.db.query("friend_requests")
        .withIndex("by_sender_receiver", q => q.eq("senderId", userId).eq("receiverId", args.friendId))
        .first();
        
    const request2 = await ctx.db.query("friend_requests")
        .withIndex("by_sender_receiver", q => q.eq("senderId", args.friendId).eq("receiverId", userId))
        .first();
        
    if (request1) await ctx.db.delete(request1._id);
    if (request2) await ctx.db.delete(request2._id);
  }
});

export const cancelRequest = mutation({
  args: { requestId: v.id("friend_requests") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    
    const req = await ctx.db.get(args.requestId);
    if (!req) throw new Error("Request not found");
    
    if (req.senderId !== userId) throw new Error("Unauthorized");
    if (req.status !== "pending") throw new Error("Cannot cancel non-pending request");
    
    await ctx.db.delete(req._id);
  }
});

export const getFriends = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const friendships = await ctx.db
      .query("friends")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const friends = await Promise.all(
      friendships.map(async (f) => {
        const friend = await ctx.db.get(f.friendId);
        return friend ? {
          _id: friend._id,
          name: friend.name,
          username: friend.username,
          image: friend.image,
          points: friend.points,
          role: friend.role,
          tier: friend.tier,
          streakCount: friend.streakCount,
          totalGamesWon: friend.totalGamesWon,
          snakeHighScore: friend.snakeHighScore,
          mathHighScore: friend.mathHighScore,
        } : null;
      })
    );

    return friends.filter((f) => f !== null);
  },
});

export const getIncomingRequests = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const requests = await ctx.db
      .query("friend_requests")
      .withIndex("by_receiver_status", (q) => q.eq("receiverId", userId).eq("status", "pending"))
      .collect();

    const requestDetails = await Promise.all(
      requests.map(async (r) => {
        const sender = await ctx.db.get(r.senderId);
        return sender ? {
          _id: r._id,
          sender: {
            _id: sender._id,
            name: sender.name,
            username: sender.username,
            image: sender.image,
          },
          sentAt: r._creationTime,
        } : null;
      })
    );

    return requestDetails.filter((r) => r !== null);
  },
});

export const getSentRequests = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const requests = await ctx.db
      .query("friend_requests")
      .withIndex("by_sender_receiver", (q) => q.eq("senderId", userId))
      .collect();
      
    const pendingRequests = requests.filter(r => r.status === "pending");

    const requestDetails = await Promise.all(
      pendingRequests.map(async (r) => {
        const receiver = await ctx.db.get(r.receiverId);
        return receiver ? {
          _id: r._id,
          receiver: {
            _id: receiver._id,
            name: receiver.name,
            username: receiver.username,
            image: receiver.image,
          },
          sentAt: r._creationTime,
        } : null;
      })
    );

    return requestDetails.filter((r) => r !== null);
  },
});