import { Router, type Response } from 'express';
import { type RowDataPacket, type ResultSetHeader } from 'mysql2/promise';
import pool from '../db.js';
import { authenticationtoken, type AuthRequest } from '../middleware/authmiddleware.js';

// Type definitions for all tables
type UserRow = RowDataPacket & {
  id: number,
  email: string,
  password: string,
  first_name: string | null,
  last_name: string | null,
};

type DemographicDataRow = RowDataPacket & {
  id: number,
  user_id: number,
  race_ethnicity: string | null, // JSON string
  marital_status: string | null,
  employment_status: string | null,
  education_level: string | null,
  gender: string | null,
  dob: string | null, // DATE as string
  zip_code: string | null,
  household_size: number | null,
  primary_language: string | null,
  veteran_status: string | null,
};

type FinancialDataRow = RowDataPacket & {
  id: number,
  user_id: number,
  annual_income: string | null,
  has_health_insurance: boolean | null,
  insurance_type: string | null,
  has_longterm_care_insurance: boolean | null,
  has_estate_plan: boolean | null,
};

type UserResponseRow = RowDataPacket & {
  id: number,
  user_id: number,
  submitted_at: Date,
};

// Combined type for JOIN queries
type UserCompleteDataRow = RowDataPacket & {
  // User data
  user_id: number,
  email: string,
  first_name: string | null,
  last_name: string | null,
  // Demographic data
  demographic_id: number | null,
  race_ethnicity: string | null,
  marital_status: string | null,
  employment_status: string | null,
  education_level: string | null,
  gender: string | null,
  dob: string | null,
  zip_code: string | null,
  household_size: number | null,
  primary_language: string | null,
  veteran_status: string | null,
  // Financial data
  financial_id: number | null,
  annual_income: string | null,
  has_health_insurance: boolean | null,
  insurance_type: string | null,
  has_longterm_care_insurance: boolean | null,
  has_estate_plan: boolean | null,
  // Response data
  response_id: number | null,
  submitted_at: Date | null,
  health_data : JSON | null,
};

const router = Router();

