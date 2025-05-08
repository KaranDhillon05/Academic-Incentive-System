const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

// Path for Excel files
const EXCEL_DIR = path.join(__dirname, '../excel_data');
// Ensure directory exists
fs.mkdirSync(EXCEL_DIR, { recursive: true });

class ExcelManager {
  constructor() {
    this.bookFilePath = path.join(EXCEL_DIR, 'books.xlsx');
    this.projectFilePath = path.join(EXCEL_DIR, 'projects.xlsx');
    this.journalFilePath = path.join(EXCEL_DIR, 'journals.xlsx');

    // Initialize Excel files if they don't exist
    this.initializeExcelFiles();
  }

  // Initialize Excel files with headers if they don't exist
  async initializeExcelFiles() {
    // Books Excel
    if (!fs.existsSync(this.bookFilePath)) {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Books');

      // Define columns with headers
      worksheet.columns = [
        { header: 'Entry ID', key: 'id', width: 10 },
        { header: 'Submission Date', key: 'submissionDate', width: 20 },
        { header: 'User ID', key: 'userId', width: 15 },
        { header: 'Employee ID', key: 'employeeId', width: 15 },
        { header: 'User Name', key: 'userName', width: 20 },
        { header: 'Department', key: 'department', width: 15 },
        { header: 'Title', key: 'title', width: 30 },
        { header: 'Publisher', key: 'publisher', width: 30 },
        { header: 'Type', key: 'type', width: 15 },
        { header: 'Publication Date', key: 'publicationDate', width: 15 },
        { header: 'Total Authors', key: 'totalAuthors', width: 15 },
        { header: 'SRMIST Authors', key: 'srmistAuthors', width: 15 },
        { header: 'ISBN', key: 'isbn', width: 15 },
        { header: 'Proof File', key: 'proofFile', width: 30 },
        { header: 'Approved', key: 'approved', width: 10 }
      ];

      await workbook.xlsx.writeFile(this.bookFilePath);
      console.log('Books Excel file created successfully');
    }

    // Projects Excel
    if (!fs.existsSync(this.projectFilePath)) {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Projects');

      // Define columns with headers
      worksheet.columns = [
        { header: 'Entry ID', key: 'id', width: 10 },
        { header: 'Submission Date', key: 'submissionDate', width: 20 },
        { header: 'User ID', key: 'userId', width: 15 },
        { header: 'Employee ID', key: 'employeeId', width: 15 },
        { header: 'User Name', key: 'userName', width: 20 },
        { header: 'Department', key: 'department', width: 15 },
        { header: 'Title', key: 'title', width: 30 },
        { header: 'Funding Agency', key: 'fundingAgency', width: 30 },
        { header: 'Role', key: 'role', width: 10 },
        { header: 'Principal Investigator', key: 'principalInvestigator', width: 25 },
        { header: 'Co-Principal Investigator', key: 'coPrincipalInvestigator', width: 25 },
        { header: 'Number of Co-PIs', key: 'numberOfCoPIs', width: 15 },
        { header: 'Grant Date', key: 'grantDate', width: 15 },
        { header: 'Grant Amount', key: 'grantAmount', width: 15 },
        { header: 'Sanction Order File', key: 'sanctionOrderFile', width: 30 },
        { header: 'Amount Received', key: 'amountReceived', width: 15 },
        { header: 'DD File', key: 'ddFile', width: 30 },
        { header: 'Date Received', key: 'dateReceived', width: 15 },
        { header: 'Approved', key: 'approved', width: 10 }
      ];

      await workbook.xlsx.writeFile(this.projectFilePath);
      console.log('Projects Excel file created successfully');
    }

    // Journals Excel
    if (!fs.existsSync(this.journalFilePath)) {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Journals');

      // Define columns with headers
      worksheet.columns = [
        { header: 'Entry ID', key: 'id', width: 10 },
        { header: 'Submission Date', key: 'submissionDate', width: 20 },
        { header: 'User ID', key: 'userId', width: 15 },
        { header: 'Employee ID', key: 'employeeId', width: 15 },
        { header: 'User Name', key: 'userName', width: 20 },
        { header: 'Department', key: 'department', width: 15 },
        { header: 'Paper Title', key: 'paperTitle', width: 30 },
        { header: 'Journal Name', key: 'journalName', width: 30 },
        { header: 'ISSN', key: 'issn', width: 15 },
        { header: 'Author Level', key: 'authorLevel', width: 15 },
        { header: 'Is Corresponding Author', key: 'isCorrespondingAuthor', width: 20 },
        { header: '1st Author Affiliation', key: 'affiliation1stAuthor', width: 20 },
        { header: 'Corresponding Author Affiliation', key: 'affiliationCorrespondingAuthor', width: 25 },
        { header: 'Is Same Author', key: 'isSameAuthor', width: 15 },
        { header: 'Corresponding Authors Count', key: 'correspondingAuthorsCount', width: 25 },
        { header: 'Authors Count', key: 'authorsCount', width: 15 },
        { header: 'Citation Count', key: 'citationCount', width: 15 },
        { header: 'Is Interdisciplinary', key: 'isInterdisciplinary', width: 20 },
        { header: 'Interdisciplinary Type', key: 'interdisciplinaryType', width: 25 },
        { header: 'Indexed', key: 'indexed', width: 10 },
        { header: 'Published Date', key: 'publishedDate', width: 15 },
        { header: 'Proof File', key: 'proofFile', width: 30 },
        { header: 'Approved', key: 'approved', width: 10 }
      ];

      await workbook.xlsx.writeFile(this.journalFilePath);
      console.log('Journals Excel file created successfully');
    }
  }

