import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Seed data based on existing mock data from Header.tsx
const mockFolders = [
  { name: 'Marketing', color: '#3b82f6', projectCount: 5 },
  { name: 'Sales', color: '#10b981', projectCount: 3 },
  { name: 'Product', color: '#f59e0b', projectCount: 8 },
  { name: 'Support', color: '#ef4444', projectCount: 2 },
];

const mockProjects = [
  { name: 'Lead Generation Funnel', folder: 'Marketing', status: 'active' as const },
  { name: 'Product Onboarding', folder: 'Product', status: 'draft' as const },
  { name: 'Sales Pipeline', folder: 'Sales', status: 'active' as const },
  { name: 'Customer Support Flow', folder: 'Support', status: 'archived' as const },
  { name: 'Email Marketing Campaign', folder: 'Marketing', status: 'active' as const },
  { name: 'Conversion Optimization', folder: 'Marketing', status: 'draft' as const },
  { name: 'User Onboarding', folder: 'Product', status: 'active' as const },
  { name: 'Feature Adoption', folder: 'Product', status: 'active' as const },
  { name: 'Churn Prevention', folder: 'Product', status: 'draft' as const },
  { name: 'Cross-sell Campaign', folder: 'Sales', status: 'active' as const },
  { name: 'Upsell Strategy', folder: 'Sales', status: 'draft' as const },
  { name: 'Help Center Flow', folder: 'Support', status: 'active' as const },
];

const sampleNodes = [
  {
    nodeId: 'landing-1',
    type: 'custom',
    position: { x: 100, y: 100 },
    data: { label: 'Landing Page', type: 'thankyou', color: '#6366F1' },
    style: { width: 105, height: 135 },
    selected: false,
    dragging: false,
  },
  {
    nodeId: 'cta-1',
    type: 'custom',
    position: { x: 300, y: 100 },
    data: { label: 'Call to Action', type: 'cta1', color: '#10B981' },
    style: { width: 105, height: 135 },
    selected: false,
    dragging: false,
  },
  {
    nodeId: 'checkout-1',
    type: 'custom',
    position: { x: 500, y: 100 },
    data: { label: 'Checkout', type: 'checkout', color: '#F59E0B' },
    style: { width: 105, height: 135 },
    selected: false,
    dragging: false,
  },
];

const sampleEdges = [
  {
    edgeId: 'edge-1',
    source: 'landing-1',
    target: 'cta-1',
    sourceHandle: undefined,
    targetHandle: undefined,
    type: undefined,
    animated: true,
    style: {
      stroke: '#2563eb',
      strokeWidth: 2,
      strokeDasharray: '6 4',
    },
    label: undefined,
  },
  {
    edgeId: 'edge-2',
    source: 'cta-1',
    target: 'checkout-1',
    sourceHandle: undefined,
    targetHandle: undefined,
    type: undefined,
    animated: true,
    style: {
      stroke: '#2563eb',
      strokeWidth: 2,
      strokeDasharray: '6 4',
    },
    label: undefined,
  },
];

