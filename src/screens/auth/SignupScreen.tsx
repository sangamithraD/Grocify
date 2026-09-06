import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  ActivityIndicator,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';

export default function SignupScreen({ navigation }: any) {
  const { signup, continueAsGuest } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [secureConfirmText, setSecureConfirmText] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    if (!confirmPassword) {
      Alert.alert('Error', 'Please confirm your password');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await signup(email.trim(), password);
      // Automatically logged in and transitioned to HomeScreen by context state update.
    } catch (err: any) {
      Alert.alert('Signup Failed', err?.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          
          {/* Logo / Header Section */}
          <View style={styles.headerSection}>
            <Image 
              source={require('../../../assets/logo.png')} 
              style={styles.logoImage} 
              resizeMode="contain"
            />
            <Text style={[styles.appName, { color: colors.primary, fontSize: 26 }]}>Grocify</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary, fontSize: 13 }]}>Join the food conservation movement</Text>
          </View>

          {/* Form Card */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text, fontSize: 20 }]}>Create Account</Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary, fontSize: 13 }]}>Sign up to track pantry items & reduce waste</Text>

            {/* Email Field */}
            <Text style={[styles.inputLabel, { color: colors.text, fontSize: 14 }]}>Email Address</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.border, height: 50 }]}>
              <Ionicons name="mail-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="you@example.com"
                placeholderTextColor={colors.textSecondary}
                style={[styles.input, { color: colors.text, fontSize: 15 }]}
              />
            </View>

            {/* Password Field */}
            <Text style={[styles.inputLabel, { color: colors.text, fontSize: 14 }]}>Password</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.border, height: 50 }]}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry={secureText}
                placeholder="At least 6 characters"
                placeholderTextColor={colors.textSecondary}
                style={[styles.input, { color: colors.text, fontSize: 15 }]}
              />
              <TouchableOpacity onPress={() => setSecureText(!secureText)} style={styles.eyeIcon}>
                <Ionicons name={secureText ? "eye-off-outline" : "eye-outline"} size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Confirm Password Field */}
            <Text style={[styles.inputLabel, { color: colors.text, fontSize: 14 }]}>Confirm Password</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.border, height: 50 }]}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={secureConfirmText}
                placeholder="••••••••"
                placeholderTextColor={colors.textSecondary}
                style={[styles.input, { color: colors.text, fontSize: 15 }]}
              />
              <TouchableOpacity onPress={() => setSecureConfirmText(!secureConfirmText)} style={styles.eyeIcon}>
                <Ionicons name={secureConfirmText ? "eye-off-outline" : "eye-outline"} size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity 
              style={[styles.primaryButton, { backgroundColor: colors.primary, height: 50 }, loading && styles.disabledButton]} 
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Text style={[styles.buttonText, { fontSize: 15 }]}>Sign Up</Text>
                  <Ionicons name="person-add-outline" size={16} color="white" style={{ marginLeft: 8 }} />
                </>
              )}
            </TouchableOpacity>

            {/* Guest / Offline Access Button */}
            <TouchableOpacity 
              style={[styles.guestButton, { borderColor: colors.primary, marginTop: 12, height: 48 }]} 
              onPress={continueAsGuest}
            >
              <Ionicons name="phone-portrait-outline" size={18} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={[styles.guestButtonText, { color: colors.primary, fontSize: 14 }]}>
                Continue as Mobile Guest
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer Navigation */}
          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.footerLink}>
            <Text style={[styles.footerText, { color: colors.textSecondary, fontSize: 14 }]}>
              Already have an account? <Text style={[styles.loginHighlight, { color: colors.primary, fontSize: 14 }]}>Login</Text>
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoImage: {
    width: 72,
    height: 72,
    marginBottom: 12,
  },
  appName: {
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  subtitle: {
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSubtitle: {
    marginBottom: 20,
  },
  inputLabel: {
    fontWeight: '600',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: '100%',
  },
  eyeIcon: {
    padding: 8,
  },
  primaryButton: {
    borderRadius: 10,
    height: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  footerLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
  },
  loginHighlight: {
    fontWeight: '700',
  },
  guestButton: {
    borderWidth: 1.5,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestButtonText: {
    fontWeight: '700',
  },
});
