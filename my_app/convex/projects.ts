import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { 
  validateProjectCreation, 
  validateProjectName, 
  validateDescription,
  validateTags,
  validatePriority,
  validateStatus,
  sanitizeString,
  normalizeTags
} from "./validations";

// Enhanced project return validator with all new fields
const projectReturnValidator = v.object({
  _id: v.id("projects"),
  _creationTime: v.number(),
  name: v.string(),
  description: v.optional(v.string()),
  folderId: v.optional(v.id("folders")),
  folderPath: v.optional(v.string()),
  status: v.union(v.literal("active"), v.literal("archived"), v.literal("draft")),
  tags: v.optional(v.array(v.string())),
  priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
  dueDate: v.optional(v.number()),
  isDeleted: v.boolean(),
  deletedAt: v.optional(v.number()),
  deletedBy: v.optional(v.string()),
  createdBy: v.optional(v.string()),
  lastModified: v.number(),
  lastModifiedBy: v.optional(v.string()),
  accessedAt: v.number(),
  settings: v.optional(v.object({
    snapToGrid: v.boolean(),
    showMiniMap: v.boolean(),
    canvasBackground: v.string(),
    theme: v.union(v.literal("light"), v.literal("dark")),
    isPublic: v.boolean(),
    allowComments: v.boolean(),
    autoSave: v.boolean(),
    autoSaveInterval: v.number(),
  })),
  stats: v.optional(v.object({
    nodeCount: v.number(),
    edgeCount: v.number(),
    lastFlowModified: v.number(),
    totalEditTime: v.number(),
    viewCount: v.number(),
  })),
});

// Query to get all non-deleted projects
export const getAllProjects = query({
  args: {},
  returns: v.array(projectReturnValidator),
  handler: async (ctx) => {
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_deleted_status", (q) => q.eq("isDeleted", false))
      .order("desc")
      .collect();
    return projects;
  },
});

// Query to get projects by folder ID
export const getProjectsByFolder = query({
  args: { folderId: v.optional(v.id("folders")) },
  returns: v.array(projectReturnValidator),
  handler: async (ctx, args) => {
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_folder_and_deleted", (q) => 
        q.eq("folderId", args.folderId).eq("isDeleted", false)
      )
      .order("desc")
      .collect();
    return projects;
  },
});

// Query to get projects by status
export const getProjectsByStatus = query({
  args: { status: v.union(v.literal("active"), v.literal("archived"), v.literal("draft")) },
  returns: v.array(projectReturnValidator),
  handler: async (ctx, args) => {
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_status_and_deleted", (q) => 
        q.eq("status", args.status).eq("isDeleted", false)
      )
      .order("desc")
      .collect();
    return projects;
  },
});

// Query to get a single project by ID
export const getProject = query({
  args: { projectId: v.id("projects") },
  returns: v.union(projectReturnValidator, v.null()),
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project || project.isDeleted) {
      return null;
    }
    
    // Update access timestamp (commented out in query - should be done in mutation)
    // await ctx.db.patch(args.projectId, {
    //   accessedAt: Date.now(),
    //   stats: {
    //     ...project.stats,
    //     viewCount: (project.stats?.viewCount || 0) + 1,
    //   },
    // });
    
    return project;
  },
});

// Query to get recent projects
export const getRecentProjects = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(projectReturnValidator),
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_accessed_at")
      .order("desc")
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .take(limit);
    
    return projects;
  },
});

