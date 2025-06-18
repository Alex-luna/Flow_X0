import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Validation helper for folder names
const validateFolderName = (name: string): string | null => {
  if (!name || name.trim().length === 0) {
    return "Folder name cannot be empty";
  }
  if (name.length > 100) {
    return "Folder name cannot exceed 100 characters";
  }
  if (name.includes("/") || name.includes("\\")) {
    return "Folder name cannot contain slashes";
  }
  const invalidChars = /[<>:"|?*]/;
  if (invalidChars.test(name)) {
    return "Folder name contains invalid characters";
  }
  return null;
};

// Helper to build folder path
const buildPath = (parentPath: string | null, folderName: string): string => {
  if (!parentPath || parentPath === "/") {
    return `/${folderName}`;
  }
  return `${parentPath}/${folderName}`;
};

// Helper to calculate folder depth
const calculateDepth = (path: string): number => {
  if (path === "/") return 0;
  return path.split("/").filter(segment => segment.length > 0).length;
};

// Query to get all non-deleted folders
export const getAllFolders = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("folders"),
    _creationTime: v.number(),
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    parentFolderId: v.optional(v.id("folders")),
    path: v.string(),
    depth: v.number(),
    isDeleted: v.boolean(),
    deletedAt: v.optional(v.number()),
    deletedBy: v.optional(v.string()),
    createdBy: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    settings: v.optional(v.object({
      isPrivate: v.boolean(),
      allowSubfolders: v.boolean(),
      defaultProjectSettings: v.optional(v.object({
        snapToGrid: v.boolean(),
        showMiniMap: v.boolean(),
        canvasBackground: v.string(),
        theme: v.union(v.literal("light"), v.literal("dark")),
      })),
    })),
  })),
  handler: async (ctx) => {
    const folders = await ctx.db
      .query("folders")
      .withIndex("by_deleted_status", (q) => q.eq("isDeleted", false))
      .order("asc")
      .collect();
    return folders;
  },
});

// Query to get root folders (no parent)
export const getRootFolders = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("folders"),
    _creationTime: v.number(),
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    parentFolderId: v.optional(v.id("folders")),
    path: v.string(),
    depth: v.number(),
    isDeleted: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
    settings: v.optional(v.object({
      isPrivate: v.boolean(),
      allowSubfolders: v.boolean(),
      defaultProjectSettings: v.optional(v.object({
        snapToGrid: v.boolean(),
        showMiniMap: v.boolean(),
        canvasBackground: v.string(),
        theme: v.union(v.literal("light"), v.literal("dark")),
      })),
    })),
  })),
  handler: async (ctx) => {
    const folders = await ctx.db
      .query("folders")
      .withIndex("by_parent_and_deleted", (q) => 
        q.eq("parentFolderId", undefined).eq("isDeleted", false)
      )
      .order("asc")
      .collect();
    return folders;
  },
});

// Query to get folders by parent ID
export const getFoldersByParent = query({
  args: { parentFolderId: v.optional(v.id("folders")) },
  returns: v.array(v.object({
    _id: v.id("folders"),
    _creationTime: v.number(),
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    parentFolderId: v.optional(v.id("folders")),
    path: v.string(),
    depth: v.number(),
    isDeleted: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
    settings: v.optional(v.object({
      isPrivate: v.boolean(),
      allowSubfolders: v.boolean(),
      defaultProjectSettings: v.optional(v.object({
        snapToGrid: v.boolean(),
        showMiniMap: v.boolean(),
        canvasBackground: v.string(),
        theme: v.union(v.literal("light"), v.literal("dark")),
      })),
    })),
  })),
  handler: async (ctx, args) => {
    const folders = await ctx.db
      .query("folders")
      .withIndex("by_parent_and_deleted", (q) => 
        q.eq("parentFolderId", args.parentFolderId).eq("isDeleted", false)
      )
      .order("asc")
      .collect();
    return folders;
  },
});

