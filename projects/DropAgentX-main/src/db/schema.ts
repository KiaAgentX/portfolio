import { pgTable, serial, text, integer, timestamp, json, numeric } from 'drizzle-orm/pg-core';

export const analyses = pgTable('analyses', {
  id: serial('id').primaryKey(),
  repoUrl: text('repo_url').notNull(),
  repoName: text('repo_name').notNull(),
  owner: text('owner').notNull(),
  description: text('description'),
  language: text('language').default('Python'),
  totalFiles: integer('total_files').notNull(),
  totalLines: integer('total_lines').notNull(),
  codeLines: integer('code_lines').notNull(),
  commentLines: integer('comment_lines').notNull(),
  blankLines: integer('blank_lines').notNull(),
  estimatedValueUsd: integer('estimated_value_usd').notNull(),
  marketDevCostRangeUsd: text('market_dev_cost_range_usd').notNull(),
  commercialSaleValUsd: text('commercial_sale_val_usd').notNull(),
  qualityScore: integer('quality_score').default(88),
  securityScore: integer('security_score').default(82),
  architectureScore: integer('architecture_score').default(90),
  hasFeatures: json('has_features').$type<Array<{
    category: string;
    titleFa: string;
    titleEn: string;
    descriptionFa: string;
    files: string[];
    importance: 'high' | 'medium' | 'critical';
  }>>(),
  lacksFeatures: json('lacks_features').$type<Array<{
    category: string;
    titleFa: string;
    titleEn: string;
    descriptionFa: string;
    impactFa: string;
    recommendationFa: string;
    severity: 'high' | 'medium' | 'critical';
  }>>(),
  techStack: json('tech_stack').$type<Array<{
    name: string;
    category: string;
    percentage: number;
    color: string;
  }>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const analyzedFiles = pgTable('analyzed_files', {
  id: serial('id').primaryKey(),
  analysisId: integer('analysis_id').references(() => analyses.id, { onDelete: 'cascade' }),
  path: text('path').notNull(),
  name: text('name').notNull(),
  lines: integer('lines').notNull(),
  codeLines: integer('code_lines').notNull(),
  commentLines: integer('comment_lines').notNull(),
  blankLines: integer('blank_lines').notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  category: text('category').notNull(),
  complexity: text('complexity').notNull(),
  ratePerLoc: integer('rate_per_loc').notNull(),
  estimatedValueUsd: integer('estimated_value_usd').notNull(),
  purposeFa: text('purpose_fa'),
  status: text('status').default('implemented'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
