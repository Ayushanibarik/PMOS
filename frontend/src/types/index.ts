export type UserRole = 'patient' | 'clinician' | 'admin' | 'researcher' | 'asha_worker'

export interface UserProfile {
  id: string
  user_id: string
  age?: number
  menarche_age?: number
  country: string
  preferred_language: string
  timezone: string
  is_under_18: boolean
  cycle_regularity_self_report?: string
  typical_cycle_length?: number
  typical_bleeding_duration?: number
  last_period_date?: string
  experiences_skipped_periods: boolean
  has_prior_pcos_diagnosis: boolean
  has_other_endocrine_condition: boolean
  using_hormonal_contraception: boolean
  contraceptive_type?: string
  contraceptive_name?: string
  contraceptive_start_date?: string
  contraceptive_discontinued_date?: string
  is_pregnant_postpartum: boolean
  is_breastfeeding: boolean
  medications_influencing_cycle?: string
  body_neutral_mode: boolean
  postprandial_fatigue_freq?: string
  preferred_dialect: string
  onboarding_completed: boolean
}

export interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
  is_active: boolean
  is_verified: boolean
  profile?: UserProfile
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface MenstrualPeriod {
  id: string
  user_id: string
  start_date: string
  end_date?: string
  flow_intensity: 'very_light' | 'light' | 'medium' | 'heavy' | 'very_heavy'
  has_spotting: boolean
  associated_symptoms?: string
  notes?: string
  created_at: string
}

export interface CycleSummary {
  id: string
  cycle_start_date: string
  cycle_end_date: string
  cycle_length_days: number
  bleeding_duration_days?: number
  is_irregular_by_guideline: boolean
  beta_drift_slope?: number
  drift_confidence?: string
  calculated_at: string
}

export interface CyclePrediction {
  predicted_start_date?: string
  window_start_date?: string
  window_end_date?: string
  confidence_level: 'low' | 'medium' | 'high' | 'insufficient_data'
  cycle_count_used: number
  method_used: string
  explanation: string
}

export interface BetaDriftInfo {
  beta_drift_slope?: number
  trend_direction: 'stable' | 'lengthening' | 'shortening' | 'insufficient_data'
  standard_error?: number
  r_squared?: number
  cycles_evaluated: number
  confidence_level: string
  is_outlier_detected: boolean
  explanation: string
  scientific_disclaimer: string
}

export interface PhaseCheckpoint {
  current_cycle_day?: number
  estimated_phase: string
  checkpoint_active: boolean
  checkpoint_type?: 'menstrual_flow' | 'mid_cycle' | 'luteal_phase'
  checkpoint_title?: string
  checkpoint_prompt?: string
  suggested_symptom_codes: string[]
  can_skip: boolean
  disclaimer: string
}

export interface CycleAnalytics {
  total_recorded_cycles: number
  average_cycle_length?: number
  median_cycle_length?: number
  min_cycle_length?: number
  max_cycle_length?: number
  cycle_length_variation_std?: number
  average_bleeding_duration?: number
  irregular_cycles_count: number
  has_sufficient_data: boolean
  guideline_status: string
  beta_drift?: BetaDriftInfo
  cycle_history: CycleSummary[]
  prediction?: CyclePrediction
}

export interface SymptomCatalogueItem {
  code: string
  name: string
  category: string
  description?: string
}

export interface SymptomEntry {
  id: string
  user_id: string
  symptom_code: string
  symptom_name: string
  category: string
  severity: number
  date: string
  phase_checkpoint?: string
  grooming_modality?: string
  days_since_grooming?: number
  rvi_score?: number
  craving_type?: string
  voice_logged?: boolean
  vernacular_raw_text?: string
  notes?: string
  created_at: string
}

export interface SymptomTrendItem {
  symptom_name: string
  category: string
  frequency_count: number
  average_severity: number
  max_severity: number
  recent_trend: 'increasing' | 'stable' | 'decreasing'
}

export interface ParsedConcept {
  symptom_code: string
  symptom_name: string
  category: string
  detected_severity: number
  confidence: number
  matched_phrase: string
  is_negated: boolean
}

export interface VernacularNlpResponse {
  detected_language: string
  concepts: ParsedConcept[]
  requires_user_confirmation: boolean
  disclaimer: string
}