// Query to get a single folder by ID
export const getFolder = query({
  args: { folderId: v.id("folders") },
  returns: v.union(
    v.object({
      _id: v.id("folders"),
      _creationTime: v.number(),
      name: v.string(),
      description: v.optional(v.string()),
      color: v.optional(v.string()),
      icon: v.optional(v.string()),
      parentFolderId: v.optional(v.id("folders")),
      path: v.string(),
      depth: v.number(),
      isDeleted: v.boolean(),
      deletedAt: v.optional(v.number()),
      deletedBy: v.optional(v.string()),
      createdBy: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
      settings: v.optional(v.object({
        isPrivate: v.boolean(),
        allowSubfolders: v.boolean(),
        defaultProjectSettings: v.optional(v.object({
          snapToGrid: v.boolean(),
          showMiniMap: v.boolean(),
          canvasBackground: v.string(),
          theme: v.union(v.literal("light"), v.literal("dark")),
        })),
      })),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const folder = await ctx.db.get(args.folderId);
    return folder;
  },
});

// Query to get folder hierarchy (folder with all its ancestors)
export const getFolderHierarchy = query({
  args: { folderId: v.id("folders") },
  returns: v.array(v.object({
    _id: v.id("folders"),
    name: v.string(),
    path: v.string(),
    depth: v.number(),
  })),
  handler: async (ctx, args) => {
    const hierarchy: Array<{
      _id: Id<"folders">;
      name: string;
      path: string;
      depth: number;
    }> = [];
    
    let currentFolder = await ctx.db.get(args.folderId);
    
    while (currentFolder && !currentFolder.isDeleted) {
      hierarchy.unshift({
        _id: currentFolder._id,
        name: currentFolder.name,
        path: currentFolder.path,
        depth: currentFolder.depth,
      });
      
      if (currentFolder.parentFolderId) {
        currentFolder = await ctx.db.get(currentFolder.parentFolderId);
      } else {
        break;
      }
    }
    
    return hierarchy;
  },
});

// Mutation to create a new folder
export const createFolder = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    parentFolderId: v.optional(v.id("folders")),
    settings: v.optional(v.object({
      isPrivate: v.boolean(),
      allowSubfolders: v.boolean(),
      defaultProjectSettings: v.optional(v.object({
        snapToGrid: v.boolean(),
        showMiniMap: v.boolean(),
        canvasBackground: v.string(),
        theme: v.union(v.literal("light"), v.literal("dark")),
      })),
    })),
  },
  returns: v.union(
    v.object({ success: v.boolean(), folderId: v.id("folders") }),
    v.object({ success: v.boolean(), error: v.string() })
  ),
  handler: async (ctx, args) => {
    // Validate folder name
    const nameError = validateFolderName(args.name);
    if (nameError) {
      return { success: false, error: nameError };
    }

    let parentPath = "/";
    let parentDepth = -1;
    
    // If parent folder is specified, validate it exists and get its path
    if (args.parentFolderId) {
      const parentFolder = await ctx.db.get(args.parentFolderId);
      if (!parentFolder || parentFolder.isDeleted) {
        return { success: false, error: "Parent folder not found" };
      }
      
      // Check if parent allows subfolders
      if (parentFolder.settings?.allowSubfolders === false) {
        return { success: false, error: "Parent folder does not allow subfolders" };
      }
      
      parentPath = parentFolder.path;
      parentDepth = parentFolder.depth;
      
      // Prevent excessive nesting (max 10 levels)
      if (parentDepth >= 9) {
        return { success: false, error: "Maximum folder depth exceeded" };
      }
    }

    // Check for duplicate names in the same parent folder
    const existingFolders = await ctx.db
      .query("folders")
      .withIndex("by_parent_and_deleted", (q) => 
        q.eq("parentFolderId", args.parentFolderId).eq("isDeleted", false)
      )
      .collect();
    
    const duplicateName = existingFolders.find(folder => 
      folder.name.toLowerCase() === args.name.toLowerCase()
    );
    
    if (duplicateName) {
      return { success: false, error: "A folder with this name already exists in the same location" };
    }

    const folderPath = buildPath(parentPath, args.name);
    const depth = calculateDepth(folderPath);
    const now = Date.now();

    const folderId = await ctx.db.insert("folders", {
      name: args.name.trim(),
      description: args.description,
      color: args.color || "#3B82F6", // Default blue color
      icon: args.icon || "folder",
      parentFolderId: args.parentFolderId,
      path: folderPath,
      depth,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
      settings: args.settings || {
        isPrivate: false,
        allowSubfolders: true,
        defaultProjectSettings: {
          snapToGrid: true,
          showMiniMap: true,
          canvasBackground: "#ffffff",
          theme: "light",
        },
      },
    });

    // Log activity
    await ctx.db.insert("activityLog", {
      entityType: "folder",
      entityId: folderId,
      action: "create",
      timestamp: now,
      details: {
        newValues: { name: args.name, parentFolderId: args.parentFolderId },
      },
    });

    return { success: true, folderId };
  },
});

