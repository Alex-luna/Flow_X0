import { v } from "convex/values";

// Validation result type
export type ValidationResult = {
  isValid: boolean;
  error?: string;
};

// Validation constants
const FOLDER_NAME_MAX_LENGTH = 100;
const PROJECT_NAME_MAX_LENGTH = 200;
const DESCRIPTION_MAX_LENGTH = 1000;
const TAG_MAX_LENGTH = 50;
const MAX_TAGS_COUNT = 20;
const MAX_FOLDER_DEPTH = 10;

// Folder name validation
export const validateFolderName = (name: string): ValidationResult => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: "Folder name cannot be empty" };
  }
  
  const trimmedName = name.trim();
  
  if (trimmedName.length > FOLDER_NAME_MAX_LENGTH) {
    return { isValid: false, error: `Folder name cannot exceed ${FOLDER_NAME_MAX_LENGTH} characters` };
  }
  
  if (trimmedName.includes("/") || trimmedName.includes("\\")) {
    return { isValid: false, error: "Folder name cannot contain slashes" };
  }
  
  const invalidChars = /[<>:"|?*]/;
  if (invalidChars.test(trimmedName)) {
    return { isValid: false, error: "Folder name contains invalid characters" };
  }
  
  // Check for reserved names
  const reservedNames = ["CON", "PRN", "AUX", "NUL", "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9", "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9"];
  if (reservedNames.includes(trimmedName.toUpperCase())) {
    return { isValid: false, error: "Folder name cannot be a reserved system name" };
  }
  
  // Check for names that start or end with dots or spaces
  if (trimmedName.startsWith(".") || trimmedName.endsWith(".") || trimmedName.endsWith(" ")) {
    return { isValid: false, error: "Folder name cannot start or end with dots or spaces" };
  }
  
  return { isValid: true };
};

// Project name validation
export const validateProjectName = (name: string): ValidationResult => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: "Project name cannot be empty" };
  }
  
  const trimmedName = name.trim();
  
  if (trimmedName.length > PROJECT_NAME_MAX_LENGTH) {
    return { isValid: false, error: `Project name cannot exceed ${PROJECT_NAME_MAX_LENGTH} characters` };
  }
  
  if (trimmedName.length < 3) {
    return { isValid: false, error: "Project name must be at least 3 characters long" };
  }
  
  return { isValid: true };
};

// Description validation
export const validateDescription = (description?: string): ValidationResult => {
  if (!description) {
    return { isValid: true }; // Description is optional
  }
  
  if (description.length > DESCRIPTION_MAX_LENGTH) {
    return { isValid: false, error: `Description cannot exceed ${DESCRIPTION_MAX_LENGTH} characters` };
  }
  
  return { isValid: true };
};

// Color validation (hex color)
export const validateColor = (color?: string): ValidationResult => {
  if (!color) {
    return { isValid: true }; // Color is optional
  }
  
  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  if (!hexColorRegex.test(color)) {
    return { isValid: false, error: "Color must be a valid hex color (e.g., #FF5733 or #F57)" };
  }
  
  return { isValid: true };
};

// Tags validation
export const validateTags = (tags?: string[]): ValidationResult => {
  if (!tags || tags.length === 0) {
    return { isValid: true }; // Tags are optional
  }
  
  if (tags.length > MAX_TAGS_COUNT) {
    return { isValid: false, error: `Cannot have more than ${MAX_TAGS_COUNT} tags` };
  }
  
  for (const tag of tags) {
    if (!tag || tag.trim().length === 0) {
      return { isValid: false, error: "Tags cannot be empty" };
    }
    
    if (tag.trim().length > TAG_MAX_LENGTH) {
      return { isValid: false, error: `Each tag cannot exceed ${TAG_MAX_LENGTH} characters` };
    }
    
    if (tag.includes(",") || tag.includes(";")) {
      return { isValid: false, error: "Tags cannot contain commas or semicolons" };
    }
  }
  
  // Check for duplicate tags
  const uniqueTags = new Set(tags.map(tag => tag.trim().toLowerCase()));
  if (uniqueTags.size !== tags.length) {
    return { isValid: false, error: "Duplicate tags are not allowed" };
  }
  
  return { isValid: true };
};

// URL validation
export const validateUrl = (url?: string): ValidationResult => {
  if (!url) {
    return { isValid: true }; // URL is optional
  }
  
  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, error: "Invalid URL format" };
  }
};

// Priority validation
export const validatePriority = (priority?: "low" | "medium" | "high"): ValidationResult => {
  if (!priority) {
    return { isValid: true }; // Priority is optional
  }
  
  const validPriorities = ["low", "medium", "high"];
  if (!validPriorities.includes(priority)) {
    return { isValid: false, error: "Priority must be low, medium, or high" };
  }
  
  return { isValid: true };
};

// Status validation
export const validateStatus = (status: "active" | "archived" | "draft"): ValidationResult => {
  const validStatuses = ["active", "archived", "draft"];
  if (!validStatuses.includes(status)) {
    return { isValid: false, error: "Status must be active, archived, or draft" };
  }
  
  return { isValid: true };
};

// Theme validation
export const validateTheme = (theme?: "light" | "dark"): ValidationResult => {
  if (!theme) {
    return { isValid: true }; // Theme is optional
  }
  
  const validThemes = ["light", "dark"];
  if (!validThemes.includes(theme)) {
    return { isValid: false, error: "Theme must be light or dark" };
  }
  
  return { isValid: true };
};

