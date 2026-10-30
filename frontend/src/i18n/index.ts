import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      appName: "CycleAware",
      tagline: "Women's Hormonal Health Intelligence Platform",
      disclaimer: "Non-diagnostic health monitoring tool. Does not replace professional clinical evaluation.",
      nav: {
        home: "Home",
        howItWorks: "How It Works",
        education: "Health Education",
        pcosPmos: "PCOS / PMOS Info",
        dashboard: "My Dashboard",
        cycles: "Cycle Tracker",
        symptoms: "Symptoms",
        measurements: "Measurements",
        clinicalRecords: "Clinical Records",
        timeline: "Health Timeline",
        observations: "Pattern Observations",
        reports: "Reports",
        sharing: "Doctor Sharing",
        privacy: "Privacy & Consent",
        clinicianPortal: "Clinician Portal",
        adminPortal: "Admin Portal",
        login: "Sign In",
        register: "Get Started",
        logout: "Sign Out"
      },
      hero: {
        headline: "Understand Your Cycle. Recognise Your Patterns. Take Control of Your Health.",
        subheadline: "Your menstrual health contains vital insights into your overall hormonal wellbeing. Track your cycles, understand symptom trends, and maintain a connected record with personalized, evidence-informed guidance.",
        startBtn: "Start Your Health Journey",
        exploreBtn: "Explore How It Works"
      },
      safety: {
        bannerTitle: "Clinical Safety & Medical Disclaimer",
        bannerText: "CycleAware is an early-pattern identification and health-monitoring platform. It does NOT provide a definitive diagnosis of PCOS, PCOD, or PMOS, nor does it prescribe medication. Always consult a qualified gynecologist or endocrinologist."
      }
    }
  },
  hi: {
    translation: {
      appName: "साइकिल अवेयर (CycleAware)",
      tagline: "महिला हार्मोनल स्वास्थ्य निगरानी मंच",
      disclaimer: "गैर-नैदानिक स्वास्थ्य निगरानी उपकरण। यह पेशेवर चिकित्सकीय परामर्श का विकल्प नहीं है।",
      nav: {
        home: "होम",
        howItWorks: "यह कैसे काम करता है",
        education: "स्वास्थ्य शिक्षा",
        pcosPmos: "PCOS / PMOS जानकारी",
        dashboard: "डैशबोर्ड",
        cycles: "मासिक धर्म ट्रैकर",
        symptoms: "लक्षण",
        measurements: "माप",
        clinicalRecords: "लैब रिपोर्ट्स",
        timeline: "स्वास्थ्य टाइमलाइन",
        observations: "पैटर्न अवलोकन",
        reports: "रिपोर्ट्स",
        sharing: "डॉक्टर शेयरिंग",
        privacy: "गोपनीयता और सहमति",
        clinicianPortal: "डॉक्टर पोर्टल",
        adminPortal: "एडमिन पोर्टल",
        login: "लॉग इन",
        register: "शुरू करें",
        logout: "लॉग आउट"
      },
      hero: {
        headline: "अपने चक्र को समझें। अपने पैटर्न को पहचानें। अपने स्वास्थ्य पर नियंत्रण रखें।",
        subheadline: "आपका मासिक धर्म स्वास्थ्य आपके संपूर्ण हार्मोनल स्वास्थ्य के बारे में महत्वपूर्ण जानकारी रखता है। अपने चक्रों को ट्रैक करें और साक्ष्य-आधारित मार्गदर्शन प्राप्त करें।",
        startBtn: "अपनी यात्रा शुरू करें",
        exploreBtn: "जानें कैसे काम करता है"
      },
      safety: {
        bannerTitle: "चिकित्सीय सुरक्षा एवं अस्वीकरण",
        bannerText: "साइकिल अवेयर एक प्रारंभिक स्वास्थ्य पैटर्न निगरानी उपकरण है। यह PCOS या PMOS का निश्चित निदान नहीं करता है। हमेशा एक योग्य स्त्री रोग विशेषज्ञ से परामर्श लें।"
      }
    }
  },
  or: {
    translation: {
      appName: "ସାଇକଲ୍ ଆୱେୟାର୍ (CycleAware)",
      tagline: "ମହିଳା ହରମୋନାଲ୍ ସ୍ୱାସ୍ଥ୍ୟ ବୁଦ୍ଧିମତା ପ୍ଲାଟଫର୍ମ",
      disclaimer: "ଅଣ-ନୈଦାନିକ ସ୍ୱାସ୍ଥ୍ୟ ନିରୀକ୍ଷଣ ଉପକରଣ। ଏହା ଡାକ୍ତରୀ ପରାମର୍ଶର ବିକଳ୍ପ ନୁହେଁ।",
      nav: {
        home: "ମୂଳପୃଷ୍ଠା",
        howItWorks: "ଏହା କିପରି କାମ କରେ",
        education: "ସ୍ୱାସ୍ଥ୍ୟ ଶିକ୍ଷା",
        pcosPmos: "PCOS / PMOS ସୂଚନା",
        dashboard: "ମୋ ଡ୍ୟାସବୋର୍ଡ",
        cycles: "ଋତୁଚକ୍ର ଟ୍ରାକର୍",
        symptoms: "ଲକ୍ଷଣ",
        measurements: "ମାପଚୁପ",
        clinicalRecords: "ଲ୍ୟାବ୍ ରିପୋର୍ଟ",
        timeline: "ସ୍ୱାସ୍ଥ୍ୟ ଟାଇମଲାଇନ",
        observations: "ଢାଞ୍ଚା ନିରୀକ୍ଷଣ",
        reports: "ରିପୋର୍ଟ",
        sharing: "ଡାକ୍ତର ଅଂଶୀଦାର",
        privacy: "ଗୋପନୀୟତା ଓ ସମ୍ମତି",
        clinicianPortal: "ଡାକ୍ତର ପୋର୍ଟାଲ୍",
        adminPortal: "ପ୍ରଶାସନ ପୋର୍ଟାଲ୍",
        login: "ପ୍ରବେଶ",
        register: "ଆରମ୍ଭ କରନ୍ତୁ",
        logout: "ପ୍ରସ୍ଥାନ"
      },
      hero: {
        headline: "ଆପଣଙ୍କ ଚକ୍ରକୁ ବୁଝନ୍ତୁ। ଆପଣଙ୍କ ଢାଞ୍ଚାକୁ ଚିହ୍ନନ୍ତୁ। ସ୍ୱାସ୍ଥ୍ୟକୁ ନିୟନ୍ତ୍ରଣ କରନ୍ତୁ।",
        subheadline: "ଆପଣଙ୍କ ମାସିକ ଋତୁସ୍ରାବ ଆପଣଙ୍କ ସମ୍ପୂର୍ଣ୍ଣ ହରମୋନାଲ୍ ସ୍ୱାସ୍ଥ୍ୟ ସମ୍ବନ୍ଧରେ ମୂଲ୍ୟବାନ ତଥ୍ୟ ଦେଇଥାଏ।",
        startBtn: "ସ୍ୱାସ୍ଥ୍ୟ ଯାତ୍ରା ଆରମ୍ଭ କରନ୍ତୁ",
        exploreBtn: "କିପରି କାମ କରେ ଦେଖନ୍ତୁ"
      },
      safety: {
        bannerTitle: "ଚିକିତ୍ସା ସୁରକ୍ଷା ଓ ସତର୍କତା",
        bannerText: "ସାଇକଲ୍ ଆୱେୟାର୍ ଏକ ପ୍ରାରମ୍ଭିକ ସ୍ୱାସ୍ଥ୍ୟ ଢାଞ୍ଚା ନିରୀକ୍ଷଣ ଉପକରଣ। ଏହା PCOS ବା PMOS ର ଚୂଡ଼ାନ୍ତ ନିଦାନ ପ୍ରଦାନ କରେ ନାହିଁ।"
      }
    }
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  })

export default i18n