  // Add a new book entry to Excel
  async addBookEntry(bookData) {
    try {
      console.log('Adding book entry to Excel:', JSON.stringify(bookData));

      // Define the CSV file path
      const csvFilePath = this.bookFilePath.replace('.xlsx', '.csv');

      // Create a backup of the file if it exists
      if (fs.existsSync(csvFilePath)) {
        const backupPath = `${csvFilePath}.bak`;
        fs.copyFileSync(csvFilePath, backupPath);
        console.log('Created backup of CSV file at:', backupPath);
      }

      // Prepare the CSV data
      const headers = [
        'Entry ID',
        'Submission Date',
        'User ID',
        'Employee ID',
        'User Name',
        'Department',
        'Title',
        'Publisher',
        'Type',
        'Publication Date',
        'Total Authors',
        'SRMIST Authors',
        'ISBN',
        'Proof File',
        'Approved'
      ];

      // Prepare the new row data
      const rowData = [
        bookData._id.toString(),
        new Date().toISOString(),
        bookData.userId.toString(),
        bookData.employeeId,
        bookData.userName,
        bookData.department,
        bookData.title,
        bookData.publisher,
        bookData.type,
        bookData.publicationDate,
        bookData.totalAuthors,
        bookData.srmistAuthors,
        bookData.isbn,
        bookData.proofFilePath,
        bookData.approved ? 'Yes' : 'No'
      ];

      // Read existing data or create new file with headers
      let existingData = [];
      if (fs.existsSync(csvFilePath)) {
        try {
          const fileContent = fs.readFileSync(csvFilePath, 'utf8');
          const lines = fileContent.split('\n').filter(line => line.trim() !== '');

          if (lines.length > 0) {
            // Skip the header row
            for (let i = 1; i < lines.length; i++) {
              existingData.push(lines[i]);
            }
          }

          console.log('Read', existingData.length, 'existing rows from CSV');
        } catch (err) {
          console.error('Error reading existing CSV data:', err);
        }
      }

      // Create the CSV content
      let csvContent = headers.join(',') + '\n';

      // Add existing data
      if (existingData.length > 0) {
        csvContent += existingData.join('\n') + '\n';
      }

      // Add the new row
      csvContent += rowData.map(value => {
        // Escape commas and quotes in values
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',');

      // Write the CSV file
      console.log('Writing CSV file to:', csvFilePath);
      fs.writeFileSync(csvFilePath, csvContent);

      // Verify the file was written
      const stats = fs.statSync(csvFilePath);
      console.log('CSV file written successfully, size:', stats.size, 'bytes');

      // Read the file back to verify
      const verifyContent = fs.readFileSync(csvFilePath, 'utf8');
      const verifyLines = verifyContent.split('\n').filter(line => line.trim() !== '');
      console.log('Verification - CSV file has', verifyLines.length, 'lines (including header)');
      console.log('Verification - CSV content:');
      verifyLines.forEach((line, index) => {
        console.log(`Line ${index + 1}:`, line);
      });

      // Also write the Excel file for compatibility
      try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Books');

        // Define columns with headers
        worksheet.columns = headers.map(header => ({ header, key: header.replace(/\s+/g, ''), width: 20 }));

        // Add all rows from CSV
        verifyLines.slice(1).forEach(line => {
          const values = this.parseCSVLine(line);
          const rowObj = {};
          headers.forEach((header, index) => {
            rowObj[header.replace(/\s+/g, '')] = values[index];
          });
          worksheet.addRow(rowObj);
        });

        // Write the Excel file
        await workbook.xlsx.writeFile(this.bookFilePath);
        console.log('Excel file also written successfully');
      } catch (err) {
        console.error('Error writing Excel file:', err);
      }

      return true;
    } catch (error) {
      console.error('Error adding book entry to Excel:', error);
      console.error('Error stack:', error.stack);
      return false;
    }
  }

