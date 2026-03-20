import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Alert, Platform } from 'react-native';
import { 
  List, 
  Switch, 
  Text, 
  Button, 
  Divider, 
  Portal, 
  Dialog, 
  TextInput,
  Surface,
  Avatar,
  IconButton,
  ActivityIndicator
} from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import * as Linking from 'expo-linking';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, router } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { usePreferences } from '../../src/context/PreferencesContext';
import { useTransactions } from '../../src/context/TransactionContext';
import { useLoans } from '../../src/context/LoanContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  onPress?: () => void | Promise<void>;
  right?: () => React.ReactNode;
  titleStyle?: object;
  iconColor?: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export default function SettingsScreen() {
  const { session, signOut, updateProfile } = useAuth();
  const { theme: appTheme, toggleTheme } = usePreferences();
  const { refreshTransactions } = useTransactions();
  const { refreshLoans } = useLoans();
  const [editingUsername, setEditingUsername] = useState(false);
  const [username, setUsername] = useState(session?.user?.user_metadata?.display_name || session?.user?.email?.split('@')[0] || 'User');
  const [tempUsername, setTempUsername] = useState(username);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (session?.user?.user_metadata?.display_name) {
      setUsername(session.user.user_metadata.display_name);
    }
  }, [session?.user]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSaveUsername = async () => {
    if (!tempUsername.trim()) {
      Alert.alert("Error", "Username cannot be empty");
      return;
    }
    
    setIsSavingProfile(true);
    try {
      const { error } = await updateProfile(tempUsername.trim());
      if (error) throw error;
      
      setUsername(tempUsername.trim());
      setEditingUsername(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSyncData = () => {
    Alert.alert(
      "Sync Data",
      "This will refresh all your records from the server. Use this if your balance seems incorrect.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Sync Now", 
          onPress: async () => {
            try {
              await refreshTransactions(true);
              await refreshLoans();
              Alert.alert("Success", "Your wallet is now up to date.");
            } catch (err) {
              Alert.alert("Error", "Failed to sync data. Please check your connection.");
            }
          } 
        }
      ]
    );
  };

  const menuItems: MenuSection[] = [
    {
      title: 'Preferences',
      items: [
        {
          id: 'dark-mode',
          label: 'Dark Mode',
          icon: appTheme === 'dark' ? 'weather-night' : 'white-balance-sunny',
          right: () => (
            <Switch
              value={appTheme === 'dark'}
              onValueChange={toggleTheme}
              color="#1DB954"
            />
          ),
        },
      ],
    },
    {
      title: 'Data & Privacy',
      items: [
        {
          id: 'sync-data',
          label: 'Force Sync Data',
          icon: 'sync',
          onPress: handleSyncData,
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          id: 'logout',
          label: 'Log Out',
          icon: 'logout',
          onPress: handleLogout,
          titleStyle: { color: '#FF4444' },
          iconColor: '#FF4444',
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.gradient}>
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
          <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            {/* Header / Profile Section */}
            <View style={styles.header}>
              <Surface style={styles.avatarSurface} elevation={4}>
                <Avatar.Text 
                  size={80} 
                  label={username.substring(0, 2).toUpperCase()} 
                  style={{ backgroundColor: '#1DB954' }}
                />
              </Surface>
              <View style={styles.profileTextContainer}>
                <View style={[styles.row, { paddingLeft: 24 }]}>
                  <Text style={styles.displayName}>{username}</Text>
                  <IconButton 
                    icon="pencil-outline" 
                    size={16} 
                    iconColor="rgba(255,255,255,0.4)" 
                    onPress={() => {
                      setTempUsername(username);
                      setEditingUsername(true);
                    }}
                  />
                </View>
                <Text style={styles.userEmail}>{session?.user?.email}</Text>
              </View>
            </View>

            {/* Menu Sections */}
            {menuItems.map((section, idx) => (
              <View key={idx} style={styles.section}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Surface style={styles.sectionSurface} elevation={1}>
                  {section.items.map((item, itemIdx) => (
                    <React.Fragment key={item.id}>
                      <TouchableOpacity 
                        onPress={item.onPress} 
                        disabled={!item.onPress}
                        activeOpacity={0.7}
                      >
                        <List.Item
                          title={item.label}
                          titleStyle={[styles.itemLabel, item.titleStyle]}
                          left={props => (
                            <List.Icon 
                              {...props} 
                              icon={item.icon} 
                              color={item.iconColor || 'rgba(255,255,255,0.6)'} 
                            />
                          )}
                          right={item.right}
                          style={styles.listItem}
                        />
                      </TouchableOpacity>
                      {itemIdx < section.items.length - 1 && <Divider style={styles.divider} />}
                    </React.Fragment>
                  ))}
                </Surface>
              </View>
            ))}

            <View style={styles.footer}>
              <View style={styles.logoContainer}>
                <Text style={styles.logoText}>MW</Text>
              </View>
              <Text style={styles.appVersion}>MyWallet v1.0.0</Text>
              <Text style={styles.credits}>Developed by Abiskar Acharya</Text>
            </View>
          </ScrollView>

          <Portal>
            <Dialog
              visible={editingUsername}
              onDismiss={() => !isSavingProfile && setEditingUsername(false)}
              style={styles.dialog}
            >
              <Dialog.Title style={styles.dialogTitle}>Edit Display Name</Dialog.Title>
              <Dialog.Content>
                <TextInput
                  placeholder="New display name"
                  value={tempUsername}
                  onChangeText={setTempUsername}
                  mode="outlined"
                  autoFocus
                  disabled={isSavingProfile}
                  style={styles.dialogInput}
                  outlineStyle={styles.inputOutline}
                  outlineColor="rgba(255,255,255,0.15)"
                  activeOutlineColor="#1DB954"
                  textColor="#fff"
                />
              </Dialog.Content>
              <Dialog.Actions>
                <Button 
                  textColor="rgba(255,255,255,0.6)" 
                  onPress={() => setEditingUsername(false)}
                  disabled={isSavingProfile}
                >
                  Cancel
                </Button>
                <Button 
                  mode="contained" 
                  buttonColor="#1DB954" 
                  onPress={handleSaveUsername}
                  loading={isSavingProfile}
                  disabled={isSavingProfile}
                >
                  Save
                </Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  avatarSurface: {
    borderRadius: 50,
    position: 'relative',
    padding: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  profileTextContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  displayName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginLeft: 8,
    marginBottom: 8,
  },
  sectionSurface: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  listItem: {
    paddingVertical: 4,
  },
  itemLabel: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  divider: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginHorizontal: 16,
  },
  footer: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontWeight: 'bold',
  },
  appVersion: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontWeight: '600',
  },
  credits: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 11,
    marginTop: 4,
  },
  dialog: {
    backgroundColor: '#16213e',
    borderRadius: 24,
  },
  dialogTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  dialogInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  inputOutline: {
    borderRadius: 14,
  },
});