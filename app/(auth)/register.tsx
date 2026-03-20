import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button, TextInput, useTheme, Snackbar, Surface, Divider } from 'react-native-paper';
import { Link, router } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: signUpError } = await signUp(email, password);
      if (signUpError) {
        setError(signUpError.message);
      } else {
        router.replace('/(auth)/login');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.gradient}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Create Account</Text>
          <Text style={styles.headerSubtitle}>Start managing your finances today</Text>
        </View>

        <Surface style={styles.formCard} elevation={5}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            disabled={loading}
            left={<TextInput.Icon icon="email-outline" />}
            outlineStyle={styles.inputOutline}
            outlineColor="rgba(255,255,255,0.15)"
            activeOutlineColor="#1DB954"
            textColor="#fff"
            theme={{ colors: { onSurfaceVariant: '#888' } }}
          />
          
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={!showPassword}
            style={styles.input}
            disabled={loading}
            left={<TextInput.Icon icon="lock-outline" />}
            right={
              <TextInput.Icon 
                icon={showPassword ? "eye-off" : "eye"} 
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            outlineStyle={styles.inputOutline}
            outlineColor="rgba(255,255,255,0.15)"
            activeOutlineColor="#1DB954"
            textColor="#fff"
            theme={{ colors: { onSurfaceVariant: '#888' } }}
          />

          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            mode="outlined"
            secureTextEntry={!showPassword}
            style={styles.input}
            disabled={loading}
            left={<TextInput.Icon icon="lock-check" />}
            outlineStyle={styles.inputOutline}
            outlineColor="rgba(255,255,255,0.15)"
            activeOutlineColor="#1DB954"
            textColor="#fff"
            theme={{ colors: { onSurfaceVariant: '#888' } }}
          />
          
          <Button 
            mode="contained" 
            onPress={handleRegister}
            style={styles.registerButton}
            labelStyle={styles.registerButtonLabel}
            loading={loading}
            disabled={loading}
            icon="account-plus"
          >
            Create Account
          </Button>

          <View style={styles.dividerContainer}>
            <Divider style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <Divider style={styles.divider} />
          </View>

          <Button 
            mode="outlined" 
            icon="google"
            onPress={signInWithGoogle} 
            style={styles.googleButton}
            labelStyle={styles.googleButtonLabel}
            disabled={loading}
            contentStyle={styles.googleButtonContent}
          >
            Sign up with Google
          </Button>
        </Surface>
        
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <Text style={styles.loginLink}>Sign in</Text>
          </Link>
        </View>

        <Snackbar
          visible={!!error}
          onDismiss={() => setError('')}
          duration={3000}
          style={styles.snackbar}
          action={{
            label: 'Close',
            onPress: () => setError(''),
          }}
        >
          {error}
        </Snackbar>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 6,
  },
  formCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  input: {
    marginBottom: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  inputOutline: {
    borderRadius: 14,
  },
  registerButton: {
    marginTop: 8,
    backgroundColor: '#1DB954',
    borderRadius: 14,
    paddingVertical: 4,
  },
  registerButtonLabel: {
    fontWeight: '700',
    fontSize: 16,
    color: '#fff',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  divider: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  dividerText: {
    color: 'rgba(255,255,255,0.4)',
    marginHorizontal: 16,
    fontSize: 12,
    fontWeight: '600',
  },
  googleButton: {
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    borderWidth: 1,
  },
  googleButtonLabel: {
    color: '#fff',
    fontWeight: '600',
  },
  googleButtonContent: {
    paddingVertical: 4,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },
  loginLink: {
    color: '#1DB954',
    fontSize: 14,
    fontWeight: '700',
  },
  snackbar: {
    backgroundColor: '#FF4444',
  },
});