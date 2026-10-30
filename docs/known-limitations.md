# Known Limitations & Required Regulatory Work

## 1. Current Architectural Boundaries

1. **Non-Diagnostic Constraint**: CycleAware is intentionally limited to pattern recognition and longitudinal record-keeping. It does not provide medical diagnoses or treatment recommendations.
2. **Clinical ML Status**: Machine learning models in the platform are strictly labeled as **Mode B (Experimental Research Only)**. The automated clinical screening mode (Mode C) remains disabled pending prospective clinical trials.
3. **External Integrations**:
   - Wearable sync adapters (Apple HealthKit, Android Health Connect, Fitbit, Garmin) are architecturally outlined as abstract interfaces but marked as unconnected until official vendor developer credentials and MDM keys are provisioned.
   - Clinical Laboratory Information Systems (LIS) integration remains via manual test entry and PDF document upload.
4. **Demonstration Dataset**: The training dataset in `ml/datasets/` is 100% synthetic and must never be represented as clinical validation data.

---

## 2. Regulatory & Validation Work Required for Production Device Status

Before CycleAware can seek formal classification as Software as a Medical Device (SaMD):
1. **CDSCO Classification Review**: Formal consultation under Central Drugs Standard Control Organization (India) Medical Device Software rules.
2. **Multi-Centric Prospective Clinical Trial**: Validation on a diverse clinical cohort of minimum 2,000 real patients across Indian tertiary centers.
3. **IEC/IRB Ethical Approval**: Institutional Ethics Committee protocol approval for prospective data collection.
4. **Third-Party Medical Language Review**: Comprehensive localization audit of Hindi and Odia medical educational content by certified medical linguists.
