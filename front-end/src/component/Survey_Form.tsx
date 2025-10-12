import React, { useEffect, useState, useCallback } from 'react';

interface MetaData {
    first_name: string;
    last_name: string;
  }
  
  interface DemographicData {
    race_ethnicity: string[];
    marital_status: string;
    employment_status: string;
    education_level: string;
    gender: string;
    dob: string;
    zip_code: string;
    household_size: number;
    primary_language: string;
    veteran_status: string;
  }
  
  interface FinancialData {
    annual_income: string;
    has_health_insurance: boolean;
    insurance_type: string;
    has_longterm_care_insurance: boolean;
    has_estate_plan: boolean;
  }
  
  interface HealthData {
    conditions: string[];
    medications: string[];
    mobility_assistance: string;
    allergies: string[];
    emergency_contact: string;
    primary_care_physician: string;
  }
  
const Survey_Form: React.FC = () => {
    const API_URL = "http://localhost:4000";
    const [meta, setMeta] = useState<MetaData>({
        first_name: "",
        last_name: "",
    });
    const [token, setToken] = useState(localStorage.getItem("token") || "");
    const [demographic, setDemographic] = useState<DemographicData>({
        race_ethnicity: [],
        marital_status: '',
        employment_status: '',
        education_level: '',
        gender: '',
        dob: '',
        zip_code: '',
        household_size: 1,
        primary_language: '',
        veteran_status: '',
      });
    
    const [financial, setFinancial] = useState<FinancialData>({
        annual_income: '',  
        has_health_insurance: false,
        insurance_type: '',
        has_longterm_care_insurance: false,
        has_estate_plan: false,
      });
    
    const [health, setHealth] = useState<HealthData>({
        conditions: [],
        medications: [],
        mobility_assistance: '',
        allergies: [],
        emergency_contact: '',
        primary_care_physician: '',
      });
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showReview, setShowReview] = useState(false);

    // Helper function to toggle array values
    const toggleArrayValue = (array: string[], value: string): string[] => {
        return array.includes(value)
            ? array.filter(item => item !== value)
            : [...array, value];
    };
    
  const load = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/survey/complete`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        console.error('Failed to load data:', res.status);
        return;
      }
      
      const data = await res.json();
      
      // Update meta data from user object
      if (data.user) {
        setMeta({
          first_name: data.user.first_name || "",
          last_name: data.user.last_name || "",
        });
      }
      
      // Update demographic data
      if (data.demographic) {
        setDemographic({
          race_ethnicity: data.demographic.race_ethnicity || [],
          marital_status: data.demographic.marital_status || "",
          employment_status: data.demographic.employment_status || "",
          education_level: data.demographic.education_level || "",
          gender: data.demographic.gender || "",
          dob: data.demographic.dob || "",
          zip_code: data.demographic.zip_code || "",
          household_size: data.demographic.household_size || 1,
          primary_language: data.demographic.primary_language || "",
          veteran_status: data.demographic.veteran_status || "",
        });
      }
      
      // Update financial data
      if (data.financial) {
        setFinancial({
          annual_income: data.financial.annual_income || "",
          has_health_insurance: data.financial.has_health_insurance || false,
          insurance_type: data.financial.insurance_type || "",
          has_longterm_care_insurance: data.financial.has_longterm_care_insurance || false,
          has_estate_plan: data.financial.has_estate_plan || false,
        });
      }
      
      // Update health data
      if (data.response && data.response.health_data) {
        setHealth(data.response.health_data);
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, [token]);

  useEffect(() => {
    if (token) load();
  },[token, load]);






    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setShowReview(true);
        setIsSubmitting(true);
    
        try {
          if (!token) {
            alert('Please log in to submit the survey');
            return;
          }
    
          const response = await fetch(`${API_URL}/survey/complete`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              // Meta data
              first_name: meta.first_name,
              last_name: meta.last_name,
              // Demographic data
              race_ethnicity: demographic.race_ethnicity,
              marital_status: demographic.marital_status,
              employment_status: demographic.employment_status,
              education_level: demographic.education_level,
              gender: demographic.gender,
              dob: demographic.dob,
              zip_code: demographic.zip_code,
              household_size: demographic.household_size,
              primary_language: demographic.primary_language,
              veteran_status: demographic.veteran_status,
              // Financial data
              annual_income: financial.annual_income,
              has_health_insurance: financial.has_health_insurance,
              insurance_type: financial.insurance_type,
              has_longterm_care_insurance: financial.has_longterm_care_insurance,
              has_estate_plan: financial.has_estate_plan,
              health_data: health,
            }),
          });
    
          if (response.ok) {
            alert('Survey submitted successfully!');
            // Reset form
            setMeta({
              first_name: '',
              last_name: '',
            });
            setDemographic({
              race_ethnicity: [],
              marital_status: '',
              employment_status: '',
              education_level: '',
              gender: '',
              dob: '',
              zip_code: '',
              household_size: 1,
              primary_language: '',
              veteran_status: '',
            });
            setFinancial({
              annual_income: '',
              has_health_insurance: false,
              insurance_type: '',
              has_longterm_care_insurance: false,
              has_estate_plan: false,
            });
            setHealth({
              conditions: [],
              medications: [],
              mobility_assistance: '',
              allergies: [],
              emergency_contact: '',
              primary_care_physician: '',
            });
          } else {
            const error = await response.json();
            alert(`Error: ${error.error || 'Failed to submit survey'}`);
          }
        } catch (error) {
          console.error('Error submitting survey:', error);
          alert('Failed to submit survey. Please try again.');
        } finally {
          setIsSubmitting(false);
        }
      };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken('');
        window.location.href = '/login';
    }

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between"> 
                <h1 className="text-2xl font-bold">Waterlily Health survey</h1>
                <button
                className='bg-red-400 text-white px-6 py-2 rounded'
                onClick={handleLogout}
                >
                    Logout
                </button>
            </div>

            <form onSubmit={handleSubmit} className='space-y-8'>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-lg font-semibold mb-4 text-purple-600">Personal Information</div>
          <div className="flex gap-4 flex-wrap">
            
            <div className="flex-1 min-w-[200px]">
              <div className="text-sm font-medium text-gray-700 mb-1">First Name</div>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                type="text"
                placeholder="Enter your first name"
                value={meta.first_name}
                onChange={(e) => setMeta({ ...meta, first_name: e.target.value })}
                required
              />
            </div>

            <div className="flex-1 min-w-[200px]">
              <div className="text-sm font-medium text-gray-700 mb-1">Last Name</div>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                type="text"
                placeholder="Enter your last name"
                value={meta.last_name}
                onChange={(e) => setMeta({ ...meta, last_name: e.target.value })}
                required
              />
            </div>



          </div>
        </div>{/* DEMOGRAPHIC SECTION */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-lg font-semibold mb-4 text-blue-600">Demographic Information</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Gender</div>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={demographic.gender}
                onChange={(e) => setDemographic({ ...demographic, gender: e.target.value })}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Date of Birth</div>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                type="date"
                value={demographic.dob}
                onChange={(e) => setDemographic({ ...demographic, dob: e.target.value })}
                required
              />
            </div>

            <div className="col-span-full">
              <div className="text-sm font-medium text-gray-700 mb-2">Race/Ethnicity (select all that apply)</div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {["White", "Black or African American", "Hispanic or Latino", "Asian", "Native American", "Pacific Islander", "Other"].map((race) => (
                  <label key={race} className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded border border-gray-200 bg-gray-50 hover:bg-gray-100">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={demographic.race_ethnicity.includes(race)}
                      onChange={() => setDemographic({
                        ...demographic,
                        race_ethnicity: toggleArrayValue(demographic.race_ethnicity, race)
                      })}
                    />
                    {race}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Marital Status</div>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={demographic.marital_status}
                onChange={(e) => setDemographic({ ...demographic, marital_status: e.target.value })}
                required
              >
                <option value="">Select Status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
                <option value="Separated">Separated</option>
                <option value="Domestic Partnership">Domestic Partnership</option>
              </select>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Employment Status</div>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={demographic.employment_status}
                onChange={(e) => setDemographic({ ...demographic, employment_status: e.target.value })}
                required
              >
                <option value="">Select Status</option>
                <option value="Employed Full-time">Employed Full-time</option>
                <option value="Employed Part-time">Employed Part-time</option>
                <option value="Self-employed">Self-employed</option>
                <option value="Unemployed">Unemployed</option>
                <option value="Retired">Retired</option>
                <option value="Student">Student</option>
                <option value="Disabled">Disabled</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Education Level</div>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={demographic.education_level}
                onChange={(e) => setDemographic({ ...demographic, education_level: e.target.value })}
                required
              >
                <option value="">Select Level</option>
                <option value="Less than High School">Less than High School</option>
                <option value="High School Diploma">High School Diploma</option>
                <option value="Some College">Some College</option>
                <option value="Associate Degree">Associate Degree</option>
                <option value="Bachelor's Degree">Bachelor's Degree</option>
                <option value="Master's Degree">Master's Degree</option>
                <option value="Doctorate">Doctorate</option>
                <option value="Professional Degree">Professional Degree</option>
              </select>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">ZIP Code</div>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                type="text"
                placeholder="12345"
                pattern="[0-9]{5}(-[0-9]{4})?"
                maxLength={5}
                value={demographic.zip_code}
                onChange={(e) => setDemographic({ ...demographic, zip_code: e.target.value })}
                required
              />
            </div>

            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Household Size</div>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                type="number"
                min="0"
                value={demographic.household_size}
                onChange={(e) => setDemographic({ ...demographic, household_size: parseInt(e.target.value)})}
                required
              />
            </div>

            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Primary Language</div>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={demographic.primary_language}
                onChange={(e) => setDemographic({ ...demographic, primary_language: e.target.value })}
                required
              >
                <option value="">Select Language</option>
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Chinese">Chinese</option>
                <option value="Japanese">Japanese</option>
                <option value="Korean">Korean</option>
                <option value="Arabic">Arabic</option>
              </select>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Are you a veteran?</div>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={demographic.veteran_status}
                onChange={(e) => setDemographic({ ...demographic, veteran_status: e.target.value })}
                required
              >
                <option value="">Select Option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

          </div>
        </div>

        {/* FINANCIAL SECTION */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-lg font-semibold mb-4 text-green-600">Financial Information</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Annual Income Range</div>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={financial.annual_income}
                onChange={(e) => setFinancial({ ...financial, annual_income: e.target.value })}
                required
              >
                <option value="">Select Range</option>
                <option value="Less than $25,000">Less than $25,000</option>
                <option value="$25,000 - $50,000">$25,000 - $50,000</option>
                <option value="$50,000 - $75,000">$50,000 - $75,000</option>
                <option value="$75,000 - $100,000">$75,000 - $100,000</option>
                <option value="$100,000 - $150,000">$100,000 - $150,000</option>
                <option value="$150,000 - $200,000">$150,000 - $200,000</option>
                <option value="More than $200,000">More than $200,000</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div className="col-span-full">
              <label className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded border border-gray-200 bg-gray-50 hover:bg-gray-100">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={financial.has_health_insurance}
                  onChange={(e) => setFinancial({ ...financial, has_health_insurance: e.target.checked })}
                />
                Do you have health insurance?
              </label>
            </div>

            {financial.has_health_insurance && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Insurance Type</div>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={financial.insurance_type}
                  onChange={(e) => setFinancial({ ...financial, insurance_type: e.target.value })}
                >
                  <option value="">Select Type</option>
                  <option value="Employer-sponsored">Employer-sponsored</option>
                  <option value="Individual/Private">Individual/Private</option>
                  <option value="Medicare">Medicare</option>
                  <option value="Medicaid">Medicaid</option>
                  <option value="Military (TRICARE)">Military (TRICARE)</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            )}

            <div className="col-span-full">
              <label className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded border border-gray-200 bg-gray-50 hover:bg-gray-100">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={financial.has_longterm_care_insurance}
                  onChange={(e) => setFinancial({ ...financial, has_longterm_care_insurance: e.target.checked })}
                />
                Do you have long-term care insurance?
              </label>
            </div>

            <div className="col-span-full">
              <label className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded border border-gray-200 bg-gray-50 hover:bg-gray-100">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={financial.has_estate_plan}
                  onChange={(e) => setFinancial({ ...financial, has_estate_plan: e.target.checked })}
                />
                Do you have an estate plan?
              </label>
            </div>

          </div>
        </div>

        {/* HEALTH SECTION */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-lg font-semibold mb-4 text-red-600">Health Information</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            <div className="col-span-full">
              <div className="text-sm font-medium text-gray-700 mb-2">Medical Conditions (select all that apply)</div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {["Diabetes", "Hypertension", "Heart Disease", "COPD/Asthma", "Cancer", "Arthritis", "Depression", "Anxiety", "High Cholesterol", "Obesity"].map((condition) => (
                  <label key={condition} className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded border border-gray-200 bg-gray-50 hover:bg-gray-100">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={health.conditions.includes(condition)}
                      onChange={() => setHealth({
                        ...health,
                        conditions: toggleArrayValue(health.conditions, condition)
                      })}
                    />
                    {condition}
                  </label>
                ))}
              </div>
            </div>

            <div className="col-span-full">
              <div className="text-sm font-medium text-gray-700 mb-2">Current Medications (select all that apply)</div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {["Metformin", "Insulin", "Lisinopril", "Atorvastatin", "Albuterol", "Warfarin", "Aspirin", "Metoprolol", "Omeprazole", "Levothyroxine"].map((medication) => (
                  <label key={medication} className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded border border-gray-200 bg-gray-50 hover:bg-gray-100">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={health.medications.includes(medication)}
                      onChange={() => setHealth({
                        ...health,
                        medications: toggleArrayValue(health.medications, medication)
                      })}
                    />
                    {medication}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Mobility Assistance</div>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={health.mobility_assistance}
                onChange={(e) => setHealth({ ...health, mobility_assistance: e.target.value })}
                required
              >
                <option value="">Select Level</option>
                <option value="No assistance needed">No assistance needed</option>
                <option value="Cane or walking stick">Cane or walking stick</option>
                <option value="Walker">Walker</option>
                <option value="Wheelchair">Wheelchair</option>
                <option value="Motorized scooter">Motorized scooter</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="col-span-full">
              <div className="text-sm font-medium text-gray-700 mb-2">Allergies (select all that apply)</div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {["Penicillin", "Sulfa drugs", "Latex", "Food allergies", "Environmental allergies", "No known allergies"].map((allergy) => (
                  <label key={allergy} className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded border border-gray-200 bg-gray-50 hover:bg-gray-100">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={health.allergies.includes(allergy)}
                      onChange={() => setHealth({
                        ...health,
                        allergies: toggleArrayValue(health.allergies, allergy)
                      })}
                    />
                    {allergy}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Emergency Contact</div>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                type="text"
                placeholder="Name and phone number"
                value={health.emergency_contact}
                onChange={(e) => setHealth({ ...health, emergency_contact: e.target.value })}
              />
            </div>

            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Primary Care Physician</div>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                type="text"
                placeholder="Doctor's name and practice"
                value={health.primary_care_physician}
                onChange={(e) => setHealth({ ...health, primary_care_physician: e.target.value })}
              />
            </div>

          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex justify-center mt-8">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`px-8 py-3 rounded-lg text-lg font-semibold text-white border-none transition-colors duration-200 ${
              isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Health Survey'}
          </button>
        </div>

        </form>

        {/* REVIEW SECTION - Only show after submit button is clicked */}
        {showReview && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Your Survey Responses</h2>
            <div className="space-y-4">
              
              {/* Personal Information Review */}
              <div className="border-l-4 border-purple-500 pl-4">
                <div className="font-semibold text-purple-600 mb-2">Personal Information</div>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li><span className="font-medium">First Name:</span> {meta.first_name || "—"}</li>
                  <li><span className="font-medium">Last Name:</span> {meta.last_name || "—"}</li>
                </ul>
              </div>

              {/* Demographic Information Review */}
              <div className="border-l-4 border-blue-500 pl-4">
                <div className="font-semibold text-blue-600 mb-2">Demographic Information</div>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li><span className="font-medium">Gender:</span> {demographic.gender || "—"}</li>
                  <li><span className="font-medium">Date of Birth:</span> {demographic.dob || "—"}</li>
                  <li><span className="font-medium">Race/Ethnicity:</span> {demographic.race_ethnicity.length > 0 ? demographic.race_ethnicity.join(", ") : "—"}</li>
                  <li><span className="font-medium">Marital Status:</span> {demographic.marital_status || "—"}</li>
                  <li><span className="font-medium">Employment Status:</span> {demographic.employment_status || "—"}</li>
                  <li><span className="font-medium">Education Level:</span> {demographic.education_level || "—"}</li>
                  <li><span className="font-medium">ZIP Code:</span> {demographic.zip_code || "—"}</li>
                  <li><span className="font-medium">Household Size:</span> {demographic.household_size || "—"}</li>
                  <li><span className="font-medium">Primary Language:</span> {demographic.primary_language || "—"}</li>
                  <li><span className="font-medium">Veteran Status:</span> {demographic.veteran_status || "—"}</li>
                </ul>
              </div>

              {/* Financial Information Review */}
              <div className="border-l-4 border-green-500 pl-4">
                <div className="font-semibold text-green-600 mb-2">Financial Information</div>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li><span className="font-medium">Annual Income:</span> {financial.annual_income || "—"}</li>
                  <li><span className="font-medium">Health Insurance:</span> {financial.has_health_insurance ? "Yes" : "No"}</li>
                  {financial.has_health_insurance && (
                    <li><span className="font-medium">Insurance Type:</span> {financial.insurance_type || "—"}</li>
                  )}
                  <li><span className="font-medium">Long-term Care Insurance:</span> {financial.has_longterm_care_insurance ? "Yes" : "No"}</li>
                  <li><span className="font-medium">Estate Plan:</span> {financial.has_estate_plan ? "Yes" : "No"}</li>
                </ul>
              </div>

              {/* Health Information Review */}
              <div className="border-l-4 border-red-500 pl-4">
                <div className="font-semibold text-red-600 mb-2">Health Information</div>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>
                    <span className="font-medium">Medical Conditions:</span> {health.conditions.length > 0 ? health.conditions.join(", ") : "—"}
                  </li>
                  <li>
                    <span className="font-medium">Current Medications:</span> {health.medications.length > 0 ? health.medications.join(", ") : "—"}
                  </li>
                  <li><span className="font-medium">Mobility Assistance:</span> {health.mobility_assistance || "—"}</li>
                  <li>
                    <span className="font-medium">Allergies:</span> {health.allergies.length > 0 ? health.allergies.join(", ") : "—"}
                  </li>
                  <li><span className="font-medium">Emergency Contact:</span> {health.emergency_contact || "—"}</li>
                  <li><span className="font-medium">Primary Care Physician:</span> {health.primary_care_physician || "—"}</li>
                </ul>
              </div>

            </div>
          </div>
        )}
    </div>
    )
}

export default Survey_Form;
