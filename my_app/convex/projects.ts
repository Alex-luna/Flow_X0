import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Query to get all projects
export const getAllProjects = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("projects"),
    _creationTime: v.number(),
    name: v.string(),
    description: v.optional(v.string()),
    folder: v.string(),
    status: v.union(v.literal("active"), v.literal("archived"), v.literal("draft")),
    createdBy: v.optional(v.string()),
    lastModified: v.number(),
    settings: v.optional(v.object({
      snapToGrid: v.boolean(),
      showMiniMap: v.boolean(),
      canvasBackground: v.string(),
      theme: v.union(v.literal("light"), v.literal("dark")),
    })),
  })),
  handler: async (ctx) => {
    const projects = await ctx.db
      .query("projects")
      .order("desc")
      .collect();
    return projects;
  },
});

// Query to get projects by folder
export const getProjectsByFolder = query({
  args: { folder: v.string() },
  returns: v.array(v.object({
    _id: v.id("projects"),
    _creationTime: v.number(),
    name: v.string(),
    description: v.optional(v.string()),
    folder: v.string(),
    status: v.union(v.literal("active"), v.literal("archived"), v.literal("draft")),
    createdBy: v.optional(v.string()),
    lastModified: v.number(),
    settings: v.optional(v.object({
      snapToGrid: v.boolean(),
      showMiniMap: v.boolean(),
      canvasBackground: v.string(),
      theme: v.union(v.literal("light"), v.literal("dark")),
    })),
  })),
  handler: async (ctx, args) => {
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_folder", (q) => q.eq("folder", args.folder))
      .order("desc")
      .collect();
    return projects;
  },
});

// Query to get a single project by ID
export const getProject = query({
  args: { projectId: v.id("projects") },
  returns: v.union(
    v.object({
      _id: v.id("projects"),
      _creationTime: v.number(),
      name: v.string(),
      description: v.optional(v.string()),
      folder: v.string(),
      status: v.union(v.literal("active"), v.literal("archived"), v.literal("draft")),
      createdBy: v.optional(v.string()),
      lastModified: v.number(),
      settings: v.optional(v.object({
        snapToGrid: v.boolean(),
        showMiniMap: v.boolean(),
        canvasBackground: v.string(),
        theme: v.union(v.literal("light"), v.literal("dark")),
      })),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    return project;
  },
});

// Mutation to create a new project
export const createProject = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    folder: v.string(),
    status: v.optional(v.union(v.literal("active"), v.literal("archived"), v.literal("draft"))),
    settings: v.optional(v.object({
      snapToGrid: v.boolean(),
      showMiniMap: v.boolean(),
      canvasBackground: v.string(),
      theme: v.union(v.literal("light"), v.literal("dark")),
    })),
  },
  returns: v.id("projects"),
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const projectId = await ctx.db.insert("projects", {
      name: args.name,
      description: args.description,
      folder: args.folder,
      status: args.status || "active",
      lastModified: now,
      settings: args.settings || {
        snapToGrid: true,
        showMiniMap: true,
        canvasBackground: "#ffffff",
        theme: "light",
      },
    });

    // Create default flow for the project
    await ctx.db.insert("flows", {
      projectId,
      name: "Main Flow",
      description: "Default flow for the project",
      version: 1,
      isActive: true,
      viewport: {
        x: 0,
        y: 0,
        zoom: 1,
      },
      lastModified: now,
    });

    return projectId;
  },
});

// Mutation to update project
export const updateProject = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    folder: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("archived"), v.literal("draft"))),
    settings: v.optional(v.object({
      snapToGrid: v.boolean(),
      showMiniMap: v.boolean(),
      canvasBackground: v.string(),
      theme: v.union(v.literal("light"), v.literal("dark")),
    })),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { projectId, ...updates } = args;
    
    await ctx.db.patch(projectId, {
      ...updates,
      lastModified: Date.now(),
    });

    return null;
  },
});

// Mutation to delete project and all associated data
export const deleteProject = mutation({
  args: { projectId: v.id("projects") },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Get all flows for this project
    const flows = await ctx.db
      .query("flows")
      .withIndex("by_project_id", (q) => q.eq("projectId", args.projectId))
      .collect();

    // Delete all nodes and edges for each flow
    for (const flow of flows) {
      // Delete nodes
      const nodes = await ctx.db
        .query("nodes")
        .withIndex("by_flow_id", (q) => q.eq("flowId", flow._id))
        .collect();
      
      for (const node of nodes) {
        await ctx.db.delete(node._id);
      }

      // Delete edges
      const edges = await ctx.db
        .query("edges")
        .withIndex("by_flow_id", (q) => q.eq("flowId", flow._id))
        .collect();
        
      for (const edge of edges) {
        await ctx.db.delete(edge._id);
      }

      // Delete flow
      await ctx.db.delete(flow._id);
    }

    // Delete exports
    const exports = await ctx.db
      .query("exports")
      .withIndex("by_project_id", (q) => q.eq("projectId", args.projectId))
      .collect();
      
    for (const exportItem of exports) {
      await ctx.db.delete(exportItem._id);
    }

    // Finally delete the project
    await ctx.db.delete(args.projectId);

    return null;
  },
});

// Query to get project statistics
export const getProjectStats = query({
  args: { projectId: v.id("projects") },
  returns: v.object({
    totalFlows: v.number(),
    totalNodes: v.number(),
    totalEdges: v.number(),
    lastModified: v.number(),
  }),
  handler: async (ctx, args) => {
    // Get flows count
    const flows = await ctx.db
      .query("flows")
      .withIndex("by_project_id", (q) => q.eq("projectId", args.projectId))
      .collect();
    
    let totalNodes = 0;
    let totalEdges = 0;
    let lastModified = 0;

    // Count nodes and edges for all flows
    for (const flow of flows) {
      const nodes = await ctx.db
        .query("nodes")
        .withIndex("by_flow_id", (q) => q.eq("flowId", flow._id))
        .collect();
      
      const edges = await ctx.db
        .query("edges")
        .withIndex("by_flow_id", (q) => q.eq("flowId", flow._id))
        .collect();

      totalNodes += nodes.length;
      totalEdges += edges.length;
      
      if (flow.lastModified > lastModified) {
        lastModified = flow.lastModified;
      }
    }

    return {
      totalFlows: flows.length,
      totalNodes,
      totalEdges,
      lastModified,
    };
  },
});

// Query to get recent projects
export const getRecentProjects = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(v.object({
    _id: v.id("projects"),
    _creationTime: v.number(),
    name: v.string(),
    description: v.optional(v.string()),
    folder: v.string(),
    status: v.union(v.literal("active"), v.literal("archived"), v.literal("draft")),
    createdBy: v.optional(v.string()),
    lastModified: v.number(),
    settings: v.optional(v.object({
      snapToGrid: v.boolean(),
      showMiniMap: v.boolean(),
      canvasBackground: v.string(),
      theme: v.union(v.literal("light"), v.literal("dark")),
    })),
  })),
  handler: async (ctx, args) => {
    const limit = args.limit || 5;
    
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_last_modified")
      .order("desc")
      .take(limit);
    
    return projects;
  },
}); 