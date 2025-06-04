
"use server";
import { complianceCheck } from '@/ai/flows/compliance-check';
import type { ComplianceCheckInput, ComplianceCheckOutput } from '@/ai/flows/compliance-check-types';

export async function performComplianceCheck(input: ComplianceCheckInput): Promise<ComplianceCheckOutput | null> {
  try {
    // The complianceCheck function (wrapper for the flow) now directly returns ComplianceCheckOutput
    const result = await complianceCheck(input); 
    
    // Simulate saving the report or logging it
    // In a real app, you'd save `result` to a database and get a persistent reportId.
    // For now, we can add a temporary mock reportId if not already populated by the flow (though the prompt asks AI not to).
    const finalResult = {
      ...result,
      reportId: result.reportId || `mock_rep_${new Date().getTime()}` // Ensure a reportId for display
    };

    console.log("Compliance Check Performed, Report ID:", finalResult.reportId, "Overall Status:", finalResult.overallStatus);
    // console.log("Detailed AI Report:", JSON.stringify(finalResult, null, 2));


    return finalResult;
  } catch (error) {
    console.error("Error in performComplianceCheck server action:", error);
    // Return a structured error object that matches ComplianceCheckOutput for consistent handling
    return {
      overallStatus: "Error",
      summary: `Server action failed: ${error instanceof Error ? error.message : String(error)}`,
      detailedChecks: [],
      reportId: `err_rep_${new Date().getTime()}`
    };
  }
}

// Updated saveComplianceReport action
export async function saveComplianceReport(reportData: ComplianceCheckOutput): Promise<{success: boolean, reportId?: string, message?: string}> {
    console.log("Server Action: Attempting to save report (mock):", reportData.reportId);
    
    // Simulate database interaction delay
    await new Promise(resolve => setTimeout(resolve, 700));

    if (reportData.overallStatus === "Error" || !reportData.reportId || reportData.reportId.startsWith('err_')) {
        console.error("Failed to save report (mock - invalid reportId or error report)");
        return { success: false, message: "Cannot save an error report or a report with an invalid ID." };
    }

    // Simulate a potential save failure (e.g., 10% chance)
    // if (Math.random() < 0.1) {
    //   console.error("Mock save failure for report:", reportData.reportId);
    //   return { success: false, message: "A simulated error occurred while trying to save the report." };
    // }

    console.log("Mock Report saved successfully to database:", reportData.reportId);
    // In a real app, this would interact with Firestore or another DB
    // e.g., admin.firestore().collection('complianceReports').doc(reportData.reportId).set(reportData);
    
    return { 
        success: true, 
        reportId: reportData.reportId, 
        message: `Compliance report ${reportData.reportId} has been successfully saved (mock).` 
    };
}