// Folder depth validation
export const validateFolderDepth = (depth: number): ValidationResult => {
  if (depth < 0) {
    return { isValid: false, error: "Folder depth cannot be negative" };
  }
  
  if (depth > MAX_FOLDER_DEPTH) {
    return { isValid: false, error: `Maximum folder depth of ${MAX_FOLDER_DEPTH} exceeded` };
  }
  
  return { isValid: true };
};

// Date validation
export const validateDate = (date?: number): ValidationResult => {
  if (!date) {
    return { isValid: true }; // Date is optional
  }
  
  if (date < 0) {
    return { isValid: false, error: "Date cannot be negative" };
  }
  
  const now = Date.now();
  const oneYearFromNow = now + (365 * 24 * 60 * 60 * 1000);
  
  if (date > oneYearFromNow) {
    return { isValid: false, error: "Date cannot be more than one year in the future" };
  }
  
  return { isValid: true };
};

// Canvas background validation
export const validateCanvasBackground = (background?: string): ValidationResult => {
  if (!background) {
    return { isValid: true }; // Background is optional
  }
  
  // Check if it's a valid hex color
  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  if (hexColorRegex.test(background)) {
    return { isValid: true };
  }
  
  // Check if it's a valid CSS color name
  const cssColors = [
    "white", "black", "red", "green", "blue", "yellow", "cyan", "magenta",
    "silver", "gray", "maroon", "olive", "lime", "aqua", "teal", "navy",
    "fuchsia", "purple", "transparent"
  ];
  
  if (cssColors.includes(background.toLowerCase())) {
    return { isValid: true };
  }
  
  return { isValid: false, error: "Canvas background must be a valid hex color or CSS color name" };
};

// Auto-save interval validation
export const validateAutoSaveInterval = (interval?: number): ValidationResult => {
  if (!interval) {
    return { isValid: true }; // Interval is optional
  }
  
  const MIN_INTERVAL = 1000; // 1 second
  const MAX_INTERVAL = 300000; // 5 minutes
  
  if (interval < MIN_INTERVAL) {
    return { isValid: false, error: `Auto-save interval cannot be less than ${MIN_INTERVAL}ms` };
  }
  
  if (interval > MAX_INTERVAL) {
    return { isValid: false, error: `Auto-save interval cannot be more than ${MAX_INTERVAL}ms` };
  }
  
  return { isValid: true };
};

// Composite validation for folder creation
export const validateFolderCreation = (data: {
  name: string;
  description?: string;
  color?: string;
  parentDepth?: number;
}): ValidationResult => {
  const nameValidation = validateFolderName(data.name);
  if (!nameValidation.isValid) return nameValidation;
  
  const descriptionValidation = validateDescription(data.description);
  if (!descriptionValidation.isValid) return descriptionValidation;
  
  const colorValidation = validateColor(data.color);
  if (!colorValidation.isValid) return colorValidation;
  
  if (data.parentDepth !== undefined) {
    const depthValidation = validateFolderDepth(data.parentDepth + 1);
    if (!depthValidation.isValid) return depthValidation;
  }
  
  return { isValid: true };
};

// Composite validation for project creation
export const validateProjectCreation = (data: {
  name: string;
  description?: string;
  tags?: string[];
  priority?: "low" | "medium" | "high";
  dueDate?: number;
  settings?: {
    snapToGrid?: boolean;
    showMiniMap?: boolean;
    canvasBackground?: string;
    theme?: "light" | "dark";
    autoSaveInterval?: number;
  };
}): ValidationResult => {
  const nameValidation = validateProjectName(data.name);
  if (!nameValidation.isValid) return nameValidation;
  
  const descriptionValidation = validateDescription(data.description);
  if (!descriptionValidation.isValid) return descriptionValidation;
  
  const tagsValidation = validateTags(data.tags);
  if (!tagsValidation.isValid) return tagsValidation;
  
  const priorityValidation = validatePriority(data.priority);
  if (!priorityValidation.isValid) return priorityValidation;
  
  const dateValidation = validateDate(data.dueDate);
  if (!dateValidation.isValid) return dateValidation;
  
  if (data.settings) {
    const backgroundValidation = validateCanvasBackground(data.settings.canvasBackground);
    if (!backgroundValidation.isValid) return backgroundValidation;
    
    const themeValidation = validateTheme(data.settings.theme);
    if (!themeValidation.isValid) return themeValidation;
    
    const intervalValidation = validateAutoSaveInterval(data.settings.autoSaveInterval);
    if (!intervalValidation.isValid) return intervalValidation;
  }
  
  return { isValid: true };
};

// Helper function to sanitize string inputs
export const sanitizeString = (input: string): string => {
  return input.trim().replace(/\s+/g, ' ');
};

// Helper function to normalize tags
export const normalizeTags = (tags: string[]): string[] => {
  return tags
    .map(tag => sanitizeString(tag))
    .filter(tag => tag.length > 0)
    .map(tag => tag.toLowerCase());
};

// Export validation constants for use in other files
export const VALIDATION_CONSTANTS = {
  FOLDER_NAME_MAX_LENGTH,
  PROJECT_NAME_MAX_LENGTH,
  DESCRIPTION_MAX_LENGTH,
  TAG_MAX_LENGTH,
  MAX_TAGS_COUNT,
  MAX_FOLDER_DEPTH,
};

export default {
  validateFolderName,
  validateProjectName,
  validateDescription,
  validateColor,
  validateTags,
  validateUrl,
  validatePriority,
  validateStatus,
  validateTheme,
  validateFolderDepth,
  validateDate,
  validateCanvasBackground,
  validateAutoSaveInterval,
  validateFolderCreation,
  validateProjectCreation,
  sanitizeString,
  normalizeTags,
  VALIDATION_CONSTANTS,
}; 