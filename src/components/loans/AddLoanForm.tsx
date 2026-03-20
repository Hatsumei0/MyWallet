import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { TextInput, Button, Text, Card, SegmentedButtons, HelperText, IconButton } from 'react-native-paper';
import { useLoans } from '../../context/LoanContext';
import { CreateLoanDTO } from '../../types/loan';
import { Colors, Spacing } from "../../theme";

interface AddLoanFormProps {
  onClose: () => void;
}

const AddLoanForm: React.FC<AddLoanFormProps> = ({ onClose }) => {
  const { createLoan } = useLoans();
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [type, setType] = useState<'BORROWED' | 'LENT'>('BORROWED');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    if (!name.trim()) {
      newErrors.name = 'Please enter a valid name';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const dataForSupabase = {
        amount: Number(amount),
        name: name.trim(),
        description: description.trim() || undefined,
        type,
        due_date: dueDate ? dueDate.toISOString() : undefined,
      };
      await createLoan(dataForSupabase);
      onClose();
    } catch (error) {
      console.error('Error creating loan:', error);
      setErrors({ submit: 'Failed to create loan, please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cross-platform date picker handling
  const handleDateChange = () => {
    if (Platform.OS === 'web') {
      // Use native HTML date input on web
      const input = document.createElement('input');
      input.type = 'date';
      input.min = new Date().toISOString().split('T')[0];
      if (dueDate) {
        input.value = dueDate.toISOString().split('T')[0];
      }
      input.onchange = (e: any) => {
        const selectedDate = new Date(e.target.value + 'T00:00:00');
        if (!isNaN(selectedDate.getTime())) {
          setDueDate(selectedDate);
        }
      };
      input.click();
    } else {
      setShowDatePicker(true);
    }
  };

  const renderNativeDatePicker = () => {
    if (Platform.OS === 'web' || !showDatePicker) return null;
    
    // Dynamic import for native only
    const DateTimePicker = require('@react-native-community/datetimepicker').default;
    return (
      <DateTimePicker
        value={dueDate || new Date()}
        mode="date"
        display="default"
        onChange={(event: any, selectedDate?: Date) => {
          setShowDatePicker(false);
          if (selectedDate) {
            setDueDate(selectedDate);
          }
        }}
        minimumDate={new Date()}
      />
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>
            {type === 'BORROWED' ? '💸' : '🤝'} Add New Loan
          </Text>

          <SegmentedButtons
            value={type}
            onValueChange={(value) => setType(value as 'BORROWED' | 'LENT')}
            buttons={[
              { 
                value: 'BORROWED', 
                label: '💸 Borrowed',
                style: type === 'BORROWED' ? styles.activeSegmentBorrowed : undefined,
              },
              { 
                value: 'LENT', 
                label: '🤝 Lent',
                style: type === 'LENT' ? styles.activeSegmentLent : undefined,
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
            label="Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
            error={!!errors.name}
            left={<TextInput.Icon icon="account" />}
            placeholder="Who is this loan with?"
            placeholderTextColor="#a1a1a1"
            outlineStyle={styles.inputOutline}
          />
          <HelperText type="error" visible={!!errors.name}>
            {errors.name}
          </HelperText>

          <TextInput
            mode="outlined"
            label="Description (Optional)"
            value={description}
            onChangeText={setDescription}
            style={styles.input}
            multiline
            numberOfLines={2}
            left={<TextInput.Icon icon="note-text" />}
            placeholder="What is this loan for?"
            placeholderTextColor="#a1a1a1"
            outlineStyle={styles.inputOutline}
          />

          {/* Due Date Section */}
          <View style={styles.dateSection}>
            <Button
              mode={dueDate ? 'contained' : 'outlined'}
              onPress={handleDateChange}
              style={[styles.dateButton, dueDate && styles.dateButtonActive]}
              icon="calendar"
              labelStyle={dueDate ? styles.dateButtonLabelActive : undefined}
              contentStyle={styles.dateButtonContent}
            >
              {dueDate ? formatDate(dueDate) : 'Set Due Date'}
            </Button>
            {dueDate && (
              <IconButton
                icon="close-circle"
                size={20}
                onPress={() => setDueDate(null)}
                iconColor="#FF4444"
                style={styles.clearDateButton}
              />
            )}
          </View>

          {renderNativeDatePicker()}

          {errors.submit && (
            <Text style={styles.errorText}>{errors.submit}</Text>
          )}

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={isSubmitting}
              disabled={isSubmitting}
              style={[styles.button, styles.saveButton]}
              labelStyle={styles.saveButtonLabel}
              icon="check"
            >
              Save
            </Button>
            <Button 
              mode="outlined" 
              onPress={onClose} 
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
    margin: Spacing.small,
    borderRadius: 20,
    padding: Spacing.large,
    backgroundColor: Colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    width: '100%',
    maxWidth: 500,
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
  activeSegmentBorrowed: {
    backgroundColor: 'rgba(255, 68, 68, 0.2)',
  },
  activeSegmentLent: {
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
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.medium,
  },
  dateButton: {
    flex: 1,
    borderRadius: 12,
  },
  dateButtonActive: {
    backgroundColor: 'rgba(29, 185, 84, 0.15)',
    borderColor: '#1DB954',
  },
  dateButtonContent: {
    paddingVertical: 6,
  },
  dateButtonLabelActive: {
    color: '#1DB954',
    fontWeight: '600',
  },
  clearDateButton: {
    marginLeft: 4,
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
  errorText: {
    color: Colors.error,
    marginTop: Spacing.small,
    textAlign: 'center',
    fontSize: 14,
  },
});

export default AddLoanForm;