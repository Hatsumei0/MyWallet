import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Surface, IconButton, Menu } from 'react-native-paper';
import { Transaction } from '../services/transaction';
import { format } from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface TransactionCardProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  onEdit,
  onDelete,
}) => {
  const [menuVisible, setMenuVisible] = React.useState(false);

  const formatAmount = (amount: number, type: 'INCOME' | 'EXPENSE') => {
    const formatted = new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
    
    const res = formatted.replace('NPR', 'Rs.');
    return type === 'EXPENSE' ? `- ${res}` : `+ ${res}`;
  };

  const isIncome = transaction.type === 'INCOME';

  const getCategoryIcon = (category?: string) => {
    const cat = category?.toLowerCase();
    if (cat?.includes('food')) return 'silverware-fork-knife';
    if (cat?.includes('shopping')) return 'cart-outline';
    if (cat?.includes('transport') || cat?.includes('ride') || cat?.includes('gas')) return 'car-outline';
    if (cat?.includes('rent') || cat?.includes('home')) return 'home-outline';
    if (cat?.includes('salary') || cat?.includes('income')) return 'cash-multiple';
    return isIncome ? 'arrow-down-circle-outline' : 'arrow-up-circle-outline';
  };

  return (
    <Surface style={styles.card} elevation={1}>
      <View style={styles.cardContent}>
        <View style={[styles.iconContainer, { backgroundColor: isIncome ? 'rgba(29, 185, 84, 0.1)' : 'rgba(255, 68, 68, 0.1)' }]}>
          <MaterialCommunityIcons 
            name={getCategoryIcon(transaction.category || transaction.description)} 
            size={22} 
            color={isIncome ? '#1DB954' : '#FF4444'} 
          />
        </View>

        <View style={styles.leftContent}>
          <Text style={styles.description} numberOfLines={1}>
            {transaction.description}
          </Text>
          <Text style={styles.metadata}>
            {format(new Date(transaction.date), 'MMM d, h:mm a')}
          </Text>
        </View>

        <View style={styles.rightContent}>
          <Text
            style={[
              styles.amount,
              isIncome ? styles.incomeAmount : styles.expenseAmount,
            ]}
          >
            {formatAmount(transaction.amount, transaction.type)}
          </Text>
          
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            contentStyle={styles.menuContent}
            anchor={
              <IconButton
                icon="dots-vertical"
                iconColor="rgba(255,255,255,0.3)"
                size={20}
                onPress={() => setMenuVisible(true)}
              />
            }
          >
            <Menu.Item
              onPress={() => {
                onEdit(transaction);
                setMenuVisible(false);
              }}
              title="Edit"
              leadingIcon="pencil-outline"
              titleStyle={{ color: '#fff' }}
            />
            <Menu.Item
              onPress={() => {
                onDelete(transaction);
                setMenuVisible(false);
              }}
              title="Delete"
              leadingIcon="trash-can-outline"
              titleStyle={{ color: '#FF4444' }}
            />
          </Menu>
        </View>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  leftContent: {
    flex: 1,
    justifyContent: 'center',
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  description: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  metadata: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontWeight: '600',
  },
  amount: {
    fontSize: 15,
    fontWeight: '800',
  },
  incomeAmount: {
    color: '#1DB954',
  },
  expenseAmount: {
    color: '#FF4444',
  },
  menuContent: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
});