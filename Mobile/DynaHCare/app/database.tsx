import * as SQLite from 'expo-sqlite';

// Define a type for the row data
interface FormResponse {
  localId: number;
  responseData: string;
}

// Open the SQLite database (will be created if it doesn't exist)
const db = SQLite.openDatabaseSync('formData.db');

// Function to create the table
export const createTable = async () => {
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS formResponses (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        responseData TEXT
      );
    `);
    console.log('Table created successfully');
  } catch (error) {
    console.log('Error creating table:', error);
  }
};

// Function to save data
export const saveData = async (formData: any) => {
  try {
    const result = await db.runAsync('INSERT INTO formResponses (responseData) VALUES (?);', JSON.stringify(formData));
    console.log('Data inserted successfully:', result);
  } catch (error) {
    console.log('Error inserting data:', error);
  }
};

export const loadAllData = async (callback: (data: FormResponse[]) => void) => {
  try {
    // Use 'any' to bypass the type-checking for unknown return type of 'getAllAsync'
    const results = await db.getAllAsync('SELECT * FROM formResponses ORDER BY id DESC');
    
    // Explicitly cast the result to the expected type
    const data: FormResponse[] = results.map((row: any) => {
      return { ...row, responseData: JSON.parse(row.responseData) };
    });
    
    callback(data);
  } catch (error) {
    console.log('Error loading data:', error);
  }
};

// Function to delete data by ID
export const deleteData = async (id: number) => {
  try {
    const result = await db.runAsync('DELETE FROM formResponses WHERE id = ?;', [id]);
    console.log('Data deleted successfully:', result);
  } catch (error) {
    console.log('Error deleting data:', error);
  }
};