// GET user's complete data (demographic + financial) with JOIN
router.get('/complete', authenticationtoken, async (req: AuthRequest, res: Response) => {
  try {
    const [rows] = await pool.query<UserCompleteDataRow[]>(
      `SELECT 
        u.id as user_id,
        u.email,
        u.first_name,
        u.last_name,
        d.id as demographic_id,
        d.race_ethnicity,
        d.marital_status,
        d.employment_status,
        d.education_level,
        d.gender,
        d.dob,
        d.zip_code,
        d.household_size,
        d.primary_language,
        d.veteran_status,
        f.id as financial_id,
        f.annual_income,
        f.has_health_insurance,
        f.insurance_type,
        f.has_longterm_care_insurance,
        f.has_estate_plan,
        ur.id as response_id,
        ur.submitted_at,
        ur.health_data
      FROM users u
      LEFT JOIN demographic_data d ON u.id = d.user_id
      LEFT JOIN financial_data f ON u.id = f.user_id
      LEFT JOIN user_responses ur ON u.id = ur.user_id
      WHERE u.id = ?`,
      [req.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = rows[0]!;
    res.json({
      user: {
        id: userData.user_id,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
      },
      demographic: userData.demographic_id ? {
        id: userData.demographic_id,
        race_ethnicity: userData.race_ethnicity ? (() => {
          try {
            return JSON.parse(userData.race_ethnicity);
          } catch {
            return userData.race_ethnicity; // Return as string if not valid JSON
          }
        })() : null,
        marital_status: userData.marital_status,
        employment_status: userData.employment_status,
        education_level: userData.education_level,
        gender: userData.gender,
        dob: userData.dob,
        zip_code: userData.zip_code,
        household_size: userData.household_size,
        primary_language: userData.primary_language,
        veteran_status: userData.veteran_status,
      } : null,
      financial: userData.financial_id ? {
        id: userData.financial_id,
        annual_income: userData.annual_income,
        has_health_insurance: userData.has_health_insurance,
        insurance_type: userData.insurance_type,
        has_longterm_care_insurance: userData.has_longterm_care_insurance,
        has_estate_plan: userData.has_estate_plan,
      } : null,
      response: userData.response_id ? {
        id: userData.response_id,
        health_data: userData.health_data,
        submitted_at: userData.submitted_at,
      } : null,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

// POST complete user data (demographic + financial + response) in one request
router.post('/complete', authenticationtoken, async (req: AuthRequest, res: Response) => {
  
  const {
    // Meta data
    first_name,
    last_name,
    // Demographic data
    race_ethnicity,
    marital_status,
    employment_status,
    education_level,
    gender,
    dob,
    zip_code,
    household_size,
    primary_language,
    veteran_status,
    // Financial data
    annual_income,
    has_health_insurance,
    insurance_type,
    has_longterm_care_insurance,
    has_estate_plan,
    // Response data
    health_data,
  } = req.body as {
    // Meta fields
    first_name?: string,
    last_name?: string,
    // Demographic fields
    race_ethnicity?: string[] | string,
    marital_status?: string,
    employment_status?: string,
    education_level?: string,
    gender?: string,
    dob?: string,
    zip_code?: string,
    household_size?: number,
    primary_language?: string,
    veteran_status?: string,
    // Financial fields
    annual_income?: string,
    has_health_insurance?: boolean,
    insurance_type?: string,
    has_longterm_care_insurance?: boolean,
    has_estate_plan?: boolean,
    // Response fields
    health_data?: any,
  };

  try {
    const raceEthnicityJson = race_ethnicity ? JSON.stringify(race_ethnicity) : null;

    // Start a transaction to ensure both operations succeed or fail together
    await pool.query('START TRANSACTION');

    try {
      
      // Handle user data (first_name, last_name)
      if (first_name || last_name) {
        try {
          await pool.query<ResultSetHeader>(
            `UPDATE users SET 
             first_name = COALESCE(?, first_name), 
             last_name = COALESCE(?, last_name)
             WHERE id = ?`,
            [first_name, last_name, req.userId]
          );
        } catch (userError) {
          throw userError;
        }
      } else {
      }

      // Handle demographic data
      const [existingDemographic] = await pool.query<DemographicDataRow[]>(
        'SELECT id FROM demographic_data WHERE user_id = ?',
        [req.userId]
      );

      if (existingDemographic.length > 0) {
        try {
          await pool.query<ResultSetHeader>(
            `UPDATE demographic_data SET 
             race_ethnicity = ?, marital_status = ?, employment_status = ?, 
             education_level = ?, gender = ?, dob = ?, zip_code = ?,  household_size = ?, primary_language = ?, 
             veteran_status = ?
             WHERE user_id = ?`,
            [
              raceEthnicityJson, marital_status, employment_status, education_level,
              gender, dob, zip_code, household_size,
              primary_language, veteran_status, req.userId
            ]
          );
        } catch (demoError) {
          throw demoError;
        }
      } else {
        try {
          await pool.query<ResultSetHeader>(
            `INSERT INTO demographic_data 
             (user_id, race_ethnicity, marital_status, employment_status, 
              education_level, gender, dob, zip_code,
              household_size, primary_language, veteran_status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              req.userId, raceEthnicityJson, marital_status, employment_status,
              education_level, gender, dob, zip_code,
              household_size, primary_language, veteran_status
            ]
          );
        } catch (demoError) {
          throw demoError;
        }
      }

      // Handle financial data
      const [existingFinancial] = await pool.query<FinancialDataRow[]>(
        'SELECT id FROM financial_data WHERE user_id = ?',
        [req.userId]
      );

      if (existingFinancial.length > 0) {
        try {
          await pool.query<ResultSetHeader>(
            `UPDATE financial_data SET 
             annual_income = ?, has_health_insurance = ?, insurance_type = ?, 
             has_longterm_care_insurance = ?, has_estate_plan = ?
             WHERE user_id = ?`,
            [annual_income, has_health_insurance, insurance_type, has_longterm_care_insurance, has_estate_plan, req.userId]
          );
        } catch (financialError) {
          throw financialError;
        }
      } else {
        try {
          await pool.query<ResultSetHeader>(
            `INSERT INTO financial_data 
             (user_id, annual_income, has_health_insurance, insurance_type, 
              has_longterm_care_insurance, has_estate_plan) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [req.userId, annual_income, has_health_insurance, insurance_type, has_longterm_care_insurance, has_estate_plan]
          );
        } catch (financialError) {
          throw financialError;
        }
      }

      // Handle user response data
      const [existingResponse] = await pool.query<UserResponseRow[]>(
        'SELECT id FROM user_responses WHERE user_id = ?',
        [req.userId]
      );

      const healthDataJson = health_data ? JSON.stringify(health_data) : null;

      if (existingResponse.length > 0) {
        try {
          await pool.query<ResultSetHeader>(
            `UPDATE user_responses SET 
             health_data = ?, submitted_at = NOW()
             WHERE user_id = ?`,
            [healthDataJson, req.userId]
          );
        } catch (responseError) {
          throw responseError;
        }
      } else {
        try {
          await pool.query<ResultSetHeader>(
            `INSERT INTO user_responses 
             (user_id, health_data, submitted_at) 
             VALUES (?, ?, NOW())`,
            [req.userId, healthDataJson]
          );
        } catch (responseError) {
          throw responseError;
        }
      }

      // Commit the transaction
      await pool.query('COMMIT');
      
      // Fetch the complete data to return to frontend
      const [completeRows] = await pool.query<UserCompleteDataRow[]>(
        `SELECT 
          u.id as user_id,
          u.email,
          u.first_name,
          u.last_name,
          d.id as demographic_id,
          d.race_ethnicity,
          d.marital_status,
          d.employment_status,
          d.education_level,
          d.gender,
          d.dob,
          d.zip_code,
          d.household_size,
          d.primary_language,
          d.veteran_status,
          f.id as financial_id,
          f.annual_income,
          f.has_health_insurance,
          f.insurance_type,
          f.has_longterm_care_insurance,
          f.has_estate_plan,
          ur.id as response_id,
          ur.submitted_at,
          ur.health_data
        FROM users u
        LEFT JOIN demographic_data d ON u.id = d.user_id
        LEFT JOIN financial_data f ON u.id = f.user_id
        LEFT JOIN user_responses ur ON u.id = ur.user_id
        WHERE u.id = ?`,
        [req.userId]
      );

      const userData = completeRows[0]!;
      
      // Build the response object
      const responseData = {
        demographic: userData.demographic_id ? {
          id: userData.demographic_id,
          race_ethnicity: userData.race_ethnicity ? (() => {
            try {
              return JSON.parse(userData.race_ethnicity);
            } catch {
              return userData.race_ethnicity; // Return as string if not valid JSON
            }
          })() : null,
          marital_status: userData.marital_status,
          employment_status: userData.employment_status,
          education_level: userData.education_level,
          gender: userData.gender,
          dob: userData.dob,
          zip_code: userData.zip_code,
          living_arrangement: userData.living_arrangement,
          household_size: userData.household_size,
          primary_language: userData.primary_language,
          veteran_status: userData.veteran_status,
        } : null,
        financial: userData.financial_id ? {
          id: userData.financial_id,
          annual_income: userData.annual_income,
          has_health_insurance: userData.has_health_insurance,
          insurance_type: userData.insurance_type,
          has_longterm_care_insurance: userData.has_longterm_care_insurance,
          has_estate_plan: userData.has_estate_plan,
        } : null,
        response: userData.response_id ? {
          id: userData.response_id,
          health_data: userData.health_data,
          submitted_at: userData.submitted_at,
        } : null,
      };
      
      res.status(201).json(responseData);

    } catch (error) {
      // Rollback the transaction if any operation fails
      try {
        await pool.query('ROLLBACK');
      } catch (rollbackError) {
        // Silent rollback error
      }
      throw error;
    }

  } catch (error: any) {
    res.status(500).json({ 
      error: 'Failed to save complete user data',
      details: error.message,
      code: error.code
    });
  }
});

// POST submit user response (mark survey as completed)
router.post('/submit', authenticationtoken, async (req: AuthRequest, res: Response) => {
  try {
    // Check if response already exists
    const [existing] = await pool.query<UserResponseRow[]>(
      'SELECT id FROM user_responses WHERE user_id = ?',
      [req.userId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Response already submitted' });
    }

    // Insert new response
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO user_responses (user_id) VALUES (?)',
      [req.userId]
    );

    res.status(201).json({ 
      message: 'Response submitted successfully', 
      id: result.insertId 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit response' });
  }
});

export default router;
