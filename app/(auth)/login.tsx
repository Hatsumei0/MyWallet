import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button, TextInput, useTheme, Snackbar, Surface, Divider } from 'react-native-paper';
import { Link, router } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const theme = useTheme();
  const { signIn, signInWithGoogle, session } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (session?.user) {
      router.replace('/(app)/home');
    }
  }, [session]);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        setError(signInError.message);
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
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>MW</Text>
          </View>
          <Text style={styles.appName}>MyWallet</Text>
          <Text style={styles.tagline}>Track your finances with ease</Text>
        </View>
        
        <Surface style={styles.formCard} elevation={5}>
          <Text style={styles.welcomeText}>Welcome Back</Text>
          
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
          
          <Button 
            mode="contained" 
            onPress={handleLogin} 
            style={styles.loginButton}
            labelStyle={styles.loginButtonLabel}
            loading={loading}
            disabled={loading}
            icon="login"
          >
            Sign In
          </Button>

          <Button 
            mode="text" 
            onPress={() => router.push('/(auth)/forgot-password')}
            disabled={loading}
            style={styles.forgotButton}
            labelStyle={styles.forgotButtonLabel}
          >
            Forgot Password?
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
            Continue with Google
          </Button>
        </Surface>
        
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <Link href="/(auth)/register" asChild>
            <Text style={styles.signupLink}>Sign up</Text>
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
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#1DB954',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  logoText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
  },
  formCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  inputOutline: {
    borderRadius: 14,
  },
  loginButton: {
    marginTop: 8,
    backgroundColor: '#1DB954',
    borderRadius: 14,
    paddingVertical: 4,
  },
  loginButtonLabel: {
    fontWeight: '700',
    fontSize: 16,
    color: '#fff',
  },
  forgotButton: {
    marginTop: 8,
  },
  forgotButtonLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
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
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  signupText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },
  signupLink: {
    color: '#1DB954',
    fontSize: 14,
    fontWeight: '700',
  },
  snackbar: {
    backgroundColor: '#FF4444',
  },
});