  // Helper method to parse CSV lines correctly (handling quoted values with commas)
  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          // Double quotes inside quotes - add a single quote
          current += '"';
          i++;
        } else {
          // Toggle quotes mode
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        result.push(current);
        current = '';
      } else {
        // Normal character
        current += char;
      }
    }

    // Add the last field
    result.push(current);

    return result;
  }

  // Add a new project entry to Excel
  async addProjectEntry(projectData) {
    try {
      console.log('Adding project entry to Excel:', JSON.stringify(projectData));

      // Define the CSV file path
      const csvFilePath = this.projectFilePath.replace('.xlsx', '.csv');

      // Create a backup of the file if it exists
      if (fs.existsSync(csvFilePath)) {
        const backupPath = `${csvFilePath}.bak`;
        fs.copyFileSync(csvFilePath, backupPath);
        console.log('Created backup of CSV file at:', backupPath);
      }

      // Prepare the CSV data
      const headers = [
        'Entry ID',
        'Submission Date',
        'User ID',
        'Employee ID',
        'User Name',
        'Department',
        'Title',
        'Funding Agency',
        'Role',
        'Principal Investigator',
        'Co-Principal Investigator',
        'Number of Co-PIs',
        'Grant Date',
        'Grant Amount',
        'Sanction Order File',
        'Amount Received',
        'DD File',
        'Date Received',
        'Approved'
      ];

      // Prepare the new row data
      const rowData = [
        projectData._id.toString(),
        new Date().toISOString(),
        projectData.userId.toString(),
        projectData.employeeId,
        projectData.userName,
        projectData.department,
        projectData.title,
        projectData.fundingAgency,
        projectData.role,
        projectData.principalInvestigator,
        projectData.coPrincipalInvestigator,
        projectData.numberOfCoPIs,
        projectData.grantDate,
        projectData.grantAmount,
        projectData.sanctionOrderFilePath,
        projectData.amountReceived,
        projectData.ddFilePath,
        projectData.dateReceived,
        projectData.approved ? 'Yes' : 'No'
      ];

      // Read existing data or create new file with headers
      let existingData = [];
      if (fs.existsSync(csvFilePath)) {
        try {
          const fileContent = fs.readFileSync(csvFilePath, 'utf8');
          const lines = fileContent.split('\n').filter(line => line.trim() !== '');

          if (lines.length > 0) {
            // Skip the header row
            for (let i = 1; i < lines.length; i++) {
              existingData.push(lines[i]);
            }
          }

          console.log('Read', existingData.length, 'existing rows from CSV');
        } catch (err) {
          console.error('Error reading existing CSV data:', err);
        }
      }

      // Create the CSV content
      let csvContent = headers.join(',') + '\n';

      // Add existing data
      if (existingData.length > 0) {
        csvContent += existingData.join('\n') + '\n';
      }

      // Add the new row
      csvContent += rowData.map(value => {
        // Escape commas and quotes in values
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',');

      // Write the CSV file
      console.log('Writing CSV file to:', csvFilePath);
      fs.writeFileSync(csvFilePath, csvContent);

      // Verify the file was written
      const stats = fs.statSync(csvFilePath);
      console.log('CSV file written successfully, size:', stats.size, 'bytes');

      // Read the file back to verify
      const verifyContent = fs.readFileSync(csvFilePath, 'utf8');
      const verifyLines = verifyContent.split('\n').filter(line => line.trim() !== '');
      console.log('Verification - CSV file has', verifyLines.length, 'lines (including header)');
      console.log('Verification - CSV content:');
      verifyLines.forEach((line, index) => {
        console.log(`Line ${index + 1}:`, line);
      });

      // Also write the Excel file for compatibility
      try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Projects');

        // Define columns with headers
        worksheet.columns = headers.map(header => ({ header, key: header.replace(/\s+/g, ''), width: 20 }));

        // Add all rows from CSV
        verifyLines.slice(1).forEach(line => {
          const values = this.parseCSVLine(line);
          const rowObj = {};
          headers.forEach((header, index) => {
            rowObj[header.replace(/\s+/g, '')] = values[index];
          });
          worksheet.addRow(rowObj);
        });

        // Write the Excel file
        await workbook.xlsx.writeFile(this.projectFilePath);
        console.log('Excel file also written successfully');
      } catch (err) {
        console.error('Error writing Excel file:', err);
      }

      return true;
    } catch (error) {
      console.error('Error adding project entry to Excel:', error);
      console.error('Error stack:', error.stack);
      return false;
    }
  }

  // Add a new journal entry to Excel
  async addJournalEntry(journalData) {
    try {
      console.log('Adding journal entry to Excel:', JSON.stringify(journalData));

      // Define the CSV file path
      const csvFilePath = this.journalFilePath.replace('.xlsx', '.csv');

      // Create a backup of the file if it exists
      if (fs.existsSync(csvFilePath)) {
        const backupPath = `${csvFilePath}.bak`;
        fs.copyFileSync(csvFilePath, backupPath);
        console.log('Created backup of CSV file at:', backupPath);
      }

      // Prepare the CSV data
      const headers = [
        'Entry ID',
        'Submission Date',
        'User ID',
        'Employee ID',
        'User Name',
        'Department',
        'Paper Title',
        'Journal Name',
        'ISSN',
        'Author Level',
        'Is Corresponding Author',
        '1st Author Affiliation',
        'Corresponding Author Affiliation',
        'Is Same Author',
        'Corresponding Authors Count',
        'Authors Count',
        'Citation Count',
        'Is Interdisciplinary',
        'Interdisciplinary Type',
        'Indexed',
        'Published Date',
        'Proof File',
        'Approved'
      ];

      // Prepare the new row data
      const rowData = [
        journalData._id.toString(),
        new Date().toISOString(),
        journalData.userId.toString(),
        journalData.employeeId,
        journalData.userName,
        journalData.department,
        journalData.paperTitle,
        journalData.journalName,
        journalData.issn,
        journalData.authorLevel,
        journalData.isCorrespondingAuthor ? 'Yes' : 'No',
        journalData.affiliation1stAuthor,
        journalData.affiliationCorrespondingAuthor,
        journalData.isSameAuthor ? 'Yes' : 'No',
        journalData.correspondingAuthorsCount,
        journalData.authorsCount,
        journalData.citationCount,
        journalData.isInterdisciplinary ? 'Yes' : 'No',
        journalData.interdisciplinaryType,
        journalData.indexed,
        journalData.publishedDate,
        journalData.proofFilePath,
        journalData.approved ? 'Yes' : 'No'
      ];

      // Read existing data or create new file with headers
      let existingData = [];
      if (fs.existsSync(csvFilePath)) {
        try {
          const fileContent = fs.readFileSync(csvFilePath, 'utf8');
          const lines = fileContent.split('\n').filter(line => line.trim() !== '');

          if (lines.length > 0) {
            // Skip the header row
            for (let i = 1; i < lines.length; i++) {
              existingData.push(lines[i]);
            }
          }

          console.log('Read', existingData.length, 'existing rows from CSV');
        } catch (err) {
          console.error('Error reading existing CSV data:', err);
        }
      }

      // Create the CSV content
      let csvContent = headers.join(',') + '\n';

      // Add existing data
      if (existingData.length > 0) {
        csvContent += existingData.join('\n') + '\n';
      }

      // Add the new row
      csvContent += rowData.map(value => {
        // Escape commas and quotes in values
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',');

      // Write the CSV file
      console.log('Writing CSV file to:', csvFilePath);
      fs.writeFileSync(csvFilePath, csvContent);

      // Verify the file was written
      const stats = fs.statSync(csvFilePath);
      console.log('CSV file written successfully, size:', stats.size, 'bytes');

      // Read the file back to verify
      const verifyContent = fs.readFileSync(csvFilePath, 'utf8');
      const verifyLines = verifyContent.split('\n').filter(line => line.trim() !== '');
      console.log('Verification - CSV file has', verifyLines.length, 'lines (including header)');
      console.log('Verification - CSV content:');
      verifyLines.forEach((line, index) => {
        console.log(`Line ${index + 1}:`, line);
      });

      // Also write the Excel file for compatibility
      try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Journals');

        // Define columns with headers
        worksheet.columns = headers.map(header => ({ header, key: header.replace(/\s+/g, ''), width: 20 }));

        // Add all rows from CSV
        verifyLines.slice(1).forEach(line => {
          const values = this.parseCSVLine(line);
          const rowObj = {};
          headers.forEach((header, index) => {
            rowObj[header.replace(/\s+/g, '')] = values[index];
          });
          worksheet.addRow(rowObj);
        });

        // Write the Excel file
        await workbook.xlsx.writeFile(this.journalFilePath);
        console.log('Excel file also written successfully');
      } catch (err) {
        console.error('Error writing Excel file:', err);
      }

      return true;
    } catch (error) {
      console.error('Error adding journal entry to Excel:', error);
      console.error('Error stack:', error.stack);
      return false;
    }
  }
}

module.exports = new ExcelManager();
