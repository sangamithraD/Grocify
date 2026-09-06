export type LanguageType = 'en' | 'ta' | 'hi';

export const translations: Record<LanguageType, Record<string, string>> = {
  en: {
    emailRequired: "Email and password are required",
    accountExists: "Account with this email already exists",
    signupError: "Server error during signup",
    invalidCredentials: "Invalid email or password",
    loginError: "Server error during login",
    userNotFound: "User not found",
    profileError: "Server error loading profile",
    logoutSuccess: "Successfully logged out on server",
    logoutError: "Server error during logout",
    fetchItemsError: "Server error loading pantry items",
    itemFieldsRequired: "Product name, expiry date, and category are required",
    invalidCategory: "Category must be either food or non-food",
    addItemError: "Server error adding pantry item",
    itemNotFound: "Item not found or unauthorized",
    deleteItemError: "Server error deleting pantry item",
    pantryCleared: "Pantry cleared successfully",
    clearPantryError: "Server error clearing pantry",
    tokenMissing: "Authorization token missing or malformed",
    tokenInvalid: "Invalid or expired session token",
  },
  ta: {
    emailRequired: "மின்னஞ்சல் மற்றும் கடவுச்சொல் தேவை",
    accountExists: "இந்த மின்னஞ்சல் முகவரியில் ஏற்கனவே ஒரு கணக்கு உள்ளது",
    signupError: "பதிவு செய்வதில் பிழை ஏற்பட்டது",
    invalidCredentials: "மின்னஞ்சல் அல்லது கடவுச்சொல் தவறானது",
    loginError: "உள்நுழைவதில் பிழை ஏற்பட்டது",
    userNotFound: "பயனர் கண்டறியப்படவில்லை",
    profileError: "சுயவிவரத்தை ஏற்றுவதில் பிழை",
    logoutSuccess: "வெற்றிகரமாக வெளியேறப்பட்டது",
    logoutError: "வெளியேறுவதில் பிழை ஏற்பட்டது",
    fetchItemsError: "பொருட்களை ஏற்றுவதில் பிழை ஏற்பட்டது",
    itemFieldsRequired: "பொருளின் பெயர், காலாவதி தேதி மற்றும் வகை ஆகியவை தேவை",
    invalidCategory: "வகை 'உணவு' அல்லது 'உணவு அல்லாதது' ஆக இருக்க வேண்டும்",
    addItemError: "பொருளைச் சேர்ப்பதில் பிழை ஏற்பட்டது",
    itemNotFound: "பொருள் கண்டறியப்படவில்லை அல்லது அனுமதி இல்லை",
    deleteItemError: "பொருளை நீக்குவதில் பிழை ஏற்பட்டது",
    pantryCleared: "பொருளகம் வெற்றிகரமாக அழிக்கப்பட்டது",
    clearPantryError: "பொருளகத்தை அழிப்பதில் பிழை ஏற்பட்டது",
    tokenMissing: "அங்கீகார டோக்கன் இல்லை அல்லது தவறானது",
    tokenInvalid: "டோக்கன் செல்லாது அல்லது காலாவதியானது",
  },
  hi: {
    emailRequired: "ईमेल और पासवर्ड आवश्यक हैं",
    accountExists: "इस ईमेल से पहले से ही एक खाता मौजूद है",
    signupError: "साइनअप के दौरान सर्वर त्रुटि",
    invalidCredentials: "अमान्य ईमेल या पासवर्ड",
    loginError: "लॉगिन के दौरान सर्वर त्रुटि",
    userNotFound: "उपयोगकर्ता नहीं मिला",
    profileError: "प्रोफ़ाइल लोड करने में सर्वर त्रुटि",
    logoutSuccess: "सर्वर से सफलतापूर्वक लॉगआउट हो गया",
    logoutError: "लॉगआऊट के दौरान सर्वर त्रुटि",
    fetchItemsError: "पेंट्री सामान लोड करने में सर्वर त्रुटि",
    itemFieldsRequired: "सामग्री का नाम, समाप्ति तिथि और श्रेणी आवश्यक हैं",
    invalidCategory: "श्रेणी या तो खाद्य (food) या गैर-खाद्य (non-food) होनी चाहिए",
    addItemError: "पेंट्री सामान जोड़ने में सर्वर त्रुटि",
    itemNotFound: "सामग्री नहीं मिली या अनधिकृत",
    deleteItemError: "पेंट्री सामान हटाने में सर्वर त्रुटि",
    pantryCleared: "पेंट्री सफलतापूर्वक खाली कर दी गई",
    clearPantryError: "पेंट्री खाली करने में सर्वर त्रुटि",
    tokenMissing: "प्राधिकरण टोकन गायब या विकृत है",
    tokenInvalid: "अमान्य या समाप्त सत्र टोकन",
  }
};

export const getLanguage = (header?: string): LanguageType => {
  if (!header) return 'en';
  const lang = header.split(',')[0].split('-')[0].toLowerCase();
  if (lang === 'ta') return 'ta';
  if (lang === 'hi') return 'hi';
  return 'en';
};

export const t = (header: string | undefined, key: string): string => {
  const lang = getLanguage(header);
  return translations[lang][key] || translations['en'][key] || key;
};

export default t;