export interface RviCalculationResponse {
  rvi_score: number
  modality_coefficient: number
  growth_velocity_category: string
  ita_skin_tone_category?: string
  explanation: string
  disclaimer: string
}

export interface BodyMeasurement {
  id: string
  user_id: string
  date: string
  weight_kg?: number
  height_cm?: number
  waist_cm?: number
  neck_circumference_cm?: number
  waist_to_height_ratio?: number
  asian_indian_risk_category?: string
  bmi?: number
  resting_heart_rate?: number
  systolic_bp?: number
  diastolic_bp?: number
  sleep_hours?: number
  physical_activity_mins?: number
  postprandial_slump_score?: number
  rppg_hrv_rmssd?: number
  rppg_signal_quality?: number
  vocal_f0_hz?: number
  vocal_jitter_pct?: number
  cmi_score?: number
  data_source: string
  notes?: string
}

export interface LaboratoryResult {
  id: string
  user_id: string
  document_id?: string
  test_name: string
  value: number
  unit: string
  test_date: string
  laboratory_name?: string
  reference_range?: string
  assay_details?: string
  entry_source: string
  clinician_reviewed: boolean
  notes?: string
}

export interface UploadedDocument {
  id: string
  user_id: string
  original_filename: string
  file_size_bytes: number
  mime_type: string
  document_type: string
  created_at: string
}

export interface PatternObservation {
  id: string
  user_id: string
  category: string
  observation_type: 'pattern_observation' | 'follow_up_observation' | 'data_insufficiency' | 'no_notable_change'
  title: string
  description: string
  evidence_details: string
  recommendation: string
  rule_version: string
  created_at?: string
}

export interface PatternAlignmentAxis {
  axis_name: string
  weight_pct: number
  raw_score: number
  weighted_contribution: number
  description: string
}

export interface PatternAlignmentIndex {
  pai_score: number
  alignment_level: string
  axes: PatternAlignmentAxis[]
  confidence_level: string
  data_completeness_pct: number
  developmental_modifier?: string
  contraceptive_modifier?: string
  disclaimer: string
}

export interface ObservationSummary {
  total_observations: number
  has_irregular_cycles: boolean
  has_hyperandrogenism_signs: boolean
  has_metabolic_markers: boolean
  pattern_alignment_index?: PatternAlignmentIndex
  guideline_citation: string
  disclaimer: string
  observations: PatternObservation[]
}

export interface LaboratoryScheduleReminder {
  id: string
  user_id: string
  test_name: string
  test_category: string
  recommended_timing: string
  due_date_start?: string
  due_date_end?: string
  clinical_rationale: string
  preparation_instructions: string
  imaging_guidance?: string
  status: string
}

export interface ConsultationOutcome {
  id: string
  user_id: string
  consultation_date: string
  clinician_name_or_id: string
  diagnosis_status: string
  differential_diagnosis?: string
  prescribed_investigations?: string
  clinical_notes?: string
  prior_alignment_score?: number
  posterior_alignment_score?: number
  likelihood_ratio: number
  is_recalibrated: boolean
  rollback_available: boolean
  created_at: string
}

export interface AshaCampIntake {
  id: string
  asha_worker_id: string
  camp_location: string
  camp_date: string
  anonymous_patient_token: string
  age: number
  cycle_regularity: string
  asian_indian_risk_flag: boolean
  triage_recommendation: string
  sync_status: string
  created_at: string
}

export interface SharingPermission {
  id: string
  patient_id: string
  clinician_id?: string
  access_code: string
  sharing_scope: string
  valid_until: string
  is_revoked: boolean
  created_at: string
}

export interface ClinicianNote {
  id: string
  patient_id: string
  clinician_id: string
  consultation_date: string
  general_notes: string
  cycle_review?: string
  symptom_review?: string
  recommendation: string
  follow_up_date?: string
  referral_status?: string
  created_at: string
}

export interface AuthorizedPatientSummary {
  patient_id: string
  full_name: string
  age?: number
  sharing_scope: string
  valid_until: string
  access_granted_at: string
  last_cycle_recorded?: string
  irregular_cycles_flag: boolean
}

export type AuthorizedPatient = AuthorizedPatientSummary

export interface TimelineItem {
  id: string
  date: string
  type: string
  title: string
  summary?: string
  description?: string
  metadata?: Record<string, any>
}
