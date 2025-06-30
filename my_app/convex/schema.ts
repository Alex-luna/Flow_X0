import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Folders for project organization with enhanced structure
  folders: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()), // Hex color for folder display
    icon: v.optional(v.string()), // Icon name for folder display
    parentFolderId: v.optional(v.id("folders")), // For nested folders
    path: v.optional(v.string()), // Full path for efficient queries (e.g., "/folder1/subfolder2")
    depth: v.optional(v.number()), // Folder nesting level (0 for root folders)
    isDeleted: v.optional(v.boolean()), // Soft delete flag
    deletedAt: v.optional(v.number()), // Timestamp when deleted
    deletedBy: v.optional(v.string()), // User who deleted
    createdBy: v.optional(v.string()), // User ID when auth is implemented  
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    // Metadata for advanced features
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
  }).index("by_parent_folder_id", ["parentFolderId"])
    .index("by_name", ["name"])
    .index("by_path", ["path"])
    .index("by_depth", ["depth"])
    .index("by_created_at", ["createdAt"])
    .index("by_updated_at", ["updatedAt"])
    .index("by_deleted_status", ["isDeleted"])
    .index("by_parent_and_deleted", ["parentFolderId", "isDeleted"]),

  // Projects table for managing different funnel projects with enhanced relationships
  projects: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    folder: v.optional(v.string()), // Legacy folder field for backward compatibility
    folderId: v.optional(v.id("folders")), // Changed from folder string to folderId reference
    folderPath: v.optional(v.string()), // Cached folder path for efficient queries
    status: v.union(v.literal("active"), v.literal("archived"), v.literal("draft")),
    tags: v.optional(v.array(v.string())), // Project tags for better organization
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    dueDate: v.optional(v.number()), // Optional deadline timestamp
    isDeleted: v.optional(v.boolean()), // Soft delete flag
    deletedAt: v.optional(v.number()), // Timestamp when deleted
    deletedBy: v.optional(v.string()), // User who deleted
    createdBy: v.optional(v.string()), // User ID when auth is implemented
    lastModified: v.number(), // timestamp
    lastModifiedBy: v.optional(v.string()), // User who last modified
    accessedAt: v.optional(v.number()), // Last access timestamp for recent projects
    // Enhanced settings
    settings: v.optional(v.object({
      snapToGrid: v.optional(v.boolean()),
      showMiniMap: v.optional(v.boolean()),
      canvasBackground: v.optional(v.string()),
      theme: v.optional(v.union(v.literal("light"), v.literal("dark"))),
      isPublic: v.optional(v.boolean()), // For future sharing features
      allowComments: v.optional(v.boolean()), // For future collaboration
      autoSave: v.optional(v.boolean()),
      autoSaveInterval: v.optional(v.number()), // in milliseconds
    })),
    // Project statistics
    stats: v.optional(v.object({
      nodeCount: v.number(),
      edgeCount: v.number(),
      lastFlowModified: v.number(),
      totalEditTime: v.number(), // in milliseconds
      viewCount: v.number(),
    })),
  }).index("by_folder_id", ["folderId"])
    .index("by_folder_path", ["folderPath"])
    .index("by_status", ["status"])
    .index("by_last_modified", ["lastModified"])
    .index("by_accessed_at", ["accessedAt"])
    .index("by_created_by", ["createdBy"])
    .index("by_deleted_status", ["isDeleted"])
    .index("by_folder_and_status", ["folderId", "status"])
    .index("by_folder_and_deleted", ["folderId", "isDeleted"])
    .index("by_status_and_deleted", ["status", "isDeleted"])
    .index("by_priority", ["priority"])
    .index("by_due_date", ["dueDate"]),

  // Flows table for storing canvas state (nodes + edges) with versioning
  flows: defineTable({
    projectId: v.id("projects"),
    name: v.string(),
    description: v.optional(v.string()),
    version: v.number(), // For versioning support
    isActive: v.boolean(), // Current active flow for the project
    isPinned: v.optional(v.boolean()), // Pinned flows for quick access
    viewport: v.object({
      x: v.number(),
      y: v.number(),
      zoom: v.number(),
    }),
    isDeleted: v.optional(v.boolean()), // Soft delete flag
    deletedAt: v.optional(v.number()),
    deletedBy: v.optional(v.string()),
    createdBy: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    lastModified: v.number(),
    lastModifiedBy: v.optional(v.string()),
    // Flow metadata
    metadata: v.optional(v.object({
      thumbnail: v.optional(v.string()), // Base64 thumbnail for preview
      complexity: v.optional(v.union(v.literal("simple"), v.literal("medium"), v.literal("complex"))),
      category: v.optional(v.string()), // Flow category/type
      isTemplate: v.boolean(), // Whether this flow can be used as template
    })),
  }).index("by_project_id", ["projectId"])
    .index("by_project_id_and_active", ["projectId", "isActive"])
    .index("by_project_id_and_deleted", ["projectId", "isDeleted"])
    .index("by_last_modified", ["lastModified"])
    .index("by_created_at", ["createdAt"])
    .index("by_deleted_status", ["isDeleted"])
    .index("by_version", ["version"])
    .index("by_is_template", ["metadata.isTemplate"]),

  // Nodes table for individual flow elements with enhanced properties
  nodes: defineTable({
    flowId: v.id("flows"),
    nodeId: v.string(), // ReactFlow node ID
    type: v.string(), // 'custom' for all nodes
    position: v.object({
      x: v.number(),
      y: v.number(),
    }),
    data: v.object({
      label: v.string(),
      type: v.string(), // funnel step type (generic, checkout, etc.)
      color: v.optional(v.string()),
      description: v.optional(v.string()), // Node description
      properties: v.optional(v.object({
        url: v.optional(v.string()),
        redirectUrl: v.optional(v.string()),
        conversionGoal: v.optional(v.string()),
        // URL Preview properties
        urlPreview: v.optional(v.object({
          title: v.optional(v.string()),
          description: v.optional(v.string()),
          thumbnail: v.optional(v.string()), // Base64 or URL
          favicon: v.optional(v.string()),
          lastFetched: v.optional(v.number()),
          fetchError: v.optional(v.string()),
        })),
        // Image properties
        image: v.optional(v.object({
          url: v.optional(v.string()), // Image URL
          uploadedFile: v.optional(v.string()), // Base64 or file ID
          thumbnail: v.optional(v.string()), // Thumbnail for preview
          alt: v.optional(v.string()), // Alt text
          caption: v.optional(v.string()), // Image caption
          dimensions: v.optional(v.object({
            width: v.number(),
            height: v.number(),
          })),
          fileSize: v.optional(v.number()), // File size in bytes
          mimeType: v.optional(v.string()), // MIME type
          lastModified: v.optional(v.number()),
        })),
        customFields: v.optional(v.array(v.object({
          key: v.string(),
          value: v.string(),
          type: v.union(v.literal("text"), v.literal("number"), v.literal("boolean"), v.literal("url")),
        }))),
      })),
    }),
    style: v.optional(v.object({
      width: v.optional(v.number()),
      height: v.optional(v.number()),
      backgroundColor: v.optional(v.string()),
      borderColor: v.optional(v.string()),
      borderWidth: v.optional(v.number()),
      borderRadius: v.optional(v.number()),
    })),
    selected: v.optional(v.boolean()),
    dragging: v.optional(v.boolean()),
    locked: v.optional(v.boolean()), // Prevent accidental modification
    isDeleted: v.optional(v.boolean()), // Soft delete flag
    deletedAt: v.optional(v.number()),
    deletedBy: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    createdBy: v.optional(v.string()),
    updatedBy: v.optional(v.string()),
  }).index("by_flow_id", ["flowId"])
    .index("by_flow_id_and_node_id", ["flowId", "nodeId"])
    .index("by_flow_id_and_deleted", ["flowId", "isDeleted"])
    .index("by_updated_at", ["updatedAt"])
    .index("by_created_at", ["createdAt"])
    .index("by_deleted_status", ["isDeleted"])
    .index("by_type", ["data.type"]),

  // Edges table for connections between nodes with enhanced properties
  edges: defineTable({
    flowId: v.id("flows"),
    edgeId: v.string(), // ReactFlow edge ID
    source: v.string(), // Source node ID
    target: v.string(), // Target node ID
    sourceHandle: v.optional(v.string()),
    targetHandle: v.optional(v.string()),
    type: v.optional(v.string()),
    animated: v.optional(v.boolean()),
    style: v.optional(v.object({
      stroke: v.optional(v.string()),
      strokeWidth: v.optional(v.number()),
      strokeDasharray: v.optional(v.string()),
    })),
    label: v.optional(v.string()),
    labelStyle: v.optional(v.object({
      fill: v.optional(v.string()),
      fontWeight: v.optional(v.string()),
    })),
    labelBgStyle: v.optional(v.object({
      fill: v.optional(v.string()),
      fillOpacity: v.optional(v.number()),
    })),
    // Enhanced edge properties
    data: v.optional(v.object({
      condition: v.optional(v.string()), // Conditional logic for edge
      weight: v.optional(v.number()), // Edge weight/priority
      conversionRate: v.optional(v.number()), // Analytics data
      description: v.optional(v.string()),
    })),
    isDeleted: v.optional(v.boolean()), // Soft delete flag
    deletedAt: v.optional(v.number()),
    deletedBy: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    createdBy: v.optional(v.string()),
    updatedBy: v.optional(v.string()),
  }).index("by_flow_id", ["flowId"])
    .index("by_flow_id_and_edge_id", ["flowId", "edgeId"])
    .index("by_flow_id_and_deleted", ["flowId", "isDeleted"])
    .index("by_source", ["source"])
    .index("by_target", ["target"])
    .index("by_source_and_target", ["source", "target"])
    .index("by_updated_at", ["updatedAt"])
    .index("by_created_at", ["createdAt"])
    .index("by_deleted_status", ["isDeleted"]),

  // Export/Import history for tracking with enhanced metadata
  exports: defineTable({
    projectId: v.id("projects"),
    flowId: v.id("flows"),
    exportType: v.union(v.literal("pdf"), v.literal("png"), v.literal("jpg"), v.literal("json"), v.literal("svg")),
    fileName: v.string(),
    fileSize: v.optional(v.number()),
    exportedBy: v.optional(v.string()),
    exportedAt: v.number(),
    success: v.boolean(),
    errorMessage: v.optional(v.string()),
    // Enhanced export metadata
    settings: v.optional(v.object({
      includeMetadata: v.boolean(),
      resolution: v.optional(v.string()), // For image exports
      quality: v.optional(v.number()), // For image exports
      includeStats: v.boolean(),
      format: v.optional(v.string()), // Additional format options
    })),
    downloadCount: v.number(), // Track download frequency
    lastDownloadedAt: v.optional(v.number()),
  }).index("by_project_id", ["projectId"])
    .index("by_flow_id", ["flowId"])
    .index("by_exported_at", ["exportedAt"])
    .index("by_exported_by", ["exportedBy"])
    .index("by_success", ["success"])
    .index("by_export_type", ["exportType"]),

  // Project templates for quick start
  templates: defineTable({
    name: v.string(),
    description: v.string(),
    category: v.string(), // e.g., "Lead Generation", "E-commerce", "SaaS"
    thumbnail: v.optional(v.string()), // Base64 thumbnail
    isPublic: v.boolean(),
    createdBy: v.string(),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    usageCount: v.number(), // Track template popularity
    rating: v.optional(v.number()), // User rating
    tags: v.array(v.string()),
    // Template data structure (simplified project structure)
    templateData: v.object({
      settings: v.object({
        snapToGrid: v.boolean(),
        showMiniMap: v.boolean(),
        canvasBackground: v.string(),
        theme: v.union(v.literal("light"), v.literal("dark")),
      }),
      nodes: v.array(v.any()), // Simplified node structure
      edges: v.array(v.any()), // Simplified edge structure
      viewport: v.optional(v.object({
        x: v.number(),
        y: v.number(),
        zoom: v.number(),
      })),
    }),
  }).index("by_category", ["category"])
    .index("by_created_by", ["createdBy"])
    .index("by_is_public", ["isPublic"])
    .index("by_usage_count", ["usageCount"])
    .index("by_rating", ["rating"])
    .index("by_created_at", ["createdAt"]),

  // Activity log for audit trail
  activityLog: defineTable({
    entityType: v.union(v.literal("project"), v.literal("folder"), v.literal("flow"), v.literal("node"), v.literal("edge")),
    entityId: v.string(), // ID of the entity
    action: v.union(
      v.literal("create"), 
      v.literal("update"), 
      v.literal("delete"), 
      v.literal("restore"),
      v.literal("view"),
      v.literal("export"),
      v.literal("import"),
      v.literal("share")
    ),
    userId: v.optional(v.string()),
    timestamp: v.number(),
    details: v.optional(v.object({
      oldValues: v.optional(v.any()),
      newValues: v.optional(v.any()),
      changes: v.optional(v.array(v.string())), // List of changed fields
      ip: v.optional(v.string()),
      userAgent: v.optional(v.string()),
    })),
    metadata: v.optional(v.any()), // Additional context data
  }).index("by_entity_type", ["entityType"])
    .index("by_entity_id", ["entityId"])
    .index("by_action", ["action"])
    .index("by_user_id", ["userId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_entity_and_action", ["entityType", "action"]),
}); 