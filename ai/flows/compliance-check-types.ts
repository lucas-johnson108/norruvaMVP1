// src/ai/flows/compliance-check-types.ts
import { z } from 'zod';

export const ComplianceCheckInputSchema = z.object({
  productData: z.string().describe('The product data (in JSON format) to check for compliance.'),
  complianceStandards: z.string().describe('The compliance standards (text format, list of directives/regulations) to check against.'),
});
export type ComplianceCheckInput = z.infer<typeof ComplianceCheckInputSchema>;

export const DetailedCheckSchema = z.object({
  standard: z.string().describe("The specific standard or directive being checked (e.g., 'CE Marking (Directive 2014/30/EU – EMC')"),
  status: z.enum(['Compliant', 'Non-Compliant', 'Partially Compliant', 'Not Assessed', 'Requires Attention']).describe("Compliance status for this specific standard."),
  findings: z.string().describe('Detailed observations for this standard. If non-compliant, explain why. If compliant, briefly state how. If "Requires Attention", specify what needs clarification.'),
  evidence: z.array(z.string()).optional().describe('References to product data points (JSON paths like "compliance.CE" or "materials[0].recycled_content_percent") or document names that support the finding. If no direct evidence, use an empty array or a general statement.'),
  recommendations: z.string().optional().describe("Actionable recommendations if issues are found or for improvement.")
});

export const ComplianceCheckOutputSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Partially Compliant', 'Non-Compliant', 'Error'])
    .describe("The overall conformance status of the product data against all compliance standards. 'Error' if analysis cannot be performed."),
  summary: z.string().describe('A concise, high-level summary of the overall compliance findings. Mention key areas of concern if any.'),
  detailedChecks: z.array(DetailedCheckSchema).describe("An array of detailed checks for each standard evaluated."),
  reportId: z.string().optional().describe("A unique identifier for this generated report (can be assigned by the system later).")
});
export type ComplianceCheckOutput = z.infer<typeof ComplianceCheckOutputSchema>;