// Query to search projects by name
export const searchProjects = query({
  args: { 
    searchTerm: v.string(),
    folderId: v.optional(v.id("folders")),
    status: v.optional(v.union(v.literal("active"), v.literal("archived"), v.literal("draft"))),
    limit: v.optional(v.number())
  },
  returns: v.array(projectReturnValidator),
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    let query = ctx.db
      .query("projects")
      .withIndex("by_deleted_status", (q) => q.eq("isDeleted", false));

    // Apply additional filters
    const projects = await query.collect();
    
    let filteredProjects = projects.filter(project => 
      project.name.toLowerCase().includes(args.searchTerm.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(args.searchTerm.toLowerCase())) ||
      (project.tags && project.tags.some(tag => tag.toLowerCase().includes(args.searchTerm.toLowerCase())))
    );

    if (args.folderId !== undefined) {
      filteredProjects = filteredProjects.filter(project => project.folderId === args.folderId);
    }

    if (args.status) {
      filteredProjects = filteredProjects.filter(project => project.status === args.status);
    }

    return filteredProjects
      .sort((a, b) => b.lastModified - a.lastModified)
      .slice(0, limit);
  },
});

// Query to get projects by priority
export const getProjectsByPriority = query({
  args: { priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")) },
  returns: v.array(projectReturnValidator),
  handler: async (ctx, args) => {
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_priority")
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .filter((q) => q.eq(q.field("priority"), args.priority))
      .order("desc")
      .collect();
    return projects;
  },
});

// Query to get projects due soon
export const getProjectsDueSoon = query({
  args: { days: v.optional(v.number()) },
  returns: v.array(projectReturnValidator),
  handler: async (ctx, args) => {
    const days = args.days || 7;
    const now = Date.now();
    const dueThreshold = now + (days * 24 * 60 * 60 * 1000);
    
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_due_date")
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .filter((q) => q.neq(q.field("dueDate"), undefined))
      .collect();
    
    return projects.filter(project => 
      project.dueDate && project.dueDate <= dueThreshold && project.dueDate >= now
    ).sort((a, b) => (a.dueDate || 0) - (b.dueDate || 0));
  },
});

// Mutation to create a new project
export const createProject = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    folderId: v.optional(v.id("folders")),
    status: v.optional(v.union(v.literal("active"), v.literal("archived"), v.literal("draft"))),
    tags: v.optional(v.array(v.string())),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    dueDate: v.optional(v.number()),
    createdBy: v.optional(v.string()),
    settings: v.optional(v.object({
      snapToGrid: v.boolean(),
      showMiniMap: v.boolean(),
      canvasBackground: v.string(),
      theme: v.union(v.literal("light"), v.literal("dark")),
      isPublic: v.boolean(),
      allowComments: v.boolean(),
      autoSave: v.boolean(),
      autoSaveInterval: v.number(),
    })),
  },
  returns: v.union(
    v.object({ success: v.boolean(), projectId: v.id("projects") }),
    v.object({ success: v.boolean(), error: v.string() })
  ),
  handler: async (ctx, args) => {
    // Validate project data
    const validation = validateProjectCreation({
      name: args.name,
      description: args.description,
      tags: args.tags,
      priority: args.priority,
      dueDate: args.dueDate,
      settings: args.settings,
    });
    
    if (!validation.isValid) {
      return { success: false, error: validation.error! };
    }

    // Sanitize inputs
    const sanitizedName = sanitizeString(args.name);
    const sanitizedDescription = args.description ? sanitizeString(args.description) : undefined;
    const normalizedTags = args.tags ? normalizeTags(args.tags) : undefined;

    // Validate folder exists if provided
    let folderPath: string | undefined;
    if (args.folderId) {
      const folder = await ctx.db.get(args.folderId);
      if (!folder || folder.isDeleted) {
        return { success: false, error: "Folder not found" };
      }
      folderPath = folder.path;
    }

    const now = Date.now();
    
    const projectId = await ctx.db.insert("projects", {
      name: sanitizedName,
      description: sanitizedDescription,
      folderId: args.folderId,
      folderPath,
      status: args.status || "active",
      tags: normalizedTags,
      priority: args.priority,
      dueDate: args.dueDate,
      isDeleted: false,
      createdBy: args.createdBy,
      lastModified: now,
      lastModifiedBy: args.createdBy,
      accessedAt: now,
      settings: args.settings || {
        snapToGrid: true,
        showMiniMap: true,
        canvasBackground: "#ffffff",
        theme: "light",
        isPublic: false,
        allowComments: true,
        autoSave: true,
        autoSaveInterval: 5000,
      },
      stats: {
        nodeCount: 0,
        edgeCount: 0,
        lastFlowModified: now,
        totalEditTime: 0,
        viewCount: 0,
      },
    });

    // Create default flow for the project
    await ctx.db.insert("flows", {
      projectId,
      name: "Main Flow",
      description: "Default flow for the project",
      version: 1,
      isActive: true,
      isPinned: false,
      viewport: {
        x: 0,
        y: 0,
        zoom: 1,
      },
      isDeleted: false,
      createdBy: args.createdBy,
      createdAt: now,
      lastModified: now,
      lastModifiedBy: args.createdBy,
      metadata: {
        isTemplate: false,
      },
    });

    // Log activity
    await ctx.db.insert("activityLog", {
      entityType: "project",
      entityId: projectId,
      action: "create",
      userId: args.createdBy,
      timestamp: now,
      details: {
        newValues: { name: sanitizedName, folderId: args.folderId, status: args.status || "active" },
      },
    });

    return { success: true, projectId };
  },
});

