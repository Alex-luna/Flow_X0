import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Projects table for managing different funnel projects
  projects: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    folder: v.string(),
    status: v.union(v.literal("active"), v.literal("archived"), v.literal("draft")),
    createdBy: v.optional(v.string()), // User ID when auth is implemented
    lastModified: v.number(), // timestamp
    settings: v.optional(v.object({
      snapToGrid: v.boolean(),
      showMiniMap: v.boolean(),
      canvasBackground: v.string(),
      theme: v.union(v.literal("light"), v.literal("dark")),
    })),
  }).index("by_folder", ["folder"])
    .index("by_status", ["status"])
    .index("by_last_modified", ["lastModified"]),

  // Flows table for storing canvas state (nodes + edges)
  flows: defineTable({
    projectId: v.id("projects"),
    name: v.string(),
    description: v.optional(v.string()),
    version: v.number(), // For versioning support
    isActive: v.boolean(), // Current active flow for the project
    viewport: v.object({
      x: v.number(),
      y: v.number(),
      zoom: v.number(),
    }),
    createdBy: v.optional(v.string()),
    lastModified: v.number(),
  }).index("by_project_id", ["projectId"])
    .index("by_project_id_and_active", ["projectId", "isActive"])
    .index("by_last_modified", ["lastModified"]),

  // Nodes table for individual flow elements
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
    }),
    style: v.optional(v.object({
      width: v.optional(v.number()),
      height: v.optional(v.number()),
      backgroundColor: v.optional(v.string()),
      borderColor: v.optional(v.string()),
    })),
    selected: v.optional(v.boolean()),
    dragging: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_flow_id", ["flowId"])
    .index("by_flow_id_and_node_id", ["flowId", "nodeId"])
    .index("by_updated_at", ["updatedAt"]),

  // Edges table for connections between nodes
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
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_flow_id", ["flowId"])
    .index("by_flow_id_and_edge_id", ["flowId", "edgeId"])
    .index("by_source", ["source"])
    .index("by_target", ["target"])
    .index("by_source_and_target", ["source", "target"])
    .index("by_updated_at", ["updatedAt"]),

  // Export/Import history for tracking
  exports: defineTable({
    projectId: v.id("projects"),
    flowId: v.id("flows"),
    exportType: v.union(v.literal("pdf"), v.literal("png"), v.literal("jpg"), v.literal("json")),
    fileName: v.string(),
    fileSize: v.optional(v.number()),
    exportedBy: v.optional(v.string()),
    exportedAt: v.number(),
    success: v.boolean(),
    errorMessage: v.optional(v.string()),
  }).index("by_project_id", ["projectId"])
    .index("by_flow_id", ["flowId"])
    .index("by_exported_at", ["exportedAt"]),

  // Folders for project organization
  folders: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    parentFolderId: v.optional(v.id("folders")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_parent_folder_id", ["parentFolderId"])
    .index("by_name", ["name"])
    .index("by_created_at", ["createdAt"]),
}); 