// Mutation to update a folder
export const updateFolder = mutation({
  args: {
    folderId: v.id("folders"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    settings: v.optional(v.object({
      isPrivate: v.boolean(),
      allowSubfolders: v.boolean(),
      defaultProjectSettings: v.optional(v.object({
        snapToGrid: v.boolean(),
        showMiniMap: v.boolean(),
        canvasBackground: v.string(),
        theme: v.union(v.literal("light"), v.literal("dark")),
      })),
    })),
  },
  returns: v.union(
    v.object({ success: v.boolean() }),
    v.object({ success: v.boolean(), error: v.string() })
  ),
  handler: async (ctx, args) => {
    const folder = await ctx.db.get(args.folderId);
    if (!folder || folder.isDeleted) {
      return { success: false, error: "Folder not found" };
    }

    const updates: any = {
      updatedAt: Date.now(),
    };

    // Validate and update name if provided
    if (args.name !== undefined) {
      const nameError = validateFolderName(args.name);
      if (nameError) {
        return { success: false, error: nameError };
      }

      // Check for duplicate names in the same parent folder
      const siblingFolders = await ctx.db
        .query("folders")
        .withIndex("by_parent_and_deleted", (q) => 
          q.eq("parentFolderId", folder.parentFolderId).eq("isDeleted", false)
        )
        .collect();
      
      const duplicateName = siblingFolders.find(f => 
        f._id !== args.folderId && 
        f.name.toLowerCase() === args.name.toLowerCase()
      );
      
      if (duplicateName) {
        return { success: false, error: "A folder with this name already exists in the same location" };
      }

      updates.name = args.name.trim();
      
      // If name changed, update path and all descendant paths
      if (folder.name !== args.name && args.name) {
        const oldPath = folder.path;
        const newPath = folder.parentFolderId 
          ? buildPath(oldPath.substring(0, oldPath.lastIndexOf('/')), args.name)
          : `/${args.name}`;
        
        updates.path = newPath;

        // Update all descendant folder paths
        const descendants = await ctx.db
          .query("folders")
          .withIndex("by_deleted_status", (q) => q.eq("isDeleted", false))
          .collect();
        
        for (const descendant of descendants) {
          if (descendant.path.startsWith(oldPath + "/")) {
            const newDescendantPath = descendant.path.replace(oldPath, newPath);
            await ctx.db.patch(descendant._id, {
              path: newDescendantPath,
              updatedAt: Date.now(),
            });
          }
        }

        // Update all project folderPath references
        const projects = await ctx.db
          .query("projects")
          .withIndex("by_folder_path", (q) => q.eq("folderPath", oldPath))
          .collect();
        
        for (const project of projects) {
          await ctx.db.patch(project._id, {
            folderPath: newPath,
            lastModified: Date.now(),
          });
        }
      }
    }

    // Update other fields
    if (args.description !== undefined) updates.description = args.description;
    if (args.color !== undefined) updates.color = args.color;
    if (args.icon !== undefined) updates.icon = args.icon;
    if (args.settings !== undefined) updates.settings = args.settings;

    await ctx.db.patch(args.folderId, updates);

    // Log activity
    await ctx.db.insert("activityLog", {
      entityType: "folder",
      entityId: args.folderId,
      action: "update",
      timestamp: Date.now(),
      details: {
        changes: Object.keys(updates),
      },
    });

    return { success: true };
  },
});

// Mutation to soft delete a folder
export const deleteFolder = mutation({
  args: { 
    folderId: v.id("folders"),
    deletedBy: v.optional(v.string()),
  },
  returns: v.union(
    v.object({ success: v.boolean() }),
    v.object({ success: v.boolean(), error: v.string() })
  ),
  handler: async (ctx, args) => {
    const folder = await ctx.db.get(args.folderId);
    if (!folder || folder.isDeleted) {
      return { success: false, error: "Folder not found" };
    }

    // Check if folder has subfolders
    const subfolders = await ctx.db
      .query("folders")
      .withIndex("by_parent_and_deleted", (q) => 
        q.eq("parentFolderId", args.folderId).eq("isDeleted", false)
      )
      .collect();

    if (subfolders.length > 0) {
      return { success: false, error: "Cannot delete folder with subfolders. Delete subfolders first." };
    }

    // Check if folder has projects
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_folder_and_deleted", (q) => 
        q.eq("folderId", args.folderId).eq("isDeleted", false)
      )
      .collect();

    if (projects.length > 0) {
      return { success: false, error: "Cannot delete folder with projects. Move or delete projects first." };
    }

    const now = Date.now();
    
    // Soft delete the folder
    await ctx.db.patch(args.folderId, {
      isDeleted: true,
      deletedAt: now,
      deletedBy: args.deletedBy,
      updatedAt: now,
    });

    // Log activity
    await ctx.db.insert("activityLog", {
      entityType: "folder",
      entityId: args.folderId,
      action: "delete",
      userId: args.deletedBy,
      timestamp: now,
    });

    return { success: true };
  },
});