// Mutation to update project
export const updateProject = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    folderId: v.optional(v.id("folders")),
    status: v.optional(v.union(v.literal("active"), v.literal("archived"), v.literal("draft"))),
    tags: v.optional(v.array(v.string())),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    dueDate: v.optional(v.number()),
    modifiedBy: v.optional(v.string()),
    settings: v.optional(v.object({
      snapToGrid: v.boolean(),
      showMiniMap: v.boolean(),
      canvasBackground: v.string(),
      theme: v.union(v.literal("light"), v.literal("dark")),
      isPublic: v.boolean(),
      allowComments: v.boolean(),
      autoSave: v.boolean(),
      autoSaveInterval: v.number(),
    })),
  },
  returns: v.union(
    v.object({ success: v.boolean() }),
    v.object({ success: v.boolean(), error: v.string() })
  ),
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project || project.isDeleted) {
      return { success: false, error: "Project not found" };
    }

    const updates: any = {
      lastModified: Date.now(),
      lastModifiedBy: args.modifiedBy,
    };

    // Validate and update name if provided
    if (args.name !== undefined) {
      const nameValidation = validateProjectName(args.name);
      if (!nameValidation.isValid) {
        return { success: false, error: nameValidation.error! };
      }
      updates.name = sanitizeString(args.name);
    }

    // Validate and update description if provided
    if (args.description !== undefined) {
      const descValidation = validateDescription(args.description);
      if (!descValidation.isValid) {
        return { success: false, error: descValidation.error! };
      }
      updates.description = args.description ? sanitizeString(args.description) : undefined;
    }

    // Validate and update folder if provided
    if (args.folderId !== undefined) {
      if (args.folderId) {
        const folder = await ctx.db.get(args.folderId);
        if (!folder || folder.isDeleted) {
          return { success: false, error: "Folder not found" };
        }
        updates.folderId = args.folderId;
        updates.folderPath = folder.path;
      } else {
        updates.folderId = undefined;
        updates.folderPath = undefined;
      }
    }

    // Validate and update status if provided
    if (args.status !== undefined) {
      const statusValidation = validateStatus(args.status);
      if (!statusValidation.isValid) {
        return { success: false, error: statusValidation.error! };
      }
      updates.status = args.status;
    }

    // Validate and update tags if provided
    if (args.tags !== undefined) {
      const tagsValidation = validateTags(args.tags);
      if (!tagsValidation.isValid) {
        return { success: false, error: tagsValidation.error! };
      }
      updates.tags = args.tags ? normalizeTags(args.tags) : undefined;
    }

    // Validate and update priority if provided
    if (args.priority !== undefined) {
      const priorityValidation = validatePriority(args.priority);
      if (!priorityValidation.isValid) {
        return { success: false, error: priorityValidation.error! };
      }
      updates.priority = args.priority;
    }

    // Update other fields
    if (args.dueDate !== undefined) updates.dueDate = args.dueDate;
    if (args.settings !== undefined) updates.settings = args.settings;

    await ctx.db.patch(args.projectId, updates);

    // Log activity
    await ctx.db.insert("activityLog", {
      entityType: "project",
      entityId: args.projectId,
      action: "update",
      userId: args.modifiedBy,
      timestamp: Date.now(),
      details: {
        changes: Object.keys(updates),
      },
    });

    return { success: true };
  },
});

