import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Image } from 'react-native';
import { useUsers } from './UsersContext';
import { useTheme } from './ThemeContext';
import { useLanguage } from './LanguageContext';

const BannedUsersScreen = ({ navigation }) => {
    const { users } = useUsers();
    const { theme } = useTheme();
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');

    const bannedUsers = useMemo(() => {
        return Object.values(users).filter(user => user.isBanned);
    }, [users]);

    const filteredUsers = useMemo(() => {
        if (!searchQuery) return bannedUsers;
        const lowerQuery = searchQuery.toLowerCase();
        return bannedUsers.filter(user =>
            (user.email && user.email.toLowerCase().includes(lowerQuery)) ||
            (user.displayName && user.displayName.toLowerCase().includes(lowerQuery))
        );
    }, [bannedUsers, searchQuery]);

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.userCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => navigation.navigate('UserProfile', { userId: item.id })}
        >
            <View style={styles.userInfo}>
                <View style={[styles.avatarContainer, { backgroundColor: theme.background }]}>
                    {item.photoURL ? (
                        <Image source={{ uri: item.photoURL }} style={styles.avatar} />
                    ) : (
                        <Text style={[styles.avatarPlaceholder, { color: theme.textSecondary }]}>
                            {item.displayName ? item.displayName[0].toUpperCase() : 'U'}
                        </Text>
                    )}
                </View>
                <View>
                    <Text style={[styles.userName, { color: theme.text }]}>{item.displayName || 'Utilisateur'}</Text>
                    <Text style={[styles.userEmail, { color: theme.textSecondary }]}>{item.email}</Text>
                </View>
            </View>
            <View style={styles.banBadge}>
                <Text style={styles.banText}>🚫 {item.banType === 'temporary' ? 'Temp' : 'Perm'}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.searchContainer, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
                <TextInput
                    style={[styles.searchInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                    placeholder="Rechercher par email ou nom..."
                    placeholderTextColor={theme.textSecondary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <FlatList
                data={filteredUsers}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                            {searchQuery ? "Aucun utilisateur trouvé." : "Aucun utilisateur banni."}
                        </Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchContainer: {
        padding: 15,
        borderBottomWidth: 1,
    },
    searchInput: {
        height: 45,
        borderRadius: 8,
        borderWidth: 1,
        paddingHorizontal: 15,
        fontSize: 16,
    },
    listContent: {
        padding: 15,
    },
    userCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        marginBottom: 10,
        borderRadius: 12,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    avatarPlaceholder: {
        fontWeight: 'bold',
        fontSize: 18,
    },
    userName: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 2,
    },
    userEmail: {
        fontSize: 12,
    },
    banBadge: {
        backgroundColor: '#ffebee',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#ef9a9a',
        marginLeft: 8,
    },
    banText: {
        color: '#c62828',
        fontSize: 12,
        fontWeight: 'bold',
    },
    emptyContainer: {
        padding: 30,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        fontStyle: 'italic',
    }
});

export default BannedUsersScreen;
