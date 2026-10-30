const BASE_URL = '/api/v1'

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('cycleaware_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    let errorDetail = 'An unexpected error occurred.'
    try {
      const errData = await res.json()
      errorDetail = errData.detail || JSON.stringify(errData)
    } catch {
      errorDetail = await res.text() || res.statusText
    }
    throw new Error(errorDetail)
  }

  // Handle empty responses
  const contentType = res.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    return res.json()
  }
  return res.text() as unknown as T
}

export const api = {
  // Auth
  register: (data: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request<any>('/auth/me'),
  logout: () => {
    localStorage.removeItem('cycleaware_token')
    localStorage.removeItem('cycleaware_user')
  },

  // Patient Profile & Consents
  getProfile: () => request<any>('/patients/me'),
  updateProfile: (data: any) => request<any>('/patients/me', { method: 'PATCH', body: JSON.stringify(data) }),
  getConsents: () => request<any[]>('/patients/me/consents'),
  updateConsents: (consents: any[]) => request<any[]>('/patients/me/consents', { method: 'POST', body: JSON.stringify({ consents }) }),
  getTimeline: () => request<any[]>('/patients/me/timeline'),

  // Cycles
  getPeriods: () => request<any[]>('/cycles'),
  createPeriod: (data: any) => request<any>('/cycles', { method: 'POST', body: JSON.stringify(data) }),
  updatePeriod: (id: string, data: any) => request<any>(`/cycles/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deletePeriod: (id: string) => request<any>(`/cycles/${id}`, { method: 'DELETE' }),
  getCycleAnalytics: () => request<any>('/cycles/analytics'),
  getCurrentCheckpoint: () => request<any>('/cycles/current-checkpoint'),

  // Symptoms
  getSymptomCatalogue: () => request<any[]>('/symptoms/catalogue'),
  getSymptoms: () => request<any[]>('/symptoms'),
  createSymptom: (data: any) => request<any>('/symptoms', { method: 'POST', body: JSON.stringify(data) }),
  getSymptomTrends: () => request<any[]>('/symptoms/trends'),
  deleteSymptom: (id: string) => request<any>(`/symptoms/${id}`, { method: 'DELETE' }),
  parseVernacularSpeech: (text: string, language = 'hi') => request<any>('/symptoms/vernacular-nlp', { method: 'POST', body: JSON.stringify({ text, language }) }),
  calculateRvi: (data: any) => request<any>('/symptoms/calculate-rvi', { method: 'POST', body: JSON.stringify(data) }),

  // Measurements
  getMeasurements: () => request<any[]>('/measurements'),
  createMeasurement: (data: any) => request<any>('/measurements', { method: 'POST', body: JSON.stringify(data) }),
  deleteMeasurement: (id: string) => request<any>(`/measurements/${id}`, { method: 'DELETE' }),
  submitRppgBiomarker: (data: any) => request<any>('/measurements/rppg-biomarker', { method: 'POST', body: JSON.stringify(data) }),

  // Clinical Records & Schedule
  getLabs: () => request<any[]>('/clinical-records/labs'),
  createLab: (data: any) => request<any>('/clinical-records/labs', { method: 'POST', body: JSON.stringify(data) }),
  deleteLab: (id: string) => request<any>(`/clinical-records/labs/${id}`, { method: 'DELETE' }),
  getDocuments: () => request<any[]>('/clinical-records/documents'),
  getRecommendedLabSchedule: () => request<any[]>('/clinical-records/recommended-schedule'),
  recordConsultationOutcome: (data: any) => request<any>('/clinical-records/consultation-outcome', { method: 'POST', body: JSON.stringify(data) }),
  rollbackRecalibration: (outcomeId: string) => request<any>(`/clinical-records/recalibration-rollback/${outcomeId}`, { method: 'POST' }),
  
  // ASHA Camp Mode
  createAshaCampIntake: (data: any) => request<any>('/clinical-records/asha/camp-intake', { method: 'POST', body: JSON.stringify(data) }),
  listAshaCampRecords: () => request<any[]>('/clinical-records/asha/camp-records'),

  uploadDocument: async (file: File, documentType = 'lab_report') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('document_type', documentType)
    const token = localStorage.getItem('cycleaware_token')
    const res = await fetch(`${BASE_URL}/clinical-records/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.detail || 'Upload failed')
    }
    return res.json()
  },

  // Observations
  getObservations: () => request<any>('/observations'),

  // Clinician Portal & Sharing
  createShareInvite: (data: any) => request<any>('/clinicians/invite', { method: 'POST', body: JSON.stringify(data) }),
  getSharePermissions: () => request<any[]>('/clinicians/sharing-permissions'),
  revokeSharePermission: (id: string) => request<any>(`/clinicians/revoke-permission/${id}`, { method: 'POST' }),
  redeemInvite: (code: string) => request<any>(`/clinicians/redeem-invite?access_code=${encodeURIComponent(code)}`, { method: 'POST' }),
  getAuthorizedPatients: () => request<any[]>('/clinicians/patients'),
  getAuthorizedPatientDetail: (id: string) => request<any>(`/clinicians/patients/${id}`),
  addClinicianNote: (data: any) => request<any>('/clinicians/notes', { method: 'POST', body: JSON.stringify(data) }),
  getClinicianNotes: (patientId: string) => request<any[]>(`/clinicians/notes/${patientId}`),

  // Privacy & Governance
  exportDataJson: () => request<any>('/privacy/export', { method: 'POST' }),
  deleteAccount: () => request<any>('/privacy/delete-account', { method: 'POST' }),
  getAuditLog: () => request<any[]>('/privacy/audit-log'),

  // Administration
  getSystemHealth: () => request<any>('/admin/system-health'),
  getAdminUsers: () => request<any[]>('/admin/users'),
  getAdminAuditEvents: () => request<any[]>('/admin/audit-events'),

  // ML Registry & Inference
  getModelRegistry: () => request<any>('/ml/models'),
  runExperimentalInference: (data: any) => request<any>('/ml/experimental-inference', { method: 'POST', body: JSON.stringify(data) }),
}
