import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar } from 'react-native';
import { TourProvider, useTour } from './src/context/TourContext';
import { HeaderNav } from './src/components/HeaderNav';
import { BottomNav } from './src/components/BottomNav';
import { HomeScreen } from './src/screens/HomeScreen';
import { MembersDirectoryScreen } from './src/screens/MembersDirectoryScreen';
import { TourDetailScreen } from './src/screens/TourDetailScreen';

const MainApp: React.FC = () => {
  const { activeView } = useTour();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <HeaderNav onOpenCreateModal={() => setIsCreateModalOpen(true)} />

      <View style={styles.content}>
        {activeView === 'home' && (
          <HomeScreen
            isCreateModalOpen={isCreateModalOpen}
            onCloseCreateModal={() => setIsCreateModalOpen(false)}
          />
        )}
        {(activeView === 'members' || activeView === 'member-detail') && (
          <MembersDirectoryScreen />
        )}
        {activeView === 'tour-detail' && (
          <TourDetailScreen />
        )}
      </View>

      <BottomNav onOpenCreateModal={() => setIsCreateModalOpen(true)} />
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <TourProvider>
      <MainApp />
    </TourProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  content: {
    flex: 1
  }
});
