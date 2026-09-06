import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Platform, 
  Alert, 
  KeyboardAvoidingView, 
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { ItemContext } from '../context/ItemsContext';
import { ThemeContext } from '../context/ThemeContext';

export default function AddItemScreen({ navigation }: any) {
  const { addItem, items } = useContext(ItemContext);
  const { colors } = useContext(ThemeContext);
  
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [purchaseDate, setPurchaseDate] = useState(moment().format('YYYY-MM-DD'));
  const [expiryDate, setExpiryDate] = useState('');
  const [category, setCategory] = useState<'food' | 'non-food'>('food');
  
  const [showPurchaseDatePicker, setShowPurchaseDatePicker] = useState(false);
  const [purchaseDateVal, setPurchaseDateVal] = useState(new Date());

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateVal, setDateVal] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => prev > 1 ? prev - 1 : 1);

  const onPurchaseDateChange = (event: any, selectedDate?: Date) => {
    setShowPurchaseDatePicker(false);
    if (selectedDate) {
      setPurchaseDateVal(selectedDate);
      setPurchaseDate(moment(selectedDate).format('YYYY-MM-DD'));
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDateVal(selectedDate);
      setExpiryDate(moment(selectedDate).format('YYYY-MM-DD'));
    }
  };

  const handleAddItem = async () => {
    if (!productName.trim()) {
      Alert.alert('Error', 'Please enter a product name');
      return;
    }

    if (!expiryDate) {
      Alert.alert('Error', 'Please choose an expiry date');
      return;
    }

    setLoading(true);
    try {
      // Check for duplicate product name with exact same expiry date
      const isExactDuplicate = items.some(
        item => item.productName.toLowerCase() === productName.trim().toLowerCase() && item.expiryDate === expiryDate
      );

      if (isExactDuplicate) {
        Alert.alert(
          'Existing Batch Found',
          `You already have '${productName.trim()}' with expiry date ${expiryDate}. Add another batch anyway?`,
          [
            { text: 'Cancel', style: 'cancel', onPress: () => setLoading(false) },
            { 
              text: 'Add Batch', 
              onPress: async () => {
                await addItem({ productName: productName.trim(), quantity, purchaseDate, expiryDate, category });
                setLoading(false);
                setProductName('');
                setQuantity(1);
                setPurchaseDate(moment().format('YYYY-MM-DD'));
                setExpiryDate('');
                setCategory('food');
                navigation.navigate('Groceries');
              }
            }
          ]
        );
      } else {
        await addItem({ productName: productName.trim(), quantity, purchaseDate, expiryDate, category });
        setLoading(false);
        setProductName('');
        setQuantity(1);
        setPurchaseDate(moment().format('YYYY-MM-DD'));
        setExpiryDate('');
        setCategory('food');
        navigation.navigate('Groceries');
      }
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Error', error.message || 'Failed to add item');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          <Text style={[styles.sectionHeaderTitle, { color: colors.text, fontSize: 20 }]}>Add Groceries</Text>

          {/* Batch Info Note */}
          <View style={[styles.batchNoteCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="information-circle-outline" size={18} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={[styles.batchNoteText, { color: colors.textSecondary, fontSize: 12, flex: 1 }]}>
              Bought the same item with different expiry dates? Add them as separate entries to track each batch independently.
            </Text>
          </View>

          {/* Product Name */}
          <Text style={[styles.inputLabel, { color: colors.text, fontSize: 14 }]}>Product Name</Text>
          <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border, height: 50 }]}>
            <TextInput
              placeholder="Enter product name..."
              placeholderTextColor={colors.textSecondary}
              value={productName}
              onChangeText={setProductName}
              style={[styles.input, { color: colors.text, fontSize: 15 }]}
            />
          </View>

          {/* Category Selector */}
          <Text style={[styles.inputLabel, { color: colors.text, fontSize: 14 }]}>Category</Text>
          <View style={styles.categoryContainer}>
            <TouchableOpacity 
              style={[
                styles.categoryBtn, 
                { borderColor: colors.primary, backgroundColor: colors.card, height: 46 },
                category === 'food' && { backgroundColor: colors.primary }
              ]} 
              onPress={() => setCategory('food')}
            >
              <MaterialCommunityIcons 
                name="food-apple" 
                size={18} 
                color={category === 'food' ? '#FFFFFF' : colors.primary} 
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.categoryBtnText, { color: colors.primary, fontSize: 14 }, category === 'food' && styles.categoryBtnTextActive]}>
                Food Item
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.categoryBtn, 
                { borderColor: colors.primary, backgroundColor: colors.card, height: 46 },
                category === 'non-food' && { backgroundColor: colors.primary }
              ]} 
              onPress={() => setCategory('non-food')}
            >
              <MaterialCommunityIcons 
                name="package-variant-closed" 
                size={18} 
                color={category === 'non-food' ? '#FFFFFF' : colors.primary} 
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.categoryBtnText, { color: colors.primary, fontSize: 14 }, category === 'non-food' && styles.categoryBtnTextActive]}>
                Non-Food
              </Text>
            </TouchableOpacity>
          </View>

          {/* Quantity Stepper */}
          <Text style={[styles.inputLabel, { color: colors.text, fontSize: 14 }]}>Quantity</Text>
          <View style={styles.stepperContainer}>
            <TouchableOpacity onPress={decrementQuantity} style={[styles.stepperBtn, { borderColor: colors.border, backgroundColor: colors.card, height: 46, width: 46 }]}>
              <Ionicons name="remove" size={20} color={colors.primary} />
            </TouchableOpacity>
            
            <View style={styles.quantityDisplay}>
              <Text style={[styles.quantityText, { color: colors.text, fontSize: 18 }]}>{quantity}</Text>
            </View>

            <TouchableOpacity onPress={incrementQuantity} style={[styles.stepperBtn, { borderColor: colors.border, backgroundColor: colors.card, height: 46, width: 46 }]}>
              <Ionicons name="add" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Purchase Date */}
          <Text style={[styles.inputLabel, { color: colors.text, fontSize: 14 }]}>Purchase Date</Text>
          {Platform.OS === 'web' ? (
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              style={{
                ...styles.webDateInput,
                borderColor: colors.border,
                backgroundColor: colors.card,
                color: colors.text,
                fontSize: 15,
                height: 50,
                paddingHorizontal: 12,
                marginBottom: 16
              } as any}
            />
          ) : (
            <View style={{ marginBottom: 16 }}>
              <TouchableOpacity 
                style={[styles.dateSelectorButton, { backgroundColor: colors.card, borderColor: colors.border, height: 50 }]} 
                onPress={() => setShowPurchaseDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
                <Text style={{ color: purchaseDate ? colors.text : colors.textSecondary, fontSize: 14 }}>
                  {purchaseDate ? purchaseDate : 'Choose purchase date'}
                </Text>
              </TouchableOpacity>
              
              {showPurchaseDatePicker && (
                <DateTimePicker
                  value={purchaseDateVal}
                  mode="date"
                  display="default"
                  maximumDate={new Date()}
                  onChange={onPurchaseDateChange}
                />
              )}
            </View>
          )}

          {/* Expiry Date */}
          <Text style={[styles.inputLabel, { color: colors.text, fontSize: 14 }]}>Expiry Date</Text>
          {Platform.OS === 'web' ? (
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              style={{
                ...styles.webDateInput,
                borderColor: colors.border,
                backgroundColor: colors.card,
                color: colors.text,
                fontSize: 15,
                height: 50,
                paddingHorizontal: 12,
                marginBottom: 20
              } as any}
            />
          ) : (
            <View style={{ marginBottom: 20 }}>
              <TouchableOpacity 
                style={[styles.dateSelectorButton, { backgroundColor: colors.card, borderColor: colors.border, height: 50 }]} 
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
                <Text style={{ color: expiryDate ? colors.text : colors.textSecondary, fontSize: 14 }}>
                  {expiryDate ? expiryDate : 'Choose date'}
                </Text>
              </TouchableOpacity>
              
              {showDatePicker && (
                <DateTimePicker
                  value={dateVal}
                  mode="date"
                  display="default"
                  minimumDate={new Date()}
                  onChange={onDateChange}
                />
              )}
            </View>
          )}

          {/* Add Button */}
          <TouchableOpacity 
            style={[styles.saveBtn, { backgroundColor: colors.primary, height: 50 }]}
            onPress={handleAddItem}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={[styles.saveBtnText, { fontSize: 16 }]}>Save to Pantry</Text>
            )}
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
    padding: 24 
  },
  sectionHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  categoryContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  categoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 12,
    height: 48,
  },
  categoryBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  categoryBtnTextActive: {
    color: '#FFFFFF',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: 180,
  },
  stepperBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityDisplay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  dateSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  saveBtn: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  webDateInput: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    marginBottom: 20,
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  batchNoteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  batchNoteText: {
    lineHeight: 16,
  },
});
