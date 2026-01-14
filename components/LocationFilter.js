import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, TextInput } from 'react-native';
import { COUNTRIES } from '../constants/Countries';

const LocationFilter = ({ visible, onClose, onApply, initialCountry, initialCity }) => {
    const [selectedCountry, setSelectedCountry] = useState(initialCountry || '');
    const [selectedCity, setSelectedCity] = useState(initialCity || '');
    const [showCountryPicker, setShowCountryPicker] = useState(false);

    const handleApply = () => {
        onApply(selectedCountry, selectedCity);
        onClose();
    };

    const handleClear = () => {
        setSelectedCountry('');
        setSelectedCity('');
        onApply('', '');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                        <Text style={styles.cancelButtonText}>Annuler</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Filtrer par Lieu</Text>
                    <TouchableOpacity onPress={handleApply} style={styles.confirmButton}>
                        <Text style={styles.confirmButtonText}>Appliquer</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    <Text style={styles.label}>Pays</Text>
                    <TouchableOpacity
                        style={styles.inputButton}
                        onPress={() => setShowCountryPicker(true)}
                    >
                        <Text style={styles.inputText}>
                            {selectedCountry || 'Tous les pays'}
                        </Text>
                    </TouchableOpacity>

                    <Text style={styles.label}>Ville</Text>
                    <TextInput
                        style={styles.input}
                        value={selectedCity}
                        onChangeText={setSelectedCity}
                        placeholder="Toutes les villes"
                        placeholderTextColor="#95a5a6"
                    />

                    {(selectedCountry || selectedCity) ? (
                        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
                            <Text style={styles.clearButtonText}>Effacer les filtres</Text>
                        </TouchableOpacity>
                    ) : null}
                </View>

                {/* Country Picker Overlay */}
                {showCountryPicker && (
                    <View style={styles.pickerOverlay}>
                        <View style={styles.pickerContainer}>
                            <Text style={styles.pickerTitle}>Sélectionner un Pays</Text>
                            <TouchableOpacity
                                style={styles.anyCountryButton}
                                onPress={() => {
                                    setSelectedCountry('');
                                    setShowCountryPicker(false);
                                }}
                            >
                                <Text style={styles.anyCountryText}>🌍 Tous les pays</Text>
                            </TouchableOpacity>
                            <FlatList
                                data={COUNTRIES}
                                keyExtractor={(item) => item}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.pickerItem}
                                        onPress={() => {
                                            setSelectedCountry(item);
                                            setShowCountryPicker(false);
                                        }}
                                    >
                                        <Text style={styles.pickerItemText}>{item}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                            <TouchableOpacity
                                style={styles.closePickerButton}
                                onPress={() => setShowCountryPicker(false)}
                            >
                                <Text style={styles.closePickerText}>Fermer</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    cancelButtonText: {
        color: '#e74c3c',
        fontSize: 16,
    },
    confirmButtonText: {
        color: '#3498db',
        fontSize: 16,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        padding: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
        marginTop: 20,
        color: '#34495e',
    },
    inputButton: {
        backgroundColor: '#f8f9fa',
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    inputText: {
        fontSize: 16,
        color: '#2c3e50',
    },
    input: {
        backgroundColor: '#f8f9fa',
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e9ecef',
        fontSize: 16,
    },
    clearButton: {
        marginTop: 30,
        alignItems: 'center',
        padding: 15,
    },
    clearButtonText: {
        color: '#e74c3c',
        fontSize: 16,
    },
    pickerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    pickerContainer: {
        width: '85%',
        height: '70%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    pickerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    anyCountryButton: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        marginBottom: 10,
    },
    anyCountryText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3498db',
    },
    pickerItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f1f1',
    },
    pickerItemText: {
        fontSize: 16,
    },
    closePickerButton: {
        marginTop: 20,
        backgroundColor: '#e74c3c',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    closePickerText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default LocationFilter;
