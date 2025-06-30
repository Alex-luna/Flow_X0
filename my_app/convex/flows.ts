import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Mutation to create a new flow for a project
export const createFlow = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.string(),
    description: v.optional(v.string()),
  },
  returns: v.id("flows"),
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Check if project exists
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Deactivate any existing active flows for this project
    const existingFlows = await ctx.db
      .query("flows")
      .withIndex("by_project_id_and_active", (q) => 
        q.eq("projectId", args.projectId).eq("isActive", true))
      .collect();

    for (const flow of existingFlows) {
      await ctx.db.patch(flow._id, { isActive: false });
    }

    // Create new flow
    const flowId = await ctx.db.insert("flows", {
      projectId: args.projectId,
      name: args.name,
      description: args.description,
      version: 1,
      isActive: true,
      viewport: { x: 0, y: 0, zoom: 1 },
      lastModified: now,
    });

    return flowId;
  },
});

// Query to get active flow for a project
export const getActiveFlow = query({
  args: { projectId: v.id("projects") },
  returns: v.union(
    v.object({
      _id: v.id("flows"),
      _creationTime: v.number(),
      projectId: v.id("projects"),
      name: v.string(),
      description: v.optional(v.string()),
      version: v.number(),
      isActive: v.boolean(),
      viewport: v.object({
        x: v.number(),
        y: v.number(),
        zoom: v.number(),
      }),
      createdBy: v.optional(v.string()),
      lastModified: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const flow = await ctx.db
      .query("flows")
      .withIndex("by_project_id_and_active", (q) => 
        q.eq("projectId", args.projectId).eq("isActive", true))
      .unique();
    
    return flow;
  },
});

// Query to get all nodes for a flow  
export const getFlowNodes = query({
  args: { flowId: v.id("flows") },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const nodes = await ctx.db
      .query("nodes")
      .withIndex("by_flow_id", (q) => q.eq("flowId", args.flowId))
      .order("asc")
      .collect();
    
    return nodes;
  },
});

// Query to get all edges for a flow
export const getFlowEdges = query({
  args: { flowId: v.id("flows") },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const edges = await ctx.db
      .query("edges")
      .withIndex("by_flow_id", (q) => q.eq("flowId", args.flowId))
      .order("asc")
      .collect();
    
    return edges;
  },
});

