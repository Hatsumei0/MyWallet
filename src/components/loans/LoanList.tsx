import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Surface, IconButton, Menu, Portal, Dialog, Button } from 'react-native-paper';
import { useLoans } from '../../context/LoanContext';
import { format } from 'date-fns';
import { Loan } from '../../types/loan';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Props = {
  type: 'BORROWED' | 'LENT';
};

export default function LoanList({ type }: Props) {
  const { loans, isLoading, updateLoanStatus, deleteLoan } = useLoans();
  const [menuVisible, setMenuVisible] = React.useState<string | null>(null);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = React.useState(false);
  const [selectedLoan, setSelectedLoan] = React.useState<Loan | null>(null);

  const filteredLoans = loans.filter(loan => loan.type === type);

  const handleDeletePress = (loan: Loan) => {
    setSelectedLoan(loan);
    setMenuVisible(null);
    setDeleteConfirmVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedLoan) {
      await deleteLoan(selectedLoan.id);
      setDeleteConfirmVisible(false);
      setSelectedLoan(null);
    }
  };

  const formatAmount = (amount: number) => {
    const formatted = new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
    
    return formatted.replace('NPR', 'Rs.');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return '#1DB954';
      case 'OVERDUE': return '#FF4444';
      default: return '#FFA000';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>
          {type === 'BORROWED' ? 'Borrowed From' : 'Lent To'}
        </Text>
        <Surface style={styles.countBadge} elevation={0}>
          <Text style={styles.countText}>{filteredLoans.length}</Text>
        </Surface>
      </View>

      {filteredLoans.length === 0 ? (
        <Surface style={styles.emptyCard} elevation={0}>
          <Text style={styles.emptyText}>No {type.toLowerCase()} records yet.</Text>
        </Surface>
      ) : (
        filteredLoans.map(loan => (
          <Surface key={loan.id} style={styles.loanCard} elevation={1}>
            <View style={styles.cardMain}>
              <View style={[styles.avatar, { backgroundColor: type === 'BORROWED' ? 'rgba(255, 68, 68, 0.1)' : 'rgba(29, 185, 84, 0.1)' }]}>
                <MaterialCommunityIcons 
                  name={type === 'BORROWED' ? 'arrow-down-left' : 'arrow-up-right'} 
                  size={24} 
                  color={type === 'BORROWED' ? '#FF4444' : '#1DB954'} 
                />
              </View>
              
              <View style={styles.loanInfo}>
                <Text style={styles.name}>{loan.name}</Text>
                <View style={styles.detailsRow}>
                  {loan.due_date && (
                    <View style={styles.detailItem}>
                      <MaterialCommunityIcons name="calendar-clock" size={12} color="rgba(255,255,255,0.4)" />
                      <Text style={styles.detailText}>{format(new Date(loan.due_date), 'PP')}</Text>
                    </View>
                  )}
                  <View style={[styles.statusBadge, { borderColor: getStatusColor(loan.status) }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(loan.status) }]}>{loan.status}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.rightAction}>
                <Text style={[styles.amount, { color: type === 'BORROWED' ? '#FF4444' : '#1DB954' }]}>
                  {formatAmount(loan.amount)}
                </Text>
                <Menu
                  visible={menuVisible === loan.id}
                  onDismiss={() => setMenuVisible(null)}
                  contentStyle={styles.menuContent}
                  anchor={
                    <IconButton
                      icon="dots-vertical"
                      iconColor="rgba(255,255,255,0.4)"
                      size={20}
                      onPress={() => setMenuVisible(loan.id)}
                    />
                  }
                >
                  {loan.status !== 'PAID' && (
                    <Menu.Item
                      onPress={() => {
                        updateLoanStatus(loan.id, 'PAID');
                        setMenuVisible(null);
                      }}
                      title="Mark as Paid"
                      leadingIcon="check-circle"
                      titleStyle={{ color: '#fff' }}
                    />
                  )}
                  <Menu.Item
                    onPress={() => handleDeletePress(loan)}
                    title="Delete"
                    leadingIcon="delete"
                    titleStyle={{ color: '#FF4444' }}
                  />
                </Menu>
              </View>
            </View>
          </Surface>
        ))
      )}

      <Portal>
        <Dialog
          visible={deleteConfirmVisible}
          onDismiss={() => setDeleteConfirmVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>Delete Record</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogContent}>
              Delete record with <Text style={{ color: '#fff', fontWeight: '800' }}>{selectedLoan?.name}</Text>?
              This operation is final.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button textColor="rgba(255,255,255,0.6)" onPress={() => setDeleteConfirmVisible(false)}>Cancel</Button>
            <Button mode="contained" buttonColor="#FF4444" onPress={handleDeleteConfirm}>Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#fff',
  },
  emptyCard: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 14,
  },
  loanCard: {
    marginBottom: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  cardMain: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  loanInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '500',
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  rightAction: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '800',
  },
  menuContent: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  dialog: {
    backgroundColor: '#16213e',
    borderRadius: 24,
  },
  dialogTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  dialogContent: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
  },
});