// Mutation to restore a soft-deleted folder
export const restoreFolder = mutation({
  args: { 
    folderId: v.id("folders"),
    restoredBy: v.optional(v.string()),
  },
  returns: v.union(
    v.object({ success: v.boolean() }),
    v.object({ success: v.boolean(), error: v.string() })
  ),
  handler: async (ctx, args) => {
    const folder = await ctx.db.get(args.folderId);
    if (!folder || !folder.isDeleted) {
      return { success: false, error: "Folder not found or not deleted" };
    }

    // Check if parent folder still exists and is not deleted
    if (folder.parentFolderId) {
      const parentFolder = await ctx.db.get(folder.parentFolderId);
      if (!parentFolder || parentFolder.isDeleted) {
        return { success: false, error: "Cannot restore folder: parent folder no longer exists" };
      }
    }

    const now = Date.now();
    
    // Restore the folder
    await ctx.db.patch(args.folderId, {
      isDeleted: false,
      deletedAt: undefined,
      deletedBy: undefined,
      updatedAt: now,
    });

    // Log activity
    await ctx.db.insert("activityLog", {
      entityType: "folder",
      entityId: args.folderId,
      action: "restore",
      userId: args.restoredBy,
      timestamp: now,
    });

    return { success: true };
  },
});

// Mutation to permanently delete a folder (admin only)
export const permanentlyDeleteFolder = mutation({
  args: { 
    folderId: v.id("folders"),
    deletedBy: v.optional(v.string()),
  },
  returns: v.union(
    v.object({ success: v.boolean() }),
    v.object({ success: v.boolean(), error: v.string() })
  ),
  handler: async (ctx, args) => {
    const folder = await ctx.db.get(args.folderId);
    if (!folder) {
      return { success: false, error: "Folder not found" };
    }

    // Log activity before deletion
    await ctx.db.insert("activityLog", {
      entityType: "folder",
      entityId: args.folderId,
      action: "delete",
      userId: args.deletedBy,
      timestamp: Date.now(),
      details: {
        oldValues: { name: folder.name, path: folder.path },
      },
    });

    // Permanently delete the folder
    await ctx.db.delete(args.folderId);

    return { success: true };
  },
});

// Query to get folder statistics
export const getFolderStats = query({
  args: { folderId: v.id("folders") },
  returns: v.union(
    v.object({
      projectCount: v.number(),
      subfolderCount: v.number(),
      totalSize: v.number(), // Total projects in folder and subfolders
      lastActivity: v.optional(v.number()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const folder = await ctx.db.get(args.folderId);
    if (!folder || folder.isDeleted) {
      return null;
    }

    // Count direct projects
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_folder_and_deleted", (q) => 
        q.eq("folderId", args.folderId).eq("isDeleted", false)
      )
      .collect();

    // Count direct subfolders
    const subfolders = await ctx.db
      .query("folders")
      .withIndex("by_parent_and_deleted", (q) => 
        q.eq("parentFolderId", args.folderId).eq("isDeleted", false)
      )
      .collect();

    // Count total projects in folder and all subfolders
    const allFolders = await ctx.db
      .query("folders")
      .withIndex("by_deleted_status", (q) => q.eq("isDeleted", false))
      .collect();
    
    const descendantFolderIds = allFolders
      .filter(f => f.path.startsWith(folder.path + "/"))
      .map(f => f._id);
    
    const allFolderIds = [args.folderId, ...descendantFolderIds];
    
    let totalProjects = projects.length;
    for (const folderId of descendantFolderIds) {
      const folderProjects = await ctx.db
        .query("projects")
        .withIndex("by_folder_and_deleted", (q) => 
          q.eq("folderId", folderId).eq("isDeleted", false)
        )
        .collect();
      totalProjects += folderProjects.length;
    }

    // Get last activity timestamp
    const allProjects = [];
    for (const folderId of allFolderIds) {
      const folderProjects = await ctx.db
        .query("projects")
        .withIndex("by_folder_and_deleted", (q) => 
          q.eq("folderId", folderId).eq("isDeleted", false)
        )
        .collect();
      allProjects.push(...folderProjects);
    }

    const lastActivity = allProjects.length > 0 
      ? Math.max(...allProjects.map(p => p.lastModified))
      : undefined;

    return {
      projectCount: projects.length,
      subfolderCount: subfolders.length,
      totalSize: totalProjects,
      lastActivity,
    };
  },
});

export default {
  getAllFolders,
  getRootFolders,
  getFoldersByParent,
  getFolder,
  getFolderHierarchy,
  createFolder,
  updateFolder,
  deleteFolder,
  restoreFolder,
  permanentlyDeleteFolder,
  getFolderStats,
}; 