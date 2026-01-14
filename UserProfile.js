import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, ScrollView } from 'react-native';
import { useUsers } from './UsersContext';
import { useItems } from './ItemsContext';
import { useTheme } from './ThemeContext';
import { useLanguage } from './LanguageContext';
import ItemCard from './components/ItemCard';

const UserProfile = ({ route, navigation }) => {
    const { userId } = route.params;
    const { getUserById, loading: usersLoading } = useUsers();
    const { items, loading: itemsLoading } = useItems();
    const { theme } = useTheme();
    const { t } = useLanguage();
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        if (userId) {
            const user = getUserById(userId);
            setUserProfile(user);
        }
    }, [userId, getUserById]);

    if (usersLoading || !userProfile) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    const userPosts = items.filter(item => item.userId === userId);

    const handleDetails = (item) => {
        navigation.navigate('ItemDetails', { item });
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
                <View style={[styles.avatarContainer, { borderColor: theme.primary, backgroundColor: theme.surface }]}>
                    {userProfile.photoURL ? (
                        <Image source={{ uri: userProfile.photoURL }} style={styles.avatar} />
                    ) : (
                        <Text style={[styles.avatarPlaceholder, { color: theme.textSecondary }]}>
                            {userProfile.displayName ? userProfile.displayName[0].toUpperCase() : 'U'}
                        </Text>
                    )}
                </View>
                <Text style={[styles.name, { color: theme.text }]}>
                    {userProfile.displayName || 'Utilisateur inconnu'}
                </Text>
                <Text style={[styles.status, { color: userProfile.isOnline ? '#2ecc71' : theme.textSecondary }]}>
                    {userProfile.isOnline ? 'En ligne' : 'Hors ligne'}
                </Text>
            </View>

            <View style={styles.infoSection}>
                <View style={[styles.infoItem, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
                    <Text style={styles.infoLabel}>📍 Ville</Text>
                    <Text style={[styles.infoValue, { color: theme.text }]}>
                        {userProfile.city || 'Non renseigné'}
                    </Text>
                </View>

                <View style={[styles.infoItem, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
                    <Text style={styles.infoLabel}>🌍 Pays</Text>
                    <Text style={[styles.infoValue, { color: theme.text }]}>
                        {userProfile.country || 'Non renseigné'}
                    </Text>
                </View>

                <View style={[styles.infoItem, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
                    <Text style={styles.infoLabel}>📅 Membre depuis</Text>
                    <Text style={[styles.infoValue, { color: theme.text }]}>
                        {userProfile.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'Inconnu'}
                    </Text>
                </View>
            </View>

            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Publications ({userPosts.length})</Text>
            </View>

            <View style={styles.postsList}>
                {itemsLoading ? (
                    <ActivityIndicator color={theme.primary} />
                ) : userPosts.length > 0 ? (
                    userPosts.map(item => (
                        <ItemCard
                            key={item.id}
                            item={item}
                            onPress={() => handleDetails(item)}
                            showContact={false}
                        />
                    ))
                ) : (
                    <Text style={[styles.noPostsText, { color: theme.textSecondary }]}>
                        Aucune publication.
                    </Text>
                )}
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        paddingVertical: 30,
        borderBottomWidth: 1,
    },
    avatarContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    avatarPlaceholder: {
        fontSize: 50,
        fontWeight: 'bold',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    status: {
        fontSize: 14,
        fontWeight: '600',
    },
    infoSection: {
        marginTop: 20,
        paddingHorizontal: 20,
    },
    infoItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderRadius: 12,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'transparent',
    },
    infoLabel: {
        fontSize: 16,
        color: '#7f8c8d',
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '600',
    },
    sectionHeader: {
        paddingHorizontal: 20,
        marginTop: 20,
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    postsList: {
        paddingHorizontal: 20,
    },
    noPostsText: {
        textAlign: 'center',
        marginTop: 20,
        fontStyle: 'italic',
    }
});

export default UserProfile;