// Mutation to soft delete project
export const deleteProject = mutation({
  args: { 
    projectId: v.id("projects"),
    deletedBy: v.optional(v.string()),
  },
  returns: v.union(
    v.object({ success: v.boolean() }),
    v.object({ success: v.boolean(), error: v.string() })
  ),
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project || project.isDeleted) {
      return { success: false, error: "Project not found" };
    }

    const now = Date.now();
    
    // Soft delete the project
    await ctx.db.patch(args.projectId, {
      isDeleted: true,
      deletedAt: now,
      deletedBy: args.deletedBy,
      lastModified: now,
    });

    // Soft delete all associated flows
    const flows = await ctx.db
      .query("flows")
      .withIndex("by_project_id_and_deleted", (q) => 
        q.eq("projectId", args.projectId).eq("isDeleted", false)
      )
      .collect();

    for (const flow of flows) {
      await ctx.db.patch(flow._id, {
        isDeleted: true,
        deletedAt: now,
        deletedBy: args.deletedBy,
        lastModified: now,
      });

      // Soft delete all nodes for this flow
      const nodes = await ctx.db
        .query("nodes")
        .withIndex("by_flow_id_and_deleted", (q) => 
          q.eq("flowId", flow._id).eq("isDeleted", false)
        )
        .collect();
      
      for (const node of nodes) {
        await ctx.db.patch(node._id, {
          isDeleted: true,
          deletedAt: now,
          deletedBy: args.deletedBy,
          updatedAt: now,
        });
      }

      // Soft delete all edges for this flow
      const edges = await ctx.db
        .query("edges")
        .withIndex("by_flow_id_and_deleted", (q) => 
          q.eq("flowId", flow._id).eq("isDeleted", false)
        )
        .collect();
        
      for (const edge of edges) {
        await ctx.db.patch(edge._id, {
          isDeleted: true,
          deletedAt: now,
          deletedBy: args.deletedBy,
          updatedAt: now,
        });
      }
    }

    // Log activity
    await ctx.db.insert("activityLog", {
      entityType: "project",
      entityId: args.projectId,
      action: "delete",
      userId: args.deletedBy,
      timestamp: now,
    });

    return { success: true };
  },
});

// Mutation to restore a soft-deleted project
export const restoreProject = mutation({
  args: { 
    projectId: v.id("projects"),
    restoredBy: v.optional(v.string()),
  },
  returns: v.union(
    v.object({ success: v.boolean() }),
    v.object({ success: v.boolean(), error: v.string() })
  ),
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project || !project.isDeleted) {
      return { success: false, error: "Project not found or not deleted" };
    }

    // Check if folder still exists and is not deleted
    if (project.folderId) {
      const folder = await ctx.db.get(project.folderId);
      if (!folder || folder.isDeleted) {
        return { success: false, error: "Cannot restore project: folder no longer exists" };
      }
    }

    const now = Date.now();
    
    // Restore the project
    await ctx.db.patch(args.projectId, {
      isDeleted: false,
      deletedAt: undefined,
      deletedBy: undefined,
      lastModified: now,
    });

    // Restore associated flows
    const flows = await ctx.db
      .query("flows")
      .withIndex("by_project_id_and_deleted", (q) => 
        q.eq("projectId", args.projectId).eq("isDeleted", true)
      )
      .collect();

    for (const flow of flows) {
      await ctx.db.patch(flow._id, {
        isDeleted: false,
        deletedAt: undefined,
        deletedBy: undefined,
        lastModified: now,
      });
    }

    // Log activity
    await ctx.db.insert("activityLog", {
      entityType: "project",
      entityId: args.projectId,
      action: "restore",
      userId: args.restoredBy,
      timestamp: now,
    });

    return { success: true };
  },
});

