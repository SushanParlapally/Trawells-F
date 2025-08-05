import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import type {
  ReportData,
  TravelRequestReportItem,
  ExportOptions,
} from '../types/reporting';

export class ExportUtils {
  /**
   * Export report data to PDF
   */
  static exportToPDF(reportData: ReportData, options: ExportOptions): void {
    const doc = new jsPDF();
    const fileName =
      options.fileName ||
      `travel-report-${new Date().toISOString().split('T')[0]}.pdf`;

    // Add title
    doc.setFontSize(20);
    doc.text('Travel Desk Report', 20, 20);

    // Add generation info
    doc.setFontSize(12);
    doc.text(
      `Generated on: ${reportData.generatedAt.toLocaleDateString()}`,
      20,
      35
    );
    doc.text(
      `Generated on: ${reportData.generatedAt.toLocaleDateString()}`,
      20,
      45
    );

    // Add date range
    doc.text(
      `Period: ${reportData.filters.startDate.toLocaleDateString()} - ${reportData.filters.endDate.toLocaleDateString()}`,
      20,
      55
    );

    let yPosition = 70;

    // Add summary if requested
    if (options.includeSummary) {
      doc.setFontSize(16);
      doc.text('Summary', 20, yPosition);
      yPosition += 15;

      doc.setFontSize(12);
      doc.text(
        `Total Requests: ${reportData.summary.totalRequests}`,
        20,
        yPosition
      );
      yPosition += 10;
      doc.text(
        `Total Travel Days: ${reportData.summary.totalTravelDays}`,
        20,
        yPosition
      );
      yPosition += 10;
      doc.text(
        `Average Processing Time: ${reportData.summary.averageProcessingTime} days`,
        20,
        yPosition
      );
      yPosition += 20;

      // Status breakdown
      doc.setFontSize(14);
      doc.text('Requests by Status:', 20, yPosition);
      yPosition += 10;
      doc.setFontSize(12);
      Object.entries(reportData.summary.requestsByStatus).forEach(
        ([status, count]) => {
          doc.text(`${status}: ${count}`, 30, yPosition);
          yPosition += 8;
        }
      );
      yPosition += 10;
    }

    // Add travel requests table
    if (reportData.items.length > 0) {
      doc.setFontSize(16);
      doc.text('Travel Requests', 20, yPosition);
      yPosition += 10;

      const tableData = reportData.items.map(
        (request: TravelRequestReportItem) => [
          request.requestId.toString(),
          request.employeeName,
          request.department,
          request.project,
          request.fromLocation,
          request.toLocation,
          request.fromDate.toLocaleDateString(),
          request.toDate.toLocaleDateString(),
          'Travel Request', // Removed bookingType - not supported by backend
          request.status,
          request.totalDays.toString(),
        ]
      );

      autoTable(doc, {
        head: [
          [
            'ID',
            'Employee',
            'Department',
            'Project',
            'From',
            'To',
            'Start Date',
            'End Date',
            'Type',
            'Status',
            'Days',
          ],
        ],
        body: tableData,
        startY: yPosition,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      });
    }

    // Save the PDF
    doc.save(fileName);
  }

  /**
   * Export report data to CSV
   */
  static exportToCSV(reportData: ReportData, options: ExportOptions): void {
    const fileName =
      options.fileName ||
      `travel-report-${new Date().toISOString().split('T')[0]}.csv`;

    // Prepare data for CSV
    const csvData = reportData.items.map(
      (request: TravelRequestReportItem) => ({
        'Request ID': request.requestId,
        'Employee Name': request.employeeName,
        'Employee Email': request.employeeEmail,
        Department: request.department,
        Project: request.project,
        'Reason for Travel': request.reasonForTravel,
        'From Location': request.fromLocation,
        'To Location': request.toLocation,
        'Start Date': request.fromDate.toLocaleDateString(),
        'End Date': request.toDate.toLocaleDateString(),
        'Request Type': 'Travel Request', // Removed bookingType - not supported by backend
        Status: request.status,
        'Submitted Date': request.submittedDate.toLocaleDateString(),
        'Approved Date': request.approvedDate?.toLocaleDateString() || '',
        'Completed Date': request.completedDate?.toLocaleDateString() || '',
        'Total Days': request.totalDays,
        'Manager Name': request.managerName || '',
        Comments: request.comments || '',
      })
    );

    // Convert to CSV
    const csv = Papa.unparse(csvData);

    // Create and download file
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Export travel requests to CSV (simplified version)
   */
  static exportTravelRequestsToCSV(
    requests: TravelRequestReportItem[],
    fileName?: string
  ): void {
    const defaultFileName =
      fileName ||
      `travel-requests-${new Date().toISOString().split('T')[0]}.csv`;

    const csvData = requests.map((request: TravelRequestReportItem) => ({
      'Request ID': request.requestId,
      'Employee Name': request.employeeName,
      'Employee Email': request.employeeEmail,
      Department: request.department,
      Project: request.project,
      'Reason for Travel': request.reasonForTravel,
      'From Location': request.fromLocation,
      'To Location': request.toLocation,
      'Start Date': request.fromDate.toLocaleDateString(),
      'End Date': request.toDate.toLocaleDateString(),
      'Request Type': 'Travel Request', // Removed bookingType - not supported by backend
      Status: request.status,
      'Total Days': request.totalDays,
      'Manager Name': request.managerName || '',
      Comments: request.comments || '',
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', defaultFileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Generate summary statistics from travel requests
   */
  static generateSummary(requests: TravelRequestReportItem[]) {
    const summary = {
      totalRequests: requests.length,
      requestsByStatus: {} as Record<string, number>,
      requestsByDepartment: {} as Record<string, number>,
      requestsByProject: {} as Record<string, number>,
      // Removed requestsByBookingType - not supported by backend
      averageProcessingTime: 0,
      totalTravelDays: 0,
    };

    let totalProcessingTime = 0;
    let processedRequests = 0;

    requests.forEach(request => {
      // Count by status
      summary.requestsByStatus[request.status] =
        (summary.requestsByStatus[request.status] || 0) + 1;

      // Count by department
      summary.requestsByDepartment[request.department] =
        (summary.requestsByDepartment[request.department] || 0) + 1;

      // Count by project
      summary.requestsByProject[request.project] =
        (summary.requestsByProject[request.project] || 0) + 1;

      // Removed booking type counting - not supported by backend

      // Calculate total travel days
      summary.totalTravelDays += request.totalDays;

      // Calculate processing time for completed requests
      if (request.completedDate) {
        const processingTime = Math.ceil(
          (request.completedDate.getTime() - request.submittedDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );
        totalProcessingTime += processingTime;
        processedRequests++;
      }
    });

    // Calculate average processing time
    summary.averageProcessingTime =
      processedRequests > 0
        ? Math.round(totalProcessingTime / processedRequests)
        : 0;

    return summary;
  }
}
