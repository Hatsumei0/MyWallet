import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet, StatusBar, Platform, TouchableOpacity } from 'react-native';
import { Text, FAB, useTheme, Card, Portal, Modal, Snackbar, Button, Dialog, SegmentedButtons, Surface, Appbar, IconButton, Badge } from 'react-native-paper';
import { useTransactions } from '../../src/context/TransactionContext';
import { useLoans } from '../../src/context/LoanContext';
import { TransactionList } from '../../src/components/TransactionList';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TransactionForm } from '../../src/components/TransactionForm';
import { CreateTransactionDTO, Transaction, TransactionType } from '../../src/services/transaction';
import { useAuth } from '../../src/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

// Add a custom Logo component
const Logo = () => {
  return (
    <View style={styles.logoContainer}>
      <Text style={styles.logoText}>MW</Text>
    </View>
  );
};

function Home() {
  const theme = useTheme();
  const { 
    transactions, 
    balance, 
    isLoading, 
    refreshTransactions, 
    createTransaction, 
    deleteTransaction,
    updateTransaction 
  } = useTransactions();
  const { loans, refreshLoans } = useLoans();
  
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const { session } = useAuth();
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'ALL'>('ALL');
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);

  useEffect(() => {
    if (session?.user) {
      refreshTransactions(true);
      refreshLoans();
    }
  }, []);

  const formatBalance = (amount: number) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.abs(amount));
    
    return (amount < 0 ? '-' : '') + formatted.replace('NPR', 'Rs.');
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsFormVisible(true);
  };

  const handleSubmitTransaction = async (data: CreateTransactionDTO) => {
    setIsSubmitting(true);
    setError(null);

    try {
      let result;
      if (selectedTransaction) {
        result = await updateTransaction({
          id: selectedTransaction.id,
          ...data,
        });
      } else {
        result = await createTransaction(data);
      }

      if (result.error) {
        setError(result.error.message);
        return;
      }
      setIsFormVisible(false);
      setSelectedTransaction(null);
    } catch (err) {
      setError(`Failed to ${selectedTransaction ? 'update' : 'create'} transaction`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTransaction = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setDeleteConfirmVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!transactionToDelete) return;
    
    try {
      setError(null);
      const result = await deleteTransaction(transactionToDelete.id);
      if (result.error) {
        setError(result.error.message);
        return;
      }
      setDeleteConfirmVisible(false);
      setTransactionToDelete(null);
    } catch (error) {
      setError('Failed to delete transaction');
    }
  };

  const filteredTransactions = transactions.filter(t => 
    typeFilter === 'ALL' ? true : t.type === typeFilter
  );

  const totalIncome = transactions.reduce((sum, t) => sum + (t.type === 'INCOME' ? t.amount : 0), 0);
  const totalExpense = transactions.reduce((sum, t) => sum + (t.type === 'EXPENSE' ? t.amount : 0), 0);

  // Notifications calculation
  const pendingLoans = loans.filter(l => l.status === 'PENDING').length;
  const overdueLoans = loans.filter(l => l.status === 'OVERDUE').length;
  const alertCount = pendingLoans + overdueLoans;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#1a1a2e', '#16213e']}
        style={styles.gradient}
      >
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
          <Appbar.Header style={styles.appBar}>
            <Logo />
            <Appbar.Content 
              title={session?.user?.user_metadata?.display_name ? `Hi, ${session.user.user_metadata.display_name.split(' ')[0]}!` : "MyWallet"} 
              titleStyle={styles.appbarTitle} 
            />
            <View>
              <IconButton 
                icon="bell-outline" 
                iconColor="#fff" 
                onPress={() => setShowNotificationDialog(true)} 
              />
              {alertCount > 0 && (
                <Badge 
                  visible={true} 
                  size={16} 
                  style={styles.notificationBadge}
                >
                  {alertCount}
                </Badge>
              )}
            </View>
          </Appbar.Header>

          <ScrollView 
            style={styles.content}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl 
                refreshing={isLoading} 
                onRefresh={() => {
                  refreshTransactions(true);
                  refreshLoans();
                }}
                tintColor="#1DB954"
                colors={['#1DB954']}
              />
            }
          >
            {/* Premium Balance Card */}
            <Surface style={styles.balanceSurface} elevation={4}>
              <LinearGradient
                colors={['#1DB954', '#158a3e']}
                style={styles.balanceGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.balanceHeader}>
                  <Text style={styles.balanceLabel}>Current Balance</Text>
                  <MaterialCommunityIcons name="wallet-outline" size={24} color="rgba(255,255,255,0.8)" />
                </View>
                <Text style={styles.balanceAmount}>
                  {formatBalance(balance)}
                </Text>
                <View style={styles.balanceFooter}>
                  <View style={styles.balanceSubItem}>
                    <MaterialCommunityIcons name="arrow-up" size={16} color="#ffffff" />
                    <Text style={styles.balanceSubText}>{formatBalance(totalIncome)}</Text>
                  </View>
                  <View style={styles.balanceDivider} />
                  <View style={styles.balanceSubItem}>
                    <MaterialCommunityIcons name="arrow-down" size={16} color="#ffffff" />
                    <Text style={styles.balanceSubText}>{formatBalance(totalExpense)}</Text>
                  </View>
                </View>
              </LinearGradient>
            </Surface>

            {/* Quick Summary Section */}
            <View style={styles.summaryGrid}>
              <Surface style={styles.summaryItem} elevation={1}>
                <View style={[styles.iconBadge, { backgroundColor: 'rgba(29, 185, 84, 0.15)' }]}>
                  <MaterialCommunityIcons name="trending-up" size={20} color="#1DB954" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.summaryItemLabel}>Income</Text>
                  <Text style={[styles.summaryItemValue, { color: '#1DB954' }]} numberOfLines={1}>{formatBalance(totalIncome)}</Text>
                </View>
              </Surface>
              <Surface style={styles.summaryItem} elevation={1}>
                <View style={[styles.iconBadge, { backgroundColor: 'rgba(255, 68, 68, 0.15)' }]}>
                  <MaterialCommunityIcons name="trending-down" size={20} color="#FF4444" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.summaryItemLabel}>Expenses</Text>
                  <Text style={[styles.summaryItemValue, { color: '#FF4444' }]} numberOfLines={1}>{formatBalance(totalExpense)}</Text>
                </View>
              </Surface>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Transactions</Text>
              <View style={styles.segmentedButtonsContainer}>
                <SegmentedButtons
                  value={typeFilter}
                  onValueChange={value => setTypeFilter(value as TransactionType | 'ALL')}
                  buttons={[
                    { value: 'ALL', label: 'All', labelStyle: styles.segmentLabel },
                    { value: 'INCOME', label: 'In', labelStyle: styles.segmentLabel },
                    { value: 'EXPENSE', label: 'Out', labelStyle: styles.segmentLabel },
                  ]}
                  style={styles.filterButtons}
                  density="small"
                />
              </View>
            </View>

            {filteredTransactions.length > 0 ? (
              <TransactionList 
                transactions={filteredTransactions}
                onEdit={handleEditTransaction}
                onDelete={handleDeleteTransaction}
              />
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="script-text-outline" size={64} color="rgba(255,255,255,0.1)" />
                <Text style={styles.emptyStateText}>No transactions found</Text>
              </View>
            )}
            
            <View style={{ height: 100 }} />
          </ScrollView>

          <Portal>
            {/* Notification Dialog */}
            <Dialog 
              visible={showNotificationDialog} 
              onDismiss={() => setShowNotificationDialog(false)}
              style={styles.dialog}
            >
              <Dialog.Title style={styles.dialogTitle}>Notifications</Dialog.Title>
              <Dialog.Content>
                {alertCount === 0 ? (
                  <Text style={styles.dialogText}>All caught up! No pending tasks.</Text>
                ) : (
                  <View style={{ gap: 12 }}>
                    {pendingLoans > 0 && (
                      <TouchableOpacity 
                        style={styles.notifItem} 
                        onPress={() => {
                          setShowNotificationDialog(false);
                          router.push('/(app)/loans');
                        }}
                      >
                        <MaterialCommunityIcons name="clock-outline" size={20} color="#FFA000" />
                        <Text style={styles.notifText}>You have {pendingLoans} pending loans to settle.</Text>
                      </TouchableOpacity>
                    )}
                    {overdueLoans > 0 && (
                      <TouchableOpacity 
                        style={styles.notifItem} 
                        onPress={() => {
                          setShowNotificationDialog(false);
                          router.push('/(app)/loans');
                        }}
                      >
                        <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#FF4444" />
                        <Text style={styles.notifText}>You have {overdueLoans} overdue loans!</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </Dialog.Content>
              <Dialog.Actions>
                <Button textColor="#1DB954" onPress={() => setShowNotificationDialog(false)}>Dismiss</Button>
              </Dialog.Actions>
            </Dialog>

            <Modal
              visible={isFormVisible}
              onDismiss={() => {
                setIsFormVisible(false);
                setSelectedTransaction(null);
                setError(null);
              }}
              contentContainerStyle={styles.modalContent}
            >
              <TransactionForm
                onSubmit={handleSubmitTransaction}
                onCancel={() => {
                  setIsFormVisible(false);
                  setSelectedTransaction(null);
                  setError(null);
                }}
                isLoading={isSubmitting}
                initialData={selectedTransaction || undefined}
              />
            </Modal>

            <Dialog visible={deleteConfirmVisible} onDismiss={() => setDeleteConfirmVisible(false)} style={styles.dialog}>
              <Dialog.Title style={styles.dialogTitle}>Delete Transaction</Dialog.Title>
              <Dialog.Content>
                <Text style={styles.dialogText}>
                  Are you sure you want to delete this transaction? This action cannot be undone.
                </Text>
              </Dialog.Content>
              <Dialog.Actions>
                <Button textColor="rgba(255,255,255,0.6)" onPress={() => setDeleteConfirmVisible(false)}>Cancel</Button>
                <Button mode="contained" buttonColor="#FF4444" onPress={handleDeleteConfirm}>Delete</Button>
              </Dialog.Actions>
            </Dialog>

            <Snackbar
              visible={!!error}
              onDismiss={() => setError(null)}
              style={styles.snackbar}
              action={{
                label: 'Close',
                onPress: () => setError(null),
              }}
            >
              {error}
            </Snackbar>
          </Portal>

          <FAB
            icon="plus"
            style={styles.fab}
            onPress={() => {
              setIsFormVisible(true);
              setSelectedTransaction(null);
              setError(null);
            }}
            color="#ffffff"
          />
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
  appBar: {
    backgroundColor: 'transparent',
    elevation: 0,
    height: 64,
  },
  logoContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
    marginRight: 8,
  },
  logoText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  appbarTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#FF4444',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  balanceSurface: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
  },
  balanceGradient: {
    padding: 24,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 20,
  },
  balanceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 12,
    padding: 12,
  },
  balanceSubItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  balanceSubText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  balanceDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryItemLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  summaryItemValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  filterSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    minWidth: 120,
  },
  segmentedButtonsContainer: {
    flex: 1,
    maxWidth: 220,
    alignItems: 'flex-end',
  },
  filterButtons: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    width: '100%',
  },
  segmentLabel: {
    fontSize: 11,
    color: '#fff',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    color: 'rgba(255,255,255,0.3)',
    marginTop: 12,
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    margin: 20,
    right: 0,
    bottom: 0,
    backgroundColor: '#1DB954',
    borderRadius: 16,
    elevation: 6,
  },
  modalContent: {
    backgroundColor: '#16213e',
    padding: 24,
    margin: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
  },
  notifText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    flex: 1,
  },
  dialog: {
    backgroundColor: '#16213e',
    borderRadius: 24,
  },
  dialogTitle: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '800',
  },
  dialogText: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  snackbar: {
    backgroundColor: '#FF4444',
  },
});

export default Home;