export const seedDatabase = mutation({
  args: {},
  returns: v.object({
    foldersCreated: v.number(),
    projectsCreated: v.number(),
    flowsCreated: v.number(),
    nodesCreated: v.number(),
    edgesCreated: v.number(),
    message: v.string(),
  }),
  handler: async (ctx) => {
    console.log('🌱 Starting database seeding...');
    
    try {
      // Check if data already exists
      const existingFolders = await ctx.db.query("folders").collect();
      if (existingFolders.length > 0) {
        return {
          foldersCreated: 0,
          projectsCreated: 0,
          flowsCreated: 0,
          nodesCreated: 0,
          edgesCreated: 0,
          message: "Database already seeded. Use resetAndSeed to recreate data.",
        };
      }

      // Create folders
      console.log('📁 Creating folders...');
      const folderIds: Record<string, any> = {};
      for (const folder of mockFolders) {
                 const folderId = await ctx.db.insert("folders", {
           name: folder.name,
           color: folder.color,
           icon: undefined,
           parentFolderId: undefined,
           createdAt: Date.now(),
           updatedAt: Date.now(),
         });
        folderIds[folder.name] = folderId;
        console.log(`✅ Created folder: ${folder.name}`);
      }

      // Create projects and flows
      console.log('📋 Creating projects and flows...');
      let projectsCreated = 0;
      let flowsCreated = 0;
      let nodesCreated = 0;
      let edgesCreated = 0;

      for (const project of mockProjects) {
        // Create project
        const projectId = await ctx.db.insert("projects", {
          name: project.name,
          description: `Sample project for ${project.folder} team`,
          folder: project.folder.toLowerCase(),
          status: project.status,
          createdBy: undefined,
          lastModified: Date.now(),
          settings: {
            snapToGrid: true,
            showMiniMap: true,
            canvasBackground: '#ffffff',
            theme: 'light' as const,
          },
        });
        projectsCreated++;
        console.log(`✅ Created project: ${project.name}`);

        // Create a flow for each project
        const flowId = await ctx.db.insert("flows", {
          projectId,
          name: `${project.name} Flow`,
          description: `Main flow for ${project.name}`,
          version: 1,
          isActive: true,
          viewport: { x: 0, y: 0, zoom: 1 },
          createdBy: undefined,
          lastModified: Date.now(),
        });
        flowsCreated++;

        // Add sample nodes for the first few projects
        if (projectsCreated <= 3) {
          for (const node of sampleNodes) {
                         await ctx.db.insert("nodes", {
               flowId,
               nodeId: `${node.nodeId}-${projectsCreated}`,
               type: node.type,
               position: {
                 x: node.position.x + (projectsCreated - 1) * 50, // Offset for variety
                 y: node.position.y + (projectsCreated - 1) * 30,
               },
               data: node.data,
               style: {
                 width: node.style.width,
                 height: node.style.height,
                 backgroundColor: undefined,
                 borderColor: undefined,
               },
               selected: node.selected,
               dragging: node.dragging,
               createdAt: Date.now(),
               updatedAt: Date.now(),
             });
            nodesCreated++;
          }

          // Add sample edges
          for (const edge of sampleEdges) {
                         await ctx.db.insert("edges", {
               flowId,
               edgeId: `${edge.edgeId}-${projectsCreated}`,
               source: `${edge.source}-${projectsCreated}`,
               target: `${edge.target}-${projectsCreated}`,
               sourceHandle: edge.sourceHandle,
               targetHandle: edge.targetHandle,
               type: edge.type,
               animated: edge.animated,
               style: {
                 stroke: edge.style.stroke,
                 strokeWidth: edge.style.strokeWidth,
                 strokeDasharray: edge.style.strokeDasharray,
               },
               label: edge.label,
               createdAt: Date.now(),
               updatedAt: Date.now(),
             });
            edgesCreated++;
          }
        }
      }

      console.log('🎉 Database seeding completed!');
      return {
        foldersCreated: mockFolders.length,
        projectsCreated,
        flowsCreated,
        nodesCreated,
        edgesCreated,
        message: `Successfully seeded database with ${mockFolders.length} folders, ${projectsCreated} projects, ${flowsCreated} flows, ${nodesCreated} nodes, and ${edgesCreated} edges.`,
      };

    } catch (error) {
      console.error('❌ Error seeding database:', error);
      throw new Error(`Database seeding failed: ${error}`);
    }
  },
});

export const clearDatabase = mutation({
  args: {},
  returns: v.object({
    deletedRecords: v.number(),
    message: v.string(),
  }),
  handler: async (ctx) => {
    console.log('🗑️ Clearing database...');
    
    try {
      // Delete existing data (in reverse dependency order)
      const edges = await ctx.db.query("edges").collect();
      const nodes = await ctx.db.query("nodes").collect();
      const flows = await ctx.db.query("flows").collect();
      const projects = await ctx.db.query("projects").collect();
      const folders = await ctx.db.query("folders").collect();
      
      let deletedRecords = 0;
      
      // Delete edges
      for (const edge of edges) {
        await ctx.db.delete(edge._id);
        deletedRecords++;
      }
      
      // Delete nodes
      for (const node of nodes) {
        await ctx.db.delete(node._id);
        deletedRecords++;
      }
      
      // Delete flows
      for (const flow of flows) {
        await ctx.db.delete(flow._id);
        deletedRecords++;
      }
      
      // Delete projects
      for (const project of projects) {
        await ctx.db.delete(project._id);
        deletedRecords++;
      }
      
      // Delete folders
      for (const folder of folders) {
        await ctx.db.delete(folder._id);
        deletedRecords++;
      }
      
      console.log(`🗑️ Deleted ${deletedRecords} existing records`);
      
      return {
        deletedRecords,
        message: `Successfully cleared ${deletedRecords} records from database.`,
      };
      
    } catch (error) {
      console.error('❌ Error clearing database:', error);
      throw new Error(`Database clearing failed: ${error}`);
    }
  },
});

export const getDatabaseStats = mutation({
  args: {},
  returns: v.object({
    folders: v.number(),
    projects: v.number(),
    flows: v.number(),
    nodes: v.number(),
    edges: v.number(),
    exports: v.number(),
  }),
  handler: async (ctx) => {
    const [folders, projects, flows, nodes, edges, exports] = await Promise.all([
      ctx.db.query("folders").collect(),
      ctx.db.query("projects").collect(),
      ctx.db.query("flows").collect(),
      ctx.db.query("nodes").collect(),
      ctx.db.query("edges").collect(),
      ctx.db.query("exports").collect(),
    ]);

    return {
      folders: folders.length,
      projects: projects.length,
      flows: flows.length,
      nodes: nodes.length,
      edges: edges.length,
      exports: exports.length,
    };
  },
}); 