// Query to get complete flow data (nodes + edges + flow info) - simplified version
export const getCompleteFlowSimple = query({
  args: { projectId: v.id("projects") },
  returns: v.union(
    v.object({
      flowId: v.id("flows"),
      name: v.string(),
      viewport: v.object({
        x: v.number(),
        y: v.number(),
        zoom: v.number(),
      }),
      lastModified: v.number(),
      nodes: v.array(v.object({
        id: v.string(),
        type: v.string(),
        position: v.object({
          x: v.number(),
          y: v.number(),
        }),
        data: v.object({
          label: v.string(),
          type: v.string(),
          color: v.optional(v.string()),
          properties: v.optional(v.object({
            url: v.optional(v.string()),
            urlPreview: v.optional(v.object({
              title: v.optional(v.string()),
              description: v.optional(v.string()),
              thumbnail: v.optional(v.string()),
              favicon: v.optional(v.string()),
              lastFetched: v.optional(v.number()),
              fetchError: v.optional(v.string()),
            })),
            image: v.optional(v.object({
              url: v.optional(v.string()),
              uploadedFile: v.optional(v.string()),
              thumbnail: v.optional(v.string()),
              alt: v.optional(v.string()),
              caption: v.optional(v.string()),
              dimensions: v.optional(v.object({
                width: v.number(),
                height: v.number(),
              })),
              fileSize: v.optional(v.number()),
              mimeType: v.optional(v.string()),
              lastModified: v.optional(v.number()),
            })),
          })),
        }),
      })),
      edges: v.array(v.object({
        id: v.string(),
        source: v.string(),
        target: v.string(),
        sourceHandle: v.optional(v.string()),
        targetHandle: v.optional(v.string()),
        animated: v.optional(v.boolean()),
      })),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    // Get active flow
    const flow = await ctx.db
      .query("flows")
      .withIndex("by_project_id_and_active", (q) => 
        q.eq("projectId", args.projectId).eq("isActive", true))
      .unique();
    
    if (!flow) {
      return null;
    }

    // Get nodes
    const nodes = await ctx.db
      .query("nodes")
      .withIndex("by_flow_id", (q) => q.eq("flowId", flow._id))
      .collect();
    
    // Get edges
    const edges = await ctx.db
      .query("edges")
      .withIndex("by_flow_id", (q) => q.eq("flowId", flow._id))
      .collect();

    return {
      flowId: flow._id,
      name: flow.name,
      viewport: flow.viewport,
      lastModified: flow.lastModified,
      nodes: nodes.map(node => ({
        id: node.nodeId,
        type: node.type,
        position: node.position,
        data: {
          label: node.data.label,
          type: node.data.type,
          color: node.data.color,
          properties: node.data.properties,
        },
      })),
      edges: edges.map(edge => ({
        id: edge.edgeId,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        animated: edge.animated,
      })),
    };
  },
});

// Mutation to save/update a node
export const saveNode = mutation({
  args: {
    flowId: v.id("flows"),
    nodeId: v.string(),
    type: v.string(),
    position: v.object({
      x: v.number(),
      y: v.number(),
    }),
    data: v.object({
      label: v.string(),
      type: v.string(),
      color: v.optional(v.string()),
      description: v.optional(v.string()),
      properties: v.optional(v.object({
        url: v.optional(v.string()),
        redirectUrl: v.optional(v.string()),
        conversionGoal: v.optional(v.string()),
        // URL Preview properties
        urlPreview: v.optional(v.object({
          title: v.optional(v.string()),
          description: v.optional(v.string()),
          thumbnail: v.optional(v.string()),
          favicon: v.optional(v.string()),
          lastFetched: v.optional(v.number()),
          fetchError: v.optional(v.string()),
        })),
        // Image properties
        image: v.optional(v.object({
          url: v.optional(v.string()),
          uploadedFile: v.optional(v.string()),
          thumbnail: v.optional(v.string()),
          alt: v.optional(v.string()),
          caption: v.optional(v.string()),
          dimensions: v.optional(v.object({
            width: v.number(),
            height: v.number(),
          })),
          fileSize: v.optional(v.number()),
          mimeType: v.optional(v.string()),
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
    })),
    selected: v.optional(v.boolean()),
    dragging: v.optional(v.boolean()),
  },
  returns: v.id("nodes"),
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Check if node already exists
    const existingNode = await ctx.db
      .query("nodes")
      .withIndex("by_flow_id_and_node_id", (q) => 
        q.eq("flowId", args.flowId).eq("nodeId", args.nodeId))
      .unique();
    
    if (existingNode) {
      // Update existing node
      await ctx.db.patch(existingNode._id, {
        type: args.type,
        position: args.position,
        data: args.data,
        style: args.style,
        selected: args.selected,
        dragging: args.dragging,
        updatedAt: now,
      });
      
      return existingNode._id;
    } else {
      // Create new node
      const nodeId = await ctx.db.insert("nodes", {
        flowId: args.flowId,
        nodeId: args.nodeId,
        type: args.type,
        position: args.position,
        data: args.data,
        style: args.style,
        selected: args.selected,
        dragging: args.dragging,
        createdAt: now,
        updatedAt: now,
      });
      
      return nodeId;
    }
  },
});

// Mutation to save/update an edge
export const saveEdge = mutation({
  args: {
    flowId: v.id("flows"),
    edgeId: v.string(),
    source: v.string(),
    target: v.string(),
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
  },
  returns: v.id("edges"),
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Check if edge already exists
    const existingEdge = await ctx.db
      .query("edges")
      .withIndex("by_flow_id_and_edge_id", (q) => 
        q.eq("flowId", args.flowId).eq("edgeId", args.edgeId))
      .unique();
    
    if (existingEdge) {
      // Update existing edge
      await ctx.db.patch(existingEdge._id, {
        source: args.source,
        target: args.target,
        sourceHandle: args.sourceHandle,
        targetHandle: args.targetHandle,
        type: args.type,
        animated: args.animated,
        style: args.style,
        label: args.label,
        labelStyle: args.labelStyle,
        labelBgStyle: args.labelBgStyle,
        updatedAt: now,
      });
      
      return existingEdge._id;
    } else {
      // Create new edge
      const edgeId = await ctx.db.insert("edges", {
        flowId: args.flowId,
        edgeId: args.edgeId,
        source: args.source,
        target: args.target,
        sourceHandle: args.sourceHandle,
        targetHandle: args.targetHandle,
        type: args.type,
        animated: args.animated,
        style: args.style,
        label: args.label,
        labelStyle: args.labelStyle,
        labelBgStyle: args.labelBgStyle,
        createdAt: now,
        updatedAt: now,
      });
      
      return edgeId;
    }
  },
});

// Mutation to delete a node
export const deleteNode = mutation({
  args: { 
    flowId: v.id("flows"),
    nodeId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Find and delete the node
    const node = await ctx.db
      .query("nodes")
      .withIndex("by_flow_id_and_node_id", (q) => 
        q.eq("flowId", args.flowId).eq("nodeId", args.nodeId))
      .unique();
    
    if (node) {
      await ctx.db.delete(node._id);
    }

    // Delete all edges connected to this node
    const connectedEdges = await ctx.db
      .query("edges")
      .withIndex("by_flow_id", (q) => q.eq("flowId", args.flowId))
      .filter((q) => 
        q.or(
          q.eq(q.field("source"), args.nodeId),
          q.eq(q.field("target"), args.nodeId)
        )
      )
      .collect();
    
    for (const edge of connectedEdges) {
      await ctx.db.delete(edge._id);
    }

    return null;
  },
});

// Mutation to delete an edge
export const deleteEdge = mutation({
  args: { 
    flowId: v.id("flows"),
    edgeId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const edge = await ctx.db
      .query("edges")
      .withIndex("by_flow_id_and_edge_id", (q) => 
        q.eq("flowId", args.flowId).eq("edgeId", args.edgeId))
      .unique();
    
    if (edge) {
      await ctx.db.delete(edge._id);
    }

    return null;
  },
});

// Mutation to update flow viewport
export const updateFlowViewport = mutation({
  args: {
    flowId: v.id("flows"),
    viewport: v.object({
      x: v.number(),
      y: v.number(),
      zoom: v.number(),
    }),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.flowId, {
      viewport: args.viewport,
      lastModified: Date.now(),
    });

    return null;
  },
});

// Mutation to batch save flow data (nodes + edges + viewport)
export const saveBatchFlowData = mutation({
  args: {
    flowId: v.id("flows"),
    nodes: v.array(v.object({
      nodeId: v.string(),
      type: v.string(),
      position: v.object({
        x: v.number(),
        y: v.number(),
      }),
      data: v.object({
        label: v.string(),
        type: v.string(),
        color: v.optional(v.string()),
        description: v.optional(v.string()),
        properties: v.optional(v.object({
          url: v.optional(v.string()),
          redirectUrl: v.optional(v.string()),
          conversionGoal: v.optional(v.string()),
          // URL Preview properties
          urlPreview: v.optional(v.object({
            title: v.optional(v.string()),
            description: v.optional(v.string()),
            thumbnail: v.optional(v.string()),
            favicon: v.optional(v.string()),
            lastFetched: v.optional(v.number()),
            fetchError: v.optional(v.string()),
          })),
          // Image properties
          image: v.optional(v.object({
            url: v.optional(v.string()),
            uploadedFile: v.optional(v.string()),
            thumbnail: v.optional(v.string()),
            alt: v.optional(v.string()),
            caption: v.optional(v.string()),
            dimensions: v.optional(v.object({
              width: v.number(),
              height: v.number(),
            })),
            fileSize: v.optional(v.number()),
            mimeType: v.optional(v.string()),
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
      })),
      selected: v.optional(v.boolean()),
      dragging: v.optional(v.boolean()),
    })),
    edges: v.array(v.object({
      edgeId: v.string(),
      source: v.string(),
      target: v.string(),
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
    })),
    viewport: v.optional(v.object({
      x: v.number(),
      y: v.number(),
      zoom: v.number(),
    })),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const now = Date.now();

    // Update flow viewport if provided
    if (args.viewport) {
      await ctx.db.patch(args.flowId, {
        viewport: args.viewport,
        lastModified: now,
      });
    }

    // Get existing nodes and edges
    const existingNodes = await ctx.db
      .query("nodes")
      .withIndex("by_flow_id", (q) => q.eq("flowId", args.flowId))
      .collect();

    const existingEdges = await ctx.db
      .query("edges")
      .withIndex("by_flow_id", (q) => q.eq("flowId", args.flowId))
      .collect();

    // Track which nodes and edges to keep
    const nodesToKeep = new Set(args.nodes.map(n => n.nodeId));
    const edgesToKeep = new Set(args.edges.map(e => e.edgeId));

    // Delete nodes that are no longer in the flow
    for (const node of existingNodes) {
      if (!nodesToKeep.has(node.nodeId)) {
        await ctx.db.delete(node._id);
      }
    }

    // Delete edges that are no longer in the flow
    for (const edge of existingEdges) {
      if (!edgesToKeep.has(edge.edgeId)) {
        await ctx.db.delete(edge._id);
      }
    }

    // Save/update all nodes
    for (const node of args.nodes) {
      const existingNode = existingNodes.find(n => n.nodeId === node.nodeId);
      
      if (existingNode) {
        await ctx.db.patch(existingNode._id, {
          type: node.type,
          position: node.position,
          data: node.data,
          style: node.style,
          selected: node.selected,
          dragging: node.dragging,
          updatedAt: now,
        });
      } else {
        await ctx.db.insert("nodes", {
          flowId: args.flowId,
          nodeId: node.nodeId,
          type: node.type,
          position: node.position,
          data: node.data,
          style: node.style,
          selected: node.selected,
          dragging: node.dragging,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    // Save/update all edges
    for (const edge of args.edges) {
      const existingEdge = existingEdges.find(e => e.edgeId === edge.edgeId);
      
      if (existingEdge) {
        await ctx.db.patch(existingEdge._id, {
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle,
          type: edge.type,
          animated: edge.animated,
          style: edge.style,
          label: edge.label,
          updatedAt: now,
        });
      } else {
        await ctx.db.insert("edges", {
          flowId: args.flowId,
          edgeId: edge.edgeId,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle,
          type: edge.type,
          animated: edge.animated,
          style: edge.style,
          label: edge.label,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    return null;
  },
});