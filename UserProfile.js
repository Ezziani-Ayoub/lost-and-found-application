import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useUsers } from './UsersContext';
import { useAuth } from './AuthContext';
import { useItems } from './ItemsContext';
import { useTheme } from './ThemeContext';
import { useLanguage } from './LanguageContext';
import ItemCard from './components/ItemCard';

const UserProfile = ({ route, navigation }) => {
    const { userId } = route.params;
    const { user: currentUser } = useAuth(); // Rename to avoid conflict if any, though we only use it for admin check
    const { getUserById, banUser, unbanUser, loading: usersLoading, users } = useUsers(); // Get users object to check current role
    const { items, loading: itemsLoading } = useItems();
    const { theme } = useTheme();
    const { t } = useLanguage();
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        if (userId) {
            const user = getUserById(userId);
            setUserProfile(user);
        }
    }, [userId, getUserById, users]); // Add users dependency to refresh if profile updates (e.g. gets banned)

    // Check if current logged in user is admin
    const isAdmin = currentUser && users[currentUser.uid]?.role === 'admin';
    const isSelf = currentUser && currentUser.uid === userId;

    const handleBan = async (type) => {
        try {
            await banUser(userId, type);
            // Refresh local profile state is handled by users context update
        } catch (error) {
            Alert.alert('Erreur', 'Erreur lors du bannissement');
        }
    };

    const handleUnban = async () => {
        try {
            await unbanUser(userId);
        } catch (error) {
            Alert.alert('Erreur', 'Erreur lors du débannissement');
        }
    };

    const adminControls = () => {
        if (!isAdmin || isSelf) return null;

        return (
            <View style={[styles.adminSection, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={[styles.adminTitle, { color: theme.text }]}>🛠️ Administration</Text>

                {userProfile.isBanned ? (
                    <TouchableOpacity style={[styles.adminButton, { backgroundColor: '#2ecc71' }]} onPress={handleUnban}>
                        <Text style={styles.adminButtonText}>✅ Débannir l'utilisateur</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.adminButtonsRow}>
                        <TouchableOpacity
                            style={[styles.adminButton, { backgroundColor: '#e74c3c', flex: 1, marginRight: 8 }]}
                            onPress={() => handleBan('permanent')}
                        >
                            <Text style={styles.adminButtonText}>🚫 Bannir (Permanent)</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.adminButton, { backgroundColor: '#f39c12', flex: 1, marginLeft: 8 }]}
                            onPress={() => handleBan('temporary')}
                        >
                            <Text style={styles.adminButtonText}>⏳ Bannir (Temporaire)</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

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
                {userProfile.isBanned && (
                    <Text style={[styles.bannedTag, { color: '#e74c3c' }]}>🚫 COMPTE SUSPENDU</Text>
                )}
            </View>

            {/* Admin Controls */}
            {adminControls()}

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
    },
    bannedTag: {
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 5,
        borderWidth: 1,
        borderColor: '#e74c3c',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    adminSection: {
        marginHorizontal: 20,
        marginTop: 20,
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
    },
    adminTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    adminButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    adminButton: {
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    adminButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    }
});

export default UserProfile;
