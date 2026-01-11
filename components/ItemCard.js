import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../ThemeContext';

const ItemCard = ({ item, onPress, onContact, showContact }) => {
  const { title, description, photo, date, location, category, type, status } = item;
  const { theme, isDarkMode } = useTheme();

  const getStatusColor = (status) => {
    switch (status) {
      case 'actif': return '#2ecc71';
      case 'en_attente': return '#f1c40f';
      case 'resolu': return '#95a5a6';
      default: return '#95a5a6';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'actif': return 'Actif';
      case 'en_attente': return 'En Attente';
      case 'resolu': return 'Résolu';
      default: return status;
    }
  };

  const getTypeColor = (type) => type === 'lost' ? '#e74c3c' : '#3498db';

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
      onPress={onPress}
      activeOpacity={0.9}
    >

      {/* Image Section */}
      <View style={styles.imageContainer}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.placeholder, { backgroundColor: getTypeColor(type) }]}>
            <Text style={styles.placeholderIcon}>{type === 'lost' ? '🔍' : '📦'}</Text>
          </View>
        )}

        {/* Type Badge */}
        <View style={[styles.badge, { backgroundColor: getTypeColor(type) }]}>
          <Text style={styles.badgeText}>{type === 'lost' ? 'PERDU' : 'TROUVÉ'}</Text>
        </View>

        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(255, 255, 255, 0.9)' }]}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(status) }]} />
          <Text style={[styles.statusText, { color: isDarkMode ? '#fff' : '#333' }]}>{getStatusLabel(status)}</Text>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.category}>{category.toUpperCase()}</Text>
          <Text style={styles.date}>{new Date(date).toLocaleDateString()}</Text>
        </View>

        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>{title}</Text>
        <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={2}>{description}</Text>

        <View style={styles.footerRow}>
          <View style={styles.locationContainer}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={[styles.locationText, { color: theme.textSecondary }]} numberOfLines={1}>{location}</Text>
          </View>
        </View>

        {showContact && (
          <TouchableOpacity
            style={styles.contactButton}
            onPress={(e) => {
              e.stopPropagation();
              onContact();
            }}
          >
            <Text style={styles.contactButtonText}>Contacter</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
    borderWidth: 1,
  },
  imageContainer: {
    height: 200,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 50,
  },
  badge: {
    position: 'absolute',
    top: 15,
    left: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 1,
  },
  statusBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  category: {
    fontSize: 12,
    color: '#3498db',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  date: {
    fontSize: 12,
    color: '#95a5a6',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 15,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  locationIcon: {
    marginRight: 5,
    fontSize: 14,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '500',
  },
  contactButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  contactButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default ItemCard;