// Query to get project statistics
export const getProjectStats = query({
  args: { projectId: v.id("projects") },
  returns: v.union(
    v.object({
      totalFlows: v.number(),
      activeFlows: v.number(),
      totalNodes: v.number(),
      totalEdges: v.number(),
      lastModified: v.number(),
      editTime: v.number(),
      viewCount: v.number(),
      recentActivity: v.array(v.object({
        action: v.string(),
        timestamp: v.number(),
        userId: v.optional(v.string()),
      })),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project || project.isDeleted) {
      return null;
    }

    // Get flows count
    const flows = await ctx.db
      .query("flows")
      .withIndex("by_project_id_and_deleted", (q) => 
        q.eq("projectId", args.projectId).eq("isDeleted", false)
      )
      .collect();
    
    const activeFlows = flows.filter(flow => flow.isActive).length;
    
    let totalNodes = 0;
    let totalEdges = 0;
    let lastModified = project.lastModified;

    // Count nodes and edges for all flows
    for (const flow of flows) {
      const nodes = await ctx.db
        .query("nodes")
        .withIndex("by_flow_id_and_deleted", (q) => 
          q.eq("flowId", flow._id).eq("isDeleted", false)
        )
        .collect();
      
      const edges = await ctx.db
        .query("edges")
        .withIndex("by_flow_id_and_deleted", (q) => 
          q.eq("flowId", flow._id).eq("isDeleted", false)
        )
        .collect();

      totalNodes += nodes.length;
      totalEdges += edges.length;
      
      if (flow.lastModified > lastModified) {
        lastModified = flow.lastModified;
      }
    }

    // Get recent activity
    const recentActivity = await ctx.db
      .query("activityLog")
      .withIndex("by_entity_id")
      .filter((q) => q.eq(q.field("entityId"), args.projectId))
      .order("desc")
      .take(10);

    return {
      totalFlows: flows.length,
      activeFlows,
      totalNodes,
      totalEdges,
      lastModified,
      editTime: project.stats?.totalEditTime || 0,
      viewCount: project.stats?.viewCount || 0,
      recentActivity: recentActivity.map(activity => ({
        action: activity.action,
        timestamp: activity.timestamp,
        userId: activity.userId,
      })),
    };
  },
});

// Mutation to duplicate a project
export const duplicateProject = mutation({
  args: {
    projectId: v.id("projects"),
    newName: v.string(),
    newFolderId: v.optional(v.id("folders")),
    createdBy: v.optional(v.string()),
  },
  returns: v.union(
    v.object({ success: v.boolean(), projectId: v.id("projects") }),
    v.object({ success: v.boolean(), error: v.string() })
  ),
  handler: async (ctx, args) => {
    const originalProject = await ctx.db.get(args.projectId);
    if (!originalProject || originalProject.isDeleted) {
      return { success: false, error: "Original project not found" };
    }

    // Validate new name
    const nameValidation = validateProjectName(args.newName);
    if (!nameValidation.isValid) {
      return { success: false, error: nameValidation.error! };
    }

    // Validate new folder if provided
    let folderPath: string | undefined;
    if (args.newFolderId) {
      const folder = await ctx.db.get(args.newFolderId);
      if (!folder || folder.isDeleted) {
        return { success: false, error: "Target folder not found" };
      }
      folderPath = folder.path;
    }

    const now = Date.now();
    const sanitizedName = sanitizeString(args.newName);

    // Create new project
    const { _id, _creationTime, ...projectData } = originalProject;
    const newProjectId = await ctx.db.insert("projects", {
      ...projectData,
      name: sanitizedName,
      folderId: args.newFolderId,
      folderPath,
      isDeleted: false,
      deletedAt: undefined,
      deletedBy: undefined,
      createdBy: args.createdBy,
      lastModified: now,
      lastModifiedBy: args.createdBy,
      accessedAt: now,
      stats: {
        nodeCount: 0,
        edgeCount: 0,
        lastFlowModified: now,
        totalEditTime: 0,
        viewCount: 0,
      },
    });

    // Duplicate flows
    const originalFlows = await ctx.db
      .query("flows")
      .withIndex("by_project_id_and_deleted", (q) => 
        q.eq("projectId", args.projectId).eq("isDeleted", false)
      )
      .collect();

    for (const originalFlow of originalFlows) {
      const { _id: flowId, _creationTime: flowCreationTime, ...flowData } = originalFlow;
      const newFlowId = await ctx.db.insert("flows", {
        ...flowData,
        projectId: newProjectId,
        isDeleted: false,
        deletedAt: undefined,
        deletedBy: undefined,
        createdBy: args.createdBy,
        createdAt: now,
        lastModified: now,
        lastModifiedBy: args.createdBy,
      });

      // Duplicate nodes
      const originalNodes = await ctx.db
        .query("nodes")
        .withIndex("by_flow_id_and_deleted", (q) => 
          q.eq("flowId", originalFlow._id).eq("isDeleted", false)
        )
        .collect();

      for (const originalNode of originalNodes) {
        await ctx.db.insert("nodes", {
          ...originalNode,
          _id: undefined as any,
          _creationTime: undefined as any,
          flowId: newFlowId,
          isDeleted: false,
          deletedAt: undefined,
          deletedBy: undefined,
          createdBy: args.createdBy,
          createdAt: now,
          updatedAt: now,
          updatedBy: args.createdBy,
        });
      }

      // Duplicate edges
      const originalEdges = await ctx.db
        .query("edges")
        .withIndex("by_flow_id_and_deleted", (q) => 
          q.eq("flowId", originalFlow._id).eq("isDeleted", false)
        )
        .collect();

      for (const originalEdge of originalEdges) {
        await ctx.db.insert("edges", {
          ...originalEdge,
          _id: undefined as any,
          _creationTime: undefined as any,
          flowId: newFlowId,
          isDeleted: false,
          deletedAt: undefined,
          deletedBy: undefined,
          createdBy: args.createdBy,
          createdAt: now,
          updatedAt: now,
          updatedBy: args.createdBy,
        });
      }
    }

    // Log activity
    await ctx.db.insert("activityLog", {
      entityType: "project",
      entityId: newProjectId,
      action: "create",
      userId: args.createdBy,
      timestamp: now,
      details: {
        newValues: { name: sanitizedName, duplicatedFrom: args.projectId },
      },
    });

    return { success: true, projectId: newProjectId };
  },
});

// Mutation to update project statistics
export const updateProjectStats = mutation({
  args: {
    projectId: v.id("projects"),
    nodeCount: v.optional(v.number()),
    edgeCount: v.optional(v.number()),
    editTime: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project || project.isDeleted) {
      return null;
    }

    const currentStats = project.stats || {
      nodeCount: 0,
      edgeCount: 0,
      lastFlowModified: Date.now(),
      totalEditTime: 0,
      viewCount: 0,
    };

    const updatedStats = {
      ...currentStats,
      lastFlowModified: Date.now(),
    };

    if (args.nodeCount !== undefined) updatedStats.nodeCount = args.nodeCount;
    if (args.edgeCount !== undefined) updatedStats.edgeCount = args.edgeCount;
    if (args.editTime !== undefined) updatedStats.totalEditTime += args.editTime;

    await ctx.db.patch(args.projectId, {
      stats: updatedStats,
      lastModified: Date.now(),
    });

    return null;
  },
});

export default {
  getAllProjects,
  getProjectsByFolder,
  getProjectsByStatus,
  getProject,
  getRecentProjects,
  searchProjects,
  getProjectsByPriority,
  getProjectsDueSoon,
  createProject,
  updateProject,
  deleteProject,
  restoreProject,
  getProjectStats,
  duplicateProject,
  updateProjectStats,
}; 