import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, SegmentedButtons, Text, Card, HelperText } from 'react-native-paper';
import { CreateTransactionDTO, Transaction, TransactionType } from '../services/transaction';
import { Colors, Spacing } from "../theme";

interface TransactionFormProps {
  onSubmit: (data: CreateTransactionDTO) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  initialData?: Transaction;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  onSubmit,
  onCancel,
  isLoading,
  initialData
}) => {
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [type, setType] = useState<TransactionType>(initialData?.type || 'EXPENSE');
  const [description, setDescription] = useState(initialData?.description || '');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      setAmount(initialData.amount.toString());
      setType(initialData.type);
      setDescription(initialData.description);
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    if (!description.trim()) {
      newErrors.description = 'Please enter a short description';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const payload: CreateTransactionDTO = {
      amount: parseFloat(amount),
      type,
      description: description.trim(),
      date: initialData?.date || new Date().toISOString(),
    };
    onSubmit(payload);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>
            {initialData ? '✏️ Edit Transaction' : '🆕 New Transaction'}
          </Text>

          <SegmentedButtons
            value={type}
            onValueChange={value => setType(value as TransactionType)}
            buttons={[
              { 
                value: 'EXPENSE', 
                label: '💸 Expense',
                style: type === 'EXPENSE' ? styles.activeSegmentExpense : undefined,
              },
              { 
                value: 'INCOME', 
                label: '💰 Income',
                style: type === 'INCOME' ? styles.activeSegmentIncome : undefined,
              },
            ]}
            style={styles.segment}
          />

          <TextInput
            mode="outlined"
            label="Amount (रू)"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            style={styles.input}
            error={!!errors.amount}
            left={
              <TextInput.Icon
                icon={() => (
                  <Text style={{ color: '#a1a1a1', fontSize: 20 }}>रू</Text>
                )}
              />
            }
            placeholder="Enter amount"
            placeholderTextColor="#a1a1a1"
            outlineStyle={styles.inputOutline}
          />
          <HelperText type="error" visible={!!errors.amount}>
            {errors.amount}
          </HelperText>

          <TextInput
            mode="outlined"
            label="Description"
            value={description}
            onChangeText={setDescription}
            style={styles.input}
            error={!!errors.description}
            left={<TextInput.Icon icon="text" />}
            placeholder="What was this for?"
            placeholderTextColor="#a1a1a1"
            outlineStyle={styles.inputOutline}
          />
          <HelperText type="error" visible={!!errors.description}>
            {errors.description}
          </HelperText>

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={isLoading}
              disabled={isLoading}
              style={[styles.button, styles.saveButton]}
              labelStyle={styles.saveButtonLabel}
              icon="check"
            >
              {initialData ? 'Update' : 'Save'}
            </Button>
            <Button 
              mode="outlined" 
              onPress={onCancel} 
              style={[styles.button, styles.cancelButton]}
              icon="close"
            >
              Cancel
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.medium,
  },
  card: {
    borderRadius: 20,
    backgroundColor: Colors.card,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    marginBottom: Spacing.medium,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  segment: {
    marginBottom: Spacing.medium,
  },
  activeSegmentExpense: {
    backgroundColor: 'rgba(255, 68, 68, 0.2)',
  },
  activeSegmentIncome: {
    backgroundColor: 'rgba(29, 185, 84, 0.2)',
  },
  input: {
    marginBottom: 4,
    backgroundColor: Colors.input,
    fontSize: 16,
  },
  inputOutline: {
    borderRadius: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.large,
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 12,
  },
  saveButton: {
    backgroundColor: '#1DB954',
    paddingVertical: 4,
  },
  saveButtonLabel: {
    fontWeight: '700',
    fontSize: 16,
  },
  cancelButton: {
    borderColor: 'rgba(255,255,255,0.2)',
  },
});